---
title: A sensor should earn its vote
summary: Why averaging every sensor equally hides the exact failures an integrity monitor exists to catch, and what a trust coefficient does instead.
date: 2026-10-20
tags: [Sensor integrity, Autonomy, CSIA]
cover: /media/project-uav.jpg
coverAlt: A quadcopter with its flight controller exposed
draft: true
---

Most sensor fusion treats inputs like a committee where every member gets a fixed vote. If the GPS, the IMU and the barometer each carry a weight that never changes, a single channel that starts lying keeps its full say until something downstream breaks.

## The failure you can't see

One result from the [CSIA trust layer](/research/csia-trust-layer) changed how I think about this. In ArduPilot SITL, a 55 m GPS glitch was **invisible in the autopilot's fused output**. The estimator innovation-gates bad data out of its own output stream, which is good for control and bad for monitoring: the evidence an integrity monitor needs is exactly what gets filtered away.

Reading the raw receiver stream instead of the fused estimate is what caught it.

## Trust as a running quantity

CSIA gives every sensor a **trust coefficient** that updates every tick, at 25 Hz. Sensors are nodes in a graph, and the edges encode physical relationships between them: acceleration should agree with the change in velocity, the barometer should agree with altitude from GPS, and so on. A channel that keeps disagreeing with the physics loses trust, and its contribution drops with it.

When something is wrong, the output is not a red light. It is a probability over causes, so the answer reads "probably the GPS" rather than "fault".

## What I am careful not to claim

The runtime has been validated in simulation, on 26 public PX4 flight logs and against a live SITL autopilot. It has not flown in the loop, and it is not certified flight-critical software. Writing that down plainly is part of the work.
