"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import LearnCta from "@/app/components/helper/learn-cta";
import { books } from "@/utils/data/books";
import { openMail } from "@/utils/obfuscate";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import OrderSheet from "./order-sheet";

const EASE = [0.22, 1, 0.36, 1];

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
      className="relative flex aspect-[5/4] items-center justify-center overflow-hidden border border-[var(--sw-border)] bg-[var(--sw-cell)] [perspective:1400px]"
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
          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-[#bfc2c5] [writing-mode:vertical-rl]">
            {book.title}
          </span>
        </div>
        {/* Front cover. */}
        <div className="absolute inset-0 overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-[-24px_30px_60px_rgba(0,0,0,0.5)] [transform:translateZ(17px)]">
          {book.cover ? (
            <Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="240px" className="object-cover" />
          ) : (
            <div className="sw-bg-grid flex h-full flex-col justify-between p-5 text-white">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8d9297]">{book.volume}</span>
              <div>
                <span className="block font-[family-name:var(--sw-font-display)] text-[36px] leading-[0.92] tracking-[0.02em] sm:text-[44px]">
                  {book.title}
                </span>
                <svg viewBox="0 0 200 40" className="mt-5 h-8 w-full text-[#8d9297]" aria-hidden="true">
                  <path d="M0 30 L30 28 L45 8 L60 34 L75 18 L95 24 L120 22 L150 23 L200 23" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#bfc2c5]">{book.author}</span>
            </div>
          )}
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

// The book shelf: the book under a spotlight beside its details and an order
// button, then SWORT Learn for readers who want to practise. `tone="paper"`
// sits on the light sections. `checkout` maps book ids to whether Stripe
// checkout is configured (computed on the server, see utils/checkout.js).
export default function BookShelf({ tone = "dark", eyebrow = "Book", checkout = {}, learn = true }) {
  const [ordering, setOrdering] = useState(null);
  const close = useCallback(() => setOrdering(null), []);
  if (!books.length) return null;

  return (
    <section id="books" className={`${tone === "paper" ? "sw-paper" : ""} sw-section scroll-mt-20`} aria-labelledby="books-title">
      <div className="sw-container">
        <SectionHeading eyebrow={eyebrow} title={books.length > 1 ? "Books I've written." : "The book."} id="books-title" />

        <div className="mt-10 flex flex-col gap-16">
          {books.map((book) => {
            const facts = [
              ["Format", book.formats?.join(" · ")],
              ["Edition", book.volume],
              ["Price", book.price || (checkout[book.id] ? "At checkout" : "On request")],
            ].filter(([, v]) => v);
            return (
              <article key={book.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <BookStage book={book} />
                <motion.div
                  className="min-w-0"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <p className="sw-label">Written by {book.author}</p>
                  <h3 className="mt-3 font-[family-name:var(--sw-font-display)] text-[clamp(44px,5.6vw,80px)] leading-[0.92] tracking-[0.02em] text-[var(--sw-white)]">
                    {book.title}
                  </h3>
                  {book.subtitle && <p className="mt-3 text-[15px] text-[var(--sw-silver)]">{book.subtitle}</p>}
                  {book.blurb && <p className="sw-cell-body mt-5 max-w-[56ch]">{book.blurb}</p>}

                  <dl className="mt-8 grid grid-cols-3 border-y border-[var(--sw-rule)]">
                    {facts.map(([k, v]) => (
                      <div key={k} className="min-w-0 border-r border-[var(--sw-rule)] py-4 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                        <dt className="sw-label">{k}</dt>
                        <dd className="mt-1.5 truncate text-sm text-[var(--sw-white)]">{v}</dd>
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
                </motion.div>
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
