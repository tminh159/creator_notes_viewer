import type { SpindleAPI } from "lumiverse-spindle-types";

declare const spindle: SpindleAPI;

const STORAGE_KEY = "widget_state.json";
const STORAGE_TMP_KEY = STORAGE_KEY + ".tmp";

async function loadState(): Promise<any> {
  try {
    const exists = await spindle.storage.exists(STORAGE_KEY);
    if (!exists) {
      return null;
    }
    const data = await spindle.storage.read(STORAGE_KEY);
    if (data && typeof data === "string") {
      return JSON.parse(data);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[CreatorNotesBackend] Failed to load state: ${msg}`);
  }
  return null;
}

async function saveState(state: any): Promise<void> {
  try {
    const json = JSON.stringify(state, null, 2);
    // Atomic write
    await spindle.storage.write(STORAGE_TMP_KEY, json);
    try {
      await spindle.storage.move(STORAGE_TMP_KEY, STORAGE_KEY);
    } catch (moveErr: unknown) {
      // Fallback to direct write if move fails
      await spindle.storage.write(STORAGE_KEY, json);
      try {
        await spindle.storage.delete(STORAGE_TMP_KEY);
      } catch (_) {}
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CreatorNotesBackend] Failed to save state: ${msg}`);
  }
}

spindle.onFrontendMessage(async (payload: any, userId: string) => {
  if (!payload || typeof payload !== "object") return;

  if (payload.type === "SAVE_STATE") {
    await saveState(payload.state);
  } else if (payload.type === "LOAD_STATE") {
    const state = await loadState();
    spindle.sendToFrontend({ type: "STATE_DATA", state }, userId);
  }
});
