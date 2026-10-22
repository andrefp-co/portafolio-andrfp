import SectionHeading from "@/app/components/helper/section-heading";
import ResearchList from "@/app/components/research/research-list";
import Link from "next/link";

// Home-page entry point to /research: every entry links to its own page.
function ResearchTeaser({ entries }) {
  if (!entries?.length) return null;

  return (
    <section id="research" className="sw-section sw-paper">
      <div className="sw-container">
        <SectionHeading
          eyebrow="Research"
          title="Sensor integrity, in the open."
          lede="How much should an autonomous system trust each of its own inputs? Each entry opens into its own page."
          action={
            <Link href="/research" className="sw-btn sw-btn-ghost">
              All research <span aria-hidden="true">→</span>
            </Link>
          }
        />
        <div className="mt-10">
          <ResearchList entries={entries} />
        </div>
      </div>
    </section>
  );
}

export default ResearchTeaser;
