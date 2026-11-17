import test from "node:test";
import assert from "node:assert/strict";
import {
  trustedFrame,
  publicAddress,
  validateDownloadUrl,
  text,
} from "../electron/security.mjs";
test("IPC permits only the packaged app origin", () => {
  assert.equal(trustedFrame("bitchord://app/local"), true);
  for (const s of [
    "https://app/local",
    "bitchord://evil/",
    "file:///etc/passwd",
    "not a URL",
  ])
    assert.equal(trustedFrame(s), false);
});
test("Download addresses exclude local, reserved and mapped addresses", () => {
  for (const s of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "224.0.0.1",
    "100.64.0.1",
    "::1",
    "::ffff:127.0.0.1",
  ])
    assert.equal(publicAddress(s), false, s);
  assert.equal(publicAddress("1.1.1.1"), true);
});
test("Unsafe and service-restricted download URLs are rejected", async () => {
  for (const s of [
    "http://example.com/a.mp3",
    "file:///a.mp3",
    "https://user:pass@example.com/a.mp3",
    "https://youtube.com/a.mp3",
    "https://rr1.googlevideo.com/a.mp3",
    "https://example.com:8080/a.mp3",
  ])
    await assert.rejects(validateDownloadUrl(s));
});
test("IPC string bounds reject objects and excessive strings", () => {
  assert.equal(text("ok", 2), "ok");
  assert.throws(() => text({}, 2));
  assert.throws(() => text("long", 2));
});
