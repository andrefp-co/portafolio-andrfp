// "2026-10-20" → "Oct 20, 2026", pinned to midday UTC so no timezone can
// move it to the day before.
export const formatDate = (date) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
