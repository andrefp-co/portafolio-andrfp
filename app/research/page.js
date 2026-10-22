import LearnCta from "../components/helper/learn-cta";
import PageHeader from "../components/helper/page-header";
import ResearchList from "../components/research/research-list";
import { getResearch } from "@/utils/content";
import { absolute, breadcrumbs, graph, person } from "@/utils/seo";
import JsonLd from "../components/helper/json-ld";

const researchDescription =
  "Papers and programs on sensor integrity: self-occlusion, validity gating, the CSIA trust layer, SSIL and a Shell Eco-marathon motor controller.";

export const metadata = {
  title: "Research",
  description: researchDescription,
  alternates: { canonical: "/research" },
  openGraph: {
    url: "/research",
    title: "Research | Andres Peña",
    description: researchDescription,
    images: [{ url: "/media/figures/c4_self_occlusion.png", width: 1800, height: 645, alt: "Figure from the self-occlusion systems paper" }],
  },
};

export default function ResearchPage() {
  const entries = getResearch();
  const papers = entries.filter((e) => e.kind === "paper");
  const programs = entries.filter((e) => e.kind !== "paper");

  return (
    <>
      <JsonLd
        data={graph(
          person,
          {
            "@type": "CollectionPage",
            "@id": absolute("/research#page"),
            url: absolute("/research"),
            name: "Research",
            description: researchDescription,
            hasPart: entries.map((e) => ({ "@type": e.kind === "paper" ? "ScholarlyArticle" : "TechArticle", headline: e.title, url: absolute(`/research/${e.slug}`) })),
          },
          breadcrumbs([["Home", "/"], ["Research", "/research"]])
        )}
      />
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
            <ResearchList entries={programs} columns={3} />
          </div>
        </div>
      </section>

      <LearnCta />
    </>
  );
}
