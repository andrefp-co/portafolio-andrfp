// @flow strict
import SectionHeading from "@/app/components/helper/section-heading";
import RowLink from "@/app/components/helper/row-link";
import Link from 'next/link';
import BlogCard from './blog-card';

// Latest writing: essays and papers from the blog index, then dev.to
// articles if there are any.
function Blog({ items = [], blogs = [] }) {
  if (!items.length && !blogs.length) return null;

  return (
    <section id='blogs' className="sw-section sw-paper">
      <div className="sw-container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionHeading eyebrow="Writing" title="From the blog." />
          </div>
          <Link className="sw-btn sw-btn-primary" href="/blog">
            All writing
          </Link>
        </div>

        {items.length > 0 && (
          <ul className="mt-8 border-t border-[var(--sw-rule)]">
            {items.slice(0, 3).map((item) => (
              <li key={item.href} className="border-b border-[var(--sw-rule)]">
                <RowLink href={item.href} className="grid-cols-[1fr_auto] px-1 py-7 md:grid-cols-[minmax(0,180px)_1fr_auto] md:gap-8 md:px-4">
                  <div className="col-span-2 flex flex-wrap items-center gap-3 md:col-span-1 md:flex-col md:items-start">
                    <span className="sw-label text-[var(--sw-white)]">{item.type === "paper" ? "Paper" : "Essay"}</span>
                    <span className="sw-label">{item.dateLabel}</span>
                    {item.draft && <span className="sw-status">Draft</span>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(26px,2.8vw,36px)] leading-[1.04] tracking-[0.02em] text-[var(--sw-white)]">
                      {item.title}
                    </h3>
                    <p className="sw-cell-body mt-2 max-w-[64ch]">{item.summary}</p>
                  </div>
                </RowLink>
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
