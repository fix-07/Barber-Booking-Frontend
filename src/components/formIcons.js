import React from "react";

/**
 * Small inline icons for search-style fields. Same approach as
 * components/authIcons.js: inline SVG, no icon package.
 */

export const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path strokeLinecap="round" d="m20 20-4.3-4.3" />
  </svg>
);

export const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={2.1} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" d="M5 5l14 14M19 5 5 19" />
  </svg>
);
