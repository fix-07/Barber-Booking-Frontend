import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

import api from "../../api/axios";
import {
  formatMoney,
  formatDuration,
  formatTimeOnly,
  todayAsDateInput,
  dateInputPlusDays,
} from "../../utils/format";
import { PinIcon, ScissorsIcon, ClockIcon } from "./discoveryIcons";

/**
 * The right half of the hero: a composed panel showing one real barber, one
 * of their real services, and their next genuinely free appointment.
 *
 * ==========================================================================
 *  EVERY VALUE HERE IS FETCHED. NOTHING IS INVENTED.
 * ==========================================================================
 *
 * The obvious way to build a hero panel like this is to hard-code a
 * good-looking example -- "Marco's Barbershop, 4.9 stars, next slot 2:30pm".
 * That is a fake business, a fake rating and a fake appointment on the front
 * page of a real booking site, and in most countries inventing a rating is a
 * consumer-protection problem, not just a taste one.
 *
 * So this panel reads the real database instead, and every piece renders
 * only if the data behind it exists:
 *
 *   shop, barber, city, specialities  the `barber` prop, already loaded by
 *                                     the page's own barber-list request
 *   service + price + duration        GET /barbers/:id  (real services)
 *   next free appointment             GET /bookings/availability, the same
 *                                     public endpoint the booking picker
 *                                     uses -- so this time is genuinely
 *                                     bookable, not decoration
 *
 * If there are no barbers, the page does not render this at all (see
 * HomePage.js). If a barber has no services, the service and slot rows are
 * omitted and the rest still stands. Missing data shrinks the panel; it
 * never gets filled in.
 *
 * NO RATING IS SHOWN, deliberately. The Review model exists, but no public
 * endpoint exposes an aggregate score, so there is no honest number to
 * print here yet. Showing one anyway would mean making it up.
 */

/** Initials from the shop name, as a stand-in for a photo the barber has
 *  not uploaded. Real letters from a real name, rather than a stock
 *  portrait of someone who does not work there. */
const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "—";

/**
 * The first free slot for this service, looking at today and then the next
 * few days. Stops at the first day that has one.
 *
 * The search is capped at DAYS_TO_SEARCH: a barber who is fully booked or
 * on holiday would otherwise have this walking forward through the calendar
 * one request at a time.
 */
const DAYS_TO_SEARCH = 5;

const findNextSlot = async (barberId, serviceId, signal) => {
  for (let offset = 0; offset < DAYS_TO_SEARCH; offset += 1) {
    const date = offset === 0 ? todayAsDateInput() : dateInputPlusDays(offset);

    const { data } = await api.get("/bookings/availability", {
      params: { barberId, serviceId, date },
      signal,
    });

    const free = (data.slots || []).find((slot) => slot.available);
    if (free) return { slot: free, timeZone: data.timeZone };
  }

  return null;
};

const HeroDiscoveryPanel = ({ barber }) => {
  const [service, setService] = useState(null);
  const [next, setNext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Guards against setting state after the component is gone -- and against
  // a slow response from a previous barber overwriting a newer one.
  const abortRef = useRef(null);

  useEffect(() => {
    if (!barber?.barberId) return undefined;

    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setService(null);
      setNext(null);

      try {
        const { data } = await api.get(`/barbers/${barber.barberId}`, {
          signal: controller.signal,
        });

        // The cheapest active service: the most representative thing to
        // show, and the least likely to look like an upsell.
        const cheapest = (data.services || [])
          .filter((item) => item.isActive !== false)
          .sort((a, b) => a.priceMinor - b.priceMinor)[0];

        if (cancelled) return;
        if (!cheapest) {
          setIsLoading(false);
          return;
        }

        setService(cheapest);

        const found = await findNextSlot(
          barber.barberId,
          cheapest.id,
          controller.signal
        );

        if (!cancelled) setNext(found);
      } catch (error) {
        // A failure here is not worth an error message on the front page:
        // the panel simply shows less. The barber's own page is still one
        // click away, and it reports its own errors properly.
        if (!cancelled) {
          setService((current) => current);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [barber?.barberId]);

  if (!barber) return null;

  const specialities = (barber.specialties || []).slice(0, 3);

  return (
    <div className="bb-discovery">
      <div className="bb-discovery-head">
        <span className="bb-discovery-head-label">On the platform</span>
        {barber.isAcceptingBookings === false ? (
          <span className="v-status v-status-mute">Not booking</span>
        ) : (
          <span className="v-status v-status-ok">Taking bookings</span>
        )}
      </div>

      {/*
        The rows, and the hairline rail that ties them into one object.

        The rail lives INSIDE this wrapper rather than in the panel, so it
        is bounded by the rows themselves. Positioned against the panel it
        ran the full height and struck through the button at the bottom.
      */}
      <div className="bb-discovery-rows">
        <div className="bb-discovery-rail" aria-hidden="true" />

      {/* ---- who ---- */}
      <div className="bb-discovery-row">
        {barber.photoUrl ? (
          /*
            The barber's own photo, at the URL they supplied. Note this is
            an off-site image: it is a request to whatever host the barber
            chose, which is worth knowing about given the Cookie Policy's
            "nothing loads from a third party" wording. Flagged rather than
            silently shipped.
          */
          <img
            src={barber.photoUrl}
            alt=""
            className="bb-discovery-photo"
            loading="lazy"
          />
        ) : (
          <div
            className="bb-discovery-marker bb-discovery-monogram"
            aria-hidden="true"
          >
            {initialsOf(barber.shopName)}
          </div>
        )}

        <div className="bb-discovery-body">
          <p className="bb-discovery-shop">{barber.shopName}</p>
          {barber.barberName && (
            <p className="bb-discovery-meta">{barber.barberName}</p>
          )}

          {specialities.length > 0 && (
            <div className="bb-discovery-tags">
              {specialities.map((item) => (
                <span className="bb-discovery-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- where ---- */}
      {(barber.city || barber.addressLine) && (
        <div className="bb-discovery-row">
          <div className="bb-discovery-marker" aria-hidden="true">
            <PinIcon />
          </div>
          <div className="bb-discovery-body">
            <p className="bb-discovery-label">Location</p>
            <p className="bb-discovery-value">{barber.city}</p>
            {barber.addressLine && (
              <p className="bb-discovery-meta">{barber.addressLine}</p>
            )}
          </div>
        </div>
      )}

      {/* ---- what ---- */}
      {service && (
        <div className="bb-discovery-row">
          <div className="bb-discovery-marker" aria-hidden="true">
            <ScissorsIcon />
          </div>
          <div className="bb-discovery-body">
            <p className="bb-discovery-label">Service from</p>
            <p className="bb-discovery-value">{service.name}</p>
            <p className="bb-discovery-meta">
              <span className="bb-price">
                {formatMoney(service.priceMinor, service.currency)}
              </span>
              {" · "}
              {formatDuration(service.durationMinutes)}
            </p>
          </div>
        </div>
      )}

      {/* ---- when ----
          The accent moment. A real, bookable time from the same endpoint the
          booking picker calls, so it cannot drift out of sync with what is
          actually free. */}
      {next && (
        <div className="bb-discovery-row bb-discovery-row-slot">
          <div className="bb-discovery-marker" aria-hidden="true">
            <ClockIcon />
          </div>
          <div className="bb-discovery-body">
            <p className="bb-discovery-label">Next available</p>
            <p className="bb-discovery-slot-time">
              {formatTimeOnly(next.slot.startAt, next.timeZone)}
            </p>
          </div>
        </div>
      )}

      {/* While the two follow-up requests are in flight, hold the space the
          rows will take so the hero does not jump when they land. */}
      {isLoading && !service && (
        <div className="bb-discovery-row" aria-hidden="true">
          <div className="bb-discovery-marker" />
          <div className="bb-discovery-body w-100 d-flex flex-column gap-2 pt-2">
            <div className="bb-discovery-skeleton-line" style={{ width: "40%" }} />
            <div className="bb-discovery-skeleton-line" style={{ width: "65%" }} />
          </div>
        </div>
      )}
      </div>

      <div className="bb-discovery-foot">
        <Button as={Link} to={`/barbers/${barber.barberId}`} variant="primary">
          View {barber.shopName}
        </Button>
      </div>
    </div>
  );
};

export default HeroDiscoveryPanel;
