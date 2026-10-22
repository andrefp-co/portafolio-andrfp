"use client";

import { setLenis } from "@/utils/scroll";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

// Eased wheel and trackpad scrolling, so the pinned sections (the roles reel,
// the globe) glide instead of stepping. Touch scrolling stays native, which is
// already smooth on phones. Off for anyone who prefers reduced motion.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.9,
      // In-page links (#contact, #books) glide too, and land below the navbar.
      anchors: { offset: -80 },
      // Scrollable panels (dialogs, the vault, menus) keep their own scrolling.
      allowNestedScroll: true,
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
