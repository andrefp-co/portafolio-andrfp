// Line icons for the feed, drawn on a 24px grid with a 1.6 stroke so they sit
// with DM Mono. `filled` swaps to a solid shape for active states.
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const IconHeart = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6.2 5 5 0 0 1 21.2 11C19 15.6 12 20 12 20Z" />
  </svg>
);
export const IconBookmark = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M6 3.5h12v17l-6-4-6 4z" />
  </svg>
);
export const IconReply = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5.5h16v10H9l-5 4z" />
  </svg>
);
export const IconShare = (p) => (
  <svg {...base} {...p}>
    <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5v7h14v-7" />
  </svg>
);
export const IconSearch = (p) => (
  <svg {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);
export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);
export const IconPin = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M9 3.5h6l-1 5 3.5 3.5h-11L10 8.5zM12 12v8.5" />
  </svg>
);
export const IconPin2 = (p) => (
  <svg {...base} width={15} height={15} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const IconLink = (p) => (
  <svg {...base} width={15} height={15} {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);
export const IconPlay = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l10.5-6.5z" />
  </svg>
);
export const IconGrid = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  </svg>
);
export const IconDoc = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M6 3.5h8.5L18 7v13.5H6zM14 3.5V7h4M9 12h6M9 15.5h6" />
  </svg>
);
