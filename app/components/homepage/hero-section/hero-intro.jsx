"use client";

import ScrambleText from "@/app/components/motion/scramble-text";
import LocalTime from "@/app/components/motion/local-time";
import { personalData } from "@/utils/data/personal-data";
import { motion } from "motion/react";
import Link from "next/link";
import SocialLinks from "@/app/components/helper/social-links";

const EASE = [0.22, 1, 0.36, 1];

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: EASE },
});

// The page's one orchestrated moment: the name rises letter by letter out of
// a mask, then the supporting lines settle in underneath it.
export default function HeroIntro() {
  const words = personalData.name.split(" ");
  let letterIndex = 0;

  return (
    <div className="min-w-0 max-w-[680px]">
      <ScrambleText as="p" className="sw-eyebrow">Engineering portfolio</ScrambleText>

      <h1 className="sw-display">
        <span className="sr-only">{personalData.name}</span>
        <span aria-hidden="true" className="flex flex-wrap gap-x-[0.22em]">
          {words.map((word) => (
            // The mask extends above the cap height so accents (the tilde on Ñ)
            // are never clipped once the letters land.
            <span key={word} className="-mt-[0.2em] inline-flex overflow-hidden pb-[0.04em] pt-[0.2em]">
              {word.split("").map((char) => {
                const i = letterIndex++;
                return (
                  // Outer span: the one-time reveal. Inner span: a springy
                  // key that lifts under a pointer or finger, kept separate
                  // so letting go never replays the reveal's stagger delay.
                  <motion.span
                    key={`${char}-${i}`}
                    className="inline-block"
                    initial={{ y: "135%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.9, ease: EASE }}
                  >
                    <motion.span
                      className="inline-block cursor-default"
                      whileHover={{ y: "-10%" }}
                      whileTap={{ y: "-14%", scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 520, damping: 14 }}
                    >
                      {char}
                    </motion.span>
                  </motion.span>
                );
              })}
            </span>
          ))}
        </span>
      </h1>

      <motion.p className="sw-title mt-5 max-w-[560px]" {...rise(0.7)}>
        {personalData.designation}.
      </motion.p>

      <motion.dl className="mt-8 grid max-w-md grid-cols-2 gap-6 border-t border-[var(--sw-rule)] pt-5" {...rise(0.85)}>
        <div>
          <dt className="sw-label">Based in</dt>
          <dd className="mt-1 text-sm text-[var(--sw-white)]">{personalData.address}</dd>
        </div>
        <div>
          <dt className="sw-label">Local time</dt>
          <dd className="mt-1 text-sm text-[var(--sw-white)]">
            <LocalTime timeZone={personalData.timeZone} />
          </dd>
        </div>
      </motion.dl>

      <motion.div className="mt-9 flex flex-wrap gap-3" {...rise(1)}>
        <Link href="#contact" className="sw-btn sw-btn-primary">
          Contact me
        </Link>
        <Link href={personalData.resume} className="sw-btn sw-btn-ghost gap-2" title="The résumé opens with an access code">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="10" rx="1.5" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
          Get resume
        </Link>
      </motion.div>

      <motion.div className="mt-8" {...rise(1.1)}>
        <SocialLinks />
      </motion.div>
    </div>
  );
}
