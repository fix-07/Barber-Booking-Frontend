import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

/**
 * A barber in a list.
 *
 * NO STOCK PHOTOGRAPHY, and that is on purpose.
 *
 * A stock or AI-generated "barber shop" image would misrepresent a real
 * business, and an image taken from a web search would be someone else's
 * copyright. Either is a genuine problem, not a style preference.
 *
 * What fills that space instead is the barber's own photo if they have
 * supplied one, and otherwise their initials -- real letters from the real
 * shop name, which is honest about the fact that there is no photo yet.
 *
 * ACCESSIBILITY: the button says "View profile and services for <shop name>"
 * rather than "Click here". A screen-reader user can pull up a list of every
 * link on a page, and a page of identical "Click here" links is unusable.
 */

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "—";

const BarberCard = ({ barber }) => (
  // The whole card lifts on hover. This one earns it, unlike most cards on
  // the site, because it genuinely is a single unit that leads to the
  // barber's page -- see the "View profile" button inside.
  <article className="bb-barber-card">
    <div className="bb-barber-card-head">
      {barber.photoUrl ? (
        /* The barber's own photo, at the URL they supplied. This is an
           off-site request to whatever host they chose -- worth knowing
           about given the Cookie Policy's "nothing loads from a third
           party" wording. Flagged rather than shipped silently. */
        <img
          src={barber.photoUrl}
          alt=""
          className="bb-barber-card-photo"
          loading="lazy"
        />
      ) : (
        <div className="bb-barber-card-monogram" aria-hidden="true">
          {initialsOf(barber.shopName)}
        </div>
      )}

      <div className="min-w-0">
        <h3 className="bb-barber-card-name">{barber.shopName}</h3>
        <p className="bb-barber-card-city">
          {barber.city}
          {barber.barberName ? ` · ${barber.barberName}` : ""}
        </p>
      </div>
    </div>

    {barber.bio ? (
      <p className="bb-barber-card-bio">{barber.bio}</p>
    ) : (
      <p className="bb-barber-card-bio">
        This barber has not added a description yet.
      </p>
    )}

    {(barber.specialties || []).length > 0 && (
      <div className="bb-discovery-tags mb-3">
        {barber.specialties.slice(0, 3).map((item) => (
          <span className="bb-discovery-tag" key={item}>
            {item}
          </span>
        ))}
      </div>
    )}

    <div className="bb-barber-card-foot">
      {/* Plain text, not a red badge: "not taking bookings" is information,
          not an error. */}
      {barber.isAcceptingBookings === false ? (
        <span className="v-status v-status-mute">Not booking</span>
      ) : (
        <span className="v-status v-status-ok">Taking bookings</span>
      )}

      <Button
        as={Link}
        to={`/barbers/${barber.barberId}`}
        variant="outline-light"
        size="sm"
      >
        View profile
        <span className="visually-hidden">
          {" "}
          and services for {barber.shopName}
        </span>
      </Button>
    </div>
  </article>
);

export default BarberCard;
