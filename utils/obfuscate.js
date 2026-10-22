import { PREVIEW } from "./preview";
import { toast } from "./toast";

// Contact details are stored encoded so they never appear as plain text in
// the HTML or the JavaScript bundle, where address harvesters look. They are
// decoded in the browser at the moment they are shown or used.
const EMAIL = "dGVuLnRyb3dzQHBmcmRuYQ=="; // base64 of the address, reversed

export function decodeEmail() {
  try {
    return atob(EMAIL).split("").reverse().join("");
  } catch {
    return "";
  }
}

export function mailtoHref(subject = "", body = "") {
  const q = new URLSearchParams();
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const query = q.toString().replace(/\+/g, "%20");
  return `mailto:${decodeEmail()}${query ? `?${query}` : ""}`;
}

// Opens the visitor's mail app, and always shows the address too: on a
// computer with no mail app set up a mailto link does nothing at all. In the
// preview, where mail links never work, the address is copied instead. Call
// from a click handler only.
export function openMail(subject, body) {
  const address = decodeEmail();
  if (PREVIEW) {
    navigator.clipboard?.writeText(address).catch(() => {});
    toast(`Email ${address} (copied)${subject ? `, subject: ${subject}` : ""}`);
    return;
  }
  window.location.href = mailtoHref(subject, body);
  toast(`Opening your mail app. The address is ${address}`);
}
