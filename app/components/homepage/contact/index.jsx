// @flow strict
import SectionHeading from '@/app/components/helper/section-heading';
import LocalTime from '@/app/components/motion/local-time';
import { personalData } from '@/utils/data/personal-data';
import SocialLinks from '@/app/components/helper/social-links';
import ContactForm from './contact-form';
import CopyEmail from './copy-email';

function ContactSection() {
  return (
    <section id="contact" className="sw-section">
      <div className="sw-container">
        <SectionHeading eyebrow="Contact" title="Get in touch." />

        <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <ContactForm />

          <div className="min-w-0">
            <div className="sw-rows">
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Email</span>
                <CopyEmail />
              </div>
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Location</span>
                <p className="mt-2 text-sm text-[var(--sw-white)]">{personalData.address}</p>
                <p className="mt-1 text-xs text-[var(--sw-gray)]">
                  Local time <LocalTime timeZone={personalData.timeZone} />
                </p>
              </div>
            </div>

            <SocialLinks className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
