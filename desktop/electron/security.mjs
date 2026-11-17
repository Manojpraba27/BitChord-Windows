import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
export function trustedFrame(url) {
  try {
    const u = new URL(url);
    return u.protocol === "bitchord:" && u.host === "app";
  } catch {
    return false;
  }
}
export function publicAddress(ip) {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  return false; // Download resolver uses IPv4; no mapped/private IPv6 escapes.
}
export async function validateDownloadUrl(value) {
  const u = new URL(value);
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    (u.port && u.port !== "443")
  )
    throw Error("Downloads require a public HTTPS URL.");
  if (/(^|\.)(youtube\.com|googlevideo\.com|spotify\.com)$/.test(u.hostname))
    throw Error(
      "This service does not permit direct downloads through BitChord.",
    );
  const addresses = await lookup(u.hostname, { all: true, family: 4 });
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw Error("Private network addresses are not allowed.");
  return { url: u, address: addresses[0].address };
}
export function text(value, max = 500) {
  if (typeof value !== "string" || value.length > max)
    throw Error("Invalid text");
  return value;
}
