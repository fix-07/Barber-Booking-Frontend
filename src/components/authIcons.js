import React from "react";

/**
 * Small inline icons for the login and register fields.
 *
 * Inline SVG, same approach used everywhere else in this project (the
 * carousel, the appointment picker, the password toggle). No icon package
 * installed for four glyphs.
 *
 * Every one is aria-hidden: the field's <label> already says what the input
 * is for, so a screen reader announcing the icon too would just repeat it.
 */

export const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 6 8.5 7 8.5-7" />
  </svg>
);

export const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path strokeLinecap="round" d="M8 11V7.5a4 4 0 0 1 8 0V11" />
  </svg>
);

export const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <circle cx="12" cy="8" r="3.4" />
    <path strokeLinecap="round" d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
  </svg>
);

export const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={1.9} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6L16 13l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  </svg>
);
