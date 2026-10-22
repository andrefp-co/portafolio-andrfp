import { SESSION_SECONDS, VAULT_COOKIE, checkCode, createSession, vaultConfigured } from "@/utils/vault";
import { NextResponse } from "next/server";

const FAIL_DELAY_MS = 900;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST { code } → sets the session cookie on success.
export async function POST(request) {
  if (!vaultConfigured()) {
    return NextResponse.json({ message: "vault: access code not configured on this server" }, { status: 503 });
  }

  let code = "";
  try {
    code = String((await request.json())?.code ?? "").slice(0, 200);
  } catch {
    return NextResponse.json({ message: "Send the code as JSON." }, { status: 400 });
  }

  if (!checkCode(code)) {
    // Like a real login, a wrong code costs time; it blunts guessing.
    await wait(FAIL_DELAY_MS);
    return NextResponse.json({ message: "Login incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Access granted" });
  response.cookies.set(VAULT_COOKIE, createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return response;
}

// DELETE → locks the vault again.
export async function DELETE() {
  const response = NextResponse.json({ message: "Locked" });
  response.cookies.set(VAULT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
