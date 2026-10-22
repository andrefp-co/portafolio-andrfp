// @flow strict

import { skillGroups } from "@/utils/data/skills";

function Skills() {
  return (
    <section id="skills" className="sw-section">
      <div className="sw-container">
        <p className="sw-eyebrow">Skills</p>
        <h2 className="sw-head">Tools I work with.</h2>

        <div className="sw-rows mt-10">
          {skillGroups.map((group) => (
            <div key={group.discipline} className="grid grid-cols-1 gap-4 border-b border-[var(--sw-rule)] py-6 md:grid-cols-[minmax(0,240px)_1fr] md:gap-7">
              <h3 className="text-xs uppercase tracking-[0.14em] text-[var(--sw-gray)]">{group.discipline}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill} className="sw-tag">{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
