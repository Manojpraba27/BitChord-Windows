import { request } from "node:https";
import { createWriteStream } from "node:fs";
import { rename, unlink } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { app, dialog } from "electron";
import { validateDownloadUrl } from "./security.mjs";
import { extensions, importFiles } from "./library";
import * as store from "./store";
const active = new Map<string, AbortController>();
export async function chooseDownloadFolder() {
  const r = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (!r.canceled) store.set("downloadFolder", r.filePaths[0]);
  return store.get("downloadFolder", app.getPath("downloads"));
}
export async function startDownload(
  url: string,
  permitted: boolean,
  notify: (data: any) => void,
) {
  if (active.size >= 3)
    throw Error("Three downloads are already running. Wait or cancel one.");
  if (!permitted) throw Error("Confirm that the source permits downloading.");
  const checked = await validateDownloadUrl(url);
  if(store.downloads().some(j=>j.url===url&&['complete','downloading'].includes(j.status)))throw Error('This file is already downloaded or downloading.');
  const ext = path.extname(checked.url.pathname).toLowerCase();
  if (!extensions.has(ext))
    throw Error("URL must point directly to a supported audio file.");
  const id = randomUUID(),
    folder = store.get("downloadFolder", app.getPath("downloads"));
  const file = path.join(
    folder,
    `${
      path
        .basename(checked.url.pathname, ext)
        .replace(/[^a-zA-Z0-9 _-]/g, "_")
        .slice(0, 80) || "Music"
    }-${id.slice(0, 8)}${ext}`,
  );
  const job = {
    id,
    url,
    title: path.basename(file),
    status: "downloading",
    received: 0,
    total: 0,
    path: file,
    error: "",
    sha256: "",
  };
  store.download(job);
  const abort = new AbortController();
  active.set(id, abort);
  const emit = () => {
    store.download(job);
    notify(job);
  };
  void (async () => {
    try {
      const res: any = await new Promise((resolve, reject) => {
        const req = request(
          checked.url,
          {
            signal: abort.signal,
            lookup: (_host: any, _options: any, cb: any) =>
              cb(null, checked.address, 4),
          },
          resolve,
        );
        req.on("error", reject);
        req.setTimeout(30000, () => req.destroy(Error("Download timed out")));
        req.end();
      });
      if (res.statusCode !== 200) {
        res.destroy();
        throw Error(
          `Download server returned HTTP ${res.statusCode}; redirects are not followed.`,
        );
      }
      job.total = Number(res.headers["content-length"] || 0);
      if (job.total > 2 * 1024 ** 3) {
        res.destroy();
        throw Error("File exceeds 2 GB limit");
      }
      let last = 0;
      const hash=createHash("sha256");
      res.on("data", (chunk: Buffer) => {
        hash.update(chunk);
        job.received += chunk.length;
        if (job.received > 2 * 1024 ** 3) abort.abort();
        if (Date.now() - last > 500) {
          last = Date.now();
          emit();
        }
      });
      await pipeline(res, createWriteStream(file + ".part", { flags: "wx" }), {
        signal: abort.signal,
      });
      if(job.total&&job.received!==job.total)throw Error("Downloaded size does not match Content-Length");
      job.sha256=hash.digest("hex");
      await rename(file + ".part", file);
      await importFiles([file]);
      job.status = "complete";
    } catch (e) {
      job.status = abort.signal.aborted ? "cancelled" : "failed";
      job.error = String(e);
      await unlink(file + ".part").catch(() => {});
    } finally {
      active.delete(id);
      emit();
    }
  })();
  return job;
}
export function cancelDownload(id: string) {
  active.get(id)?.abort();
}
