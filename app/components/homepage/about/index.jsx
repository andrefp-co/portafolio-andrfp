// @flow strict

import SectionHeading from "@/app/components/helper/section-heading";
import RevealImage from "@/app/components/motion/reveal-image";
import { educations } from "@/utils/data/educations";
import { personalData } from "@/utils/data/personal-data";
import Link from "next/link";


function AboutSection() {
  const currentSchool = educations[0];

  return (
    <section id="about" className="sw-section sw-paper">
      <div className="sw-container">
        <SectionHeading eyebrow="About" title="Who I am." />

        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <figure className="m-0 w-full max-w-[340px]">
            <RevealImage
              src={personalData.profile}
              width={1120}
              height={1408}
              sizes="(max-width: 768px) 90vw, 340px"
              alt={`Portrait of ${personalData.name}`}
              className="aspect-[4/5] w-full border border-[var(--sw-border)]"
              imgClassName="h-full w-full object-cover object-[50%_30%]"
            />
          </figure>
          <div className="min-w-0">
            <p className="sw-lede max-w-[62ch] text-[var(--sw-silver)] lg:text-[15px]">
              {personalData.description}
            </p>
            <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-[var(--sw-rule)] pt-6 sm:grid-cols-2">
              <div>
                <dt className="sw-label">Based in</dt>
                <dd className="mt-2 text-sm text-[var(--sw-white-soft)]">{personalData.address}</dd>
              </div>
              {currentSchool && (
                <div>
                  <dt className="sw-label">Studying at</dt>
                  <dd className="mt-2 text-sm text-[var(--sw-white-soft)]">{currentSchool.institution}</dd>
                </div>
              )}
            </dl>
            <div className="mt-8">
              <Link href={personalData.linkedIn} target="_blank" className="sw-link">
                View {personalData.name} on LinkedIn <span className="sw-link-arrow" aria-hidden="true">↗</span>
              </Link>
            </div>

            {/* Education sits with the introduction rather than in a section
                of its own. */}
            <div id="education" className="mt-12">
              <h3 className="sw-label">Academic background</h3>
              <ol className="mt-3 border-t border-[var(--sw-rule)]">
                {educations.map((education) => (
                  <li key={education.id} className="grid grid-cols-1 gap-x-6 gap-y-1 border-b border-[var(--sw-rule)] py-3.5 sm:grid-cols-[110px_minmax(0,1fr)] xl:grid-cols-[130px_minmax(0,1fr)_auto]">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--sw-gray)] sm:row-span-2 sm:pt-px xl:row-span-1">{education.duration}</span>
                    <span className="text-sm text-[var(--sw-white)]">{education.title}</span>
                    <span className="text-sm text-[var(--sw-silver)] sm:col-start-2 xl:col-start-auto">{education.institution}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
