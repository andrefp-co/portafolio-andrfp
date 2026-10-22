// @flow strict

import { personalData } from "@/utils/data/personal-data";
import BlogCard from "../components/homepage/blog/blog-card";

export const metadata = {
  title: "Blog",
};

async function getBlogs() {
  // A dev.to outage should show an empty list, not an error page.
  try {
    const res = await fetch(`https://dev.to/api/articles?username=${personalData.devUsername}`)

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data;
  } catch {
    return [];
  }
};

async function page() {
  const blogs = await getBlogs();
  const withCovers = blogs.filter((blog) => blog?.cover_image);

  return (
    <section className="sw-bg-grid">
      <div className="sw-container py-20 lg:py-28">
        <p className="sw-eyebrow">Writing</p>
        <h1 className="sw-head">All posts.</h1>

        {withCovers.length > 0 ? (
          <div className="sw-grid mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {withCovers.map((blog, i) => (
              <BlogCard blog={blog} key={i} />
            ))}
          </div>
        ) : (
          <p className="sw-lede mt-6">No posts to show right now. Check back soon.</p>
        )}
      </div>
    </section>
  );
};

export default page;
