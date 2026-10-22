// Serves restricted media (the X8 board review clip, its poster and the CV) only to
// a valid vault session. The files live in /private, outside /public, so
// there is no public URL for them. Byte ranges are supported because Safari
// will not play video without them.
import { VAULT_COOKIE, verifySession } from "@/utils/vault";
import { cookies } from "next/headers";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DIR = path.join(process.cwd(), "private", "vault");
const FILES = {
  "x8-board-review.mp4": "video/mp4",
  "x8-board-review.webm": "video/webm",
  "x8-board-review.jpg": "image/jpeg",
  "andres-pena-cv.pdf": "application/pdf",
  "andres-pena-cv-1.jpg": "image/jpeg",
};
const DOWNLOAD_NAMES = { "andres-pena-cv.pdf": "Andres_Pena_Engineering_CV.pdf" };

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

// Files are kept out of the public repository (see private/README.md). When a
// file is not on disk, fetch it from private storage at VAULT_MEDIA_URL and
// pass it through, forwarding the visitor's byte range.
async function fromStorage(name, request, headers) {
  const base = process.env.VAULT_MEDIA_URL;
  if (!base) return null;
  const upstream = await fetch(`${base.replace(/\/$/, "")}/${encodeURIComponent(name)}`, {
    headers: {
      ...(process.env.VAULT_MEDIA_TOKEN ? { Authorization: `Bearer ${process.env.VAULT_MEDIA_TOKEN}` } : {}),
      ...(request.headers.get("range") ? { Range: request.headers.get("range") } : {}),
    },
    cache: "no-store",
  }).catch(() => null);
  if (!upstream || !(upstream.ok || upstream.status === 206)) return null;
  const pass = { ...headers };
  for (const h of ["content-length", "content-range"]) {
    const v = upstream.headers.get(h);
    if (v) pass[h === "content-length" ? "Content-Length" : "Content-Range"] = v;
  }
  return new Response(upstream.body, { status: upstream.status, headers: pass });
}

export async function GET(request, { params }) {
  const { name } = await params;
  const type = FILES[name];
  // Same answer for "no session" and "no such file": nothing to probe.
  if (!type || !verifySession((await cookies()).get(VAULT_COOKIE)?.value)) return notFound();

  const file = path.join(DIR, name);
  const stat = await fs.promises.stat(file).catch(() => null);

  const download = new URL(request.url).searchParams.has("download") && DOWNLOAD_NAMES[name];
  const headers = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Disposition": download ? `attachment; filename="${DOWNLOAD_NAMES[name]}"` : "inline",
    "X-Robots-Tag": "noindex, nofollow",
  };

  if (!stat) return (await fromStorage(name, request, headers)) ?? notFound();

  const range = request.headers.get("range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start = 0;
    let end = stat.size - 1;
    if (m && m[1]) {
      start = Number(m[1]);
      if (m[2]) end = Math.min(Number(m[2]), stat.size - 1);
    } else if (m && m[2]) {
      start = Math.max(0, stat.size - Number(m[2]));
    }
    if (!m || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
    }
    return new Response(Readable.toWeb(fs.createReadStream(file, { start, end })), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(end - start + 1) },
    });
  }

  return new Response(Readable.toWeb(fs.createReadStream(file)), { headers: { ...headers, "Content-Length": String(stat.size) } });
}
