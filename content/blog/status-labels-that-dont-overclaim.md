---
title: Status labels that don't overclaim
summary: "Tests pass" and "it works" are different statements. Notes on writing project status so a reviewer can trust it.
date: 2026-10-14
tags: [Engineering practice, Embedded]
cover: /media/project-toolkit.jpg
coverAlt: An oscilloscope trace above two development boards on a bench
draft: true
---

Every repository I keep now opens with a status table, and every row says exactly how far the evidence goes. The [Shell Eco-marathon motor controller](/research/sem-motor-controller) is a good example:

| | |
|---|---|
| Host implementation | Verified against a **synthetic** plant |
| Hardware | Draft schematic; nothing energized |
| Vehicle validation | None yet |

## Why bother

A passing test suite tells you the code does what the tests ask. It says nothing about whether the tests ask the right questions, or whether the plant model matches the real motor. Collapsing those into "done" is how a controller ends up installed before anyone has read the motor's datasheet.

## The rules I follow

- **Name the evidence, not the feeling.** "Validated in SITL" beats "works".
- **Say what was not tested.** An empty row is information.
- **Separate regression contracts from detection evidence.** A threshold set below last week's performance proves nothing new when it passes.
- **Report the uncertainty.** Two alert episodes in half an hour of flight logs is a 95% confidence interval wide enough to drive a truck through, and it should be printed next to the number.

None of this slows the work down. It makes the next review shorter.
