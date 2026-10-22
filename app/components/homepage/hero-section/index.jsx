// @flow strict

import HeroIntro from "./hero-intro";
import Telemetry from "./telemetry";

function HeroSection() {
  return (
    <section className="sw-bg-grid sw-hero-grid relative overflow-hidden border-b border-[var(--sw-rule)]">
      <div className="sw-container grid grid-cols-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <HeroIntro />
        <Telemetry />
      </div>
    </section>
  );
};

export default HeroSection;
