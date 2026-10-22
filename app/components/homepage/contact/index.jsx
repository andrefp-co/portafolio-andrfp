// @flow strict
import { personalData } from '@/utils/data/personal-data';
import Link from 'next/link';
import { BiLogoLinkedin } from "react-icons/bi";
import { FaFacebook, FaStackOverflow } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoGithub } from "react-icons/io";
import ContactForm from './contact-form';

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
        <p className="sw-eyebrow">Contact</p>
        <h2 className="sw-head">Get in touch.</h2>

        <div className="mt-10 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <ContactForm />

          <div>
            <div className="sw-rows">
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Email</span>
                <a href={`mailto:${personalData.email}`} className="mt-2 inline-block break-all text-sm text-white underline decoration-[var(--sw-gray)] underline-offset-4 hover:decoration-white">
                  {personalData.email}
                </a>
              </div>
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Phone</span>
                <a href={`tel:${personalData.phone.replace(/[^\d+]/g, '')}`} className="mt-2 inline-block text-sm text-white">
                  {personalData.phone}
                </a>
              </div>
              <div className="border-b border-[var(--sw-rule)] py-5">
                <span className="sw-label">Location</span>
                <p className="mt-2 text-sm text-white">{personalData.address}</p>
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
