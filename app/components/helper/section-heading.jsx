import ScrambleText from "../motion/scramble-text";

// Eyebrow + heading pair used by every section, with an optional lede under
// it and an optional action (a button or link) aligned to its right. The
// eyebrow resolves out of glyph noise when it scrolls into view, as section
// labels do on swort.net.
export default function SectionHeading({ eyebrow, title, as: Heading = "h2", id, lede = null, action = null }) {
  const head = (
    <>
      <ScrambleText as="p" className="sw-eyebrow">{eyebrow}</ScrambleText>
      <Heading id={id} className="sw-head">{title}</Heading>
      {lede && <p className="sw-lede">{lede}</p>}
    </>
  );
  if (!action) return head;
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <div className="min-w-0 max-w-[720px]">{head}</div>
      <div className="shrink-0 sm:pb-1">{action}</div>
    </div>
  );
}
