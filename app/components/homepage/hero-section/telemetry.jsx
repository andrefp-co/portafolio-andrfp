"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// A simulated attitude readout: three channels scrolling like a ground-station
// plot. Signals are deterministic sums of sines plus hashed noise at a 200 Hz
// sample clock, so the trace never shimmers between frames. Labelled "SIM" on
// screen: it is decoration in the subject's own vernacular, not flight data.
const WINDOW_S = 6;
const SAMPLE_HZ = 200;
const RANGE_DEG = 12;
const BOOT_MS = 1200;

const noise = (k) => {
  const x = Math.sin(k * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

const CHANNELS = [
  {
    key: "roll",
    label: "Roll",
    unit: "°",
    stroke: "#f8f8f8",
    width: 1.5,
    dash: [],
    fn: (t, k) => 6 * Math.sin(0.9 * t) + 2.2 * Math.sin(2.7 * t + 1) + 0.6 * Math.sin(9.1 * t) + 0.25 * noise(k),
  },
  {
    key: "pitch",
    label: "Pitch",
    unit: "°",
    stroke: "#bfc2c5",
    width: 1,
    dash: [],
    fn: (t, k) => 3.5 * Math.sin(0.6 * t + 2) + 1.4 * Math.sin(3.3 * t) + 0.4 * Math.sin(11 * t + 0.5) + 0.2 * noise(k + 7),
  },
  {
    key: "yaw",
    label: "Yaw rate",
    unit: "°/s",
    stroke: "#8d9297",
    width: 1,
    dash: [4, 4],
    fn: (t, k) => 4 * Math.sin(0.35 * t + 0.3) + 0.8 * Math.sin(5.1 * t) + 0.15 * noise(k + 13),
  },
];

const fmt = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;

export default function Telemetry() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const readoutRefs = useRef({});
  const bootStartRef = useRef(0);
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { margin: "0px 0px 0px 0px" });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let looping = false;
    // Assigned below; resize() repaints through it because setting a canvas's
    // size clears it, and a still (reduced-motion) frame has no loop to redraw.
    let draw = () => {};

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!looping) draw(performance.now());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // The boot reveal plays once per page view, not each time the hero
    // scrolls back into view and this effect restarts.
    if (!bootStartRef.current) bootStartRef.current = performance.now();
    const start = bootStartRef.current;
    let lastReadout = 0;
    let raf = 0;

    draw = (now) => {
      const t = now / 1000;
      const boot = reduce ? 1 : Math.min(1, (now - start) / BOOT_MS);
      ctx.clearRect(0, 0, width, height);

      // Grid: 1 s major divisions, quarter-range minor divisions.
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      const offset = ((t % 1) / WINDOW_S) * width;
      for (let s = 0; s <= WINDOW_S + 1; s++) {
        const x = Math.round(width - (s / WINDOW_S) * width + offset) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let q = 1; q < 4; q++) {
        const y = Math.round((q / 4) * height) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.beginPath();
      ctx.moveTo(0, Math.round(height / 2) + 0.5);
      ctx.lineTo(width, Math.round(height / 2) + 0.5);
      ctx.stroke();

      // Traces, revealed left to right during boot.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width * boot, height);
      ctx.clip();
      const points = Math.max(60, Math.floor(width / 2));
      for (const ch of CHANNELS) {
        ctx.strokeStyle = ch.stroke;
        ctx.lineWidth = ch.width;
        ctx.setLineDash(ch.dash);
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const ts = t - WINDOW_S + (i / points) * WINDOW_S;
          const v = ch.fn(ts, Math.floor(ts * SAMPLE_HZ));
          const y = height / 2 - (v / RANGE_DEG) * (height / 2);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      ctx.setLineDash([]);

      // Sweep marker at the live edge.
      if (boot >= 1) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillRect(width - 2, 0, 2, height);
      }

      if (now - lastReadout > 120) {
        lastReadout = now;
        for (const ch of CHANNELS) {
          const el = readoutRefs.current[ch.key];
          if (el) el.textContent = fmt(ch.fn(t, Math.floor(t * SAMPLE_HZ)));
        }
      }
    };

    if (reduce || !inView) {
      draw(performance.now());
    } else {
      looping = true;
      const loop = (now) => {
        draw(now);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduce, inView]);

  return (
    <motion.figure
      ref={wrapRef}
      className="sw-panel m-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sw-panel-bar">
        <span className="sw-label">Attitude telemetry</span>
        <span className="sw-label flex items-center gap-2">
          <span className="sw-live-dot" aria-hidden="true" />
          SIM · 200 Hz
        </span>
      </div>
      <div className="relative h-[220px] sm:h-[260px]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <span className="sw-label absolute left-3 top-2 !text-[9px]">+{RANGE_DEG}°</span>
        <span className="sw-label absolute bottom-2 left-3 !text-[9px]">−{RANGE_DEG}°</span>
        <span className="sw-label absolute bottom-2 right-3 !text-[9px]">T−{WINDOW_S}S → NOW</span>
      </div>
      <figcaption className="grid grid-cols-3 border-t border-[var(--sw-border)]">
        {CHANNELS.map((ch) => (
          <div key={ch.key} className="border-r border-[var(--sw-border)] px-4 py-3 last:border-r-0">
            <span className="sw-label flex items-center gap-2">
              <svg width="16" height="2" aria-hidden="true">
                <line x1="0" y1="1" x2="16" y2="1" stroke={ch.stroke} strokeWidth="2" strokeDasharray={ch.dash.join(" ")} />
              </svg>
              {ch.label}
            </span>
            <p className="mt-1 text-sm tabular-nums text-white">
              <span ref={(el) => { readoutRefs.current[ch.key] = el; }}>{fmt(0)}</span>
              <span className="text-[var(--sw-gray)]"> {ch.unit}</span>
            </p>
          </div>
        ))}
      </figcaption>
    </motion.figure>
  );
}
