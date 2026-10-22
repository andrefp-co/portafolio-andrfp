// Remembers whether the visitor reached the current page by navigating inside
// this site (client-side), so "Exit" can step back to where they were instead
// of dropping them at the top of the home page. The navbar, which is mounted
// on every page, reports each pathname it sees.
let previous = null;
let current = null;

export function notePath(path) {
  if (path === current) return;
  previous = current;
  current = path;
}

// True when the page before this one was also on this site: either an
// in-app navigation, or a full page load whose referrer is this origin.
export function cameFromSite() {
  if (previous !== null) return true;
  try {
    const from = new URL(document.referrer);
    return from.origin === window.location.origin && from.pathname !== window.location.pathname;
  } catch {
    return false;
  }
}
