import { checkoutStatus } from "@/utils/checkout";
import { books } from "@/utils/data/books";
import { absolute, bookRecord, breadcrumbs, graph, organization, person } from "@/utils/seo";
import BookShelf from "../components/books/book-shelf";
import JsonLd from "../components/helper/json-ld";

const book = books[0];
const description = `${book.title}, ${book.volume}: ${book.subtitle}. ${book.tagline} By ${book.author}, ${book.publisher}. ${book.edition}.`;
const ogImage = { url: "/og.jpg", width: 1200, height: 630, alt: `${book.title}, ${book.volume}` };

export const metadata = {
  title: `${book.title}, ${book.volume}`,
  description,
  alternates: { canonical: "/book" },
  openGraph: {
    type: "book",
    url: "/book",
    title: `${book.title}, ${book.volume}: ${book.subtitle}`,
    description,
    authors: [absolute("/")],
    releaseDate: String(book.year),
    tags: ["avionics", "flight data", "measurement", "research methods"],
    images: [ogImage],
  },
  twitter: { card: "summary_large_image", title: `${book.title}, ${book.volume}`, description, images: [ogImage.url] },
};

// The book's own page: everything on the home page's book section, plus the
// contents of this volume.
export default function BookPage() {
  return (
    <>
      <JsonLd data={graph(person, organization, bookRecord(book), breadcrumbs([["Home", "/"], ["Book", "/book"]]))} />
      <BookShelf variant="full" headingAs="h1" checkout={checkoutStatus()} />
    </>
  );
}
