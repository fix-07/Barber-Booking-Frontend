import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import {
  setAdminBookingStatus,
  rescheduleAdminBooking,
  recordAdminBookingPayment,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import StatusBadge from "../../components/StatusBadge";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";
import { formatMoney, formatDateTime } from "../../utils/format";

const TERMINAL_STATUSES = [
  "completed", "no_show", "cancelled_by_customer", "cancelled_by_barber", "cancelled_by_admin",
];
const PAYMENT_OPTIONS = ["unpaid", "paid", "refunded", "failed"];

/**
 * The detail/actions view opened by clicking a booking card anywhere on the
 * Calendar. Same actions as the Bookings table's row menu (confirm/
 * complete/no-show/cancel/reschedule/payment) -- see
 * adminBookingController.js for what each one actually enforces
 * server-side. Kept as one self-contained modal (reschedule is an inline
 * field here, not a separate nested modal) to avoid a modal-opening-a-modal
 * chain.
 */
const BookingDetailModal = ({ booking, onClose }) => {
  const dispatch = useDispatch();
  const { isSavingBooking, bookingError } = useSelector((state) => state.admin);
  const [newStartAt, setNewStartAt] = useState("");

  if (!booking) return null;

  const isTerminal = TERMINAL_STATUSES.includes(booking.status);

  const handleReschedule = (event) => {
    event.preventDefault();
    if (!newStartAt) return;
    dispatch(
      rescheduleAdminBooking(booking.id, new Date(newStartAt).toISOString(), () => onClose())
    ).catch(() => {});
  };

  return (
    <Modal show={Boolean(booking)} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">Booking details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column gap-3">
        <Alert type="error">{bookingError}</Alert>

        <div>
          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
            <strong>{booking.customerName || "Walk-in"}</strong>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-muted small mb-1">
            {booking.serviceName} with {booking.barberName}
          </p>
          <p className="small mb-1">{formatDateTime(booking.startAt)}</p>
          <p className="small mb-0">{formatMoney(booking.priceMinor, booking.currency)}</p>
        </div>

        {booking.staffNote && (
          <p className="small mb-0"><strong>Internal note:</strong> {booking.staffNote}</p>
        )}

        <div>
          <p className="small fw-semibold mb-1">Payment</p>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <PaymentStatusBadge status={booking.payment?.status} />
            {PAYMENT_OPTIONS.filter((p) => p !== booking.payment?.status).map((p) => (
              <Button
                key={p}
                variant="outline-dark"
                size="sm"
                disabled={isSavingBooking}
                onClick={() =>
                  dispatch(recordAdminBookingPayment(booking.id, p, p === "paid" ? "cash" : undefined))
                }
              >
                Mark {p}
              </Button>
            ))}
          </div>
        </div>

        {!isTerminal && (
          <>
            <div className="d-flex flex-wrap gap-2">
              {booking.status === "pending" && (
                <Button
                  variant="outline-dark"
                  size="sm"
                  disabled={isSavingBooking}
                  onClick={() => dispatch(setAdminBookingStatus(booking.id, "confirmed"))}
                >
                  Confirm
                </Button>
              )}
              {booking.status === "confirmed" && (
                <>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    disabled={isSavingBooking}
                    onClick={() => dispatch(setAdminBookingStatus(booking.id, "completed"))}
                  >
                    Mark completed
                  </Button>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    disabled={isSavingBooking}
                    onClick={() => dispatch(setAdminBookingStatus(booking.id, "no_show"))}
                  >
                    Mark no-show
                  </Button>
                </>
              )}
              <Button
                variant="outline-danger"
                size="sm"
                disabled={isSavingBooking}
                onClick={() => dispatch(setAdminBookingStatus(booking.id, "cancelled_by_admin"))}
              >
                Cancel
              </Button>
            </div>

            <Form onSubmit={handleReschedule} className="d-flex gap-2 align-items-end flex-wrap">
              <Form.Group controlId="detailReschedule">
                <Form.Label className="small mb-1">Reschedule to</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={newStartAt}
                  onChange={(e) => setNewStartAt(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" variant="primary" size="sm" disabled={!newStartAt || isSavingBooking}>
                Save
              </Button>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default BookingDetailModal;
