import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Table, Button, Spinner } from "react-bootstrap";

import {
  fetchAppointments,
  updateBookingStatus,
  clearBookingFeedback,
} from "../actions/bookingActions";

import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import BarberPageHead from "../components/BarberPageHead";
import { formatMoney, formatDateTime, formatDuration } from "../utils/format";

/**
 * A barber's appointment list.
 *
 * The buttons on each row follow the SAME rules the server enforces: a pending
 * booking can be confirmed or declined; a confirmed one can be completed or
 * marked as a no-show; anything finished shows no buttons.
 *
 * Worth understanding: hiding a button here prevents nothing. The server
 * refuses a disallowed status change whatever the browser sends. These buttons
 * are matched to the rules so the barber is not offered an action that would
 * only fail.
 *
 * ABOUT THE TABLE:
 * `responsive` wraps it so a wide table scrolls inside its own box on a phone
 * instead of making the whole page scroll sideways. Every <th> carries a scope
 * attribute, so a screen reader announces each cell with its column heading
 * rather than reading a wall of disconnected values.
 */
const BarberAppointmentsPage = () => {
  const dispatch = useDispatch();
  const { appointments, isLoadingAppointments, error, message, isSaving } =
    useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchAppointments());
    return () => dispatch(clearBookingFeedback());
  }, [dispatch]);

  const setStatus = (bookingId, status) => {
    dispatch(updateBookingStatus(bookingId, status));
  };

  /** Which buttons make sense for this status. */
  const actionsFor = (booking) => {
    switch (booking.status) {
      case "pending":
        return [
          { status: "confirmed", label: "Confirm", variant: "primary" },
          { status: "cancelled_by_barber", label: "Decline", variant: "outline-danger" },
        ];
      case "confirmed":
        return [
          { status: "completed", label: "Mark as completed", variant: "outline-dark" },
          { status: "no_show", label: "Mark as no-show", variant: "outline-dark" },
          { status: "cancelled_by_barber", label: "Cancel", variant: "outline-danger" },
        ];
      default:
        return [];
    }
  };

  const now = Date.now();
  const upcoming = appointments.filter(
    (booking) => new Date(booking.startAt).getTime() >= now
  );
  const past = appointments.filter(
    (booking) => new Date(booking.startAt).getTime() < now
  );

  const renderTable = (rows, caption) => (
    <div className="v-card mb-5" style={{ overflow: "hidden" }}>
      <Table responsive bordered className="v-table align-middle mb-0">
        {/* A caption describes the table to someone who cannot see it at a
            glance. It is useful to everyone, so it stays visible. */}
        <caption className="text-muted small px-3">{caption}</caption>

        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Customer</th>
            <th scope="col">Service</th>
            <th scope="col">Price</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>

        <tbody>
        {rows.map((booking) => (
          <tr key={booking.id}>
            <td>
              {formatDateTime(booking.startAt)}
              <br />
              <span className="text-muted small">
                {formatDuration(booking.durationMinutes)}
              </span>
            </td>

            <td>
              {booking.customerName || "Customer"}
              {booking.customerPhone && (
                <>
                  <br />
                  <a
                    href={`tel:${booking.customerPhone.replace(/\s/g, "")}`}
                    className="small"
                  >
                    {booking.customerPhone}
                  </a>
                </>
              )}
              {booking.customerNote && (
                <>
                  <br />
                  <span className="text-muted small">
                    Note: {booking.customerNote}
                  </span>
                </>
              )}
            </td>

            <td>{booking.serviceName}</td>

            <td className="text-nowrap">
              {formatMoney(booking.priceMinor, booking.currency)}
            </td>

            <td>
              <StatusBadge status={booking.status} />
            </td>

            <td>
              {actionsFor(booking).length === 0 ? (
                <span className="text-muted small">No action needed</span>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {actionsFor(booking).map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      onClick={() => setStatus(booking.id, action.status)}
                      disabled={isSaving}
                    >
                      {action.label}
                      {/* Says which appointment, so someone hearing a list of
                          "Confirm" buttons knows which one they are on. */}
                      <span className="visually-hidden">
                        : {booking.serviceName} for{" "}
                        {booking.customerName || "customer"} on{" "}
                        {formatDateTime(booking.startAt)}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container className="py-5">
      <BarberPageHead
        eyebrow="Your schedule"
        title="Appointments"
        lede={
          <>
            New requests arrive as <strong>Awaiting confirmation</strong>. They
            are only agreed once you confirm them.
          </>
        }
      />

      <Alert type="error" onDismiss={() => dispatch(clearBookingFeedback())}>
        {error}
      </Alert>
      <Alert type="success" onDismiss={() => dispatch(clearBookingFeedback())}>
        {message}
      </Alert>

      {isLoadingAppointments && (
        <div className="v-loading-row" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading your appointments.</span>
        </div>
      )}

      {!isLoadingAppointments && appointments.length === 0 && (
        <div className="v-empty-state">
          <p className="mb-2">You have no appointments yet.</p>
          <p className="mb-4">
            Customers can only book once your shop profile is published and you
            have added at least one service.
          </p>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <Button as={Link} to="/barber/profile" variant="outline-dark">
              Edit shop profile
            </Button>
            <Button as={Link} to="/barber/services" variant="outline-dark">
              Manage services
            </Button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && renderTable(upcoming, "Upcoming appointments")}
      {past.length > 0 && renderTable(past, "Past appointments")}
    </Container>
  );
};

export default BarberAppointmentsPage;
