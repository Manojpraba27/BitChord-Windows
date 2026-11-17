import test from "node:test";
import assert from "node:assert/strict";
import { parseRange } from "../electron/media.ts";
test("Media byte ranges support seek and suffix requests", () => {
  assert.deepEqual(parseRange("bytes=44-87", 100), { start: 44, end: 87 });
  assert.deepEqual(parseRange("bytes=90-", 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange("bytes=-10", 100), { start: 90, end: 99 });
  assert.equal(parseRange(null, 100), null);
});
test("Media rejects invalid, multipart and out-of-bounds ranges", () => {
  for (const s of [
    "bytes=200-",
    "bytes=30-20",
    "bytes=0-1,4-8",
    "bytes=-",
    "units=0-1",
  ])
    assert.throws(() => parseRange(s, 100));
});
