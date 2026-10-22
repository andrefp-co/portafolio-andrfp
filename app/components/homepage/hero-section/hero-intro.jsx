"use client";

import ScrambleText from "@/app/components/motion/scramble-text";
import LocalTime from "@/app/components/motion/local-time";
import { personalData } from "@/utils/data/personal-data";
import { motion } from "motion/react";
import Link from "next/link";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { FaFacebook, FaTwitterSquare } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const socials = [
  { label: "GitHub", href: personalData.github, Icon: BsGithub },
  { label: "LinkedIn", href: personalData.linkedIn, Icon: BsLinkedin },
  { label: "Facebook", href: personalData.facebook, Icon: FaFacebook },
  { label: "LeetCode", href: personalData.leetcode, Icon: SiLeetcode },
  { label: "X / Twitter", href: personalData.twitter, Icon: FaTwitterSquare },
];

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
    <div className="min-w-0">
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
                  <motion.span
                    key={`${char}-${i}`}
                    className="inline-block"
                    initial={{ y: "135%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.9, ease: EASE }}
                  >
                    {char}
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
          <dd className="mt-1 text-sm text-white">{personalData.address}</dd>
        </div>
        <div>
          <dt className="sw-label">Local time</dt>
          <dd className="mt-1 text-sm text-white">
            <LocalTime timeZone={personalData.timeZone} />
          </dd>
        </div>
      </motion.dl>

      <motion.div className="mt-9 flex flex-wrap gap-3" {...rise(1)}>
        <Link href="#contact" className="sw-btn sw-btn-primary">
          Contact me
        </Link>
        <Link href={personalData.resume} target="_blank" className="sw-btn sw-btn-ghost">
          Get resume
        </Link>
      </motion.div>

      <motion.div className="mt-8 flex flex-wrap gap-2" {...rise(1.1)}>
        {socials.filter(({ href }) => href).map(({ label, href, Icon }) => (
          <Link key={label} href={href} target="_blank" aria-label={label} className="sw-icon-btn">
            <Icon size={18} />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
