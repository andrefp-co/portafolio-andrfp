// Shared SEO values: the canonical origin, the default share image, and the
// schema.org records reused across pages.
import { books } from "./data/books";
import { personalData } from "./data/personal-data";
import { CSIA_RELEASE_URL, pressStories } from "./data/press";

export const SITE_URL = "https://andres.swort.net";
export const OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: "Andres Peña: embedded systems, avionics and electronics test" };

export const absolute = (path = "/") => new URL(path, SITE_URL).href;

export const person = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: personalData.name,
  alternateName: "Andres Felipe Peña Avila",
  url: SITE_URL,
  image: absolute(personalData.profile),
  jobTitle: "Founder and Technical Lead",
  description: personalData.description,
  worksFor: { "@type": "Organization", "@id": "https://swort.net/#organization", name: "SWORT Aerospace", legalName: "SWORT LLC", url: "https://swort.net" },
  affiliation: [
    { "@type": "CollegeOrUniversity", name: "Montgomery College" },
    { "@type": "Organization", name: "Purdue Space Program" },
  ],
  address: { "@type": "PostalAddress", addressRegion: "DC", addressCountry: "US", description: personalData.address },
  knowsLanguage: ["en", "es"],
  knowsAbout: [
    "Embedded systems", "Avionics", "Flight controllers", "Sensor integrity", "Runtime diagnosis",
    "PCB design", "STM32", "C", "C++", "Python", "MAVLink", "PX4", "ArduPilot", "Electronics test",
  ],
  sameAs: [personalData.linkedIn, personalData.github, personalData.twitter].filter(Boolean),
};

export const website = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: personalData.name,
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#person` },
};

export const breadcrumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absolute(path) })),
});

export const graph = (...nodes) => ({ "@context": "https://schema.org", "@graph": nodes });

// SWORT Aerospace, with the press coverage it has received. Releases are
// typed as such; only the CSIA release has a confirmed URL so far.
export const organization = {
  "@type": "Organization",
  "@id": "https://swort.net/#organization",
  name: "SWORT Aerospace",
  legalName: "SWORT LLC",
  url: "https://swort.net",
  founder: { "@id": `${SITE_URL}/#person` },
  subjectOf: pressStories.map((p) => ({
    "@type": "Article",
    headline: p.title,
    ...(p.date ? { datePublished: p.date } : {}),
    ...(p.story === "csia-release" ? { url: CSIA_RELEASE_URL } : {}),
    publisher: { "@type": "Organization", name: p.outlet },
    genre: p.kind,
  })),
};

// The book, for /book and the home page.
export const bookRecord = (book = books[0]) => ({
  "@type": "Book",
  "@id": `${SITE_URL}/book#book`,
  name: `${book.title}, ${book.volume}: ${book.subtitle}`,
  alternativeHeadline: book.tagline,
  url: absolute("/book"),
  author: { "@id": `${SITE_URL}/#person` },
  publisher: { "@id": "https://swort.net/#organization" },
  bookEdition: book.edition,
  datePublished: String(book.year),
  inLanguage: "en",
  audience: { "@type": "Audience", audienceType: book.audience },
  about: ["Avionics", "Flight data analysis", "Measurement", "Uncertainty", "Research methods", "Reproducibility"],
  hasPart: book.parts?.map((p) => ({ "@type": "Chapter", name: `Part ${p.part}: ${p.name}` })),
});
