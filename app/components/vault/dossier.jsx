"use client";

import { motion } from "motion/react";
import Link from "next/link";
import ScrambleText from "../motion/scramble-text";

const EASE = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function Value({ value }) {
  if (/^https?:\/\//.test(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="break-all underline decoration-white/40 underline-offset-4 hover:decoration-white">
        {value.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return (
      <a href={`mailto:${value}`} className="break-all underline decoration-white/40 underline-offset-4 hover:decoration-white">
        {value}
      </a>
    );
  }
  return <span>{value}</span>;
}

// The restricted portfolio. Content arrives from the server only after the
// access code is accepted.
export default function Dossier({ content, onLock }) {
  if (!content) return null;

  return (
    <motion.div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6" variants={container} initial="hidden" animate="shown">
      <motion.header variants={item} className="border border-white/15 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-[0.26em] text-[#7c7c7c]">Dossier · Restricted</span>
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] vt-ok">
            <span className="sw-live-dot !bg-current" aria-hidden="true" />
            Access granted
          </span>
        </div>
        <h1 className="mt-6 font-[family-name:var(--sw-font-display)] text-[clamp(48px,9vw,104px)] leading-[0.95] tracking-[0.02em] text-white">
          {content.subject}
        </h1>
        <dl className="mt-8 grid grid-cols-1 gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#7c7c7c]">Role</dt>
            <dd className="mt-1 text-sm text-white">{content.role}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#7c7c7c]">Location</dt>
            <dd className="mt-1 text-sm text-white">{content.location}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-[#7c7c7c]">Clearance</dt>
            <dd className="mt-1 text-sm text-white">Guest · session expires in 8 h</dd>
          </div>
        </dl>
      </motion.header>

      {content.sections.map((section) => (
        <motion.section key={section.id} variants={item} className="mt-6 border border-white/15">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 sm:px-8">
            <ScrambleText as="h2" className="text-[11px] uppercase tracking-[0.22em] text-[#bdbdbd]">
              {section.title}
            </ScrambleText>
            <span className="text-[10px] tracking-[0.2em] text-[#5f5f5f]">/{section.id}</span>
          </div>
          <div className="px-6 py-6 sm:px-8">
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="max-w-[68ch] text-sm leading-[1.85] text-[#c9c9c9] [&+&]:mt-4">{p}</p>
            ))}
            {section.rows && (
              <dl className="divide-y divide-white/10">
                {section.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-6">
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-[#7c7c7c]">{k}</dt>
                    <dd className="text-sm text-white"><Value value={v} /></dd>
                  </div>
                ))}
              </dl>
            )}
            {section.list && (
              <ol className="flex flex-col gap-3">
                {section.list.map((entry, i) => (
                  <li key={i} className="grid grid-cols-[40px_1fr] text-sm leading-relaxed text-[#c9c9c9]">
                    <span className="text-[11px] tabular-nums text-[#7c7c7c]">{String(i + 1).padStart(2, "0")}</span>
                    <span>{entry}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </motion.section>
      ))}

      <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
        <motion.button
          type="button"
          onClick={onLock}
          whileTap={{ scale: 0.96 }}
          className="border border-white bg-white px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-black hover:bg-transparent hover:text-white"
        >
          Lock vault
        </motion.button>
        <Link href="/" className="border border-white/40 px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-white hover:border-white">
          Back to site
        </Link>
      </motion.div>
    </motion.div>
  );
}
