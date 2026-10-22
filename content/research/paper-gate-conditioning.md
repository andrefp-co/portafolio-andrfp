---
title: Posterior Distortion from Hypothesis-Dependent Validity Gating in Runtime Diagnosis
kind: paper
published: 2026-09-24
tags: [Runtime diagnosis, Probability, CSIA]
authors: Andres Felipe Peña Avila · SWORT LLC
summary: When a runtime monitor uses a validity gate only to pick which evidence to score, it throws away a diagnostic observation. This paper gives an exact account of what is discarded and when it changes the answer.
area: Mathematical paper
status: Preprint v2.2, September 2026
highlight: A 45:1 gate moves nominal posterior mass from 0.860 to 0.257 while reversing one pairwise ranking by only 0.045 nats
order: 2
cover: /media/figures/gate-conditioning-page1.jpg
coverAlt: First page of the paper
pdf: /papers/gate-conditioning-v2.2.pdf
pages: 12
repo: https://github.com/SWORT-Aerospace/csia-trust-layer
---

## Abstract

A runtime validity gate can be treated as a binary diagnostic observation: its predicate is evaluated on observables whose distribution may depend on the fault state, so its outcome induces a hypothesis-dependent likelihood ratio. Monitors that use the gate only to select which evidence channels to score, and then rank hypotheses over the survivors, discard that detector's output. We give an exact account of what is discarded.

Writing *q*<sup>omit</sup> for the distribution such a monitor produces and *p* for the Bayesian posterior given the full observation, the two differ by an exponential tilt in the gate likelihood, and every pairwise log odds shifts by the gate's log-likelihood ratio for that pair. The correction vanishes for all pairs precisely when the gate likelihood is constant across hypotheses, which for a binary gate is conditional independence of gate and hypothesis given context. The identity does not assume the surviving evidence is independent of the gate.

Let *R* be the range of the gate log-likelihood, the maximal pairwise log-likelihood ratio the gate outcome induces. Writing *A<sub>R</sub>* = *R* / (1 − e<sup>−R</sup>), the Kullback-Leibler divergence is bounded by *A<sub>R</sub>* − 1 − log *A<sub>R</sub>* and the total variation by tanh(*R*/4); both are attained, and both are the corresponding cases of a bounded-likelihood-ratio theorem for which we claim nothing. Distortion does not determine decision: the leader survives the omission exactly when the gate's pairwise log-likelihood ratio stays below the pre-gate decision margin, and we exhibit arbitrarily small divergence with a changed decision and arbitrarily large divergence without one. Separately, admitting the gate as a signature coordinate can only refine the declared identifiability partition; the probabilistic and structural analyses are parallel and neither implies the other.

The component results are established and we claim priority for none of them individually. The contribution is a single connected account, organised by the observation that a gate outcome is itself a diagnostic observation, of what a diagnostic monitor gives up by treating it as context. Appendices extend the account to smoothed and tempered scoring, interval certificates under gate-model uncertainty, conditionally dependent gates, and source-attribution error. A worked eight-hypothesis configuration shows a 45:1 gate moving nominal posterior mass from 0.860 to 0.257 while reversing one pairwise ranking by only 0.045 nats.

## The identity in one line

```
p(h) = q_omit(h) · w_h / E_q_omit[w],   w_h = p(Z = z | h, C)
```

Every pairwise log odds moves by `log(w_a / w_b)`, an offset that further evidence of the same kind cannot argue with.

## Contents

1. Introduction and exact problem
2. Closest prior theory
3. Formal setup
4. The exact gate tilt
5. Divergence characterisation
6. Structural consequence
7. When the gate can change the reported diagnosis
8. Reproducible numerical example
9. Scope and limitations
10. Conclusion. Appendices: smoothed and tempered scoring, interval certificates, dependent gates, source-attribution error, a recorded failed sharpening, claim status, reproducibility.

## Status

Preprint v2.2, 12 pages, September 2026. Single author. No empirical data were used: every number is generated from the stated model assumptions by the reproduction script supplied with the paper. It is the mathematical companion to the [self-occlusion systems paper](/research/paper-self-occlusion).
