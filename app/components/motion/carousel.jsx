"use client";

import Image from "next/image";
import { useRef, useState } from "react";

// A swipeable row of photos: native scroll-snap for touch, arrow buttons for
// mouse, dots and a counter for position. `onTap(index)` fires on a tap or
// click; double taps are left to the parent (see post-card).
export default function Carousel({ images, className = "", aspect = "aspect-[4/3]", sizes = "100vw", onTap, rounded = "rounded-xl" }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  const go = (i) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={`group/carousel relative overflow-hidden border border-[var(--sw-border)] ${rounded} ${className}`}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription={many ? "carousel" : undefined}
      >
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => onTap?.(i)}
            className={`relative w-full shrink-0 snap-center ${aspect} ${img.figure ? "bg-white" : "bg-black"}`}
            aria-label={many ? `Photo ${i + 1} of ${images.length}: ${img.alt}` : img.alt}
          >
            <Image src={img.src} alt={img.alt ?? ""} fill sizes={sizes} className={img.figure || img.fit === "contain" ? "object-contain p-2" : "object-cover"} />
          </button>
        ))}
      </div>

      {many && (
        <>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] tabular-nums text-white backdrop-blur">
            {index + 1}/{images.length}
          </span>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((img, i) => (
              <span key={img.src} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
          {index > 0 && (
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover/carousel:opacity-100 sm:flex"
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover/carousel:opacity-100 sm:flex"
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </>
      )}
    </div>
  );
}
