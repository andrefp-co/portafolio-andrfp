"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import { press, pressLink } from "@/utils/data/press";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import { useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Vertical scroll spent per pixel the row travels sideways.
const SCROLL_PER_PX = 0.85;

// One size for every clipping: a portrait sheet, narrower on phones.
const SIZE = "h-[min(480px,58svh)] w-[min(400px,46svh)] max-sm:h-[min(480px,62svh)] max-sm:w-[78vw]";

const two = (n) => String(n).padStart(2, "0");
const day = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// Too short to hold a pinned section (a phone on its side): a plain strip.
const subscribeResize = (onChange) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const isShort = () => window.innerHeight < 600;

// A press clipping set in type, as a newspaper page would carry it: the
// outlet's name as the masthead, the dateline, the headline, the opening
// paragraph, and where to read it.
function Clipping({ item }) {
  const link = pressLink(item);
  const body = (
    <>
      <div className="flex items-end justify-between gap-3 border-b-2 border-[#111] pb-2">
        <span className="font-[family-name:var(--sw-font-display)] text-[30px] leading-none tracking-[0.03em] text-[#111]">{item.outlet}</span>
        <span className="pb-0.5 text-[10px] text-[#6a6a6a]">{item.domain}</span>
      </div>
      <p className="mt-2 border-b border-[#d4d4d4] pb-2 text-[10px] uppercase tracking-[0.14em] text-[#555]">
        {item.kind}
        {item.date ? ` · ${day(item.date)}` : ""}
      </p>
      <h3 className="mt-5 font-[family-name:var(--sw-font-display)] text-[clamp(24px,2.6vw,30px)] leading-[1.04] tracking-[0.015em] text-[#111] [text-wrap:balance]">
        {item.title}
      </h3>
      <p className="mt-4 line-clamp-5 text-[12.5px] leading-[1.7] text-[#444]">{item.text}</p>
      <p className="mt-auto flex items-center justify-between gap-3 border-t border-[#d4d4d4] pt-3 text-[10.5px] uppercase tracking-[0.14em]">
        {link ? (
          <span className="text-[#111] underline decoration-[#111]/30 underline-offset-4 group-hover:decoration-[#111]">
            Read on {link.via ?? item.outlet} ↗
          </span>
        ) : (
          <span className="text-[#777]">Link coming</span>
        )}
      </p>
    </>
  );
  const cls = "group flex h-full flex-col bg-[#fafaf8] p-6 text-[#111] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] sm:p-7";
  return link ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// The same reel the Experience section used: the section holds still while
// the visitor scrolls and the row of clippings travels sideways. The one at
// the centre comes forward; the rest step back.
function PressReel() {
  const trackRef = useRef(null);
  const rowRef = useRef(null);
  const cardRefs = useRef([]);
  const faceRefs = useRef([]);
  const barRef = useRef(null);
  const geo = useRef({ centers: [], travel: 1, vw: 1 });
  const [trackHeight, setTrackHeight] = useState(null);
  const [current, setCurrent] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.6, restDelta: 0.00005 });

  const paint = useCallback((p) => {
    const g = geo.current;
    const x = -p * g.travel;
    if (rowRef.current) rowRef.current.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    let nearest = 0;
    let best = Infinity;
    press.forEach((_, i) => {
      const face = faceRefs.current[i];
      if (!face) return;
      // Distance from the centre of the screen, in screen widths.
      const d = (g.centers[i] + x - g.vw / 2) / g.vw;
      if (Math.abs(d) < best) {
        best = Math.abs(d);
        nearest = i;
      }
      const f = Math.max(0, 1 - Math.abs(d) * 2.2);
      const e = f * f * (3 - 2 * f);
      face.style.transform = `scale(${(0.93 + 0.07 * e).toFixed(4)}) rotate(${((1 - e) * (i % 2 ? 1.2 : -1.2)).toFixed(3)}deg)`;
      face.style.opacity = (0.45 + 0.55 * e).toFixed(3);
    });
    setCurrent((prev) => (prev === nearest ? prev : nearest));
  }, []);

  useMotionValueEvent(smooth, "change", paint);

  // Card positions, how far the row travels (until the last clipping is
  // centred), and the scroll length that takes.
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const centers = press.map((_, i) => {
        const el = cardRefs.current[i];
        return el ? el.offsetLeft + el.offsetWidth / 2 : 0;
      });
      const travel = Math.max(1, (centers[centers.length - 1] ?? 0) - vw / 2);
      geo.current = { centers, travel, vw };
      setTrackHeight(Math.round(travel * SCROLL_PER_PX + window.innerHeight));
      paint(smooth.get());
    };
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [paint, smooth]);

  return (
    <div ref={trackRef} className="relative" style={{ height: trackHeight ?? `${press.length * 60 + 100}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pb-6 pt-20">
        <div className="sw-container w-full">
          <SectionHeading eyebrow="Press" title="In the press." />
        </div>

        <ul
          ref={rowRef}
          // Starts with the first clipping centred.
          className="relative mt-6 flex w-max items-center gap-5 pl-[11vw] will-change-transform sm:mt-8 sm:gap-8 sm:pl-[calc(50vw-min(200px,23svh))]"
        >
          {press.map((item, i) => (
            <li key={item.id} ref={(el) => { cardRefs.current[i] = el; }} className={`${SIZE} shrink-0`}>
              <div ref={(el) => { faceRefs.current[i] = el; }} className="h-full w-full origin-center will-change-transform">
                <Clipping item={item} />
              </div>
            </li>
          ))}
        </ul>

        <div className="sw-container mt-6 w-full sm:mt-8">
          {/* Clear of the back-to-top button on phones. */}
          <div className="flex items-center gap-4 max-sm:pr-14">
            <span className="text-[11px] tabular-nums text-[var(--sw-gray)]">
              {two(current + 1)} / {two(press.length)}
            </span>
            <span className="relative h-px flex-1 bg-[var(--sw-rule)]">
              <span ref={barRef} className="absolute inset-0 origin-left bg-[var(--sw-white)]" style={{ transform: "scaleX(0)" }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Without motion, or on a screen too short to pin: the clippings as a strip
// that swipes sideways.
function PressStrip() {
  return (
    <div className="sw-section !border-t-0">
      <div className="sw-container">
        <SectionHeading eyebrow="Press" title="In the press." />
        <ul className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-10 sm:px-10 [&::-webkit-scrollbar]:hidden">
          {press.map((item) => (
            <li key={item.id} className={`${SIZE} shrink-0 snap-start`}>
              <Clipping item={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Press() {
  const reduce = useReducedMotion();
  const short = useSyncExternalStore(subscribeResize, isShort, () => false);
  if (!press.length) return null;
  return (
    <section id="press" className="relative border-t border-[var(--sw-rule)]">
      {reduce || short ? <PressStrip /> : <PressReel />}
    </section>
  );
}
