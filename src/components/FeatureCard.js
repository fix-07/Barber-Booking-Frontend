import React from "react";

/**
 * One tile in the homepage's "For barbers" section: an icon, a short
 * heading, and a sentence describing something the barber dashboard
 * genuinely does.
 *
 * NO HOVER LIFT, deliberately -- and this is the one design decision here
 * worth keeping. BarberCard lifts because that card IS a link to somewhere.
 * These tiles are not: nothing happens when you click one, so animating
 * them on hover would advertise a click that does nothing. The cursor stays
 * default for the same reason.
 *
 * The tile is a rule and an icon rather than a bordered box, so this row
 * reads differently from the row of barber cards further up the page
 * instead of repeating the same shape twice.
 */
const FeatureCard = ({ icon, title, description }) => (
  <div className="bb-feature">
    {icon && (
      <span className="bb-feature-icon" aria-hidden="true">
        {icon}
      </span>
    )}
    <h3 className="bb-feature-title">{title}</h3>
    <p className="bb-feature-text">{description}</p>
  </div>
);

export default FeatureCard;
