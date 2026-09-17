import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { rescheduleAdminBooking } from "../../actions/adminActions";
import Alert from "../../components/Alert";

/**
 * Small, single-purpose modal: pick a new date/time for one existing
 * booking. The server re-runs the full working-hours/time-off/break/
 * overlap check on submit -- this form does not duplicate that logic, it
 * just reports whatever the server says.
 */
const RescheduleModal = ({ booking, onClose }) => {
  const dispatch = useDispatch();
  const { isSavingBooking, bookingError } = useSelector((state) => state.admin);
  const [startAt, setStartAt] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!startAt) return;

    dispatch(rescheduleAdminBooking(booking.id, new Date(startAt).toISOString(), () => onClose()))
      .catch(() => {
        // Feedback already lives in bookingError; nothing further to do here.
      });
  };

  return (
    <Modal show={Boolean(booking)} onHide={onClose} centered>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">Reschedule booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert type="error">{bookingError}</Alert>
          <p className="small text-muted">
            {booking?.customerName || "Walk-in"} -- {booking?.serviceName} with {booking?.barberName}
          </p>
          <Form.Group controlId="rescheduleStartAt">
            <Form.Label>New date and time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!startAt || isSavingBooking}>
            {isSavingBooking ? "Saving..." : "Reschedule"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RescheduleModal;
