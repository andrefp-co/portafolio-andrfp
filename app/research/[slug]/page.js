import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "../../components/helper/page-header";
import { getResearch, getResearchEntry } from "@/utils/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getResearch().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getResearchEntry(slug);
  return entry ? { title: entry.title, description: entry.summary } : {};
}

export default async function ResearchEntryPage({ params }) {
  const { slug } = await params;
  const entry = getResearchEntry(slug);
  if (!entry) notFound();

  const all = getResearch();
  const next = all[(all.findIndex((e) => e.slug === slug) + 1) % all.length];

  return (
    <>
      <PageHeader eyebrow={`Research · ${entry.area}`} title={entry.title} lede={entry.summary}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="sw-status">{entry.status}</span>
          {entry.repo && (
            <Link href={entry.repo} target="_blank" className="sw-link">
              Source on GitHub <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          )}
          {entry.link && (
            <Link href={entry.link} target="_blank" className="sw-link">
              swort.net <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </PageHeader>

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
              <span className="sw-label">Area</span>
              <p className="mt-2 text-sm text-[var(--sw-white)]">{entry.area}</p>
            </div>
            <Link href="/research" className="sw-link">
              <span aria-hidden="true">←</span> All research
            </Link>
          </aside>
        </div>
      </section>

      {next && next.slug !== slug && (
        <section className="sw-section">
          <div className="sw-container">
            <p className="sw-eyebrow">Next entry</p>
            <Link href={`/research/${next.slug}`} className="group block">
              <span className="sw-head inline-block transition-transform duration-300 group-hover:translate-x-2">
                {next.title} <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
