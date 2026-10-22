// Server-only helpers for the /vault access code and session cookie.
//
// The access code lives in VAULT_ACCESS_CODE and is only ever compared on the
// server. A correct code, sent together with an acceptance of the current
// terms, earns a signed, HttpOnly cookie that carries who accepted and which
// version they accepted. The vault page checks that cookie on the server
// before it sends any vault content, so the content never ships in the public
// JavaScript bundle.
import crypto from "node:crypto";
import { TERMS_VERSION } from "./data/vault-terms";

export const VAULT_COOKIE = "vault_session";
export const SESSION_SECONDS = 8 * 60 * 60;
export const LIMITS = { name: 80, org: 120 };

const secret = () => process.env.VAULT_SESSION_SECRET || process.env.VAULT_ACCESS_CODE || "";

export const vaultConfigured = () => Boolean(process.env.VAULT_ACCESS_CODE);

const digest = (value) => crypto.createHash("sha256").update(String(value)).digest();

// Constant-time comparison on fixed-length digests, so neither the code's
// length nor its prefix leaks through response timing.
export function checkCode(code) {
  if (!vaultConfigured()) return false;
  return crypto.timingSafeEqual(digest(code), digest(process.env.VAULT_ACCESS_CODE));
}

// Collapse whitespace and drop control characters from a typed field.
export const cleanField = (value, max) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const sign = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

// Token: issued.terms.viewer.mac, where viewer is base64url JSON {n, o}.
export function createSession({ name, org }) {
  const issued = Math.floor(Date.now() / 1000).toString();
  const viewer = encode({ n: name, o: org });
  return `${issued}.${TERMS_VERSION}.${viewer}.${sign(`vault:${issued}:${TERMS_VERSION}:${viewer}`)}`;
}

// Returns { name, org, terms, expires } for a valid session, otherwise null.
export function verifySession(token) {
  if (!vaultConfigured() || !token) return null;
  const [issued, terms, viewer, mac] = String(token).split(".");
  if (!issued || !terms || !viewer || !mac) return null;
  if (terms !== TERMS_VERSION) return null;
  const age = Date.now() / 1000 - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_SECONDS) return null;
  const expected = Buffer.from(sign(`vault:${issued}:${terms}:${viewer}`));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const { n, o } = JSON.parse(Buffer.from(viewer, "base64url").toString("utf8"));
    return {
      name: String(n),
      org: String(o ?? ""),
      terms,
      expires: (Number(issued) + SESSION_SECONDS) * 1000,
    };
  } catch {
    return null;
  }
}
