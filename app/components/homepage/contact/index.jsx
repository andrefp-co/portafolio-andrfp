// @flow strict
import SectionHeading from '@/app/components/helper/section-heading';
import LocalTime from '@/app/components/motion/local-time';
import { personalData } from '@/utils/data/personal-data';
import Link from 'next/link';
import { BiLogoLinkedin } from "react-icons/bi";
import { FaFacebook, FaStackOverflow } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";
import ContactForm from './contact-form';
import CopyEmail from './copy-email';

const socials = [
  { label: "GitHub", href: personalData.github, Icon: IoLogoGithub },
  { label: "LinkedIn", href: personalData.linkedIn, Icon: BiLogoLinkedin },
  { label: "X / Twitter", href: personalData.twitter, Icon: FaXTwitter },
  { label: "Stack Overflow", href: personalData.stackOverflow, Icon: FaStackOverflow },
  { label: "Facebook", href: personalData.facebook, Icon: FaFacebook },
];

function ContactSection() {
  return (
    <section id="contact" className="sw-section">
      <div className="sw-container">
        <SectionHeading eyebrow="Contact" title="Get in touch." />

        <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <ContactForm email={personalData.email} />

          <div className="min-w-0">
            <div className="sw-rows">
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Email</span>
                <CopyEmail email={personalData.email} />
              </div>
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Phone</span>
                <p className="mt-2 text-sm text-[var(--sw-white)]">{personalData.phone}</p>
              </div>
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Location</span>
                <p className="mt-2 text-sm text-[var(--sw-white)]">{personalData.address}</p>
                <p className="mt-1 text-xs text-[var(--sw-gray)]">
                  Local time <LocalTime timeZone={personalData.timeZone} />
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {socials.filter(({ href }) => href).map(({ label, href, Icon }) => (
                <Link key={label} target="_blank" href={href} aria-label={label} className="sw-icon-btn">
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
