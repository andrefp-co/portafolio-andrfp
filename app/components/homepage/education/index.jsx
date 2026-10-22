// @flow strict
import SectionHeading from "@/app/components/helper/section-heading";
import { educations } from "@/utils/data/educations";

function Education() {
  return (
    <section id="education" className="sw-section">
      <div className="sw-container">
        <SectionHeading eyebrow="Education" title="Academic background." />

        <div className="sw-rows mt-10">
          {educations.map(education => (
            <div key={education.id} className="sw-row">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--sw-gray)]">
                {education.duration}
              </span>
              <p className="text-sm font-medium text-white">{education.title}</p>
              <p className="text-sm text-[var(--sw-silver)]">{education.institution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
