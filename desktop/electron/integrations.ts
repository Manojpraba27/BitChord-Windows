import { createHash } from "node:crypto";
import { shell } from "electron";
import * as store from "./store";
let rpc: any;
export async function connectDiscord(clientId: string) {
  if (!/^\d{16,22}$/.test(clientId))
    throw Error("Enter your Discord application client ID.");
  const RPC = await import("discord-rpc");
  rpc?.destroy();
  rpc = new RPC.Client({ transport: "ipc" });
  await rpc.login({ clientId });
  store.set("discordClientId", clientId);
  return true;
}
export async function presence(track: any, playing: boolean) {
  if (!rpc) return;
  if (!playing) {
    await rpc.clearActivity();
    return;
  }
  await rpc.setActivity({
    details: track.title.slice(0, 128),
    state: track.artists
      .map((a: any) => a.name)
      .join(", ")
      .slice(0, 128),
    instance: false,
  });
}
async function lastfm(method: string, params: Record<string, string> = {}) {
  const apiKey = store.secret("lastfmKey"),
    apiSecret = store.secret("lastfmSecret");
  if (!apiKey || !apiSecret)
    throw Error("Last.fm API credentials are required.");
  const data: Record<string, string> = { ...params, method, api_key: apiKey };
  const signature =
    Object.keys(data)
      .sort()
      .map((k) => k + data[k])
      .join("") + apiSecret;
  const body = new URLSearchParams({
    ...data,
    api_sig: createHash("md5").update(signature).digest("hex"),
    format: "json",
  });
  const r = await fetch("https://ws.audioscrobbler.com/2.0/", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(15000),
  });
  const j: any = await r.json();
  if (!r.ok || j.error) throw Error(j.message || `Last.fm HTTP ${r.status}`);
  return j;
}
export async function lastfmStart(key: string, secret: string) {
  store.secret("lastfmKey", key);
  store.secret("lastfmSecret", secret);
  const r = await lastfm("auth.getToken");
  store.secret("lastfmToken", r.token);
  await shell.openExternal(
    `https://www.last.fm/api/auth/?api_key=${encodeURIComponent(key)}&token=${encodeURIComponent(r.token)}`,
  );
}
export async function lastfmFinish() {
  const r = await lastfm("auth.getSession", {
    token: store.secret("lastfmToken"),
  });
  store.secret("lastfmSession", r.session.key);
  return r.session.name;
}
export async function listenbrainzToken(token: string) {
  const r = await fetch("https://api.listenbrainz.org/1/validate-token", {
    headers: { Authorization: "Token " + token },
    signal: AbortSignal.timeout(15000),
  });
  const j: any = await r.json();
  if (!r.ok || !j.valid) throw Error("ListenBrainz token was rejected");
  store.secret("listenbrainz", token);
  return j.user_name;
}
export async function scrobble(track: any, started: number) {
  const artist = track.artists.map((a: any) => a.name).join(", "),
    errors: string[] = [];
  const lb = store.secret("listenbrainz");
  if (lb)
    try {
      const r = await fetch("https://api.listenbrainz.org/1/submit-listens", {
        method: "POST",
        headers: {
          Authorization: "Token " + lb,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listen_type: "single",
          payload: [
            {
              listened_at: Math.floor(started / 1000),
              track_metadata: {
                artist_name: artist,
                track_name: track.title,
                ...(track.album ? { release_name: track.album.name } : {}),
              },
            },
          ],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw Error(`HTTP ${r.status}`);
    } catch (e) {
      errors.push("ListenBrainz: " + e);
    }
  const sk = store.secret("lastfmSession");
  if (sk)
    try {
      await lastfm("track.scrobble", {
        sk,
        artist,
        track: track.title,
        timestamp: String(Math.floor(started / 1000)),
        ...(track.album ? { album: track.album.name } : {}),
      });
    } catch (e) {
      errors.push("Last.fm: " + e);
    }
  if (errors.length) throw Error(errors.join("; "));
}
