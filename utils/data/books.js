// Books for sale, shown on /blog, on blog posts and on the home page.
//
// Fill in what you have; every field but `title` is optional:
//   subtitle        line under the title on the cover
//   blurb           one or two sentences for the shelf
//   cover           image path in /public (e.g. "/media/book-arm-1.jpg");
//                   without one, a typographic cover is drawn
//   price           display text, e.g. "$29"
//   formats         e.g. ["Print", "PDF"]
//   buyUrl          an outside store (Amazon, Gumroad, a Stripe Payment Link);
//                   when set, "Buy the book" goes straight there
//   stripePriceEnv  name of the env var holding this book's Stripe price ID
//
// Payments: with STRIPE_SECRET_KEY and the price ID set, "Order a copy" opens
// Stripe Checkout (card details never touch this site). Without them, it
// takes an order request and emails it to you through Resend (RESEND_API_KEY
// and EMAIL_TO), so you can reply with a payment link.
export const books = [
  {
    id: "avionics-research-methods-1",
    title: "Avionics Research Methods",
    volume: "Volume I",
    author: "Andres Peña",
    subtitle: "",
    blurb: "",
    cover: "",
    price: "",
    formats: ["Print"],
    buyUrl: "",
    stripePriceEnv: "STRIPE_PRICE_AVIONICS_RESEARCH_METHODS_1",
    maxQuantity: 10,
  },
];
