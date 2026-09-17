import React from "react";

/**
 * Small inline icons for the admin shell. Same approach as the rest of the
 * project (authIcons.js, formIcons.js): inline SVG, no icon package.
 */

export const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M6 10a6 6 0 1 1 12 0c0 3.4 1 5.3 1.8 6.3.4.5.1 1.2-.5 1.2H4.7c-.6 0-.9-.7-.5-1.2C5 15.3 6 13.4 6 10Z" />
    <path strokeLinecap="round" d="M10 20a2.2 2.2 0 0 0 4 0" />
  </svg>
);
