"use client";

import SectionHeading from "@/app/components/helper/section-heading";
import { useReducedMotion } from "@/utils/use-reduced-motion";
import { useSyncExternalStore } from "react";
import ExperienceReel from "./reel";
import Timeline from "./timeline";

const subscribe = (onChange) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
// Too short to hold the pinned reel (a phone on its side): use the timeline.
const isShort = () => window.innerHeight < 600;

export default function ExperienceView({ items }) {
  const reduce = useReducedMotion();
  const short = useSyncExternalStore(subscribe, isShort, () => false);

  if (reduce || short) {
    return (
      <div className="sw-section !border-t-0">
        <div className="sw-container">
          <SectionHeading eyebrow="Experience" title="Engineering roles." />
          <Timeline items={items} />
        </div>
      </div>
    );
  }
  return <ExperienceReel items={items} />;
}
