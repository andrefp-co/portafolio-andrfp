// SERVER-ONLY. Imported by app/vault/page.js after the session check passes.
// Never import this file from a client component: anything here would then
// ship in the public JavaScript bundle and the access code would protect
// nothing.
//
// Every statement below comes from the CSIA repository's TRL assessment,
// transition report and commercialization notes, or from swort.net. Keep it
// that way: state gaps plainly and never round a status up.
import { personalData } from "./personal-data";

export const vault = {
  subject: "PEÑA, ANDRES",
  role: "Founder and CEO, SWORT Aerospace",
  entity: "SWORT LLC",
  location: personalData.address,
  asOf: "October 2026",
  sections: [
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
      id: "csia",
      kicker: "Program 01",
      title: "CSIA trust layer: UAV core",
      trl: { level: 4, target: 5, note: "Self-assessed on the DoDI 5000.88 scale. Entering TRL 5." },
      paragraphs: [
        "A companion-computer runtime that scores how far each sensor on an autonomous vehicle can be trusted, attributes a fault to the unit that caused it, and tells the operator. Advisory by default: it monitors and logs, it does not command.",
      ],
      rows: [
        ["Evidence", "Frozen-config Monte Carlo (150 runs, Wilson and Poisson intervals); 26 public PX4 logs (0.518 monitored flight-hours, unannotated); live ArduCopter SITL with fault injection."],
        ["Detection, simulated", "GPS spoof attributed at 89% confidence, 4.4 s to the operator alert. IMU drift isolated to the correct unit."],
        ["Software", "CI-gated behavioral contracts. C core matches the Python reference to 1e-12. Zero-allocation and bounds-checked, designed for STM32H7 and Pi 5."],
        ["Status", "Not flown in the loop. Not certified. Not DO-178C qualified."],
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
      id: "csia-trl5",
      kicker: "Program 01",
      title: "What closes TRL 5",
      list: [
        "Runtime on a Pi 5 consuming live MAVLink, p99 tick latency under the 40 ms budget, overnight thermal and endurance soak.",
        "Advisory run on an actual airframe, SITL first and then flight, telemetry live, state log captured.",
        "Held-out validation: fix or scope out slow IMU-bias detection, then a false-alarm number on fresh logs with a tight interval.",
      ],
      note: "None of the three touches the validated algorithm.",
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
      id: "ssil",
      kicker: "Program 03",
      title: "System State Integrity Layer",
      paragraphs: [
        "SWORT's public commercial architecture for sensor integrity. Runs beside the flight controller, compares every sensor channel against the others and against the vehicle's own motion, and reports source health, trust and fault state. Independent of flight control and estimation by design. In active development.",
      ],
    },
    {
      id: "sem",
      kicker: "Program 04",
      title: "SEM motor controller",
      paragraphs: [
        "C11 control core, host-verified against a synthetic plant. Vehicle interface open, hardware not frozen, nothing energized.",
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
      id: "documents",
      kicker: "Records",
      title: "Source documents",
      rows: [
        ["Interceptor-seeker white paper (synthetic results)", "https://github.com/SWORT-Aerospace/csia-trust-layer/blob/main/deliverables/HANDOFF_WHITEPAPER.md"],
        ["Engineering transition report", "https://github.com/SWORT-Aerospace/csia-trust-layer/blob/main/docs/TRANSITION_REPORT.md"],
        ["Technology readiness assessment", "https://github.com/SWORT-Aerospace/csia-trust-layer/blob/main/docs/TRL_ASSESSMENT.md"],
        ["Commercialization and SBIR readiness", "https://github.com/SWORT-Aerospace/csia-trust-layer/blob/main/docs/COMMERCIALIZATION.md"],
        ["Evidence matrix", "https://github.com/SWORT-Aerospace/csia-trust-layer/blob/main/docs/evidence/evidence_matrix.md"],
      ],
      note: "Each document states its own baseline commit and scope. The seeker results are synthetic throughout.",
    },
    {
      id: "handling",
      kicker: "Handling",
      title: "What SWORT does not have",
      paragraphs: [
        "No federal contract award, no past performance on a federal contract, no facility or personnel security clearance, no product qualification and no certification or accreditation of any kind.",
        "Nothing in this file is classified, Controlled Unclassified Information or export-controlled technical data. If your work may involve restricted information, send nothing further until SWORT confirms an appropriate method.",
      ],
    },
    {
      id: "direct",
      kicker: "Contact",
      title: "Direct line",
      rows: [
        ["SWORT email", personalData.email],
        ["Personal email", "penaavilaandresfelipe@gmail.com"],
        ["Phone", personalData.phone],
        ["Résumé", `https://andres.swort.net${personalData.resume}`],
        ["LinkedIn", personalData.linkedIn],
      ],
    },
  ],
};
