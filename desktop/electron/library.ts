import {artwork} from './artwork';
import { dialog } from "electron";
import { readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import * as store from "./store";
export const extensions = new Set([
  ".mp3",
  ".flac",
  ".wav",
  ".m4a",
  ".ogg",
  ".opus",
  ".aac",
  ".mp4",
  ".webm",
]);
export async function importFiles(files: string[]) {
  const { parseFile } = await import("music-metadata");
  const errors: string[] = [];
  for (const input of files.slice(0, 20000)) {
    try {
      const file = await realpath(input);
      if (
        !extensions.has(path.extname(file).toLowerCase()) ||
        !(await stat(file)).isFile()
      )
        continue;
      const id = "local:" + createHash("sha256").update(file).digest("hex");
      const meta = await parseFile(file, { skipCovers: false });
      store.saveTrack(id, file, {
        videoId: id,
        audioInfo: [meta.format.codec,meta.format.sampleRate?`${meta.format.sampleRate/1000} kHz`:null,meta.format.bitrate?`${Math.round(meta.format.bitrate/1000)} kbps`:null,meta.format.numberOfChannels?`${meta.format.numberOfChannels} channels`:null].filter(Boolean).join(' · '),
        title: meta.common.title || path.basename(file, path.extname(file)),
        artists: [{ name: meta.common.artist || "Unknown artist", id: null }],
        album: meta.common.album ? { name: meta.common.album, id: null } : null,
        durationSec: meta.format.duration ?? null,
        thumbnail: artwork(meta.common.picture),
        index: meta.common.track.no,
        plays: null,
        explicit: false,
      });
    } catch (e) {
      errors.push(`${path.basename(input)}: ${String(e)}`);
    }
  }
  return { tracks: store.tracks(), errors };
}
export async function scan(folder: string) {
  const files: string[] = [];
  const errors: string[] = [];
  async function walk(dir: string, depth = 0) {
    if (depth > 30 || files.length >= 20000) return;
    try {
      for (const f of await readdir(dir, { withFileTypes: true })) {
        if (f.isSymbolicLink()) continue;
        const p = path.join(dir, f.name);
        if (f.isDirectory()) await walk(p, depth + 1);
        else if (extensions.has(path.extname(p).toLowerCase())) files.push(p);
      }
    } catch (e) {
      errors.push(`${dir}: ${String(e)}`);
    }
  }
  await walk(folder);
  const result = await importFiles(files);
  return { ...result, errors: [...errors, ...result.errors] };
}
export async function chooseLibrary(folder: boolean) {
  const r = await dialog.showOpenDialog({
    properties: folder ? ["openDirectory"] : ["openFile", "multiSelections"],
    filters: [
      { name: "Music", extensions: [...extensions].map((x) => x.slice(1)) },
    ],
  });
  if (r.canceled) return { tracks: store.tracks(), errors: [] };
  if (folder) {
    store.set("libraryFolder", r.filePaths[0]);
    return scan(r.filePaths[0]);
  }
  return importFiles(r.filePaths);
}
