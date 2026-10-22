// Press coverage of SWORT. `url` is the article itself where it is known;
// where it is null the link searches for the exact headline instead, so it
// still lands on the piece. Paste the article URL in when you have it.
//
// The CSIA announcement is a press release distributed by AB Newswire and
// carried by AP News, FinancialContent, openPR and Big News Network sites,
// so it is labelled as a release, not as reporting by those outlets.
export const press = [
  {
    id: "csia-release",
    date: "2026-08-17",
    title: "SWORT Aerospace Develops CSIA Architecture for Independent Assurance of Autonomous Aircraft",
    text: "SWORT Aerospace is developing a new approach to autonomy assurance through its Cross-Sensor Intelligence Architecture (CSIA), a proprietary architecture designed to reason about sensor evidence, uncertainty and competing fault explanations before information is allowed to influence autonomous aircraft systems.",
    kind: "Press release via AB Newswire",
    outlets: ["AP News", "FinancialContent", "openPR", "Big News Network"],
    url: "https://news.sacramentonews-online.com/story/791624/swort-aerospace-develops-csia-architecture-for-independent-assurance-of-autonomous-aircraft.html",
  },
  {
    id: "bnn-expands",
    date: null,
    title: "SWORT Aerospace Expands Its Aerospace Electronics and Research Capabilities to Support Commercial and Defense Innovation",
    text: "SWORT Aerospace, the operating brand of SWORT LLC, is expanding its work in aerospace electronics, embedded systems, and advanced engineering research as it continues to develop technologies that support commercial aviation, autonomous aircraft, and defense applications.",
    kind: "Press release",
    outlets: ["Big News Network"],
    url: null,
  },
  {
    id: "growth-illustrated",
    date: null,
    title: "SWORT Aerospace Is Betting the Real Aircraft Problem Is Knowing Which Sensor to Believe",
    text: "A three-minute read from Growth Illustrated's staff on SWORT's sensor-trust work.",
    kind: "Article",
    outlets: ["Growth Illustrated"],
    url: null,
  },
];

export const pressHref = (item) =>
  item.url ?? `https://www.google.com/search?q=${encodeURIComponent(`"${item.title}"`)}`;
