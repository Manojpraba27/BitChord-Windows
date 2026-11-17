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
export function signIn(service:string){
 if(service==='spotify')throw Error('Use Accounts → Spotify OAuth with a registered client ID.');
 throw Error('Google may block sign-in in embedded browsers. BitChord cannot transfer a system-browser Google session or use official YouTube Music library OAuth. Continue signed out, or use music.youtube.com in your browser. No Google password is collected.');
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
