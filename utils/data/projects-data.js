// From the engineering CV's selected projects and research, plus the brake
// system from the Shell Eco-marathon role. Status is stated in each
// description exactly as far as the evidence goes.
export const projectsData = [
    {
        id: 1,
        name: 'CSIA Sensor Assurance Research',
        metric: { value: 26, label: 'Public PX4 flight logs evaluated' },
        description: "Developed a 25 Hz Python/MAVLink sensor-diagnosis runtime and evaluated it on 26 public PX4 logs and in live ArduPilot SITL tests. Recorded 277,500 desktop soak-test ticks with zero runtime errors. Integrated a zero-allocation native C reference core and verified C/Python parity to 1e-12 on an 8-node, 11-edge graph in desktop tests.",
        tools: ['Python', 'C', 'MAVLink', 'PX4 Logs', 'ArduPilot SITL', 'Fault Injection'],
        role: 'Technical Lead, SWORT Aerospace',
        image: '/media/project-uav.jpg',
        imageAlt: 'A quadcopter drone with an exposed flight controller',
        code: 'https://github.com/SWORT-Aerospace/csia-trust-layer',
        demo: '',
    },
    {
        id: 2,
        name: 'STM32H743 Flight Controllers',
        metric: { value: 4, suffix: '-layer', label: 'Board stack, dual IMUs' },
        description: "Lead four-layer STM32H743 flight-controller prototypes with dual IMUs, barometers, and magnetometers. Review schematics, layouts, BOMs, and manufacturing files. Validation ongoing.",
        tools: ['STM32H743', 'Four-layer PCB', 'Dual IMU', 'Barometer', 'Magnetometer', 'Schematic Review', 'BOM Review'],
        role: 'Technical Lead, SWORT Aerospace',
        image: '/media/project-avionics.jpg',
        imageAlt: 'Stacked avionics boards inside an open airframe section',
        code: '',
        demo: '',
    },
    {
        id: 3,
        name: 'Hydraulic Brake System',
        metric: { value: 12, prefix: '~', suffix: '%', label: 'Shorter projected stopping distance' },
        description: "Designed and integrated the hydraulic brake system for a Shell Eco-marathon vehicle. Created the SolidWorks CAD and MATLAB simulations projecting a ~12% shorter stopping distance.",
        tools: ['SolidWorks', 'MATLAB', 'Hydraulic Brakes', 'Vehicle Integration'],
        role: 'Electromechanical Lead, ASME / Shell Eco-marathon',
        // Shown as a stopping-distance instrument (instruments/brake-sim.jsx).
        instrument: 'brake',
        code: '',
        demo: '',
    },
    {
        id: 4,
        name: 'Custom ESC Development',
        metric: { value: 8, label: 'Motor channels with per-motor telemetry' },
        description: "Lead architecture definition for eight-channel ESC systems: paired 4-in-1 boards, AM32 firmware, bidirectional DShot600, per-motor current and temperature telemetry, and power and thermal requirements. Build pending.",
        tools: ['AM32', 'DShot600', 'Power Electronics', 'Thermal Design', 'Telemetry'],
        role: 'Technical Lead, SWORT Aerospace',
        image: '/media/project-toolkit.jpg',
        imageAlt: 'An oscilloscope trace above two development boards on a test bench',
        code: '',
        demo: '',
    },
    {
        id: 5,
        name: 'Hybrid EMI Filter Research',
        // Shown as a conducted-emissions concept (instruments/emi-scope.jsx).
        instrument: 'emi',
        description: "Developing an active/passive EMI filter concept for electric-aircraft inverters, supported by Python stability models, a 1,088-case synthetic sensitivity screen, fault analysis, and a staged bench-verification plan. Hardware validation pending.",
        tools: ['Python', 'Power Electronics', 'Stability Modeling', 'Fault Analysis'],
        role: 'Researcher',
        code: '',
        demo: '',
    },
];

// Template for future entries. `metric` is the one number the project is
// judged by (taken from its description). `image` is optional; when set it
// replaces the metric panel as the project's visual. `instrument` (brake,
// emi) shows an animated instrument instead of either.
// {
//     id: 1,
//     name: '',
//     metric: { value: 0, prefix: '', suffix: '', label: '' },
//     description: "",
//     tools: [],
//     role: '',
//     code: '',
//     demo: '',
//     image: '',      // e.g. '/media/project.webp'
//     imageAlt: '',
// },
