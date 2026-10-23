"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import { openMail } from "@/utils/obfuscate";
import { scrollToY } from "@/utils/scroll";
import { useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

// Vertical scroll spent per pixel the reel travels sideways.
const SCROLL_PER_PX = 0.85;

// Every card is the same height. Photos are square; a text card's width
// follows how much it has to say, so none is left half empty. Phones get
// taller, narrower cards; tablets held upright get bigger ones.
const TALL = "h-[min(500px,56svh)] max-sm:h-[min(500px,62svh)] sm:portrait:h-[min(600px,48svh)]";
const WIDTHS = {
  square: "w-[min(500px,56svh)] max-sm:w-[80vw] sm:portrait:w-[min(600px,48svh)]",
  narrow: "w-[min(380px,43svh)] max-sm:w-[80vw] sm:portrait:w-[min(460px,37svh)]",
  wide: "w-[min(780px,88svh)] max-sm:w-[86vw] sm:portrait:w-[min(760px,88vw)]",
};

const two = (n) => String(n).padStart(2, "0");
const chars = (lines) => lines.reduce((n, l) => n + l.length, 0);

// Phones split a long "What I did" into cards of two lines each.
const phoneQuery = "(max-width: 639px)";
const subscribePhone = (onChange) => {
  const mq = window.matchMedia(phoneQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const isPhone = () => window.matchMedia(phoneQuery).matches;

// Each role is one run of cards: its cover with the title, what the work
// was with the tools as tags, then its real photos, each captioned. SWORT's
// run ends on the partner card for the restricted file.
function buildCards(items, phone) {
  const cards = [];
  items.forEach((exp, role) => {
    cards.push({ key: `${exp.id}-cover`, type: "cover", role, exp, size: "square" });
    const desc = exp.desc ?? [];
    const groups = phone && chars(desc) > 300 ? desc.reduce((g, l, i) => (i % 2 ? g[g.length - 1].push(l) : g.push([l]), g), []) : [desc];
    groups.forEach((lines, part) => {
      const n = chars(lines);
      cards.push({
        key: `${exp.id}-work-${part}`,
        type: "work",
        role,
        exp,
        lines,
        part,
        parts: groups.length,
        size: n > 420 ? "wide" : n > 240 ? "square" : "narrow",
      });
    });
    (exp.photos ?? []).forEach((photo) => cards.push({ key: `${exp.id}-${photo.src}`, type: "photo", role, exp, photo, size: "square" }));
    if (exp.partnerAccess) cards.push({ key: `${exp.id}-partner`, type: "partner", role, exp, size: "square" });
  });
  return cards;
}

const LABEL = "text-[10.5px] uppercase tracking-[0.18em]";

function CoverCard({ exp, role, count, imageRef }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden border border-[var(--sw-border)] bg-black p-6 sm:p-7">
      <div ref={imageRef} className="absolute inset-0 will-change-transform">
        <Image src={exp.cover.src} alt={exp.cover.alt} fill sizes="(max-width: 640px) 80vw, 500px" className="object-cover" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25" />
      <div className={`relative flex items-center justify-between text-white/80 ${LABEL}`}>
        <span className="tabular-nums">
          {two(role + 1)} / {two(count)}
        </span>
        <span>{exp.duration}</span>
      </div>
      <div className="relative">
        <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(36px,4.2vw,52px)] leading-[0.95] tracking-[0.02em] text-white [text-wrap:balance]">
          {exp.title}
        </h3>
        <p className={`mt-3 text-white/80 ${LABEL}`}>{exp.company}</p>
      </div>
    </div>
  );
}

function WorkCard({ card }) {
  const { exp, lines, part, parts } = card;
  const last = part === parts - 1;
  return (
    <div className="flex h-full flex-col border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 sm:p-7">
      <p className={`flex items-baseline justify-between gap-4 text-[var(--sw-gray)] ${LABEL}`}>
        <span>
          <span className="text-[var(--sw-white)]">{exp.tab ?? exp.short}</span> · What I did
        </span>
        {parts > 1 && <span className="tabular-nums">{part + 1} / {parts}</span>}
      </p>
      <ul className="mt-5 border-b border-[var(--sw-rule)]">
        {lines.map((text) => (
          <li key={text} className="border-t border-[var(--sw-rule)] py-3.5 text-[13.5px] leading-[1.7] text-[var(--sw-silver)] lg:text-[14px]">
            {text}
          </li>
        ))}
      </ul>
      {last && (
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-6">
          {exp.tools?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Tools">
              {exp.tools.map((tool) => (
                <li key={tool} className="border border-[var(--sw-border-strong)] px-2.5 py-1 text-[10.5px] uppercase tracking-[0.1em] text-[var(--sw-silver)]">
                  {tool}
                </li>
              ))}
            </ul>
          )}
          {exp.link && (
            <a href={exp.link} target="_blank" rel="noopener noreferrer" className="sw-link">
              Learn more <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo, imageRef }) {
  return (
    <figure className="relative m-0 h-full overflow-hidden border border-[var(--sw-border)] bg-black">
      <div ref={imageRef} className="absolute inset-0 will-change-transform">
        <Image src={photo.src} alt="" fill sizes="(max-width: 640px) 80vw, 500px" className="object-cover" />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-5 pt-16 text-[12.5px] leading-snug text-white/90 sm:px-7">
        {photo.alt}
      </figcaption>
    </figure>
  );
}

function PartnerCard() {
  return (
    <div className="flex h-full flex-col border border-[var(--sw-border-strong)] bg-[var(--sw-cell)] p-6 sm:p-7">
      <p className={`flex items-center gap-2 text-[var(--sw-gray)] ${LABEL}`}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
        For companies and partners
      </p>
      <div className="mt-auto">
        <p className="font-[family-name:var(--sw-font-display)] text-[clamp(30px,3.2vw,40px)] leading-[0.96] tracking-[0.02em] text-[var(--sw-white)]">
          Want to know more about SWORT&apos;s programs?
        </p>
        <p className="mt-3 text-[13.5px] leading-[1.7] text-[var(--sw-silver)]">
          With an access code, open the restricted file: program status, readiness, open gaps and the hardware itself.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/vault" className="sw-btn sw-btn-primary">
            I have an access code
          </Link>
          <button type="button" onClick={() => openMail("Access code request")} className="sw-link min-h-[40px]">
            Request one
          </button>
        </div>
      </div>
    </div>
  );
}

// "Engineering roles" as a pinned reel. The section holds still while the
// visitor scrolls and the row of cards travels sideways. The card at the
// centre comes forward a little; the rest step back. That is the only
// effect, so the photos and the words carry the section.
export default function ExperienceReel({ items }) {
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const cards = useMemo(() => buildCards(items, phone), [items, phone]);
  const trackRef = useRef(null);
  const rowRef = useRef(null);
  const cardRefs = useRef([]);
  const faceRefs = useRef([]);
  const imageRefs = useRef({});
  const segRefs = useRef([]);
  const geo = useRef({ centers: [], travel: 1, vw: 1, starts: [] });
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
        const f = Math.max(0, 1 - Math.abs(d) * 2.2);
        const e = f * f * (3 - 2 * f);
        face.style.transform = `scale(${(0.95 + 0.05 * e).toFixed(4)})`;
        face.style.opacity = (0.5 + 0.5 * e).toFixed(3);
        // Photos settle from a slight push-in as they arrive.
        const image = imageRefs.current[card.key];
        if (image) image.style.transform = `scale(${(1.06 - 0.06 * e).toFixed(4)})`;
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
      const centers = cards.map((_, i) => {
        const el = cardRefs.current[i];
        return el ? el.offsetLeft + el.offsetWidth / 2 : 0;
      });
      const travel = Math.max(1, (centers[centers.length - 1] ?? 0) - vw / 2);
      // Where in the scroll each role's first card reaches the centre.
      const starts = items.map((_, r) => {
        const i = cards.findIndex((c) => c.role === r);
        return r === 0 ? 0 : Math.min(1, Math.max(0, (centers[i] - vw / 2) / travel));
      });
      geo.current = { centers, travel, vw, starts };
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
          onClick={() => centreOn(cards.findIndex((c) => c.role === i))}
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
          // Starts with the first card centred. A wider gap opens each new role.
          className="relative mt-4 flex w-max items-center gap-3 pl-[10vw] will-change-transform sm:mt-6 sm:gap-4 sm:pl-[calc(50vw-min(250px,28svh))] sm:portrait:pl-[calc(50vw-min(300px,24svh))]"
        >
          {cards.map((card, i) => (
            <div
              key={card.key}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`${TALL} ${WIDTHS[card.size]} shrink-0 ${card.type === "cover" && card.role > 0 ? "ml-[8vw] sm:ml-14" : ""}`}
              // Keyboard users tabbing into a card bring it to the centre.
              onFocusCapture={() => centreOn(i, "auto")}
            >
              <div ref={(el) => { faceRefs.current[i] = el; }} className="h-full w-full origin-center will-change-transform">
                {card.type === "cover" && (
                  <CoverCard exp={card.exp} role={card.role} count={items.length} imageRef={(el) => { imageRefs.current[card.key] = el; }} />
                )}
                {card.type === "work" && <WorkCard card={card} />}
                {card.type === "photo" && <PhotoCard photo={card.photo} imageRef={(el) => { imageRefs.current[card.key] = el; }} />}
                {card.type === "partner" && <PartnerCard />}
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
