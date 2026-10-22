import SectionHeading from "@/app/components/helper/section-heading";
import ResearchList from "@/app/components/research/research-list";
import Link from "next/link";

// Home-page entry point to /research: every entry links to its own page.
function ResearchTeaser({ entries }) {
  if (!entries?.length) return null;

  return (
    <section id="research" className="sw-section sw-paper">
      <div className="sw-container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionHeading eyebrow="Research" title="Sensor integrity, in the open." />
            <p className="sw-lede -mt-2">How much should an autonomous system trust each of its own inputs? Each entry opens into its own page.</p>
          </div>
          <Link href="/research" className="sw-btn sw-btn-primary">
            All research
          </Link>
        </div>
        <div className="mt-10">
          <ResearchList entries={entries} />
        </div>
      </div>
    </section>
  );
}

export default ResearchTeaser;
