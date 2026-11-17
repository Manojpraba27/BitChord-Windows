import { createHash, timingSafeEqual } from "node:crypto";
export function challenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}
export function validState(actual: string | null, expected: string) {
  if (!actual) return false;
  const a = Buffer.from(actual),
    b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
