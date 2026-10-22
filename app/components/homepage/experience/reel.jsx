"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import PcbStack from "@/app/components/instruments/pcb-stack";
import Telemetry from "@/app/components/instruments/telemetry";
import { openMail } from "@/utils/obfuscate";
import { scrollToY } from "@/utils/scroll";
import { useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Vertical scroll spent per pixel the reel travels sideways.
const SCROLL_PER_PX = 0.85;

// Card sizes: one height, a square tile and a wider text card. Phones get
// taller, narrower tiles; tablets held upright get bigger ones.
const TALL = "h-[min(440px,52svh)] max-sm:h-[min(500px,60svh)] sm:portrait:h-[min(600px,48svh)]";
const SQUARE = "w-[min(440px,52svh)] max-sm:w-[78vw] sm:portrait:w-[min(600px,48svh)]";
const WIDE = "w-[min(600px,72svh)] max-sm:w-[86vw] sm:portrait:w-[min(760px,88vw)]";

const two = (n) => String(n).padStart(2, "0");

// The same top-left label on every card: whose work it is, then what the
// card shows.
function Tag({ exp, children, light = false }) {
  return (
    <p className="flex items-baseline gap-2 text-[10.5px] uppercase tracking-[0.18em]">
      <span className={light ? "text-[#111]" : "text-white"}>{exp.tab ?? exp.short}</span>
      <span className={light ? "text-[#666]" : "text-white/55"}>{children}</span>
    </p>
  );
}

// The roles as one row of cards: for each, a title card on a photo, its
// board stack-up, instrument or photos, a coin of the tools it runs on, what
// the work was (two lines per card), and for SWORT the partner door to the
// restricted file.
function buildCards(items) {
  const cards = [];
  items.forEach((exp, role) => {
    cards.push({ key: `${exp.id}-intro`, type: "intro", role, exp });
    if (exp.stack) cards.push({ key: `${exp.id}-stack`, type: "stack", role, exp });
    if (exp.instrument === "telemetry") cards.push({ key: `${exp.id}-telemetry`, type: "telemetry", role, exp, zoom: true });
    const photos = exp.reelImages ?? exp.images;
    if (photos?.length) cards.push({ key: `${exp.id}-photos`, type: "photos", role, exp, photos, wide: true });
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

function IntroCard({ exp, role, count, coverRef }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden border border-[var(--sw-border)] bg-[#0b0b0b] p-6 sm:p-8">
      {exp.cover && (
        <>
          <div ref={coverRef} className="absolute inset-0 will-change-transform">
            <Image src={exp.cover.src} alt={exp.cover.alt} fill sizes="(max-width: 640px) 80vw, 440px" className="object-cover" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30" />
        </>
      )}
      <div className="relative flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/75">
        <span className="tabular-nums">
          {two(role + 1)} / {two(count)}
        </span>
        <span>{exp.duration}</span>
      </div>
      <div className="relative">
        <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(38px,4.4vw,56px)] leading-[0.94] tracking-[0.02em] text-white [text-wrap:balance]">
          {exp.title}
        </h3>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/80">{exp.company}</p>
      </div>
    </div>
  );
}

function StackCard({ exp }) {
  return (
    <div className="relative h-full border border-[var(--sw-border)] bg-[radial-gradient(circle_at_40%_45%,#16181b,#0b0b0b_70%)]">
      <PcbStack caption="Four-layer STM32H743 flight controller, pulled apart into its stack-up." />
      <div className="pointer-events-none absolute left-5 top-5 sm:left-6 sm:top-6">
        <Tag exp={exp}>Board stack-up</Tag>
      </div>
    </div>
  );
}

function TelemetryCard({ exp }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3 border border-[var(--sw-border)] bg-[#0b0b0b] p-4 sm:p-6">
      <Tag exp={exp}>Ground station</Tag>
      <Telemetry />
      <p className="text-[11px] leading-relaxed text-[var(--sw-gray)]">Attitude telemetry as a ground station reads it. Simulated: tap the plot to throw a gust at it.</p>
    </div>
  );
}

// Photos behind a window: a strip of images slides inside the card as it
// travels, so one picture wipes into the next. The count and the caption
// follow whichever photo is showing.
function PhotosCard({ exp, photos, stripRef, countRef, captionRef }) {
  const n = photos.length;
  const last = photos[n - 1];
  return (
    <div className="relative h-full overflow-hidden border border-[var(--sw-border)] bg-black">
      <div ref={stripRef} className="flex h-full will-change-transform" style={{ width: `${n * 100}%` }}>
        {photos.map((img) => (
          <div key={img.src} className="relative h-full" style={{ width: `${100 / n}%` }}>
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 86vw, 600px" className="object-cover" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex items-baseline justify-between bg-gradient-to-b from-black/70 to-transparent px-5 pb-10 pt-5 sm:px-6 sm:pt-6">
        <Tag exp={exp}>In pictures</Tag>
        {n > 1 && (
          <span className="text-[10.5px] tabular-nums tracking-[0.18em] text-white/70">
            <span ref={countRef}>{two(n)}</span> / {two(n)}
          </span>
        )}
      </div>
      <p
        ref={captionRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-14 text-[12.5px] leading-snug text-white/90 sm:px-6 sm:pb-5"
      >
        {last.alt}
      </p>
    </div>
  );
}

// A coin that flips as the reel moves, a different tool on each face.
function CoinCard({ exp, coinRef, labelRef }) {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden border border-black/10 bg-[linear-gradient(160deg,#f4f4f4,#cdcecf)] p-6 text-[#111] sm:p-8">
      <Tag exp={exp} light>
        Works in
      </Tag>
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

// What the work was, two numbered lines to a card.
function TextCard({ card }) {
  const { exp, lines, part, parts } = card;
  const last = part === parts - 1;
  return (
    <div className="flex h-full flex-col overflow-y-auto border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <Tag exp={exp}>The work</Tag>
        {parts > 1 && (
          <span className="text-[10.5px] tabular-nums tracking-[0.18em] text-white/55">
            {two(part + 1)} / {two(parts)}
          </span>
        )}
      </div>
      <ol className="mt-auto flex flex-col gap-5 pt-8">
        {lines.map((line, j) => (
          <li key={line} className="grid grid-cols-[2.4rem_1fr] gap-3 border-t border-[var(--sw-rule)] pt-5 sm:grid-cols-[3rem_1fr]">
            <span aria-hidden="true" className="font-[family-name:var(--sw-font-display)] text-[24px] leading-none tracking-[0.02em] text-[var(--sw-white)] sm:text-[30px]">
              {two(part * 2 + j + 1)}
            </span>
            <span className="text-[13.5px] leading-[1.75] text-[var(--sw-silver)] lg:text-[15px] lg:leading-[1.7]">{line}</span>
          </li>
        ))}
      </ol>
      {last && exp.link && (
        <div className="pt-6">
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
  const coverRefs = useRef({});
  const countRefs = useRef({});
  const captionRefs = useRef({});
  const liftRefs = useRef([]);
  const segRefs = useRef([]);
  const geo = useRef({ centers: [], travel: 1, vw: 1, blur: false, starts: [] });
  const [trackHeight, setTrackHeight] = useState(null);
  const [spans, setSpans] = useState(() => items.map(() => 1));
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
        const lift = liftRefs.current[i];
        if (lift) lift.style.opacity = e.toFixed(3);
        // Blur only cards on screen; a filter on an off-screen card still costs.
        if (g.blur) face.style.filter = Math.abs(d) < 0.75 ? `blur(${((1 - e) * 2).toFixed(2)}px)` : "none";

        if (card.type === "intro") {
          // The cover photo settles from a slight push-in and gains colour.
          const cover = coverRefs.current[card.key];
          if (cover) {
            cover.style.transform = `scale(${(1.12 - 0.12 * e).toFixed(4)})`;
            cover.style.filter = `grayscale(${(1 - e).toFixed(2)})`;
          }
        }
        if (card.type === "stack") face.style.setProperty("--explode", e.toFixed(3));
        if (card.type === "photos") {
          const strip = stripRefs.current[card.key];
          const n = card.photos.length;
          // Coming in from the right it wipes through every photo, landing
          // on the last one as it reaches the centre.
          const t = Math.min(1, Math.max(0, (0.45 - d) / 0.45));
          if (strip) {
            // A single photo has nothing to wipe to: it pushes in instead.
            strip.style.transform = n > 1 ? `translate3d(${((-t * (n - 1) * 100) / n).toFixed(3)}%,0,0)` : `scale(${(1.1 - 0.1 * e).toFixed(4)})`;
            strip.style.filter = `grayscale(${(1 - e).toFixed(2)})`;
          }
          const shown = n > 1 ? Math.round(t * (n - 1)) : 0;
          const count = countRefs.current[card.key];
          if (count && count.textContent !== two(shown + 1)) count.textContent = two(shown + 1);
          const caption = captionRefs.current[card.key];
          if (caption && caption.textContent !== card.photos[shown].alt) caption.textContent = card.photos[shown].alt;
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
      // Each role's stretch of the progress bar fills while its cards pass.
      g.starts.forEach((start, k) => {
        const seg = segRefs.current[k];
        const end = g.starts[k + 1] ?? 1;
        if (seg) seg.style.transform = `scaleX(${Math.min(1, Math.max(0, (p - start) / Math.max(end - start, 1e-4))).toFixed(4)})`;
      });
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
      // Where in the scroll each role's first card reaches the centre.
      const starts = items.map((_, r) => {
        const i = cards.findIndex((c) => c.role === r);
        return r === 0 ? 0 : Math.min(1, Math.max(0, (centers[i] - vw / 2) / travel));
      });
      geo.current = { centers, travel, vw, starts, blur: window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches };
      setSpans(starts.map((start, r) => Math.max(0.05, (starts[r + 1] ?? 1) - start)));
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
  }, [paint, smooth, items, cards]);

  // Scroll the page so card i sits at the centre of the reel.
  const centreOn = useCallback((i, behavior = "smooth") => {
    const track = trackRef.current;
    const g = geo.current;
    if (!track) return;
    const p = Math.min(1, Math.max(0, (g.centers[i] - g.vw / 2) / g.travel));
    const top = track.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + p * (track.offsetHeight - window.innerHeight), { immediate: behavior === "auto" });
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
          className="relative mt-4 flex w-max items-center gap-4 pl-[11vw] will-change-transform sm:mt-6 sm:gap-5 sm:pl-[calc(50vw-min(220px,26svh))] sm:portrait:pl-[calc(50vw-min(300px,24svh))]"
        >
          {cards.map((card, i) => (
            <div
              key={card.key}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`${TALL} ${card.wide ? WIDE : SQUARE} shrink-0`}
              // Keyboard users tabbing into a card bring it to the centre.
              onFocusCapture={() => centreOn(i, "auto")}
            >
              <div ref={(el) => { faceRefs.current[i] = el; }} className="relative h-full w-full origin-center will-change-transform">
                {card.type === "intro" && (
                  <IntroCard exp={card.exp} role={card.role} count={items.length} coverRef={(el) => { coverRefs.current[card.key] = el; }} />
                )}
                {card.type === "stack" && <StackCard exp={card.exp} />}
                {card.type === "telemetry" && <TelemetryCard exp={card.exp} />}
                {card.type === "photos" && (
                  <PhotosCard
                    exp={card.exp}
                    photos={card.photos}
                    stripRef={(el) => { stripRefs.current[card.key] = el; }}
                    countRef={(el) => { countRefs.current[card.key] = el; }}
                    captionRef={(el) => { captionRefs.current[card.key] = el; }}
                  />
                )}
                {card.type === "coin" && (
                  <CoinCard
                    exp={card.exp}
                    coinRef={(el) => { coinRefs.current[card.key] = el; }}
                    labelRef={(el) => { labelRefs.current[card.key] = el; }}
                  />
                )}
                {card.type === "text" && <TextCard card={card} />}
                {card.type === "partner" && <PartnerCard />}
                {/* Lifts the card at the centre off the page. */}
                <span
                  ref={(el) => { liftRefs.current[i] = el; }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 shadow-[0_0_0_1px_rgba(255,255,255,0.22),0_34px_80px_-24px_rgba(0,0,0,0.95)]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="sw-container mt-5 w-full sm:mt-7">
          {/* Clear of the back-to-top button on phones. */}
          <div className="flex items-center gap-4 max-sm:pr-14">
            <span className="text-[11px] tabular-nums text-[var(--sw-gray)]">
              {two(role + 1)} / {two(items.length)}
            </span>
            {/* One stretch per role, as long as its run of cards. */}
            <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
              {items.map((exp, r) => (
                <span key={exp.id} className="relative h-[2px] min-w-0 bg-[var(--sw-rule)]" style={{ flexGrow: spans[r], flexBasis: 0 }}>
                  <span
                    ref={(el) => { segRefs.current[r] = el; }}
                    className={`absolute inset-0 origin-left transition-colors ${role === r ? "bg-[var(--sw-white)]" : "bg-[var(--sw-silver)]"}`}
                    style={{ transform: "scaleX(0)" }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
