import { getPosts, getResearch } from "@/utils/content";
import { absolute } from "@/utils/seo";

// Every public page. Drafts never appear: getPosts hides them in production.
export default function sitemap() {
  const now = new Date();
  const pages = [
    { url: absolute("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: absolute("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absolute("/research"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
  const research = getResearch().map((e) => ({
    url: absolute(`/research/${e.slug}`),
    lastModified: e.published ? new Date(`${e.published}T12:00:00Z`) : now,
    changeFrequency: "monthly",
    priority: e.kind === "paper" ? 0.9 : 0.7,
  }));
  const posts = getPosts().map((p) => ({
    url: absolute(`/blog/${p.slug}`),
    lastModified: new Date(`${p.date}T12:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));
  return [...pages, ...research, ...posts];
}
