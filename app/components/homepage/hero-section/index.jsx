// @flow strict

import Tilt from "@/app/components/motion/tilt";
import HeroFeed from "./hero-feed";
import HeroIntro from "./hero-intro";
import HeroStage from "./hero-stage";
import Telemetry from "./telemetry";

function HeroSection() {
  return (
    <HeroStage className="sw-bg-grid sw-hero-grid relative overflow-hidden border-b border-[var(--sw-rule)]">
      <div className="sw-container grid grid-cols-1 items-center gap-14 py-16 lg:grid-cols-[1fr_1fr] lg:gap-12 lg:py-24">
        <HeroIntro />
        {/* Ground-station pair: the bench feed with the telemetry instrument
            floating over its lower-left corner. */}
        <div className="relative min-w-0 lg:pb-44">
          <Tilt max={4}>
            <HeroFeed />
          </Tilt>
          <div className="relative z-10 mx-3 -mt-12 sm:mx-8 lg:absolute lg:-left-12 lg:bottom-0 lg:mx-0 lg:mt-0 lg:w-[74%]">
            <Telemetry />
          </div>
        </div>
      </div>
    </HeroStage>
  );
};

export default HeroSection;
