"use client";

import { lockScroll } from "@/utils/scroll";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { IconClose } from "./icons";
import { Avatar } from "./post-card";

// Full-screen media view. The image grows out of its place in the feed or
// grid (shared layoutId) and shrinks back on close.
export default function Lightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const unlock = lockScroll();
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="lightbox"
          className="fixed inset-0 z-[90] flex flex-col bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.image?.alt || item.title || "Media"}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
            <span className="flex items-center gap-3 text-[13px]">
              <Avatar author={item.author} size={32} />
              {item.author.name}
            </span>
            <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center text-white/80 hover:text-white" aria-label="Close">
              <IconClose />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-2 sm:px-8" onClick={(e) => e.stopPropagation()}>
            {item.video ? (
              <video className="max-h-full max-w-full" poster={item.video.poster} autoPlay muted loop playsInline controls>
                <source src={item.video.mp4} type="video/mp4" />
                {item.video.webm && <source src={item.video.webm} type="video/webm" />}
              </video>
            ) : (
              <motion.div layoutId={`media-${item.id}`} className={`relative max-h-full ${item.image.figure ? "bg-white p-3" : ""}`}>
                <Image
                  src={item.image.src}
                  alt={item.image.alt || ""}
                  width={1800}
                  height={1200}
                  sizes="100vw"
                  className="max-h-[calc(100dvh-180px)] w-auto max-w-full object-contain"
                />
              </motion.div>
            )}
          </div>
          <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-4 text-white sm:px-6" onClick={(e) => e.stopPropagation()}>
            <p className="line-clamp-3 text-[13px] leading-relaxed text-white/80">{item.title ? <span className="text-white">{item.title}. </span> : null}{item.text}</p>
            {item.href && (
              item.external ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[11px] uppercase tracking-[0.16em] text-white underline underline-offset-4">
                  Open ↗
                </a>
              ) : (
                <Link href={item.href} className="mt-3 inline-block text-[11px] uppercase tracking-[0.16em] text-white underline underline-offset-4">
                  Open post →
                </Link>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
