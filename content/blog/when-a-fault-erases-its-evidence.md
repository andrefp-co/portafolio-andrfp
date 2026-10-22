---
title: When a fault erases its own evidence
summary: Under GNSS denial a diagnostic layer can report healthy for the whole fault, not because it missed the fault but because the fault switched off the evidence that would have named it.
date: 2026-09-22
tags: [Sensor integrity, Runtime diagnosis, GNSS]
cover: /media/figures/c7_glitch_mechanism.png
coverAlt: Charts from the paper: the GPS trust coefficient stays high while the detector sits at its floor
draft: true
---

Here is a failure mode I didn't expect to find in my own system, and the measurement that showed it.

## Skipped is not the same as healthy

The CSIA diagnosis gates its evidence: a feature that isn't applicable on a given tick is skipped rather than down-weighted. That sounds reasonable. The problem is what happens when every feature that could name a fault is skipped at once.

The implementation had no state meaning "not assessable". So when no applicable evidence existed, the output fell through to the only thing left: **nominal**.

## The measurement

Under sustained GNSS denial, the diagnosis reported `nominal` for the entire fault window and never named `gps_fault`, while the GPS trust coefficient read 0.9767. The fault removed the GNSS fix, and with it the evidence the diagnosis would have used to name the GNSS fault.

The vehicle wasn't blind. The failsafe still reached CAUTION through an independent data-freshness check and reconfigured navigation. But the layer whose job is to say *why* couldn't.

## Two corrections I had to make

A controlled-injection campaign against a real autopilot narrowed the claim twice:

1. **It's specific to faults that remove the fix.** A position glitch that leaves the fix valid doesn't close the gate, so the evidence stays available.
2. **But then a different problem shows up.** With the evidence available, the residual detector saturated at its floor for every step error injected, from 5.6 m to 5.6 km. No step size raised an alarm. The same total error applied as a ramp did. Escalation turned out to be limited by duration, not by magnitude.

## The design rule

The general lesson is simple to say: if a fault can switch off every piece of evidence that would name it, "no evidence" needs its own output. Defaulting to healthy turns an absence of information into a claim.

The paper turns the threshold result into a design rule that can be checked, and measures a one-line repair with its full cost. The companion paper shows the underlying condition can be decided statically, from the system's signature table, before it ever runs.

The full measurement, the repair and its cost are in the [self-occlusion paper](/research/paper-self-occlusion). The exact algebra behind it is in its [companion paper](/research/paper-gate-conditioning).
