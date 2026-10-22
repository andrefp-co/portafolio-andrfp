"use client";

import { PREVIEW } from "@/utils/preview";
import { absolute } from "@/utils/seo";
import { motion } from "motion/react";
import { useState } from "react";

// Copy link, the platforms people actually share engineering posts on, and
// the phone's own share sheet when it has one. Every link shares the page's
// address on the live site, and the platforms are plain links (window.open
// is blocked in some embedded viewers).
export default function ShareBar({ title, path, className = "", grid = false }) {
  const [copied, setCopied] = useState(false);
  const url = () => absolute(path);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt?.("Copy this link:", url());
    }
  };

  const native = async () => {
    try {
      await navigator.share({ title, url: url() });
    } catch {
      // Dismissed, or no share sheet: nothing to do.
    }
  };

  const enc = encodeURIComponent;

  const button = `sw-btn sw-btn-ghost !px-3 !py-2 !text-[10px] ${grid ? "w-full justify-center" : ""}`;

  return (
    <div className={`${grid ? "grid grid-cols-2" : "flex flex-wrap items-center"} gap-2 ${className}`}>
      <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={copy} className={button} aria-live="polite">
        {copied ? "Link copied" : "Copy link"}
      </motion.button>
      <motion.a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url())}`}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.95 }}
        className={button}
      >
        LinkedIn
      </motion.a>
      <motion.a
        href={`https://x.com/intent/post?text=${enc(title)}&url=${enc(url())}`}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.95 }}
        className={button}
      >
        X
      </motion.a>
      {!PREVIEW && (
        <motion.a href={`mailto:?subject=${enc(title)}&body=${enc(url())}`} whileTap={{ scale: 0.95 }} className={button}>
          Email
        </motion.a>
      )}
      {!PREVIEW && (
        <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={native} className={`${button} sm:hidden`}>
          Share…
        </motion.button>
      )}
    </div>
  );
}
