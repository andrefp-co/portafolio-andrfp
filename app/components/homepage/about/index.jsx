// @flow strict

import { personalData } from "@/utils/data/personal-data";
import Image from "next/image";
import Link from "next/link";


function AboutSection() {
  return (
    <section id="about" className="sw-section">
      <div className="sw-container">
        <p className="sw-eyebrow">About</p>
        <h2 className="sw-head">Who I am.</h2>

        <div className="mt-10 grid grid-cols-1 items-start gap-10 md:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          <Image
            src={personalData.profile}
            width={640}
            height={800}
            alt="Andres Pena"
            className="sw-mono-img aspect-[4/5] w-full max-w-[320px] border border-[var(--sw-border)] object-cover"
          />
          <div>
            <p className="sw-lede text-[var(--sw-silver)] lg:text-[15px]">
              {personalData.description}
            </p>
            <div className="mt-8 border-t border-[var(--sw-rule)] pt-6">
              <span className="sw-label">Based in</span>
              <p className="mt-2 text-sm text-[var(--sw-white-soft)]">{personalData.address}</p>
            </div>
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
