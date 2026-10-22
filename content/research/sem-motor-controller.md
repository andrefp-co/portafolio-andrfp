---
title: Shell Eco-marathon motor controller
summary: A purpose-built, telemetry-informed motor controller for a battery-electric Shell Eco-marathon vehicle, with a four-layer control contract and a CSIA consistency monitor running in shadow mode.
area: Embedded power electronics
status: Host-verified, not yet hardware-frozen
highlight: Portable C11 controller core, verified in host co-simulation
order: 3
repo: https://github.com/SWORT-Aerospace/sem-motor-controller
cover: /media/feed/shell-eco-marathon-320.jpg
coverAlt: The team's car, number 320, on the Shell Eco-marathon stage
---

This project designs a motor controller for a Shell Eco-marathon battery-electric vehicle from the ground up: power-stage planning, the controller firmware core, a CAN contract, a supervisory energy strategy, and a CSIA vehicle consistency monitor running in shadow mode.

## Architecture

- **Control contract in four layers:** hardware shutdown, inhibits, hard ceilings, and supervisory envelopes, with comfort slew on top. Each layer is verified on the host.
- **Firmware core in portable C11.** It is transport-neutral; CAN is one binding. Generated C and Python codecs share golden test vectors.
- **Hardware architecture draft.** A block diagram, a 12-sheet KiCad schematic (connectivity-checked), timing and protection analysis, and a priced bill of materials.
- **Energy strategy.** A longitudinal vehicle model, power maps and a dynamic-programming optimiser for the race strategy.

## Status, stated plainly

| | |
|---|---|
| Control contract | Corrected and host-verified |
| Host implementation | C11 core and codecs tested against a **synthetic** plant |
| Vehicle interface | Not yet confirmed; motor, battery and drivetrain parameters still open |
| Hardware | Draft schematic only; not fabrication-ready, nothing energized |
| Vehicle validation | None yet; every result comes from synthetic models or host tests |

Passing host tests does not mean the controller is complete or safe to install, and the repository says so up front. The next gate is the vehicle team's motor and battery data, which unblocks component selection.
