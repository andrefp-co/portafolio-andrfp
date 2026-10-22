"use client";

import { books } from "@/utils/data/books";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import OrderSheet from "./order-sheet";

const EASE = [0.22, 1, 0.36, 1];

// A book as an object: front cover, spine and page block in 3D, turning
// toward the pointer or finger and opening slightly on hover.
function Book3D({ book }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const spring = { stiffness: 160, damping: 20, mass: 0.7 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [38, 10]), spring);

  const track = (e) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
  };

  return (
    <div
      className="flex justify-center py-6 [perspective:1400px]"
      onPointerMove={track}
      onPointerLeave={() => px.set(0)}
      style={{ touchAction: "pan-y" }}
    >
      <motion.div
        className="relative h-[300px] w-[210px] [transform-style:preserve-3d] sm:h-[340px] sm:w-[238px]"
        style={{ rotateY: reduce ? 24 : rotateY, rotateX: 4 }}
        initial={reduce ? false : { opacity: 0, y: 40, rotateZ: -4 }}
        whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1, ease: EASE }}
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
        <div className="absolute inset-0 overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-[-24px_30px_60px_rgba(0,0,0,0.45)] [transform:translateZ(17px)]">
          {book.cover ? (
            <Image src={book.cover} alt={`Cover of ${book.title}`} fill sizes="240px" className="object-cover" />
          ) : (
            <div className="sw-bg-grid flex h-full flex-col justify-between p-5 text-white">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#8d9297]">{book.volume}</span>
              <div>
                <span className="block font-[family-name:var(--sw-font-display)] text-[40px] leading-[0.92] tracking-[0.02em] sm:text-[46px]">
                  {book.title}
                </span>
                <svg viewBox="0 0 200 40" className="mt-5 h-8 w-full text-[#8d9297]" aria-hidden="true">
                  <path d="M0 30 L30 28 L45 8 L60 34 L75 18 L95 24 L120 22 L150 23 L200 23" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#bfc2c5]">{book.author}</span>
            </div>
          )}
          {/* Light catching the cover as it turns. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}

// The book shelf: a 3D cover beside the title, details and an order button.
// `tone="paper"` sits on the light sections.
// `checkout` maps book ids to whether Stripe checkout is configured (computed
// on the server, see utils/checkout.js).
export default function BookShelf({ tone = "dark", eyebrow = "Books", checkout = {} }) {
  const [ordering, setOrdering] = useState(null);
  const close = useCallback(() => setOrdering(null), []);
  if (!books.length) return null;

  return (
    <section id="books" className={`${tone === "paper" ? "sw-paper" : ""} sw-section scroll-mt-20`} aria-labelledby="books-title">
      <div className="sw-container">
        <p className="sw-eyebrow">{eyebrow}</p>
        <h2 id="books-title" className="sw-title">
          {books.length > 1 ? "Books I've written." : "The book."}
        </h2>
        <div className="mt-10 flex flex-col gap-12">
          {books.map((book) => (
            <article
              key={book.id}
              className="grid items-center gap-8 border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 sm:p-10 md:grid-cols-[minmax(0,300px)_1fr] lg:gap-16"
            >
              <Book3D book={book} />
              <div className="min-w-0">
                {book.volume && <p className="sw-label">{book.volume}</p>}
                <h3 className="mt-2 font-[family-name:var(--sw-font-display)] text-[clamp(40px,5vw,64px)] leading-[0.95] tracking-[0.02em] text-[var(--sw-white)]">
                  {book.title}
                </h3>
                {book.subtitle && <p className="mt-3 text-[15px] text-[var(--sw-silver)]">{book.subtitle}</p>}
                <p className="mt-2 text-sm text-[var(--sw-gray)]">by {book.author}</p>
                {book.blurb && <p className="sw-cell-body mt-5 max-w-[56ch]">{book.blurb}</p>}

                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--sw-rule)] pt-5">
                  {book.formats?.length > 0 && (
                    <div>
                      <dt className="sw-label">Format</dt>
                      <dd className="mt-1 text-sm text-[var(--sw-white)]">{book.formats.join(" · ")}</dd>
                    </div>
                  )}
                  {book.price && (
                    <div>
                      <dt className="sw-label">Price</dt>
                      <dd className="mt-1 text-sm text-[var(--sw-white)]">{book.price}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                  {book.buyUrl ? (
                    <motion.a href={book.buyUrl} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.97 }} className="sw-btn sw-btn-primary">
                      Buy the book
                    </motion.a>
                  ) : (
                    <motion.button type="button" onClick={() => setOrdering(book)} whileTap={{ scale: 0.97 }} className="sw-btn sw-btn-primary">
                      Order a copy
                    </motion.button>
                  )}
                  <span className="text-[11px] text-[var(--sw-gray)]">
                    {checkout[book.id] ? "Secure checkout by Stripe" : "Order by request · nothing is charged until you confirm"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {ordering && <OrderSheet key={ordering.id} book={ordering} open onClose={close} checkout={Boolean(checkout[ordering.id])} />}
    </section>
  );
}
