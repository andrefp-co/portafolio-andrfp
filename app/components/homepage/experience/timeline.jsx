"use client";

import { motion, useInView, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1];

function TimelineItem({ exp }) {
  const ref = useRef(null);
  // The node lights up once the drawn rail reaches this role.
  const reached = useInView(ref, { once: true, margin: "0px 0px -40% 0px" });

  return (
    <li ref={ref} className="relative grid grid-cols-1 gap-3 border-b border-[var(--sw-rule)] py-8 pl-10 md:grid-cols-[minmax(0,200px)_1fr] md:gap-7 md:pl-12">
      <motion.span
        aria-hidden="true"
        className="absolute left-0 top-[38px] h-[15px] w-[15px] border border-[var(--sw-gray)] bg-[var(--sw-black)]"
        animate={reached ? { backgroundColor: "#ffffff", borderColor: "#ffffff" } : {}}
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
      </div>
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
