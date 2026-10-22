import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnCta from "../../components/helper/learn-cta";
import PageHeader from "../../components/helper/page-header";
import { getResearch, getResearchEntry } from "@/utils/content";
import { absolute, breadcrumbs, graph, person } from "@/utils/seo";
import JsonLd from "../../components/helper/json-ld";
import MailButton from "../../components/helper/mail-button";

export const dynamicParams = false;

export function generateStaticParams() {
  return getResearch().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getResearchEntry(slug);
  if (!entry) return {};
  const path = `/research/${slug}`;
  const images = entry.cover ? [{ url: entry.cover, alt: entry.coverAlt ?? entry.title }] : undefined;
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: path },
    authors: [{ name: "Andres Peña", url: "https://andres.swort.net" }],
    openGraph: {
      type: "article",
      url: path,
      title: entry.title,
      description: entry.summary,
      publishedTime: entry.published ? String(entry.published) : undefined,
      authors: ["Andres Peña"],
      tags: entry.tags,
      images,
    },
    twitter: { card: "summary_large_image", title: entry.title, description: entry.summary, images: entry.cover ? [entry.cover] : undefined },
  };
}

export default async function ResearchEntryPage({ params }) {
  const { slug } = await params;
  const entry = getResearchEntry(slug);
  if (!entry) notFound();

  // "Next" stays within papers or within programs.
  const isPaper = entry.kind === "paper";
  const all = getResearch().filter((e) => (e.kind === "paper") === isPaper);
  const next = all[(all.findIndex((e) => e.slug === slug) + 1) % all.length];

  const article = {
    "@type": isPaper ? "ScholarlyArticle" : "TechArticle",
    "@id": absolute(`/research/${slug}#article`),
    headline: entry.title,
    name: entry.title,
    description: entry.summary,
    abstract: isPaper ? entry.summary : undefined,
    url: absolute(`/research/${slug}`),
    author: { "@id": person["@id"] },
    publisher: { "@type": "Organization", name: "SWORT Aerospace", url: "https://swort.net" },
    datePublished: entry.published ? String(entry.published) : undefined,
    image: entry.cover ? absolute(entry.cover) : undefined,
    keywords: entry.tags?.join(", "),
    isAccessibleForFree: true,
    encoding: entry.pdf ? { "@type": "MediaObject", contentUrl: absolute(entry.pdf), encodingFormat: "application/pdf" } : undefined,
    creativeWorkStatus: entry.status,
    codeRepository: entry.repo,
  };

  return (
    <>
      <JsonLd data={graph(person, article, breadcrumbs([["Home", "/"], ["Research", "/research"], [entry.title, `/research/${slug}`]]))} />
      <PageHeader eyebrow={`Research · ${entry.area}`} title={entry.title} lede={entry.subtitle || entry.summary}>
        {entry.authors && <p className="mt-5 text-sm tracking-[0.04em] text-[var(--sw-silver)]">{entry.authors}</p>}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="sw-status">{entry.status}</span>
          {isPaper && entry.pdf && (
            <a href={entry.pdf} target="_blank" rel="noopener noreferrer" className="sw-btn sw-btn-primary">
              Read the PDF{entry.pages ? ` · ${entry.pages} pp.` : ""}
            </a>
          )}
          {isPaper && !entry.pdf && (
            <MailButton subject={`Draft request: ${entry.title}`} className="sw-btn sw-btn-primary">
              Request the draft
            </MailButton>
          )}
          {entry.repo && (
            <Link href={entry.repo} target="_blank" className="sw-link">
              {isPaper ? "CSIA code on GitHub" : "Source on GitHub"} <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          )}
          {entry.link && (
            <Link href={entry.link} target="_blank" className="sw-link">
              swort.net <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </PageHeader>

      {entry.cover && (
        <section className="sw-paper border-b border-[var(--sw-rule)] pt-10 sm:pt-14">
          <div className="sw-container">
            <figure className={`relative m-0 overflow-hidden rounded-xl border border-[var(--sw-border)] ${/\/figures\//.test(entry.cover) ? "bg-white p-3 sm:p-6" : "bg-black"}`}>
              <Image
                src={entry.cover}
                alt={entry.coverAlt ?? ""}
                width={1800}
                height={900}
                priority
                sizes="(min-width: 1280px) 1200px, 100vw"
                className={`w-full ${/\/figures\//.test(entry.cover) ? "max-h-[520px] object-contain" : "max-h-[560px] object-cover"}`}
              />
            </figure>
          </div>
        </section>
      )}

      <section className="sw-section sw-paper !border-t-0">
        <div className="sw-container grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="sw-prose min-w-0" dangerouslySetInnerHTML={{ __html: entry.html }} />
          <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            {entry.highlight && (
              <div className="border-t border-[var(--sw-rule)] pt-4">
                <span className="sw-label">Key result</span>
                <p className="mt-2 text-sm text-[var(--sw-white)]">{entry.highlight}</p>
              </div>
            )}
            <div className="border-t border-[var(--sw-rule)] pt-4">
              <span className="sw-label">{isPaper ? "Type" : "Area"}</span>
              <p className="mt-2 text-sm text-[var(--sw-white)]">{entry.area}</p>
            </div>
            {isPaper && (
              <div className="border-t border-[var(--sw-rule)] pt-4">
                <span className="sw-label">Status</span>
                <p className="mt-2 text-sm text-[var(--sw-white)]">{entry.status}. Not yet peer reviewed.</p>
              </div>
            )}
            <Link href="/research" className="sw-link">
              <span aria-hidden="true">←</span> All research
            </Link>
          </aside>
        </div>
      </section>

      {next && next.slug !== slug && (
        <section className="sw-section">
          <div className="sw-container">
            <p className="sw-eyebrow">{isPaper ? "Companion paper" : "Next entry"}</p>
            <Link href={`/research/${next.slug}`} className="group block">
              <span className="sw-head inline-block transition-transform duration-300 group-hover:translate-x-2">
                {next.title} <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </section>
      )}

      <LearnCta tone="paper" />
    </>
  );
}
