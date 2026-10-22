// Photo posts for the blog feed. A post with several images shows them as a
// swipeable carousel. Captions state only what is known.
const andres = { name: "Andres Peña", handle: "andrfp", avatar: "/andres-pena.jpg" };

export const moments = [
  {
    id: "shell-eco-marathon",
    author: andres,
    event: "Shell Eco-marathon",
    text: "We passed technical inspection at the Shell Eco-marathon. On this team I lead the electromechanical side: I designed and integrated the hydraulic brake system, and I'm leading the STM32 telemetry and motor-controller work.",
    images: [
      {
        src: "/media/feed/shell-eco-marathon-inspection.jpg",
        alt: "The Purdue University Northwest team cheering beside car 324 under a banner reading We passed Technical Inspection",
      },
      {
        src: "/media/feed/shell-eco-marathon-320.jpg",
        alt: "The team's black streamlined car, number 320, on the Shell Eco-marathon display stage",
      },
    ],
    tags: ["Shell Eco-marathon", "Electromechanical", "Embedded"],
    link: "/research/sem-motor-controller",
  },
  {
    id: "purdue-space-program",
    author: andres,
    event: "Purdue Space Program",
    text: "Purdue Space Program. On ASTRA I developed C/C++ flight-control firmware and avionics sensor interfaces for GNC testing. Also in the program: TOAD, a liquid-fueled lander, 2.75 m tall and 193 kg wet on LOX and IPA.",
    images: [
      {
        src: "/media/feed/psp-astra-testbed.jpg",
        alt: "ASTRA on the shop floor: a tall frame carrying its flight computer, battery and wiring, standing on four legs",
      },
      {
        src: "/media/feed/psp-thrust-chamber.jpg",
        alt: "A thrust chamber assembly with a copper liner mounted on a test stand",
      },
      {
        src: "/media/feed/psp-toad-render.jpg",
        alt: "A render of the TOAD lander flying over Purdue's campus at sunset",
      },
      {
        src: "/media/feed/psp-toad-mass-properties.jpg",
        alt: "TOAD's mass properties table beside its CAD model, marking the center of mass",
        fit: "contain",
      },
    ],
    tags: ["Purdue Space Program", "Avionics", "GNC"],
  },
];
