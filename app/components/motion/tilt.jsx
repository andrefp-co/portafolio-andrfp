"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

// Leans its content toward the pointer or finger, on springs so it settles
// rather than snaps. touch-action: pan-y keeps vertical page scrolling
// working on phones; a press-and-drag tilts, a swipe still scrolls.
export default function Tilt({ children, className = "", max = 6 }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);

  const track = (e) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1100, touchAction: "pan-y" }}
      onPointerMove={track}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onPointerUp={(e) => e.pointerType !== "mouse" && reset()}
    >
      {children}
    </motion.div>
  );
}
