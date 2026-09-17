import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Button, ButtonGroup, Spinner } from "react-bootstrap";

import { fetchAdminBookings, fetchBarbersForPicker } from "../../actions/adminActions";
import DayTimeGrid from "../../components/admin/DayTimeGrid";
import BookingDetailModal from "../../components/admin/BookingDetailModal";
import { dateToInputValue, formatTimeOnly } from "../../utils/format";

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  return start;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The admin calendar: Day / Week / Month, filterable by barber.
 *
 * SCOPE NOTE ON DRAG-AND-DROP: rescheduling here is click-a-card -> pick a
 * new time in the detail modal, not drag-and-drop on the grid. A real drag
 * implementation needs precise pointer-to-minute snapping and its own
 * conflict-preview UI to be worth having; a rough version would be worse
 * than this reliable click flow, which reuses the exact same
 * rescheduleAdminBooking action and server-side validation as the Bookings
 * table. Worth a dedicated follow-up if you want true drag-and-drop.
 */
const AdminCalendarPage = () => {
  const dispatch = useDispatch();
  const { bookings, isLoadingBookings, barberOptions } = useSelector((state) => state.admin);

  const [view, setView] = useState("week"); // "day" | "week" | "month"
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [barberId, setBarberId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    dispatch(fetchBarbersForPicker());
  }, [dispatch]);

  const { rangeFrom, rangeTo } = useMemo(() => {
    if (view === "day") {
      return { rangeFrom: anchorDate, rangeTo: addDays(anchorDate, 1) };
    }
    if (view === "week") {
      const start = startOfWeek(anchorDate);
      return { rangeFrom: start, rangeTo: addDays(start, 7) };
    }
    // Month: fetch the calendar month's own boundaries. Grid cells for the
    // leading/trailing days of neighbouring months are shown for alignment
    // but always render empty, since only this range is fetched.
    const start = startOfMonth(anchorDate);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return { rangeFrom: start, rangeTo: end };
  }, [view, anchorDate]);

  useEffect(() => {
    const params = {
      from: dateToInputValue(rangeFrom),
      to: dateToInputValue(rangeTo),
      limit: 500,
    };
    if (barberId) params.barberId = barberId;
    dispatch(fetchAdminBookings(params));
  }, [dispatch, rangeFrom, rangeTo, barberId]);

  const goToday = () => setAnchorDate(new Date());
  const goPrev = () => {
    if (view === "day") setAnchorDate((d) => addDays(d, -1));
    else if (view === "week") setAnchorDate((d) => addDays(d, -7));
    else setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (view === "day") setAnchorDate((d) => addDays(d, 1));
    else if (view === "week") setAnchorDate((d) => addDays(d, 7));
    else setAnchorDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const barberColumns = useMemo(
    () =>
      barberId
        ? barberOptions.filter((b) => b.barberId === barberId).map((b) => ({ key: b.barberId, label: b.shopName }))
        : barberOptions.map((b) => ({ key: b.barberId, label: b.shopName })),
    [barberOptions, barberId]
  );

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      return anchorDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const start = startOfWeek(anchorDate);
      const end = addDays(start, 6);
      return `${start.toLocaleDateString(undefined, { day: "numeric", month: "short" })} - ${end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return anchorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [view, anchorDate]);

  return (
    <div className="d-flex flex-column gap-3">
      <Card>
        <Card.Body className="d-flex flex-wrap align-items-center gap-3 justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-dark" size="sm" onClick={goPrev} aria-label="Previous">&larr;</Button>
            <Button variant="outline-dark" size="sm" onClick={goToday}>Today</Button>
            <Button variant="outline-dark" size="sm" onClick={goNext} aria-label="Next">&rarr;</Button>
            <strong className="ms-2">{rangeLabel}</strong>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-3">
            <Form.Select size="sm" style={{ width: 200 }} value={barberId} onChange={(e) => setBarberId(e.target.value)}>
              <option value="">All barbers</option>
              {barberOptions.map((b) => (
                <option key={b.barberId} value={b.barberId}>{b.shopName}</option>
              ))}
            </Form.Select>

            <ButtonGroup>
              {["day", "week", "month"].map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "primary" : "outline-dark"}
                  size="sm"
                  onClick={() => setView(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </Card.Body>
      </Card>

      {isLoadingBookings && (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading the calendar.</span>
        </div>
      )}

      {!isLoadingBookings && view === "day" && (
        <DayView bookings={bookings} columns={barberColumns} onSelectBooking={setSelectedBooking} />
      )}

      {!isLoadingBookings && view === "week" && (
        <WeekView
          weekStart={startOfWeek(anchorDate)}
          bookings={bookings}
          onSelectBooking={setSelectedBooking}
        />
      )}

      {!isLoadingBookings && view === "month" && (
        <MonthView
          monthAnchor={anchorDate}
          bookings={bookings}
          onSelectBooking={setSelectedBooking}
        />
      )}

      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  );
};

/** One barber per column, today's (well, anchorDate's) bookings only. */
const DayView = ({ bookings, columns, onSelectBooking }) => {
  const bookingsByColumn = useMemo(() => {
    const map = {};
    for (const booking of bookings) {
      if (!map[booking.barberId]) map[booking.barberId] = [];
      map[booking.barberId].push(booking);
    }
    return map;
  }, [bookings]);

  if (columns.length === 0) {
    return <p className="text-muted">No barbers to show.</p>;
  }

  return <DayTimeGrid columns={columns} bookingsByColumn={bookingsByColumn} onSelectBooking={onSelectBooking} />;
};

/** One day per column (all barbers pooled), a compact variant of the same grid. */
const WeekView = ({ weekStart, bookings, onSelectBooking }) => {
  const columns = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const day = addDays(weekStart, i);
        return { key: dateToInputValue(day), label: `${WEEKDAY_HEADERS[i]} ${day.getDate()}` };
      }),
    [weekStart]
  );

  const bookingsByColumn = useMemo(() => {
    const map = {};
    for (const booking of bookings) {
      // Grouped by the VIEWER'S local calendar date, to match the grid
      // cells (also keyed by local date via dateToInputValue) -- grouping
      // by the raw UTC date substring instead would misplace any booking
      // whose UTC date differs from its local one (anyone not at UTC+0).
      const key = dateToInputValue(new Date(booking.startAt));
      if (!map[key]) map[key] = [];
      map[key].push(booking);
    }
    return map;
  }, [bookings]);

  return (
    <DayTimeGrid columns={columns} bookingsByColumn={bookingsByColumn} onSelectBooking={onSelectBooking} compact />
  );
};

/** A traditional 6-week month grid with compact chips per day. */
const MonthView = ({ monthAnchor, bookings, onSelectBooking }) => {
  const bookingsByDate = useMemo(() => {
    const map = {};
    for (const booking of bookings) {
      // Local calendar date -- see the same note in WeekView above.
      const key = dateToInputValue(new Date(booking.startAt));
      if (!map[key]) map[key] = [];
      map[key].push(booking);
    }
    for (const list of Object.values(map)) {
      list.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    }
    return map;
  }, [bookings]);

  const gridStart = startOfWeek(startOfMonth(monthAnchor));
  const todayKey = dateToInputValue(new Date());
  const currentMonth = monthAnchor.getMonth();

  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="bb-cal-month-grid">
      {WEEKDAY_HEADERS.map((label) => (
        <div key={label} className="bb-cal-month-weekday">{label}</div>
      ))}

      {days.map((day) => {
        const key = dateToInputValue(day);
        const dayBookings = bookingsByDate[key] || [];
        const visible = dayBookings.slice(0, 3);
        const extra = dayBookings.length - visible.length;
        const isMuted = (b) =>
          ["cancelled_by_customer", "cancelled_by_barber", "cancelled_by_admin", "no_show"].includes(b.status);

        return (
          <div
            key={key}
            className={
              "bb-cal-month-day" +
              (day.getMonth() !== currentMonth ? " is-outside" : "") +
              (key === todayKey ? " is-today" : "")
            }
          >
            <span className="bb-cal-month-day-number">{day.getDate()}</span>
            {visible.map((booking) => (
              <button
                key={booking.id}
                type="button"
                className={"bb-cal-month-chip" + (isMuted(booking) ? " is-muted" : "")}
                onClick={() => onSelectBooking(booking)}
              >
                {formatTimeOnly(booking.startAt)} {booking.customerName || "Walk-in"}
              </button>
            ))}
            {extra > 0 && <span className="bb-cal-month-more">+{extra} more</span>}
          </div>
        );
      })}
    </div>
  );
};

export default AdminCalendarPage;
