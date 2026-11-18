import { readSpotifyPlaylistLink, spotifyPlaylistId } from "./spotifyLink";
import * as spotify from "./spotifyOAuth";
import { dialog } from "electron";
import { open, stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { parseImport } from "./importParser";
import * as store from "./store";
const previews = new Map<
  string,
  { lists: ReturnType<typeof parseImport>; expires: number }
>();
export async function previewImport(files?: string[], match = true) {
  if (!files) {
    const r = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Playlist metadata",
          extensions: ["csv", "json", "m3u", "m3u8"],
        },
      ],
    });
    if (r.canceled) return null;
    files = r.filePaths;
  }
  if (files.length !== 1) throw Error("Import one export file at a time");
  const file = files[0]!;
  if (!/\.(csv|json|m3u8?)$/i.test(file))
    throw Error("Unsupported import file");
  const s = await stat(file);
  if (!s.isFile() || s.size > 10 * 1024 * 1024)
    throw Error("Choose a regular export file smaller than 10 MB");
  const handle = await open(file, "r");
  let contents: string;
  try {
    const buffer = Buffer.alloc(10 * 1024 * 1024 + 1);
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        offset,
        buffer.length - offset,
        offset,
      );
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset > 10 * 1024 * 1024) throw Error("Import exceeds 10 MB");
    contents = buffer.subarray(0, offset).toString("utf8");
  } finally {
    await handle.close();
  }
  const lists = parseImport(
    contents,
    path.basename(file),
    match ? store.tracks() : [],
  );
  if (!lists.length)
    throw Error(
      "No supported tracks found. Check the export schema in the import guide.",
    );
  return savePreview(lists, path.basename(file));
}
function savePreview(lists: ReturnType<typeof parseImport>, file: string) {
  for (const [k, v] of previews) if (v.expires < Date.now()) previews.delete(k);
  if (previews.size >= 5) previews.delete(previews.keys().next().value!);
  const token = randomUUID();
  previews.set(token, { lists, expires: Date.now() + 300000 });
  const existing = new Set(store.playlists().map((p) => p.id));
  return {
    token,
    file,
    lists: lists.map((l) => ({ ...l, exists: existing.has(l.id) })),
  };
}
export function applyImport(token: string) {
  const p = previews.get(token);
  if (!p || p.expires < Date.now())
    throw Error("Preview expired. Choose the file again.");
  const result = store.commitImport(p.lists);
  previews.delete(token);
  return result;
}

export async function previewSpotifyLink(link: string, match = true) {
  spotifyPlaylistId(link);
  const auth = await spotify.authState();
  if (!auth.signedIn)
    throw Error(
      "Spotify link import requires an authorized Spotify account and registered app. Connect in Accounts first. If you cannot configure Spotify OAuth, use CSV/JSON import; a playlist URL alone does not grant track-list API access.",
    );
  const p = await readSpotifyPlaylistLink(link, spotify);
  const lists = parseImport(
    JSON.stringify({ name: p.name, tracks: p.tracks }),
    "Spotify playlist.json",
    match ? store.tracks() : [],
  );
  if (!lists.length)
    throw Error(
      "Spotify returned no importable tracks. This playlist may be unavailable to your account.",
    );
  return { ...savePreview(lists, p.name), source: p.url, skipped: p.skipped };
}
