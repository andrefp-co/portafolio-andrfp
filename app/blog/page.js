import { getFeed, getStories, getTopics } from "@/utils/content";
import { books } from "@/utils/data/books";
import { personalData } from "@/utils/data/personal-data";
import BookShelf from "../components/books/book-shelf";
import BlogFeed from "../components/feed/blog-feed";
import LearnCta from "../components/helper/learn-cta";
import BlogCard from "../components/homepage/blog/blog-card";

export const metadata = {
  title: "Blog",
  description: "Essays, papers, photos and SWORT articles from Andres Peña: sensor integrity, runtime diagnosis, flight controllers and the Shell Eco-marathon.",
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

const profile = {
  author: { name: personalData.name, handle: "andrfp", avatar: personalData.profile },
  cover: "/media/feed/swort-avionics-board.jpg",
  bio: "Embedded systems and avionics. Founder and technical lead at SWORT Aerospace: flight controllers, sensor integrity and electronics test. Posts, papers and notes from the bench.",
  location: personalData.address,
  linkedIn: personalData.linkedIn,
};

export default async function BlogPage() {
  const feed = getFeed();
  const devTo = await getDevToPosts();

  return (
    <>
      <section className="pb-10 lg:pt-6">
        <BlogFeed profile={profile} items={feed} stories={getStories(feed)} topics={getTopics(feed)} book={books[0]} />
      </section>

      <BookShelf tone="paper" />

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

      <LearnCta />
    </>
  );
}
