// @flow strict
import SectionHeading from "@/app/components/helper/section-heading";
import Link from 'next/link';
import BlogCard from './blog-card';

function Blog({ blogs }) {
  if (!blogs?.length) return null;

  return (
    <section id='blogs' className="sw-section sw-section-raised">
      <div className="sw-container">
        <SectionHeading eyebrow="Writing" title="From the blog." />

        <div className="sw-grid mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {
            blogs.slice(0, 6).map((blog, i) => (
              blog?.cover_image &&
              <BlogCard blog={blog} key={i} />
            ))
          }
        </div>

        <div className="mt-10 flex justify-center">
          <Link className="sw-btn sw-btn-ghost" href="/blog">
            View more
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
