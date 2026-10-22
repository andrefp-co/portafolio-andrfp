"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// A plan-position radar scope drawn on canvas: range rings, bearing ticks, a
// sweep with a fading trail, and contacts that flare as the sweep crosses
// them. Tap or click the scope to drop a ping with its bearing and range.
//
// mode: "scan" (default), "lock" (sweep speeds up and a reticle closes on
// TRK 01) or "denied" (the scope flushes red for a moment).

const PHOSPHOR = "125, 148, 126"; // --sw-ok-text
const DANGER = "202, 120, 117"; // --sw-danger-text
const TURN_S = 4;
const TRAIL = 1.1; // radians of afterglow behind the sweep
const CONTACTS = [
  { id: "TRK 01", r: 0.58, b: 38, drift: 0.5 },
  { id: "TRK 02", r: 0.34, b: 141, drift: -0.8 },
  { id: "TRK 03", r: 0.82, b: 228, drift: 0.3 },
  { id: "TRK 04", r: 0.47, b: 304, drift: -0.4 },
];

const TAU = Math.PI * 2;
const rad = (deg) => (deg * Math.PI) / 180;

export default function Radar({ mode = "scan", className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const modeRef = useRef({ mode, since: 0 });
  const pingsRef = useRef([]);
  const redrawRef = useRef(() => {});
  const reduce = useReducedMotion();

  useEffect(() => {
    modeRef.current = { mode, since: performance.now() };
    redrawRef.current();
  }, [mode]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const font = getComputedStyle(document.body).fontFamily;
    let size = 0;
    let frame = 0;
    let sweep = rad(20);
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = wrap.clientWidth;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      const { mode: m, since } = modeRef.current;
      const denied = m === "denied" && now - since < 900;
      const tone = denied ? DANGER : PHOSPHOR;
      if (size < 80) return;
      const c = size / 2;
      const small = size < 320;
      const R = c - (small ? 18 : 28);
      const at = (r, a) => [c + r * Math.sin(a), c - r * Math.cos(a)];

      ctx.clearRect(0, 0, size, size);

      // Scope face.
      ctx.beginPath();
      ctx.arc(c, c, R, 0, TAU);
      ctx.fillStyle = `rgba(${tone}, ${denied ? 0.1 : 0.035})`;
      ctx.fill();

      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(c, c, (R * i) / 4, 0, TAU);
        ctx.strokeStyle = `rgba(${tone}, ${i === 4 ? 0.55 : 0.18})`;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(c - R, c);
      ctx.lineTo(c + R, c);
      ctx.moveTo(c, c - R);
      ctx.lineTo(c, c + R);
      ctx.strokeStyle = `rgba(${tone}, 0.14)`;
      ctx.stroke();

      // Bearing ticks every 5 degrees, labels every 30 (every 90 when small).
      ctx.font = `${small ? 8 : 9}px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let d = 0; d < 360; d += 5) {
        const a = rad(d);
        const len = d % 30 === 0 ? 8 : d % 10 === 0 ? 5 : 3;
        const [x1, y1] = at(R, a);
        const [x2, y2] = at(R + len, a);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${tone}, ${d % 30 === 0 ? 0.6 : 0.3})`;
        ctx.stroke();
        if (d % (small ? 90 : 30) === 0) {
          const [lx, ly] = at(R + (small ? 12 : 18), a);
          ctx.fillStyle = `rgba(${tone}, 0.7)`;
          ctx.fillText(String(d).padStart(3, "0"), lx, ly);
        }
      }

      // Sweep afterglow, then the beam.
      const slices = 36;
      for (let i = 0; i < slices; i++) {
        const a0 = sweep - (TRAIL * (i + 1)) / slices;
        const a1 = sweep - (TRAIL * i) / slices;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, R, a0 - Math.PI / 2, a1 - Math.PI / 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(${tone}, ${0.2 * (1 - i / slices) ** 2})`;
        ctx.fill();
      }
      const [bx, by] = at(R, sweep);
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = `rgba(${tone}, 0.95)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineWidth = 1;

      // Contacts flare as the beam crosses them and fade over the turn.
      const lockAge = m === "lock" ? Math.min(1, (now - since) / 1400) : 0;
      CONTACTS.forEach((k, idx) => {
        const a = rad(k.b + (reduce ? 0 : (now / 1000) * k.drift));
        const behind = (((sweep - a) % TAU) + TAU) % TAU;
        let glow = reduce ? 0.8 : Math.exp(-behind / 2.4);
        if (m === "lock" && idx === 0) glow = 1;
        const [x, y] = at(R * k.r, a);
        ctx.beginPath();
        ctx.arc(x, y, small ? 2.2 : 2.8, 0, TAU);
        ctx.fillStyle = `rgba(${tone}, ${0.15 + 0.85 * glow})`;
        ctx.fill();
        if (glow > 0.25) {
          ctx.beginPath();
          ctx.arc(x, y, (small ? 5 : 7) + (1 - glow) * 6, 0, TAU);
          ctx.strokeStyle = `rgba(${tone}, ${0.35 * glow})`;
          ctx.stroke();
        }
        if (!small || idx === 0) {
          ctx.textAlign = "left";
          ctx.fillStyle = `rgba(${tone}, ${0.25 + 0.6 * glow})`;
          ctx.fillText(k.id, x + 9, y - 9);
          ctx.textAlign = "center";
        }

        // Lock reticle: four corner brackets closing on the first track.
        if (m === "lock" && idx === 0) {
          const s = 30 - 18 * (1 - (1 - lockAge) ** 3);
          const arm = 5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + 0.5 * lockAge})`;
          ctx.beginPath();
          [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
            ctx.moveTo(x + sx * s, y + sy * (s - arm));
            ctx.lineTo(x + sx * s, y + sy * s);
            ctx.lineTo(x + sx * (s - arm), y + sy * s);
          });
          ctx.stroke();
        }
      });

      // Pings dropped by the visitor.
      pingsRef.current = pingsRef.current.filter((p) => now - p.t < 2600);
      pingsRef.current.forEach((p) => {
        const age = (now - p.t) / 2600;
        const x = c + p.dx * R;
        const y = c + p.dy * R;
        ctx.beginPath();
        ctx.arc(x, y, 4 + age * 34, 0, TAU);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 * (1 - age)})`;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - age})`;
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * (1 - age)})`;
        ctx.fillText(p.label, x + 10, y + 12);
        ctx.textAlign = "center";
      });

      // Origin mark.
      ctx.beginPath();
      ctx.moveTo(c - 4, c);
      ctx.lineTo(c + 4, c);
      ctx.moveTo(c, c - 4);
      ctx.lineTo(c, c + 4);
      ctx.strokeStyle = `rgba(${tone}, 0.9)`;
      ctx.stroke();
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const speed = modeRef.current.mode === "lock" ? 2.6 : 1;
      sweep = (sweep + (TAU / TURN_S) * speed * dt) % TAU;
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    redrawRef.current = () => {
      if (reduce) draw(performance.now());
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(wrap);

    if (reduce) draw(performance.now());
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [reduce]);

  const ping = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width < 80) return;
    const c = rect.width / 2;
    const R = c - (rect.width < 320 ? 18 : 28);
    const dx = (e.clientX - rect.left - c) / R;
    const dy = (e.clientY - rect.top - c) / R;
    const range = Math.hypot(dx, dy);
    if (range > 1) return;
    const bearing = (Math.round((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360;
    pingsRef.current.push({
      dx,
      dy,
      t: performance.now(),
      label: `BRG ${String(bearing).padStart(3, "0")} RNG ${range.toFixed(2)}`,
    });
    redrawRef.current();
  };

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-square w-full select-none ${className}`}
      onPointerDown={ping}
      role="img"
      aria-label="Radar display. Tap the scope to drop a ping."
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}
