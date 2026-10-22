import { isValidEmail } from "@/utils/check-email";
import { books } from "@/utils/data/books";
import { clientIp, looksLikeSpam, rateLimit, sameOrigin } from "@/utils/security";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const clip = (v, n) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, n);

// POST an order request when online checkout isn't configured: it is emailed
// to the owner, who replies with a payment link and shipping details.
export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  if (!rateLimit(`order:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many requests. Try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send the order as JSON." }, { status: 400 });
  }

  const name = clip(body?.name, 120);
  const email = clip(body?.email, 200);
  const shipTo = clip(body?.shipTo, 200);
  const note = String(body?.note ?? "").trim().slice(0, 1000);
  const book = books.find((b) => b.id === body?.bookId);
  const quantity = Math.min(Math.max(parseInt(body?.quantity, 10) || 1, 1), book?.maxQuantity ?? 10);
  const format = book?.formats?.includes(body?.format) ? body.format : book?.formats?.[0] ?? "";

  if (looksLikeSpam({ honeypot: body?.website, elapsed: body?.elapsed, text: note })) {
    return NextResponse.json({ message: "Order request sent." });
  }
  if (!book) return NextResponse.json({ message: "Unknown book." }, { status: 404 });
  if (name.length < 2 || !isValidEmail(email)) {
    return NextResponse.json({ message: "Enter your name and a valid email address." }, { status: 400 });
  }
  if (format === "Print" && shipTo.length < 2) {
    return NextResponse.json({ message: "Tell us where to ship the book." }, { status: 400 });
  }

  const { RESEND_API_KEY, EMAIL_TO, EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !EMAIL_TO) {
    return NextResponse.json({ message: "Ordering isn't set up yet. Use the contact form below." }, { status: 503 });
  }

  const title = `${book.title}${book.volume ? `, ${book.volume}` : ""}`;
  const { error } = await new Resend(RESEND_API_KEY).emails.send({
    from: EMAIL_FROM || "Portfolio <onboarding@resend.dev>",
    to: EMAIL_TO,
    replyTo: email,
    subject: `Book order request: ${title} × ${quantity}`,
    text: [`Book: ${title}`, `Format: ${format}`, `Quantity: ${quantity}`, `Name: ${name}`, `Email: ${email}`, `Ship to: ${shipTo || "(not needed)"}`, "", note || "(no note)"].join("\n"),
  });
  if (error) {
    console.error("Order request failed:", error);
    return NextResponse.json({ message: "The request didn't go through. Try again or use the contact form." }, { status: 502 });
  }
  return NextResponse.json({ message: "Order request sent." });
}
