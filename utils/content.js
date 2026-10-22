// Server-only loader for the markdown in /content. Each file starts with a
// frontmatter block of simple `key: value` lines between `---` fences.
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

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

// Everything the blog index lists: essays (newest first), then papers. Each
// item carries a lower-cased search string over its title, summary, tags and
// body, so the index can filter on the client without fetching anything.
export function getBlogIndex() {
  const essays = getPosts().map((post) => ({
    type: "essay",
    href: `/blog/${post.slug}`,
    title: post.title,
    summary: post.summary ?? "",
    dateLabel: formatDay(post.date),
    minutes: readingTime(post.body),
    tags: post.tags ?? [],
    draft: Boolean(post.draft),
    search: `${post.title} ${post.summary ?? ""} ${(post.tags ?? []).join(" ")} ${plain(post.body)}`.toLowerCase(),
  }));
  const papers = getResearch()
    .filter((entry) => entry.kind === "paper")
    .map((entry) => ({
      type: "paper",
      href: `/research/${entry.slug}`,
      title: entry.title,
      summary: entry.summary ?? "",
      dateLabel: entry.status ?? "Working paper",
      minutes: null,
      tags: entry.tags ?? [],
      draft: false,
      search: `${entry.title} ${entry.summary ?? ""} ${entry.authors ?? ""} ${(entry.tags ?? []).join(" ")} ${plain(entry.body)}`.toLowerCase(),
    }));
  return [...essays, ...papers];
}

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
