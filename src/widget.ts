import type { SpindleFrontendContext } from "lumiverse-spindle-types";

// Geometry and threshold constants
const DEFAULT_WIDGET_WIDTH = 450;
const DEFAULT_WIDGET_HEIGHT = 650;
const PILL_WIDTH = 140;
const PILL_HEIGHT = 36;
const SNAP_THRESHOLD = 0;
const MIN_WIDGET_WIDTH = 250;
const MIN_WIDGET_HEIGHT = 200;

let widgetEl: HTMLDivElement | null = null;
let pillEl: HTMLDivElement | null = null;
let widgetIframe: HTMLIFrameElement | null = null;
let fsBtn: HTMLButtonElement | null = null;
let lockBtn: HTMLButtonElement | null = null;
let pillBtn: HTMLButtonElement | null = null;
let closeBtn: HTMLButtonElement | null = null;
let currentDocHtml = "";
let isWidgetFullscreen = false;
let isWidgetLocked = false;
let isPillEnabled = true;
let widgetAbort: AbortController | null = null;

export interface WidgetState {
  widgetOpen: boolean;
  widgetLocked: boolean;
  widgetMinimized: boolean;
  pillEnabled: boolean;
  pillGeom: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  widgetGeom: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  zoom: number;
  opacity: number;
}

export let currentWidgetState: WidgetState = {
  widgetOpen: false,
  widgetLocked: false,
  widgetMinimized: false,
  pillEnabled: true,
  pillGeom: {
    left: 20,
    top: 80,
    width: PILL_WIDTH,
    height: PILL_HEIGHT
  },
  widgetGeom: {
    left: Math.max(20, (window.innerWidth - DEFAULT_WIDGET_WIDTH) / 2),
    top: Math.max(20, (window.innerHeight - DEFAULT_WIDGET_HEIGHT) / 2),
    width: DEFAULT_WIDGET_WIDTH,
    height: DEFAULT_WIDGET_HEIGHT
  },
  zoom: 100,
  opacity: 100
};

let spindleCtx: SpindleFrontendContext | null = null;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let hasLocalModifications = false;

export function setSpindleContext(ctx: SpindleFrontendContext) {
  spindleCtx = ctx;
  hasLocalModifications = false;
}

function flushSaveStateToBackend() {
  if (saveDebounceTimer !== null) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (spindleCtx) {
    spindleCtx.sendToBackend({
      type: "SAVE_STATE",
      state: currentWidgetState
    });
  }
}

function saveState(immediate = false) {
  hasLocalModifications = true;
  try {
    localStorage.setItem("cnv_widget_state_v2", JSON.stringify(currentWidgetState));
  } catch (_) {}

  if (immediate) {
    flushSaveStateToBackend();
    return;
  }

  if (saveDebounceTimer !== null) {
    clearTimeout(saveDebounceTimer);
  }
  saveDebounceTimer = setTimeout(() => {
    saveDebounceTimer = null;
    if (spindleCtx) {
      spindleCtx.sendToBackend({
        type: "SAVE_STATE",
        state: currentWidgetState
      });
    }
  }, 200);
}

export function restoreWidgetState(state: Partial<WidgetState> | null, popOutBtn: HTMLButtonElement, initialDocHtml: string) {
  if (hasLocalModifications) {
    return;
  }
  if (state && typeof state === "object") {
    currentWidgetState = {
      ...currentWidgetState,
      ...state,
      pillGeom: state.pillGeom ? { ...currentWidgetState.pillGeom, ...state.pillGeom } : currentWidgetState.pillGeom,
      widgetGeom: state.widgetGeom ? { ...currentWidgetState.widgetGeom, ...state.widgetGeom } : currentWidgetState.widgetGeom,
      zoom: typeof state.zoom === "number" ? state.zoom : currentWidgetState.zoom,
      opacity: typeof state.opacity === "number" ? state.opacity : currentWidgetState.opacity,
    };
    isWidgetLocked = currentWidgetState.widgetLocked;
    isPillEnabled = currentWidgetState.pillEnabled !== false;

    if (!isPillEnabled) {
      currentWidgetState.widgetMinimized = false;
    }

    zoomCallbacks.forEach(cb => {
      try { cb(currentWidgetState.zoom); } catch (_) {}
    });
    opacityCallbacks.forEach(cb => {
      try { cb(currentWidgetState.opacity); } catch (_) {}
    });

    if (currentWidgetState.widgetOpen && !isWidgetActive()) {
      openWidget(popOutBtn, initialDocHtml);
    }

    if (widgetEl) {
      widgetEl.style.left = `${currentWidgetState.widgetGeom.left}px`;
      widgetEl.style.top = `${currentWidgetState.widgetGeom.top}px`;
      widgetEl.style.width = `${currentWidgetState.widgetGeom.width}px`;
      widgetEl.style.height = `${currentWidgetState.widgetGeom.height}px`;
      applyOpacityToWidget(widgetEl, currentWidgetState.opacity);

      updatePillPresence();

      if (currentWidgetState.widgetMinimized && isPillEnabled) {
        widgetEl.style.display = "none";
        if (pillEl) {
          pillEl.classList.remove("transparent");
          pillEl.style.left = `${currentWidgetState.pillGeom.left}px`;
          pillEl.style.top = `${currentWidgetState.pillGeom.top}px`;
          pillEl.style.width = `${currentWidgetState.pillGeom.width}px`;
          pillEl.style.height = `${currentWidgetState.pillGeom.height}px`;
          adjustPillContent(currentWidgetState.pillGeom.width);
        }
      } else {
        widgetEl.style.display = "";
        if (pillEl) {
          pillEl.classList.add("transparent");
          pillEl.style.left = `${currentWidgetState.pillGeom.left}px`;
          pillEl.style.top = `${currentWidgetState.pillGeom.top}px`;
          pillEl.style.width = `${currentWidgetState.pillGeom.width}px`;
          pillEl.style.height = `${currentWidgetState.pillGeom.height}px`;
          adjustPillContent(currentWidgetState.pillGeom.width);
        }
      }
      updateLockBtnIcon();
      updatePillBtnIcon();
      updateCloseBtnTooltip();
    }
  }
}

export function initializeLocalState() {
  try {
    const savedStateStr = localStorage.getItem("cnv_widget_state_v2");
    if (savedStateStr) {
      const parsed = JSON.parse(savedStateStr);
      if (parsed && typeof parsed === "object") {
        currentWidgetState = {
          ...currentWidgetState,
          ...parsed,
          pillGeom: parsed.pillGeom ? { ...currentWidgetState.pillGeom, ...parsed.pillGeom } : currentWidgetState.pillGeom,
          widgetGeom: parsed.widgetGeom ? { ...currentWidgetState.widgetGeom, ...parsed.widgetGeom } : currentWidgetState.widgetGeom,
          zoom: typeof parsed.zoom === "number" ? parsed.zoom : 100,
          opacity: typeof parsed.opacity === "number" ? parsed.opacity : 100,
        };
        isWidgetLocked = currentWidgetState.widgetLocked;
        isPillEnabled = currentWidgetState.pillEnabled !== false;
        return;
      }
    }
  } catch (_) {}

  // Fallback to legacy individual localStorage keys
  try {
    const savedLocked = localStorage.getItem("cnv_widget_locked");
    if (savedLocked !== null) {
      currentWidgetState.widgetLocked = savedLocked === "1";
      isWidgetLocked = currentWidgetState.widgetLocked;
    }
  } catch (_) {}

  try {
    const savedState = localStorage.getItem("cnv_widget_state");
    if (savedState !== null) {
      currentWidgetState.widgetMinimized = savedState === "minimized";
    }
  } catch (_) {}

  try {
    const savedPill = localStorage.getItem("cnv_pill_geom");
    if (savedPill) {
      const parsed = JSON.parse(savedPill);
      if (parsed.left && parsed.top) {
        const l = parseInt(parsed.left, 10);
        const t = parseInt(parsed.top, 10);
        if (!isNaN(l) && !isNaN(t)) {
          currentWidgetState.pillGeom.left = l;
          currentWidgetState.pillGeom.top = t;
        }
      }
      if (parsed.width && parsed.height) {
        const w = parseInt(parsed.width, 10);
        const h = parseInt(parsed.height, 10);
        if (!isNaN(w) && !isNaN(h)) {
          currentWidgetState.pillGeom.width = w;
          currentWidgetState.pillGeom.height = h;
        }
      }
    }
  } catch (_) {}

  try {
    const savedWidget = localStorage.getItem("cnv_widget_geom");
    if (savedWidget) {
      const parsed = JSON.parse(savedWidget);
      if (parsed.left && parsed.top && parsed.width && parsed.height) {
        const l = parseInt(parsed.left, 10);
        const t = parseInt(parsed.top, 10);
        const w = parseInt(parsed.width, 10);
        const h = parseInt(parsed.height, 10);
        if (!isNaN(l) && !isNaN(t) && !isNaN(w) && !isNaN(h)) {
          currentWidgetState.widgetGeom.left = l;
          currentWidgetState.widgetGeom.top = t;
          currentWidgetState.widgetGeom.width = w;
          currentWidgetState.widgetGeom.height = h;
        }
      }
    }
  } catch (_) {}
}

export function isWidgetActive(): boolean {
  return pillEl !== null || widgetEl !== null;
}

export function getZoom(): number {
  return currentWidgetState.zoom ?? 100;
}

export function applyZoomToIframe(iframe: HTMLIFrameElement, zoom: number) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && doc.body) {
      doc.body.style.zoom = `${zoom}%`;
    }
  } catch (err) {
    console.error("Failed to apply zoom to iframe:", err);
  }
}

let zoomCallbacks: ((zoom: number) => void)[] = [];
export function registerOnZoomChanged(cb: (zoom: number) => void) {
  zoomCallbacks.push(cb);
}
export function unregisterOnZoomChanged(cb: (zoom: number) => void) {
  zoomCallbacks = zoomCallbacks.filter(c => c !== cb);
}

export function setZoom(newZoom: number) {
  const clampedZoom = Math.max(50, Math.min(250, newZoom));
  currentWidgetState.zoom = clampedZoom;
  saveState();

  if (widgetIframe) {
    applyZoomToIframe(widgetIframe, clampedZoom);
  }

  zoomCallbacks.forEach(cb => {
    try { cb(clampedZoom); } catch (_) {}
  });
}

export function getOpacity(): number {
  return currentWidgetState.opacity ?? 100;
}

export function applyOpacityToIframe(iframe: HTMLIFrameElement | null, opacity: number) {
  if (!iframe) return;
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && doc.documentElement) {
      doc.documentElement.style.setProperty("--cnv-opacity", (opacity / 100).toString());
    }
  } catch (e) {
    // ignore
  }
}

export function applyOpacityToWidget(el: HTMLElement | null, opacity: number) {
  if (el) {
    el.style.setProperty('--cnv-bg-opacity', (opacity / 100).toString());
    if (widgetIframe) {
      applyOpacityToIframe(widgetIframe, opacity);
    }
  }
}

let opacityCallbacks: ((opacity: number) => void)[] = [];
export function registerOnOpacityChanged(cb: (opacity: number) => void) {
  opacityCallbacks.push(cb);
}
export function unregisterOnOpacityChanged(cb: (opacity: number) => void) {
  opacityCallbacks = opacityCallbacks.filter(c => c !== cb);
}

export function setOpacity(newOpacity: number) {
  const clampedOpacity = Math.max(20, Math.min(100, newOpacity));
  currentWidgetState.opacity = clampedOpacity;
  saveState();

  if (widgetEl) {
    applyOpacityToWidget(widgetEl, clampedOpacity);
  }

  opacityCallbacks.forEach(cb => {
    try { cb(clampedOpacity); } catch (_) {}
  });
}

export function createSettingsMenu(parent: HTMLElement, button: HTMLElement): HTMLElement {
  const menu = document.createElement("div");
  menu.className = "cnv-settings-menu";

  const title = document.createElement("div");
  title.className = "cnv-settings-title";
  title.innerText = "Settings";
  menu.appendChild(title);

  // Zoom Slider Row
  const zoomRow = document.createElement("div");
  zoomRow.className = "cnv-settings-row";

  const zoomHeader = document.createElement("div");
  zoomHeader.className = "cnv-settings-row-header";
  const zoomLabel = document.createElement("span");
  zoomLabel.innerText = "Zoom";
  const zoomValue = document.createElement("span");
  zoomValue.innerText = `${getZoom()}%`;
  zoomHeader.appendChild(zoomLabel);
  zoomHeader.appendChild(zoomValue);
  zoomRow.appendChild(zoomHeader);

  const zoomSlider = document.createElement("input");
  zoomSlider.type = "range";
  zoomSlider.className = "cnv-settings-slider";
  zoomSlider.min = "50";
  zoomSlider.max = "250";
  zoomSlider.step = "10";
  zoomSlider.value = getZoom().toString();
  zoomSlider.addEventListener("input", () => {
    const val = parseInt(zoomSlider.value, 10);
    setZoom(val);
    zoomValue.innerText = `${val}%`;
  });
  zoomRow.appendChild(zoomSlider);
  menu.appendChild(zoomRow);

  // Opacity Slider Row
  const opacityRow = document.createElement("div");
  opacityRow.className = "cnv-settings-row";

  const opacityHeader = document.createElement("div");
  opacityHeader.className = "cnv-settings-row-header";
  const opacityLabel = document.createElement("span");
  opacityLabel.innerText = "Opacity";
  const opacityValue = document.createElement("span");
  opacityValue.innerText = `${getOpacity()}%`;
  opacityHeader.appendChild(opacityLabel);
  opacityHeader.appendChild(opacityValue);
  opacityRow.appendChild(opacityHeader);

  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.className = "cnv-settings-slider";
  opacitySlider.min = "20";
  opacitySlider.max = "100";
  opacitySlider.step = "5";
  opacitySlider.value = getOpacity().toString();
  opacitySlider.addEventListener("input", () => {
    const val = parseInt(opacitySlider.value, 10);
    setOpacity(val);
    opacityValue.innerText = `${val}%`;
  });
  opacityRow.appendChild(opacitySlider);
  menu.appendChild(opacityRow);

  // Sync sliders if zoom/opacity are changed from the other panel
  const onZoom = (z: number) => {
    zoomSlider.value = z.toString();
    zoomValue.innerText = `${z}%`;
  };
  const onOpacity = (o: number) => {
    opacitySlider.value = o.toString();
    opacityValue.innerText = `${o}%`;
  };

  registerOnZoomChanged(onZoom);
  registerOnOpacityChanged(onOpacity);

  // Store cleanup function on the DOM element so owner can trigger it on destroy
  (menu as any)._cleanup = () => {
    unregisterOnZoomChanged(onZoom);
    unregisterOnOpacityChanged(onOpacity);
  };

  return menu;
}

export function updateWidgetContent(docHtml: string) {
  currentDocHtml = docHtml;
  if (widgetIframe) {
    widgetIframe.srcdoc = docHtml;
  }
}

function updateLockBtnIcon() {
  if (!lockBtn) return;
  if (isWidgetLocked) {
    lockBtn.setAttribute("data-tooltip", "Unlock position");
    lockBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    `;
    lockBtn.style.color = "var(--lumiverse-primary, #4a9eff)";
  } else {
    lockBtn.setAttribute("data-tooltip", "Lock position");
    lockBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      </svg>
    `;
    lockBtn.style.color = "";
  }
}

function updateFsBtnIcon() {
  if (!fsBtn) return;
  if (isWidgetFullscreen) {
    fsBtn.setAttribute("data-tooltip", "Exit Fullscreen (Esc)");
    fsBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 14h6v6"/>
        <path d="M20 10h-6V4"/>
        <path d="M14 10l7-7"/>
        <path d="M10 14l-7 7"/>
      </svg>
    `;
  } else {
    fsBtn.setAttribute("data-tooltip", "Fullscreen");
    fsBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      </svg>
    `;
  }
}

function toggleWidgetFullscreen() {
  if (!widgetEl) return;
  isWidgetFullscreen = !isWidgetFullscreen;
  updateFsBtnIcon();
  if (isWidgetFullscreen) {
    widgetEl.classList.add("fullscreen");
  } else {
    widgetEl.classList.remove("fullscreen");
    // Restore non-fullscreen position and dimensions
    const { left: savedL, top: savedT, width: savedW, height: savedH } = currentWidgetState.widgetGeom;
    widgetEl.style.left = `${savedL}px`;
    widgetEl.style.top = `${savedT}px`;
    widgetEl.style.width = `${savedW}px`;
    widgetEl.style.height = `${savedH}px`;
  }
}

function saveWidgetGeom() {
  if (!widgetEl || isWidgetFullscreen) return;
  const parsedLeft = parseInt(widgetEl.style.left, 10);
  const parsedTop = parseInt(widgetEl.style.top, 10);
  const parsedWidth = parseInt(widgetEl.style.width, 10);
  const parsedHeight = parseInt(widgetEl.style.height, 10);
  currentWidgetState.widgetGeom = {
    left: !isNaN(parsedLeft) ? parsedLeft : currentWidgetState.widgetGeom.left,
    top: !isNaN(parsedTop) ? parsedTop : currentWidgetState.widgetGeom.top,
    width: !isNaN(parsedWidth) ? parsedWidth : currentWidgetState.widgetGeom.width,
    height: !isNaN(parsedHeight) ? parsedHeight : currentWidgetState.widgetGeom.height
  };
  saveState();
}

function adjustPillContent(width: number) {
  if (!pillEl) return;
  const textEl = pillEl.querySelector(".cnv-pill-text") as HTMLElement;
  if (!textEl) return;
  if (width >= 130) {
    textEl.textContent = "Creator's Notes";
    textEl.style.display = "";
  } else if (width >= 80) {
    textEl.textContent = "Notes";
    textEl.style.display = "";
  } else {
    textEl.textContent = "";
    textEl.style.display = "none";
  }
}

function handleGlobalKeyDown(e: KeyboardEvent) {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key !== "Escape") return;
  if (!widgetEl || widgetEl.style.display === "none") return;

  const activeEl = document.activeElement as HTMLElement | null;
  if (
    activeEl &&
    (activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.tagName === "SELECT" ||
      activeEl.isContentEditable ||
      activeEl.closest("[role='dialog'], dialog"))
  ) {
    return;
  }

  if (isWidgetFullscreen) {
    toggleWidgetFullscreen();
  } else {
    const popOutBtn = document.querySelector(".cnv-toolbar-btn[data-tooltip*='Pop out'], .cnv-toolbar-btn[data-tooltip*='Close Pop-out']") as HTMLButtonElement;
    if (isPillEnabled) {
      toggleWidgetState();
    } else {
      closeWidget(popOutBtn);
    }
  }
}

function updatePillBtnIcon() {
  if (!pillBtn) return;
  if (isPillEnabled) {
    pillBtn.setAttribute("data-tooltip", "Pill Mode: ON (Minimize to Pill)");
    pillBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" />
        <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" />
      </svg>
    `;
    pillBtn.style.color = "var(--lumiverse-primary, #4a9eff)";
  } else {
    pillBtn.setAttribute("data-tooltip", "Pill Mode: OFF (Close on Minimize)");
    pillBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)" style="opacity: 0.5;"/>
        <line x1="8.5" y1="15.5" x2="15.5" y2="8.5" style="opacity: 0.5;"/>
        <line x1="4" y1="4" x2="20" y2="20" stroke="var(--lumiverse-error, #ff4a4a)" stroke-width="2" />
      </svg>
    `;
    pillBtn.style.color = "";
  }
}

function updateCloseBtnTooltip() {
  if (!closeBtn) return;
  if (isPillEnabled) {
    closeBtn.setAttribute("data-tooltip", "Minimize to Pill (Esc)");
  } else {
    closeBtn.setAttribute("data-tooltip", "Close Widget (Esc)");
  }
}

function updatePillPresence() {
  if (isPillEnabled) {
    if (!pillEl && widgetEl) {
      createPillElement();
      if (!currentWidgetState.widgetMinimized) {
        pillEl!.classList.add("transparent");
      } else {
        pillEl!.classList.remove("transparent");
      }
    }
  } else {
    if (pillEl) {
      pillEl.remove();
      pillEl = null;
    }
  }
}

function createPillElement() {
  if (pillEl) return;

  pillEl = document.createElement("div");
  pillEl.className = "cnv-pill-launcher";

  let pLeft = currentWidgetState.pillGeom.left;
  let pTop = currentWidgetState.pillGeom.top;
  let pWidth = currentWidgetState.pillGeom.width;
  let pHeight = currentWidgetState.pillGeom.height;

  if (pLeft < -20 || pLeft > window.innerWidth - 20 || pTop < -20 || pTop > window.innerHeight - 20) {
    pLeft = 20;
    pTop = 80;
  }

  pillEl.style.left = `${pLeft}px`;
  pillEl.style.top = `${pTop}px`;
  pillEl.style.width = `${pWidth}px`;
  pillEl.style.height = `${pHeight}px`;

  const pillIcon = document.createElement("div");
  pillIcon.className = "cnv-pill-icon";
  pillIcon.innerHTML = `
    <span class="cnv-pill-text">Creator's Notes</span>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  `;
  pillEl.appendChild(pillIcon);
  adjustPillContent(pWidth);

  let isPillDragging = false;
  let pillDragStartX = 0, pillDragStartY = 0;
  let pillDragStartLeft = 0, pillDragStartTop = 0;
  let isPillClickCandidate = false;

  pillEl.addEventListener("mousedown", (e) => {
    isPillDragging = true;
    isPillClickCandidate = true;
    pillDragStartX = e.clientX;
    pillDragStartY = e.clientY;

    const rect = pillEl!.getBoundingClientRect();
    pillDragStartLeft = rect.left;
    pillDragStartTop = rect.top;

    e.preventDefault();
  });

  const signal = widgetAbort?.signal;

  const onPillMouseMove = (e: MouseEvent) => {
    if (!isPillDragging || !pillEl) return;
    const dx = e.clientX - pillDragStartX;
    const dy = e.clientY - pillDragStartY;

    if (isPillClickCandidate && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isPillClickCandidate = false;
    }

    pillEl.style.left = `${pillDragStartLeft + dx}px`;
    pillEl.style.top = `${pillDragStartTop + dy}px`;
  };

  const onPillMouseUp = () => {
    if (!isPillDragging) return;
    isPillDragging = false;

    let finalLeft = parseInt(pillEl!.style.left, 10);
    let finalTop = parseInt(pillEl!.style.top, 10);
    const currentW = parseInt(pillEl!.style.width, 10) || PILL_WIDTH;
    const currentH = parseInt(pillEl!.style.height, 10) || PILL_HEIGHT;

    if (finalLeft < SNAP_THRESHOLD) finalLeft = 0;
    else if (finalLeft + currentW > window.innerWidth - SNAP_THRESHOLD) finalLeft = window.innerWidth - currentW;
    if (finalTop < SNAP_THRESHOLD) finalTop = 0;
    else if (finalTop + currentH > window.innerHeight - SNAP_THRESHOLD) finalTop = window.innerHeight - currentH;

    finalLeft = Math.max(0, Math.min(window.innerWidth - currentW, finalLeft));
    finalTop = Math.max(0, Math.min(window.innerHeight - currentH, finalTop));

    pillEl!.style.left = `${finalLeft}px`;
    pillEl!.style.top = `${finalTop}px`;

    if (isPillClickCandidate) {
      toggleWidgetState();
    } else {
      currentWidgetState.pillGeom = {
        left: finalLeft,
        top: finalTop,
        width: currentW,
        height: currentH
      };
      saveState();
    }
  };

  if (signal) {
    window.addEventListener("mousemove", onPillMouseMove, { signal });
    window.addEventListener("mouseup", onPillMouseUp, { signal });
  }

  const MIN_PILL_WIDTH = 36;
  const MIN_PILL_HEIGHT = 24;
  const handleTypes = ["t", "b", "l", "r", "tl", "tr", "bl", "br"];
  handleTypes.forEach((type) => {
    const handle = document.createElement("div");
    handle.className = `cnv-resize-handle cnv-resize-${type}`;

    let isResizing = false;
    let rStartX = 0, rStartY = 0;
    let rStartWidth = 0, rStartHeight = 0;
    let rStartLeft = 0, rStartTop = 0;

    handle.addEventListener("mousedown", (e) => {
      isResizing = true;
      rStartX = e.clientX;
      rStartY = e.clientY;

      const rect = pillEl!.getBoundingClientRect();
      rStartWidth = rect.width;
      rStartHeight = rect.height;
      rStartLeft = rect.left;
      rStartTop = rect.top;

      e.preventDefault();
      e.stopPropagation();
    });

    const onResizeMove = (e: MouseEvent) => {
      if (!isResizing || !pillEl) return;
      const dx = e.clientX - rStartX;
      const dy = e.clientY - rStartY;

      let newWidth = rStartWidth;
      let newHeight = rStartHeight;
      let newLeft = rStartLeft;
      let newTop = rStartTop;

      if (type.includes("r")) {
        newWidth = Math.max(MIN_PILL_WIDTH, rStartWidth + dx);
      }
      if (type.includes("l")) {
        newWidth = rStartWidth - dx;
        if (newWidth < MIN_PILL_WIDTH) {
          newWidth = MIN_PILL_WIDTH;
          newLeft = rStartLeft + (rStartWidth - MIN_PILL_WIDTH);
        } else {
          newLeft = rStartLeft + dx;
        }
      }
      if (type.includes("b")) {
        newHeight = Math.max(MIN_PILL_HEIGHT, rStartHeight + dy);
      }
      if (type.includes("t")) {
        newHeight = rStartHeight - dy;
        if (newHeight < MIN_PILL_HEIGHT) {
          newHeight = MIN_PILL_HEIGHT;
          newTop = rStartTop + (rStartHeight - MIN_PILL_HEIGHT);
        } else {
          newTop = rStartTop + dy;
        }
      }

      pillEl.style.width = `${newWidth}px`;
      pillEl.style.height = `${newHeight}px`;
      pillEl.style.left = `${newLeft}px`;
      pillEl.style.top = `${newTop}px`;

      adjustPillContent(newWidth);
    };

    const onResizeUp = () => {
      if (isResizing) {
        isResizing = false;
        const parsedLeft = parseInt(pillEl!.style.left, 10);
        const parsedTop = parseInt(pillEl!.style.top, 10);
        const parsedWidth = parseInt(pillEl!.style.width, 10);
        const parsedHeight = parseInt(pillEl!.style.height, 10);
        currentWidgetState.pillGeom = {
          left: !isNaN(parsedLeft) ? parsedLeft : currentWidgetState.pillGeom.left,
          top: !isNaN(parsedTop) ? parsedTop : currentWidgetState.pillGeom.top,
          width: !isNaN(parsedWidth) ? parsedWidth : currentWidgetState.pillGeom.width,
          height: !isNaN(parsedHeight) ? parsedHeight : currentWidgetState.pillGeom.height
        };
        saveState();
      }
    };

    if (signal) {
      window.addEventListener("mousemove", onResizeMove, { signal });
      window.addEventListener("mouseup", onResizeUp, { signal });
    }

    pillEl!.appendChild(handle);
  });

  document.body.appendChild(pillEl);
}

function toggleWidgetState() {
  if (!widgetEl || !pillEl) return;
  const isCurrentlyExpanded = widgetEl.style.display !== "none";
  if (isCurrentlyExpanded) {
    widgetEl.style.display = "none";
    pillEl.classList.remove("transparent");
    currentWidgetState.widgetMinimized = true;
  } else {
    widgetEl.style.display = "";
    pillEl.classList.add("transparent");
    currentWidgetState.widgetMinimized = false;
  }
  saveState();
}

export function closeWidget(popOutBtn?: HTMLButtonElement | null) {
  if (pillEl) {
    pillEl.remove();
    pillEl = null;
  }
  if (widgetEl) {
    widgetEl.remove();
    widgetEl = null;
    widgetIframe = null;
    fsBtn = null;
    lockBtn = null;
    pillBtn = null;
    closeBtn = null;
  }
  isWidgetFullscreen = false;
  if (popOutBtn) {
    popOutBtn.setAttribute("data-tooltip", "Pop out Notes (⤢)");
  }
  widgetAbort?.abort();
  widgetAbort = null;

  if (currentWidgetState.widgetOpen) {
    currentWidgetState.widgetOpen = false;
    saveState(true);
  } else {
    flushSaveStateToBackend();
  }
}

export function openWidget(popOutBtn: HTMLButtonElement, initialDocHtml: string) {
  if (pillEl || widgetEl) return;

  isWidgetFullscreen = false;
  popOutBtn.setAttribute("data-tooltip", "Close Pop-out Widget");
  currentDocHtml = initialDocHtml;

  widgetAbort = new AbortController();
  const { signal: widgetSignal } = widgetAbort;

  currentWidgetState.widgetOpen = true;
  saveState();

  if (isPillEnabled) {
    createPillElement();
  }

  widgetEl = document.createElement("div");
  widgetEl.className = "cnv-widget";

  let wLeft = currentWidgetState.widgetGeom.left;
  let wTop = currentWidgetState.widgetGeom.top;
  let wWidth = currentWidgetState.widgetGeom.width;
  let wHeight = currentWidgetState.widgetGeom.height;

  if (wLeft + wWidth < 50 || wLeft > window.innerWidth - 50 || wTop + wHeight < 50 || wTop > window.innerHeight - 50) {
    wWidth = DEFAULT_WIDGET_WIDTH;
    wHeight = DEFAULT_WIDGET_HEIGHT;
    wLeft = Math.max(20, (window.innerWidth - wWidth) / 2);
    wTop = Math.max(20, (window.innerHeight - wHeight) / 2);
  }

  widgetEl.style.left = `${wLeft}px`;
  widgetEl.style.top = `${wTop}px`;
  widgetEl.style.width = `${wWidth}px`;
  widgetEl.style.height = `${wHeight}px`;
  applyOpacityToWidget(widgetEl, getOpacity());

  const toolbar = document.createElement("div");
  toolbar.className = "cnv-widget-toolbar cnv-widget-edge cnv-edge-top";

  const leftEdge = document.createElement("div");
  leftEdge.className = "cnv-widget-edge cnv-edge-left";
  widgetEl.appendChild(leftEdge);

  const rightEdge = document.createElement("div");
  rightEdge.className = "cnv-widget-edge cnv-edge-right";
  widgetEl.appendChild(rightEdge);

  const bottomEdge = document.createElement("div");
  bottomEdge.className = "cnv-widget-edge cnv-edge-bottom";
  widgetEl.appendChild(bottomEdge);

  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0, dragStartY = 0;
  let dragStartLeft = 0, dragStartTop = 0;

  widgetEl.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".cnv-widget-edge") || target.closest(".cnv-toolbar-btn")) return;
    if (isWidgetFullscreen) return;

    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const rect = widgetEl!.getBoundingClientRect();
    dragStartLeft = rect.left;
    dragStartTop = rect.top;

    if (widgetIframe) {
      widgetIframe.style.pointerEvents = "none";
    }

    e.preventDefault();
  });

  widgetEl.addEventListener("dblclick", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".cnv-widget-edge") || target.closest(".cnv-toolbar-btn")) return;
    if (isWidgetFullscreen) return;
    if (isPillEnabled) {
      toggleWidgetState();
    }
  });

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !widgetEl) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    if (!hasDragged && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      hasDragged = true;
    }

    if (isWidgetLocked) return;

    widgetEl.style.left = `${dragStartLeft + dx}px`;
    widgetEl.style.top = `${dragStartTop + dy}px`;
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      if (widgetIframe) {
        widgetIframe.style.pointerEvents = "auto";
      }

      if (!hasDragged || isWidgetLocked) return;

      let finalLeft = parseInt(widgetEl!.style.left, 10);
      let finalTop = parseInt(widgetEl!.style.top, 10);
      const currentW = parseInt(widgetEl!.style.width, 10) || DEFAULT_WIDGET_WIDTH;
      const currentH = parseInt(widgetEl!.style.height, 10) || DEFAULT_WIDGET_HEIGHT;

      if (finalLeft < SNAP_THRESHOLD) finalLeft = 0;
      else if (finalLeft + currentW > window.innerWidth - SNAP_THRESHOLD) finalLeft = window.innerWidth - currentW;
      if (finalTop < SNAP_THRESHOLD) finalTop = 0;
      else if (finalTop + currentH > window.innerHeight - SNAP_THRESHOLD) finalTop = window.innerHeight - currentH;

      finalLeft = Math.max(0, Math.min(window.innerWidth - currentW, finalLeft));
      finalTop = Math.max(0, Math.min(window.innerHeight - currentH, finalTop));

      widgetEl!.style.left = `${finalLeft}px`;
      widgetEl!.style.top = `${finalTop}px`;

      saveWidgetGeom();
    }
  };

  window.addEventListener("mousemove", onMouseMove, { signal: widgetSignal });
  window.addEventListener("mouseup", onMouseUp, { signal: widgetSignal });

  // Settings Button for Widget
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "cnv-toolbar-btn cnv-tooltip cnv-tooltip-left";
  settingsBtn.setAttribute("data-tooltip", "Settings");
  settingsBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  `;
  settingsBtn.style.marginLeft = "0";
  settingsBtn.style.marginRight = "auto";
  toolbar.appendChild(settingsBtn);

  let settingsMenuEl: HTMLElement | null = null;
  const toggleSettingsMenu = (e: MouseEvent) => {
    e.stopPropagation();
    if (settingsMenuEl) {
      if (typeof (settingsMenuEl as any)._cleanup === "function") {
        (settingsMenuEl as any)._cleanup();
      }
      settingsMenuEl.remove();
      settingsMenuEl = null;
    } else {
      settingsMenuEl = createSettingsMenu(widgetEl!, settingsBtn);
      widgetEl!.appendChild(settingsMenuEl);
    }
  };
  settingsBtn.addEventListener("click", toggleSettingsMenu);

  // Close settings menu if clicked outside
  const onOutsideClick = (e: MouseEvent) => {
    if (settingsMenuEl && !settingsMenuEl.contains(e.target as Node) && !settingsBtn.contains(e.target as Node)) {
      if (typeof (settingsMenuEl as any)._cleanup === "function") {
        (settingsMenuEl as any)._cleanup();
      }
      settingsMenuEl.remove();
      settingsMenuEl = null;
    }
  };
  document.addEventListener("mousedown", onOutsideClick);
  // Clean up global listener on abort signal
  widgetSignal.addEventListener("abort", () => {
    document.removeEventListener("mousedown", onOutsideClick);
    if (settingsMenuEl) {
      if (typeof (settingsMenuEl as any)._cleanup === "function") {
        (settingsMenuEl as any)._cleanup();
      }
      settingsMenuEl = null;
    }
  });

  // Lock Button
  lockBtn = document.createElement("button");
  lockBtn.className = "cnv-toolbar-btn cnv-tooltip";
  isWidgetLocked = currentWidgetState.widgetLocked;
  updateLockBtnIcon();
  lockBtn.addEventListener("click", () => {
    isWidgetLocked = !isWidgetLocked;
    currentWidgetState.widgetLocked = isWidgetLocked;
    saveState();
    updateLockBtnIcon();
  });
  toolbar.appendChild(lockBtn);

  // Pill Toggle Button next to Lock button
  pillBtn = document.createElement("button");
  pillBtn.className = "cnv-toolbar-btn cnv-tooltip";
  updatePillBtnIcon();
  pillBtn.addEventListener("click", () => {
    isPillEnabled = !isPillEnabled;
    currentWidgetState.pillEnabled = isPillEnabled;
    saveState();
    updatePillBtnIcon();
    updatePillPresence();
    updateCloseBtnTooltip();
  });
  toolbar.appendChild(pillBtn);

  // Dedicated Fullscreen Button (⛶)
  fsBtn = document.createElement("button");
  fsBtn.className = "cnv-toolbar-btn cnv-tooltip";
  updateFsBtnIcon();
  fsBtn.addEventListener("click", () => {
    toggleWidgetFullscreen();
  });
  toolbar.appendChild(fsBtn);

  // Close Button (✕)
  closeBtn = document.createElement("button");
  closeBtn.className = "cnv-toolbar-btn cnv-tooltip";
  updateCloseBtnTooltip();
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;
  closeBtn.addEventListener("click", () => {
    if (isPillEnabled) {
      toggleWidgetState();
    } else {
      closeWidget(popOutBtn);
    }
  });
  toolbar.appendChild(closeBtn);
  widgetEl.appendChild(toolbar);

  const content = document.createElement("div");
  content.className = "cnv-widget-content";

  widgetIframe = document.createElement("iframe");
  widgetIframe.setAttribute("sandbox", "allow-same-origin allow-popups");
  widgetIframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;display:block;";
  widgetIframe.addEventListener("load", () => {
    if (widgetIframe) {
      applyZoomToIframe(widgetIframe, getZoom());
      applyOpacityToIframe(widgetIframe, getOpacity());
    }
  });

  if (currentDocHtml) {
    widgetIframe.srcdoc = currentDocHtml;
  }

  content.appendChild(widgetIframe);
  widgetEl.appendChild(content);

  const widgetHandleTypes = ["t", "b", "l", "r", "tl", "tr", "bl", "br"];
  widgetHandleTypes.forEach((type) => {
    const handle = document.createElement("div");
    handle.className = `cnv-resize-handle cnv-resize-${type}`;

    let isResizing = false;
    let rStartX = 0, rStartY = 0;
    let rStartWidth = 0, rStartHeight = 0;
    let rStartLeft = 0, rStartTop = 0;

    handle.addEventListener("mousedown", (e) => {
      if (isWidgetFullscreen || isWidgetLocked) return;
      isResizing = true;
      rStartX = e.clientX;
      rStartY = e.clientY;

      const rect = widgetEl!.getBoundingClientRect();
      rStartWidth = rect.width;
      rStartHeight = rect.height;
      rStartLeft = rect.left;
      rStartTop = rect.top;

      if (widgetIframe) {
        widgetIframe.style.pointerEvents = "none";
      }

      e.preventDefault();
      e.stopPropagation();
    });

    const onResizeMove = (e: MouseEvent) => {
      if (!isResizing || !widgetEl) return;
      const dx = e.clientX - rStartX;
      const dy = e.clientY - rStartY;

      let newWidth = rStartWidth;
      let newHeight = rStartHeight;
      let newLeft = rStartLeft;
      let newTop = rStartTop;

      if (type.includes("r")) {
        newWidth = Math.max(MIN_WIDGET_WIDTH, rStartWidth + dx);
      }
      if (type.includes("l")) {
        newWidth = rStartWidth - dx;
        if (newWidth < MIN_WIDGET_WIDTH) {
          newWidth = MIN_WIDGET_WIDTH;
          newLeft = rStartLeft + (rStartWidth - MIN_WIDGET_WIDTH);
        } else {
          newLeft = rStartLeft + dx;
        }
      }
      if (type.includes("b")) {
        newHeight = Math.max(MIN_WIDGET_HEIGHT, rStartHeight + dy);
      }
      if (type.includes("t")) {
        newHeight = rStartHeight - dy;
        if (newHeight < MIN_WIDGET_HEIGHT) {
          newHeight = MIN_WIDGET_HEIGHT;
          newTop = rStartTop + (rStartHeight - MIN_WIDGET_HEIGHT);
        } else {
          newTop = rStartTop + dy;
        }
      }

      widgetEl.style.width = `${newWidth}px`;
      widgetEl.style.height = `${newHeight}px`;
      widgetEl.style.left = `${newLeft}px`;
      widgetEl.style.top = `${newTop}px`;
    };

    const onResizeUp = () => {
      if (isResizing) {
        isResizing = false;
        if (widgetIframe) {
          widgetIframe.style.pointerEvents = "auto";
        }
        saveWidgetGeom();
      }
    };

    window.addEventListener("mousemove", onResizeMove, { signal: widgetSignal });
    window.addEventListener("mouseup", onResizeUp, { signal: widgetSignal });

    widgetEl!.appendChild(handle);
  });

  const launcher = pillEl as HTMLDivElement | null;
  if (!currentWidgetState.widgetMinimized || !isPillEnabled) {
    widgetEl.style.display = "";
    if (launcher) launcher.classList.add("transparent");
  } else {
    widgetEl.style.display = "none";
    if (launcher) launcher.classList.remove("transparent");
  }

  document.body.appendChild(widgetEl);

  const onWindowResize = () => {
    if (widgetEl && !isWidgetFullscreen) {
      const currentW = Math.min(window.innerWidth, parseInt(widgetEl.style.width, 10) || DEFAULT_WIDGET_WIDTH);
      const currentH = Math.min(window.innerHeight, parseInt(widgetEl.style.height, 10) || DEFAULT_WIDGET_HEIGHT);
      const curLeft = parseInt(widgetEl.style.left, 10) || 0;
      const curTop = parseInt(widgetEl.style.top, 10) || 0;
      const clampedLeft = Math.max(0, Math.min(window.innerWidth - currentW, curLeft));
      const clampedTop = Math.max(0, Math.min(window.innerHeight - currentH, curTop));
      widgetEl.style.left = `${clampedLeft}px`;
      widgetEl.style.top = `${clampedTop}px`;
    }
    if (pillEl) {
      const pW = parseInt(pillEl.style.width, 10) || PILL_WIDTH;
      const pH = parseInt(pillEl.style.height, 10) || PILL_HEIGHT;
      const pLeft = parseInt(pillEl.style.left, 10) || 0;
      const pTop = parseInt(pillEl.style.top, 10) || 0;
      pillEl.style.left = `${Math.max(0, Math.min(window.innerWidth - pW, pLeft))}px`;
      pillEl.style.top = `${Math.max(0, Math.min(window.innerHeight - pH, pTop))}px`;
    }
  };
  window.addEventListener("resize", onWindowResize, { signal: widgetSignal });
  window.addEventListener("keydown", handleGlobalKeyDown, { signal: widgetSignal });
}
