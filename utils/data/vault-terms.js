// PUBLIC. The agreement shown before the access code. The server only issues
// a vault session to a request that echoes TERMS_VERSION with agreed: true,
// and the session records the version it was issued under, so changing the
// version here signs every open session out and makes everyone agree again.
export const TERMS_VERSION = "2026-10-22";

export const terms = {
  title: "Restricted access agreement",
  intro:
    "Read this before you continue. Entering the access code means you accept every clause below.",
  clauses: [
    {
      head: "Confidential material",
      text: "Everything past this screen is proprietary to SWORT LLC (SWORT Aerospace) and Andres Peña: program status, technical results, open gaps, plans and contact details.",
    },
    {
      head: "No disclosure without approval",
      text: "You will not share, forward, publish, quote, screenshot, record or otherwise disclose any of it, in whole or in part, unless Andres Peña approves it in writing first (andrfp@swort.net).",
    },
    {
      head: "Limited purpose",
      text: "You may use it only to evaluate working with SWORT or with Andres Peña.",
    },
    {
      head: "Personal access",
      text: "Your access code was issued to you. Do not pass it on.",
    },
    {
      head: "Your acknowledgment is recorded",
      text: "Your name, your organization, the time and this agreement's version are attached to your session and printed across every page you view.",
    },
    {
      head: "No restricted data",
      text: "Nothing here is classified, Controlled Unclassified Information or export-controlled technical data, and nothing here implies a federal award, past performance, security clearance or certification. Do not send restricted information in reply.",
    },
    {
      head: "Status can change",
      text: "Program status is stated as of the date shown and may change without notice. Where you have a signed NDA with SWORT, that NDA governs.",
    },
  ],
};
