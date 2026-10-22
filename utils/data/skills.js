// Grouped as in the engineering CV's technical skills. `icon` is a Simple
// Icons export from react-icons/si; entries without one render as a short
// text mark on the skills globe.
export const skillGroups = [
  {
    discipline: "Embedded",
    skills: [
      { name: "STM32H7", icon: "SiStmicroelectronics" },
      { name: "ESP32", icon: "SiEspressif" },
      { name: "Raspberry Pi", icon: "SiRaspberrypi" },
      { name: "Arduino", icon: "SiArduino" },
      { name: "C", icon: "SiC" },
      { name: "C++", icon: "SiCplusplus" },
      { name: "MicroPython", icon: "SiMicropython" },
    ],
  },
  {
    discipline: "Interfaces & flight stack",
    skills: [
      { name: "UART", mark: "UART" },
      { name: "SPI", mark: "SPI" },
      { name: "I2C", mark: "I2C" },
      { name: "CAN", mark: "CAN" },
      { name: "MAVLink", mark: "MAV" },
      { name: "PX4 SITL", mark: "PX4" },
      { name: "ArduPilot SITL", mark: "APM" },
    ],
  },
  {
    discipline: "Electronics & CAD",
    skills: [
      { name: "PCB / schematic review", mark: "PCB" },
      { name: "Altium", icon: "SiAltiumdesigner" },
      { name: "KiCad", icon: "SiKicad" },
      { name: "EasyEDA Pro", icon: "SiEasyeda" },
      { name: "LTspice", icon: "SiLtspice" },
      { name: "SolidWorks", icon: "SiDassaultsystemes" },
      { name: "Onshape", mark: "OS" },
    ],
  },
  {
    discipline: "Test & build",
    skills: [
      { name: "Soldering & assembly", mark: "SLD" },
      { name: "Oscilloscope & bench test", mark: "OSC" },
      { name: "Fault injection", mark: "FI" },
      { name: "Regression testing", mark: "REG" },
      { name: "Bill of materials", mark: "BOM" },
      { name: "Additive manufacturing", mark: "AM" },
      { name: "Metal-part fabrication", mark: "FAB" },
    ],
  },
  {
    discipline: "Software & tools",
    skills: [
      { name: "Python", icon: "SiPython" },
      { name: "MATLAB", mark: "MAT" },
      { name: "Linux", icon: "SiLinux" },
      { name: "Git", icon: "SiGit" },
      { name: "Docker", icon: "SiDocker" },
      { name: "pytest", icon: "SiPytest" },
      { name: "JavaScript", icon: "SiJavascript" },
      { name: "React", icon: "SiReact" },
      { name: "Next.js", icon: "SiNextdotjs" },
    ],
  },
];
