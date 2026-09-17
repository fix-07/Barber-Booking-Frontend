import React from "react";

import { formatTimeOnly } from "../../utils/format";

// "Confirmed" is the expected default for a scheduled slot, so it gets no
// extra label -- only exceptions call for one. This is the same
// never-colour-alone rule StatusBadge follows, applied to a card too small
// for a full badge: a short text word standing in for one.
const CARD_STATUS_LABEL = {
  pending: "Unconfirmed",
  no_show: "No-show",
  cancelled_by_customer: "Cancelled",
  cancelled_by_barber: "Cancelled",
  cancelled_by_admin: "Cancelled",
};

const GRID_START_HOUR = 7;
const GRID_END_HOUR = 21;
const PX_PER_HOUR = 56;

/**
 * Assigns each booking a lane so two overlapping bookings in the same
 * column render side by side instead of fully on top of each other.
 *
 * This is a real case, not just a defensive edge case: a slot that was
 * booked, then cancelled (which frees it -- see holdsSlot on the Booking
 * model), can be booked again by someone else at that exact original time.
 * Without lane assignment the second booking would render invisibly
 * underneath the first, unreachable to click.
 *
 * Not a full interval-graph colouring -- a booking's lane count is the
 * number of other bookings it directly overlaps, which can occasionally
 * make widths inside a 3+-way cluster slightly uneven. Correct enough for
 * what is normally at most two things sharing a moment (a stale cancelled
 * slot and its replacement), not worth a heavier algorithm for a rare case.
 */
const layoutWithLanes = (bookings) => {
  const withTimes = bookings
    .map((booking) => {
      const start = new Date(booking.startAt).getTime();
      return { booking, start, end: start + booking.durationMinutes * 60000 };
    })
    .sort((a, b) => a.start - b.start);

  const laneEndTimes = [];
  const placed = withTimes.map((item) => {
    let lane = laneEndTimes.findIndex((endTime) => endTime <= item.start);
    if (lane === -1) {
      lane = laneEndTimes.length;
      laneEndTimes.push(item.end);
    } else {
      laneEndTimes[lane] = item.end;
    }
    return { ...item, lane };
  });

  return placed.map((item) => {
    const overlapping = placed.filter((other) => other.start < item.end && other.end > item.start);
    const totalLanes = Math.max(...overlapping.map((o) => o.lane)) + 1;
    return { booking: item.booking, lane: item.lane, totalLanes };
  });
};

/**
 * A time grid, columns x hours, with booking cards positioned by actual
 * clock time. Used both for the Calendar's Day view (one column per
 * barber) and Week view (one column per day, all barbers pooled into it,
 * distinguished by the small barber label on each card) -- see
 * AdminCalendarPage.js for how each view builds `columns` and
 * `bookingsByColumn` differently from the same booking list.
 *
 * Fixed 07:00-21:00 range rather than a dynamic per-barber range: simple,
 * predictable, and covers every working-hours example seeded in this
 * project. A booking outside that window still renders, just clipped at
 * the grid edge -- rare enough (a very early/late appointment) not to be
 * worth a dynamic range's complexity.
 */
const DayTimeGrid = ({ columns, bookingsByColumn, onSelectBooking, compact = false }) => {
  const hourLabels = [];
  for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h += 1) hourLabels.push(h);
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR) * PX_PER_HOUR;

  const positionFor = (booking) => {
    const start = new Date(booking.startAt);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const top = ((startMinutes - GRID_START_HOUR * 60) / 60) * PX_PER_HOUR;
    const height = Math.max(22, (booking.durationMinutes / 60) * PX_PER_HOUR - 2);
    return { top: Math.max(0, top), height };
  };

  return (
    <div className="bb-cal-grid">
      <div className="bb-cal-hour-rail">
        <div className="bb-cal-column-header" aria-hidden="true">&nbsp;</div>
        <div className="bb-cal-hour-labels" style={{ height: gridHeight }}>
          {hourLabels.map((h) => (
            <span key={h} className="bb-cal-hour-label" style={{ top: (h - GRID_START_HOUR) * PX_PER_HOUR }}>
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>
      </div>

      <div className="bb-cal-columns">
        {columns.map((col) => (
          <div key={col.key} className={compact ? "bb-cal-column is-compact" : "bb-cal-column"}>
            <div className="bb-cal-column-header">{col.label}</div>
            <div className="bb-cal-column-body" style={{ height: gridHeight }}>
              {hourLabels.map((h) => (
                <div
                  key={h}
                  className="bb-cal-hour-line"
                  style={{ top: (h - GRID_START_HOUR) * PX_PER_HOUR }}
                />
              ))}

              {layoutWithLanes(bookingsByColumn[col.key] || []).map(({ booking, lane, totalLanes }) => {
                const { top, height } = positionFor(booking);
                const widthPercent = 100 / totalLanes;
                return (
                  <button
                    key={booking.id}
                    type="button"
                    className={`bb-cal-card is-${booking.status}`}
                    style={{
                      top,
                      height,
                      left: `calc(${lane * widthPercent}% + 2px)`,
                      width: `calc(${widthPercent}% - 4px)`,
                    }}
                    onClick={() => onSelectBooking(booking)}
                  >
                    <span className="bb-cal-card-time">
                      {formatTimeOnly(booking.startAt)}
                      {CARD_STATUS_LABEL[booking.status] && ` · ${CARD_STATUS_LABEL[booking.status]}`}
                    </span>
                    <span className="bb-cal-card-client">{booking.customerName || "Walk-in"}</span>
                    {!compact && <span className="bb-cal-card-service">{booking.serviceName}</span>}
                    {compact && <span className="bb-cal-card-service">{booking.barberName}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayTimeGrid;
