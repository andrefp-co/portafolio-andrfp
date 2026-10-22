"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

// The hydraulic brake result as a stop, not a photo. Two cars brake from the
// same speed; with constant deceleration a stop takes v²/2a, so the projected
// ~12% shorter stopping distance means ~14% more deceleration. Distances are
// normalized to the baseline stop (100%): the only figure here is the one the
// MATLAB simulation projected.
const SHORTER = 0.12;
const LANES = [
  { key: "base", label: "Baseline", stop: 1, tone: "var(--sw-gray)" },
  { key: "hyd", label: "Hydraulic", stop: 1 - SHORTER, tone: "var(--sw-white)" },
];
const RUN_S = 2.4; // seconds for the baseline car to stop
const TRACK_START = 0.13; // fraction of the track where braking begins
const TRACK_SPAN = 0.84; // fraction of the track the baseline stop covers

// Position along the lane (0 to `stop`) at time t, decelerating uniformly
// from a common initial speed.
function travelled(stop, t) {
  // Normalized: v0 = 2 / RUN_S so the baseline stops at x = 1, t = RUN_S.
  const v0 = 2 / RUN_S;
  const a = (v0 * v0) / (2 * stop);
  const tStop = v0 / a;
  const tt = Math.min(t, tStop);
  return v0 * tt - 0.5 * a * tt * tt;
}

function Car() {
  // A low, long eco-marathon shell in profile.
  return (
    <svg viewBox="0 0 48 16" className="h-[14px] w-[42px] sm:h-4 sm:w-12" aria-hidden="true">
      <path d="M2 11 C2 6 9 3.5 20 3.5 C32 3.5 43 6 46 10 L46 11.5 L2 11.5 Z" fill="currentColor" />
      <circle cx="12" cy="12.5" r="2.6" fill="var(--sw-graphite)" stroke="currentColor" strokeWidth="1" />
      <circle cx="37" cy="12.5" r="2.6" fill="var(--sw-graphite)" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export default function BrakeSim({ className = "" }) {
  const wrapRef = useRef(null);
  const carRefs = useRef({});
  const clipRefs = useRef({});
  const clipId = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { margin: "0px 0px -15% 0px" });
  const [finished, setFinished] = useState(false);
  const [run, setRun] = useState(0);
  // Without motion the cars are simply drawn at their stops.
  const done = finished || Boolean(reduce);

  // Speed against distance for one lane, as an SVG path in a 100 × 40 box.
  const curve = (stop) => {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const x = (i / 40) * stop;
      const v = Math.sqrt(Math.max(0, 1 - x / stop));
      pts.push(`${i === 0 ? "M" : "L"}${(x * 100).toFixed(2)} ${(40 - v * 36).toFixed(2)}`);
    }
    return pts.join(" ");
  };

  const place = useCallback((t) => {
    for (const lane of LANES) {
      const x = travelled(lane.stop, t);
      const car = carRefs.current[lane.key];
      if (car) car.style.left = `${(TRACK_START + x * TRACK_SPAN) * 100}%`;
      // Reveal each speed curve up to where its car has got to.
      const clip = clipRefs.current[lane.key];
      if (clip) clip.setAttribute("width", String(x * 100 + 1));
    }
  }, []);

  useEffect(() => {
    if (reduce) {
      place(RUN_S * 2);
      return;
    }
    if (!inView) return;
    place(0);
    let raf = 0;
    let start = 0;
    const lead = 0.5; // a beat before the brakes go on
    const frame = (now) => {
      if (!start) {
        start = now;
        setFinished(false);
      }
      const t = Math.max(0, (now - start) / 1000 - lead);
      place(t);
      if (t >= RUN_S) {
        setFinished(true);
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, run, place]);

  return (
    <figure ref={wrapRef} className={`sw-panel m-0 flex flex-col ${className}`}>
      <div className="sw-panel-bar">
        <span className="sw-label">Stopping distance</span>
        <span className="sw-label">Projected · MATLAB</span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-5 px-4 py-5 sm:px-6">
        {LANES.map((lane) => (
          <div key={lane.key}>
            <div className="flex items-baseline justify-between">
              <span className="sw-label" style={{ color: lane.tone }}>{lane.label}</span>
              <motion.span
                className="text-[11px] tabular-nums"
                style={{ color: lane.tone }}
                animate={{ opacity: done ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                {lane.stop === 1 ? "100%" : `~${Math.round(lane.stop * 100)}%`}
              </motion.span>
            </div>
            <div className="relative mt-2 h-6">
              <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--sw-border-strong)]" />
              {/* Where the brakes go on, and where this car stops. */}
              <span className="absolute bottom-0 h-2 w-px bg-[var(--sw-gray)]" style={{ left: `${TRACK_START * 100}%` }} />
              <motion.span
                className="absolute bottom-0 h-6 border-l border-dashed"
                style={{ left: `${(TRACK_START + lane.stop * TRACK_SPAN) * 100}%`, borderColor: lane.tone }}
                animate={{ opacity: done ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
              <span
                ref={(el) => { carRefs.current[lane.key] = el; }}
                className="absolute bottom-px -translate-x-full"
                style={{ left: `${TRACK_START * 100}%`, color: lane.tone }}
              >
                <Car />
              </span>
            </div>
          </div>
        ))}

        {/* The gap between the two stops. */}
        <div className="relative h-5">
          <motion.div
            className="absolute top-0 flex h-full items-start"
            style={{ left: `${(TRACK_START + (1 - SHORTER) * TRACK_SPAN) * 100}%`, width: `${SHORTER * TRACK_SPAN * 100}%` }}
            initial={false}
            animate={{ opacity: done ? 1 : 0, scaleX: done ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="h-2 w-full border-x border-b border-[var(--sw-white)]" />
          </motion.div>
          <motion.span
            className="absolute top-2.5 -translate-x-full whitespace-nowrap text-[11px] tabular-nums text-[var(--sw-white)]"
            style={{ left: `${(TRACK_START + TRACK_SPAN) * 100}%` }}
            animate={{ opacity: done ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            ~12% shorter
          </motion.span>
        </div>

        {/* Speed against distance: the shape a constant-deceleration stop
            draws, for both cars. */}
        <div className="mt-1 border-t border-[var(--sw-border)] pt-3">
          <div className="flex items-baseline justify-between">
            <span className="sw-label !text-[9px]">Speed</span>
            <span className="sw-label !text-[9px]">Distance →</span>
          </div>
          <svg viewBox="-2 0 104 42" preserveAspectRatio="none" className="mt-1 h-14 w-full sm:h-16" aria-hidden="true">
            <defs>
              {LANES.map((lane) => (
                <clipPath key={lane.key} id={`${clipId}-${lane.key}`}>
                  <rect ref={(el) => { clipRefs.current[lane.key] = el; }} x="-2" y="-2" width="0" height="46" />
                </clipPath>
              ))}
            </defs>
            <line x1="0" y1="40" x2="100" y2="40" stroke="var(--sw-border-strong)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
            {LANES.map((lane) => (
              <path
                key={lane.key}
                d={curve(lane.stop)}
                clipPath={`url(#${clipId}-${lane.key})`}
                fill="none"
                stroke={lane.tone}
                strokeWidth={lane.key === "hyd" ? 1.6 : 1.1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="border-t border-[var(--sw-border)] px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] text-[var(--sw-gray)] transition-colors hover:text-[var(--sw-white)] sm:px-6"
      >
        Brake again ↻
      </button>
    </figure>
  );
}
