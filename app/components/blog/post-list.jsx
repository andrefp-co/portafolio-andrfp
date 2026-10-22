import RowLink from "../helper/row-link";

const formatDate = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Local markdown posts as rows: date and tags on the left, the post in the
// middle. Drafts carry a visible badge wherever they are shown.
export default function PostList({ posts }) {
  return (
    <ul className="border-t border-[var(--sw-rule)]">
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-[var(--sw-rule)]">
          <RowLink
            href={`/blog/${post.slug}`}
            className="grid-cols-[1fr_auto] px-1 py-7 md:grid-cols-[minmax(0,200px)_1fr_auto] md:gap-8 md:px-4"
          >
            <div className="col-span-2 flex flex-wrap items-center gap-3 md:col-span-1 md:flex-col md:items-start">
              <time className="sw-label" dateTime={String(post.date)}>{formatDate(post.date)}</time>
              {post.draft && <span className="sw-status">Draft</span>}
            </div>
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(28px,3vw,38px)] leading-[1.04] tracking-[0.02em] text-[var(--sw-white)]">
                {post.title}
              </h3>
              <p className="sw-cell-body mt-2 max-w-[64ch]">{post.summary}</p>
              {post.tags?.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag} className="sw-tag">{tag}</li>
                  ))}
                </ul>
              )}
            </div>
          </RowLink>
        </li>
      ))}
    </ul>
  );
}

export { formatDate };
