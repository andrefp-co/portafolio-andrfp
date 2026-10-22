// @flow strict
import { personalData } from "@/utils/data/personal-data";
import Link from 'next/link';
import LocalTime from "./motion/local-time";

function Footer() {
  return (
    <footer className="border-t border-[var(--sw-rule)] bg-[var(--sw-black)]">
      <div className="sw-container py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--sw-gray)]">
            © {new Date().getFullYear()} {personalData.name}
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--sw-gray)] md:text-center">
            {personalData.address} · <LocalTime timeZone={personalData.timeZone} />
          </p>
          <div className="flex items-center gap-6 md:justify-end">
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
