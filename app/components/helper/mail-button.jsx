"use client";

import { openMail } from "@/utils/obfuscate";

// A button that opens the visitor's mail app with a subject, without the
// address ever appearing in the page source.
export default function MailButton({ subject, className = "", children }) {
  return (
    <button type="button" onClick={() => openMail(subject)} className={className}>
      {children}
    </button>
  );
}
