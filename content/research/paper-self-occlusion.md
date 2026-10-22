---
title: Measured Self-Occlusion in a Deployed Cross-Sensor Diagnostic Layer
subtitle: When a fault destroys the evidence that would name it
kind: paper
published: 2026-10-18
tags: [Sensor integrity, Runtime diagnosis, GNSS, CSIA]
authors: Andres Felipe Peña Avila · SWORT LLC
summary: Measurements of false-healthy exposure on a deployed diagnostic layer for small uncrewed aircraft, the time it spends asserting health while holding no evidence it is entitled to assert it from.
area: Systems paper
status: Submission package, October 2026
highlight: Under sustained GNSS denial the diagnosis reports nominal for the entire fault window and never names the GPS fault
order: 1
cover: /media/figures/c4_self_occlusion.png
coverAlt: Bar charts from the paper showing the diagnosis reporting nominal while the GPS fault is present
pages: 32
pinned: true
repo: https://github.com/SWORT-Aerospace/csia-trust-layer
---

## Abstract

We report measurements of *false-healthy exposure* on a deployed cross-sensor diagnostic layer for small uncrewed aircraft: the time the system spends asserting health while holding no evidence it is entitled to assert it from. The layer maintains per-sensor trust coefficients over a physics-derived graph and runs a gated naive-Bayes diagnosis over eight mutually exclusive causes. A gated feature is skipped rather than down-weighted, and the implementation has no state meaning "not assessable", so absence of applicable evidence is emitted as health. Under sustained GNSS denial the diagnosis reports `nominal` for the entire fault window and never names `gps_fault`, while the GPS trust coefficient reads 0.9767. The vehicle is not blind: the failsafe reaches CAUTION through an independent data-freshness disjunct and reconfigures navigation. It cannot name the cause.

**Two scope corrections, both forced by our own controlled-injection campaign against a real autopilot, are reported here rather than buried.** First, this behaviour is specific to faults that remove the GNSS fix. A position glitch that leaves the fix valid does not close the gate at all, so the evidence remains available. Second, in that case the layer sees the fault and still does not escalate: its residual detector saturates at the floor for every injected position error we tested, from 5.6 m to 5.6 km, and no step magnitude produces an alarm. The same total error applied as a ramp does. Escalation here is duration-limited, not magnitude-limited.

We make no observability claim. Receiver observables detect GNSS denial well; the failure we measure is one of evidence routing and applicability semantics, not of detectability. We report a threshold result that yields a checkable design rule, a chatter-resonance prediction tested against the deployed code and holding, a one-line repair with its full measured cost, and a counterfactual abstaining policy measured against current behaviour on the same flights. We claim engineering contribution and measurement only.

## What the paper covers

1. The system under measurement: trust coefficients over a physics-derived graph, and a gated diagnosis over eight causes.
2. The self-occlusion measurement, and what is and is not established about containment.
3. How often the gate actually closes, measured against a real autopilot.
4. Why a position glitch raises no alarm, with a tested cause.
5. False-healthy exposure, and what abstaining instead would cost.
6. Chatter resonance: a prediction, tested against the deployed code.
7. A design rule that can be checked, a one-line repair and its measured cost.
8. Limitations and a claim table, so every statement carries its evidence.

## How the evidence was checked

The October 2026 submission package is a 32-page manuscript with a 13-page supplement. The record that accompanies it states:

- **120 controlled-injection trials** across three campaigns against a software-in-the-loop autopilot. The committed adjudicator reproduces **120 of 120** recorded verdicts, so the verdicts do not depend on the test harness as it stood when the trials ran.
- **Frozen-core identity** rests on two independent checks: the per-trial empty diff against the tag, and a later comparison showing the frozen files byte-identical at all fifteen relevant recorded commits, with all twelve baseline digests matching.
- **An independent verifier** re-derives the paper's numbers from the exported evidence: 154 checks, 0 failed.
- **One timing defect is disclosed, not hidden.** In one current-stack GNSS-glitch campaign the fault was written about 2.2 s after the commanded onset. The paper scopes it to that campaign and shows which results it does not affect, because the analysis used the recorded write time throughout.
- **Corrections are counted once.** The correction register carries fourteen entries, six in the main table and eight in the supplement, and no total is constructed across registers.

## Status

Submission package prepared in October 2026; not yet peer reviewed, and the title may still change. It is the systems companion to the [gate-conditioning paper](/research/paper-gate-conditioning), which gives the exact algebra behind the effect measured here.

Drafts are shared on request through the [contact form](/#contact).
