"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import RowLink from "../helper/row-link";

const EASE = [0.22, 1, 0.36, 1];
const TYPES = [
  { id: "all", label: "All" },
  { id: "essay", label: "Essays" },
  { id: "paper", label: "Papers" },
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Marks every search term inside a string.
function Highlight({ text, terms }) {
  if (!terms.length) return text;
  const parts = text.split(new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi"));
  return parts.map((part, i) =>
    terms.some((t) => part.toLowerCase() === t) ? (
      <mark key={i} className="bg-[var(--sw-white)] px-[1px] text-[var(--sw-black)]">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function Meta({ item }) {
  return (
    <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-2 md:col-span-1 md:flex-col md:items-start">
      <span className="sw-label text-[var(--sw-white)]">{item.type === "paper" ? "Paper" : "Essay"}</span>
      <span className="sw-label">{item.dateLabel}</span>
      {item.minutes && <span className="sw-label">{item.minutes} min</span>}
      {item.draft && <span className="sw-status">Draft</span>}
    </div>
  );
}

// The blog index: search, type and topic filters, a featured post, and a
// list that re-flows as the filters change. Press "/" to search.
export default function BlogExplorer({ items }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [tag, setTag] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const ofType = items.filter((i) => type === "all" || i.type === type);

  const counts = new Map();
  ofType.forEach((i) => i.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const results = ofType.filter((i) => (!tag || i.tags.includes(tag)) && terms.every((t) => i.search.includes(t)));
  const filtering = terms.length > 0 || tag || type !== "all";
  const featured = filtering ? null : results.find((i) => i.type === "essay") ?? results[0];
  const rest = featured ? results.filter((i) => i !== featured) : results;

  const clear = () => {
    setQuery("");
    setTag(null);
    setType("all");
  };

  const pickType = (id) => {
    setType(id);
    // Drop a topic filter that no longer has entries of the new type.
    if (tag && !items.some((i) => (id === "all" || i.type === id) && i.tags.includes(tag))) setTag(null);
  };

  return (
    <LayoutGroup>
      {/* Controls */}
      <div className="flex flex-col gap-6">
        <label className="relative block">
          <span className="sr-only">Search the blog</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sw-gray)]">
            <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search essays and papers"
            enterKeyHint="search"
            className="w-full border-0 border-b border-[var(--sw-border-strong)] bg-transparent py-4 pl-8 pr-24 text-[17px] text-[var(--sw-white)] outline-none transition-colors placeholder:text-[var(--sw-gray)] focus:border-[var(--sw-white)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--sw-gray)] hover:text-[var(--sw-white)]"
            >
              Clear
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 border border-[var(--sw-border-strong)] px-2 py-0.5 text-[11px] text-[var(--sw-gray)] md:block">
              /
            </kbd>
          )}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6" role="tablist" aria-label="Type">
            {TYPES.map((t) => {
              const count = t.id === "all" ? items.length : items.filter((i) => i.type === t.id).length;
              if (t.id !== "all" && !count) return null;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={type === t.id}
                  onClick={() => pickType(t.id)}
                  className={`relative pb-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    type === t.id ? "text-[var(--sw-white)]" : "text-[var(--sw-gray)] hover:text-[var(--sw-white)]"
                  }`}
                >
                  {t.label} <span className="tabular-nums opacity-60">{count}</span>
                  {type === t.id && <motion.span layoutId="blog-type" className="absolute inset-x-0 bottom-0 h-px bg-[var(--sw-white)]" />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--sw-gray)]" aria-live="polite">
            {results.length} {results.length === 1 ? "entry" : "entries"}
            {filtering && (
              <button type="button" onClick={clear} className="ml-4 text-[var(--sw-white)] underline decoration-[var(--sw-gray)] underline-offset-4">
                Reset
              </button>
            )}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap" aria-label="Topics">
              {tags.map(([name, count]) => {
                const on = tag === name;
                return (
                  <li key={name}>
                    <motion.button
                      type="button"
                      layout
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={on}
                      onClick={() => setTag(on ? null : name)}
                      className={`whitespace-nowrap border px-3 py-2 text-[11px] tracking-[0.06em] transition-colors ${
                        on
                          ? "border-[var(--sw-white)] bg-[var(--sw-white)] text-[var(--sw-black)]"
                          : "border-[var(--sw-border-strong)] text-[var(--sw-silver)] hover:border-[var(--sw-white)] hover:text-[var(--sw-white)]"
                      }`}
                    >
                      {name} <span className="tabular-nums opacity-60">{count}</span>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Featured */}
      <AnimatePresence initial={false}>
        {featured && (
          <motion.div
            key="featured"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <Link href={featured.href} className="group mt-10 block border border-[var(--sw-border-strong)] p-6 transition-colors hover:border-[var(--sw-white)] sm:p-10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="sw-label text-[var(--sw-white)]">Featured {featured.type === "paper" ? "paper" : "essay"}</span>
                <span className="sw-label">{featured.dateLabel}</span>
                {featured.minutes && <span className="sw-label">{featured.minutes} min read</span>}
                {featured.draft && <span className="sw-status">Draft</span>}
              </div>
              <h2 className="mt-5 max-w-[22ch] font-[family-name:var(--sw-font-display)] text-[clamp(40px,6vw,76px)] leading-[0.95] tracking-[0.02em] text-[var(--sw-white)]">
                {featured.title}
              </h2>
              <p className="sw-lede mt-5 max-w-[60ch]">{featured.summary}</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <ul className="flex flex-wrap gap-2">
                  {featured.tags.map((t) => (
                    <li key={t} className="sw-tag">{t}</li>
                  ))}
                </ul>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--sw-white)]">
                  Read <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <motion.ul layout className="mt-10 border-t border-[var(--sw-rule)]">
        <AnimatePresence mode="popLayout" initial={false}>
          {rest.map((item) => (
            <motion.li
              key={item.href}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, ease: EASE }}
              className="border-b border-[var(--sw-rule)]"
            >
              <RowLink href={item.href} className="grid-cols-[1fr_auto] px-1 py-7 md:grid-cols-[minmax(0,180px)_1fr_auto] md:gap-8 md:px-4">
                <Meta item={item} />
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(26px,2.8vw,36px)] leading-[1.04] tracking-[0.02em] text-[var(--sw-white)]">
                    <Highlight text={item.title} terms={terms} />
                  </h3>
                  <p className="sw-cell-body mt-2 max-w-[64ch]">
                    <Highlight text={item.summary} terms={terms} />
                  </p>
                  {item.tags.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <li key={t} className="sw-tag">{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </RowLink>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {results.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
          <p className="sw-lede mx-auto">Nothing matches{query ? ` “${query.trim()}”` : " those filters"}.</p>
          <button type="button" onClick={clear} className="sw-btn sw-btn-ghost mt-6">
            Reset filters
          </button>
        </motion.div>
      )}
    </LayoutGroup>
  );
}
