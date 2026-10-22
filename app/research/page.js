import PageHeader from "../components/helper/page-header";
import ResearchList from "../components/research/research-list";
import { getResearch } from "@/utils/content";

export const metadata = {
  title: "Research",
  description: "Sensor-integrity and embedded-systems research: the CSIA trust layer, the System State Integrity Layer, and a Shell Eco-marathon motor controller.",
};

export default function ResearchPage() {
  const entries = getResearch();

  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Which sensors deserve to be believed."
        lede="Most of my research is about integrity: deciding, in real time, how much an autonomous system should trust each of its own inputs. Each entry states exactly how far its evidence goes."
      />
      <section className="sw-section sw-paper !border-t-0">
        <div className="sw-container">
          <ResearchList entries={entries} />
        </div>
      </section>
    </>
  );
}
