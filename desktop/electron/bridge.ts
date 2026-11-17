import * as yt from "../vendor/ytAuth";
import { ytFetch } from "../vendor/ytFetch";
import * as spotify from "../vendor/spotify";
import { lyricsFetch, grantedOrigins } from "../vendor/lyricsFetch";
import { BRIDGE_PROTOCOL } from "../shared/src/bridge/protocol";
import { text } from "./security.mjs";
import { signIn } from "./adapter";
export async function bridge(method: string, p: any) {
  if (!p || typeof p !== "object" || JSON.stringify(p).length > 2_000_000)
    throw Error("Invalid bridge payload");
  switch (method) {
    case "ping":
      return {
        version: "1.0.0",
        protocol: BRIDGE_PROTOCOL,
        browser: "chromium",
        capabilities: ["yt", "yt.auth", "yt.stats", "lyrics", "spotify"],
      };
    case "yt.fetch":
      text(p.url, 4000);
      return ytFetch(p);
    case "yt.authState":
      return yt.authState(p.refresh === true);
    case "yt.selectChannel":
      return yt.selectChannel(text(p.channelId, 200));
    case "yt.setConnected":
      return yt.setConnected(p.connected === true);
    case "lyrics.fetch":
      text(p.url, 4000);
      return lyricsFetch(p);
    case "lyrics.permissions":
      return { granted: await grantedOrigins(p.origins ?? []) };
    case "lyrics.requestPermissions":
      return {};
    case "spotify.authState":
      if (p.refresh) spotify.invalidateSession();
      return spotify.authState();
    case "spotify.setConnected":
      return spotify.setConnected(p.connected === true);
    case "spotify.signIn":
      signIn("spotify");
      return {};
    case "spotify.playlists":
      return spotify.playlists(Number(p.offset) || 0);
    case "spotify.tracks":
      return spotify.tracks(text(p.playlistId, 200), Number(p.offset) || 0);
    case "spotify.playlist":
      return spotify.playlistInfo(text(p.playlistId, 200));
    case "spotify.searchTracks":
      return spotify.searchTracks(text(p.query, 300));
    case "spotify.canvas":
      return { url: await spotify.canvas(text(p.trackId, 200)) };
    default:
      throw Error("Unsupported bridge method: " + method);
  }
}
