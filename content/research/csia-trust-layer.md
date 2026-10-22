---
title: CSIA trust layer
summary: Real-time cross-sensor validation that gives every sensor on an autonomous aircraft a continuously updated trust coefficient, and reports anomalies as a probability over causes instead of a pass/fail flag.
area: Sensor integrity
status: Validated in simulation, flight logs and SITL
highlight: Zero false alarms across a full autonomous ArduPilot SITL mission
order: 1
repo: https://github.com/SWORT-Aerospace/csia-trust-layer
---

The Cross-Sensor Intelligence Architecture (CSIA) is a working demonstration built at SWORT. It replaces naive weighted-average sensor fusion with a **Dynamic Trust Graph**: each node is a sensor, each edge encodes a physical relationship between two sensors, and every sensor carries a **Trust Coefficient** that is updated continuously as the aircraft flies.

When something goes wrong, CSIA does not raise a single fault flag. Its output is a probability distribution over likely causes, so an operator sees *which* channel is probably lying, not only that something is.

## How it runs

The deployable path is a 25 Hz causal runtime:

```
SourcePlugin → OnlineTrustLayer → FailsafePolicy → Actuators
(MAVLink | simulator)  (trust + diagnosis)  (state machine)  (log | MAVLink)
```

- **OnlineTrustLayer** ingests one sample at a time and emits eight trust coefficients, evidence sub-scores and the diagnosis posterior every tick.
- **FailsafePolicy** is a deterministic state machine, NORMAL → CAUTION → CRITICAL → EMERGENCY, with dwell times and hysteresis so it never flaps on a single tick.
- **Raw-sensor monitoring.** The GPS node reads the raw receiver stream, not the autopilot's fused estimate. In SITL a 55 m glitch was invisible in the fused output and caught from the raw stream.
- Every failsafe output is **advisory by default**; nothing commands the vehicle unless that is separately enabled.

## Evidence

| Test | Result |
|---|---|
| ArduPilot SITL, full autonomous mission over live MAVLink | Pass: 6 sensors monitored, minimum trust 0.78, zero false alarms, landed |
| SITL fault injection into the real autopilot mid-flight | Pass: GPS glitch and fix loss detected live (GPS trust 0.99 → 0.70) |
| Soak test through the reset path | 277,500 ticks over 3.1 flight-equivalent hours, 0 errors |
| 26 public PX4 flight logs (unannotated) | No alert episode in 24 of 26 logs |
| Native C core, desktop host | 674 ns per tick for trust and diagnosis |

## Status and limits

Deployable companion-computer **advisory** software. It has been validated in simulation, on real flight logs and against a live SITL autopilot. It has **not** been flown in the loop, and it is **not** certified flight-critical software. The C core is sized for an STM32H743 but has not been measured on target, and the flight-log result is not a reliability claim: those logs carry no health annotations.
