export const projectsData = [
    {
        id: 1,
        name: 'Autonomous UAV Sensor & Control Platform',
        metric: { value: 100, prefix: '~', suffix: ' Hz', label: 'Sensor sampling rate' },
        description: "Designed and implemented a high-frequency sensor acquisition and control system for autonomous UAVs using ESP32-class hardware. Developed modular MicroPython firmware sampling IMU, environmental, and GPS sensors at ~100 Hz. Integrated closed-loop control algorithms and real-time telemetry, enabling precise stabilization and waypoint tracking in dynamic environments. Conducted PCB-level testing and iterative debugging cycles to optimize signal integrity and power efficiency.",
        tools: ['ESP32', 'MicroPython', 'C/C++', 'MATLAB', 'LTSpice', 'Arduino', 'PCB Design', 'IMU Sensors', 'Telemetry Systems'],
        role: 'Lead Embedded Systems Engineer',
        image: '/media/project-uav.jpg',
        imageAlt: 'Illustration: a quadcopter drone with an exposed flight controller',
        code: '',
        demo: '',
    },
    {
        id: 2,
        name: 'Electromechanical Brake System Integration',
        metric: { value: 12, prefix: '~', suffix: '%', label: 'Shorter projected stopping distance' },
        description: "Modeled and implemented a full electromechanical brake system for a high-efficiency prototype vehicle. Performed dynamic load analysis in MATLAB and Simulink, validated hydraulic/electrical actuation, and reduced projected stopping distances by ~12%. Designed control interface and integrated VESC motor controllers for regenerative braking. Oversaw mechanical-electrical co-simulation, ensuring seamless cross-disciplinary performance.",
        tools: ['MATLAB', 'Simulink', 'VESC', 'SolidWorks', 'Fusion 360', 'Hydraulic Actuators', 'OnShape', 'Electromechanical Design'],
        role: 'Electromechanical Systems Engineer',
        image: '/media/project-brake.jpg',
        imageAlt: 'Illustration: a drilled disc brake rotor and hydraulic caliper',
        code: '',
        demo: '',
    },
    {
        id: 3,
        name: 'Embedded Avionics Flight Control',
        metric: { value: 500, from: 200, prefix: '200–', suffix: ' Hz', label: 'Stabilization update rate' },
        description: "Developed firmware for a multi-module avionics system supporting flight stabilization at update rates of 200–500 Hz. Wrote ~2,500 lines of embedded C/C++ for sensor fusion, control loops, and telemetry. Led hardware integration and testing campaigns including IMU calibration, actuator interfacing, and board-level diagnostics. Optimized power delivery and signal integrity for high-performance flight scenarios.",
        tools: ['C/C++', 'Embedded Systems', 'IMU Sensors', 'PCB Testing', 'LTSpice', 'Flight Control Algorithms', 'Telemetry'],
        role: 'Electrical Engineer',
        image: '/media/project-avionics.jpg',
        imageAlt: 'Illustration: stacked avionics boards inside an open airframe section',
        code: '',
        demo: '',
    },
    {
        id: 4,
        name: 'Engineering Systems Toolkit',
        metric: { value: 40, prefix: '~', suffix: '%', label: 'Faster test iteration' },
        description: "Built a cross-platform engineering toolkit to automate firmware flashing, debugging, and sensor calibration for embedded systems projects. Integrated Linux and macOS utilities with Python scripts to streamline hardware testing, data acquisition, and performance logging. Enabled faster iteration cycles (~40% reduction) for embedded systems and UAV control projects.",
        tools: ['Python', 'Linux', 'macOS', 'ESP32', 'Arduino', 'Automation Scripts', 'Firmware Debugging', 'Data Acquisition'],
        role: 'Systems Engineer',
        image: '/media/project-toolkit.jpg',
        imageAlt: 'Illustration: an oscilloscope trace above two development boards on a test bench',
        code: '',
        demo: '',
    }
];

// Template for future entries. `metric` is the one number the project is
// judged by (taken from its description). `image` is optional; when set it
// replaces the metric panel as the project's visual.
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
