"use client";

import { personalData } from "@/utils/data/personal-data";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ScrambleText from "./motion/scramble-text";

const links = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Education", href: "/#education" },
  { label: "Blog", href: "/blog" },
];

const EASE = [0.22, 1, 0.36, 1];

function Navbar() {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [sectionInView, setSectionInView] = useState(null);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu whenever the route changes (adjusting state during
  // render, as React recommends, rather than in an effect).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  const active = pathname === "/" ? sectionInView : pathname === "/blog" ? "/blog" : null;

  // Slide away while reading down the page; come back on any scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 160);
  });

  // Mark the section currently under the middle of the viewport.
  useEffect(() => {
    if (pathname !== "/") return;
    const sections = links
      .filter((link) => link.href.startsWith("/#"))
      .map((link) => document.getElementById(link.href.slice(2)))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSectionInView(`/#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  // The mobile menu owns the screen while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <motion.nav
        className="sticky top-0 z-[60] border-b border-[var(--sw-rule)] bg-[rgba(5,5,5,0.92)] backdrop-blur-md"
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div className="flex h-[76px] items-center justify-between px-5 sm:px-10">
          <Link href="/" className="text-[13px] font-medium uppercase tracking-[0.3em] text-white">
            {personalData.name}
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  aria-current={active === link.href ? "true" : undefined}
                  className={`block px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 hover:text-white ${active === link.href ? "text-white" : "text-[var(--sw-gray)]"}`}
                >
                  <ScrambleText trigger="hover">{link.label}</ScrambleText>
                </Link>
                {active === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-4 -bottom-[19px] h-px bg-white"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link href="/#contact" className="sw-btn sw-btn-nav hidden sm:inline-flex">
              Contact
            </Link>
            <button
              type="button"
              className="sw-icon-btn lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <motion.span
                  className="absolute left-0 top-0 h-px w-5 bg-current"
                  animate={open ? { top: "50%", rotate: 45 } : { top: "0%", rotate: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 h-px w-5 bg-current"
                  animate={open ? { bottom: "calc(50% - 1px)", rotate: -45 } : { bottom: "0%", rotate: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Reading progress along the bottom hairline. */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-white"
          style={{ scaleX: progress }}
        />
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[76px] z-[55] flex flex-col overflow-y-auto bg-[var(--sw-black)] px-5 pb-10 pt-6 sm:px-10 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <ul className="flex flex-col">
              {[...links, { label: "Contact", href: "/#contact" }].map((link, i) => (
                <motion.li
                  key={link.href}
                  className="border-b border-[var(--sw-rule)]"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: EASE }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-5 py-4"
                  >
                    <span className="sw-cell-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-[family-name:var(--sw-font-display)] text-[40px] leading-none tracking-[0.02em] text-white">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mt-auto pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <p className="sw-label">{personalData.address}</p>
              <p className="mt-2 break-all text-sm text-white">{personalData.email}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
