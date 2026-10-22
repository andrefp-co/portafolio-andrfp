"use client";

import { decodeEmail } from "@/utils/obfuscate";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// The address, decoded only in the browser. The server render (and any
// scraper reading the HTML) gets a placeholder instead.
export function useEmail() {
  return useSyncExternalStore(subscribe, decodeEmail, () => null);
}

export default function ProtectedEmail({ className = "", link = false, subject = "" }) {
  const email = useEmail();
  if (!email) return <span className={className}>Email</span>;
  if (!link) return <span className={className}>{email}</span>;
  return (
    <a href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`} className={className}>
      {email}
    </a>
  );
}
