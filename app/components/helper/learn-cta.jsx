"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];
export const LEARN_URL = "https://swort.net/learn";

// A sensor trace that settles from noise into a clean signal as it draws.
const TRACE =
  "M0 60 L40 58 L60 72 L80 34 L100 80 L120 22 L140 70 L160 44 L180 64 L200 50 L230 58 L260 52 L300 56 L340 54 L380 55 L420 55 L480 55 L560 55 L640 55";

// Points readers who want more avionics to SWORT Learn. `tone="paper"` sits on
// the light sections; the default sits on black.
export default function LearnCta({ tone = "dark", compact = false }) {
  const reduce = useReducedMotion();

  return (
    <section className={`${tone === "paper" ? "sw-paper" : ""} sw-section`} aria-labelledby="learn-cta-title">
      <div className="sw-container">
        <div className="relative overflow-hidden border border-[var(--sw-border)] bg-[var(--sw-cell)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 640 110"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-[var(--sw-gray)] opacity-60"
          >
            <motion.path
              d={TRACE}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: reduce ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 2.2, ease: EASE }}
            />
          </svg>

          <div className={`relative grid gap-8 p-6 sm:p-10 ${compact ? "" : "lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-14"}`}>
            <div>
              <p className="sw-eyebrow">Learn avionics</p>
              <h2 id="learn-cta-title" className="sw-title max-w-[18ch]">
                Go deeper at SWORT Learn.
              </h2>
              <p className="sw-cell-body mt-4 max-w-[62ch]">
                A free, seven-stage practice programme in aerospace sensors and flight data. Follow one number from the instrument that
                made it to the surface it moves, investigate a flight nobody has explained to you, then defend what you concluded. It
                runs in your browser: no account, nothing sent.
              </p>
            </div>
            <a href={LEARN_URL} target="_blank" rel="noopener noreferrer" className="sw-btn sw-btn-primary self-start lg:self-end">
              Open swort.net/learn <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
