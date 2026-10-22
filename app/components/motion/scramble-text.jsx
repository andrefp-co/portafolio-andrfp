"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

// Ported from swort.net's scramble-text.js: short labels resolve out of glyph
// noise like a readout locking on. The real text is never mutated; it is
// painted transparent while an aria-hidden overlay draws the glyphs, so screen
// readers, copy/paste and search engines only ever see the real words.
const GLYPHS = "█▓▒░/\\|_-=+*<>[]{}0123456789ABCDEFXYZ#$%&";
const DURATION = 520;

const pick = () => GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);

export default function ScrambleText({
  as: Tag = "span",
  children,
  className = "",
  trigger = "view",
  delay = 0,
  ...rest
}) {
  const ref = useRef(null);
  const ghostRef = useRef(null);
  const frameRef = useRef(0);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const text = typeof children === "string" ? children : "";

  const run = useCallback(() => {
    const host = ref.current;
    const ghost = ghostRef.current;
    if (!host || !ghost || !text.trim() || reduce) return;

    cancelAnimationFrame(frameRef.current);
    const chars = text.split("");
    let t0 = 0;
    // Capture the resolved colour before hiding the host, so the overlay
    // draws in exactly the colour the label normally has.
    if (!host.style.color) ghost.style.color = getComputedStyle(host).color;
    host.style.color = "transparent";

    const frame = (now) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / DURATION);
      const front = p * chars.length;
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        out += i < front || c === " " ? c : pick();
      }
      ghost.textContent = out;
      if (p < 1) {
        frameRef.current = requestAnimationFrame(frame);
      } else {
        ghost.textContent = "";
        host.style.color = "";
      }
    };
    frameRef.current = requestAnimationFrame(frame);
  }, [text, reduce]);

  useEffect(() => {
    if (trigger !== "view" || !inView) return;
    const id = setTimeout(run, delay * 1000);
    return () => clearTimeout(id);
  }, [trigger, inView, delay, run]);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const hoverProps =
    trigger === "hover" ? { onPointerEnter: run, onFocus: run } : {};

  return (
    <Tag ref={ref} className={`sx-host ${className}`} {...hoverProps} {...rest}>
      {children}
      <span ref={ghostRef} className="sx-ghost" aria-hidden="true" />
    </Tag>
  );
}
