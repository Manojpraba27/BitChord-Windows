import { session, BrowserWindow } from "electron";
import * as store from "./store";
export function authSession() {
  return session.fromPartition("persist:bitchord-auth");
}
export async function desktopFetch(input: any, init: any = {}) {
  const url = new URL(String(input));
  const headers = new Headers(init.headers);
  if (url.hostname.endsWith("youtube.com")) {
    const origin =
      url.hostname === "s.youtube.com"
        ? "https://music.youtube.com"
        : url.origin;
    headers.set("Origin", origin);
    headers.set("Referer", origin + "/");
  }
  if (/(^|\.)spotify.com$/.test(url.hostname)) {
    headers.set("Origin", "https://open.spotify.com");
    headers.set("Referer", "https://open.spotify.com/");
  }
  if (url.hostname === "open.spotify.com" && url.pathname === "/api/token") {
    const cookie = (
      await authSession().cookies.get({
        url: "https://open.spotify.com/",
        name: "sp_dc",
      })
    )[0];
    if (cookie) headers.set("Cookie", "sp_dc=" + cookie.value);
  }
  if (url.hostname === "amp-api.music.apple.com") {
    headers.set("Origin", "https://music.apple.com");
    headers.set("Referer", "https://music.apple.com/");
  }
  return authSession().fetch(input, {
    ...init,
    headers,
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
}
export function signIn(service: string) {
  const spotify = service === "spotify";
  const w = new BrowserWindow({
    width: 520,
    height: 760,
    title: spotify ? "Spotify sign in" : "YouTube Music sign in",
    webPreferences: {
      partition: "persist:bitchord-auth",
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  w.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  w.webContents.on("will-navigate", (e, url) => {
    const u = new URL(url);
    if (
      u.protocol !== "https:" ||
      !(
        spotify ? /(^|\.)spotify\.com$/ : /(^|\.)(google\.com|youtube\.com)$/
      ).test(u.hostname)
    )
      e.preventDefault();
  });
  void w.loadURL(
    spotify
      ? "https://accounts.spotify.com/login?continue=https%3A%2F%2Fopen.spotify.com%2F"
      : "https://accounts.google.com/ServiceLogin?service=youtube&continue=https%3A%2F%2Fmusic.youtube.com",
  );
}
export const browser: any = {
  storage: {
    local: {
      get: async (key: string) => ({ [key]: store.get("vendor:" + key) }),
      set: async (values: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(values))
          store.set("vendor:" + k, v);
      },
    },
  },
  cookies: {
    get: async ({ url, name }: any) =>
      (await authSession().cookies.get({ url, name }))[0] ?? null,
    getAll: async (filter: any) => authSession().cookies.get(filter),
  },
  permissions: { contains: async () => true },
  declarativeNetRequest: { updateSessionRules: async () => {} },
  tabs: { create: async () => signIn("spotify") },
};
