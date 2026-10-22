"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

const EASE = [0.76, 0, 0.24, 1];

// A photograph that wipes open from the bottom and settles from a slight
// push-in when it scrolls into view. Full resolution from the first frame:
// no pixel or dither stage. Visibility is watched on the unclipped wrapper:
// an element clipped to nothing never reports itself as in view.
export default function RevealImage({ src, alt, width, height, sizes, className = "", imgClassName = "", priority = false }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <div ref={ref} className={`relative overflow-hidden bg-[var(--sw-graphite)] ${className}`}>
      <motion.div
        data-reveal
        className="h-full w-full"
        initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        transition={{ duration: 1, ease: EASE }}
      >
        <motion.div
          data-reveal
          className="h-full w-full"
          initial={reduce ? false : { scale: 1.12 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} className={imgClassName} />
        </motion.div>
      </motion.div>
    </div>
  );
}
