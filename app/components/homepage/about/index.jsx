// @flow strict

import SectionHeading from "@/app/components/helper/section-heading";
import DitherImage from "@/app/components/motion/dither-image";
import { educations } from "@/utils/data/educations";
import { personalData } from "@/utils/data/personal-data";
import Link from "next/link";


function AboutSection() {
  const currentSchool = educations[0];

  return (
    <section id="about" className="sw-section">
      <div className="sw-container">
        <SectionHeading eyebrow="About" title="Who I am." />

        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <figure className="m-0 w-full max-w-[340px]">
            <DitherImage
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
