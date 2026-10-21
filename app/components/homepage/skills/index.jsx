// @flow strict

import { skillsData } from "@/utils/data/skills";

function Skills() {
  return (
    <section id="skills" className="sw-section">
      <div className="sw-container">
        <p className="sw-eyebrow">Skills</p>
        <h2 className="sw-head">Tools I work with.</h2>

        {/* Typographic cells rather than brand logos: several logos (PHP,
            MySQL, Next.js, Julia) are near-black and vanish on this surface,
            and the palette carries no brand colour. */}
        <div className="sw-grid mt-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {skillsData.map((skill, id) => (
            <div
              key={id}
              className="bg-[var(--sw-cell)] px-5 py-5 transition-colors duration-200 hover:bg-[var(--sw-graphite)]"
            >
              <span className="sw-cell-num">{String(id + 1).padStart(2, '0')}</span>
              <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.08em] text-white">
                {skill}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
