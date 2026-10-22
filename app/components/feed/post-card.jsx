"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconBookmark, IconDoc, IconHeart, IconPin, IconReply, IconShare } from "./icons";

const EASE = [0.22, 1, 0.36, 1];
const KIND_LABEL = { essay: "Essay", paper: "Paper", article: "Article", photo: "Photo", book: "Book" };

export const hashtag = (tag) => `#${tag.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))}`;

export function Avatar({ author, size = 40 }) {
  const isBrand = author.avatar?.includes("/brand/");
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--sw-border)] ${isBrand ? "bg-black" : "bg-[var(--sw-graphite)]"}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={author.avatar}
        alt=""
        width={size * 2}
        height={size * 2}
        className={isBrand ? "h-[58%] w-auto object-contain" : "h-full w-full object-cover grayscale"}
      />
    </span>
  );
}

// Opens internal routes with Link and everything else in a new tab.
function Go({ href, external, className, children, label }) {
  if (!href) return <div className={className}>{children}</div>;
  if (external || /^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

// Plays only while on screen, never under reduced motion.
function InViewVideo({ video, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView && !reduce) el.play().catch(() => {});
    else el.pause();
  }, [inView, reduce]);
  return (
    <video ref={ref} className={className} poster={video.poster} muted loop playsInline preload="metadata" aria-hidden="true">
      <source src={video.mp4} type="video/mp4" />
      {video.webm && <source src={video.webm} type="video/webm" />}
    </video>
  );
}

// Like, reply, save, share. No counters: the site has no real engagement
// numbers to show, so it shows none.
export function ActionBar({ item, liked, saved, onLike, onSave, className = "" }) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const [shared, setShared] = useState(false);

  const like = () => {
    const on = onLike(item.id);
    if (on && !reduce) setBurst((b) => b + 1);
  };

  const share = async () => {
    const url = new URL(item.external ? item.href : item.href || "/blog", window.location.href).href;
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) await navigator.share({ title: item.title || "Andres Peña", url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      // Dismissed.
    }
  };

  const reply = `mailto:andrfp@swort.net?subject=${encodeURIComponent(`Re: ${item.title || "your post"}`)}`;
  const btn = "group relative flex min-h-[40px] items-center gap-2 px-2 text-[11px] uppercase tracking-[0.12em] text-[var(--sw-gray)] transition-colors";

  return (
    <div className={`-mx-2 flex items-center justify-between ${className}`}>
      <a href={reply} className={`${btn} hover:text-[var(--sw-white)]`} aria-label="Reply by email">
        <IconReply />
        <span className="hidden sm:inline">Reply</span>
      </a>
      <button type="button" onClick={like} aria-pressed={liked} aria-label={liked ? "Unlike" : "Like"} className={`${btn} ${liked ? "text-[#ff4d5e]" : "hover:text-[#ff4d5e]"}`}>
        <motion.span key={burst} className="relative inline-flex" animate={burst ? { scale: [1, 1.35, 0.92, 1] } : {}} transition={{ duration: 0.45 }}>
          <IconHeart filled={liked} />
          <AnimatePresence>
            {burst > 0 &&
              Array.from({ length: 6 }, (_, i) => (
                <motion.span
                  key={`${burst}-${i}`}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-[#ff4d5e]"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos((i / 6) * Math.PI * 2) * 16, y: Math.sin((i / 6) * Math.PI * 2) * 16, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              ))}
          </AnimatePresence>
        </motion.span>
        <span className="hidden sm:inline">{liked ? "Liked" : "Like"}</span>
      </button>
      <button type="button" onClick={() => onSave(item.id)} aria-pressed={saved} aria-label={saved ? "Remove from saved" : "Save"} className={`${btn} ${saved ? "text-[var(--sw-white)]" : "hover:text-[var(--sw-white)]"}`}>
        <motion.span animate={saved && !reduce ? { y: [0, -3, 0] } : {}} transition={{ duration: 0.3 }}>
          <IconBookmark filled={saved} />
        </motion.span>
        <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
      </button>
      <button type="button" onClick={share} aria-label="Share" className={`${btn} hover:text-[var(--sw-white)]`}>
        <IconShare />
        <span className="hidden sm:inline" aria-live="polite">{shared ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}

function Media({ item, onOpenMedia, onDoubleLike }) {
  const reduce = useReducedMotion();
  const [heart, setHeart] = useState(0);
  const lastTap = useRef(0);

  // Double-tap or double-click likes, like every photo app.
  const tap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      onDoubleLike();
      if (!reduce) setHeart((h) => h + 1);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    setTimeout(() => {
      if (lastTap.current === now) onOpenMedia(item);
    }, 330);
  };

  const figure = item.image?.figure;
  return (
    <button type="button" onClick={tap} className="relative mt-3 block w-full overflow-hidden rounded-xl border border-[var(--sw-border)] text-left" aria-label={`Open ${item.image?.alt || "media"}`}>
      {item.video ? (
        <InViewVideo video={item.video} className="aspect-video w-full object-cover" />
      ) : (
        <motion.div layoutId={`media-${item.id}`} className={figure ? "bg-white p-2" : ""}>
          <Image
            src={item.image.src}
            alt={item.image.alt || ""}
            width={1200}
            height={item.kind === "photo" ? 1200 : 675}
            sizes="(min-width: 1024px) 640px, 100vw"
            className={`w-full ${figure ? "max-h-[360px] object-contain" : item.kind === "photo" ? "aspect-square object-cover" : "aspect-video object-cover"}`}
          />
        </motion.div>
      )}
      <AnimatePresence>
        {heart > 0 && (
          <motion.span
            key={heart}
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 1.1] }}
            transition={{ duration: 0.9, times: [0, 0.25, 0.7, 1] }}
            onAnimationComplete={() => setHeart(0)}
          >
            <IconHeart filled width={96} height={96} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function LinkPreview({ item }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block overflow-hidden rounded-xl border border-[var(--sw-border)] transition-colors hover:border-[var(--sw-border-strong)]"
    >
      {item.video ? (
        <InViewVideo video={item.video} className="aspect-video w-full object-cover" />
      ) : (
        item.image && (
          <span className={`block ${item.image.figure ? "bg-white p-2" : ""}`}>
            <Image
              src={item.image.src}
              alt={item.image.alt || ""}
              width={1200}
              height={628}
              sizes="(min-width: 1024px) 640px, 100vw"
              className={`w-full ${item.image.figure ? "max-h-[300px] object-contain" : "aspect-[1.91/1] object-cover"}`}
            />
          </span>
        )
      )}
      <span className="block border-t border-[var(--sw-border)] px-4 py-3 first:border-t-0">
        <span className="block text-[11px] tracking-[0.04em] text-[var(--sw-gray)]">{item.source}</span>
        <span className="mt-1 block text-[14px] leading-snug text-[var(--sw-white)]">{item.title}</span>
      </span>
    </a>
  );
}

function BookStrip({ item }) {
  const { book } = item;
  return (
    <div className="mt-3 flex items-center gap-4 rounded-xl border border-[var(--sw-border)] p-4">
      <div className="sw-bg-grid flex h-[120px] w-[84px] shrink-0 flex-col justify-between border border-white/15 bg-[#0d0d0d] p-2 shadow-[8px_10px_24px_rgba(0,0,0,0.5)]">
        <span className="text-[6px] uppercase tracking-[0.2em] text-[#8d9297]">{book.volume}</span>
        <span className="font-[family-name:var(--sw-font-display)] text-[15px] leading-[0.95] text-white">{book.title}</span>
        <span className="text-[6px] uppercase tracking-[0.2em] text-[#bfc2c5]">{book.author}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[14px] text-[var(--sw-white)]">{item.title}</p>
        <p className="mt-1 text-[12px] text-[var(--sw-gray)]">by {book.author}</p>
        <a href={item.orderHref} className="sw-btn sw-btn-primary mt-3 !px-4 !py-2 !text-[10px]" target={book.buyUrl ? "_blank" : undefined} rel={book.buyUrl ? "noopener noreferrer" : undefined}>
          {book.buyUrl ? "Buy the book" : "Order a copy"}
        </a>
      </div>
    </div>
  );
}

export default function PostCard({ item, liked, saved, onLike, onSave, onTag, onOpenMedia, activeTag }) {
  const showMedia = (item.image || item.video) && item.kind !== "article";

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.4, ease: EASE }}
      className="border-b border-[var(--sw-rule)] px-4 py-5 sm:px-5"
    >
      {item.pinned && (
        <p className="mb-2 ml-[52px] flex items-center gap-1.5 text-[11px] text-[var(--sw-gray)]">
          <IconPin /> Pinned
        </p>
      )}
      <div className="flex gap-3">
        <Avatar author={item.author} />
        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] leading-tight">
            <span className="text-[var(--sw-white)]">{item.author.name}</span>
            <span className="text-[var(--sw-gray)]">@{item.author.handle}</span>
            <span className="text-[var(--sw-gray)]" aria-hidden="true">·</span>
            <span className="text-[var(--sw-gray)]">{item.dateLabel}</span>
            <span className="ml-auto flex items-center gap-1.5">
              {item.draft && <span className="rounded-full border border-[var(--sw-border-strong)] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--sw-silver)]">Draft</span>}
              <span className="rounded-full bg-[var(--sw-graphite)] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--sw-silver)]">{KIND_LABEL[item.kind]}</span>
            </span>
          </header>

          {item.title && item.kind !== "article" && item.kind !== "book" && (
            <Go href={item.href} external={item.external} className="mt-2 block">
              <h3 className="text-[16px] font-medium leading-snug text-[var(--sw-white)] hover:underline hover:decoration-[var(--sw-gray)] hover:underline-offset-4">{item.title}</h3>
            </Go>
          )}
          {item.authors && <p className="mt-1 text-[11.5px] text-[var(--sw-gray)]">{item.authors}</p>}
          <p className={`mt-2 text-[14px] leading-relaxed text-[var(--sw-silver)] ${item.kind === "photo" ? "" : "line-clamp-4"}`}>{item.text}</p>

          {item.tags?.length > 0 && (
            <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[13px]">
              {item.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTag(tag)}
                  className={`min-h-[28px] transition-colors ${activeTag === tag ? "text-[var(--sw-white)] underline underline-offset-4" : "text-[#7fa6d8] hover:underline hover:underline-offset-4"}`}
                >
                  {hashtag(tag)}
                </button>
              ))}
            </p>
          )}

          {showMedia && <Media item={item} onOpenMedia={onOpenMedia} onDoubleLike={() => onLike(item.id, true)} />}
          {item.kind === "article" && <LinkPreview item={item} />}
          {item.kind === "book" && <BookStrip item={item} />}

          {(item.minutes || item.pdf || (item.kind === "paper" && item.href)) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.kind === "paper" && (
                <Link href={item.href} className="rounded-full border border-[var(--sw-border-strong)] px-3 py-1.5 text-[11px] text-[var(--sw-white)] transition-colors hover:border-[var(--sw-white)]">
                  Read the abstract →
                </Link>
              )}
              {item.pdf && (
                <a href={item.pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sw-border-strong)] px-3 py-1.5 text-[11px] text-[var(--sw-white)] transition-colors hover:border-[var(--sw-white)]">
                  <IconDoc /> PDF{item.pages ? ` · ${item.pages} pp.` : ""}
                </a>
              )}
              {item.minutes && (
                <Link href={item.href} className="rounded-full border border-[var(--sw-border-strong)] px-3 py-1.5 text-[11px] text-[var(--sw-white)] transition-colors hover:border-[var(--sw-white)]">
                  Read · {item.minutes} min
                </Link>
              )}
            </div>
          )}

          <ActionBar item={item} liked={liked} saved={saved} onLike={onLike} onSave={onSave} className="mt-2" />
        </div>
      </div>
    </motion.article>
  );
}
