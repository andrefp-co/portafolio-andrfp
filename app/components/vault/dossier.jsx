"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];

function Value({ value }) {
  if (/^https?:\/\//.test(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="break-all underline decoration-black/30 underline-offset-4 hover:decoration-black">
        {value.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return (
      <a href={`mailto:${value}`} className="break-all underline decoration-black/30 underline-offset-4 hover:decoration-black">
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
    <div ref={ref} className="mb-6 border border-black/10 bg-[#f7f7f5] px-4 pb-3 pt-4">
      <div className="flex items-baseline justify-between gap-4 text-[11px]">
        <span className="uppercase tracking-[0.14em] text-[#6b6b6b]">Technology readiness</span>
        <span className="tabular-nums text-black">{label}</span>
      </div>
      <div className="relative mx-1 mt-4 h-4" role="img" aria-label={`${label} on a scale of 1 to 9`}>
        <span className="absolute inset-x-0 top-1/2 h-px bg-black/15" />
        <motion.span
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 origin-left bg-black"
          style={{ width: pos(trl.level) }}
          initial={{ scaleX: reduce ? 1 : 0 }}
          animate={inView || reduce ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        />
        {reach && (
          <span
            className="absolute top-1/2 border-t border-dashed border-black/50"
            style={{ left: pos(trl.level), width: `calc(${pos(reach)} - ${pos(trl.level)})` }}
          />
        )}
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-2.5 w-px -translate-y-1/2"
            style={{ left: pos(i + 1), background: i + 1 <= trl.level ? "#000" : "rgba(0,0,0,0.25)" }}
          />
        ))}
      </div>
      <div className="relative mx-1 h-4 text-[10px] tabular-nums text-[#8a8a8a]">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`absolute -translate-x-1/2 ${i + 1 === trl.level ? "text-black" : ""}`} style={{ left: pos(i + 1) }}>
            {i + 1}
          </span>
        ))}
      </div>
      {trl.note && <p className="mt-2 text-[12px] text-[#555]">{trl.note}</p>}
    </div>
  );
}

const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);

// The viewer's name tiled faintly across the page, so a screenshot carries
// who the file was released to.
function Watermark({ viewer, date }) {
  const label = [viewer?.name, viewer?.org, date].filter(Boolean).join("  ·  ");
  if (!label) return null;
  const width = Math.max(380, label.length * 9 + 120);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='140'><text x='20' y='76' fill='black' fill-opacity='0.045' font-family='ui-monospace, monospace' font-size='12' letter-spacing='1.5'>${escapeXml(label)}</text></svg>`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-1/2 -rotate-[24deg]"
        style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, backgroundSize: `${width}px 140px` }}
      />
    </div>
  );
}

const fmtTime = (ms) => new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// The restricted file, set as a controlled document. Content arrives from the
// server only after the terms are signed and the access code is right.
export default function Dossier({ content, viewer, onLock, termsVersion }) {
  if (!content) return null;
  const scrollTo = (id) => document.getElementById(`vx-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const released = today();

  const control = [
    ["Released to", viewer?.name ? `${viewer.name}${viewer.org ? `, ${viewer.org}` : ""}` : "Session holder"],
    ["Terms", termsVersion ? `v${termsVersion}, accepted` : "Accepted"],
    ["Session", viewer?.expires ? `Read only, ends ${fmtTime(viewer.expires)}` : "Read only, 8 hours"],
    ["Status as of", content.asOf],
  ];

  return (
    <div className="min-h-full bg-[#141414] px-0 py-0 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-[1180px] gap-8">
        <nav className="hidden w-[210px] shrink-0 lg:block" aria-label="Contents">
          <div className="sticky top-6 text-[12px]">
            <p className="mb-3 text-[10.5px] uppercase tracking-[0.18em] text-[#7c7c7c]">Contents</p>
            <ol className="flex flex-col">
              {content.sections.map((s, i) => (
                <li key={s.id}>
                  <button type="button" onClick={() => scrollTo(s.id)} className="flex w-full gap-3 py-1.5 text-left text-[#a8a8a8] transition-colors hover:text-white">
                    <span className="w-5 shrink-0 tabular-nums text-[#6b6b6b]">{i + 1}</span>
                    <span>{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <motion.article
          className="relative min-w-0 flex-1 overflow-hidden bg-white text-[#1a1a1a] shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        >
          <Watermark viewer={viewer} date={released} />

          <div className="relative px-5 pb-12 pt-6 sm:px-12 sm:pt-10">
            <div className="flex items-center justify-between gap-4 border-b border-black pb-3">
              <span className="flex items-center gap-2.5">
                <Image src="/media/brand/swort-emblem-dark.png" alt="" width={20} height={22} className="h-[22px] w-auto" />
                <span className="text-[11px] uppercase tracking-[0.2em]">SWORT Aerospace</span>
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#6b6b6b]">Restricted</span>
            </div>

            <h1 className="mt-8 font-[family-name:var(--sw-font-display)] text-[clamp(44px,7vw,80px)] leading-[0.92] tracking-[0.01em] text-black">
              {content.subject}
            </h1>
            <p className="mt-3 text-[14px] text-[#444]">
              {content.role} · {content.location}
            </p>

            <dl className="mt-8 grid grid-cols-1 border-t border-black/15 text-[13px] sm:grid-cols-2">
              {control.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b border-black/15 py-2.5 sm:odd:pr-6 sm:even:border-l sm:even:pl-6">
                  <dt className="text-[#6b6b6b]">{k}</dt>
                  <dd className="text-black">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[12px] leading-relaxed text-[#555]">
              Released under the signed terms of access. Do not share, copy or quote any part of this file without written approval from Andres Peña.
            </p>

            {content.sections.map((section, n) => (
              <motion.section
                key={section.id}
                id={`vx-${section.id}`}
                className="mt-12 scroll-mt-6"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-black pb-2">
                  <h2 className="flex items-baseline gap-3 text-[15px] font-medium text-black">
                    <span className="tabular-nums text-[#6b6b6b]">{n + 1}</span>
                    {section.title}
                  </h2>
                  <span className="shrink-0 text-[10.5px] uppercase tracking-[0.16em] text-[#8a8a8a]">{section.kicker}</span>
                </div>
                <div className="pt-5">
                  {section.trl && <TrlScale trl={section.trl} />}
                  {section.paragraphs?.map((p, i) => (
                    <p key={i} className="max-w-[70ch] text-[14px] leading-[1.8] text-[#2a2a2a] [&+&]:mt-4">
                      {p}
                    </p>
                  ))}
                  {section.rows && (
                    <table className={`w-full border-collapse text-[13.5px] ${section.paragraphs ? "mt-5" : ""}`}>
                      <tbody>
                        {section.rows.map(([k, v]) => (
                          <tr key={k} className="border-t border-black/12 align-top first:border-t-black/25 last:border-b last:border-b-black/12">
                            <th scope="row" className="w-[34%] py-2.5 pr-4 text-left font-normal text-[#6b6b6b] sm:w-[30%]">{k}</th>
                            <td className="py-2.5 text-black"><Value value={v} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {section.list && (
                    <ol className="flex flex-col gap-2.5">
                      {section.list.map((entry, i) => (
                        <li key={i} className="grid grid-cols-[34px_1fr] text-[14px] leading-relaxed text-[#2a2a2a]">
                          <span className="tabular-nums text-[#8a8a8a]">{n + 1}.{i + 1}</span>
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {section.note && <p className="mt-4 text-[12.5px] italic leading-relaxed text-[#555]">{section.note}</p>}
                </div>
              </motion.section>
            ))}

            <div className="mt-14 flex flex-col gap-4 border-t border-black pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#6b6b6b]">End of file</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <motion.button
                  type="button"
                  onClick={onLock}
                  whileTap={{ scale: 0.97 }}
                  className="border border-black bg-black px-6 py-3 text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-black"
                >
                  Lock file
                </motion.button>
                <Link href="/" className="border border-black/30 px-6 py-3 text-center text-[11px] uppercase tracking-[0.14em] text-black transition-colors hover:border-black">
                  Back to site
                </Link>
              </div>
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
