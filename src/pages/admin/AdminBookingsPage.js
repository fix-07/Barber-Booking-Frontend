import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Table, Form, Row, Col, Button, Dropdown, Spinner, Card } from "react-bootstrap";

import {
  fetchAdminBookings,
  setAdminBookingStatus,
  recordAdminBookingPayment,
  deleteAdminBooking,
  fetchBarbersForPicker,
  clearAdminBookingFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import StatusBadge from "../../components/StatusBadge";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";
import BookingFormModal from "../../components/admin/BookingFormModal";
import RescheduleModal from "../../components/admin/RescheduleModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatMoney, formatDateTime } from "../../utils/format";

const STATUS_OPTIONS = [
  "pending", "confirmed", "completed",
  "cancelled_by_customer", "cancelled_by_barber", "cancelled_by_admin", "no_show",
];
const PAYMENT_OPTIONS = ["unpaid", "paid", "refunded", "failed"];
const TERMINAL_STATUSES = [
  "completed", "no_show", "cancelled_by_customer", "cancelled_by_barber", "cancelled_by_admin",
];

/**
 * The bookings table: every booking in the shop, with filters and the
 * actions staff need day to day. See adminBookingController.js on the
 * server for what each action actually enforces (double-booking
 * protection, working hours, time off -- none of that is re-implemented
 * here, this page just calls the endpoint and shows what it says).
 */
const AdminBookingsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    bookings, bookingsTotal, isLoadingBookings, bookingsError, bookingMessage, barberOptions,
    isDeletingBooking, bookingDeleteError,
  } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({ date: "", barberId: "", status: "", paymentStatus: "" });
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get("new") === "1");
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchBarbersForPicker());
  }, [dispatch]);

  useEffect(() => {
    const params = { limit: 50 };
    if (filters.date) params.date = filters.date;
    if (filters.barberId) params.barberId = filters.barberId;
    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    dispatch(fetchAdminBookings(params));
  }, [dispatch, filters]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowCreateModal(true);
      searchParams.delete("new");
      setSearchParams(searchParams, { replace: true });
    }
    // Deliberately runs once on mount only, to consume the ?new=1 param a
    // single time -- it must not re-fire when searchParams itself changes,
    // which is exactly what this effect causes.
  }, [searchParams, setSearchParams]);

  const handleFilterChange = (field) => (event) =>
    setFilters({ ...filters, [field]: event.target.value });

  const handleConfirmDelete = () => {
    dispatch(deleteAdminBooking(deleteTarget.id, () => setDeleteTarget(null)));
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminBookingFeedback())}>
        {bookingsError}
      </Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminBookingFeedback())}>
        {bookingMessage}
      </Alert>

      <Card>
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={2}>
              <Form.Group controlId="filterDate">
                <Form.Label className="small">Date</Form.Label>
                <Form.Control type="date" value={filters.date} onChange={handleFilterChange("date")} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filterBarber">
                <Form.Label className="small">Barber</Form.Label>
                <Form.Select value={filters.barberId} onChange={handleFilterChange("barberId")}>
                  <option value="">All barbers</option>
                  {barberOptions.map((b) => (
                    <option key={b.barberId} value={b.barberId}>{b.shopName}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="filterStatus">
                <Form.Label className="small">Status</Form.Label>
                <Form.Select value={filters.status} onChange={handleFilterChange("status")}>
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="filterPayment">
                <Form.Label className="small">Payment</Form.Label>
                <Form.Select value={filters.paymentStatus} onChange={handleFilterChange("paymentStatus")}>
                  <option value="">All payments</option>
                  {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex justify-content-end">
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + New booking
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="bb-admin-table-card">
        {isLoadingBookings && (
          <div className="d-flex align-items-center gap-3 p-4" role="status">
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Loading bookings.</span>
          </div>
        )}

        {!isLoadingBookings && bookings.length === 0 && (
          <p className="mb-0 p-4 text-center">No bookings match these filters.</p>
        )}

        {!isLoadingBookings && bookings.length > 0 && (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                  <tr>
                    <th scope="col">Client</th>
                    <th scope="col">Service</th>
                    <th scope="col">Barber</th>
                    <th scope="col">Date &amp; time</th>
                    <th scope="col">Price</th>
                    <th scope="col">Status</th>
                    <th scope="col">Payment</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.customerName || "Walk-in"}</td>
                      <td>{booking.serviceName}</td>
                      <td>{booking.barberName}</td>
                      <td>{formatDateTime(booking.startAt)}</td>
                      <td>{formatMoney(booking.priceMinor, booking.currency)}</td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td><PaymentStatusBadge status={booking.payment?.status} /></td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="outline-dark" size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {booking.status === "pending" && (
                                <Dropdown.Item
                                  onClick={() => dispatch(setAdminBookingStatus(booking.id, "confirmed"))}
                                >
                                  Confirm
                                </Dropdown.Item>
                              )}
                              {booking.status === "confirmed" && (
                                <>
                                  <Dropdown.Item
                                    onClick={() => dispatch(setAdminBookingStatus(booking.id, "completed"))}
                                  >
                                    Mark completed
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => dispatch(setAdminBookingStatus(booking.id, "no_show"))}
                                  >
                                    Mark no-show
                                  </Dropdown.Item>
                                </>
                              )}
                              {!TERMINAL_STATUSES.includes(booking.status) && (
                                <>
                                  <Dropdown.Item onClick={() => setReschedulingBooking(booking)}>
                                    Reschedule
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => dispatch(setAdminBookingStatus(booking.id, "cancelled_by_admin"))}
                                  >
                                    Cancel
                                  </Dropdown.Item>
                                </>
                              )}
                              <Dropdown.Divider />
                              {PAYMENT_OPTIONS.filter((p) => p !== booking.payment?.status).map((p) => (
                                <Dropdown.Item
                                  key={p}
                                  onClick={() =>
                                    dispatch(
                                      recordAdminBookingPayment(
                                        booking.id,
                                        p,
                                        p === "paid" ? "cash" : undefined
                                      )
                                    )
                                  }
                                >
                                  Mark {p}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                          <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(booking)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
      </div>

      {bookingsTotal > bookings.length && (
        <p className="text-muted small">Showing {bookings.length} of {bookingsTotal}. Narrow the filters to see more specific results.</p>
      )}

      <BookingFormModal show={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <RescheduleModal booking={reschedulingBooking} onClose={() => setReschedulingBooking(null)} />

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this booking?"
        confirmLabel="Delete Booking"
        isConfirming={isDeletingBooking}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <div className="d-flex flex-column gap-2">
            <Alert type="error">{bookingDeleteError}</Alert>
            <p className="mb-0">
              This permanently deletes the appointment for <strong>{deleteTarget?.customerName || "this walk-in"}</strong>.
              It is removed from Bookings, Calendar, Analytics and Reports entirely. This action cannot be undone.
            </p>
            <p className="text-muted small mb-0">
              To keep a record but stop it from being active, use <strong>Cancel</strong> in the Actions menu instead.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default AdminBookingsPage;
