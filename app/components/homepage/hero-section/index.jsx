// @flow strict

import HeroIntro from "./hero-intro";
import HeroStage from "./hero-stage";

// One moving picture on the first screen: the bench feed fills the hero as
// its background and the introduction sits over it. The attitude telemetry
// instrument lives with the SWORT role in Experience.
function HeroSection() {
  return (
    <HeroStage>
      <HeroIntro />
    </HeroStage>
  );
};

export default HeroSection;
