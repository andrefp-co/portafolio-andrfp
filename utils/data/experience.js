// From the engineering CV (latest). Most recent and most senior first.
export const experiences = [
  {
    id: 1,
    title: "Founder & Technical Lead",
    company: "SWORT Aerospace",
    duration: "2023 – Present",
    link: "https://www.swort.net",
    images: [{ src: "/media/feed/swort-avionics-board.jpg", alt: "A SWORT avionics board" }],
    // Shows the partner button that opens the restricted file at /vault.
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
    duration: "2025 – Present",
    link: "https://asmepnw.com",
    images: [
      { src: "/media/feed/shell-eco-marathon-inspection.jpg", alt: "The team beside car 324 after passing technical inspection at the Shell Eco-marathon" },
      { src: "/media/feed/shell-eco-marathon-320.jpg", alt: "The team's car, number 320, on the Shell Eco-marathon stage" },
    ],
    desc: [
      "Lead ongoing STM32 vehicle telemetry and motor-controller development: sensor data acquisition, offline logging, driver display, and CSIA shadow monitoring.",
      "Designed and integrated the vehicle's hydraulic brake system; created SolidWorks CAD and MATLAB simulations projecting ~12% shorter stopping distance.",
    ],
  },
  {
    id: 3,
    title: "Avionics Engineer",
    company: "Purdue Space Program / ASTRA",
    duration: "2025",
    link: "https://purdueseds.space/astra/",
    images: [
      { src: "/media/feed/psp-astra-testbed.jpg", alt: "ASTRA on the shop floor with its flight computer and wiring" },
      { src: "/media/feed/psp-toad-render.jpg", alt: "A render of the Purdue Space Program's TOAD lander over campus" },
      { src: "/media/feed/psp-thrust-chamber.jpg", alt: "A thrust chamber assembly on a test stand" },
    ],
    desc: [
      "Developed C/C++ flight-control firmware and avionics sensor interfaces for GNC testing; performed LTspice circuit analysis, PCB layout review, and board-level fault isolation.",
    ],
  },
];
