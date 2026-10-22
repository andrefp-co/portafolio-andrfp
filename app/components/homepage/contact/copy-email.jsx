"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Shows the address as selectable text, with a Copy button that confirms in
// place. mailto: is unreliable in many browsers, so copying is the main path.
export default function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const range = document.createRange();
      const node = document.getElementById("contact-email-address");
      if (node) {
        range.selectNodeContents(node);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <a
        id="contact-email-address"
        href={`mailto:${email}`}
        className="break-all text-sm text-white underline decoration-[var(--sw-gray)] underline-offset-4 hover:decoration-white"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="relative h-8 min-w-[72px] overflow-hidden border border-[var(--sw-border-strong)] px-3 text-[10px] uppercase tracking-[0.14em] text-[var(--sw-silver)] transition-colors hover:border-white hover:text-white"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            className="block"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {copied ? "Copied" : "Copy"}
          </motion.span>
        </AnimatePresence>
        <span className="sr-only" role="status">{copied ? "Email address copied" : ""}</span>
      </button>
    </div>
  );
}
