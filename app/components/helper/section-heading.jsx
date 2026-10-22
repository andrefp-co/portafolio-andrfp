import ScrambleText from "../motion/scramble-text";

// Eyebrow + heading pair used by every section. The eyebrow resolves out of
// glyph noise when it scrolls into view, as section labels do on swort.net.
export default function SectionHeading({ eyebrow, title, as: Heading = "h2" }) {
  return (
    <>
      <ScrambleText as="p" className="sw-eyebrow">{eyebrow}</ScrambleText>
      <Heading className="sw-head">{title}</Heading>
    </>
  );
}
