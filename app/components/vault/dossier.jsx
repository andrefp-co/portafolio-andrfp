"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import ScrambleText from "../motion/scramble-text";

const EASE = [0.22, 1, 0.36, 1];

// Text arrives under redaction bars that wipe away line by line as it scrolls
// into view. The bar is the text's own colour painted behind it, so covered
// text is invisible without ever leaving the DOM.
function Redact({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -6% 0px" });
  const reduce = useReducedMotion();
  return (
    <span ref={ref} className={`vx-redact ${inView || reduce ? "is-open" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </span>
  );
}

function Value({ value }) {
  if (/^https?:\/\//.test(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="break-all underline decoration-white/30 underline-offset-4 hover:decoration-white">
        {value.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return (
      <a href={`mailto:${value}`} className="break-all underline decoration-white/30 underline-offset-4 hover:decoration-white">
        {value}
      </a>
    );
  }
  return value;
}

// A 1–9 readiness scale: solid to the level reached, dashed to the next
// target or the upper bound of a range.
function TrlScale({ trl }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const reach = trl.upper ?? trl.target;
  const pos = (n) => `${((n - 1) / 8) * 100}%`;
  const label = `TRL ${trl.level}${trl.upper ? `–${trl.upper}` : ""}${trl.target ? ` → ${trl.target}` : ""}`;

  return (
    <div ref={ref} className="mb-7">
      <div className="flex items-baseline justify-between gap-4 text-[10px] uppercase tracking-[0.2em]">
        <span className="text-[#7c7c7c]">Technology readiness</span>
        <span className="tabular-nums text-white">{label}</span>
      </div>
      <div className="relative mx-1 mt-4 h-5" role="img" aria-label={`${label} on a scale of 1 to 9`}>
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
        <motion.span
          className="absolute left-0 top-1/2 h-px origin-left bg-white"
          style={{ width: pos(trl.level) }}
          initial={{ scaleX: 0 }}
          animate={inView || reduce ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
        />
        {reach && (
          <motion.span
            className="absolute top-1/2 h-px border-t border-dashed border-white/70"
            style={{ left: pos(trl.level), width: `calc(${pos(reach)} - ${pos(trl.level)})` }}
            initial={{ opacity: 0 }}
            animate={inView || reduce ? { opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.5 }}
          />
        )}
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-3 w-px -translate-y-1/2"
            style={{ left: pos(i + 1), background: i + 1 <= trl.level ? "#fff" : i + 1 <= (reach ?? 0) ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.22)" }}
          />
        ))}
      </div>
      <div className="relative mx-1 h-4 text-[10px] tabular-nums text-[#5f5f5f]">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`absolute -translate-x-1/2 ${i + 1 === trl.level ? "text-white" : ""}`} style={{ left: pos(i + 1) }}>
            {i + 1}
          </span>
        ))}
      </div>
      {trl.note && <p className="mt-3 text-[11.5px] text-[#9a9a9a]">{trl.note}</p>}
    </div>
  );
}

const fmtTime = (ms) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

// The restricted file. Content arrives from the server only after the terms
// are accepted and the access code is right.
export default function Dossier({ content, viewer, onLock }) {
  const scrollTo = (id) => document.getElementById(`vx-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!content) return null;

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
      <motion.header
        className="border border-white/15 p-5 sm:p-8"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.24em]">
          <span className="text-[#7c7c7c]">Restricted file · {content.entity}</span>
          <span className="vt-ok">Access granted · status as of {content.asOf}</span>
        </div>
        <ScrambleText as="h1" className="mt-6 block font-[family-name:var(--sw-font-display)] text-[clamp(44px,9vw,104px)] leading-[0.95] tracking-[0.02em] text-white">
          {content.subject}
        </ScrambleText>
        <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Role", content.role],
            ["Entity", content.entity],
            ["Location", content.location],
            ["Session", viewer?.expires ? `Read only · ends ${fmtTime(viewer.expires)}` : "Read only · 8 h"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#7c7c7c]">{k}</dt>
              <dd className="mt-1 text-sm text-white">{v}</dd>
            </div>
          ))}
        </dl>
        {viewer?.name && (
          <p className="mt-6 border-t border-white/10 pt-4 text-[11.5px] leading-relaxed text-[#9a9a9a]">
            Released to <span className="text-white">{viewer.name}</span>
            {viewer.org && <>, {viewer.org}</>}, under the signed terms of access. Share nothing from this file without written approval from Andres Peña.
          </p>
        )}
      </motion.header>

      <div className="mt-8 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <nav className="hidden lg:block" aria-label="File index">
          <ol className="sticky top-6 flex flex-col border-l border-white/10 text-[10.5px] uppercase tracking-[0.14em]">
            {content.sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className="-ml-px block w-full border-l border-transparent py-1.5 pl-4 text-left text-[#7c7c7c] transition-colors hover:border-white hover:text-white"
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex min-w-0 flex-col gap-6">
          {content.sections.map((section) => (
            <motion.section
              key={section.id}
              id={`vx-${section.id}`}
              className="scroll-mt-6 border border-white/15"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
                <ScrambleText as="h2" className="text-[11px] uppercase tracking-[0.22em] text-white">
                  {section.title}
                </ScrambleText>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-[#5f5f5f]">{section.kicker}</span>
              </div>
              <div className="px-5 py-6 sm:px-8">
                {section.trl && <TrlScale trl={section.trl} />}
                {section.paragraphs?.map((p, i) => (
                  <p key={i} className="max-w-[68ch] text-sm leading-[1.85] text-[#c9c9c9] [&+&]:mt-4">
                    <Redact delay={0.1 + i * 0.15}>{p}</Redact>
                  </p>
                ))}
                {section.rows && (
                  <dl className={`divide-y divide-white/10 ${section.paragraphs ? "mt-6 border-t border-white/10" : ""}`}>
                    {section.rows.map(([k, v], i) => (
                      <div key={k} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[190px_1fr] sm:gap-6">
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-[#7c7c7c]">{k}</dt>
                        <dd className="text-sm leading-relaxed text-white">
                          <Redact delay={0.1 + i * 0.08}>
                            <Value value={v} />
                          </Redact>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.list && (
                  <ol className="flex flex-col gap-3">
                    {section.list.map((entry, i) => (
                      <li key={i} className="grid grid-cols-[36px_1fr] text-sm leading-relaxed text-[#c9c9c9]">
                        <span className="text-[11px] tabular-nums text-[#7c7c7c]">{String(i + 1).padStart(2, "0")}</span>
                        <span>
                          <Redact delay={0.1 + i * 0.1}>{entry}</Redact>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                {section.note && <p className="mt-5 border-t border-white/10 pt-4 text-[11.5px] leading-relaxed text-[#8a8a8a]">{section.note}</p>}
              </div>
            </motion.section>
          ))}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              onClick={onLock}
              whileTap={{ scale: 0.97 }}
              className="border border-white bg-white px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-transparent hover:text-white"
            >
              Lock file
            </motion.button>
            <Link href="/" className="border border-white/40 px-6 py-3.5 text-center text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:border-white">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
