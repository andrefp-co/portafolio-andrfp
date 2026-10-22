import ScrambleText from "../motion/scramble-text";

// Opening band for the standalone pages (research, blog, articles): the same
// coordinate grid as the home hero, at a reading-page scale.
export default function PageHeader({ eyebrow, title, lede, children }) {
  return (
    <section className="sw-bg-grid border-b border-[var(--sw-rule)]">
      <div className="sw-container py-16 lg:py-24">
        <ScrambleText as="p" className="sw-eyebrow">{eyebrow}</ScrambleText>
        <h1 className="sw-display max-w-[16ch] !text-[clamp(48px,7vw,96px)]">{title}</h1>
        {lede && <p className="sw-lede mt-6 text-[var(--sw-silver)]">{lede}</p>}
        {children}
      </div>
    </section>
  );
}
