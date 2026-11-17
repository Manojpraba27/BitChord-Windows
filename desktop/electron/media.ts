import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
export function parseRange(
  range: string | null,
  size: number,
): { start: number; end: number } | null {
  if (!range) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!m || (!m[1] && !m[2])) throw Error("Invalid range");
  const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  const end = m[1]
    ? m[2]
      ? Math.min(size - 1, Number(m[2]))
      : size - 1
    : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  )
    throw Error("Unsatisfiable range");
  return { start, end };
}
export async function mediaResponse(request: Request, file: string) {
  if (!["GET", "HEAD"].includes(request.method))
    return new Response(null, { status: 405 });
  const { size } = await stat(file);
  let range;
  try {
    range = parseRange(request.headers.get("range"), size);
  } catch {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    });
  }
  const mime: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".flac": "audio/flac",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".ogg": "audio/ogg",
    ".opus": "audio/ogg",
  };
  const headers: Record<string, string> = {
    "Accept-Ranges": "bytes",
    "Content-Type":
      mime[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": String(range ? range.end - range.start + 1 : size),
  };
  if (range)
    headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
  const body =
    request.method === "HEAD"
      ? null
      : Readable.toWeb(createReadStream(file, range ?? undefined));
  return new Response(body as ReadableStream | null, {
    status: range ? 206 : 200,
    headers,
  });
}
