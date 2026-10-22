// Grouped by discipline. Every entry comes from the tools named in the
// projects, experience, and hero data, or from the previous flat skills list.
// `icon` is a Simple Icons export from react-icons/si; entries without one
// render as a short text mark on the skills globe.
export const skillGroups = [
  {
    discipline: "Embedded & firmware",
    skills: [
      { name: "C", icon: "SiC" },
      { name: "C++", icon: "SiCplusplus" },
      { name: "MicroPython", icon: "SiMicropython" },
      { name: "ESP32", icon: "SiEspressif" },
      { name: "Arduino", icon: "SiArduino" },
      { name: "Linux", icon: "SiLinux" },
    ],
  },
  {
    discipline: "Hardware & electronics",
    skills: [
      { name: "Altium", icon: "SiAltiumdesigner" },
      { name: "LTSpice", icon: "SiLtspice" },
      { name: "PCB design", mark: "PCB" },
      { name: "IMU sensors", mark: "IMU" },
      { name: "Telemetry systems", mark: "TLM" },
      { name: "VESC", mark: "VESC" },
    ],
  },
  {
    discipline: "Simulation & CAD",
    skills: [
      { name: "MATLAB", mark: "MAT" },
      { name: "Simulink", mark: "SIM" },
      { name: "ANSYS", icon: "SiAnsys" },
      { name: "SolidWorks", icon: "SiDassaultsystemes" },
      { name: "Fusion 360", icon: "SiAutodesk" },
      { name: "Onshape", mark: "OS" },
    ],
  },
  {
    discipline: "Software & web",
    skills: [
      { name: "Python", icon: "SiPython" },
      { name: "JavaScript", icon: "SiJavascript" },
      { name: "React", icon: "SiReact" },
      { name: "Next.js", icon: "SiNextdotjs" },
      { name: "Go", icon: "SiGo" },
      { name: "Ruby", icon: "SiRuby" },
      { name: "PHP", icon: "SiPhp" },
      { name: "Julia", icon: "SiJulia" },
      { name: "HTML", icon: "SiHtml5" },
      { name: "CSS", icon: "SiCss3" },
      { name: "MaterialUI", icon: "SiMui" },
    ],
  },
  {
    discipline: "Data & infrastructure",
    skills: [
      { name: "PostgreSQL", icon: "SiPostgresql" },
      { name: "MySQL", icon: "SiMysql" },
      { name: "Firebase", icon: "SiFirebase" },
      { name: "AWS", icon: "SiAmazonaws" },
      { name: "Git", icon: "SiGit" },
    ],
  },
];
