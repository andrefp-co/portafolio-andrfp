"use client";

import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import { useEffect, useRef, useState } from "react";

// Why a hybrid EMI filter: an inverter's switching harmonics, seen on a
// spectrum against a conducted-emissions limit. A passive LC stage rolls off
// at 40 dB/decade, so it clears the high band but would need large magnetics
// to reach the first harmonics; an active stage cancels the low band but runs
// out of bandwidth higher up. Together they clear the whole band.
//
// This is a concept model with no axis values, not a measurement: the
// project's hardware validation is still pending, and the panel says so.
const HARMONICS = 60;
const MODES = [
  { key: "none", label: "None", note: "Unfiltered switching harmonics sit over the limit across the band." },
  { key: "passive", label: "Passive", note: "A passive LC stage clears the high band. The first harmonics stay over; reaching them passively takes large magnetics." },
  { key: "active", label: "Active", note: "An active stage cancels the low band, then runs out of bandwidth: the high band comes back over." },
  { key: "hybrid", label: "Hybrid", note: "Active below, passive above: under the limit across the band, without sizing the magnetics for the lowest harmonic." },
];

const lg = Math.log10;
// Unfiltered envelope (dB, relative): falls with harmonic order, plus a
// parasitic ringing resonance high in the band.
const source = (k) => 98 - 18 * lg(k) + 14 * Math.exp(-(((lg(k) - 1.5) / 0.18) ** 2));
const limit = (k) => 76 - 14 * lg(k);
const passive = (k) => Math.max(0, 40 * (lg(k) - 0.477));
const active = (k) => (k <= 8 ? 30 : Math.max(0, 30 - 20 * (lg(k) - 0.903)));
const ATTEN = {
  none: () => 0,
  passive,
  active,
  hybrid: (k) => passive(k) + active(k),
};

const DB_TOP = 104;
const DB_BOTTOM = 18;

export default function EmiScope({ className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const levels = useRef(Array.from({ length: HARMONICS }, (_, i) => source(i + 1)));
  const modeRef = useRef("none");
  const redrawRef = useRef(() => {});
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { margin: "0px 0px -10% 0px" });
  const [mode, setMode] = useState("none");
  const [auto, setAuto] = useState(true);

  // Walk through the four cases on its own until someone picks one.
  useEffect(() => {
    if (!auto || !inView || reduce) return;
    const id = setInterval(() => {
      setMode((m) => MODES[(MODES.findIndex((x) => x.key === m) + 1) % MODES.length].key);
    }, 2600);
    return () => clearInterval(id);
  }, [auto, inView, reduce]);

  useEffect(() => {
    modeRef.current = mode;
    redrawRef.current();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;

    const xOf = (k) => 8 + (lg(k) / lg(HARMONICS)) * (width - 16);
    const yOf = (db) => height - ((db - DB_BOTTOM) / (DB_TOP - DB_BOTTOM)) * height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const css = getComputedStyle(canvas);
      const ink = css.getPropertyValue("--sw-white").trim() || "#fff";
      const dim = css.getPropertyValue("--sw-gray").trim() || "#8d9297";
      const over = css.getPropertyValue("--sw-danger-text").trim() || "#ca7875";

      // Decade grid.
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      for (const k of [1, 10, HARMONICS]) {
        const x = Math.round(xOf(k)) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let q = 1; q < 4; q++) {
        const y = Math.round((q / 4) * height) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Noise floor between the harmonics.
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.beginPath();
      for (let i = 0; i <= width; i += 2) {
        const n = Math.sin(i * 12.9898) * 43758.5453;
        const y = yOf(DB_BOTTOM + 6 + (n - Math.floor(n)) * 5);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Limit line.
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = dim;
      ctx.beginPath();
      for (let k = 1; k <= HARMONICS; k++) {
        const x = xOf(k);
        const y = yOf(limit(k));
        if (k === 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Filter attenuation, drawn hanging from the top edge.
      const atten = ATTEN[modeRef.current];
      if (modeRef.current !== "none") {
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.beginPath();
        for (let k = 1; k <= HARMONICS; k++) {
          const x = xOf(k);
          const y = Math.min(height, (atten(k) / (DB_TOP - DB_BOTTOM)) * height);
          if (k === 1) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Harmonic peaks: ink when under the limit, flagged when over.
      levels.current.forEach((db, i) => {
        const k = i + 1;
        const x = Math.round(xOf(k)) + 0.5;
        const isOver = db > limit(k);
        ctx.strokeStyle = isOver ? over : ink;
        ctx.globalAlpha = isOver ? 1 : 0.85;
        ctx.lineWidth = k < 6 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, yOf(db));
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    // Ease every peak toward its filtered level; stop once settled.
    const step = () => {
      const atten = ATTEN[modeRef.current];
      let moving = false;
      levels.current = levels.current.map((db, i) => {
        const target = source(i + 1) - atten(i + 1);
        const next = reduce ? target : db + (target - db) * 0.14;
        if (Math.abs(target - next) > 0.05) moving = true;
        return Math.abs(target - next) > 0.05 ? next : target;
      });
      draw();
      if (moving) raf = requestAnimationFrame(step);
      else running = false;
    };

    redrawRef.current = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      redrawRef.current = () => {};
    };
  }, [reduce]);

  const current = MODES.find((m) => m.key === mode);

  return (
    <figure ref={wrapRef} className={`sw-ink sw-panel m-0 flex flex-col ${className}`}>
      <div className="sw-panel-bar">
        <span className="sw-label">Conducted emissions</span>
        <span className="sw-label">Concept model</span>
      </div>

      <div className="relative min-h-[170px] flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <span className="pointer-events-none absolute right-3 top-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[var(--sw-gray)]">
          <svg width="16" height="2" aria-hidden="true"><line x1="0" y1="1" x2="16" y2="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
          Limit
        </span>
      </div>

      <div className="flex justify-between border-t border-[var(--sw-border)] px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[var(--sw-gray)]">
        <span>Low</span>
        <span>Frequency, log scale →</span>
      </div>

      <div className="border-t border-[var(--sw-border)] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={mode === m.key}
              onClick={() => {
                setAuto(false);
                setMode(m.key);
              }}
              className={`min-h-[32px] border px-3 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                mode === m.key
                  ? "border-[var(--sw-white)] bg-[var(--sw-white)] text-[var(--sw-black)]"
                  : "border-[var(--sw-border-strong)] text-[var(--sw-silver)] hover:border-[var(--sw-white)] hover:text-[var(--sw-white)]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <motion.p
          key={mode}
          className="mt-2.5 min-h-[3.4em] text-[11.5px] leading-relaxed text-[var(--sw-silver)]"
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          aria-live="polite"
        >
          {current.note}
        </motion.p>
      </div>
    </figure>
  );
}
