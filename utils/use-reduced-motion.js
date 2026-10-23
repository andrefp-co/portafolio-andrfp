"use client";

import { useSyncExternalStore } from "react";

// prefers-reduced-motion, safe for server rendering: the server and the
// hydrating render both assume motion is fine, then the visitor's setting
// applies. motion/react's own useReducedMotion reads the setting during that
// first render, so its HTML can differ from the server's.
const query = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const prefersReduced = () => window.matchMedia(query).matches;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReduced, () => false);
}
