"use client";

import { motion } from "motion/react";
import { useState } from "react";

// Copy link, the platforms people actually share engineering posts on, and
// the phone's own share sheet when it has one.
export default function ShareBar({ title, path, className = "", grid = false }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window === "undefined" ? path : new URL(path, window.location.origin).href);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this link:", url());
    }
  };

  const native = async () => {
    try {
      await navigator.share({ title, url: url() });
    } catch {
      // Dismissed, or no share sheet: nothing to do.
    }
  };

  const open = (href) => window.open(href, "_blank", "noopener,noreferrer");
  const enc = encodeURIComponent;

  const button = `sw-btn sw-btn-ghost !px-3 !py-2 !text-[10px] ${grid ? "w-full justify-center" : ""}`;

  return (
    <div className={`${grid ? "grid grid-cols-2" : "flex flex-wrap items-center"} gap-2 ${className}`}>
      <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={copy} className={button} aria-live="polite">
        {copied ? "Link copied" : "Copy link"}
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url())}`)}
        className={button}
      >
        LinkedIn
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => open(`https://x.com/intent/post?text=${enc(title)}&url=${enc(url())}`)}
        className={button}
      >
        X
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => (window.location.href = `mailto:?subject=${enc(title)}&body=${enc(url())}`)}
        className={button}
      >
        Email
      </motion.button>
      <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={native} className={`${button} sm:hidden`}>
        Share…
      </motion.button>
    </div>
  );
}
