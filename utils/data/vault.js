// SERVER-ONLY. Imported by app/vault/page.js after the session check passes.
// Never import this file from a client component: anything here would then
// ship in the public JavaScript bundle and the access code would protect
// nothing. Add private material (unreleased projects, internal links, an
// extended résumé) to `sections` below.
import { personalData } from "./personal-data";

export const vault = {
  subject: "PEÑA, ANDRES",
  role: "Founder and CEO, SWORT Aerospace",
  location: personalData.address,
  sections: [
    {
      id: "direct",
      title: "Direct line",
      rows: [
        ["Personal email", personalData.email],
        ["SWORT email", "andrfp@swort.net"],
        ["Phone", personalData.phone],
        ["Résumé", personalData.resume],
        ["LinkedIn", personalData.linkedIn],
      ],
    },
    {
      id: "founder",
      title: "Founder file",
      paragraphs: [
        "Founded SWORT Aerospace around one conviction: an autonomous vehicle should know when its own sensors have stopped telling the truth. That problem sits underneath every system the company builds.",
        "Sets SWORT's technical direction, decides which programs the company takes on, and owns the standard those programs are held to. Leads the company's sensor-integrity research and the commercial path that turns it into hardware customers can fly.",
      ],
    },
    {
      id: "programs",
      title: "Programs, with their real status",
      rows: [
        ["CSIA trust layer", "Advisory companion-computer runtime. Validated in simulation, on 26 public PX4 logs and in live SITL. Not flown in the loop. Not certified."],
        ["System State Integrity Layer", "Public commercial architecture, in active development."],
        ["SEM motor controller", "C11 core host-verified against a synthetic plant. Vehicle interface open; hardware not frozen; nothing energized."],
      ],
    },
    {
      id: "gates",
      title: "CSIA: path to flight",
      list: [
        "Re-run SITL on current code, including the GPS-glitch injection, before any new claim.",
        "Commissioning calibration on the actual airframe (mandatory sigma calibration).",
        "Overnight soak on the Pi 5 companion computer itself.",
        "Advisory-only supervised flights: live MAVLink in, state logged, nothing commanded.",
        "Held-out real-log campaign for a false-alarm rate an evaluator can't dismiss.",
        "Only then: consider enabling commands, SITL-validated first, under range-safety rules.",
      ],
    },
  ],
};
