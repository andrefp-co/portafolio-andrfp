// Server-side guards shared by the POST endpoints: same-origin checks, a
// per-IP rate limiter, and spam signals for public forms.
//
// The rate limiter keeps counts in memory, so on a multi-instance host each
// instance counts separately; it still stops a single client hammering one
// instance, and the host's own edge protections sit in front of it.

const buckets = new Map();
const MAX_KEYS = 5000;

export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip")) || "unknown";
}

// true while `key` has made fewer than `limit` calls in the last `windowMs`.
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > MAX_KEYS) {
    for (const [k, times] of buckets) {
      if (!times.some((t) => now - t < windowMs)) buckets.delete(k);
    }
  }
  return recent.length <= limit;
}

// Browsers always send Origin on a cross-site or same-site POST from fetch.
// Requiring it, and requiring it to match this host, turns away forged
// cross-site requests and most scripted form spam.
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Spam signals on a submitted form: a filled honeypot, a form completed in
// under three seconds, or a message stuffed with links.
export function looksLikeSpam({ honeypot, elapsed, text = "" }) {
  if (honeypot) return true;
  const ms = Number(elapsed);
  if (!Number.isFinite(ms) || ms < 3000) return true;
  const links = (String(text).match(/https?:\/\/|www\./gi) ?? []).length;
  return links > 3;
}
