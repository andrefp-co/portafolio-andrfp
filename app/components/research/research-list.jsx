import Image from "next/image";
import RowLink from "../helper/row-link";

// The research index as rows: area and status on the left, the work itself
// in the middle, its figure or photo, and an arrow on the right. Used on
// /research and on the home page.
export default function ResearchList({ entries }) {
  return (
    <ul className="border-t border-[var(--sw-rule)]">
      {entries.map((entry) => (
        <li key={entry.slug} className="border-b border-[var(--sw-rule)]">
          <RowLink
            href={`/research/${entry.slug}`}
            className={`grid-cols-[1fr_auto] px-1 py-8 md:gap-8 md:px-4 ${
              entry.cover ? "md:grid-cols-[minmax(0,200px)_1fr_minmax(0,200px)_auto]" : "md:grid-cols-[minmax(0,220px)_1fr_auto]"
            }`}
          >
            <div className="col-span-2 flex flex-col items-start gap-3 md:col-span-1">
              <span className="sw-label">{entry.area}</span>
              <span className="sw-status">{entry.status}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(30px,3.4vw,42px)] leading-[1.02] tracking-[0.02em] text-[var(--sw-white)]">
                {entry.title}
              </h3>
              {entry.authors && <p className="mt-2 text-xs tracking-[0.04em] text-[var(--sw-gray)]">{entry.authors}</p>}
              <p className="sw-cell-body mt-3 max-w-[64ch]">{entry.summary}</p>
              {entry.highlight && (
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[var(--sw-silver)]">{entry.highlight}</p>
              )}
            </div>
            {entry.cover && (
              <div
                className={`relative col-span-2 mt-2 aspect-[16/9] w-full max-w-[360px] overflow-hidden rounded-xl border border-[var(--sw-border)] md:col-span-1 md:mt-0 md:aspect-[4/3] md:self-center ${
                  /\/figures\//.test(entry.cover) ? "bg-white" : "bg-black"
                }`}
              >
                <Image
                  src={entry.cover}
                  alt={entry.coverAlt ?? ""}
                  fill
                  sizes="(min-width: 768px) 200px, 360px"
                  className={/\/figures\//.test(entry.cover) ? "object-contain p-2" : "object-cover"}
                />
              </div>
            )}
          </RowLink>
        </li>
      ))}
    </ul>
  );
}
