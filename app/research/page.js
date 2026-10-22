import LearnCta from "../components/helper/learn-cta";
import PageHeader from "../components/helper/page-header";
import ResearchList from "../components/research/research-list";
import { getResearch } from "@/utils/content";

export const metadata = {
  title: "Research",
  description: "Papers and programs on sensor integrity: self-occlusion in runtime diagnosis, validity gating, the CSIA trust layer, the System State Integrity Layer, and a Shell Eco-marathon motor controller.",
};

export default function ResearchPage() {
  const entries = getResearch();
  const papers = entries.filter((e) => e.kind === "paper");
  const programs = entries.filter((e) => e.kind !== "paper");

  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Which sensors deserve to be believed."
        lede="Most of my research is about integrity: deciding, in real time, how much an autonomous system should trust each of its own inputs. Each entry states exactly how far its evidence goes."
      >
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="Research sections">
          <a href="#papers" className="sw-btn sw-btn-ghost">Papers · {papers.length}</a>
          <a href="#programs" className="sw-btn sw-btn-ghost">Programs · {programs.length}</a>
        </nav>
      </PageHeader>

      {papers.length > 0 && (
        <section id="papers" className="sw-section sw-paper !border-t-0 scroll-mt-20">
          <div className="sw-container">
            <p className="sw-eyebrow">Papers</p>
            <h2 className="sw-head">Working papers</h2>
            <p className="sw-lede mt-3">In preparation and not yet peer reviewed. Each page carries the abstract; drafts are shared on request.</p>
            <div className="mt-10">
              <ResearchList entries={papers} />
            </div>
          </div>
        </section>
      )}

      <section id="programs" className="sw-section sw-paper scroll-mt-20">
        <div className="sw-container">
          <p className="sw-eyebrow">Programs</p>
          <h2 className="sw-head">Systems and builds</h2>
          <div className="mt-10">
            <ResearchList entries={programs} />
          </div>
        </div>
      </section>

      <LearnCta />
    </>
  );
}
