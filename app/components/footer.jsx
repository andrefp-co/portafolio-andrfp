// @flow strict
import { personalData } from "@/utils/data/personal-data";
import Link from 'next/link';

function Footer() {
  return (
    <footer className="border-t border-[var(--sw-rule)] bg-[var(--sw-black)]">
      <div className="sw-container py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--sw-gray)]">
            © {new Date().getFullYear()} {personalData.name} · Engineering Portfolio
          </p>
          <div className="flex items-center gap-6">
            <Link target="_blank" href={personalData.github} className="sw-link">
              GitHub <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link target="_blank" href={personalData.linkedIn} className="sw-link">
              LinkedIn <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
