import { SpindleFrontendContext, CharacterDTO } from "lumiverse-spindle-types";
import { STYLES } from "./styles.js";
import { renderContent, renderStatusContent } from "./markdown.js";
import { openWidget, closeWidget, updateWidgetContent, isWidgetActive, setSpindleContext, initializeLocalState, restoreWidgetState, getZoom, setZoom, registerOnZoomChanged, unregisterOnZoomChanged, applyZoomToIframe, getOpacity, setOpacity, registerOnOpacityChanged, unregisterOnOpacityChanged, createSettingsMenu, applyOpacityToIframe } from "./widget.js";

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
  root.classList.add("cnv-drawer-root");
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

  const onMainZoomChanged = (zoom: number) => {
    if (mainIframe) {
      applyZoomToIframe(mainIframe, zoom);
    }
  };
  registerOnZoomChanged(onMainZoomChanged);

  const onMainOpacityChanged = (opacity: number) => {
    if (mainIframe) {
      applyOpacityToIframe(mainIframe, opacity);
    }
  };
  registerOnOpacityChanged(onMainOpacityChanged);

  let mainIframe: HTMLIFrameElement | null = null;
  let mainIframeLoading = false;
  let currentDocHtml = "";
  let lastCreatorNotes = "";
  let lastCharName = "";
  let lastCharacterId: string | null = null;
  let loadSeq = 0;
  let pendingCharRetryTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingCharRetries = 0;

  function clearPendingCharRetry() {
    if (pendingCharRetryTimer !== null) {
      clearTimeout(pendingCharRetryTimer);
      pendingCharRetryTimer = null;
    }
    pendingCharRetries = 0;
  }

  function showError(msg: string) {
    mainIframe = null;
    mainIframeLoading = false;
    lastCreatorNotes = "";
    lastCharName = "";
    lastCharacterId = null;
    const p = document.createElement("p");
    p.style.cssText = "color:#f87171;padding:12px;font-family:sans-serif;margin:0;";
    p.textContent = msg;
    iframeContainer.replaceChildren(p);
    currentDocHtml = renderStatusContent(msg, true);
    updateWidgetContent(currentDocHtml);
  }

  function showPlaceholder(msg: string) {
    mainIframe = null;
    mainIframeLoading = false;
    lastCreatorNotes = "";
    lastCharName = "";
    lastCharacterId = null;
    const p = document.createElement("p");
    p.style.cssText = "opacity:0.5;padding:12px;font-family:sans-serif;margin:0;";
    p.textContent = msg;
    iframeContainer.replaceChildren(p);
    currentDocHtml = renderStatusContent(msg, false);
    updateWidgetContent(currentDocHtml);
  }

  function isMainIframeAlive(): boolean {
    if (!mainIframe || mainIframe.parentElement !== iframeContainer || !mainIframe.isConnected) {
      return false;
    }
    if (mainIframeLoading) {
      return true;
    }
    try {
      const body = mainIframe.contentDocument?.body;
      return Boolean(body && body.childNodes.length > 0);
    } catch {
      return true;
    }
  }

  const charEditorApi = (ctx.ui as SpindleFrontendContext["ui"] & {
    characterEditor?: {
      getState?: () => { open?: boolean; characterId?: string | null };
      onChange?: (cb: (state: { open?: boolean; characterId?: string | null }) => void) => () => void;
    };
  }).characterEditor;

  function resolveActiveCharacterId(): { chatId: string | null; characterId: string | null } {
    const activeChat = ctx.getActiveChat();
    if (activeChat.characterId) {
      return activeChat;
    }
    try {
      const editorState = charEditorApi?.getState?.();
      if (editorState?.open && editorState.characterId) {
        return { chatId: activeChat.chatId, characterId: editorState.characterId };
      }
    } catch (_) {
      // ignore
    }
    return activeChat;
  }

  // ── Main load function ───────────────────────────────────────────────────────
  async function loadCreatorNotes() {
    const activeChat = resolveActiveCharacterId();
    const characterId = activeChat.characterId;

    if (!characterId) {
      // When navigating to a chat, ChatView sets activeChatId first (with
      // activeCharacterId = null) and populates activeCharacterId only after
      // chatsApi.get(chatId) resolves. Wait briefly before showing placeholder.
      if (activeChat.chatId && pendingCharRetries < 20) {
        if (pendingCharRetryTimer === null) {
          pendingCharRetries++;
          pendingCharRetryTimer = setTimeout(() => {
            pendingCharRetryTimer = null;
            loadCreatorNotes();
          }, 100);
        }
        return;
      }
      clearPendingCharRetry();
      showPlaceholder("Open a chat to see the character's Creator Notes here.");
      return;
    }

    clearPendingCharRetry();
    const seq = ++loadSeq;

    try {
      const card = await ctx.characters.get(characterId) as CharacterDTO & { data?: { creator_notes?: string } };
      if (seq !== loadSeq) return;

      const creatorNotes: string = card?.creator_notes ?? card?.data?.creator_notes ?? "";
      const charName: string = card?.name ?? "";

      if (!creatorNotes) {
        showPlaceholder(`No Creator Notes for ${charName || "this character"}.`);
      } else if (
        characterId === lastCharacterId &&
        creatorNotes === lastCreatorNotes &&
        charName === lastCharName &&
        isMainIframeAlive()
      ) {
        // Content and mounted iframe are still intact — skip re-render
        return;
      } else {
        lastCharacterId = characterId;
        lastCreatorNotes = creatorNotes;
        lastCharName = charName;
        const doc = renderContent(creatorNotes, charName);

        iframeContainer.replaceChildren();
        mainIframe = document.createElement("iframe");
        mainIframe.setAttribute("sandbox", "allow-same-origin allow-popups");
        mainIframe.style.cssText = "width:100%;height:100%;border:none;background:transparent;display:block;";
        const createdIframe = mainIframe;
        mainIframeLoading = root.isConnected;
        createdIframe.addEventListener("load", () => {
          if (mainIframe === createdIframe) {
            mainIframeLoading = false;
            applyZoomToIframe(createdIframe, getZoom());
            applyOpacityToIframe(createdIframe, getOpacity());
          }
        });
        createdIframe.srcdoc = doc;
        iframeContainer.appendChild(createdIframe);

        currentDocHtml = doc;
        updateWidgetContent(doc);
      }
    } catch (err) {
      if (seq !== loadSeq) return;
      showError(`Failed to read Creator Notes: ${err}`);
    }
  }

  // ── Event subscriptions & State Loading ──────────────────────────────────────
  loadCreatorNotes();

  let rafActivateId: number | null = null;
  const unsubActivate = tab.onActivate(() => {
    loadCreatorNotes();
    // TabPanelContent attaches tab.root in a React useEffect after setDrawerTab.
    // Re-check on the next animation frame once root is connected to the DOM.
    if (rafActivateId !== null) cancelAnimationFrame(rafActivateId);
    rafActivateId = requestAnimationFrame(() => {
      rafActivateId = null;
      loadCreatorNotes();
    });
  });

  // Detect when tab.root is mounted/re-mounted into the drawer DOM
  let wasRootVisible = false;
  const rootResizeObserver = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver((entries) => {
        const entry = entries[0];
        const isVisible = Boolean(
          root.isConnected &&
          entry &&
          entry.contentRect.width > 0 &&
          entry.contentRect.height > 0
        );
        if (!isVisible) {
          mainIframeLoading = false;
        } else if (!wasRootVisible) {
          loadCreatorNotes();
        }
        wasRootVisible = isVisible;
      })
    : null;
  rootResizeObserver?.observe(root);
  const unsubChatSwitched  = ctx.events.on("CHAT_SWITCHED",    () => loadCreatorNotes());
  const unsubChatChanged   = ctx.events.on("CHAT_CHANGED",     () => loadCreatorNotes());
  const unsubCharEdited    = ctx.events.on("CHARACTER_EDITED", () => {
    lastCharacterId = null;
    loadCreatorNotes();
  });

  let unsubCharEditorState: (() => void) | null = null;
  try {
    if (charEditorApi && typeof charEditorApi.onChange === "function") {
      unsubCharEditorState = charEditorApi.onChange(() => loadCreatorNotes());
    }
  } catch (_) {
    // ignore
  }

  // Subscribe to Lumiverse's frontend store selector `chat.active` so we are
  // notified when ChatView finishes loading `chat.character_id` after `CHAT_SWITCHED`.
  let unsubActiveChatState: (() => void) | null = null;
  let activeChatPollTimer: ReturnType<typeof setInterval> | null = null;
  const stateApi = (ctx as SpindleFrontendContext & {
    state?: { subscribe?: (id: string, cb: (val: unknown) => void) => () => void };
  }).state;
  try {
    if (stateApi && typeof stateApi.subscribe === "function") {
      unsubActiveChatState = stateApi.subscribe("chat.active", () => loadCreatorNotes());
    }
  } catch (_) {
    // Fallback to lightweight polling if host does not support `chat.active` selector
  }
  if (!unsubActiveChatState) {
    let prevChatId: string | null = resolveActiveCharacterId().chatId;
    let prevCharId: string | null = resolveActiveCharacterId().characterId;
    activeChatPollTimer = setInterval(() => {
      const cur = resolveActiveCharacterId();
      if (cur.chatId !== prevChatId || cur.characterId !== prevCharId) {
        prevChatId = cur.chatId;
        prevCharId = cur.characterId;
        loadCreatorNotes();
      }
    }, 250);
  }

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
    clearPendingCharRetry();
    if (rafActivateId !== null) {
      cancelAnimationFrame(rafActivateId);
      rafActivateId = null;
    }
    if (activeChatPollTimer !== null) {
      clearInterval(activeChatPollTimer);
      activeChatPollTimer = null;
    }
    try { rootResizeObserver?.disconnect(); } catch (_) {}
    try { unsubCharEditorState?.(); } catch (_) {}
    try { unsubActiveChatState?.(); } catch (_) {}
    try { unsubActivate();     } catch (_) {}
    try { unsubChatSwitched(); } catch (_) {}
    try { unsubChatChanged();  } catch (_) {}
    try { unsubCharEdited();   } catch (_) {}
    try { unsubMsg();          } catch (_) {}
    try { tab.destroy();       } catch (_) {}
    try { removeStyle();       } catch (_) {}
    try { closeWidget(popOutBtn); } catch (_) {}
    unregisterOnZoomChanged(onMainZoomChanged);
    unregisterOnOpacityChanged(onMainOpacityChanged);
    document.removeEventListener("mousedown", onOutsideClick);
    if (settingsMenuEl) {
      if (typeof (settingsMenuEl as any)._cleanup === "function") {
        (settingsMenuEl as any)._cleanup();
      }
      settingsMenuEl = null;
    }
  };
}
