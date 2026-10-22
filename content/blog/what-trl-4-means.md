---
title: What TRL 4 means, and what it doesn't
summary: How I assessed the CSIA trust layer's technology readiness, axis by axis, and the one phrase I had to take back.
date: 2026-09-29
tags: [CSIA, Engineering practice, Readiness]
draft: true
---

Technology Readiness Levels are easy to quote and easy to inflate. When I wrote the readiness assessment for the CSIA trust layer, I set one rule: every level has to be justified by a named artifact in the repository, and every gap has to be stated, not smoothed.

## The headline

| Technology line | Level | Why |
|---|---|---|
| Trust and diagnosis core (UAV) | **TRL 4**, entering 5 | Validated in the lab: simulation, 26 real flight logs, live SITL |
| Interceptor-seeker extension | **TRL 2–3** | Synthetic Monte Carlo proof of concept only |

The two lines have different maturity, so they're assessed separately. Averaging them would flatter one and bury the other.

## Readiness is not one number

A single TRL hides where the strength actually is. Broken out by axis, the UAV core looks like this:

- **Software maturity: high.** CI-gated behavioural contracts, C core matching the Python reference to 1e-12, deterministic campaign regeneration.
- **Validation maturity: moderate-high.** Real numbers with intervals, and real holes: slow IMU-bias detection doesn't work yet.
- **Deployment maturity: moderate.** Packaged for desktop and Pi, but installed only on desktop so far.
- **Embedded maturity: low.** No target hardware has run the code. This is the axis holding the level at 4.

## The phrase I took back

Older materials called it "TRL 4 (flight-validated)". That overstated it: **it has not flown.** The accurate wording is *validated in simulation, on real flight-log replay, and in live SITL*. Fixing that sentence mattered more than any new feature, because a reviewer who catches one overclaim stops trusting the rest.

## What closes TRL 5

Three things, none of which touch the validated algorithm:

1. The runtime on the target companion computer, consuming live MAVLink, inside its latency budget, through an overnight soak.
2. A run on an actual airframe, advisory only, with the state log captured.
3. Held-out validation: fix or formally scope out slow IMU-bias detection, then a false-alarm number on logs the system has never seen.

That list is the plan. The level moves when the list is done, not before.
