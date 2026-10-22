"use client";

import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconClose } from "./icons";
import { Avatar } from "./post-card";

const SLIDE_MS = 5000;

// Highlights played as stories: one slide per post, a progress bar per
// slide, tap the right side for next and the left for previous, hold to
// pause. Under reduced motion slides only move when tapped.
export default function StoryViewer({ story, onClose, onNextStory }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [storyId, setStoryId] = useState(story?.id);
  const progress = useMotionValue(0);

  // A new highlight starts at its first slide.
  if (story?.id !== storyId) {
    setStoryId(story?.id);
    setIndex(0);
  }

  const slides = story?.items ?? [];
  const slide = slides[index];

  const next = useCallback(() => {
    progress.set(0);
    if (index < slides.length - 1) setIndex((i) => i + 1);
    else onNextStory();
  }, [index, slides.length, onNextStory, progress]);
  const prev = () => {
    progress.set(0);
    setIndex((i) => Math.max(0, i - 1));
  };

  useEffect(() => {
    progress.set(0);
  }, [story?.id, progress]);

  // Advance on a frame clock so holding the slide really pauses it.
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);
  useAnimationFrame((_, delta) => {
    if (!story || paused || reduce) return;
    const v = progress.get() + delta / SLIDE_MS;
    if (v >= 1) nextRef.current();
    else progress.set(v);
  });

  useEffect(() => {
    if (!story) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") {
        progress.set(0);
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [story, next, onClose, progress]);

  const tap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width / 3) prev();
    else next();
  };

  return (
    <AnimatePresence>
      {story && slide && (
        <motion.div
          key="story"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${story.label} highlights`}
        >
          <motion.div
            className="relative flex h-[100dvh] w-full max-w-[460px] flex-col overflow-hidden bg-[#0b0b0b] sm:h-[min(820px,92dvh)] sm:rounded-2xl"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Progress */}
            <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-3">
              {slides.map((s, i) => (
                <span key={s.id} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/25">
                  {i < index && <span className="block h-full w-full bg-white" />}
                  {i === index && <motion.span className="block h-full origin-left bg-white" style={{ scaleX: reduce ? 1 : progress }} />}
                </span>
              ))}
            </div>

            <div className="absolute inset-x-0 top-5 z-20 flex items-center justify-between px-3 text-white">
              <span className="flex items-center gap-2 text-[12px]">
                <Avatar author={slide.author} size={30} />
                <span>{story.label}</span>
                <span className="text-white/60">{slide.dateLabel}</span>
              </span>
              <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center text-white/80 hover:text-white" aria-label="Close">
                <IconClose />
              </button>
            </div>

            {/* Slide: tap zones for previous and next, hold to pause. */}
            <button
              type="button"
              className="relative flex-1 cursor-pointer"
              onClick={tap}
              onPointerDown={() => setPaused(true)}
              onPointerUp={() => setPaused(false)}
              onPointerLeave={() => setPaused(false)}
              aria-label="Next slide"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={slide.id}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {slide.video ? (
                    <video className="h-full w-full object-cover" poster={slide.video.poster} autoPlay={!reduce} muted loop playsInline>
                      <source src={slide.video.mp4} type="video/mp4" />
                    </video>
                  ) : slide.image ? (
                    <div className={`relative flex h-full w-full items-center justify-center ${slide.image.figure ? "bg-white" : ""}`}>
                      <Image src={slide.image.src} alt={slide.image.alt || ""} fill sizes="460px" className={slide.image.figure ? "object-contain p-4" : "object-cover"} />
                    </div>
                  ) : (
                    <div className="sw-bg-grid flex h-full w-full items-center px-8">
                      <p className="font-[family-name:var(--sw-font-display)] text-[44px] leading-[0.95] text-white">{slide.title}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </button>

            <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-6 text-white">
              {slide.title && <p className="text-[15px] font-medium leading-snug">{slide.title}</p>}
              <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-white/75">{slide.text}</p>
              {slide.href && (
                slide.external ? (
                  <a href={slide.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-black">
                    Open ↗
                  </a>
                ) : (
                  <Link href={slide.href} className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-black">
                    Open →
                  </Link>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
