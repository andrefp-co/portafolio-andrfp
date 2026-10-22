"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

// A full-width list row that is one link. On hover or press a fill sweeps in
// from the left and the arrow moves forward, so it reads as clickable on both
// mouse and touch.
export default function RowLink({ href, children, className = "" }) {
  const [active, setActive] = useState(false);

  return (
    <motion.div
      className="relative"
      onHoverStart={() => setActive(true)}
      onHoverEnd={() => setActive(false)}
      onTapStart={() => setActive(true)}
      onTapCancel={() => setActive(false)}
      onTap={() => setActive(false)}
      whileTap={{ scale: 0.995 }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 origin-left bg-[var(--sw-graphite)]"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      <Link href={href} className={`relative grid gap-4 ${className}`}>
        {children}
        <motion.span
          aria-hidden="true"
          className="self-center justify-self-end text-xl text-[var(--sw-white)]"
          animate={{ x: active ? 6 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          →
        </motion.span>
      </Link>
    </motion.div>
  );
}
