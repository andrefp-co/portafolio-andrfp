// app/components/homepage/experience/index.jsx
import { experiences } from "@/utils/data/experience";

function Experience() {
  return (
    <section id="experience" className="sw-section sw-section-raised">
      <div className="sw-container">
        <p className="sw-eyebrow">Experience</p>
        <h2 className="sw-head">Engineering roles.</h2>

        <div className="sw-grid mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp, index) => (
            <article key={exp.id} className="sw-cell flex flex-col">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <span className="sw-cell-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="sw-label">{exp.duration}</span>
              </div>
              <h3 className="sw-cell-title">{exp.title}</h3>
              <p className="mb-4 text-xs uppercase tracking-[0.14em] text-[var(--sw-silver)]">{exp.company}</p>
              <div className="flex flex-col gap-2">
                {exp.desc?.map((line, i) => (
                  <p key={i} className="sw-cell-body">{line}</p>
                ))}
              </div>
              {exp.link && (
                <div className="mt-auto pt-6">
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sw-link"
                  >
                    Learn more <span className="sw-link-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
