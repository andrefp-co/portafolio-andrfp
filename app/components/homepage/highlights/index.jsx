// @flow strict
import CountUp from "@/app/components/motion/count-up";
import { highlights } from "@/utils/data/highlights";
import { press, pressHref } from "@/utils/data/press";

const day = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// The band under the hero: headline numbers from the CV, then press coverage.
function Highlights() {
  return (
    <section aria-label="Highlights and press" className="bg-[var(--sw-black)] pb-20 pt-2">
      <div className="sw-container">
        <div className="sw-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.label} className="flex flex-col gap-3 bg-[var(--sw-cell)] px-6 py-7">
              <p className="whitespace-nowrap font-[family-name:var(--sw-font-display)] text-[clamp(44px,5vw,60px)] leading-none tracking-[0.02em] text-[var(--sw-white)] lg:text-[clamp(40px,3.6vw,60px)]">
                <CountUp value={item.value} from={item.from} prefix={item.prefix} suffix={item.suffix} />
              </p>
              <p className="max-w-[30ch] text-[13px] leading-relaxed text-[var(--sw-silver)]">{item.label}</p>
              <p className="sw-label mt-auto pt-2">{item.source}</p>
            </div>
          ))}
        </div>

        {press.length > 0 && (
          <div className="mt-14">
            <p className="sw-eyebrow">In the press</p>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {press.map((item) => (
                <li key={item.id}>
                  <a
                    href={pressHref(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-4 border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 transition-colors hover:border-[var(--sw-border-strong)]"
                  >
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--sw-white)]">{item.outlets.join(" · ")}</span>
                    <span className="text-[15px] leading-snug text-[var(--sw-white-soft)]">{item.title}</span>
                    <span className="mt-auto flex items-center justify-between gap-4 border-t border-[var(--sw-rule)] pt-4 text-[11px] text-[var(--sw-gray)]">
                      <span>
                        {item.kind}
                        {item.date ? ` · ${day(item.date)}` : ""}
                      </span>
                      <span className="shrink-0 uppercase tracking-[0.14em] text-[var(--sw-white)] transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                        Read ↗
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default Highlights;
