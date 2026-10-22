"use client";

import { useSyncExternalStore } from "react";

// A 15-second clock tick shared through useSyncExternalStore. The server
// snapshot is null, so the visitor's first paint never shows a stale
// build-time clock and hydration never mismatches.
const TICK_MS = 15000;
const subscribe = (onTick) => {
  const id = setInterval(onTick, TICK_MS);
  return () => clearInterval(id);
};
const getSnapshot = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;
const getServerSnapshot = () => null;

export default function LocalTime({ timeZone, className = "" }) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (now === null) return <span className={className}>&nbsp;</span>;

  const date = new Date(now);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);

  return (
    <time className={`tabular-nums ${className}`} dateTime={date.toISOString()}>
      {time}
    </time>
  );
}
