"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import { LAND_ROWS } from "@/utils/data/land-dots";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SiAltiumdesigner, SiArduino, SiC, SiCplusplus, SiDassaultsystemes, SiDocker, SiEasyeda,
  SiEspressif, SiGit, SiJavascript, SiKicad, SiLinux, SiLtspice, SiMicropython, SiNextdotjs,
  SiPytest, SiPython, SiRaspberrypi, SiReact, SiStmicroelectronics,
} from "react-icons/si";

// Named imports only, so the bundle carries these icons and not the whole set.
const ICONS = {
  SiAltiumdesigner, SiArduino, SiC, SiCplusplus, SiDassaultsystemes, SiDocker, SiEasyeda,
  SiEspressif, SiGit, SiJavascript, SiKicad, SiLinux, SiLtspice, SiMicropython, SiNextdotjs,
  SiPytest, SiPython, SiRaspberrypi, SiReact, SiStmicroelectronics,
};

const EASE = [0.22, 1, 0.36, 1];
const TILT = -0.32;
const DEG = Math.PI / 180;

// Land as dots: each row of LAND_ROWS is a hex mask over an even ring of
// dots at one latitude.
function landDots() {
  const dots = [];
  for (const [lat, n, hex] of LAND_ROWS) {
    const bits = [...hex].map((h) => parseInt(h, 16).toString(2).padStart(4, "0")).join("");
    for (let k = 0; k < n; k++) {
      if (bits[k] !== "1") continue;
      const lon = -180 + ((k + 0.5) * 360) / n;
      dots.push(toXYZ(lat, lon));
    }
  }
  return dots;
}

function toXYZ(lat, lon) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return [Math.cos(la) * Math.sin(lo), -Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function rotate([x, y, z], ay, ax) {
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(ax), sx = Math.sin(ax);
  return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
}

// Each discipline gets its own region of the globe, so turning to face one
// brings all of its tools into view together.
function placeTools(groups) {
  const items = [];
  groups.forEach((g, gi) => {
    const lon0 = (gi * 360) / groups.length;
    const lat0 = gi % 2 ? -14 : 16;
    g.skills.forEach((s, si) => {
      // A small sunflower spiral around the region's centre.
      const r = 9 + 25 * Math.sqrt((si + 0.5) / g.skills.length);
      const a = si * 2.399963;
      items.push({
        ...s,
        discipline: g.discipline,
        group: gi,
        p: toXYZ(lat0 + r * Math.sin(a), lon0 + (r * Math.cos(a)) / Math.cos(lat0 * DEG)),
      });
    });
  });
  return items;
}

// The rotation that brings a region's centre to face the viewer.
const facing = (gi, n) => -((gi * 360) / n) * DEG;

// "Tools I work with": a dotted Earth with every tool on its surface. The
// section pins while it is read; scrolling turns the globe to each discipline
// in turn (with a little drift inside each step) and the list follows. A drag
// or swipe spins it by hand, with inertia, and it settles back afterwards.
export default function SkillsGlobe({ groups }) {
  const items = useMemo(() => placeTools(groups), [groups]);
  const dots = useMemo(() => landDots(), []);
  const n = groups.length;

  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef([]);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? null : 0);
  const [hovered, setHovered] = useState(null);

  // Progress through the pinned track, and how far the section has come in.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const { scrollYProgress: entry } = useScroll({ target: trackRef, offset: ["start end", "start start"] });
  const motionRef = useRef({ ay: facing(0, n), ax: TILT, vy: 0, vx: 0, dragging: false, lastX: 0, lastY: 0, drift: 0 });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduce) return;
    const f = Math.min(n - 0.001, Math.max(0, p * n));
    const i = Math.floor(f);
    motionRef.current.drift = (f - i - 0.5) * 0.7;
    setStep((s) => (s === i ? s : i));
  });

  const active = step === null ? null : groups[step]?.discipline ?? null;
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = step;
  }, [step]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    const s = motionRef.current;
    let size = 0;
    let raf = 0;
    let last = performance.now();
    let visible = true;

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
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(stage);

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const stepNow = activeRef.current;

      if (!s.dragging) {
        // Inertia from a fling, then ease to the current discipline (plus
        // the scroll drift), or a slow spin when nothing is selected.
        s.ay += s.vy * dt;
        s.ax += s.vx * dt;
        s.vy *= Math.pow(0.04, dt);
        s.vx *= Math.pow(0.04, dt);
        s.ax += (TILT - s.ax) * Math.min(1, dt * 1.2);
        if (stepNow !== null) {
          const goal = facing(stepNow, n) + (reduce ? 0 : s.drift);
          const delta = Math.atan2(Math.sin(goal - s.ay), Math.cos(goal - s.ay));
          s.ay += delta * Math.min(1, dt * (reduce ? 60 : 3));
        } else if (!reduce) {
          s.ay += 0.14 * dt;
        }
      }

      // The globe gathers itself as the section scrolls in.
      const come = reduce ? 1 : Math.min(1, Math.max(0, (entry.get() - 0.25) / 0.6));
      const ease = 1 - Math.pow(1 - come, 3);
      const R = size * 0.42 * (0.7 + 0.3 * ease);
      const c = size / 2;
      ctx.clearRect(0, 0, size, size);

      // Atmosphere and limb.
      const glow = ctx.createRadialGradient(c, c, R * 0.6, c, c, R * 1.18);
      glow.addColorStop(0, "rgba(255,255,255,0)");
      glow.addColorStop(0.85, `rgba(255,255,255,${0.05 * ease})`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = `rgba(255,255,255,${0.2 * ease})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.stroke();

      // Land, as dots: brighter toward the viewer, faint on the far side.
      const dotR = Math.max(0.8, size / 520);
      for (let i = 0; i < dots.length; i++) {
        const [x, y, z] = rotate(dots[i], s.ay, s.ax);
        // Dots scatter in from further out while the globe gathers.
        const k = 1 + (1 - ease) * (0.6 + (i % 7) * 0.12);
        const a = z > 0 ? 0.18 + z * 0.62 : 0.05 + (1 + z) * 0.05;
        ctx.fillStyle = `rgba(255,255,255,${(a * ease).toFixed(3)})`;
        ctx.fillRect(c + x * R * k - dotR, c + y * R * k - dotR, dotR * 2, dotR * 2);
      }

      // Tool marks on the surface.
      items.forEach((item, i) => {
        const el = nodeRefs.current[i];
        if (!el) return;
        const [x, y, z] = rotate(item.p, s.ay, s.ax);
        const front = (z + 1) / 2;
        const match = stepNow === null || item.group === stepNow;
        const scale = (0.55 + front * 0.6) * (match && stepNow !== null ? 1.08 : 1);
        const opacity = (match ? 0.1 + front * 0.9 : 0.03 + front * 0.12) * ease;
        el.style.transform = `translate3d(${c + x * R}px, ${c + y * R}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(Math.round(front * 100));
        el.style.pointerEvents = z > 0.1 ? "auto" : "none";
      });

      if (visible) raf = requestAnimationFrame(frame);
    };

    function start() {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    start();

    // Dragging (mouse, pen or finger). touch-action: pan-y on the stage keeps
    // vertical swipes scrolling the page on phones.
    const down = (e) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.vy = 0;
      s.vx = 0;
      stage.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
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
      s.dragging = false;
    };
    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [items, dots, n, reduce, entry]);

  // Choosing a discipline scrolls to its step, so the page and the globe
  // never disagree. Without motion it simply selects it.
  const choose = (i) => {
    if (reduce) {
      setStep((s) => (s === i ? null : i));
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * travel, behavior: "smooth" });
  };

  const current = step === null ? null : groups[step];

  return (
    <div
      ref={trackRef}
      // Room to scroll through every discipline while the stage is pinned.
      // Screens too short to hold the pinned stage scroll it like any section.
      className={reduce ? "relative" : "relative h-[var(--track)] [@media(max-height:600px)]:h-auto"}
      style={{ "--track": `${n * 70 + 100}svh` }}
    >
      <div
        className={`${reduce ? "py-20" : "sticky top-0 h-svh py-6 [@media(max-height:600px)]:static [@media(max-height:600px)]:h-auto [@media(max-height:600px)]:py-20"} flex flex-col justify-center overflow-hidden lg:py-10`}
      >
        <div className="sw-container w-full">
          <SectionHeading eyebrow="Skills" title="Tools I work with." />

          <div className="mt-4 grid grid-cols-1 items-center gap-6 lg:mt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <div
              ref={stageRef}
              className="relative mx-auto aspect-square w-full max-w-[min(560px,40svh)] cursor-grab select-none active:cursor-grabbing lg:max-w-[min(560px,64svh)]"
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
                    className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center text-white opacity-0 will-change-transform sm:h-14 sm:w-14"
                    onPointerEnter={() => setHovered(item)}
                    onPointerLeave={() => setHovered((h) => (h === item ? null : h))}
                  >
                    {Icon ? (
                      <Icon className="h-5 w-5 drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] sm:h-7 sm:w-7" />
                    ) : (
                      <span className="text-[10px] font-medium tracking-[0.08em] [text-shadow:0_0_6px_#000] sm:text-[11px]">{item.mark}</span>
                    )}
                  </div>
                );
              })}
              <p className="pointer-events-none absolute inset-x-0 bottom-0 hidden text-center text-[10px] uppercase tracking-[0.2em] text-[var(--sw-dim)] sm:block">
                {hovered ? `${hovered.name} · ${hovered.discipline}` : "Drag to spin the globe"}
              </p>
            </div>

            <div className="min-w-0">
              {/* Step index: which discipline the globe is showing. */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] tabular-nums text-[var(--sw-gray)]">
                  {String((step ?? 0) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
                <span className="relative h-px flex-1 bg-[var(--sw-rule)]">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-[var(--sw-white)]"
                    animate={{ width: `${(((step ?? -1) + 1) / n) * 100}%` }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </span>
              </div>

              <ul className="mt-3 border-t border-[var(--sw-rule)]">
                {groups.map((group, i) => {
                  const isActive = step === i;
                  return (
                    <li key={group.discipline} className="border-b border-[var(--sw-rule)]">
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => choose(i)}
                        className={`flex w-full items-center justify-between gap-4 py-2 text-left transition-colors lg:py-3.5 ${isActive ? "text-[var(--sw-white)]" : "text-[var(--sw-gray)] hover:text-[var(--sw-white)]"}`}
                      >
                        <span className="font-[family-name:var(--sw-font-display)] text-[20px] leading-none tracking-[0.02em] lg:text-[26px]">
                          {group.discipline}
                        </span>
                        <span className="text-[11px] tabular-nums">{String(group.skills.length).padStart(2, "0")}</span>
                      </button>
                      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <ul className="flex flex-wrap gap-1.5 overflow-hidden" aria-label={`${group.discipline} tools`}>
                          {group.skills.map((skill) => (
                            <li key={skill.name} className="sw-tag mb-3">{skill.name}</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {!current && <p className="mt-4 text-xs text-[var(--sw-gray)]">Select a discipline to turn the globe to its tools.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
