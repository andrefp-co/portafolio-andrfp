// Press coverage of SWORT, one entry per outlet page. `image` is a clipping
// of that page (masthead and headline). `url` is the article on the outlet's
// own site. Where it is still null, the clipping opens the same story on an
// outlet that has a URL (and says so), or isn't a link at all. Paste the
// URLs in when you have them.
//
// The CSIA announcement is a press release distributed by AB Newswire and
// carried by AP News, FinancialContent, openPR and Big News Network sites,
// so it is labelled as a release, not as reporting by those outlets.
const CSIA = "SWORT Aerospace Develops CSIA Architecture for Independent Assurance of Autonomous Aircraft";
const CSIA_TEXT =
  "SWORT Aerospace is developing a new approach to autonomy assurance through its Cross-Sensor Intelligence Architecture (CSIA), a proprietary architecture designed to reason about sensor evidence, uncertainty and competing fault explanations before information is allowed to influence autonomous aircraft systems.";

export const press = [
  {
    id: "ap-news",
    story: "csia-release",
    outlet: "AP News",
    domain: "apnews.com",
    date: "2026-08-17",
    title: CSIA,
    text: CSIA_TEXT,
    kind: "Press release via AB Newswire",
    image: "/media/press/ap-news.jpg",
    url: "https://apnews.com/press-release/getnews/press-release-3e66bf5a8bf9d516cb206e68393fb0e7",
  },
  {
    id: "financialcontent",
    story: "csia-release",
    outlet: "FinancialContent",
    domain: "financialcontent.com",
    date: "2026-08-17",
    title: CSIA,
    text: CSIA_TEXT,
    kind: "Press release via AB Newswire",
    image: "/media/press/financialcontent.jpg",
    url: null,
  },
  {
    id: "openpr",
    story: "csia-release",
    outlet: "openPR",
    domain: "openpr.com",
    date: "2026-08-18",
    title: CSIA,
    text: CSIA_TEXT,
    kind: "Press release via AB Newswire",
    image: "/media/press/openpr.jpg",
    url: null,
  },
  {
    id: "big-news-network",
    story: "bnn-expands",
    outlet: "Big News Network",
    domain: "bignewsnetwork.com",
    date: null,
    title: "SWORT Aerospace Expands Its Aerospace Electronics and Research Capabilities to Support Commercial and Defense Innovation",
    text: "SWORT Aerospace, the operating brand of SWORT LLC, is expanding its work in aerospace electronics, embedded systems, and advanced engineering research as it continues to develop technologies that support commercial aviation, autonomous aircraft, and defense applications.",
    kind: "Press release",
    image: "/media/press/big-news-network.jpg",
    url: null,
  },
  {
    id: "growth-illustrated",
    story: "growth-illustrated",
    outlet: "Growth Illustrated",
    domain: "growthillustrated.com",
    date: null,
    title: "SWORT Aerospace Is Betting the Real Aircraft Problem Is Knowing Which Sensor to Believe",
    text: "A three-minute read from Growth Illustrated's staff on SWORT's sensor-trust work.",
    kind: "Article",
    image: "/media/press/growth-illustrated.jpg",
    url: "https://growthillustrated.com/swort-aerospace-is-betting-the-real-aircraft-problem-is-knowing-which-sensor-to-believe/",
  },
];

// Where a clipping links: its own article, else the same story on another
// outlet that carried it (`via` names that outlet), else nowhere.
export const pressLink = (item) => {
  if (item.url) return { href: item.url, via: null };
  const other = press.find((p) => p.story === item.story && p.url);
  return other ? { href: other.url, via: other.outlet } : null;
};

// One entry per story (the first outlet that carried it), for the blog feed.
export const pressStories = press.filter((item, i) => press.findIndex((p) => p.story === item.story) === i);
