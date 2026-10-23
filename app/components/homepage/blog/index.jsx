// @flow strict
import SectionHeading from "@/app/components/helper/section-heading";
import Link from 'next/link';
import BlogCard from './blog-card';

const KIND = { essay: "Essay", paper: "Paper", article: "Article", photo: "Photo", book: "Book" };

function FeedTile({ item }) {
  const inner = (
    <>
      <span className="flex items-center gap-2 text-[11px] text-[var(--sw-gray)]">
        <span className="border border-[var(--sw-border-strong)] px-1.5 py-px text-[9px] uppercase tracking-[0.14em] text-[var(--sw-silver)]">{KIND[item.kind]}</span>
        {item.dateLabel}
      </span>
      <span className="mt-4 font-[family-name:var(--sw-font-display)] text-[24px] leading-[1.05] tracking-[0.02em] text-[var(--sw-white)] [text-wrap:balance]">
        {item.title || item.text}
      </span>
      {item.title && <span className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-[var(--sw-silver)]">{item.text}</span>}
      <span className="mt-auto pt-6 text-[11px] uppercase tracking-[0.14em] text-[var(--sw-white)]">
        Read <span className="inline-block transition-transform group-hover:translate-x-0.5" aria-hidden="true">{item.external ? "↗" : "→"}</span>
      </span>
    </>
  );
  const cls = "group flex h-full flex-col border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 transition-colors hover:border-[var(--sw-border-strong)]";
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={item.href ?? "/blog"} className={cls}>
      {inner}
    </Link>
  );
}

// Latest writing from the blog feed, as text cards in the same style as the
// research entries, then dev.to articles if any. Photo posts and papers are
// left to the feed itself.
function Blog({ items = [], blogs = [] }) {
  const tiles = items.filter((i) => i.kind === "essay" || (i.kind === "article" && i.href)).slice(0, 3);
  if (!tiles.length && !blogs.length) return null;

  return (
    <section id='blogs' className="sw-section">
      <div className="sw-container">
        <SectionHeading
          eyebrow="Writing"
          title="From the blog."
          action={
            <Link className="sw-btn sw-btn-ghost" href="/blog">
              Open the feed <span aria-hidden="true">→</span>
            </Link>
          }
        />

        {tiles.length > 0 && (
          <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {tiles.map((item) => (
              <li key={item.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
                <FeedTile item={item} />
              </li>
            ))}
          </ul>
        )}

        {blogs.length > 0 && (
          <div className="sw-grid mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.slice(0, 3).map((blog, i) => (
              <BlogCard blog={blog} key={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
