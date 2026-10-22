---
title: Posterior Distortion from Hypothesis-Dependent Validity Gating in Runtime Diagnosis
kind: paper
tags: [Runtime diagnosis, Probability, CSIA]
authors: Andres Peña · SWORT Aerospace
summary: The exact algebra of what happens to a diagnostic posterior when a runtime layer decides, tick by tick, which of its evidence is applicable, and a condition that can be checked before the system ever runs.
area: Mathematical paper
status: Working paper, in preparation
highlight: An independent checker agrees on 378,000 of 378,000 comparisons and finds one hypothesis pair pinned to its prior for 200 ticks
order: 2
repo: https://github.com/SWORT-Aerospace/csia-trust-layer
---

## Abstract

A runtime diagnostic layer decides, tick by tick, which of its evidence is *applicable*. That decision is a coarsening mechanism the system designed for itself, and whether it may be ignored is a property of the software rather than of the data. We give the exact algebra. Writing *q* for the posterior the system would have obtained from *all* the evidence it could in principle have scored and *p* for the posterior it actually produces,

```
p_h = q_h · w_h / E_q[w]
```

so every pairwise log-posterior ratio acquires an additive, evidence-independent offset `log(w_a / w_b)` that further data of the same kind cannot argue with. For the additive gated scores runtime layers compute, *w_h* is exhibited in closed form and the offset is exactly the withheld distinguishing contribution. When no active term distinguishes two hypotheses their ratio is pinned to the prior ratio exactly, for as long as the gate stays shut, however concentrated the posterior becomes: a statement about the produced posterior alone, which does not depend on the choice of baseline.

We give the condition under which the distortion vanishes, its multivalued caveat, a sufficient condition for the MAP to be unchanged, and exact divergence identities: `KL(q ‖ p)` is precisely the Jensen gap of `log w` under *q*, so the distortion is zero exactly when the validity factors do not vary across hypotheses.

**We claim no new mathematics.** Each result is an instance of something known (self-normalised reweighting, argmax stability under bounded perturbation, Jensen's inequality) and the setting is the coarse-data one, so the paper concedes rather than claims at every step. What we offer is the runtime-diagnostic formulation, the observation that the condition is decidable *statically, from a signature table, before the system runs*, and a deployed layer that fails it: an independently written checker that imports none of the production analysis agrees with it on 378,000 of 378,000 tick-by-pair comparisons and finds one hypothesis pair pinned to its prior for 200 consecutive ticks.

## The three identities

| | |
|---|---|
| **Reweighting** | `p_h = q_h · w_h / E_q[w]` |
| **Pairwise offset** | `log(p_a / p_b) = log(q_a / q_b) + log(w_a / w_b)` |
| **Divergence** | `KL(q ‖ p)` = the Jensen gap of `log w` under *q* |

## Contents

1. The problem, and the setting.
2. The reweighting identity.
3. Pinning, and the condition that causes it.
4. Ignorability, and a caveat that is easy to get wrong.
5. Concentration is not discriminating support.
6. MAP robustness.
7. Exact divergences, and bounds.
8. Verification, and an implemented instance.
9. What is new, stated plainly; related work; limitations.

## Status

In preparation. Not yet submitted or peer reviewed. It is the mathematical companion to the [self-occlusion systems paper](/research/paper-self-occlusion).

Drafts are shared on request: [andrfp@swort.net](mailto:andrfp@swort.net).
