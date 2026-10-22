"use client";

import { press, pressHref } from "@/utils/data/press";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

const EASE = [0.22, 1, 0.36, 1];
const day = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Press coverage as clippings of each outlet's page: masthead and headline,
// with the outlet, what kind of piece it is, and the date underneath. A row
// on wide screens, a swipeable strip on phones.
export default function PressClippings() {
  const reduce = useReducedMotion();
  return (
    <div className="mt-14">
      <div className="flex items-baseline justify-between gap-6">
        <p className="sw-eyebrow">In the press</p>
        <p className="hidden text-[11px] text-[var(--sw-gray)] sm:block">Press releases are marked as releases.</p>
      </div>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {press.map((item, i) => (
          <motion.li
            key={item.id}
            className="w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-auto"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
          >
            <a href={pressHref(item)} target="_blank" rel="noopener noreferrer" className="group block">
              <span className="relative block aspect-[3/4] overflow-hidden border border-[var(--sw-border)] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5">
                <Image
                  src={item.image}
                  alt={`${item.outlet}: ${item.title}`}
                  fill
                  sizes="(min-width: 1024px) 220px, (min-width: 640px) 38vw, 62vw"
                  className="object-cover object-top"
                />
              </span>
              <span className="mt-3 block text-[11px] uppercase tracking-[0.16em] text-[var(--sw-white)]">
                {item.outlet} <span className="inline-block transition-transform group-hover:translate-x-0.5" aria-hidden="true">↗</span>
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-[var(--sw-gray)]">
                {item.kind}
                {item.date ? ` · ${day(item.date)}` : ""}
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
