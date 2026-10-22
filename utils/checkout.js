// Server-only: whether online checkout is configured for each book.
import { books } from "./data/books";

export const checkoutReady = (book) =>
  Boolean(process.env.STRIPE_SECRET_KEY && book?.stripePriceEnv && process.env[book.stripePriceEnv]);

export const checkoutStatus = () => Object.fromEntries(books.map((b) => [b.id, checkoutReady(b)]));
