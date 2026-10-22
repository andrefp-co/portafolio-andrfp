"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import LearnCta from "@/app/components/helper/learn-cta";
import { books } from "@/utils/data/books";
import { openMail } from "@/utils/obfuscate";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import OrderSheet from "./order-sheet";

const EASE = [0.22, 1, 0.36, 1];
const two = (n) => String(n).padStart(2, "0");

// The cover figure from the printed book: a continuous quantity and the
// 12-bit record written from it (a staircase that follows it).
const wave = (x) => 30 + 13 * Math.sin(x / 21) + 5 * Math.sin(x / 8.5 + 1);
const CURVE = Array.from({ length: 101 }, (_, i) => `${i === 0 ? "M" : "L"}${i * 2} ${wave(i * 2).toFixed(2)}`).join(" ");
const STAIRS = (() => {
  let d = "";
  for (let x = 0; x <= 200; x += 8) {
    const y = Math.round(wave(x) / 4) * 4;
    d += x === 0 ? `M0 ${y}` : ` H${x} V${y}`;
  }
  return `${d} H200`;
})();

// The front cover, set from the printed cover: title, volume, subtitle, the
// figure and its labels, the dataset tag, and the author.
function DrawnCover({ book }) {
  return (
    <div className="flex h-full flex-col justify-between p-4 text-white sm:p-5">
      <span className="text-[8px] uppercase tracking-[0.3em] text-[#8d9297]">SWORT™</span>
      <div>
        <span className="block font-[family-name:var(--sw-font-display)] text-[30px] leading-[0.9] tracking-[0.02em] sm:text-[38px]">
          Avionics
          <br />
          Research Methods
        </span>
        <span className="mt-2 block text-[8px] uppercase tracking-[0.3em] text-[#bfc2c5]">{book.volume}</span>
        <span className="mt-1 block text-[8px] leading-snug text-[#8d9297] sm:text-[9px]">{book.subtitle}</span>
      </div>
      <div>
        <svg viewBox="0 0 200 60" className="w-full" aria-hidden="true">
          <path d={CURVE} fill="none" stroke="#8d9297" strokeWidth="1" />
          <path d={STAIRS} fill="none" stroke="#ffffff" strokeWidth="1" />
        </svg>
        <span className="mt-1 flex justify-between text-[6px] leading-tight text-[#8d9297] sm:text-[7px]">
          <span>the continuous quantity</span>
          <span className="text-right text-[#d6d6d6]">the 12-bit record written from it</span>
        </span>
        <span className="mt-1.5 block text-[6px] uppercase tracking-[0.16em] text-[#6b6f73] sm:text-[6.5px]">Dataset BOOK-SYN-001 · synthetic · illustrative</span>
      </div>
      <div>
        <span className="block text-[9px] uppercase tracking-[0.24em] text-white">{book.author}</span>
        <span className="mt-0.5 block text-[6.5px] uppercase tracking-[0.2em] text-[#8d9297]">Principal Aerospace Researcher</span>
      </div>
    </div>
  );
}

// The book as an object under a spotlight: front cover, spine and page block
// in 3D. Scrolling in turns it from spine-on to a three-quarter view; the
// pointer or a finger then turns it a little further either way.
function BookStage({ book }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] });
  const turn = useTransform(scrollYProgress, [0, 1], [72, 24]);
  const lift = useTransform(scrollYProgress, [0, 1], [70, 0]);
  const px = useMotionValue(0);
  const lean = useSpring(px, { stiffness: 160, damping: 20, mass: 0.7 });
  const rotateY = useTransform([turn, lean], ([t, l]) => t + l * 26);
  // The light on the cover slides as the book turns.
  const sheen = useTransform(rotateY, [0, 72], ["-30%", "60%"]);

  const track = (e) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
  };

  return (
    <div
      ref={ref}
      className="sw-ink relative flex aspect-[5/4] items-center justify-center overflow-hidden border border-[var(--sw-border)] bg-[var(--sw-cell)] [perspective:1400px]"
      onPointerMove={track}
      onPointerLeave={() => px.set(0)}
      style={{ touchAction: "pan-y" }}
    >
      {/* Spotlight and the floor it lands on. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_38%,rgba(255,255,255,0.09),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[22%] border-t border-[var(--sw-border)] bg-gradient-to-b from-white/[0.03] to-transparent" />
      <div aria-hidden="true" className="absolute bottom-[16%] left-1/2 h-6 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-xl" />

      <motion.div
        className="relative h-[250px] w-[176px] [transform-style:preserve-3d] sm:h-[320px] sm:w-[224px]"
        style={reduce ? { rotateY: 24, rotateX: 4 } : { rotateY, rotateX: 4, y: lift }}
      >
        {/* Page block along the fore-edge; the book is 34px thick. */}
        <div
          className="absolute inset-y-[6px] left-full w-[34px] origin-left bg-[repeating-linear-gradient(90deg,#e9e9e6_0_1px,#d7d7d3_1px_2px)]"
          style={{ transform: "translateZ(17px) rotateY(90deg)" }}
        />
        {/* Spine. */}
        <div
          className="absolute inset-y-0 left-0 flex w-[34px] origin-left items-center justify-center border border-white/10 bg-[#0b0b0b]"
          style={{ transform: "translateZ(-17px) rotateY(-90deg)" }}
        >
          <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.28em] text-[#bfc2c5] [writing-mode:vertical-rl]">
            {book.title} · {book.volume}
          </span>
        </div>
        {/* Front cover. */}
        <div className="sw-bg-grid absolute inset-0 overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-[-24px_30px_60px_rgba(0,0,0,0.5)] [transform:translateZ(17px)]">
          {book.cover ? <Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="240px" className="object-cover" /> : <DrawnCover book={book} />}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-[60%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
            style={{ left: sheen }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function Rise({ children, className = "", delay = 0, as = "div" }) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

// Who it's for, what it assumes, and what it will not do, from the preface.
function Brief({ book, Label = "h4" }) {
  const panels = [
    ["Who it's for", [book.audience]],
    ["What it assumes", book.assumes],
    ["What it will not do", book.wontDo],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {panels.map(([head, lines], i) => (
        <Rise key={head} delay={i * 0.06} className="border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6">
          <Label className="sw-label">{head}</Label>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line} className="text-[13px] leading-[1.7] text-[var(--sw-silver)]">
                {line}
              </li>
            ))}
          </ul>
        </Rise>
      ))}
    </div>
  );
}

// The eight claims the book undertakes to demonstrate, as numbered in its
// introduction, with the chapters that earn each one.
function Claims({ book, Label = "h4" }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Label className="sw-label">Eight claims the book sets out to demonstrate</Label>
        <p className="text-[11px] text-[var(--sw-gray)]">None of them original. What the book supplies is the demonstration.</p>
      </div>
      <ol className="sw-grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {book.claims.map((c, i) => (
          <li key={c.claim} className="flex flex-col gap-3 bg-[var(--sw-cell)] p-5">
            <span className="text-[11px] tabular-nums text-[var(--sw-gray)]">{two(i + 1)}</span>
            <span className="font-[family-name:var(--sw-font-display)] text-[22px] leading-[1.05] tracking-[0.02em] text-[var(--sw-white)]">{c.claim}</span>
            <span className="mt-auto text-[11px] text-[var(--sw-gray)]">{c.where}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The parts printed in this volume, with a few chapters from each.
function Parts({ book, Label = "h4" }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Label className="sw-label">Inside {book.volume}</Label>
        <p className="text-[11px] text-[var(--sw-gray)]">Chapter numbers run across both volumes; Part IV is printed in Volume II.</p>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {book.parts.map((p, i) => (
          <Rise key={p.part} as="li" delay={(i % 3) * 0.05} className="flex h-full flex-col border border-[var(--sw-border)] bg-[var(--sw-cell)] p-5">
              <span className="flex items-baseline justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--sw-gray)]">
                <span>Part {p.part}</span>
                <span className="tabular-nums">{p.chapters}</span>
              </span>
              <span className="mt-3 font-[family-name:var(--sw-font-display)] text-[24px] leading-[1.05] tracking-[0.02em] text-[var(--sw-white)]">{p.name}</span>
              <ul className="mt-3 flex flex-col gap-1.5 border-t border-[var(--sw-rule)] pt-3">
                {p.sample.map((title) => (
                  <li key={title} className="text-[12.5px] leading-snug text-[var(--sw-silver)]">
                    {title}
                  </li>
                ))}
              </ul>
          </Rise>
        ))}
      </ul>
    </div>
  );
}

// The book shelf. `variant`: "compact" is the book and its order buttons;
// "home" adds the brief and the eight claims; "full" (the /book page) adds
// the contents. `tone="paper"` sits on the light sections. `checkout` maps
// book ids to whether Stripe checkout is configured (see utils/checkout.js).
export default function BookShelf({ tone = "dark", eyebrow = "Book", checkout = {}, learn = true, variant = "home", headingAs = "h2" }) {
  const [ordering, setOrdering] = useState(null);
  const close = useCallback(() => setOrdering(null), []);
  // Heading levels follow the section's: the book title one below it, the
  // panels one below that.
  const Title = headingAs === "h1" ? "h2" : "h3";
  const Label = headingAs === "h1" ? "h3" : "h4";
  if (!books.length) return null;

  return (
    <section id="books" className={`${tone === "paper" ? "sw-paper" : ""} sw-section scroll-mt-20`} aria-labelledby="books-title">
      <div className="sw-container">
        <SectionHeading eyebrow={eyebrow} title={books.length > 1 ? "Books I've written." : "The book."} id="books-title" as={headingAs} />

        <div className="mt-10 flex flex-col gap-16">
          {books.map((book) => {
            const facts = [
              ["Edition", book.edition],
              ["Length", book.length],
              ["Format", book.formats?.join(" · ")],
              ["Price", book.price || (checkout[book.id] ? "At checkout" : "On request")],
            ].filter(([, v]) => v);
            return (
              <article key={book.id} className="flex flex-col gap-12">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <BookStage book={book} />
                  <Rise className="min-w-0">
                    <p className="sw-label">
                      {book.series ? `${book.series} · ` : ""}by {book.author}
                    </p>
                    <Title className="mt-3 font-[family-name:var(--sw-font-display)] text-[clamp(44px,5.6vw,80px)] leading-[0.92] tracking-[0.02em] text-[var(--sw-white)]">
                      {book.title}
                    </Title>
                    {book.subtitle && (
                      <p className="mt-3 text-[15px] text-[var(--sw-silver)]">
                        {book.volume}: {book.subtitle}
                      </p>
                    )}
                    {book.tagline && (
                      <p className="mt-6 border-l-2 border-[var(--sw-white)] pl-4 font-[family-name:var(--sw-font-display)] text-[clamp(22px,2.4vw,28px)] leading-[1.1] tracking-[0.02em] text-[var(--sw-white)]">
                        {book.tagline}
                      </p>
                    )}

                    <dl className="sw-grid mt-8 grid-cols-2 sm:grid-cols-4">
                      {facts.map(([k, v]) => (
                        <div key={k} className="min-w-0 px-4 py-4">
                          <dt className="sw-label">{k}</dt>
                          <dd className="mt-1.5 text-sm text-[var(--sw-white)]">{v}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      {book.buyUrl ? (
                        <motion.a href={book.buyUrl} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.97 }} className="sw-btn sw-btn-primary">
                          Buy the book
                        </motion.a>
                      ) : (
                        <motion.button type="button" onClick={() => setOrdering(book)} whileTap={{ scale: 0.97 }} className="sw-btn sw-btn-primary">
                          Order a copy
                        </motion.button>
                      )}
                      <button type="button" onClick={() => openMail(`${book.title}, ${book.volume}`)} className="sw-btn sw-btn-ghost">
                        Ask about the book
                      </button>
                    </div>
                    <p className="mt-4 text-[11px] text-[var(--sw-gray)]">
                      {checkout[book.id] ? "Secure checkout by Stripe. Card details never reach this site." : "Order by request. Nothing is charged until you confirm."}
                    </p>
                    {variant !== "full" && book.slug && (
                      <Link href="/book" className="sw-link mt-6">
                        Contents, claims and who it&apos;s for <span className="sw-link-arrow" aria-hidden="true">→</span>
                      </Link>
                    )}
                  </Rise>
                </div>

                {variant !== "compact" && <Brief book={book} Label={Label} />}
                {variant !== "compact" && book.claims?.length > 0 && <Claims book={book} Label={Label} />}
                {variant === "full" && book.parts?.length > 0 && <Parts book={book} Label={Label} />}
                {variant !== "compact" && book.notes?.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-t border-[var(--sw-rule)] pt-5">
                    {book.notes.map((n) => (
                      <p key={n} className="max-w-[90ch] text-[11.5px] leading-relaxed text-[var(--sw-gray)]">
                        {n}
                      </p>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {learn && (
          <div className="mt-16">
            <LearnCta embedded />
          </div>
        )}
      </div>
      {ordering && <OrderSheet key={ordering.id} book={ordering} open onClose={close} checkout={Boolean(checkout[ordering.id])} />}
    </section>
  );
}
