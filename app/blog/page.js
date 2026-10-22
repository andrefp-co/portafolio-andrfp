import { checkoutStatus } from "@/utils/checkout";
import { getFeed, getStories, getTopics } from "@/utils/content";
import { absolute, breadcrumbs, graph, person } from "@/utils/seo";
import JsonLd from "../components/helper/json-ld";
import { books } from "@/utils/data/books";
import { personalData } from "@/utils/data/personal-data";
import BookShelf from "../components/books/book-shelf";
import BlogFeed from "../components/feed/blog-feed";
import LearnCta from "../components/helper/learn-cta";
import BlogCard from "../components/homepage/blog/blog-card";

const blogDescription =
  "Essays, papers, photos and SWORT articles from Andres Peña: sensor integrity, runtime diagnosis, flight controllers, the Shell Eco-marathon and the Purdue Space Program.";

export const metadata = {
  title: "Blog",
  description: blogDescription,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "profile",
    url: "/blog",
    title: "Blog | Andres Peña",
    description: blogDescription,
    images: [{ url: "/media/feed/swort-avionics-board.jpg", width: 1440, height: 810, alt: "A SWORT avionics board" }],
  },
  twitter: { card: "summary_large_image", title: "Blog | Andres Peña", description: blogDescription, images: ["/media/feed/swort-avionics-board.jpg"] },
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
      <JsonLd
        data={graph(
          person,
          {
            "@type": "Blog",
            "@id": absolute("/blog#blog"),
            url: absolute("/blog"),
            name: "Andres Peña: notes from the bench",
            description: blogDescription,
            author: { "@id": person["@id"] },
            blogPost: feed
              .filter((i) => i.kind === "essay" && !i.draft)
              .map((i) => ({ "@type": "BlogPosting", headline: i.title, url: absolute(i.href) })),
          },
          breadcrumbs([["Home", "/"], ["Blog", "/blog"]])
        )}
      />
      <section className="pb-10 lg:pt-6">
        <BlogFeed profile={profile} items={feed} stories={getStories(feed)} topics={getTopics(feed)} book={books[0]} />
      </section>

      <BookShelf tone="paper" checkout={checkoutStatus()} />

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
