// app/components/homepage/experience/index.jsx
import SectionHeading from "@/app/components/helper/section-heading";
import { experiences } from "@/utils/data/experience";
import Timeline from "./timeline";

function Experience() {
  return (
    <section id="experience" className="sw-section sw-section-raised">
      <div className="sw-container">
        <SectionHeading eyebrow="Experience" title="Engineering roles." />
        <Timeline items={experiences} />
      </div>
    </section>
  );
}

export default Experience;
