// @flow strict

import { getPosts } from "@/utils/content";
import { personalData } from "@/utils/data/personal-data";
import PostList from "../components/blog/post-list";
import PageHeader from "../components/helper/page-header";
import BlogCard from "../components/homepage/blog/blog-card";

export const metadata = {
  title: "Blog",
  description: "Notes on sensor integrity, embedded firmware and engineering practice.",
};

async function getDevToPosts() {
  // A dev.to outage should show an empty list, not an error page.
  try {
    const res = await fetch(`https://dev.to/api/articles?username=${personalData.devUsername}`)

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.filter((blog) => blog?.cover_image);
  } catch {
    return [];
  }
};

async function page() {
  const posts = getPosts();
  const devTo = await getDevToPosts();

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Notes from the bench."
        lede="Sensor integrity, embedded firmware, and how to write down what a test actually proved."
      />

      <section className="sw-section sw-paper !border-t-0">
        <div className="sw-container">
          {posts.length > 0 ? (
            <PostList posts={posts} />
          ) : (
            <p className="sw-lede">No posts yet. The first ones are being written.</p>
          )}
        </div>
      </section>

      {devTo.length > 0 && (
        <section className="sw-section">
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
    </>
  );
};

export default page;
