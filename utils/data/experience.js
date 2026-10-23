// From the engineering CV (latest). Most recent and most senior first.
//
// In the Experience reel each role opens on `cover`, then shows `desc` as
// "What I did" with `tools` as tags, then each of `photos` with its alt text
// as the caption. Only real photos of the work go here.
export const experiences = [
  {
    id: 1,
    title: "Founder & Technical Lead",
    company: "SWORT Aerospace",
    short: "SWORT",
    tab: "SWORT",
    duration: "2023 – Present",
    link: "https://www.swort.net",
    cover: { src: "/media/feed/swort-ssil-electronics.jpg", alt: "Avionics hardware installed in an open airframe bay" },
    tools: ["STM32H7", "PCB", "C/C++", "X8"],
    // Shows the partner card that opens the restricted file at /vault.
    partnerAccess: true,
    desc: [
      "Lead paid flight-controller programs, including 50 × 50 mm X8 avionics; own customer requirements, system architecture, schematic and PCB reviews, contractor coordination, and prototype acceptance planning.",
      "Direct prototype troubleshooting, corrective actions, design revisions, and repeat testing before release.",
      "Assemble, solder, and troubleshoot electronics with an oscilloscope, multimeter, and bench power supplies.",
      "Support projects under nondisclosure agreements; protect proprietary files and control agreed disclosures.",
    ],
  },
  {
    id: 2,
    title: "Electromechanical Lead",
    company: "ASME / Shell Eco-marathon",
    short: "Shell Eco-marathon",
    cover: { src: "/media/feed/shell-eco-marathon-320.jpg", alt: "The team's car, number 320, on the Shell Eco-marathon stage" },
    photos: [
      { src: "/media/feed/shell-eco-marathon-inspection.jpg", alt: "The team beside car 324 after passing technical inspection at the Shell Eco-marathon" },
    ],
    tab: "Shell",
    duration: "2025 – Present",
    link: "https://asmepnw.com",
    tools: ["STM32", "CAD", "MATLAB", "CSIA"],
    desc: [
      "Lead ongoing STM32 vehicle telemetry and motor-controller development: sensor data acquisition, offline logging, driver display, and CSIA shadow monitoring.",
      "Designed and integrated the vehicle's hydraulic brake system; created SolidWorks CAD and MATLAB simulations projecting ~12% shorter stopping distance.",
    ],
  },
  {
    id: 3,
    title: "Avionics Engineer",
    company: "Purdue Space Program / ASTRA",
    short: "Purdue Space Program",
    cover: { src: "/media/feed/psp-toad-render.jpg", alt: "A render of the Purdue Space Program's TOAD lander over campus" },
    photos: [
      { src: "/media/feed/psp-astra-testbed.jpg", alt: "ASTRA on the shop floor with its flight computer and wiring" },
      { src: "/media/feed/psp-thrust-chamber.jpg", alt: "A thrust chamber assembly on a test stand" },
    ],
    tab: "Purdue",
    duration: "2025",
    link: "https://purdueseds.space/astra/",
    tools: ["GNC", "C++", "LTspice", "PCB"],
    desc: [
      "Developed C/C++ flight-control firmware and avionics sensor interfaces for GNC testing; performed LTspice circuit analysis, PCB layout review, and board-level fault isolation.",
    ],
  },
];
