"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import ArticleBody from "./article-body";
import ShareBar from "./share-bar";

// The reading view: the article, plus a sticky rail with how far you are,
// the minutes left, the section you're in and the share buttons. On small
// screens the contents fold into a disclosure above the article.
export default function PostReader({ html, toc = [], minutes, title, path }) {
  const articleRef = useRef(null);
  const [active, setActive] = useState(toc[0]?.id ?? null);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const { scrollYProgress } = useScroll({ target: articleRef, offset: ["start 40%", "end 70%"] });
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  // Rounded so React only re-renders when the shown numbers can change.
  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(Math.round(Math.min(1, Math.max(0, v)) * 100) / 100));

  // The active heading is the last one whose top has passed a line a third
  // of the way down the viewport.
  useEffect(() => {
    if (!toc.length) return;
    // Looked up on every pass: hydration can replace the article's nodes,
    // and a cached, detached heading measures as zero.
    const update = () => {
      const headings = toc.map((t) => document.getElementById(t.id)).filter(Boolean);
      const line = window.innerHeight * 0.33;
      let current = headings[0]?.id ?? null;
      for (const h of headings) if (h.getBoundingClientRect().top - line <= 0) current = h.id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [toc]);

  const left = Math.max(0, Math.ceil(minutes * (1 - progress)));
  const status = progress >= 0.98 ? "Finished" : progress <= 0.01 ? `${minutes} min read` : `${left} min left`;

  const tocList = (onPick) => (
    <ol className="flex flex-col border-l border-[var(--sw-rule)]">
      {toc.map((item) => (
        <li key={item.id} className="relative">
          {active === item.id && (
            <motion.span layoutId="toc-active" className="absolute -left-px top-0 h-full w-px bg-[var(--sw-white)]" transition={{ type: "spring", stiffness: 320, damping: 32 }} />
          )}
          <a
            href={`#${item.id}`}
            onClick={onPick}
            className={`block py-1.5 text-[12px] leading-snug transition-colors ${item.depth === 3 ? "pl-7" : "pl-4"} ${
              active === item.id ? "text-[var(--sw-white)]" : "text-[var(--sw-gray)] hover:text-[var(--sw-white)]"
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
      <div className="min-w-0">
        {toc.length > 0 && (
          <div className="mb-10 border-y border-[var(--sw-rule)] lg:hidden">
            <button
              type="button"
              onClick={() => setTocOpen((o) => !o)}
              aria-expanded={tocOpen}
              className="flex w-full items-center justify-between py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--sw-white)]"
            >
              On this page
              <motion.span animate={{ rotate: tocOpen ? 45 : 0 }} aria-hidden="true" className="text-base leading-none">
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {tocOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pb-4">{tocList(() => setTocOpen(false))}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <ArticleBody ref={articleRef} html={html} />
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-28 flex flex-col gap-8">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="sw-label">Progress</span>
              <span className="text-[11px] tabular-nums text-[var(--sw-silver)]">{status}</span>
            </div>
            <div className="mt-3 h-px w-full bg-[var(--sw-rule)]">
              <motion.div className="h-px origin-left bg-[var(--sw-white)]" style={{ scaleX: bar }} />
            </div>
          </div>
          {toc.length > 0 && (
            <nav aria-label="On this page">
              <p className="sw-label mb-3">On this page</p>
              {tocList()}
            </nav>
          )}
          <div>
            <p className="sw-label mb-3">Share</p>
            <ShareBar title={title} path={path} grid />
          </div>
        </div>
      </aside>

      {/* Phones and tablets: a thin progress line pinned to the bottom edge. */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 z-40 h-[2px] origin-left bg-[var(--sw-white)] mix-blend-difference lg:hidden"
        style={{ scaleX: bar }}
      />
    </div>
  );
}
