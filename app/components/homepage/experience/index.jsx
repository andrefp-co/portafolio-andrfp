// app/components/homepage/experience/index.jsx
import { experiences } from "@/utils/data/experience";
import ExperienceView from "./experience-view";

function Experience() {
  return (
    <section id="experience" className="sw-section-raised relative border-t border-[var(--sw-rule)]">
      <ExperienceView items={experiences} />
    </section>
  );
}

export default Experience;
