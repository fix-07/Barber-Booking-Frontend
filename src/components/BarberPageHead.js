import React from "react";

/**
 * A consistent page head for a dashboard page: a small tracked eyebrow
 * label, the page's own <h1>, and an optional lede sentence -- the same
 * composition the homepage and auth screens already use, so a barber's or
 * customer's own tools read as the same product as the site around them.
 *
 * NOT a second navigation. Header.js already links the barber's three pages
 * (Appointments / My services / Shop profile) with an active-state
 * indicator, so this deliberately does not repeat that as a tab strip.
 */
const BarberPageHead = ({ eyebrow, title, lede }) => (
  <div className="v-page-head">
    {eyebrow && <p className="v-eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    {lede && <p className="v-page-head-lede">{lede}</p>}
  </div>
);

export default BarberPageHead;
