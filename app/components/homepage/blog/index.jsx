// @flow strict
import PostList from "@/app/components/blog/post-list";
import SectionHeading from "@/app/components/helper/section-heading";
import Link from 'next/link';
import BlogCard from './blog-card';

// Latest writing: local posts first, then dev.to articles if there are any.
function Blog({ posts = [], blogs = [] }) {
  if (!posts.length && !blogs.length) return null;

  return (
    <section id='blogs' className="sw-section sw-paper">
      <div className="sw-container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Writing" title="From the blog." />
          <Link className="sw-btn sw-btn-primary" href="/blog">
            All posts
          </Link>
        </div>

        {posts.length > 0 && (
          <div className="mt-8">
            <PostList posts={posts.slice(0, 3)} />
          </div>
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
