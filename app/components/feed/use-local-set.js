"use client";

import { useCallback, useSyncExternalStore } from "react";

// A Set of ids kept in localStorage (likes, saves, seen stories), read
// through useSyncExternalStore so the server render and the first client
// render agree (both empty) and every component sharing a key stays in sync.
// Falls back to memory when storage is unavailable (private mode, blocked).
const listeners = new Map();
const cache = new Map();
const memory = new Map();
const EMPTY = new Set();

function readRaw(key) {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? "[]";
  } catch {
    return memory.get(key) ?? "[]";
  }
}

function read(key) {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.set;
  let list = [];
  try {
    list = JSON.parse(raw);
  } catch {
    list = [];
  }
  const set = new Set(Array.isArray(list) ? list : []);
  cache.set(key, { raw, set });
  return set;
}

function write(key, set) {
  const raw = JSON.stringify([...set]);
  memory.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Memory copy above keeps the session working.
  }
  listeners.get(key)?.forEach((fn) => fn());
}

export function useLocalSet(key) {
  const subscribe = useCallback(
    (onChange) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(onChange);
      const onStorage = (e) => e.key === key && onChange();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.get(key)?.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );

  const set = useSyncExternalStore(subscribe, () => read(key), () => EMPTY);

  const toggle = useCallback(
    (id, force) => {
      const next = new Set(read(key));
      const on = force ?? !next.has(id);
      if (on) next.add(id);
      else next.delete(id);
      write(key, next);
      return on;
    },
    [key]
  );

  return [set, toggle];
}
