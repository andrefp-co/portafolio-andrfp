// Smooth scrolling (motion/smooth-scroll.jsx) registers its Lenis instance
// here. These helpers go through it while it runs, and through the browser
// otherwise (reduced motion, or before it starts).
let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

export function scrollToY(top, { immediate = false } = {}) {
  if (lenis) lenis.scrollTo(top, { immediate, duration: 1.1 });
  else window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}

// Holds the page still while an overlay is open. Returns the release.
export function lockScroll(el = document.body) {
  const previous = el.style.overflow;
  el.style.overflow = "hidden";
  lenis?.stop();
  return () => {
    el.style.overflow = previous;
    lenis?.start();
  };
}
