// @flow strict

import SectionHeading from "@/app/components/helper/section-heading";
import { skillGroups } from "@/utils/data/skills";

function Skills() {
  return (
    <section id="skills" className="sw-section sw-section-raised">
      <div className="sw-container">
        <SectionHeading eyebrow="Skills" title="Tools I work with." />

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
