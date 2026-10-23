import { vault } from "@/utils/data/vault";
import { TERMS_VERSION } from "@/utils/data/vault-terms";
import { clientIp, rateLimit, sameOrigin } from "@/utils/security";
import { LIMITS, SESSION_SECONDS, VAULT_COOKIE, checkCode, cleanField, createSession, vaultConfigured } from "@/utils/vault";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const FAIL_DELAY_MS = 900;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Best effort: tell the owner who opened the vault, if VAULT_NOTIFY_EMAIL is
// set and Resend is configured. A failed notice never blocks access.
async function notify({ name, org }) {
  const { RESEND_API_KEY, EMAIL_FROM, VAULT_NOTIFY_EMAIL } = process.env;
  if (!RESEND_API_KEY || !VAULT_NOTIFY_EMAIL) return;
  try {
    await new Resend(RESEND_API_KEY).emails.send({
      from: EMAIL_FROM || "Portfolio <onboarding@resend.dev>",
      to: VAULT_NOTIFY_EMAIL,
      subject: `Vault opened by ${name}`,
      text: [
        `Name: ${name}`,
        `Organization: ${org || "(not given)"}`,
        `Terms version accepted: ${TERMS_VERSION}`,
        `Time (UTC): ${new Date().toISOString()}`,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Vault notice failed:", error);
  }
}

// POST { code, agreed, terms, name, org } → when the current terms are
// accepted and the code is right, sets the session cookie and answers with
// the file itself, so it opens at once even where the browser holds back the
// cookie (iPhone Safari after arriving from another app or site).
export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }
  // Brute-force cap on top of the per-attempt delay: 10 tries per 15 minutes.
  if (!rateLimit(`vault:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Wait 15 minutes and try again." }, { status: 429 });
  }
  if (!vaultConfigured()) {
    return NextResponse.json({ message: "Access code not configured on this server." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send the request as JSON." }, { status: 400 });
  }

  const name = cleanField(body?.name, LIMITS.name);
  const org = cleanField(body?.org, LIMITS.org);
  if (body?.agreed !== true || body?.terms !== TERMS_VERSION) {
    return NextResponse.json({ message: "Accept the current terms before you authenticate." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ message: "Sign the agreement with your full name." }, { status: 400 });
  }

  const code = String(body?.code ?? "").slice(0, 200);
  if (!checkCode(code)) {
    // Like a real login, a wrong code costs time; it blunts guessing.
    await wait(FAIL_DELAY_MS);
    return NextResponse.json({ message: "Access denied." }, { status: 401 });
  }

  console.info(`vault: terms ${TERMS_VERSION} accepted by "${name}"${org ? ` (${org})` : ""}`);
  await notify({ name, org });

  const response = NextResponse.json({
    message: "Access granted.",
    viewer: { name, org, expires: Date.now() + SESSION_SECONDS * 1000 },
    content: vault,
  });
  // Lax, not Strict: Safari drops Strict cookies on pages reached from
  // another site. Cross-site POSTs still never carry it, and this endpoint
  // also checks the Origin header.
  response.cookies.set(VAULT_COOKIE, createSession({ name, org }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}

// DELETE → locks the vault again.
export async function DELETE(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }
  const response = NextResponse.json({ message: "Locked." });
  response.cookies.set(VAULT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
