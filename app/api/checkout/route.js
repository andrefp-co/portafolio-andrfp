import { checkoutReady } from "@/utils/checkout";
import { books } from "@/utils/data/books";
import { SITE_URL } from "@/utils/seo";
import { clientIp, rateLimit, sameOrigin } from "@/utils/security";
import { NextResponse } from "next/server";

// POST { bookId, quantity, format } → { url } of a Stripe Checkout page.
// Uses Stripe's REST API directly; card details are entered on Stripe and
// never reach this server.
export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  if (!rateLimit(`checkout:${clientIp(request)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Send the order as JSON." }, { status: 400 });
  }

  const book = books.find((b) => b.id === body?.bookId);
  if (!book) return NextResponse.json({ message: "Unknown book." }, { status: 404 });
  if (!checkoutReady(book)) {
    return NextResponse.json({ message: "Online checkout isn't set up yet.", fallback: true }, { status: 503 });
  }

  const quantity = Math.min(Math.max(parseInt(body?.quantity, 10) || 1, 1), book.maxQuantity ?? 10);
  const format = book.formats?.includes(body?.format) ? body.format : book.formats?.[0] ?? "";
  const base = process.env.NODE_ENV === "production" ? SITE_URL : new URL(request.url).origin;

  const params = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": process.env[book.stripePriceEnv],
    "line_items[0][quantity]": String(quantity),
    success_url: `${base}/book/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/#books`,
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
    "metadata[book]": book.id,
    "metadata[format]": format,
  });
  if (format === "Print") {
    const countries = (process.env.STRIPE_SHIP_COUNTRIES || "US").split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
    countries.forEach((c, i) => params.set(`shipping_address_collection[allowed_countries][${i}]`, c));
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const data = await res.json();
    if (!res.ok || !data?.url) {
      console.error("Stripe checkout failed:", data?.error?.message ?? res.status);
      return NextResponse.json({ message: "The payment page is unavailable. Try again shortly.", fallback: true }, { status: 502 });
    }
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Stripe checkout failed:", error);
    return NextResponse.json({ message: "The payment page is unavailable. Try again shortly.", fallback: true }, { status: 502 });
  }
}
