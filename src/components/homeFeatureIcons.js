import React from "react";

/**
 * The four icons used by the "For barbers" section on the homepage.
 *
 * REWRITTEN. The original file was lost; this is a fresh implementation of
 * the same four exports, drawn to match the rest of this project's
 * hand-authored SVG icons (see authIcons.js and formIcons.js): a 24x24
 * viewBox, 1.8 stroke, round caps and joins, and `currentColor` so each
 * icon takes the colour of whatever it sits inside -- which is how the
 * gold-on-black .bb-feature-icon badge in theme.css tints them without any
 * per-icon colour being set here.
 *
 * WHY NOT AN ICON PACKAGE: the same reason given in authIcons.js. Four
 * icons do not justify a dependency, and every byte here is served from
 * your own build rather than someone else's CDN, which keeps the Cookie
 * Policy's "loads nothing from another company" claim true.
 *
 * All four are decorative: each sits beside a real text heading that already
 * says the same thing, so they carry aria-hidden and are skipped by screen
 * readers rather than announced twice.
 */

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

/** Opening hours. */
export const ClockIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 1.9" />
  </svg>
);

/** A service's price. */
export const PriceTagIcon = () => (
  <svg {...base}>
    <path d="M3.5 12.4V4.5a1 1 0 0 1 1-1h7.9a1 1 0 0 1 .7.3l7 7a1 1 0 0 1 0 1.4l-7.9 7.9a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1-.3-.7Z" />
    <circle cx="7.8" cy="7.8" r="1.4" />
  </svg>
);

/** A booking the barber has confirmed. */
export const CalendarCheckIcon = () => (
  <svg {...base}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3.5V6M16 3.5V6" />
    <path d="M9 14.4l2.2 2.2 4-4.2" />
  </svg>
);

/** Whether the shop is visible to customers. */
export const VisibilityIcon = () => (
  <svg {...base}>
    <path d="M2.6 12S6.2 6.2 12 6.2 21.4 12 21.4 12 17.8 17.8 12 17.8 2.6 12 2.6 12Z" />
    <circle cx="12" cy="12" r="3.1" />
  </svg>
);
