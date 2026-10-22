---
title: A monitor that crashes is the worst monitor
summary: Two bugs from the CSIA audit, and why a safety layer's first job is to keep running when the evidence runs out.
date: 2026-10-06
tags: [CSIA, Embedded, Engineering practice]
cover: /media/project-avionics.jpg
coverAlt: Stacked avionics boards inside an open airframe section
draft: true
---

A safety monitor exists for the moment something goes wrong. If that moment is also the moment it fails, it has made the vehicle worse than having no monitor at all: the operator was relying on it.

The engineering audit of the CSIA trust layer found two bugs of exactly that shape. Both are fixed now, and both are worth writing down because neither looked dangerous in the code.

## The divide that only happens when nothing is known

The first was a divide-by-zero on a reachable input. When the runtime had **no evidence at all** for a quantity (field mode, with the seeker extension enabled), a normalisation step divided by a total that was zero, and the runtime crashed.

The fix is boring on purpose: when there is no evidence, the previous value is held and the condition is reported, instead of computed.

```python
# A sketch of the pattern, not the production code.
def normalise(weights, previous):
    total = sum(weights)
    if total <= 0.0:
        return previous, "held: no evidence"
    return [w / total for w in weights], "ok"
```

The interesting part isn't the guard. It's that "no evidence" is the normal state of a monitor at the edges of its envelope, so it has to be a first-class state, tested like any other. It's now pinned as a requirement with its own regression test.

## The reboot that made the monitor deaf

The second bug was quieter. After a flight-controller reboot, the monitor dropped every piece of telemetry that followed, permanently. It didn't crash. It just stopped listening.

The fix re-anchors the monitor's time epoch when the flight controller reboots, and a requirement now pins that behaviour. The lesson is the same as the first: the failure lived in a path that only runs when something has already gone wrong.

## What I check for now

- What does the monitor output when it has no evidence? Is that state named, or does it fall through to a default?
- What happens across a reboot of every component it listens to?
- Is there a test for each of those, or only for the happy path?

A monitor is judged on its worst day. Most of the work is making sure it's still there for it.
