// Server-only loader for the markdown in /content. Each file starts with a
// frontmatter block of simple `key: value` lines between `---` fences.
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { articles } from "./data/articles";
import { books } from "./data/books";
import { moments } from "./data/moments";
import { press, pressLink, pressStories } from "./data/press";

const ROOT = path.join(process.cwd(), "content");

function parseValue(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith("[") && v.endsWith("]")) {
    return v.slice(1, -1).split(",").map(unquote).filter(Boolean);
  }
  return unquote(v);
}

// Strip quotes only when they wrap the whole value, so a summary like
// `"Tests pass" and "it works" differ.` keeps its inner quotes.
function unquote(raw) {
  const v = raw.trim();
  const q = v[0];
  return (q === '"' || q === "'") && v.length > 1 && v.endsWith(q) ? v.slice(1, -1) : v;
}

function parse(source) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(source);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = parseValue(line.slice(i + 1));
  }
  return { data, body: match[2] };
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const slugify = (s) =>
  decode(s.replace(/<[^>]+>/g, ""))
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "section";
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Markdown to HTML with stable heading ids (collected into a table of
// contents) and code blocks that carry a copy button.
function render(markdown) {
  const toc = [];
  const used = new Map();
  const md = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const base = slugify(html);
        const n = used.get(base) ?? 0;
        used.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        if (depth === 2 || depth === 3) toc.push({ id, depth, text: decode(html.replace(/<[^>]+>/g, "")) });
        return `<h${depth} id="${id}"><a class="sw-anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${html}</h${depth}>\n`;
      },
      code({ text, lang }) {
        const label = lang ? `<span class="sw-code-lang">${escapeHtml(lang)}</span>` : "";
        return `<div class="sw-code">${label}<button type="button" class="sw-code-copy" data-copy>Copy</button><pre><code>${escapeHtml(text)}</code></pre></div>\n`;
      },
    },
  });
  return { html: md.parse(markdown), toc };
}

// Drafts stay out of production builds unless SHOW_DRAFTS=1 is set.
const showDrafts = () => process.env.SHOW_DRAFTS === "1" || process.env.NODE_ENV === "development";

function readCollection(name) {
  const dir = path.join(ROOT, name);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, body } = parse(fs.readFileSync(path.join(dir, file), "utf8"));
      return { slug: file.replace(/\.md$/, ""), ...data, body };
    })
    .filter((entry) => !entry.draft || showDrafts());
}

export function getPosts() {
  return readCollection("blog").sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function getPost(slug) {
  const post = getPosts().find((p) => p.slug === slug);
  return post ? { ...post, ...render(post.body) } : null;
}

// Papers first, then programs; each group by its `order`.
export function getResearch() {
  const rank = (entry) => (entry.kind === "paper" ? 0 : 1);
  return readCollection("research").sort((a, b) => rank(a) - rank(b) || (a.order ?? 99) - (b.order ?? 99));
}

export function getResearchEntry(slug) {
  const entry = getResearch().find((r) => r.slug === slug);
  return entry ? { ...entry, ...render(entry.body) } : null;
}

export function readingTime(text) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}

const formatDay = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const plain = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`|[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

// Posts that share the most tags with this one, newest first on ties.
export function getRelatedPosts(slug, limit = 3) {
  const posts = getPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return [];
  const mine = new Set(post.tags ?? []);
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ post: p, shared: (p.tags ?? []).filter((t) => mine.has(t)).length }))
    .filter((r) => r.shared > 0)
    .sort((a, b) => b.shared - a.shared || String(b.post.date).localeCompare(String(a.post.date)))
    .slice(0, limit)
    .map((r) => r.post);
}

const ANDRES = { name: "Andres Peña", handle: "andrfp", avatar: "/andres-pena.jpg" };
const shortDay = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const figureLike = (src) => /\/figures\/.*\.png$/.test(src ?? "");
const imageOf = (src, alt) => (src ? { src, alt: alt ?? "", figure: figureLike(src) } : null);

// Every post the blog feed shows, newest first with pinned posts on top:
// essays, papers, SWORT articles, photo posts and the book. `sort` orders
// undated posts; only `dateLabel` is shown.
export function getFeed() {
  const essays = getPosts().map((post) => ({
    id: `essay-${post.slug}`,
    kind: "essay",
    href: `/blog/${post.slug}`,
    author: ANDRES,
    sort: String(post.date),
    dateLabel: shortDay(post.date),
    title: post.title,
    text: post.summary ?? "",
    image: imageOf(post.cover, post.coverAlt),
    tags: post.tags ?? [],
    minutes: readingTime(post.body),
    draft: Boolean(post.draft),
    search: `${post.title} ${post.summary ?? ""} ${(post.tags ?? []).join(" ")} ${plain(post.body)}`.toLowerCase(),
  }));

  const papers = getResearch()
    .filter((entry) => entry.kind === "paper")
    .map((entry) => ({
      id: `paper-${entry.slug}`,
      kind: "paper",
      href: `/research/${entry.slug}`,
      author: ANDRES,
      sort: String(entry.published ?? "2026-01-01"),
      dateLabel: entry.status,
      title: entry.title,
      authors: entry.authors,
      text: entry.summary ?? "",
      image: imageOf(entry.cover, entry.coverAlt),
      tags: entry.tags ?? [],
      pdf: entry.pdf ?? null,
      pages: entry.pages ?? null,
      pinned: Boolean(entry.pinned),
      search: `${entry.title} ${entry.summary ?? ""} ${entry.authors ?? ""} ${(entry.tags ?? []).join(" ")} ${plain(entry.body)}`.toLowerCase(),
    }));

  const links = articles.map((a) => ({
    id: `article-${a.id}`,
    kind: "article",
    href: a.url,
    external: true,
    author: a.author,
    sort: a.date,
    dateLabel: shortDay(a.date),
    title: a.title,
    text: a.text,
    source: a.source,
    image: imageOf(a.image, a.imageAlt),
    video: a.video ?? null,
    tags: a.tags ?? [],
    search: `${a.title} ${a.text} ${a.source} ${(a.tags ?? []).join(" ")}`.toLowerCase(),
  }));

  const coverage = pressStories.map((p) => {
    const outlets = press.filter((o) => o.story === p.story).map((o) => o.outlet);
    const link = pressLink(p);
    return {
      id: `press-${p.story}`,
      kind: "article",
      href: link?.href ?? null,
      external: Boolean(link),
      author: { name: "SWORT Aerospace", handle: "swort.net", avatar: "/media/brand/swort-emblem-light.png" },
      sort: p.date ?? "2026-08-17",
      dateLabel: p.date ? shortDay(p.date) : p.outlet,
      title: p.title,
      text: p.text,
      source: `${outlets.join(" · ")} · ${p.kind}`,
      image: null,
      video: null,
      tags: ["Press", "SWORT"],
      search: `${p.title} ${p.text} ${outlets.join(" ")} press`.toLowerCase(),
    };
  });

  const photos = moments.map((m) => ({
    id: `photo-${m.id}`,
    kind: "photo",
    href: m.link ?? null,
    author: m.author,
    sort: m.date ?? "9999",
    dateLabel: m.date ? shortDay(m.date) : m.event,
    title: "",
    text: m.text,
    image: imageOf(m.images[0].src, m.images[0].alt),
    images: m.images.map((img) => ({ ...imageOf(img.src, img.alt), fit: img.fit ?? null })),
    tags: m.tags ?? [],
    search: `${m.text} ${m.event ?? ""} ${(m.tags ?? []).join(" ")}`.toLowerCase(),
  }));

  const bookPosts = books.map((b) => ({
    id: `book-${b.id}`,
    kind: "book",
    href: "#books",
    author: ANDRES,
    sort: "2026-09-01",
    dateLabel: "Book",
    title: `${b.title}${b.volume ? `, ${b.volume}` : ""}`,
    text: b.blurb || `${b.title}${b.volume ? `, ${b.volume}` : ""}, by ${b.author}.${b.formats?.length ? ` ${b.formats.join(" and ")} edition.` : ""}`,
    book: b,
    orderHref: b.buyUrl || "#books",
    tags: ["Book", "Avionics"],
    search: `${b.title} ${b.volume ?? ""} ${b.subtitle ?? ""} ${b.blurb ?? ""} book`.toLowerCase(),
  }));

  return [...essays, ...papers, ...links, ...coverage, ...photos, ...bookPosts].sort(
    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || String(b.sort).localeCompare(String(a.sort))
  );
}

// Story highlights built from the feed: each is a run of posts that share a
// topic, played as slides.
export function getStories(feed) {
  // Carousel posts become one slide per photo.
  const pick = (test) =>
    feed
      .filter(test)
      .flatMap((i) => (i.images?.length > 1 ? i.images.map((image, k) => ({ ...i, id: `${i.id}-${k}`, image })) : [i]))
      .slice(0, 8);
  const stories = [
    { id: "shell", label: "Shell Eco", items: pick((i) => i.tags.includes("Shell Eco-marathon")) },
    { id: "psp", label: "Purdue", items: pick((i) => i.tags.includes("Purdue Space Program")) },
    { id: "csia", label: "CSIA", items: pick((i) => i.tags.includes("CSIA")) },
    { id: "papers", label: "Papers", items: pick((i) => i.kind === "paper") },
    { id: "swort", label: "SWORT", items: pick((i) => i.author.name === "SWORT Aerospace" && !i.tags.includes("SWORT Learn")) },
    { id: "learn", label: "Learn", items: pick((i) => i.tags.includes("SWORT Learn")) },
    { id: "book", label: "Book", items: pick((i) => i.kind === "book") },
  ].filter((s) => s.items.length > 0);
  // Circle covers read best as photos, so a few highlights name theirs.
  const covers = {
    psp: "/media/feed/psp-toad-render.jpg",
    csia: "/media/figures/c4_self_occlusion.png",
    papers: "/media/figures/gate-conditioning-page1.jpg",
    swort: "/media/brand/swort-emblem-light.png",
  };
  return stories.map((s) => {
    const first = s.items.find((i) => i.image || i.video);
    const cover = covers[s.id] ?? first?.video?.poster ?? first?.image?.src ?? null;
    return { ...s, cover, contain: s.id === "swort", figure: s.id === "papers" || s.id === "csia" };
  });
}

// Tag counts across the feed, most used first.
export function getTopics(feed) {
  const counts = new Map();
  feed.forEach((i) => i.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
