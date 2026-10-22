import { checkoutStatus } from "@/utils/checkout";
import { getFeed, getResearch } from "@/utils/content";
import { graph, person, website } from "@/utils/seo";
import JsonLd from "./components/helper/json-ld";
import { personalData } from "@/utils/data/personal-data";
import BookShelf from "./components/books/book-shelf";
import LearnCta from "./components/helper/learn-cta";
import AboutSection from "./components/homepage/about";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import HeroSection from "./components/homepage/hero-section";
import Highlights from "./components/homepage/highlights";
import Projects from "./components/homepage/projects";
import ResearchTeaser from "./components/homepage/research";
import Skills from "./components/homepage/skills";

async function getData() {
  // A dev.to outage should hide the blog section, not take the whole page down.
  try {
    const res = await fetch(`https://dev.to/api/articles?username=${personalData.devUsername}`)

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    const filtered = data.filter((item) => item?.cover_image).sort(() => Math.random() - 0.5);

    return filtered;
  } catch {
    return [];
  }
};

export default async function Home() {
  const blogs = await getData();
  const writing = getFeed();
  const research = getResearch();

  return (
    <div suppressHydrationWarning >
      <JsonLd data={graph(person, website, { "@type": "ProfilePage", "@id": "https://andres.swort.net/#profile", url: "https://andres.swort.net", mainEntity: { "@id": person["@id"] }, isPartOf: { "@id": website["@id"] } })} />
      <HeroSection />
      <Highlights />
      <AboutSection />
      <Experience />
      <Projects />
      <ResearchTeaser entries={research} />
      <Skills />
      <Education />
      <Blog items={writing} blogs={blogs} />
      <BookShelf checkout={checkoutStatus()} />
      <LearnCta tone="paper" />
      <ContactSection />
    </div>
  )
};