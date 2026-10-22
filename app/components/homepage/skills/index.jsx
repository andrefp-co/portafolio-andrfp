// @flow strict

import SectionHeading from "@/app/components/helper/section-heading";
import { skillGroups } from "@/utils/data/skills";
import SkillsGlobe from "./skills-globe";

function Skills() {
  return (
    <section id="skills" className="sw-section sw-section-raised overflow-hidden">
      <div className="sw-container">
        <SectionHeading eyebrow="Skills" title="Tools I work with." />
        <div className="mt-8">
          <SkillsGlobe groups={skillGroups} />
        </div>
      </div>
    </section>
  );
};

export default Skills;
