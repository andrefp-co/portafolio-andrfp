---
title: System State Integrity Layer
summary: An integrity layer that sits beside the flight controller and decides which sensor measurements deserve to be believed, reporting source health, trust and fault state.
area: Autonomous-system reliability
status: Public architecture, in active development
highlight: Independent of flight control and estimation by design
order: 2
link: https://www.swort.net
---

The System State Integrity Layer (SSIL) is SWORT's public commercial architecture for sensor integrity. It starts from one conviction: an autonomous vehicle should know when its own sensors have stopped telling the truth.

## What it does

SSIL compares each sensor channel against the others and against the state implied by the vehicle's own motion. A channel that disagrees with the rest of the system has its contribution reduced rather than weighted equally, and the disagreement is reported as a **probable source** instead of a single pass or fail flag.

| | |
|---|---|
| **Inputs** | Navigation, inertial, magnetic, power, environmental |
| **Evaluation** | Residual consistency across sensor channels |
| **Outputs** | Source health, trust, fault state |
| **Scope** | Independent of flight control and estimation |

## Where it sits

SSIL does not replace the flight controller, the estimator or the control law. It runs alongside them and tells the rest of the system how much each input can be trusted, which keeps the integrity logic auditable on its own.

## Status

Public commercial architecture, under active development. The interactive demonstration on [swort.net](https://www.swort.net) shows the behaviour: raising sensor noise or environmental disturbance lowers cross-channel consistency, the stability score falls, drift grows, and the mode moves from nominal to degraded to critical.
