import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "../../components/blog/post-list";
import PageHeader from "../../components/helper/page-header";
import { getPost, getPosts, readingTime } from "@/utils/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <PageHeader eyebrow="Writing" title={post.title} lede={post.summary}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <time className="sw-label" dateTime={String(post.date)}>{formatDate(post.date)}</time>
          <span className="sw-label">{readingTime(post.body)} min read</span>
          {post.draft && <span className="sw-status">Draft</span>}
        </div>
      </PageHeader>

      <section className="sw-section sw-paper !border-t-0">
        <div className="sw-container">
          <article className="sw-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--sw-rule)] pt-6">
            {post.tags?.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag} className="sw-tag">{tag}</li>
                ))}
              </ul>
            )}
            <Link href="/blog" className="sw-link">
              <span aria-hidden="true">←</span> All posts
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
