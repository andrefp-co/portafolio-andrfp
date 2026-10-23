import SectionHeading from "@/app/components/helper/section-heading";
import { press, pressLink, pressStories } from "@/utils/data/press";

const day = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// Press coverage as a plain list, one row per story: the headline, what kind
// of piece it is and who carried it, and a link to read it on the outlet's
// site. Releases are labelled as releases.
export default function Press() {
  if (!pressStories.length) return null;

  return (
    <section id="press" className="sw-section">
      <div className="sw-container">
        <SectionHeading eyebrow="Press" title="In the press." />

        <ul className="mt-10 border-t border-[var(--sw-rule)]">
          {pressStories.map((story) => {
            const outlets = press.filter((p) => p.story === story.story).map((p) => p.outlet);
            const link = pressLink(story);
            const meta = [story.kind, outlets.join(", "), story.date && day(story.date)].filter(Boolean).join(" · ");
            const body = (
              <>
                <span className="min-w-0">
                  <span className="block font-[family-name:var(--sw-font-display)] text-[clamp(22px,2.4vw,30px)] leading-[1.08] tracking-[0.02em] text-[var(--sw-white)] transition-colors [text-wrap:balance] group-hover:text-[var(--sw-silver)]">
                    {story.title}
                  </span>
                  <span className="mt-2 block text-[12.5px] leading-relaxed text-[var(--sw-gray)]">{meta}</span>
                </span>
                {link && (
                  <span className="sw-link self-start whitespace-nowrap md:self-center">
                    Read on {link.via ?? story.outlet} <span className="sw-link-arrow" aria-hidden="true">↗</span>
                  </span>
                )}
              </>
            );
            const row = "grid grid-cols-1 gap-4 py-7 md:grid-cols-[1fr_auto] md:gap-10";
            return (
              <li key={story.story} className="border-b border-[var(--sw-rule)]">
                {link ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={`${row} group`}>
                    {body}
                  </a>
                ) : (
                  <div className={row}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
