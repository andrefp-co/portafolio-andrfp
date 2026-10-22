import RowLink from "../helper/row-link";

// The research index as rows: area and status on the left, the work itself
// in the middle, an arrow on the right. Used on /research and on the home page.
export default function ResearchList({ entries }) {
  return (
    <ul className="border-t border-[var(--sw-rule)]">
      {entries.map((entry) => (
        <li key={entry.slug} className="border-b border-[var(--sw-rule)]">
          <RowLink
            href={`/research/${entry.slug}`}
            className="grid-cols-[1fr_auto] px-1 py-8 md:grid-cols-[minmax(0,220px)_1fr_auto] md:gap-8 md:px-4"
          >
            <div className="col-span-2 flex flex-col items-start gap-3 md:col-span-1">
              <span className="sw-label">{entry.area}</span>
              <span className="sw-status">{entry.status}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(30px,3.4vw,42px)] leading-[1.02] tracking-[0.02em] text-[var(--sw-white)]">
                {entry.title}
              </h3>
              <p className="sw-cell-body mt-3 max-w-[64ch]">{entry.summary}</p>
              {entry.highlight && (
                <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[var(--sw-silver)]">{entry.highlight}</p>
              )}
            </div>
          </RowLink>
        </li>
      ))}
    </ul>
  );
}
