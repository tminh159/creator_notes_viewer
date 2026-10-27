import { SpindleFrontendContext, CharacterDTO } from "lumiverse-spindle-types";
import { STYLES } from "./styles.js";
import { renderContent } from "./markdown.js";
import { openWidget, closeWidget, updateWidgetContent, isWidgetActive, setSpindleContext, initializeLocalState, restoreWidgetState, getZoom, setZoom, registerOnZoomChanged, applyZoomToIframe, getOpacity, setOpacity, registerOnOpacityChanged, createSettingsMenu, applyOpacityToIframe } from "./widget.js";

export function setup(ctx: SpindleFrontendContext) {
  // Store context and pre-initialize local state synchronously
  setSpindleContext(ctx);
  initializeLocalState();

  const tab = ctx.ui.registerDrawerTab({
    id: "creator_notes_viewer",
    title: "Creator's Notes",
    shortName: "Notes",
    description: "Live rich HTML/CSS preview of the active character's Creator Notes.",
    keywords: ["creator notes", "html", "css", "preview", "render"],
    headerTitle: "Creator's Notes",
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  });

  const removeStyle = ctx.dom.addStyle(STYLES);

  const root = tab.root;
  root.style.cssText = "height:100%;width:100%;overflow:hidden;position:relative;";

  // Viewport container for the iframe
  const iframeContainer = document.createElement("div");
  iframeContainer.style.cssText = "width:100%;height:100%;border:none;background:transparent;";
  root.appendChild(iframeContainer);

  // Main toolbar (vertical invisible toolbar on the right side)
  const mainToolbar = document.createElement("div");
  mainToolbar.className = "cnv-toolbar";

  // Settings Button
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
  mainToolbar.appendChild(settingsBtn);

  // Dedicated button to pop out notes
  const popOutBtn = document.createElement("button");
  popOutBtn.className = "cnv-toolbar-btn cnv-tooltip";
  popOutBtn.setAttribute("data-tooltip", "Pop out Notes (⤢)");
  popOutBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  `;

  popOutBtn.addEventListener("click", () => {
    if (isWidgetActive()) {
      closeWidget(popOutBtn);
    } else {
      openWidget(popOutBtn, currentDocHtml);
    }
  });

  mainToolbar.appendChild(popOutBtn);
  root.appendChild(mainToolbar);

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
      settingsMenuEl = createSettingsMenu(root, settingsBtn);
      settingsMenuEl.style.top = "38px";
      settingsMenuEl.style.right = "10px";
      root.appendChild(settingsMenuEl);
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

  registerOnZoomChanged((zoom) => {
    if (mainIframe) {
      applyZoomToIframe(mainIframe, zoom);
    }
  });

  registerOnOpacityChanged((opacity) => {
    if (mainIframe) {
      applyOpacityToIframe(mainIframe, opacity);
    }
  });

  let mainIframe: HTMLIFrameElement | null = null;
  let currentDocHtml = "";
  let lastCreatorNotes = "";
  let lastCharName = "";

  function showError(msg: string) {
    mainIframe = null;
    lastCreatorNotes = "";
    lastCharName = "";
    iframeContainer.innerHTML = `<p style="color:#f87171;padding:12px;font-family:sans-serif;">${msg}</p>`;
  }

  function showPlaceholder(msg: string) {
    mainIframe = null;
    lastCreatorNotes = "";
    lastCharName = "";
    iframeContainer.innerHTML = `<p style="opacity:0.5;padding:12px;font-family:sans-serif;">${msg}</p>`;
  }

  // ── Main load function ───────────────────────────────────────────────────────
  async function loadCreatorNotes() {
    const activeChat = ctx.getActiveChat();
    const characterId = activeChat.characterId;

    if (!characterId) {
      showPlaceholder("Open a chat to see the character's Creator Notes here.");
      return;
    }

    try {
      const card = await ctx.characters.get(characterId) as CharacterDTO & { data?: { creator_notes?: string } };
      const creatorNotes: string = card?.creator_notes ?? card?.data?.creator_notes ?? "";
      const charName: string = card?.name ?? "";

      if (!creatorNotes) {
        showPlaceholder(`No Creator Notes for ${charName || "this character"}.`);
      } else if (creatorNotes === lastCreatorNotes && charName === lastCharName) {
        // Content hasn't changed — skip re-render (P1)
        return;
      } else {
        lastCreatorNotes = creatorNotes;
        lastCharName = charName;
        const doc = renderContent(creatorNotes, charName);
        
        if (!mainIframe || mainIframe.parentElement !== iframeContainer) {
          iframeContainer.innerHTML = "";
          mainIframe = document.createElement("iframe");
          mainIframe.setAttribute("sandbox", "allow-same-origin allow-popups allow-popups-to-escape-sandbox");
          mainIframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;display:block;";
          mainIframe.addEventListener("load", () => {
            if (mainIframe) {
              applyZoomToIframe(mainIframe, getZoom());
              applyOpacityToIframe(mainIframe, getOpacity());
            }
          });
          iframeContainer.appendChild(mainIframe);
        }
        mainIframe.srcdoc = doc;

        currentDocHtml = doc;
        updateWidgetContent(doc);
      }
    } catch (err) {
      showError(`Failed to read Creator Notes: ${err}`);
    }
  }

  // ── Event subscriptions & State Loading ──────────────────────────────────────
  loadCreatorNotes();

  const unsubActivate      = tab.onActivate(() => loadCreatorNotes());
  const unsubChatSwitched  = ctx.events.on("CHAT_SWITCHED",   () => loadCreatorNotes());
  const unsubCharEdited    = ctx.events.on("CHARACTER_EDITED", () => loadCreatorNotes());

  // Listen for backend state responses
  const unsubMsg = ctx.onBackendMessage((payload: any) => {
    if (payload && payload.type === "STATE_DATA") {
      restoreWidgetState(payload.state, popOutBtn, currentDocHtml);
    }
  });

  // Request saved state from backend
  ctx.sendToBackend({ type: "LOAD_STATE" });

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  return () => {
    try { unsubActivate();     } catch (_) {}
    try { unsubChatSwitched(); } catch (_) {}
    try { unsubCharEdited();   } catch (_) {}
    try { unsubMsg();          } catch (_) {}
    try { tab.destroy();       } catch (_) {}
    try { removeStyle();       } catch (_) {}
    try { closeWidget(popOutBtn); } catch (_) {}
    document.removeEventListener("mousedown", onOutsideClick);
    if (settingsMenuEl) {
      if (typeof (settingsMenuEl as any)._cleanup === "function") {
        (settingsMenuEl as any)._cleanup();
      }
      settingsMenuEl = null;
    }
  };
}
