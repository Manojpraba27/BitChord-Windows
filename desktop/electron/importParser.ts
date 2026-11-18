import { createHash } from "node:crypto";
export type ImportTrack = {
  videoId: string;
  title: string;
  artists: { name: string; id: null }[];
  album: { name: string; id: null } | null;
  durationSec: number | null;
  thumbnail: null;
  index: null;
  plays: null;
  explicit: false;
  unavailable?: "missing";
};
export type ImportList = {
  id: string;
  title: string;
  tracks: any[];
  matched: number;
  duplicates: number;
};
export const normal = (s: string) =>
  s
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const str = (s: unknown) =>
  typeof s === "string" ? s.trim().slice(0, 500) : "";
function csv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (!field || quoted) quoted = !quoted;
      else field += c;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
    if (rows.length > 10000) throw Error("Import exceeds 10,000 rows");
  }
  if (quoted) throw Error("CSV has an unclosed quoted field");
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
function track(raw: any): ImportTrack | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw.track || raw;
  const title = str(
    t.trackName ||
      t.name ||
      t.title ||
      t.Title ||
      t["Track Name"] ||
      t["Track name"],
  );
  if (!title) return null;
  const artist = str(
    t.artistName ||
      t.artist ||
      t["Artist Name(s)"] ||
      t["Artist Name"] ||
      t["Artist Names"] ||
      t["Artist name"] ||
      (Array.isArray(t.artists)
        ? t.artists.map((a: any) => a.name || a).join(", ")
        : ""),
  );
  const album = str(
    t.albumName ||
      t["Album Name"] ||
      t["Album name"] ||
      (typeof t.album === "string" ? t.album : t.album?.name),
  );
  const id = createHash("sha256")
    .update(normal(title) + "|" + normal(artist) + "|" + normal(album))
    .digest("hex");
  return {
    videoId: "import:" + id,
    title,
    artists: [{ name: artist || "Unknown artist", id: null }],
    album: album ? { name: album, id: null } : null,
    durationSec: null,
    thumbnail: null,
    index: null,
    plays: null,
    explicit: false,
    unavailable: "missing",
  };
}
export function parseImport(
  text: string,
  filename: string,
  library: any[] = [],
): ImportList[] {
  if (Buffer.byteLength(text) > 10 * 1024 * 1024)
    throw Error("Import files must be 10 MB or smaller");
  text = text.replace(/^\uFEFF/, "");
  const groups: { title: string; raw: any[] }[] = [];
  const fallback =
    filename.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "") ||
    "Imported playlist";
  if (/\.csv$/i.test(filename)) {
    const rows = csv(text),
      headers = rows.shift();
    if (!headers) throw Error("CSV is empty");
    const byName = new Map<string, any[]>();
    for (const row of rows) {
      const obj = Object.fromEntries(
        headers.map((h, i) => [h.trim(), row[i] || ""]),
      );
      const name =
        str(obj["Playlist Name"] || obj["Playlist name"] || obj.playlist) ||
        fallback;
      const items = byName.get(name) || [];
      items.push(obj);
      byName.set(name, items);
    }
    for (const [title, raw] of byName) groups.push({ title, raw });
  } else if (/\.json$/i.test(filename)) {
    let j: any;
    try {
      j = JSON.parse(text);
    } catch {
      throw Error("JSON is invalid");
    }
    const lists = Array.isArray(j.playlists)
      ? j.playlists
      : !Array.isArray(j) && Array.isArray(j.items || j.tracks)
        ? [j]
        : null;
    if (lists)
      for (const p of lists) {
        groups.push({
          title: str(p.name || p.title) || fallback,
          raw: p.items || p.tracks || [],
        });
      }
    else if (Array.isArray(j)) groups.push({ title: fallback, raw: j });
    else
      throw Error(
        "Supported JSON: Spotify playlists export, playlist {name,items/tracks}, or a track array",
      );
  } else if (/\.m3u8?$/i.test(filename)) {
    let title = "";
    const raw: any[] = [];
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith("#EXTINF:"))
        title = line.slice(line.indexOf(",") + 1).trim();
      else if (line.trim() && !line.startsWith("#")) {
        if (/^https?:\/\//i.test(line))
          throw Error(
            "Remote M3U streams are not imported; use local media playlists",
          );
        const name =
          title ||
          line
            .trim()
            .replace(/^.*[\\/]/, "")
            .replace(/\.[^.]+$/, "");
        const parts = name.split(" - ");
        raw.push({
          title: parts.length > 1 ? parts.slice(1).join(" - ") : name,
          artist: parts.length > 1 ? parts[0] : "",
          path: line.trim(),
        });
        title = "";
      }
    }
    groups.push({ title: fallback, raw });
  } else throw Error("Choose CSV, JSON, M3U or M3U8");
  const index = new Map<string, any[]>();
  for (const l of library) {
    const key = normal(l.title);
    const a = index.get(key) || [];
    a.push(l);
    index.set(key, a);
  }
  if (groups.length > 200) throw Error("At most 200 playlists per import");
  let total = 0;
  return groups
    .map((g) => {
      if (!Array.isArray(g.raw)) throw Error("Playlist items must be an array");
      total += g.raw.length;
      if (total > 10000) throw Error("At most 10,000 tracks per import");
      const seen = new Set<string>();
      let matched = 0,
        duplicates = 0;
      const tracks: any[] = [];
      for (const raw of g.raw) {
        const t = track(raw);
        if (!t) continue;
        const key = t.videoId;
        if (seen.has(key)) {
          duplicates++;
          continue;
        }
        seen.add(key);
        const artist = t.artists[0]!.name;
        const candidates = (index.get(normal(t.title)) || []).filter(
          (l) =>
            artist === "Unknown artist" ||
            l.artists?.some((a: any) => normal(a.name) === normal(artist)),
        );
        if (candidates.length === 1) {
          tracks.push(candidates[0]);
          matched++;
        } else tracks.push(t);
      }
      const id =
        "import-list:" +
        createHash("sha256")
          .update(normal(g.title) + "|" + [...seen].join("|"))
          .digest("hex");
      return { id, title: g.title, tracks, matched, duplicates };
    })
    .filter((g) => g.tracks.length);
}
