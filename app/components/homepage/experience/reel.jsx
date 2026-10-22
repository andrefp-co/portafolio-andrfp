"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import Telemetry from "@/app/components/instruments/telemetry";
import { openMail } from "@/utils/obfuscate";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Vertical scroll spent per pixel the reel travels sideways.
const SCROLL_PER_PX = 0.85;

// Card sizes: one height, a square tile and a wider text card. Phones get
// taller, narrower tiles.
const TALL = "h-[min(440px,52svh)] max-sm:h-[min(500px,60svh)]";
const SQUARE = "w-[min(440px,52svh)] max-sm:w-[78vw]";
const WIDE = "w-[min(600px,72svh)] max-sm:w-[86vw]";

const two = (n) => String(n).padStart(2, "0");

// The roles as one row of cards: for each, a title card, its instrument or
// photos, a coin of the tools it runs on, what the work was (two lines per
// card), and for SWORT the partner door to the restricted file.
function buildCards(items) {
  const cards = [];
  items.forEach((exp, role) => {
    cards.push({ key: `${exp.id}-intro`, type: "intro", role, exp });
    if (exp.instrument === "telemetry") cards.push({ key: `${exp.id}-telemetry`, type: "telemetry", role, exp, zoom: true });
    if (exp.images?.length) cards.push({ key: `${exp.id}-photos`, type: "photos", role, exp });
    if (exp.coin?.length) cards.push({ key: `${exp.id}-coin`, type: "coin", role, exp });
    const parts = [];
    for (let i = 0; i < (exp.desc?.length ?? 0); i += 2) parts.push(exp.desc.slice(i, i + 2));
    parts.forEach((lines, part) =>
      cards.push({ key: `${exp.id}-text-${part}`, type: "text", role, exp, lines, part, parts: parts.length, wide: true })
    );
    if (exp.partnerAccess) cards.push({ key: `${exp.id}-partner`, type: "partner", role, exp });
  });
  return cards;
}

function IntroCard({ exp, role, count }) {
  return (
    <div className="flex h-full flex-col justify-between border border-[var(--sw-border)] bg-[#0b0b0b] p-6 sm:p-8">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[var(--sw-gray)]">
        <span className="tabular-nums">
          {two(role + 1)} / {two(count)}
        </span>
        <span>{exp.duration}</span>
      </div>
      <div>
        <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(38px,4.4vw,56px)] leading-[0.94] tracking-[0.02em] text-white [text-wrap:balance]">
          {exp.title}
        </h3>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--sw-silver)]">{exp.company}</p>
      </div>
    </div>
  );
}

function TelemetryCard() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 border border-[var(--sw-border)] bg-[#0b0b0b] p-4 sm:p-6">
      <Telemetry />
      <p className="text-[11px] leading-relaxed text-[var(--sw-gray)]">Attitude telemetry as a ground station reads it. Simulated: tap the plot to throw a gust at it.</p>
    </div>
  );
}

// Photos behind a window: a strip of images slides inside the card as it
// travels, so one picture wipes into the next.
function PhotosCard({ exp, stripRef }) {
  const n = exp.images.length;
  return (
    <div className="relative h-full overflow-hidden border border-[var(--sw-border)] bg-black">
      <div ref={stripRef} className="flex h-full will-change-transform" style={{ width: `${n * 100}%` }}>
        {exp.images.map((img) => (
          <div key={img.src} className="relative h-full" style={{ width: `${100 / n}%` }}>
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 80vw, 440px" className="object-cover" />
          </div>
        ))}
      </div>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-4 pt-12 text-[11px] uppercase tracking-[0.16em] text-white/85">
        {exp.short}
      </span>
    </div>
  );
}

// A coin that flips as the reel moves, a different tool on each face.
function CoinCard({ exp, coinRef, labelRef }) {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden border border-black/10 bg-[linear-gradient(160deg,#f4f4f4,#cdcecf)] p-6 text-[#111] sm:p-8">
      <span className="text-[11px] uppercase tracking-[0.18em] text-[#555]">Works in</span>
      <div className="flex flex-1 items-center justify-center [perspective:900px]">
        <div ref={coinRef} className="relative aspect-square w-[62%] [transform-style:preserve-3d]">
          {/* Stacked rims give the coin an edge when it turns. */}
          {[-5, -3, -1, 1, 3].map((z) => (
            <span key={z} className="absolute inset-0 rounded-full border-[3px] border-[#8f9093]" style={{ transform: `translateZ(${z}px)` }} />
          ))}
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#e6e7e8_58%,#c5c6c8)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)]"
            style={{ transform: "translateZ(5px)" }}
          >
            <span ref={labelRef} className="font-[family-name:var(--sw-font-display)] text-[clamp(30px,3.6vw,46px)] tracking-[0.02em]">
              {exp.coin[0]}
            </span>
          </span>
        </div>
      </div>
      <span className="text-[11px] uppercase tracking-[0.16em] text-[#555]">{exp.coin.join(" · ")}</span>
    </div>
  );
}

function TextCard({ card }) {
  const { exp, lines, part, parts } = card;
  const last = part === parts - 1;
  return (
    <div className="flex h-full flex-col overflow-y-auto border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 sm:p-8">
      <p className="sw-label">
        {exp.company}
        {parts > 1 ? ` · ${part + 1} of ${parts}` : ""}
      </p>
      <ul className="mt-5 flex flex-col gap-4">
        {lines.map((line) => (
          <li key={line} className="border-t border-[var(--sw-rule)] pt-4 text-[13.5px] leading-[1.75] text-[var(--sw-silver)]">
            {line}
          </li>
        ))}
      </ul>
      {last && exp.link && (
        <div className="mt-auto pt-6">
          <a href={exp.link} target="_blank" rel="noopener noreferrer" className="sw-link">
            Learn more <span className="sw-link-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </div>
  );
}

function PartnerCard() {
  return (
    <div className="flex h-full flex-col justify-between bg-white p-6 text-black sm:p-8">
      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
        For companies and partners
      </span>
      <div>
        <p className="font-[family-name:var(--sw-font-display)] text-[clamp(30px,3.2vw,40px)] leading-[0.96] tracking-[0.02em]">
          Want to know more about SWORT&apos;s programs?
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-[#444]">
          With an access code, open the restricted file: program status, readiness, open gaps and the hardware itself.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href="/vault" className="border border-black bg-black px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-black">
          I have an access code
        </Link>
        <button type="button" onClick={() => openMail("Access code request")} className="min-h-[40px] text-[11px] uppercase tracking-[0.14em] underline underline-offset-4">
          Request one
        </button>
      </div>
    </div>
  );
}

// "Engineering roles" as a pinned reel. The section holds still while the
// visitor scrolls; the row of cards travels sideways. The card at the centre
// comes into focus (full size, sharp, in colour) while the rest recede, the
// SWORT telemetry zooms forward, photo windows wipe from one picture to the
// next, and each role's coin flips through its tools.
export default function ExperienceReel({ items }) {
  const cards = useMemo(() => buildCards(items), [items]);
  const trackRef = useRef(null);
  const rowRef = useRef(null);
  const cardRefs = useRef([]);
  const faceRefs = useRef([]);
  const stripRefs = useRef({});
  const coinRefs = useRef({});
  const labelRefs = useRef({});
  const geo = useRef({ centers: [], travel: 1, vw: 1, blur: false });
  const [trackHeight, setTrackHeight] = useState(null);
  const [role, setRole] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.6, restDelta: 0.00005 });

  const paint = useCallback(
    (p) => {
      const g = geo.current;
      const x = -p * g.travel;
      if (rowRef.current) rowRef.current.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const face = faceRefs.current[i];
        if (!face) return;
        // Distance from the centre of the screen, in screen widths.
        const d = (g.centers[i] + x - g.vw / 2) / g.vw;
        if (Math.abs(d) < best) {
          best = Math.abs(d);
          nearest = i;
        }
        const f = Math.max(0, 1 - Math.abs(d) * 2.4);
        const e = f * f * (3 - 2 * f);
        const scale = card.zoom ? 0.88 + 0.2 * e : 0.92 + 0.08 * e;
        face.style.transform = `scale(${scale.toFixed(4)})`;
        face.style.opacity = (0.42 + 0.58 * e).toFixed(3);
        if (g.blur) face.style.filter = `blur(${((1 - e) * 2).toFixed(2)}px)`;

        if (card.type === "photos") {
          const strip = stripRefs.current[card.key];
          const n = card.exp.images.length;
          // Coming in from the right it wipes through every photo, landing
          // on the last one as it reaches the centre.
          const t = Math.min(1, Math.max(0, (0.45 - d) / 0.45));
          if (strip) {
            strip.style.transform = `translate3d(${((-t * (n - 1) * 100) / n).toFixed(3)}%,0,0)`;
            strip.style.filter = `grayscale(${(1 - e).toFixed(2)})`;
          }
        }
        if (card.type === "coin") {
          const coin = coinRefs.current[card.key];
          const label = labelRefs.current[card.key];
          if (coin && label) {
            const angle = -d * 900;
            const k = Math.floor((angle + 90) / 180);
            coin.style.transform = `rotateY(${(angle - k * 180).toFixed(2)}deg)`;
            const labels = card.exp.coin;
            const text = labels[((k % labels.length) + labels.length) % labels.length];
            if (label.textContent !== text) label.textContent = text;
          }
        }
      });
      const r = cards[nearest]?.role ?? 0;
      setRole((prev) => (prev === r ? prev : r));
    },
    [cards]
  );

  useMotionValueEvent(smooth, "change", paint);

  // Card positions, how far the row travels (until the last card is
  // centred), and the scroll length that takes.
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const centers = cardRefs.current.map((el) => (el ? el.offsetLeft + el.offsetWidth / 2 : 0));
      const travel = Math.max(1, (centers[centers.length - 1] ?? 0) - vw / 2);
      geo.current = { centers, travel, vw, blur: window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches };
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

  // Scroll the page so card i sits at the centre of the reel.
  const centreOn = useCallback((i, behavior = "smooth") => {
    const track = trackRef.current;
    const g = geo.current;
    if (!track) return;
    const p = Math.min(1, Math.max(0, (g.centers[i] - g.vw / 2) / g.travel));
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + p * (track.offsetHeight - window.innerHeight), behavior });
  }, []);

  const tabs = (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Roles">
      {items.map((exp, i) => (
        <button
          key={exp.id}
          type="button"
          aria-pressed={role === i}
          onClick={() => centreOn(cards.findIndex((c) => c.role === i && c.type === "intro"))}
          className={`min-h-[36px] border px-3 text-[10.5px] uppercase tracking-[0.14em] transition-colors ${
            role === i
              ? "border-[var(--sw-white)] bg-[var(--sw-white)] text-[var(--sw-black)]"
              : "border-[var(--sw-border-strong)] text-[var(--sw-silver)] hover:border-[var(--sw-white)] hover:text-[var(--sw-white)]"
          }`}
        >
          <span className="sm:hidden">{exp.tab ?? exp.short}</span>
          <span className="max-sm:hidden">{exp.short ?? exp.company}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div ref={trackRef} className="relative" style={{ height: trackHeight ?? `${cards.length * 50 + 100}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pb-6 pt-20">
        <div className="sw-container w-full">
          <SectionHeading eyebrow="Experience" title="Engineering roles." action={tabs} />
        </div>

        <div
          ref={rowRef}
          // Starts with the first card centred, in focus.
          className="relative mt-4 flex w-max items-center gap-4 pl-[11vw] will-change-transform sm:mt-6 sm:gap-5 sm:pl-[calc(50vw-min(220px,26svh))]"
        >
          {cards.map((card, i) => (
            <div
              key={card.key}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`${TALL} ${card.wide ? WIDE : SQUARE} shrink-0`}
              // Keyboard users tabbing into a card bring it to the centre.
              onFocusCapture={() => centreOn(i, "auto")}
            >
              <div ref={(el) => { faceRefs.current[i] = el; }} className="h-full w-full origin-center will-change-transform">
                {card.type === "intro" && <IntroCard exp={card.exp} role={card.role} count={items.length} />}
                {card.type === "telemetry" && <TelemetryCard />}
                {card.type === "photos" && <PhotosCard exp={card.exp} stripRef={(el) => { stripRefs.current[card.key] = el; }} />}
                {card.type === "coin" && (
                  <CoinCard
                    exp={card.exp}
                    coinRef={(el) => { coinRefs.current[card.key] = el; }}
                    labelRef={(el) => { labelRefs.current[card.key] = el; }}
                  />
                )}
                {card.type === "text" && <TextCard card={card} />}
                {card.type === "partner" && <PartnerCard />}
              </div>
            </div>
          ))}
        </div>

        <div className="sw-container mt-5 w-full sm:mt-7">
          <div className="flex items-center gap-4">
            <span className="text-[11px] tabular-nums text-[var(--sw-gray)]">
              {two(role + 1)} / {two(items.length)}
            </span>
            <span className="relative h-px flex-1 bg-[var(--sw-rule)]">
              <motion.span className="absolute inset-0 origin-left bg-[var(--sw-white)]" style={{ scaleX: smooth }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
