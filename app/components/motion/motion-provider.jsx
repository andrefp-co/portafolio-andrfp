"use client";

import { MotionConfig } from "motion/react";

// One place that makes every Motion animation honour the visitor's
// reduced-motion setting: transforms are skipped, opacity still fades.
export default function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
