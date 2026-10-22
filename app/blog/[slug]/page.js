import { checkoutStatus } from "@/utils/checkout";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BookShelf from "../../components/books/book-shelf";
import { formatDate } from "../../components/blog/format-date";
import PostReader from "../../components/blog/post-reader";
import ShareBar from "../../components/blog/share-bar";
import LearnCta from "../../components/helper/learn-cta";
import PageHeader from "../../components/helper/page-header";
import { personalData } from "@/utils/data/personal-data";
import { getPost, getPosts, getRelatedPosts, readingTime } from "@/utils/content";
import { absolute, breadcrumbs, graph, person } from "@/utils/seo";
import JsonLd from "../../components/helper/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const path = `/blog/${slug}`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: path },
    authors: [{ name: "Andres Peña", url: "https://andres.swort.net" }],
    // Drafts render in development and previews only; never let one index.
    robots: post.draft ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url: path,
      title: post.title,
      description: post.summary,
      publishedTime: String(post.date),
      authors: ["Andres Peña"],
      tags: post.tags,
      images: post.cover ? [{ url: post.cover, alt: post.coverAlt ?? post.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: post.cover ? [post.cover] : undefined },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const newer = posts[index - 1];
  const older = posts[index + 1];
  const related = getRelatedPosts(slug);
  const minutes = readingTime(post.body);
  const path = `/blog/${slug}`;

  const article = {
    "@type": "BlogPosting",
    "@id": absolute(`${path}#article`),
    headline: post.title,
    description: post.summary,
    url: absolute(path),
    mainEntityOfPage: absolute(path),
    datePublished: String(post.date),
    author: { "@id": person["@id"] },
    image: post.cover ? absolute(post.cover) : absolute("/og.jpg"),
    keywords: post.tags?.join(", "),
    wordCount: post.body.split(/\s+/).length,
    timeRequired: `PT${minutes}M`,
  };

  return (
    <>
      <JsonLd data={graph(person, article, breadcrumbs([["Home", "/"], ["Blog", "/blog"], [post.title, path]]))} />
      <PageHeader eyebrow={`Writing${post.tags?.[0] ? ` · ${post.tags[0]}` : ""}`} title={post.title} lede={post.summary}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-3">
            <Image src={personalData.profile} alt="" width={28} height={28} className="h-7 w-7 object-cover grayscale" />
            <span className="sw-label text-[var(--sw-white)]">{personalData.name}</span>
          </span>
          <time className="sw-label" dateTime={String(post.date)}>{formatDate(post.date)}</time>
          <span className="sw-label">{minutes} min read</span>
          {post.draft && <span className="sw-status">Draft</span>}
        </div>
      </PageHeader>

      {post.cover && (
        <section className="sw-paper pt-10 sm:pt-14">
          <div className="sw-container">
            <figure className={`relative m-0 overflow-hidden rounded-xl border border-[var(--sw-border)] lg:max-w-[calc(100%-304px)] ${/\/figures\//.test(post.cover) ? "bg-white p-3 sm:p-5" : "bg-black"}`}>
              <Image
                src={post.cover}
                alt={post.coverAlt ?? ""}
                width={1600}
                height={900}
                priority
                sizes="(min-width: 1280px) 900px, 100vw"
                className={`w-full ${/\/figures\//.test(post.cover) ? "max-h-[440px] object-contain" : "aspect-[16/9] object-cover"}`}
              />
            </figure>
          </div>
        </section>
      )}

      <section className="sw-section sw-paper !border-t-0">
        <div className="sw-container">
          <PostReader html={post.html} toc={post.toc} minutes={minutes} title={post.title} path={path} />

          <div className="mt-14 grid gap-8 border-t border-[var(--sw-rule)] pt-8 lg:max-w-[68ch]">
            {post.tags?.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag} className="sw-tag">{tag}</li>
                ))}
              </ul>
            )}
            <div className="lg:hidden">
              <p className="sw-label mb-3">Share</p>
              <ShareBar title={post.title} path={path} />
            </div>
            <div className="flex items-start gap-4 border border-[var(--sw-border)] p-5">
              <Image src={personalData.profile} alt="" width={56} height={56} className="h-14 w-14 shrink-0 object-cover grayscale" />
              <div>
                <p className="text-sm text-[var(--sw-white)]">{personalData.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--sw-silver)]">
                  Founder and CEO of SWORT Aerospace. Writes about sensor integrity, avionics and embedded systems.
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <Link href="/#contact" className="sw-link">Get in touch</Link>
                  <a href={personalData.linkedIn} target="_blank" rel="noopener noreferrer" className="sw-link">
                    LinkedIn <span className="sw-link-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(newer || older) && (
        <nav className="sw-section" aria-label="More posts">
          <div className="sw-container grid gap-px bg-[var(--sw-border)] sm:grid-cols-2">
            {[
              ["Newer", newer, "←"],
              ["Older", older, "→"],
            ].map(([label, p, arrow]) =>
              p ? (
                <Link key={label} href={`/blog/${p.slug}`} className={`group bg-[var(--sw-black)] p-6 sm:p-8 ${label === "Older" ? "sm:text-right" : ""}`}>
                  <span className="sw-label">{label === "Newer" ? `${arrow} ${label}` : `${label} ${arrow}`}</span>
                  <span className="mt-3 block font-[family-name:var(--sw-font-display)] text-[clamp(24px,2.6vw,32px)] leading-[1.05] text-[var(--sw-white)] transition-transform duration-300 group-hover:translate-x-1">
                    {p.title}
                  </span>
                </Link>
              ) : (
                <span key={label} className="hidden bg-[var(--sw-black)] sm:block" />
              )
            )}
          </div>
        </nav>
      )}

      {related.length > 0 && (
        <section className="sw-section sw-paper">
          <div className="sw-container">
            <p className="sw-eyebrow">Related</p>
            <ul className="sw-grid mt-6 grid-cols-1 md:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} className="sw-cell">
                  <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col gap-3">
                    <span className="sw-label">{formatDate(p.date)}</span>
                    <span className="font-[family-name:var(--sw-font-display)] text-[28px] leading-[1.05] text-[var(--sw-white)]">{p.title}</span>
                    <span className="sw-cell-body">{p.summary}</span>
                    <span className="mt-auto pt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--sw-white)]">
                      Read <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <LearnCta />
      <BookShelf tone="paper" eyebrow="From the author" checkout={checkoutStatus()} />
    </>
  );
}
