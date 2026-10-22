"use client";

import { isValidEmail } from "@/utils/check-email";
import { PREVIEW } from "@/utils/preview";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1];
const PREVIEW_NOTE = "This preview has no server, so orders can't go through here. Ordering works on andres.swort.net.";
const field =
  "w-full border border-[var(--sw-border-strong)] bg-transparent px-3 py-2.5 text-[14px] text-[var(--sw-white)] outline-none transition-colors placeholder:text-[var(--sw-gray)] focus:border-[var(--sw-white)]";

// "Order a copy": pick format and quantity, then pay on Stripe when checkout
// is configured, or send an order request the author answers with a payment
// link. A bottom sheet on phones, a dialog on larger screens.
export default function OrderSheet({ book, open, onClose, checkout }) {
  const [quantity, setQuantity] = useState(1);
  const [format, setFormat] = useState(book.formats?.[0] ?? "");
  const [mode, setMode] = useState(checkout ? "pay" : "request");
  const [state, setState] = useState({ status: "idle", message: "" });
  const [form, setForm] = useState({ name: "", email: "", shipTo: "", note: "" });
  const shownAt = useRef(0);
  const honeypot = useRef(null);
  const firstField = useRef(null);
  const max = book.maxQuantity ?? 10;

  useEffect(() => {
    if (!open) return;
    shownAt.current = Date.now();
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstField.current?.focus(), 250);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  const title = `${book.title}${book.volume ? `, ${book.volume}` : ""}`;
  const busy = state.status === "sending";

  const pay = async () => {
    if (PREVIEW) return setState({ status: "error", message: PREVIEW_NOTE });
    setState({ status: "sending", message: "" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookId: book.id, quantity, format }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (data.fallback) setMode("request");
      setState({ status: "error", message: data.message || "The payment page is unavailable right now." });
    } catch {
      setState({ status: "error", message: "Network error. Check your connection and try again." });
    }
  };

  const request = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || !isValidEmail(form.email)) {
      setState({ status: "error", message: "Enter your name and a valid email address." });
      return;
    }
    if (format === "Print" && form.shipTo.trim().length < 2) {
      setState({ status: "error", message: "Tell us where to ship the book." });
      return;
    }
    if (PREVIEW) return setState({ status: "error", message: PREVIEW_NOTE });
    setState({ status: "sending", message: "" });
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          quantity,
          format,
          ...form,
          website: honeypot.current?.value ?? "",
          elapsed: Date.now() - shownAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState({ status: "sent", message: "" });
      else setState({ status: "error", message: data.message || "The request didn't go through." });
    } catch {
      setState({ status: "error", message: "Network error. Check your connection and try again." });
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    if (mode === "request") return request(e);
    e.preventDefault();
    pay();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full overflow-y-auto border border-[var(--sw-border-strong)] bg-[#0b0b0b] p-6 pb-[max(24px,env(safe-area-inset-bottom))] text-[var(--sw-white)] sm:max-w-[520px] sm:p-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="sw-label">Order a copy</p>
                <h2 id="order-title" className="mt-2 font-[family-name:var(--sw-font-display)] text-[34px] leading-[0.95] tracking-[0.02em]">
                  {title}
                </h2>
                <p className="mt-1 text-[12.5px] text-[var(--sw-gray)]">
                  by {book.author}
                  {book.price ? ` · ${book.price}` : ""}
                </p>
              </div>
              <button type="button" onClick={onClose} className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-[var(--sw-gray)] hover:text-[var(--sw-white)]" aria-label="Close">
                ✕
              </button>
            </div>

            {state.status === "sent" ? (
              <div className="mt-8 border-t border-[var(--sw-border)] pt-6" role="status">
                <p className="text-[15px]">Order request sent.</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--sw-silver)]">
                  Andres will reply to {form.email} with payment and shipping details. Nothing has been charged.
                </p>
                <button type="button" onClick={onClose} className="sw-btn sw-btn-primary mt-6">Done</button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 flex flex-col gap-5 border-t border-[var(--sw-border)] pt-6" noValidate>
                {book.formats?.length > 1 && (
                  <fieldset>
                    <legend className="sw-label mb-2">Format</legend>
                    <div className="flex flex-wrap gap-2">
                      {book.formats.map((f) => (
                        <button
                          key={f}
                          type="button"
                          aria-pressed={format === f}
                          onClick={() => setFormat(f)}
                          className={`min-h-[40px] border px-4 text-[12px] ${format === f ? "border-[var(--sw-white)] bg-[var(--sw-white)] text-[var(--sw-black)]" : "border-[var(--sw-border-strong)] text-[var(--sw-silver)]"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div className="flex items-center justify-between gap-4">
                  <span className="sw-label">Quantity</span>
                  <div className="flex items-center border border-[var(--sw-border-strong)]">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 text-[18px] text-[var(--sw-silver)] hover:text-[var(--sw-white)] disabled:opacity-30" disabled={quantity <= 1} aria-label="One fewer">
                      −
                    </button>
                    <span className="w-10 text-center tabular-nums" aria-live="polite">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => Math.min(max, q + 1))} className="h-10 w-10 text-[18px] text-[var(--sw-silver)] hover:text-[var(--sw-white)] disabled:opacity-30" disabled={quantity >= max} aria-label="One more">
                      +
                    </button>
                  </div>
                </div>

                {mode === "request" && (
                  <>
                    <p className="text-[12.5px] leading-relaxed text-[var(--sw-silver)]">
                      Send your details and Andres will reply with a secure payment link and shipping. Nothing is charged now.
                    </p>
                    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                      <label htmlFor="order-website">Website</label>
                      <input ref={honeypot} id="order-website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                    </div>
                    <label className="flex flex-col gap-1.5">
                      <span className="sw-label">Full name</span>
                      <input ref={firstField} className={field} value={form.name} onChange={set("name")} autoComplete="name" maxLength={120} required />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="sw-label">Email</span>
                      <input className={field} type="email" value={form.email} onChange={set("email")} autoComplete="email" maxLength={200} required />
                    </label>
                    {format === "Print" && (
                      <label className="flex flex-col gap-1.5">
                        <span className="sw-label">Ship to (city, state, country)</span>
                        <input className={field} value={form.shipTo} onChange={set("shipTo")} autoComplete="address-level2" maxLength={200} required />
                      </label>
                    )}
                    <label className="flex flex-col gap-1.5">
                      <span className="sw-label">Note (optional)</span>
                      <textarea className={`${field} min-h-[80px]`} value={form.note} onChange={set("note")} maxLength={1000} />
                    </label>
                  </>
                )}

                <AnimatePresence>
                  {state.status === "error" && (
                    <motion.p role="alert" className="text-[12.5px] text-[var(--sw-danger-text)]" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {state.message}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={busy} className="sw-btn sw-btn-primary w-full justify-center disabled:opacity-60">
                  {busy ? "One moment…" : mode === "pay" ? "Continue to secure payment" : "Send order request"}
                </button>
                <p className="text-[11px] leading-relaxed text-[var(--sw-gray)]">
                  {mode === "pay"
                    ? "Payment is handled by Stripe. Card details are entered on Stripe and never reach this site."
                    : "Your details are used only to fulfil this order."}
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
