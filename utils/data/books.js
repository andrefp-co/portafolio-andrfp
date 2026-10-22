// Books for sale, shown on the home page, on /book, on /blog and on blog
// posts.
//
// Every detail below is taken from the book's own front matter, preface,
// introduction and table of contents (Volume I, first edition). Keep it that
// way: quote the book, don't market it.
//
// Fields (all optional but `title`):
//   subtitle, tagline   from the title page
//   cover               image path in /public; without one, the cover is
//                       drawn from the printed cover's design
//   price               display text, e.g. "$29"
//   formats             e.g. ["Print", "PDF"]
//   buyUrl              an outside store; when set, "Buy the book" goes there
//   stripePriceEnv      env var holding this book's Stripe price ID
//
// Payments: with STRIPE_SECRET_KEY and the price ID set, "Order a copy" opens
// Stripe Checkout (card details never touch this site). Without them, it
// takes an order request and emails it to you through Resend (RESEND_API_KEY
// and EMAIL_TO), so you can reply with a payment link.
export const books = [
  {
    id: "avionics-research-methods-1",
    slug: "avionics-research-methods",
    title: "Avionics Research Methods",
    volume: "Volume I",
    subtitle: "Measurement, Flight Data, and Evidence",
    tagline: "From a physical quantity to a defended technical claim.",
    author: "Andres Peña",
    authorRole: "Principal Aerospace Researcher, SWORT Aerospace",
    publisher: "SWORT Aerospace",
    edition: "First edition, 2026",
    year: 2026,
    length: "430+ pages",
    series: "Volume I of two",
    cover: "",
    price: "",
    formats: ["Print"],
    buyUrl: "",
    stripePriceEnv: "STRIPE_PRICE_AVIONICS_RESEARCH_METHODS_1",
    maxQuantity: 10,

    // Preface, "Who this book is for".
    audience:
      "Advanced secondary students with a firm grasp of algebra, undergraduates in aerospace, electrical or systems engineering, and early-career engineers who work with flight data and were taught the statistics without being taught what the statistics license.",
    // Preface, "What it assumes" and "What it does not assume".
    assumes: [
      "Algebra: rearrange an equation, read a graph with labelled axes, carry a unit through an arithmetic operation. That is the whole prerequisite.",
      "Python appears from Part VII onward, as a calculator that keeps a record of what it did, not as a subject.",
      "Probability, statistics, estimation, control, signal processing and flight-test engineering are all built from nothing.",
    ],
    // Preface, "What the book will not do".
    wontDo: [
      "Put a solution beside its exercise.",
      "Describe a synthetic record as flight data.",
      "Present an invented incident as having happened.",
      "Report a statistic without its sample count, a value without its unit, or a chapter without its limitations.",
    ],
    // Introduction, "Eight claims this book undertakes to demonstrate".
    claims: [
      { claim: "A number without a unit is not a measurement.", where: "Chapters 1 and 6" },
      { claim: "A statistic without a sample count is incomplete.", where: "Chapters 17 and 19" },
      { claim: "Data is not automatically evidence.", where: "Chapter 2" },
      { claim: "Deviation is not automatically cause.", where: "Chapter 22" },
      { claim: "A claim must survive counter-evidence.", where: "Chapters 40, 42 and 44" },
      { claim: "Not knowing is an acceptable scientific state.", where: "Chapter 67" },
      { claim: "A record has limits.", where: "Chapters 5, 41 and 65" },
      { claim: "A reproducible result is stronger than an untraceable one.", where: "Chapters 53, 55 and 62" },
    ],
    // Table of contents: the parts printed in Volume I, with a few chapters
    // from each. Chapter numbers are the whole series' numbers.
    parts: [
      { part: "I", name: "Foundations", chapters: "0–5", sample: ["What Is a Measurement?", "From Data to Evidence", "Four Failure Signatures: Spike, Freeze, Gap, Drift"] },
      { part: "II", name: "The Measurement Chain", chapters: "6–10", sample: ["Sensor Output and Calibration", "Quantization, Resolution, and Information Loss", "Sampling, Time, Latency, and Measurement Age"] },
      { part: "III", name: "Statistics for Evidence", chapters: "16–23", sample: ["Why n−1 Appears", "Thresholds and False Decisions", "Why Thresholds Detect Deviation, Not Cause"] },
      { part: "V", name: "Investigation Method", chapters: "36–45", sample: ["How to Investigate Without Knowing the Answer", "Counter-Evidence", "What Would Change Your Mind?"] },
      { part: "VI", name: "Experiment Design", chapters: "46–52", sample: ["Independent Variables and Controls", "Confounding Variables", "Designing an Avionics Experiment"] },
      { part: "VII", name: "Reproducibility", chapters: "53–60", sample: ["Dataset Identity", "Hashes and Data Integrity", "The Reproducibility Capsule"] },
      { part: "VIII", name: "Defending a Result", chapters: "61–67", sample: ["From Result to Claim", "Stating Limitations", "When the Correct Answer Is “The Evidence Is Insufficient”"] },
      { part: "IX", name: "Cases", chapters: "A–C", sample: ["Single-Sensor Bias", "Slow Drift, and What Late Detection Costs", "A Dropout That Left No Gap"] },
      { part: "X", name: "Capstone", chapters: "BOOK-CAP-V1", sample: ["A Blind Investigation"] },
    ],
    // Front matter, as printed.
    notes: [
      "The datasets, worked examples and case studies are synthetic and labelled ILLUSTRATIVE throughout. Every quantitative claim names its dataset and window.",
      "An independent technical publication, not issued, endorsed or approved by any aviation authority, standards body or academic institution.",
    ],
  },
];
