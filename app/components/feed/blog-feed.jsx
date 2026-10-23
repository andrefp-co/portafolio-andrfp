"use client";

import { absolute } from "@/utils/seo";
import { toast } from "@/utils/toast";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconClose, IconGrid, IconLink, IconPin2, IconPlay, IconSearch, IconShare } from "./icons";
import Lightbox from "./lightbox";
import PostCard, { Avatar, hashtag } from "./post-card";
import StoryViewer from "./story-viewer";
import { useLocalSet } from "./use-local-set";

const EASE = [0.22, 1, 0.36, 1];
const TABS = [
  { id: "all", label: "Posts" },
  { id: "paper", label: "Papers" },
  { id: "article", label: "Articles" },
  { id: "media", label: "Media" },
  { id: "saved", label: "Saved" },
];

// A profile header like the ones on social apps: photo, name and handle,
// the post counts, the bio, then the buttons. No banner image.
function ProfileHeader({ profile, counts, onTab }) {
  const [copied, setCopied] = useState(false);

  const shareProfile = async () => {
    const url = absolute("/blog");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast(url);
    }
  };

  const button = "flex h-10 items-center justify-center rounded-lg text-[12px] font-medium transition-colors";

  return (
    <header className="px-4 pt-6 sm:px-5 sm:pt-8">
      <div className="flex items-center gap-5 sm:gap-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
          <Avatar author={profile.author} size={92} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[19px] font-semibold leading-tight text-[var(--sw-white)] sm:text-[21px]">
            {profile.author.name}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--sw-gray)]">@{profile.author.handle}</p>
          <ul className="mt-3 flex gap-5 sm:gap-7">
            {counts.map(([label, value, tab]) => (
              <li key={label}>
                <button type="button" onClick={() => onTab(tab)} className="flex flex-col items-start leading-tight hover:opacity-80">
                  <span className="text-[16px] font-semibold tabular-nums text-[var(--sw-white)]">{value}</span>
                  <span className="text-[12px] text-[var(--sw-gray)]">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 max-w-[56ch] text-[14px] leading-relaxed text-[var(--sw-silver)]">{profile.bio}</p>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[var(--sw-gray)]">
        <span className="flex items-center gap-1.5"><IconPin2 /> {profile.location}</span>
        <a href="https://swort.net" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#7fa6d8] hover:underline"><IconLink /> swort.net</a>
      </p>

      <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
        <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className={`${button} bg-[var(--sw-white)] text-[var(--sw-black)] hover:bg-[#d9d9d9]`}>
          Follow
        </a>
        <Link href="/#contact" className={`${button} bg-[#1c1c1c] text-[var(--sw-white)] hover:bg-[#262626]`}>
          Message
        </Link>
        <button type="button" onClick={shareProfile} aria-label="Share profile" aria-live="polite" className={`${button} min-w-10 bg-[#1c1c1c] px-3 text-[var(--sw-white)] hover:bg-[#262626]`}>
          {copied ? "Copied" : <IconShare width={16} height={16} />}
        </button>
      </div>
    </header>
  );
}

function Highlights({ stories, seen, onOpen }) {
  return (
    <div className="mt-5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
      <ul className="flex w-max gap-4">
        {stories.map((story, i) => {
          const isSeen = seen.has(story.id);
          return (
            <li key={story.id}>
              <motion.button
                type="button"
                onClick={() => onOpen(i)}
                whileTap={{ scale: 0.92 }}
                className="flex w-[72px] flex-col items-center gap-2"
                aria-label={`${story.label} highlights`}
              >
                <span className={`rounded-full p-[2px] ${isSeen ? "bg-[var(--sw-border-strong)]" : "bg-gradient-to-tr from-[#7fa6d8] via-white to-[#bfc2c5]"}`}>
                  <span className="block rounded-full border-2 border-[var(--sw-black)]">
                    <span className={`relative block h-[60px] w-[60px] overflow-hidden rounded-full ${story.figure ? "bg-white" : "bg-black"}`}>
                      {story.cover ? (
                        <Image src={story.cover} alt="" fill sizes="64px" className={story.contain ? "object-contain p-3" : story.figure ? "object-cover object-top" : "object-cover"} />
                      ) : (
                        <span aria-hidden="true" className="sw-bg-grid flex h-full flex-col items-center justify-center bg-[#0d0d0d] font-[family-name:var(--sw-font-display)] leading-none text-white">
                          <span className="text-[9px] tracking-[0.18em] text-[#8d9297]">VOL</span>
                          <span className="text-[22px]">I</span>
                        </span>
                      )}
                    </span>
                  </span>
                </span>
                <span className="max-w-full truncate text-[11px] text-[var(--sw-silver)]">{story.label}</span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MediaGrid({ items, onOpen }) {
  if (!items.length) return <p className="px-5 py-16 text-center text-[13px] text-[var(--sw-gray)]">No media here yet.</p>;
  return (
    <div className="grid grid-cols-3 gap-[2px] p-[2px]">
      {items.map((item) => (
        <motion.button
          key={item.id}
          type="button"
          layout
          onClick={() => onOpen(item)}
          className={`group relative aspect-square overflow-hidden ${item.image?.figure ? "bg-white" : "bg-black"}`}
          aria-label={`Open ${item.image?.alt || item.title || "media"}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.span layoutId={item.video ? undefined : `media-${item.id}`} className="absolute inset-0">
            <Image
              src={item.video ? item.video.poster : item.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 220px, 33vw"
              className={`transition-transform duration-500 group-hover:scale-105 ${item.image?.figure ? "object-contain p-1.5" : "object-cover"}`}
            />
          </motion.span>
          {item.video && (
            <span className="absolute right-2 top-2 text-white drop-shadow">
              <IconPlay width={18} height={18} />
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}

function Sidebar({ topics, activeTag, onTag, book }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-4">
        <section className="rounded-2xl border border-[var(--sw-border)] p-4">
          <h2 className="text-[15px] font-medium text-[var(--sw-white)]">Topics</h2>
          <ul className="mt-2">
            {topics.slice(0, 8).map(([tag, count]) => (
              <li key={tag}>
                <button
                  type="button"
                  onClick={() => onTag(tag)}
                  className={`-mx-2 flex w-[calc(100%+16px)] items-baseline justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--sw-graphite)] ${activeTag === tag ? "bg-[var(--sw-graphite)]" : ""}`}
                >
                  <span className="text-[13.5px] text-[var(--sw-white)]">{hashtag(tag)}</span>
                  <span className="text-[11px] text-[var(--sw-gray)]">{count} {count === 1 ? "post" : "posts"}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--sw-border)] p-4">
          <h2 className="text-[15px] font-medium text-[var(--sw-white)]">Company</h2>
          <div className="mt-3 flex items-center gap-3">
            <Avatar author={{ name: "SWORT Aerospace", avatar: "/media/brand/swort-emblem-light.png" }} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] text-[var(--sw-white)]">SWORT Aerospace</p>
              <p className="text-[12px] text-[var(--sw-gray)]">Flight computers and avionics</p>
            </div>
            <a href="https://swort.net" target="_blank" rel="noopener noreferrer" className="rounded-full bg-[var(--sw-white)] px-3 py-1.5 text-[10.5px] uppercase tracking-[0.12em] text-[var(--sw-black)]">
              Visit
            </a>
          </div>
        </section>

        {book && (
          <section className="rounded-2xl border border-[var(--sw-border)] p-4">
            <h2 className="text-[15px] font-medium text-[var(--sw-white)]">The book</h2>
            <a href="#books" className="mt-3 flex items-center gap-3">
              <span className="sw-bg-grid flex h-[84px] w-[60px] shrink-0 flex-col justify-end border border-white/15 bg-[#0d0d0d] p-1.5">
                <span className="font-[family-name:var(--sw-font-display)] text-[11px] leading-[0.95] text-white">{book.title}</span>
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] text-[var(--sw-white)]">{book.title}</span>
                <span className="block text-[12px] text-[var(--sw-gray)]">{book.volume} · Order a copy</span>
              </span>
            </a>
          </section>
        )}

        <a href="https://swort.net/learn" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-[var(--sw-border)] p-4 transition-colors hover:border-[var(--sw-border-strong)]">
          <p className="text-[15px] font-medium text-[var(--sw-white)]">Learn avionics</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--sw-gray)]">A free, seven-stage practice programme in sensors and flight data at SWORT Learn.</p>
          <p className="mt-2 text-[12px] text-[#7fa6d8] group-hover:underline">swort.net/learn ↗</p>
        </a>
      </div>
    </aside>
  );
}

// The blog as a profile feed: header, story highlights, tabs, a timeline of
// essays, papers, articles and photos, a media grid, and saved posts.
export default function BlogFeed({ profile, items, stories, topics, book }) {
  const [tab, setTab] = useState("all");
  const [tag, setTag] = useState(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [storyIndex, setStoryIndex] = useState(null);
  const [likes, toggleLike] = useLocalSet("andres-feed-likes");
  const [saves, toggleSave] = useLocalSet("andres-feed-saved");
  const [seen, markSeen] = useLocalSet("andres-feed-seen");
  const searchRef = useRef(null);
  const tabsRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pickTab = (id) => {
    setTab(id);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pickTag = (t) => {
    setTag((cur) => (cur === t ? null : t));
    if (tab === "media" || tab === "saved") setTab("all");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (i) => (!tag || i.tags?.includes(tag)) && terms.every((t) => i.search.includes(t));
  const visible = items.filter((i) => {
    if (!matches(i)) return false;
    if (tab === "paper" || tab === "article") return i.kind === tab;
    if (tab === "saved") return saves.has(i.id);
    return true;
  });
  // Every photo gets its own tile, including each photo of a carousel post.
  const media = items
    .filter((i) => (i.image || i.video) && matches(i))
    .flatMap((i) => (i.images?.length > 1 ? i.images.map((image, k) => ({ ...i, id: `${i.id}-${k}`, image, images: null })) : [i]));

  const openStory = (i) => {
    setStoryIndex(i);
    markSeen(stories[i].id, true);
  };
  const nextStory = useCallback(() => {
    if (storyIndex === null || storyIndex >= stories.length - 1) {
      setStoryIndex(null);
      return;
    }
    markSeen(stories[storyIndex + 1].id, true);
    setStoryIndex(storyIndex + 1);
  }, [storyIndex, stories, markSeen]);
  const closeStory = useCallback(() => setStoryIndex(null), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const counts = [
    ["Essays", items.filter((i) => i.kind === "essay").length, "all"],
    ["Papers", items.filter((i) => i.kind === "paper").length, "paper"],
    ["Articles", items.filter((i) => i.kind === "article").length, "article"],
    ["Media", media.length, "media"],
  ].filter(([, v]) => v > 0);

  return (
    <LayoutGroup>
      <div className="mx-auto grid max-w-[1060px] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,680px)_320px] lg:px-6">
        <div className="min-w-0 border-[var(--sw-rule)] lg:border-x">
          <ProfileHeader profile={profile} counts={counts} onTab={pickTab} />
          <Highlights stories={stories} seen={seen} onOpen={openStory} />

          {/* Tabs and search, pinned under the navigation while scrolling. */}
          <div ref={tabsRef} className="sticky top-0 z-30 mt-4 scroll-mt-0 border-b border-[var(--sw-rule)] bg-[var(--sw-black)]/90 backdrop-blur-md">
            <div className="flex items-center">
              <div className="flex flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Feed">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative flex min-h-[52px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-2 text-[11.5px] tracking-[0.02em] transition-colors sm:px-3 sm:text-[12px] ${
                      tab === t.id ? "text-[var(--sw-white)]" : "text-[var(--sw-gray)] hover:text-[var(--sw-white)]"
                    }`}
                  >
                    {t.id === "media" && <IconGrid className="hidden sm:block" />}
                    {t.label}
                    {tab === t.id && <motion.span layoutId="feed-tab" className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[var(--sw-white)]" />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                className="flex h-[52px] w-12 shrink-0 items-center justify-center text-[var(--sw-gray)] hover:text-[var(--sw-white)]"
                aria-label={searchOpen ? "Close search" : "Search posts"}
                aria-expanded={searchOpen}
              >
                {searchOpen ? <IconClose /> : <IconSearch />}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {(searchOpen || tag) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 px-4 pb-3 sm:px-5">
                    {searchOpen && (
                      <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts, papers and articles"
                        enterKeyHint="search"
                        className="min-w-0 flex-1 rounded-full border border-[var(--sw-border-strong)] bg-[var(--sw-graphite)] px-4 py-2.5 text-[14px] text-[var(--sw-white)] outline-none placeholder:text-[var(--sw-gray)] focus:border-[var(--sw-white)] [&::-webkit-search-cancel-button]:hidden"
                      />
                    )}
                    {tag && (
                      <button type="button" onClick={() => setTag(null)} className="flex items-center gap-1.5 rounded-full bg-[var(--sw-white)] px-3 py-2 text-[12px] text-[var(--sw-black)]">
                        {hashtag(tag)} <IconClose width={14} height={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {tab === "media" ? (
            <MediaGrid items={media} onOpen={setLightbox} />
          ) : (
            <div aria-live="polite">
              {/* Gives the post titles (h3) a parent heading for screen readers. */}
              <h2 className="sr-only">Posts</h2>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((item) => (
                  <PostCard
                    key={item.id}
                    item={item}
                    liked={likes.has(item.id)}
                    saved={saves.has(item.id)}
                    onLike={toggleLike}
                    onSave={toggleSave}
                    onTag={pickTag}
                    onOpenMedia={setLightbox}
                    activeTag={tag}
                  />
                ))}
              </AnimatePresence>
              {visible.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <p className="text-[14px] text-[var(--sw-white)]">{tab === "saved" ? "Nothing saved yet" : "Nothing matches"}</p>
                  <p className="mt-1 text-[13px] text-[var(--sw-gray)]">
                    {tab === "saved" ? "Tap the bookmark on any post to keep it here, on this device." : "Try another word or clear the topic."}
                  </p>
                </div>
              ) : (
                <p className="px-5 py-10 text-center text-[12px] text-[var(--sw-gray)]">You&apos;re all caught up.</p>
              )}
            </div>
          )}
        </div>

        <Sidebar topics={topics} activeTag={tag} onTag={pickTag} book={book} />
      </div>

      <Lightbox item={lightbox} onClose={closeLightbox} />
      <StoryViewer story={storyIndex === null ? null : stories[storyIndex]} onClose={closeStory} onNextStory={nextStory} />
    </LayoutGroup>
  );
}
