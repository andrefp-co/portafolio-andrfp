"use client";

import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];

// The first screen. The bench clip fills the whole hero as a camera feed
// behind the introduction: corner brackets, a running timecode, and a
// reticle that follows the pointer or finger anywhere in the section. As the
// page scrolls on, the feed pushes in and fades into the page instead of
// stopping at a hard edge.
export default function HeroStage({ children }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const timeRef = useRef(null);
  const coordRef = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref);

  // Reticle position as a fraction of the section, eased with a spring.
  const rx = useMotionValue(0.74);
  const ry = useMotionValue(0.44);
  const sx = useSpring(rx, { stiffness: 220, damping: 26 });
  const sy = useSpring(ry, { stiffness: 220, damping: 26 });
  const left = useTransform(sx, (v) => `${v * 100}%`);
  const top = useTransform(sy, (v) => `${v * 100}%`);

  const writeCoords = () => {
    if (coordRef.current) coordRef.current.textContent = `X ${sx.get().toFixed(2)}  Y ${sy.get().toFixed(2)}`;
  };
  useMotionValueEvent(sx, "change", writeCoords);
  useMotionValueEvent(sy, "change", writeCoords);

  // Scrolling out: the feed pushes in and dims, the text lifts away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const feedScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const feedOpacity = useTransform(scrollYProgress, [0, 0.95], [1, 0.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

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

  // The reticle and the soft light both follow the pointer. The light is a
  // CSS custom property, so moving it never re-renders React.
  const track = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    rx.set(Math.min(0.97, Math.max(0.03, fx)));
    ry.set(Math.min(0.94, Math.max(0.06, fy)));
    el.style.setProperty("--mx", `${fx * 100}%`);
    el.style.setProperty("--my", `${fy * 100}%`);
  };

  return (
    <section
      ref={ref}
      onPointerMove={track}
      onPointerDown={track}
      style={{ touchAction: "pan-y" }}
      className="sw-bg-grid sw-hero-grid relative isolate flex min-h-[calc(100svh-76px)] items-center overflow-hidden bg-black"
    >
      {/* The feed, behind everything. */}
      <motion.div aria-hidden="true" className="absolute inset-0 -z-20" style={reduce ? undefined : { scale: feedScale, opacity: feedOpacity }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          {/* H.264 first (Safari, Chrome, Edge); VP9 for browsers without H.264. */}
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-[70%_50%] opacity-80"
            poster="/media/hero-pcb.jpg"
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/media/hero-loop.mp4" type="video/mp4" />
            <source src="/media/hero-loop.webm" type="video/webm" />
          </video>
        </motion.div>
      </motion.div>

      {/* Scrims: the text side stays readable, and the bottom fades into the
          page so the hero ends without a hard edge. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60 lg:bg-transparent lg:bg-gradient-to-r lg:from-black/95 lg:via-black/70 lg:to-black/10" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-black/80 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-[var(--sw-black)]" />

      {/* Camera HUD. */}
      <span className="sw-feed-corner left-4 top-4 border-l border-t sm:left-6 sm:top-6" aria-hidden="true" />
      <span className="sw-feed-corner right-4 top-4 border-r border-t sm:right-6 sm:top-6" aria-hidden="true" />
      <span className="sw-feed-corner bottom-4 left-4 border-b border-l sm:bottom-6 sm:left-6" aria-hidden="true" />
      <span className="sw-feed-corner bottom-4 right-4 border-b border-r sm:bottom-6 sm:right-6" aria-hidden="true" />
      <p aria-hidden="true" className="absolute left-9 top-7 text-[10px] uppercase tracking-[0.2em] text-white/70 sm:left-12 sm:top-9">
        Feed 01 · <span ref={timeRef} className="tabular-nums">T+00:00.00</span>
      </p>
      <p ref={coordRef} aria-hidden="true" className="absolute bottom-7 right-9 hidden text-[10px] uppercase tracking-[0.2em] tabular-nums text-white/60 sm:bottom-9 sm:right-12 sm:block">
        X 0.74  Y 0.44
      </p>

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 h-14 w-14 -translate-x-1/2 -translate-y-1/2 border border-white/70"
        style={{ left, top }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 bg-white/80" />
        <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-white/80" />
      </motion.span>

      <motion.div className="sw-container relative w-full py-20 lg:py-24" style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
        {children}
      </motion.div>
    </section>
  );
}
