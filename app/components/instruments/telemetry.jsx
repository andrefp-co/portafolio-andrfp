"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// A simulated attitude readout: three channels scrolling like a ground-station
// plot. Signals are deterministic sums of sines plus hashed noise at a 200 Hz
// sample clock, so the trace never shimmers between frames. Labelled "SIM" on
// screen: it is decoration in the subject's own vernacular, not flight data.
//
// It is also interactive. A tap or click injects a disturbance that rings and
// decays the way a closed loop rejects a gust; dragging across the plot reads
// every channel at that instant.
const WINDOW_S = 6;
const SAMPLE_HZ = 200;
const RANGE_DEG = 12;
const BOOT_MS = 1200;
const RING_HZ = 2.4;
const DECAY_S = 0.55;

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
    kick: 7,
    fn: (t, k) => 6 * Math.sin(0.9 * t) + 2.2 * Math.sin(2.7 * t + 1) + 0.6 * Math.sin(9.1 * t) + 0.25 * noise(k),
  },
  {
    key: "pitch",
    label: "Pitch",
    unit: "°",
    stroke: "#bfc2c5",
    width: 1,
    dash: [],
    kick: -4.5,
    fn: (t, k) => 3.5 * Math.sin(0.6 * t + 2) + 1.4 * Math.sin(3.3 * t) + 0.4 * Math.sin(11 * t + 0.5) + 0.2 * noise(k + 7),
  },
  {
    key: "yaw",
    label: "Yaw rate",
    unit: "°/s",
    stroke: "#8d9297",
    width: 1,
    dash: [4, 4],
    kick: 3,
    fn: (t, k) => 4 * Math.sin(0.35 * t + 0.3) + 0.8 * Math.sin(5.1 * t) + 0.15 * noise(k + 13),
  },
];

const fmt = (v) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;

export default function Telemetry() {
  const wrapRef = useRef(null);
  const plotRef = useRef(null);
  const canvasRef = useRef(null);
  const readoutRefs = useRef({});
  const bootStartRef = useRef(0);
  const impulsesRef = useRef([]);
  const scrubRef = useRef(null);
  const redrawRef = useRef(() => {});
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef);

  // Value of one channel at time ts, including any disturbances still ringing.
  const sample = (ch, index, ts) => {
    let v = ch.fn(ts, Math.floor(ts * SAMPLE_HZ));
    for (const imp of impulsesRef.current) {
      const dt = ts - imp.t0;
      if (dt >= 0) v += ch.kick * imp.gain * Math.exp(-dt / DECAY_S) * Math.sin(2 * Math.PI * RING_HZ * dt + index);
    }
    return v;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let looping = false;
    let draw = () => {};

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Setting a canvas's size clears it; a still frame has no loop to redraw.
      if (!looping) draw(performance.now());
    };

    // The boot reveal plays once per page view, not each time the hero
    // scrolls back into view and this effect restarts.
    if (!bootStartRef.current) bootStartRef.current = performance.now();
    const start = bootStartRef.current;
    let lastReadout = 0;
    let raf = 0;

    draw = (now) => {
      const t = now / 1000;
      const boot = reduce ? 1 : Math.min(1, (now - start) / BOOT_MS);
      const yOf = (v) => height / 2 - (v / RANGE_DEG) * (height / 2);
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

      // Disturbance markers scroll with the data.
      impulsesRef.current = impulsesRef.current.filter((imp) => t - imp.t0 < WINDOW_S + 1);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "9px ui-monospace, monospace";
      for (const imp of impulsesRef.current) {
        const x = width - ((t - imp.t0) / WINDOW_S) * width;
        ctx.fillRect(Math.round(x), 0, 1, height);
        ctx.fillText("Δ", Math.round(x) + 4, 12);
      }

      // Traces, revealed left to right during boot.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width * boot, height);
      ctx.clip();
      const points = Math.max(60, Math.floor(width / 2));
      CHANNELS.forEach((ch, index) => {
        ctx.strokeStyle = ch.stroke;
        ctx.lineWidth = ch.width;
        ctx.setLineDash(ch.dash);
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          const ts = t - WINDOW_S + (i / points) * WINDOW_S;
          const y = yOf(sample(ch, index, ts));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.restore();
      ctx.setLineDash([]);

      // Live edge, or the scrub crosshair while a pointer reads the plot.
      const scrub = scrubRef.current;
      const readT = scrub === null ? t : t - WINDOW_S + scrub * WINDOW_S;
      if (scrub !== null) {
        const x = scrub * width;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(Math.round(x), 0, 1, height);
        CHANNELS.forEach((ch, index) => {
          ctx.fillStyle = ch.stroke;
          ctx.fillRect(Math.round(x) - 3, Math.round(yOf(sample(ch, index, readT))) - 3, 6, 6);
        });
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        const label = `T−${((1 - scrub) * WINDOW_S).toFixed(1)}S`;
        ctx.fillText(label, Math.min(width - 48, Math.round(x) + 6), height - 22);
      } else if (boot >= 1) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillRect(width - 2, 0, 2, height);
      }

      if (now - lastReadout > 90 || scrub !== null || !looping) {
        lastReadout = now;
        CHANNELS.forEach((ch, index) => {
          const el = readoutRefs.current[ch.key];
          if (el) el.textContent = fmt(sample(ch, index, readT));
        });
      }
    };

    redrawRef.current = () => {
      if (!looping) draw(performance.now());
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (!reduce && inView) {
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

  const disturb = () => {
    const t = performance.now() / 1000;
    impulsesRef.current = [...impulsesRef.current, { t0: t, gain: 0.7 + Math.random() * 0.6 }].slice(-6);
    redrawRef.current();
  };

  const scrubTo = (e) => {
    const rect = plotRef.current.getBoundingClientRect();
    scrubRef.current = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    redrawRef.current();
  };

  const endScrub = () => {
    scrubRef.current = null;
    redrawRef.current();
  };

  return (
    <motion.figure
      ref={wrapRef}
      className="sw-panel m-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="sw-panel-bar">
        <span className="sw-label">Attitude telemetry</span>
        <span className="sw-label">SIM · 200 Hz</span>
      </div>
      <div
        ref={plotRef}
        className="relative h-[180px] sm:h-[200px]"
        style={{ touchAction: "pan-y" }}
        onPointerMove={scrubTo}
        onPointerLeave={endScrub}
        onPointerCancel={endScrub}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <span className="sw-label pointer-events-none absolute left-3 top-2 !text-[9px]">+{RANGE_DEG}°</span>
        <span className="sw-label pointer-events-none absolute bottom-2 left-3 !text-[9px]">−{RANGE_DEG}°</span>
        <span className="sw-label pointer-events-none absolute right-3 top-2 !text-[9px]">Tap to disturb</span>
        <button
          type="button"
          onClick={disturb}
          className="absolute inset-0 cursor-crosshair"
          aria-label="Inject a disturbance into the simulated telemetry"
        />
      </div>
      <figcaption className="grid grid-cols-3 border-t border-[var(--sw-border)]">
        {CHANNELS.map((ch) => (
          <div key={ch.key} className="min-w-0 border-r border-[var(--sw-border)] px-3 py-3 last:border-r-0 sm:px-4">
            <span className="sw-label flex items-center gap-1.5 whitespace-nowrap">
              <svg width="12" height="2" aria-hidden="true" className="shrink-0">
                <line x1="0" y1="1" x2="12" y2="1" stroke={ch.stroke} strokeWidth="2" strokeDasharray={ch.dash.join(" ")} />
              </svg>
              {ch.label}
            </span>
            <p className="mt-1 whitespace-nowrap text-[13px] tabular-nums text-white sm:text-sm">
              <span ref={(el) => { readoutRefs.current[ch.key] = el; }}>{fmt(0)}</span>
              <span className="text-[var(--sw-gray)]"> {ch.unit}</span>
            </p>
          </div>
        ))}
      </figcaption>
    </motion.figure>
  );
}
