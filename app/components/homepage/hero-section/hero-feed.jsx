"use client";

import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];

// The Higgsfield clip as a bench-camera feed: corner brackets, a running
// timecode, and a reticle that follows the pointer or finger. The clip is an
// AI-generated illustration and is labelled as one.
export default function HeroFeed() {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const timeRef = useRef(null);
  const coordRef = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef);

  const rx = useMotionValue(0.62);
  const ry = useMotionValue(0.48);
  const springX = useSpring(rx, { stiffness: 220, damping: 26 });
  const springY = useSpring(ry, { stiffness: 220, damping: 26 });
  const left = useSpring(0, { stiffness: 220, damping: 26 });
  const top = useSpring(0, { stiffness: 220, damping: 26 });

  // Play only while visible, never under reduced motion (the poster stays).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduce || !inView) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [inView, reduce]);

  // Timecode from the clip itself.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tick = () => {
      const t = video.currentTime || 0;
      const s = Math.floor(t);
      const cs = Math.floor((t - s) * 100);
      if (timeRef.current) timeRef.current.textContent = `T+00:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    };
    video.addEventListener("timeupdate", tick);
    return () => video.removeEventListener("timeupdate", tick);
  }, []);

  // Keep the reticle's pixel position in step with its spring.
  useEffect(() => {
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      left.set(springX.get() * el.clientWidth);
      top.set(springY.get() * el.clientHeight);
      if (coordRef.current) {
        coordRef.current.textContent = `X ${springX.get().toFixed(2)}  Y ${springY.get().toFixed(2)}`;
      }
    };
    const unsubs = [springX.on("change", place), springY.on("change", place)];
    place();
    window.addEventListener("resize", place);
    return () => {
      unsubs.forEach((u) => u());
      window.removeEventListener("resize", place);
    };
  }, [springX, springY, left, top]);

  const track = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    rx.set(Math.min(0.95, Math.max(0.05, (e.clientX - rect.left) / rect.width)));
    ry.set(Math.min(0.92, Math.max(0.08, (e.clientY - rect.top) / rect.height)));
  };

  return (
    <motion.figure
      ref={wrapRef}
      className="relative m-0 aspect-[16/10] overflow-hidden border border-[var(--sw-border)] bg-black"
      style={{ touchAction: "pan-y" }}
      onPointerMove={track}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 1.2, ease: EASE }}
    >
      {/* H.264 first (Safari, Chrome, Edge); VP9 for browsers without H.264. */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/media/hero-pcb.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/media/hero-loop.mp4" type="video/mp4" />
        <source src="/media/hero-loop.webm" type="video/webm" />
      </video>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      <span className="sw-feed-corner left-3 top-3 border-l border-t" aria-hidden="true" />
      <span className="sw-feed-corner right-3 top-3 border-r border-t" aria-hidden="true" />
      <span className="sw-feed-corner bottom-3 left-3 border-b border-l" aria-hidden="true" />
      <span className="sw-feed-corner bottom-3 right-3 border-b border-r" aria-hidden="true" />

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 border border-white/80"
        style={{ left, top }}
      >
        <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 bg-white/80" />
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-white/80" />
      </motion.span>

      <div className="absolute inset-x-0 top-0 flex flex-wrap items-center justify-between gap-2 px-6 pt-5 text-[10px] uppercase tracking-[0.2em] text-white/85">
        <span className="flex items-center gap-2">
          <span className="sw-live-dot" aria-hidden="true" />
          Feed 01 · <span ref={timeRef} className="tabular-nums">T+00:00.00</span>
        </span>
        <span className="text-white/70">AI-generated illustration</span>
      </div>
      <span ref={coordRef} className="absolute bottom-5 right-6 text-[10px] uppercase tracking-[0.2em] tabular-nums text-white/70" aria-hidden="true">
        X 0.62  Y 0.48
      </span>
    </motion.figure>
  );
}
