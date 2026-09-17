import React, { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";

import BarberCard from "./BarberCard";

/**
 * The homepage's row of real barbers.
 *
 * REWRITTEN. The original file was lost; this is a fresh implementation of
 * the same two props (`barbers`, `sectionLabel`).
 *
 * ============================================================
 *  WHY A SCROLLING ROW AND NOT A 3D COVERFLOW
 * ============================================================
 * This version is a scroll-snapping row rather than a rotating 3D carousel.
 * That is a deliberate choice, not a shortcut:
 *
 *   - It is real scrolling. On a phone it works with a thumb swipe because
 *     it IS a scroll container, not because a library reimplemented touch.
 *   - The keyboard gets it for free: the track is focusable and the arrow
 *     keys scroll it, on top of the two explicit buttons.
 *   - Nothing is hidden behind an animation. A card that is off-screen is
 *     one scroll away, not three rotations away.
 *
 * Each card is the same <BarberCard> the /barbers listing uses, so a barber
 * looks identical in both places and there is one component to change.
 *
 * ACCESSIBILITY: the track is a real list, labelled by the section heading.
 * The two buttons are disabled at the ends rather than wrapping around --
 * silent wrap-around is disorienting when you cannot see the motion. They
 * are hidden entirely when everything already fits on screen, because a
 * control that does nothing is worse than no control.
 */
const BarberCarousel = ({ barbers = [], sectionLabel = "Browse barbers" }) => {
  const trackRef = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollOn, setCanScrollOn] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 2px of slack: browsers report fractional scroll positions, so an exact
    // comparison can leave the "next" button enabled at the very end.
    setCanScrollBack(track.scrollLeft > 2);
    setCanScrollOn(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, barbers.length]);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector("li");
    // Fall back to most of the visible width if there is no card to measure.
    const step = firstCard ? firstCard.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({
      left: step * direction,
      // The browser honours prefers-reduced-motion for smooth scrolling
      // itself, so this does not need a manual check.
      behavior: "smooth",
    });
  };

  if (barbers.length === 0) return null;

  const showControls = canScrollBack || canScrollOn;

  return (
    <section className="v-section">
      <Container>
        <div className="bb-carousel-head">
          <div>
            <p className="v-eyebrow">{sectionLabel}</p>
            <h2 className="mb-0" id="bb-carousel-heading">
              Barbers on the platform
            </h2>
          </div>

          {showControls && (
            <div className="bb-carousel-controls">
              <button
                type="button"
                className="bb-carousel-btn"
                onClick={() => scrollByCard(-1)}
                disabled={!canScrollBack}
                aria-label="Scroll to previous barbers"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>

              <button
                type="button"
                className="bb-carousel-btn"
                onClick={() => scrollByCard(1)}
                disabled={!canScrollOn}
                aria-label="Scroll to more barbers"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/*
          tabIndex={0} makes the scroll container itself focusable, which is
          what lets a keyboard user scroll it with the arrow keys. Browsers
          do not do this automatically for an overflow container that holds
          no focusable element of its own -- though here each card does have
          a link inside, so this is belt and braces.
        */}
        <ul
          className="bb-carousel-track list-unstyled"
          ref={trackRef}
          tabIndex={0}
          aria-labelledby="bb-carousel-heading"
        >
          {barbers.map((barber) => (
            <li className="bb-carousel-item" key={barber.barberId || barber.id}>
              <BarberCard barber={barber} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
};

export default BarberCarousel;
