import { BrowserWindow, shell, dialog } from "electron";
let player: BrowserWindow | null = null;
export function closeProviderVideo() {
  player?.destroy();
  player = null;
}
export async function openProviderVideo(
  videoId: string,
  start: number,
  onClosed: () => void,
) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId))
    throw Error("This item has no valid YouTube video ID.");
  if (!Number.isFinite(start) || start < 0 || start > 86400)
    throw Error("Invalid start position");
  closeProviderVideo();
  const w = new BrowserWindow({
    title: "BitChord · YouTube video",
    width: 1100,
    height: 760,
    backgroundColor: "#101119",
    webPreferences: {
      partition: "persist:bitchord-provider-video",
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });
  player = w;
  w.setTitle("BitChord · Loading YouTube…");
  w.setProgressBar(2);
  w.webContents.session.setPermissionRequestHandler(
    (_wc, permission, callback) =>
      callback(String(permission) === "fullscreen"),
  );
  w.webContents.on("did-finish-load", () => {
    if (!w.isDestroyed()) {
      w.setProgressBar(-1);
      w.setTitle("BitChord · YouTube official player");
    }
  });
  const url = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(start)}s`;
  w.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (new URL(url).protocol === "https:") void shell.openExternal(url);
    } catch {}
    return { action: "deny" };
  });
  w.webContents.on("will-navigate", (e, target) => {
    try {
      const u = new URL(target);
      if (
        u.protocol !== "https:" ||
        !/(^|\.)(youtube\.com|google\.com)$/.test(u.hostname)
      )
        e.preventDefault();
    } catch {
      e.preventDefault();
    }
  });
  w.on("closed", () => {
    if (player === w) player = null;
    onClosed();
  });
  w.webContents.on("did-fail-load", (_e, code, _message, _url, main) => {
    if (!main || code === -3 || w.isDestroyed()) return;
    void dialog
      .showMessageBox(w, {
        type: "error",
        message: "YouTube could not load in the video window.",
        detail:
          "Check your connection. YouTube may restrict embedded app browsers or this video. No provider restriction is bypassed.",
        buttons: ["Retry", "Open in system browser", "Close"],
        defaultId: 0,
      })
      .then((r) => {
        if (w.isDestroyed()) return;
        if (r.response === 0) void w.loadURL(url).catch(() => {});
        else if (r.response === 1) {
          void shell.openExternal(url);
          w.close();
        } else w.close();
      });
  });
  await w.loadURL(url).catch(() => {});
  return { opened: !w.isDestroyed() };
}
