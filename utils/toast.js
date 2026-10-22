// A one-line notice at the bottom of the screen (helper/toaster.jsx shows it).
export function toast(message) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("sw-toast", { detail: String(message) }));
}
