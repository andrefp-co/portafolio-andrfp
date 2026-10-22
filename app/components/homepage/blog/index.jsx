// @flow strict
import SectionHeading from "@/app/components/helper/section-heading";
import Image from "next/image";
import Link from 'next/link';
import BlogCard from './blog-card';

const KIND = { essay: "Essay", paper: "Paper", article: "Article", photo: "Photo", book: "Book" };

function FeedTile({ item }) {
  const inner = (
    <>
      <span className={`relative block aspect-[4/3] overflow-hidden ${item.image?.figure ? "bg-white" : "bg-black"}`}>
        <Image
          src={item.video?.poster ?? item.image.src}
          alt={item.image?.alt ?? ""}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className={`transition-transform duration-700 group-hover:scale-[1.04] ${item.image?.figure ? "object-contain p-3" : "object-cover"}`}
        />
      </span>
      <span className="flex flex-1 flex-col gap-2 p-5">
        <span className="flex items-center gap-2 text-[11px] text-[var(--sw-gray)]">
          <span className="border border-[var(--sw-border-strong)] px-1.5 py-px text-[9px] uppercase tracking-[0.14em] text-[var(--sw-silver)]">{KIND[item.kind]}</span>
          {item.dateLabel}
        </span>
        <span className="text-[15px] font-medium leading-snug text-[var(--sw-white)]">{item.title || item.text}</span>
        {item.title && <span className="line-clamp-2 text-[13px] leading-relaxed text-[var(--sw-silver)]">{item.text}</span>}
      </span>
    </>
  );
  const cls = "group flex h-full flex-col overflow-hidden border border-[var(--sw-border)] bg-[var(--sw-cell)] transition-colors hover:border-[var(--sw-border-strong)]";
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

// Latest writing from the blog feed, as image cards, then dev.to articles if
// any. Photo posts and papers are left to the feed itself: their pictures
// already appear in Experience and Research on this page.
function Blog({ items = [], blogs = [] }) {
  const tiles = items.filter((i) => (i.kind === "essay" || i.kind === "article") && (i.image || i.video)).slice(0, 3);
  if (!tiles.length && !blogs.length) return null;

  return (
    <section id='blogs' className="sw-section sw-paper">
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
