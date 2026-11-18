import { shell } from "electron";
import * as store from "./store";
import { createSpotifyAuth } from "./oauthCore";
const service = createSpotifyAuth({
  read: () => {
    try {
      const s = JSON.parse(store.secret("spotifyOAuth") || "null");
      if (s && !s.clientId) s.clientId = store.get("spotifyClientId", "");
      return s;
    } catch {
      return null;
    }
  },
  write: (s) => {
    store.secret("spotifyOAuth", JSON.stringify(s));
    store.set("spotifyClientId", s.clientId);
  },
  clear: () => store.removeSecret("spotifyOAuth"),
  open: (url) => shell.openExternal(url),
  fetch: globalThis.fetch,
  configuredId: process.env.SPOTIFY_CLIENT_ID || "",
});
export const {
  connect,
  cancel,
  disconnect,
  authState,
  diagnostics,
  configuration,
} = service;
const api = service.api;
function track(t: any) {
  return {
    id: t.id,
    title: t.name,
    artist: t.artists?.map((a: any) => a.name).join(", ") || "",
    album: t.album?.name || "",
    durationMs: t.duration_ms || 0,
    imageUrl: t.album?.images?.[0]?.url || null,
  };
}
export async function playlists(offset = 0) {
  const p = await api("me/playlists?limit=50&offset=" + offset);
  return {
    items: p.items.filter(Boolean).map((p: any) => ({
      id: p.id,
      name: p.name,
      owner: p.owner?.display_name || null,
      imageUrl: p.images?.[0]?.url || null,
      total: p.tracks?.total || 0,
    })),
    total: p.total,
    raw: p.items.length,
  };
}
export async function tracks(id: string, offset = 0) {
  const p = await api(
    (id === "liked"
      ? "me/tracks"
      : "playlists/" + encodeURIComponent(id) + "/tracks") +
      "?limit=50&offset=" +
      offset,
  );
  return {
    items: p.items
      .filter((i: any) => i.track?.id)
      .map((i: any) => track(i.track)),
    total: p.total,
    raw: p.items.length,
  };
}
export async function playlistInfo(id: string) {
  const p = await api("playlists/" + encodeURIComponent(id));
  return {
    name: p.name,
    owner: p.owner?.display_name || null,
    imageUrl: p.images?.[0]?.url || null,
    total: p.tracks?.total || 0,
  };
}
export async function searchTracks(query: string) {
  const p = await api(
    "search?type=track&limit=10&q=" + encodeURIComponent(query),
  );
  return p.tracks.items.map(track);
}
export async function canvas() {
  return null;
}
