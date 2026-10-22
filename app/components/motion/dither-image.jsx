"use client";

import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Ported from swort.net's dither-reveal.js: an image resolves out of an ordered
// (Bayer) dither when it scrolls into view, like a frame arriving over a slow
// link. The canvas sits OVER the real image and is removed afterwards, so the
// image is always in the markup; with reduced motion it is simply shown.
const DURATION = 720;
const STEPS = 9;
const MAX_EDGE = 720;
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

function renderStep(ctx, source, w, h, level) {
  const out = ctx.createImageData(w, h);
  const s = source.data;
  const d = out.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = (0.2126 * s[i] + 0.7152 * s[i + 1] + 0.0722 * s[i + 2]) / 255;
      const threshold = (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64;
      // Early steps are pure 1-bit dither; later steps blend toward the image.
      const bit = lum > threshold ? 255 : 0;
      const v = bit + (lum * 255 - bit) * level;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

export default function DitherImage({ className = "", imgClassName = "", alt, ...imageProps }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { once: true, margin: "0px 0px -15% 0px" });

  useEffect(() => {
    if (!inView || reduce || done) return;
    const img = imgRef.current;
    // A cached image can finish before React attaches onLoad; trust
    // `complete` too so the canvas never stays over a loaded image.
    if (!loaded && !img?.complete) return;
    const canvas = canvasRef.current;
    let raf = 0;
    // Any failure just shows the image; the state change waits a frame so
    // it never runs synchronously inside this effect.
    const giveUp = () => {
      raf = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(raf);
    };
    if (!img || !canvas || !img.naturalWidth) return giveUp();

    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let source;
    try {
      ctx.drawImage(img, 0, 0, w, h);
      source = ctx.getImageData(0, 0, w, h);
    } catch {
      return giveUp();
    }

    let t0 = 0;
    let lastStep = -1;
    const frame = (now) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / DURATION);
      const step = Math.min(STEPS - 1, Math.floor(p * STEPS));
      if (step !== lastStep) {
        renderStep(ctx, source, w, h, step / (STEPS - 1));
        lastStep = step;
      }
      if (p < 1) raf = requestAnimationFrame(frame);
      else setDone(true);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, loaded, reduce, done]);

  // Until the reveal runs, the canvas starts black so the image does not flash
  // in at full detail first. It is rendered the same way on server and client
  // (useReducedMotion differs between them); under reduced motion the
  // stylesheet hides it instead.
  const showCanvas = !done;

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <Image
        ref={imgRef}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setDone(true)}
        className={imgClassName}
        {...imageProps}
      />
      {showCanvas && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="dither-layer"
        />
      )}
    </div>
  );
}
