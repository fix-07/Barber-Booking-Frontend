import React from "react";

/**
 * Line icons for the hero discovery panel.
 *
 * Hand-drawn SVG rather than an icon package, for two reasons that both
 * still hold: nothing is fetched at runtime (no third-party request, which
 * the Cookie Policy's wording depends on), and there are three of them --
 * a dependency for three shapes is not worth the bundle.
 *
 * Every one is 20x20, 1.5px stroke, and uses `currentColor` so the parent's
 * colour drives it. They are decoration inside an element that already has
 * a text label, so each is aria-hidden and the icon says nothing to a
 * screen reader that the label has not already said.
 */

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export const PinIcon = () => (
  <svg {...base}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const ScissorsIcon = () => (
  <svg {...base}>
    <circle cx="6" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M20 4 8.12 15.88" />
    <path d="M14.47 14.48 20 20" />
    <path d="M8.12 8.12 12 12" />
  </svg>
);

export const ClockIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 1.9" />
  </svg>
);
