// Server-only helpers for the /vault access code and session cookie.
//
// The access code lives in VAULT_ACCESS_CODE and is only ever compared on the
// server. A correct code earns a signed, HttpOnly cookie; the vault page
// checks that cookie on the server before it sends any vault content, so the
// content never ships in the public JavaScript bundle.
import crypto from "node:crypto";

export const VAULT_COOKIE = "vault_session";
export const SESSION_SECONDS = 8 * 60 * 60;

const secret = () => process.env.VAULT_SESSION_SECRET || process.env.VAULT_ACCESS_CODE || "";

export const vaultConfigured = () => Boolean(process.env.VAULT_ACCESS_CODE);

const digest = (value) => crypto.createHash("sha256").update(String(value)).digest();

// Constant-time comparison on fixed-length digests, so neither the code's
// length nor its prefix leaks through response timing.
export function checkCode(code) {
  if (!vaultConfigured()) return false;
  return crypto.timingSafeEqual(digest(code), digest(process.env.VAULT_ACCESS_CODE));
}

const sign = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSession() {
  const issued = Math.floor(Date.now() / 1000).toString();
  return `${issued}.${sign(`vault:${issued}`)}`;
}

export function verifySession(token) {
  if (!vaultConfigured() || !token) return false;
  const [issued, mac] = String(token).split(".");
  if (!issued || !mac) return false;
  const age = Date.now() / 1000 - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_SECONDS) return false;
  const expected = Buffer.from(sign(`vault:${issued}`));
  const given = Buffer.from(mac);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}
