import { isValidEmail } from "@/utils/check-email";
import { clientIp, looksLikeSpam, rateLimit, sameOrigin } from "@/utils/security";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const MAX_LENGTH = { name: 120, email: 200, message: 5000 };

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many messages. Try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send the form as JSON." }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();

  // Bots get a quiet success so they learn nothing; nothing is sent.
  if (looksLikeSpam({ honeypot: body?.website, elapsed: body?.elapsed, text: message })) {
    return NextResponse.json({ message: "Message sent." });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ message: "Fill in your name, email and message." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }
  if (name.length > MAX_LENGTH.name || email.length > MAX_LENGTH.email || message.length > MAX_LENGTH.message) {
    return NextResponse.json({ message: "That message is too long. Keep it under 5,000 characters." }, { status: 400 });
  }

  const { RESEND_API_KEY, EMAIL_TO, EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !EMAIL_TO) {
    console.error("Contact form: RESEND_API_KEY or EMAIL_TO is not set.");
    return NextResponse.json({ message: "The contact form isn't set up yet. Email me directly instead." }, { status: 503 });
  }

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM || "Portfolio <onboarding@resend.dev>",
    to: EMAIL_TO,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    console.error("Contact form: Resend rejected the message.", error);
    return NextResponse.json({ message: "Your message didn't go through. Email me directly instead." }, { status: 502 });
  }

  return NextResponse.json({ message: "Message sent." });
}
