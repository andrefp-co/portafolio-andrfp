// @flow strict

import { skillGroups } from "@/utils/data/skills";
import SkillsGlobe from "./skills-globe";

// The heading lives inside the globe's pinned stage so it stays in view
// while the globe turns through each discipline.
function Skills() {
  return (
    <section id="skills" className="relative border-t border-[var(--sw-rule)]">
      <SkillsGlobe groups={skillGroups} />
    </section>
  );
};

export default Skills;
