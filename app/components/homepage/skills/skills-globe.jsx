"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SiAltiumdesigner, SiAmazonaws, SiAnsys, SiArduino, SiAutodesk, SiC, SiCplusplus, SiCss3,
  SiDassaultsystemes, SiEspressif, SiFirebase, SiGit, SiGo, SiHtml5, SiJavascript, SiJulia,
  SiLinux, SiLtspice, SiMicropython, SiMui, SiMysql, SiNextdotjs, SiPhp, SiPostgresql,
  SiPython, SiReact, SiRuby,
} from "react-icons/si";

// Named imports only, so the bundle carries these icons and not the whole set.
const ICONS = {
  SiAltiumdesigner, SiAmazonaws, SiAnsys, SiArduino, SiAutodesk, SiC, SiCplusplus, SiCss3,
  SiDassaultsystemes, SiEspressif, SiFirebase, SiGit, SiGo, SiHtml5, SiJavascript, SiJulia,
  SiLinux, SiLtspice, SiMicropython, SiMui, SiMysql, SiNextdotjs, SiPhp, SiPostgresql,
  SiPython, SiReact, SiRuby,
};

const AUTO_SPIN = 0.16; // rad/s
const TILT = -0.32;
const MERIDIANS = 12;
const PARALLELS = [-60, -30, 0, 30, 60];

// Evenly spread points on a unit sphere (Fibonacci lattice).
function spherePoints(n) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return [Math.cos(theta) * r, y, Math.sin(theta) * r];
  });
}

function rotate([x, y, z], ay, ax) {
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(ax), sx = Math.sin(ax);
  return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
}

// A wireframe world with every tool on its surface. It turns on its own,
// follows a drag or swipe (with inertia), and highlights a discipline when
// one is selected beside it.
export default function SkillsGlobe({ groups }) {
  const items = useMemo(
    () => groups.flatMap((g) => g.skills.map((s) => ({ ...s, discipline: g.discipline }))),
    [groups]
  );
  const points = useMemo(() => spherePoints(items.length), [items.length]);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef([]);
  const state = useRef({ ay: 0.6, ax: TILT, vy: 0, vx: 0, dragging: false, lastX: 0, lastY: 0, idleAt: 0, targetAy: null });
  const [active, setActive] = useState(null); // discipline filter
  const [hovered, setHovered] = useState(null);
  const reduce = useReducedMotion();
  const inView = useInView(stageRef);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
    // Turn the selected discipline's tools to face the viewer and hold there.
    const s = state.current;
    if (!active) {
      s.targetAy = null;
      return;
    }
    let cx = 0, cz = 0;
    items.forEach((item, i) => {
      if (item.discipline === active) {
        cx += points[i][0];
        cz += points[i][2];
      }
    });
    const goal = -Math.atan2(cx, cz);
    const delta = Math.atan2(Math.sin(goal - s.ay), Math.cos(goal - s.ay));
    s.targetAy = s.ay + delta;
  }, [active, items, points]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    let size = 0;
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = stage.clientWidth;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const frame = (now) => {
      const s = state.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!s.dragging) {
        // Inertia from a fling, decaying back to the slow automatic spin.
        s.ay += s.vy * dt;
        s.ax += s.vx * dt;
        s.vy *= Math.pow(0.04, dt);
        s.vx *= Math.pow(0.04, dt);
        s.ax += (TILT - s.ax) * Math.min(1, dt * 0.8);
        if (s.targetAy !== null) s.ay += (s.targetAy - s.ay) * Math.min(1, dt * (reduce ? 60 : 3.2));
        else if (!reduce && now - s.idleAt > 400) s.ay += AUTO_SPIN * dt;
      }

      const R = size * 0.4;
      const c = size / 2;
      ctx.clearRect(0, 0, size, size);

      // Wireframe: meridians and parallels, brighter on the near side.
      const strokeSegment = (pts) => {
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i];
          const depth = (a[2] + b[2]) / 2;
          ctx.strokeStyle = `rgba(255,255,255,${0.04 + Math.max(0, depth) * 0.16})`;
          ctx.beginPath();
          ctx.moveTo(c + a[0] * R, c + a[1] * R);
          ctx.lineTo(c + b[0] * R, c + b[1] * R);
          ctx.stroke();
        }
      };
      ctx.lineWidth = 1;
      for (let m = 0; m < MERIDIANS; m++) {
        const lon = (m / MERIDIANS) * Math.PI;
        const pts = [];
        for (let k = 0; k <= 48; k++) {
          const lat = (k / 48) * Math.PI * 2;
          pts.push(rotate([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)], s.ay, s.ax));
        }
        strokeSegment(pts);
      }
      for (const latDeg of PARALLELS) {
        const lat = (latDeg * Math.PI) / 180;
        const pts = [];
        for (let k = 0; k <= 64; k++) {
          const lon = (k / 64) * Math.PI * 2;
          pts.push(rotate([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)], s.ay, s.ax));
        }
        strokeSegment(pts);
      }
      // Limb of the sphere.
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.stroke();

      // Tool marks on the surface.
      const filter = activeRef.current;
      points.forEach((p, i) => {
        const el = nodeRefs.current[i];
        if (!el) return;
        const [x, y, z] = rotate(p, s.ay, s.ax);
        const front = (z + 1) / 2; // 0 back, 1 front
        const match = !filter || items[i].discipline === filter;
        const scale = 0.55 + front * 0.6;
        const opacity = match ? 0.12 + front * 0.88 : 0.04 + front * 0.08;
        el.style.transform = `translate3d(${c + x * R}px, ${c + y * R}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(Math.round(front * 100));
        el.style.pointerEvents = z > 0 ? "auto" : "none";
      });

      const easing = s.targetAy !== null && Math.abs(s.targetAy - s.ay) > 0.001;
      if (!reduce || s.dragging || easing || Math.abs(s.vy) > 0.001) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    if (inView) start();
    else frame(performance.now());

    // Dragging (mouse, pen or finger). touch-action: pan-y on the stage keeps
    // vertical swipes scrolling the page on phones.
    const down = (e) => {
      const s = state.current;
      s.dragging = true;
      s.targetAy = null;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.vy = 0;
      s.vx = 0;
      stage.setPointerCapture?.(e.pointerId);
      start();
    };
    const move = (e) => {
      const s = state.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      const k = 3 / Math.max(240, stage.clientWidth);
      s.ay += dx * k;
      s.ax = Math.max(-1.1, Math.min(1.1, s.ax - dy * k));
      s.vy = dx * k * 60;
      s.vx = -dy * k * 60;
    };
    const up = () => {
      const s = state.current;
      s.dragging = false;
      s.idleAt = performance.now();
    };
    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [inView, reduce, points, items, active]);

  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
      <div
        ref={stageRef}
        className="relative mx-auto aspect-square w-full max-w-[560px] cursor-grab select-none active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {items.map((item, i) => {
          const Icon = item.icon ? ICONS[item.icon] : null;
          return (
            <div
              key={item.name}
              ref={(el) => { nodeRefs.current[i] = el; }}
              className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center text-white will-change-transform sm:h-14 sm:w-14"
              onPointerEnter={() => setHovered(item)}
              onPointerLeave={() => setHovered((h) => (h === item ? null : h))}
            >
              {Icon ? (
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <span className="text-[11px] font-medium tracking-[0.08em]">{item.mark}</span>
              )}
              {active === item.discipline && item.name !== item.mark && (
                <span className="absolute top-full mt-0.5 whitespace-nowrap text-[9px] uppercase tracking-[0.16em] text-white">
                  {item.name}
                </span>
              )}
            </div>
          );
        })}
        <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--sw-dim)]">
          {hovered ? `${hovered.name} · ${hovered.discipline}` : "Drag to spin the globe"}
        </p>
      </div>

      <div className="min-w-0">
        <ul className="border-t border-[var(--sw-rule)]">
          {groups.map((group) => {
            const isActive = active === group.discipline;
            return (
              <li key={group.discipline} className="border-b border-[var(--sw-rule)]">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(isActive ? null : group.discipline)}
                  className={`flex w-full items-center justify-between gap-4 py-4 text-left transition-colors ${isActive ? "text-[var(--sw-white)]" : "text-[var(--sw-silver)] hover:text-[var(--sw-white)]"}`}
                >
                  <span className="font-[family-name:var(--sw-font-display)] text-[26px] leading-none tracking-[0.02em]">
                    {group.discipline}
                  </span>
                  <span className="text-[11px] tabular-nums text-[var(--sw-gray)]">{String(group.skills.length).padStart(2, "0")}</span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <ul className="flex flex-wrap gap-2 overflow-hidden" aria-label={`${group.discipline} tools`}>
                    {group.skills.map((skill) => (
                      <li key={skill.name} className="sw-tag mb-4">{skill.name}</li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-[var(--sw-gray)]">Select a discipline to light up its tools on the globe.</p>
      </div>
    </div>
  );
}
