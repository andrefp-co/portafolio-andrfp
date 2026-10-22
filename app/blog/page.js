import { getBlogIndex } from "@/utils/content";
import { personalData } from "@/utils/data/personal-data";
import BookShelf from "../components/books/book-shelf";
import BlogExplorer from "../components/blog/blog-explorer";
import LearnCta from "../components/helper/learn-cta";
import PageHeader from "../components/helper/page-header";
import BlogCard from "../components/homepage/blog/blog-card";

export const metadata = {
  title: "Blog",
  description: "Essays and working papers on sensor integrity, runtime diagnosis, embedded firmware and engineering practice.",
};

async function getDevToPosts() {
  // A dev.to outage should show an empty list, not an error page.
  try {
    const res = await fetch(`https://dev.to/api/articles?username=${personalData.devUsername}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((blog) => blog?.cover_image);
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const items = getBlogIndex();
  const devTo = await getDevToPosts();
  const essays = items.filter((i) => i.type === "essay").length;
  const papers = items.length - essays;
  const topics = new Set(items.flatMap((i) => i.tags)).size;

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Notes from the bench."
        lede="Essays and working papers on sensor integrity, runtime diagnosis, embedded firmware, and how to write down what a test actually proved."
      >
        <dl className="mt-10 grid max-w-xl grid-cols-3 border-t border-[var(--sw-rule)] pt-6">
          {[
            ["Essays", essays],
            ["Papers", papers],
            ["Topics", topics],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="sw-label">{label}</dt>
              <dd className="mt-1 font-[family-name:var(--sw-font-display)] text-[40px] leading-none text-[var(--sw-white)]">{value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <section className="sw-section sw-paper !border-t-0">
        <div className="sw-container">
          {items.length > 0 ? (
            <BlogExplorer items={items} />
          ) : (
            <p className="sw-lede">No posts yet. The first ones are being written.</p>
          )}
        </div>
      </section>

      <BookShelf />

      {devTo.length > 0 && (
        <section className="sw-section sw-paper">
          <div className="sw-container">
            <p className="sw-eyebrow">Also on dev.to</p>
            <div className="sw-grid mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {devTo.map((blog, i) => (
                <BlogCard blog={blog} key={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <LearnCta />
    </>
  );
}
