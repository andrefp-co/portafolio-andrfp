"use client";

import { motion, useInView, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { openMail } from "@/utils/obfuscate";
import Carousel from "../../motion/carousel";

const EASE = [0.22, 1, 0.36, 1];

function TimelineItem({ exp }) {
  const ref = useRef(null);
  // The node lights up once the drawn rail reaches this role.
  const reached = useInView(ref, { once: true, margin: "0px 0px -40% 0px" });

  return (
    <li
      ref={ref}
      className={`relative grid grid-cols-1 gap-3 border-b border-[var(--sw-rule)] py-8 pl-10 md:grid-cols-[minmax(0,200px)_1fr] md:gap-7 md:pl-12 ${
        exp.images?.length ? "lg:grid-cols-[minmax(0,180px)_1fr_minmax(0,300px)]" : ""
      }`}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-[7px] top-[45px] h-px w-5 origin-left bg-[var(--sw-gray)]"
        animate={reached ? { backgroundColor: "#ffffff", scaleX: 1.6 } : {}}
        transition={{ duration: 0.4, ease: EASE }}
      />
      <p className="sw-label pt-[3px]">{exp.duration}</p>
      <div className="min-w-0">
        <h3 className="font-[family-name:var(--sw-font-display)] text-[28px] leading-[1.05] tracking-[0.02em] text-[var(--sw-white)]">
          {exp.title}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--sw-silver)]">{exp.company}</p>
        <div className="mt-4 flex max-w-[68ch] flex-col gap-2">
          {exp.desc?.map((line, i) => (
            <p key={i} className="sw-cell-body">{line}</p>
          ))}
        </div>
        {exp.link && (
          <div className="mt-5">
            <a href={exp.link} target="_blank" rel="noopener noreferrer" className="sw-link">
              Learn more <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        )}
        {exp.partnerAccess && (
          <motion.div
            className="mt-6 max-w-[560px] rounded-xl border border-[var(--sw-border-strong)] bg-[var(--sw-cell)] p-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[var(--sw-white)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
                <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
              </svg>
              For companies and partners
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--sw-silver)]">
              Want to know more about SWORT&apos;s programs? If your company has an access code, open the restricted file: program status, readiness, open gaps and the hardware itself.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/vault" className="sw-btn sw-btn-primary">
                I have an access code
              </Link>
              <button type="button" onClick={() => openMail("Access code request")} className="sw-link">
                Request one
              </button>
            </div>
          </motion.div>
        )}
      </div>
      {exp.images?.length > 0 && (
        <motion.div
          className="max-w-[420px] md:col-start-2 lg:col-start-auto lg:mt-1"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <Carousel images={exp.images} sizes="(min-width: 1024px) 300px, 420px" />
        </motion.div>
      )}
    </li>
  );
}

// A vertical rail that draws itself as the visitor scrolls through the roles.
export default function Timeline({ items }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative mt-10">
      <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-0 w-px bg-[var(--sw-grid-rule)]" />
      <motion.span
        aria-hidden="true"
        className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-white"
        style={{ scaleY }}
      />
      <ol className="border-t border-[var(--sw-rule)]">
        {items.map((exp) => (
          <TimelineItem key={exp.id} exp={exp} />
        ))}
      </ol>
    </div>
  );
}
