import * as spotifyOAuth from './spotifyOAuth';
import { randomUUID } from "node:crypto";
import { authState } from "../vendor/ytAuth";
import { mediaResponse } from "./media";
import {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  net,
  dialog,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  shell,
  Notification,
  session,
  screen,
} from "electron";
import { pathToFileURL } from "node:url";
import { stat } from "node:fs/promises";
import path from "node:path";
import * as store from "./store";
import { chooseLibrary, importFiles, scan } from "./library";
import { bridge } from "./bridge";
import { signIn, authSession } from "./adapter";
import {
  startDownload,
  cancelDownload,
  chooseDownloadFolder,
} from "./downloads";
import * as integrations from "./integrations";
import { trustedFrame, text } from "./security.mjs";
import { invalidateAccounts } from "../vendor/ytAuth";
import { invalidateSession } from "../vendor/spotify";
protocol.registerSchemesAsPrivileged([
  {
    scheme: "bitchord",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      corsEnabled: true,
    },
  },
]);
let win: BrowserWindow,
  tray: Tray,
  quitting = false;
const root = path.join(__dirname, "..");
const csp =
  "default-src 'self'; script-src 'self' 'unsafe-eval' https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https: wss:; worker-src 'self' blob:; font-src 'self' data:; object-src 'none'; frame-src 'none'; base-uri 'none'";
function send(name: string, data: any) {
  if (win && !win.isDestroyed()) win.webContents.send(name, data);
}
function check(event: any) {
  if (
    event.sender !== win.webContents ||
    event.senderFrame !== win.webContents.mainFrame ||
    !trustedFrame(event.senderFrame.url)
  )
    throw Error("Untrusted IPC sender");
}
function media(command: string) {
  send("media", command);
}
function image() {
  return nativeImage.createFromPath(path.join(root, "icon.png"));
}
async function desktop(method: string, p: any) {
  if (!p || typeof p !== "object" || JSON.stringify(p).length > 200000)
    throw Error("Invalid payload");
  switch (method) {
    case "window":
      if (p.action === "minimize") win.minimize();
      else if (p.action === "maximize")
        win.isMaximized() ? win.unmaximize() : win.maximize();
      else if (p.action === "close") win.close();
      else throw Error("Invalid window action");
      return;
    case "settings":
      return {
        minimizeToTray: store.get("minimizeToTray", true),
        startup: app.getLoginItemSettings().openAtLogin,
        downloadFolder: store.get("downloadFolder", app.getPath("downloads")),
        libraryFolder: store.get("libraryFolder", ""),
        discordClientId: store.get("discordClientId", ""),
      };
    case "setting":
      if (p.key === "minimizeToTray" && typeof p.value === "boolean")
        store.set(p.key, p.value);
      else if (p.key === "startup" && typeof p.value === "boolean") {
        app.setLoginItemSettings({ openAtLogin: p.value });
      } else throw Error("Unknown setting");
      return;
    case "library":
      return store.tracks();
    case "playlists":
      return store.playlists();
    case "savePlaylist":
      if (!Array.isArray(p.tracks) || p.tracks.length > 1000)
        throw Error("A playlist supports up to 1000 songs");
      p.tracks.forEach(validateTrack);
      store.savePlaylist(
        p.id ? text(p.id, 100) : randomUUID(),
        text(p.title, 200),
        p.tracks,
      );
      return store.playlists();
    case "deletePlaylist":
      store.deletePlaylist(text(p.id, 100));
      return store.playlists();
    case "disconnect":
      if (p.service === "listenbrainz") store.removeSecret("listenbrainz");
      else if (p.service === "lastfm")
        for (const key of [
          "lastfmKey",
          "lastfmSecret",
          "lastfmSession",
          "lastfmToken",
        ])
          store.removeSecret(key);
      else throw Error("Unknown service");
      return;

    case "import":
      return chooseLibrary(p.folder === true);
    case "rescan": {
      const folder = store.get("libraryFolder");
      if (!folder) throw Error("Choose a folder first.");
      return scan(folder);
    }
    case "importDropped":
      if (!Array.isArray(p.paths) || p.paths.length > 500)
        throw Error("Too many files");
      return importFiles(p.paths.map((s: any) => text(s, 4000)));
    case "track": {
      const t = store.track(text(p.id, 100));
      if (!t) throw Error("Local track no longer exists.");
      await stat(t.path);
      return {
        track: t,
        url: "bitchord://app/media/" + encodeURIComponent(p.id),
      };
    }
    case "reveal": {
      const t = store.track(text(p.id, 100));
      if (!t) throw Error("Unknown track");
      shell.showItemInFolder(t.path);
      return;
    }
    case "history":
      return store.history();
    case "record":
      validateTrack(p.track);
      store.record(p.track);
      return;
    case "favorites":
      return store.favorites();
    case "favorite":
      validateTrack(p.track);
      store.favorite(p.track);
      return store.favorites();
    case "downloads":
      return store.downloads();
    case "downloadFolder":
      return chooseDownloadFolder();
    case "download":
      return startDownload(text(p.url, 4000), p.permitted === true, (j) => {
        send("download", j);
        win.setProgressBar(
          j.status === "downloading"
            ? j.total
              ? j.received / j.total
              : 2
            : -1,
        );
      });
    case "cancelDownload":
      cancelDownload(text(p.id, 100));
      return;
    case "spotifyConnect":
      return spotifyOAuth.connect(text(p.clientId,64));
    case "spotifyDisconnect":return spotifyOAuth.disconnect();
    case "signIn":
      if (!["youtube", "spotify"].includes(p.service))
        throw Error("Unknown service");
      if(p.service=== "spotify") return spotifyOAuth.connect(store.get("spotifyClientId", ""));
      signIn(p.service);
      return;
    case "logout":
      await authSession().clearStorageData();
      invalidateAccounts();
      invalidateSession();
      return;
    case "lastfmStart":
      return integrations.lastfmStart(text(p.key, 100), text(p.secret, 100));
    case "lastfmFinish":
      return integrations.lastfmFinish();
    case "listenbrainz":
      return integrations.listenbrainzToken(text(p.token, 200));
    case "discord":
      return integrations.connectDiscord(text(p.clientId, 30));
    case "scrobble":
      validateTrack(p.track);
      if (!Number.isFinite(p.started) || p.started > Date.now())
        throw Error("Invalid listen time");
      return integrations.scrobble(p.track, p.started);
    case "nowPlaying":
      validateTrack(p.track);
      void integrations.presence(p.track, p.playing === true).catch(() => {});
      win.setTitle(`${p.track.title} — BitChord`);
      if (
        p.notify &&
        store.get("notifications", true) &&
        Notification.isSupported()
      )
        new Notification({
          title: p.track.title,
          body: p.track.artists.map((a: any) => a.name).join(", "),
          icon: path.join(root, "icon.png"),
        }).show();
      return;
    default:
      throw Error("Unknown desktop command");
  }
}
function validateTrack(t: any) {
  if (!t || typeof t !== "object") throw Error("Invalid track");
  text(t.videoId, 200);
  text(t.title, 1000);
  if (!Array.isArray(t.artists) || t.artists.length > 30)
    throw Error("Invalid artists");
  t.artists.forEach((a: any) => text(a.name, 500));
}
async function createWindow() {
  const saved = store.get("window", {});
  const bounds = screen
    .getAllDisplays()
    .some(
      (d) =>
        saved.x >= d.workArea.x &&
        saved.y >= d.workArea.y &&
        saved.x < d.workArea.x + d.workArea.width &&
        saved.y < d.workArea.y + d.workArea.height,
    )
    ? saved
    : {};
  win = new BrowserWindow({
    width: 1280,
    height: 850,
    ...bounds,
    minWidth: 850,
    minHeight: 600,
    frame: false,
    backgroundColor: "#171719",
    icon: image(),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      backgroundThrottling: false,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    const u = new URL(url);
    if (u.protocol === "https:") {
      if (
        u.hostname === "music.youtube.com" ||
        u.hostname === "accounts.google.com"
      )
        void shell.openExternal("https://music.youtube.com/");
      else if (u.hostname.endsWith("spotify.com")) void shell.openExternal(url);
      else void shell.openExternal(url);
    }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!trustedFrame(url)) e.preventDefault();
  });
  win.on("close", (e) => {
    if (!quitting && store.get("minimizeToTray", true) && tray) {
      e.preventDefault();
      win.hide();
    } else store.set("window", win.getNormalBounds());
  });
  let timer: any;
  win.on("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => store.set("window", win.getNormalBounds()), 500);
  });
  win.on("move", () => {
    clearTimeout(timer);
    timer = setTimeout(() => store.set("window", win.getNormalBounds()), 500);
  });
  await win.loadURL("bitchord://app/home");
  win.show();
  if (process.platform === "win32")
    win.setThumbarButtons([
      { tooltip: "Previous", icon: image(), click: () => media("previous") },
      { tooltip: "Play / pause", icon: image(), click: () => media("toggle") },
      { tooltip: "Next", icon: image(), click: () => media("next") },
    ]);
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    win?.show();
    win?.focus();
  });
  app
    .whenReady()
    .then(async () => {
      app.setAppUserModelId("in.bitchord.desktop");
      store.initStore();
      for (const job of store.downloads())
        if (job.status === "downloading")
          store.download({
            ...job,
            status: "failed",
            error: "Download interrupted by application exit. Start it again.",
          });
      protocol.handle("bitchord", async (request) => {
        try {
          const u = new URL(request.url);
          if (u.host !== "app")
            return new Response("Forbidden", { status: 403 });
          if (u.pathname.startsWith("/media/")) {
            const t = store.track(decodeURIComponent(u.pathname.slice(7)));
            if (!t) return new Response("Not found", { status: 404 });
            return mediaResponse(request, t.path);
          }
          const relative = decodeURIComponent(u.pathname).replace(/^\/+/, ""),
            resolved = path.resolve(root, "dist", relative);
          if (!resolved.startsWith(path.join(root, "dist") + path.sep))
            return new Response("Forbidden", { status: 403 });
          let file = resolved;
          try {
            if (!(await stat(file)).isFile())
              file = path.join(root, "dist/index.html");
          } catch {
            file = path.join(root, "dist/index.html");
          }
          const r = await net.fetch(pathToFileURL(file).href);
          const h = new Headers(r.headers);
          h.set("Content-Security-Policy", csp);
          return new Response(r.body, { status: r.status, headers: h });
        } catch {
          return new Response("Unavailable", { status: 404 });
        }
      });
      // Port the upstream extension's scoped media/CORS rules, never disable webSecurity.
      const filter = {
        urls: ["https://*.youtube.com/*", "https://*.googlevideo.com/*"],
      };
      session.defaultSession.webRequest.onBeforeSendHeaders(filter, (d, cb) => {
        const h = d.requestHeaders,
          u = new URL(d.url);
        if (d.webContentsId === win?.webContents.id) {
          if (u.hostname.endsWith("googlevideo.com")) {
            if (u.searchParams.get("c") === "VISIONOS") {
              delete h.Origin;
              delete h.Referer;
            } else {
              h.Origin = "https://www.youtube.com";
              h.Referer = "https://www.youtube.com/";
            }
          } else if (u.pathname.startsWith("/youtubei/")) {
            h.Origin = u.origin;
            h.Referer = u.origin + "/";
            h["X-Origin"] = u.origin;
          }
        }
        cb({ requestHeaders: h });
      });
      session.defaultSession.webRequest.onHeadersReceived(filter, (d, cb) => {
        const h = d.responseHeaders || {};
        if (d.webContentsId === win?.webContents.id) {
          for (const k of Object.keys(h))
            if (k.toLowerCase().startsWith("access-control-")) delete h[k];
          h["Access-Control-Allow-Origin"] = ["bitchord://app"];
          h["Access-Control-Expose-Headers"] = ["*"];
        }
        cb({ responseHeaders: h });
      });
      session.defaultSession.setPermissionRequestHandler(
        (_wc, permission, cb) => cb(permission === "notifications"),
      );
      ipcMain.handle("desktop", (e, m, p) => {
        check(e);
        return desktop(text(m, 60), p);
      });
      ipcMain.handle("bridge", (e, m, p) => {
        check(e);
        return bridge(text(m, 60), p);
      });
      let authTimer: ReturnType<typeof setTimeout>;
      authSession().cookies.on("changed", () => {
        invalidateAccounts();
        invalidateSession();
        clearTimeout(authTimer);
        authTimer = setTimeout(() => {
          void authState(true)
            .then((data) =>
              send("bridge-event", { event: "yt.authState", data }),
            )
            .catch(() => {});
        }, 1500);
      });
      await createWindow();
      const discordId = store.get("discordClientId");
      if (discordId)
        void integrations.connectDiscord(discordId).catch(() => {});

      if (!process.argv.includes("--smoke-test")) {
        tray = new Tray(image().resize({ width: 24, height: 24 }));
        tray.setToolTip("BitChord");
        tray.setContextMenu(
          Menu.buildFromTemplate([
            { label: "Open BitChord", click: () => win.show() },
            { label: "Play / pause", click: () => media("toggle") },
            { label: "Next", click: () => media("next") },
            { type: "separator" },
            {
              label: "Quit",
              click: () => {
                quitting = true;
                app.quit();
              },
            },
          ]),
        );
        tray.on("double-click", () => win.show());
      }
      for (const [key, cmd] of [
        ["MediaPlayPause", "toggle"],
        ["MediaNextTrack", "next"],
        ["MediaPreviousTrack", "previous"],
        ["MediaStop", "pause"],
      ])
        globalShortcut.register(key, () => media(cmd));
      Menu.setApplicationMenu(null);
    })
    .catch((e) => {
      console.error(e);
      if (!process.argv.includes("--smoke-test"))
        dialog.showErrorBox("BitChord could not start", String(e));
      app.exit(1);
    });
  app.on("before-quit", () => {
    quitting = true;
  });
  app.on("will-quit", () => globalShortcut.unregisterAll());
  app.on("window-all-closed", () => app.quit());
}
