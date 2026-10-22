import Image from "next/image";
import Link from "next/link";

const isFigure = (src) => /\/figures\//.test(src ?? "");

// One research entry as a card: its figure or photo, the area, the title,
// a short summary, and its status. One type scale for every card.
function ResearchCard({ entry, featured = false }) {
  const figure = isFigure(entry.cover);
  return (
    <Link
      href={`/research/${entry.slug}`}
      className={`group flex h-full flex-col overflow-hidden border border-[var(--sw-border)] bg-[var(--sw-cell)] transition-colors hover:border-[var(--sw-border-strong)] ${
        featured ? "md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : ""
      }`}
    >
      {entry.cover && (
        <span
          className={`relative block aspect-[16/9] overflow-hidden border-b border-[var(--sw-border)] ${figure ? "bg-white" : "bg-black"} ${
            featured ? "md:aspect-auto md:min-h-[300px] md:border-b-0 md:border-r" : ""
          }`}
        >
          <Image
            src={entry.cover}
            alt={entry.coverAlt ?? ""}
            fill
            sizes={featured ? "(min-width: 768px) 620px, 100vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"}
            className={`transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] ${figure ? "object-contain p-5" : "object-cover"}`}
          />
        </span>
      )}
      <span className={`flex flex-1 flex-col p-6 ${featured ? "md:p-8" : ""}`}>
        <span className="sw-label">{entry.area}</span>
        <span
          className={`mt-3 font-[family-name:var(--sw-font-display)] leading-[1.04] tracking-[0.02em] text-[var(--sw-white)] ${
            featured ? "text-[clamp(28px,3vw,38px)]" : "text-[26px]"
          }`}
        >
          {entry.title}
        </span>
        <span className="sw-cell-body mt-3 line-clamp-4">{entry.summary}</span>
        <span className="mt-auto flex items-end justify-between gap-4 pt-6">
          <span className="text-[11px] leading-snug text-[var(--sw-gray)]">{entry.status}</span>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-[var(--sw-white)]">
            Read <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </span>
        </span>
      </span>
    </Link>
  );
}

// Research entries as a grid of cards. With `featured`, the first entry runs
// the full width with its figure beside the text. Used on /research and on
// the home page.
export default function ResearchList({ entries, featured = false, columns = 2 }) {
  const [first, ...rest] = entries;
  const grid = columns === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2";
  return (
    <ul className={`grid grid-cols-1 gap-5 ${grid}`}>
      {featured && first && (
        <li className="md:col-span-full">
          <ResearchCard entry={first} featured />
        </li>
      )}
      {(featured ? rest : entries).map((entry) => (
        <li key={entry.slug}>
          <ResearchCard entry={entry} />
        </li>
      ))}
    </ul>
  );
}
