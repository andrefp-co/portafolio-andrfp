"use client";

import { useRef } from "react";

// The hero section, plus a soft light that follows the pointer or finger
// across the coordinate grid. Position is written straight to CSS custom
// properties, so moving it never re-renders React.
export default function HeroStage({ children, className = "" }) {
  const ref = useRef(null);

  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <section ref={ref} className={className} onPointerMove={move}>
      {children}
    </section>
  );
}
