import Link from "next/link";
import PageHeader from "../../components/helper/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

// Stripe sends the buyer here after payment. The session is looked up on the
// server so the page only says "paid" when Stripe says so.
async function lookup(sessionId) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^cs_[A-Za-z0-9_]+$/.test(sessionId ?? "")) return null;
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function ThanksPage({ searchParams }) {
  const session = await lookup((await searchParams)?.session_id);
  const paid = session?.payment_status === "paid";

  return (
    <PageHeader
      eyebrow="Order"
      title={paid ? "Thank you. Payment received." : "Thank you."}
      lede={
        paid
          ? `Your receipt is on its way${session?.customer_details?.email ? ` to ${session.customer_details.email}` : ""}. Shipping details follow by email.`
          : "If you completed payment, your receipt is on its way by email. If anything looks wrong, use the contact form and mention your order."
      }
    >
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="sw-btn sw-btn-primary">Back to the site</Link>
        <Link href="/#contact" className="sw-btn sw-btn-ghost">Contact</Link>
      </div>
    </PageHeader>
  );
}
