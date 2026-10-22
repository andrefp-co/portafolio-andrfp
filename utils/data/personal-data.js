export const personalData = {
  name: "Andres Peña",
  profile: "/andres-pena.jpg",
  designation: "Embedded Systems, Avionics & Electronics Test",
  description:
    "I'm an embedded systems technical lead with paid avionics development experience, and the founder of SWORT Aerospace, where I lead flight-controller programs from customer requirements to prototype acceptance. My work is hands-on: C/C++ and Python, PCB and schematic review, prototype assembly, soldering, hardware troubleshooting, and validation. I study electrical engineering at Montgomery College and work in English and Spanish.",
  // Email and phone are deliberately not here: this file ships in the public
  // JavaScript bundle. The email is encoded in utils/obfuscate.js and decoded
  // in the browser; the phone is only in the restricted file.
  address: "Washington, DC area",
  timeZone: "America/New_York",

  github: "https://github.com/andrefp-co",
  linkedIn: "https://www.linkedin.com/in/andrespenaavila",
  // Left empty: the previous value was an unfinished placeholder
  // (".../people/Andres-Felipe/yourprofileid"). Links with no URL are hidden.
  facebook: "",
  twitter: "https://x.com/andrfpco",
  leetcode: "https://leetcode.com/u/andrefp-co/",
  stackOverflow: "https://stackoverflow.com/users/32070657/andres",
  devUsername: "andrfp",
  // The engineering CV sits behind the vault's access code; this opens the
  // terminal and, once unlocked, the résumé section of the file.
  resume: "/vault?next=resume"
};
