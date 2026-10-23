"use client";

import { animate, useInView } from "motion/react";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import { useEffect, useRef } from "react";

const format = (n) => Math.round(n).toLocaleString("en-US");

// Rolls a number up to its value the first time it scrolls into view. The
// server renders the final value, so the number is correct before (and
// without) JavaScript; the roll only starts from `from` once it is visible.
export default function CountUp({ value, from = 0, prefix = "", suffix = "", duration = 1.4, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!inView) {
      el.textContent = format(from);
      return;
    }
    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { el.textContent = format(v); },
    });
    return () => controls.stop();
  }, [inView, reduce, from, value, duration]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      <span ref={ref}>{format(value)}</span>
      {suffix}
    </span>
  );
}
