import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Form, Button, Table, Spinner, Badge } from "react-bootstrap";

import {
  fetchAdminClientDetail,
  updateAdminClient,
  deleteAdminClient,
  suspendAdminClient,
  reactivateAdminClient,
  clearAdminClientFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatMoney, formatDateTime } from "../../utils/format";

/**
 * One client's full picture: real booking history and spend aggregated
 * across every barber they have ever booked with -- see getClient in
 * adminClientController.js, which nothing else in this codebase could do
 * before (every other booking query is scoped to one barber or the
 * customer themselves).
 */
const AdminClientDetailPage = () => {
  const { clientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    clientDetail, isLoadingClientDetail, clientDetailError,
    isSavingClient, clientError, clientFieldErrors, clientMessage,
    isDeletingClient, clientDeleteError, isUpdatingClientStatus,
  } = useSelector((state) => state.admin);

  const [form, setForm] = useState({ name: "", phone: "", email: "", adminNotes: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminClientDetail(clientId));
    return () => dispatch(clearAdminClientFeedback());
  }, [dispatch, clientId]);

  useEffect(() => {
    if (!clientDetail) return;
    const { client } = clientDetail;
    setForm({ name: client.name, phone: client.phone, email: client.email, adminNotes: client.adminNotes || "" });
  }, [clientDetail]);

  const handleSave = (event) => {
    event.preventDefault();
    dispatch(updateAdminClient(clientId, form));
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAdminClient(clientId, () => navigate("/admin/clients")));
  };

  if (isLoadingClientDetail && !clientDetail) {
    return (
      <div className="d-flex align-items-center gap-3" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Loading client.</span>
      </div>
    );
  }

  if (clientDetailError) return <Alert type="error">{clientDetailError}</Alert>;
  if (!clientDetail) return null;

  const { favoriteService, totalSpentMinor, totalVisits, lastVisit, upcomingAppointments, bookingHistory } =
    clientDetail;

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminClientFeedback())}>{clientError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminClientFeedback())}>{clientMessage}</Alert>

      {clientDetail.client.status === "suspended" && (
        <div>
          <Badge bg="" className="bb-badge bb-badge-cancelled">Suspended</Badge>
        </div>
      )}

      <Row className="g-3">
        <Col md={3}><StatCard label="Total visits" value={totalVisits} /></Col>
        <Col md={3}><StatCard label="Total spent" value={formatMoney(totalSpentMinor, "GBP")} /></Col>
        <Col md={3}><StatCard label="Favorite service" value={favoriteService || "—"} /></Col>
        <Col md={3}><StatCard label="Last visit" value={lastVisit ? formatDateTime(lastVisit) : "Never"} /></Col>
      </Row>

      <Row className="g-3">
        <Col lg={5}>
          <Card>
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Client details</Card.Title>
              <Form onSubmit={handleSave} noValidate>
                <FormField id="name" label="Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={clientFieldErrors.name} required />
                <FormField id="email" label="Email" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={clientFieldErrors.email} required />
                <FormField id="phone" label="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={clientFieldErrors.phone} required />
                <FormField id="adminNotes" label="Internal notes (staff only)" as="textarea" rows={4}
                  value={form.adminNotes}
                  onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                  error={clientFieldErrors.adminNotes}
                  hint="Never shown to the client -- preferences, a past issue, anything staff should know." />
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={isSavingClient}>
                    {isSavingClient ? "Saving..." : "Save changes"}
                  </Button>
                  {clientDetail.client.status === "suspended" ? (
                    <Button
                      variant="outline-dark" disabled={isUpdatingClientStatus}
                      onClick={() => dispatch(reactivateAdminClient(clientId))}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline-dark" disabled={isUpdatingClientStatus}
                      onClick={() => dispatch(suspendAdminClient(clientId))}
                    >
                      Suspend
                    </Button>
                  )}
                  <Button variant="outline-danger" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Client
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Upcoming appointments</Card.Title>
              {upcomingAppointments.length === 0 ? (
                <p className="text-muted small mb-0">Nothing upcoming.</p>
              ) : (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {upcomingAppointments.map((b) => (
                    <li key={b.id} className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <strong>{b.serviceName}</strong>
                        <div className="text-muted small">with {b.barberName}</div>
                      </div>
                      <div className="text-end">
                        <div className="small">{formatDateTime(b.startAt)}</div>
                        <StatusBadge status={b.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Booking history</Card.Title>
              {bookingHistory.length === 0 ? (
                <p className="text-muted small mb-0">No bookings yet.</p>
              ) : (
                <div className="table-responsive">
                  <Table size="sm" className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Service</th>
                        <th scope="col">Barber</th>
                        <th scope="col">Price</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingHistory.map((b) => (
                        <tr key={b.id}>
                          <td>{formatDateTime(b.startAt)}</td>
                          <td>{b.serviceName}</td>
                          <td>{b.barberName}</td>
                          <td>{formatMoney(b.priceMinor, b.currency)}</td>
                          <td><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete this client?"
        confirmLabel="Delete Client"
        isConfirming={isDeletingClient}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        body={
          <div className="d-flex flex-column gap-2">
            <Alert type="error">{clientDeleteError}</Alert>
            <p className="mb-0">
              This will permanently delete the client and their personal information. This action cannot be undone.
            </p>
            {upcomingAppointments.length > 0 && (
              <p className="text-danger small mb-0">
                This client has {upcomingAppointments.length} upcoming appointment{upcomingAppointments.length === 1 ? "" : "s"}.
                They will not be cancelled, but the client&rsquo;s account will be gone.
              </p>
            )}
          </div>
        }
      />
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <Card className="h-100 bb-kpi-card">
    <Card.Body>
      <p className="bb-kpi-label mb-2">{label}</p>
      <p className="bb-kpi-value mb-0" style={{ fontSize: "1.4rem" }}>{value}</p>
    </Card.Body>
  </Card>
);

export default AdminClientDetailPage;
