// @flow strict
import Link from "next/link";

const links = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/#projects" },
  { label: "Education", href: "/#education" },
  { label: "Blogs", href: "/blog" },
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-[60] border-b border-[var(--sw-rule)] bg-[rgba(5,5,5,0.92)] backdrop-blur-md">
      <div className="flex h-[76px] items-center justify-between px-5 sm:px-10">
        <Link
          href="/"
          className="text-[13px] font-medium uppercase tracking-[0.3em] text-white"
        >
          Andres Peña
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--sw-gray)] transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/#contact" className="sw-btn sw-btn-nav">
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
