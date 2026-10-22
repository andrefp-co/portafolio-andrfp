// Server-only loader for the markdown in /content. Each file starts with a
// frontmatter block of simple `key: value` lines between `---` fences.
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

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
  return post ? { ...post, html: marked.parse(post.body) } : null;
}

export function getResearch() {
  return readCollection("research").sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getResearchEntry(slug) {
  const entry = getResearch().find((r) => r.slug === slug);
  return entry ? { ...entry, html: marked.parse(entry.body) } : null;
}

export function readingTime(text) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 220));
}
