import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Table, Spinner, Dropdown, Button } from "react-bootstrap";

import {
  fetchAdminBookings, recordAdminBookingPayment, deleteAdminBookingPayment, clearAdminBookingFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatMoney, formatDateTime } from "../../utils/format";

const PAYMENT_OPTIONS = ["unpaid", "paid", "refunded", "failed"];

/**
 * Payment records live on Booking.payment, not a separate collection --
 * there is no payment processor here (see the model comment on
 * Booking.payment), so this page is really "every booking, viewed through
 * its payment status" rather than a transactions ledger. Reuses the exact
 * same list endpoint and action as the Bookings page, just with
 * payment-relevant columns and a payment-status filter as the default view.
 */
const AdminPaymentsPage = () => {
  const dispatch = useDispatch();
  const { bookings, isLoadingBookings, bookingsError, bookingMessage, isSavingBooking } =
    useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleConfirmDelete = () => {
    dispatch(deleteAdminBookingPayment(deleteTarget.id, () => setDeleteTarget(null)));
  };

  useEffect(() => {
    const params = { limit: 100 };
    if (statusFilter) params.paymentStatus = statusFilter;
    dispatch(fetchAdminBookings(params));
  }, [dispatch, statusFilter]);

  const summary = PAYMENT_OPTIONS.reduce((acc, status) => {
    acc[status] = bookings.filter((b) => b.payment?.status === status).length;
    return acc;
  }, {});

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminBookingFeedback())}>{bookingsError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminBookingFeedback())}>{bookingMessage}</Alert>

      <div className="d-flex flex-wrap gap-2">
        {["", ...PAYMENT_OPTIONS].map((status) => (
          <button
            key={status || "all"}
            type="button"
            className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-outline-secondary"}`}
            style={statusFilter !== status ? { color: "#3a3a33", borderColor: "#3a3a33" } : undefined}
            onClick={() => setStatusFilter(status)}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
            {status && ` (${summary[status]})`}
          </button>
        ))}
      </div>

      <div className="bb-admin-table-card">
        {isLoadingBookings && (
          <div className="d-flex align-items-center gap-3 p-4" role="status">
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Loading payments.</span>
          </div>
        )}

        {!isLoadingBookings && bookings.length === 0 && (
          <p className="mb-0 p-4 text-center">No bookings match this filter.</p>
        )}

        {!isLoadingBookings && bookings.length > 0 && (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                  <tr>
                    <th scope="col">Client</th>
                    <th scope="col">Booking</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Date</th>
                    <th scope="col">Method</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.customerName || "Walk-in"}</td>
                      <td>{b.serviceName} with {b.barberName}</td>
                      <td>{formatMoney(b.priceMinor, b.currency)}</td>
                      <td>{formatDateTime(b.startAt)}</td>
                      <td className="text-capitalize">{b.payment?.method || "—"}</td>
                      <td><PaymentStatusBadge status={b.payment?.status} /></td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Dropdown align="end">
                            <Dropdown.Toggle variant="outline-dark" size="sm">Update</Dropdown.Toggle>
                            <Dropdown.Menu>
                              {PAYMENT_OPTIONS.filter((p) => p !== b.payment?.status).map((p) => (
                                <Dropdown.Item
                                  key={p}
                                  onClick={() => dispatch(recordAdminBookingPayment(b.id, p, p === "paid" ? "cash" : undefined))}
                                >
                                  Mark {p}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                          <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(b)}>
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

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this payment record?"
        confirmLabel="Delete Payment"
        isConfirming={isSavingBooking}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <p className="mb-0">
            This clears the payment record (status, method and who recorded it) for{" "}
            <strong>{deleteTarget?.customerName || "this walk-in"}</strong>'s {deleteTarget?.serviceName}{" "}
            booking back to unpaid. The booking itself is not affected.
          </p>
        }
      />
    </div>
  );
};

export default AdminPaymentsPage;
