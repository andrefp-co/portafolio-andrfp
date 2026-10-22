// SERVER-ONLY. Imported by app/vault/page.js after the session check passes.
// Never import this file from a client component: anything here would then
// ship in the public JavaScript bundle and the access code would protect
// nothing.
//
// Every statement below comes from the CSIA repository's TRL assessment,
// transition report and commercialization notes, or from swort.net. Keep it
// that way: state gaps plainly and never round a status up.
//
// Only material that is NOT on the public site belongs here. The papers, the
// research pages, SSIL, the SEM controller and the role descriptions are all
// public already; repeating them here would make the code protect nothing.
import { personalData } from "./personal-data";

export const vault = {
  subject: "PEÑA, ANDRES",
  role: "Founder and CEO, SWORT Aerospace",
  entity: "SWORT LLC",
  location: personalData.address,
  asOf: "October 2026",
  sections: [
    {
      id: "resume",
      kicker: "Résumé",
      title: "Résumé",
      document: {
        title: "Andres Peña, engineering CV",
        src: "/api/vault/media/andres-pena-cv.pdf",
        download: "/api/vault/media/andres-pena-cv.pdf?download=1",
        pages: ["/api/vault/media/andres-pena-cv-1.jpg"],
      },
    },
    {
      id: "entity",
      kicker: "File 00",
      title: "Entity registration",
      rows: [
        ["SAM.gov status", "Active"],
        ["Unique Entity ID", "CM95U729C6K9"],
        ["CAGE code", "21UQ1"],
        ["Primary NAICS", "541330 Engineering Services"],
      ],
      note: "Registration does not imply government endorsement, contract award, certification, product qualification or security clearance.",
    },
    {
      id: "x8",
      kicker: "Hardware",
      title: "X8 flight controller, 50 × 50 mm",
      video: {
        src: "/api/vault/media/x8-board-review.mp4",
        webm: "/api/vault/media/x8-board-review.webm",
        poster: "/api/vault/media/x8-board-review.jpg",
        caption: "3D layout review of the current board.",
      },
      rows: [
        ["Form factor", "50 × 50 mm, four-layer stack (top, ground, power, bottom)"],
        ["Outputs", "Eight ESC outputs"],
        ["Ports", "GPS, compass, RC, auxiliary and USB-C"],
        ["Program", "Paid customer program"],
      ],
    },
    {
      id: "csia",
      kicker: "Program 01",
      title: "CSIA trust layer: UAV core",
      trl: { level: 4, target: 5, note: "Self-assessed on the DoDI 5000.88 scale. Entering TRL 5." },
      paragraphs: [
        "Where the UAV core stands, with the numbers the public research page leaves out.",
      ],
      rows: [
        ["Evidence", "Frozen-config Monte Carlo (150 runs, Wilson and Poisson intervals); 26 public PX4 logs (0.518 monitored flight-hours, unannotated); live ArduCopter SITL with fault injection."],
        ["Detection, simulated", "GPS spoof attributed at 89% confidence, 4.4 s to the operator alert. IMU drift isolated to the correct unit."],
        ["Transition", "TRL assessment and engineering transition report written for an Army xTech or SBIR review."],
      ],
    },
    {
      id: "csia-gaps",
      kicker: "Program 01",
      title: "Open gaps, stated plainly",
      list: [
        "C-3: slow single-IMU bias drift raises no alert (Monte Carlo true-positive rate 0.00). Must be fixed or formally scoped out.",
        "H-3: no target hardware has run the code yet. Embedded timing is desktop measurement or projection. This is what holds the TRL at 4.",
        "H-4: the real-log false-alarm rate (3.86 episodes per flight-hour, 95% CI 0.47 to 13.94) is train/test contaminated. A held-out protocol is written, not yet run.",
        "L-5: MAVLink signing has to land before the runtime is given any command authority.",
      ],
    },
    {
      id: "flight",
      kicker: "Program 01",
      title: "Path to flight",
      list: [
        "Re-run SITL on current code, including the GPS-glitch injection, before any new claim.",
        "Commissioning calibration on the actual airframe (mandatory sigma calibration).",
        "Overnight soak on the Pi 5 companion computer itself.",
        "Advisory-only supervised flights: live MAVLink in, state logged, nothing commanded.",
        "Held-out real-log campaign for a false-alarm rate an evaluator can't dismiss.",
        "Only then: consider enabling commands, SITL-validated first, under range-safety rules.",
      ],
    },
    {
      id: "seeker",
      kicker: "Program 02",
      title: "Interceptor-seeker extension",
      trl: { level: 2, upper: 3, note: "Concept with first-pass synthetic evidence." },
      paragraphs: [
        "Applies the same trust and diagnosis logic to an interceptor seeker. Synthetic Monte Carlo proof of concept only: no seeker hardware and no government-furnished data. Every result is labeled synthetic and kept separate from the UAV core.",
      ],
    },
    {
      id: "sbir",
      kicker: "Pathway",
      title: "SBIR / STTR fit",
      rows: [
        ["AFWERX Open Topic, Phase I", "Direct fit: assured PNT, GPS-denied resilience and sensor integrity for attritable UAS."],
        ["Phase I objectives", "Monte Carlo detection datasheet at 10^3 randomized flights; sigma-calibration campaign on SOW001 hardware; multi-fault diagnosis with a factor graph in place of naive Bayes; SITL fault-injection matrix."],
        ["Readiness path", "TRL 4 today, targeting TRL 6 in Phase II on SOW001 flight hardware."],
        ["NASA SBIR, adjacent", "Autonomous-systems health management; UAS traffic-management safety cases."],
        ["Commercial model", "Per-vehicle companion-computer license, SDK for OEMs and integrators, fleet monitoring for Part 107 operators."],
      ],
    },
    {
      id: "handling",
      kicker: "Handling",
      title: "What SWORT does not have",
      paragraphs: [
        "No federal contract award, no past performance on a federal contract, no facility or personnel security clearance, no product qualification and no certification or accreditation of any kind.",
      ],
    },
    {
      id: "direct",
      kicker: "Contact",
      title: "Direct line",
      // Read from the server's environment so they are not in this public
      // repository. Rows without a value are left out.
      rows: [
        ["SWORT email", process.env.VAULT_CONTACT_EMAIL],
        ["Personal email", process.env.VAULT_CONTACT_PERSONAL_EMAIL],
        ["Phone", process.env.VAULT_CONTACT_PHONE],
      ].filter(([, v]) => v),
    },
  ].filter((section) => !section.rows || section.rows.length > 0),
};
