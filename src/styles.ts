export const STYLES = `
/* Toolbar inside the panel */
.cnv-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 38px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  z-index: 9999;
}

.cnv-toolbar-btn {
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--lumiverse-transition-fast, 0.15s) ease, background var(--lumiverse-transition-fast, 0.15s) ease, transform var(--lumiverse-transition-fast, 0.15s) ease;
  background: var(--lumiverse-bg, rgba(30, 30, 30, 0.85));
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.12));
  color: var(--lumiverse-text-muted, #c0c0c0);
  border-radius: var(--lumiverse-radius-sm, 6px);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  margin-left: 6px;
}
.cnv-toolbar-btn:hover {
  background: var(--lumiverse-bg-hover, rgba(50, 50, 50, 0.95));
  color: var(--lumiverse-text, #ffffff);
  transform: translateY(-1px);
}
.cnv-toolbar-btn:active {
  transform: translateY(0);
}
.cnv-toolbar:hover .cnv-toolbar-btn {
  opacity: 1;
  pointer-events: auto;
}

/* Custom tooltip */
.cnv-tooltip {
  position: relative;
}
.cnv-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: -34px;
  right: 0;
  background: var(--lumiverse-bg-elevated, rgba(15, 15, 15, 0.95));
  color: var(--lumiverse-text, #e0e0e0);
  padding: 5px 9px;
  font-size: 11px;
  border-radius: var(--lumiverse-radius-sm, 4px);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--lumiverse-transition-fast, 0.15s) ease;
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.15));
  box-shadow: var(--lumiverse-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.4));
  z-index: 1000000;
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}
.cnv-tooltip:hover::after {
  opacity: 1;
}

.cnv-tooltip-left::after {
  right: auto;
  left: 0;
}

/* Floating widget container */
.cnv-widget {
  position: fixed;
  z-index: 99999;
  background: rgba(26, 26, 26, calc(var(--cnv-bg-opacity, 1.0) * 0.85));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, calc(var(--cnv-bg-opacity, 1.0) * 0.12));
  border-radius: var(--lumiverse-radius, 10px);
  box-shadow: var(--lumiverse-shadow-md, 0 16px 48px rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  color: var(--lumiverse-text, #c0c0c0);
}

.cnv-widget.animating {
  transition: width var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              height var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              left var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              top var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              border-radius var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              background-color var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow var(--lumiverse-transition-fast, 0.25s) cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.cnv-pill-launcher {
  position: fixed;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--lumiverse-radius-sm, 6px) !important;
  background: var(--lumiverse-primary-015, rgba(0, 122, 204, 0.25)) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: var(--lumiverse-shadow-md, 0 8px 24px rgba(0, 0, 0, 0.5));
  cursor: pointer !important;
  color: var(--lumiverse-text, #ffffff);
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.cnv-pill-launcher.transparent {
  opacity: 0.25 !important;
}

.cnv-pill-launcher.transparent:hover {
  opacity: 0.7 !important;
}

.cnv-pill-icon {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--lumiverse-text, #ffffff);
  font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  white-space: nowrap;
}
.cnv-pill-icon:hover {
  color: var(--lumiverse-text, #ffffff);
}

.cnv-widget.fullscreen {
  left: 0 !important;
  top: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  border-radius: 0 !important;
  border: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Drag/Double-click edges */
.cnv-widget-edge {
  position: absolute;
  z-index: 99999;
  background: transparent;
  cursor: move;
}

.cnv-edge-top {
  top: 0;
  left: 0;
  right: 0;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
}

.cnv-edge-left {
  left: 0;
  top: 0;
  bottom: 0;
  width: 12px;
}

.cnv-edge-right {
  right: 12px;
  top: 0;
  bottom: 0;
  width: 12px;
}

.cnv-edge-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 12px;
}

.cnv-widget-toolbar .cnv-toolbar-btn {
  opacity: 0;
  pointer-events: none;
}
.cnv-widget-toolbar:hover .cnv-toolbar-btn {
  opacity: 1;
  pointer-events: auto;
}

/* Content wrapper in widget */
.cnv-widget-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

/* Resize handles */
.cnv-resize-handle {
  position: absolute;
  z-index: 100000;
  background: transparent;
}
.cnv-widget.fullscreen .cnv-resize-handle {
  display: none !important;
}
.cnv-widget.fullscreen .cnv-widget-toolbar {
  cursor: default !important;
}

.cnv-resize-t { top: 0; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
.cnv-resize-b { bottom: 0; left: 8px; right: 8px; height: 6px; cursor: ns-resize; }
.cnv-resize-l { left: 0; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
.cnv-resize-r { right: 0; top: 8px; bottom: 8px; width: 6px; cursor: ew-resize; }
.cnv-resize-tl { top: 0; left: 0; width: 10px; height: 10px; cursor: nwse-resize; }
.cnv-resize-tr { top: 0; right: 0; width: 10px; height: 10px; cursor: nesw-resize; }
.cnv-resize-bl { bottom: 0; left: 0; width: 10px; height: 10px; cursor: nesw-resize; }
.cnv-resize-br { bottom: 0; right: 0; width: 10px; height: 10px; cursor: nwse-resize; }

/* Settings Dropdown Menu */
.cnv-settings-menu {
  position: absolute;
  top: 38px;
  right: 10px;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  width: 140px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 100001;
  display: flex;
  flex-direction: column;
  gap: 6px;
  backdrop-filter: blur(10px);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
}

.cnv-settings-title {
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 2px;
  margin-bottom: 0;
}

.cnv-settings-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cnv-settings-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.cnv-settings-slider {
  width: 100%;
  height: 3px;
  border-radius: 1.5px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin: 2px 0;
}

.cnv-settings-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.cnv-settings-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
`;
