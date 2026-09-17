import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Form, Button, Spinner, Badge, Modal } from "react-bootstrap";

import {
  fetchAdminClients, createAdminClient, deleteAdminClient,
  suspendAdminClient, reactivateAdminClient, clearAdminClientFeedback,
} from "../../actions/adminActions";
import api from "../../api/axios";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { SearchIcon } from "../../components/formIcons";
import { formatMoney, formatDateTime } from "../../utils/format";

/**
 * The client database, laid out as a card grid -- same shell as
 * AdminBarbersPage.js (one card per record, status badge top-right, action
 * buttons along the bottom), so managing clients and barbers feels like the
 * same tool. Every field comes from a real query in
 * adminClientController.js's listClients -- totalVisits/lastVisit/
 * totalSpent/favoriteService are computed from actual bookings.
 *
 * TWO DIFFERENT "STATUS" CONCEPTS, deliberately named differently so they
 * never collide: `engagementStatus` (active/new, derived from real visit
 * history) and `status` (active/suspended, the ACCOUNT's own state -- see
 * suspendAdminClient/reactivateAdminClient).
 */
const AdminClientsPage = () => {
  const dispatch = useDispatch();
  const {
    clients, clientsTotal, isLoadingClients, clientsError, clientMessage, isSavingClient, clientError,
    isDeletingClient, clientDeleteError, isUpdatingClientStatus,
  } = useSelector((state) => state.admin);

  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });

  // The client queued for deletion, plus how many upcoming appointments
  // they have -- fetched fresh right when "Delete" is clicked (the list
  // rows do not carry this, only the detail endpoint does), so the warning
  // in the confirm modal is always accurate. null while that check is
  // still in flight.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [upcomingCount, setUpcomingCount] = useState(null);

  const openDeleteConfirm = async (client) => {
    setDeleteTarget(client);
    setUpcomingCount(null);
    try {
      const { data } = await api.get(`/admin/clients/${client.id}`);
      setUpcomingCount(data.upcomingAppointments.length);
    } catch {
      setUpcomingCount(0);
    }
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAdminClient(deleteTarget.id, () => setDeleteTarget(null)));
  };

  useEffect(() => {
    const params = { limit: 50 };
    if (query) params.q = query;
    const timer = setTimeout(() => dispatch(fetchAdminClients(params)), 300);
    return () => clearTimeout(timer);
  }, [dispatch, query]);

  const handleAddClient = (event) => {
    event.preventDefault();
    dispatch(
      createAdminClient(newClient, () => {
        setShowAddModal(false);
        setNewClient({ name: "", email: "", phone: "" });
      })
    );
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminClientFeedback())}>{clientsError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminClientFeedback())}>{clientMessage}</Alert>

      <Card>
        <Card.Body className="d-flex flex-wrap gap-3 align-items-end justify-content-between">
          <div style={{ maxWidth: 360, flex: 1 }}>
            <FormField
              id="clientSearch"
              label="Search clients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
              icon={<SearchIcon />}
              hint="By name, email or phone."
            />
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="mb-3">
            + Add client
          </Button>
        </Card.Body>
      </Card>

      {isLoadingClients && (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading clients.</span>
        </div>
      )}

      {!isLoadingClients && clients.length === 0 && (
        <p className="text-muted">No clients match that search.</p>
      )}

      <Row className="g-3">
        {clients.map((client) => (
          <Col key={client.id} md={6} xl={4}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <Card.Title as="h2" className="h6 mb-0">{client.name}</Card.Title>
                    <Card.Subtitle className="text-muted small fw-normal">{client.email}</Card.Subtitle>
                  </div>
                  <Badge bg="" className={`bb-badge ${client.engagementStatus === "active" ? "bb-badge-confirmed" : "bb-badge-muted"}`}>
                    {client.engagementStatus === "active" ? "Active" : "New"}
                  </Badge>
                </div>

                {client.status === "suspended" && (
                  <div className="mb-2">
                    <Badge bg="" className="bb-badge bb-badge-cancelled">Suspended</Badge>
                  </div>
                )}

                <p className="text-muted small mb-3">{client.phone}</p>

                <dl className="row small mb-3">
                  <dt className="col-7">Total visits</dt>
                  <dd className="col-5 text-end">{client.totalVisits}</dd>
                  <dt className="col-7">Last visit</dt>
                  <dd className="col-5 text-end">{client.lastVisit ? formatDateTime(client.lastVisit) : "Never"}</dd>
                  <dt className="col-7">Favorite service</dt>
                  <dd className="col-5 text-end">{client.favoriteService || "—"}</dd>
                  <dt className="col-7">Total spent</dt>
                  <dd className="col-5 text-end">{formatMoney(client.totalSpentMinor, "GBP")}</dd>
                </dl>

                <div className="mt-auto d-flex gap-2 flex-wrap">
                  <Button as={Link} to={`/admin/clients/${client.id}`} variant="outline-dark" size="sm">
                    Manage
                  </Button>
                  {client.status === "suspended" ? (
                    <Button
                      variant="outline-dark" size="sm" disabled={isUpdatingClientStatus}
                      onClick={() => dispatch(reactivateAdminClient(client.id))}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline-dark" size="sm" disabled={isUpdatingClientStatus}
                      onClick={() => dispatch(suspendAdminClient(client.id))}
                    >
                      Suspend
                    </Button>
                  )}
                  <Button variant="outline-danger" size="sm" onClick={() => openDeleteConfirm(client)}>
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {clientsTotal > clients.length && (
        <p className="text-muted small">Showing {clients.length} of {clientsTotal}. Narrow your search to see more specific results.</p>
      )}

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Form onSubmit={handleAddClient} noValidate>
          <Modal.Header closeButton>
            <Modal.Title as="h2" className="h5 mb-0">Add client</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-2">
            <Alert type="error">{clientError}</Alert>
            <FormField id="newClientName" label="Name" value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required />
            <FormField id="newClientEmail" label="Email" type="email" value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} required />
            <FormField id="newClientPhone" label="Phone" value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} required />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-dark" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSavingClient}>
              {isSavingClient ? "Adding..." : "Add client"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this client?"
        confirmLabel="Delete Client"
        isConfirming={isDeletingClient}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <div className="d-flex flex-column gap-2">
            <Alert type="error">{clientDeleteError}</Alert>
            <p className="mb-0">
              This will permanently delete the client and their personal information. This action cannot be undone.
            </p>
            {upcomingCount === null && <p className="text-muted small mb-0">Checking for upcoming appointments...</p>}
            {upcomingCount > 0 && (
              <p className="text-danger small mb-0">
                <strong>{deleteTarget?.name}</strong> has {upcomingCount} upcoming appointment{upcomingCount === 1 ? "" : "s"}.
                They will not be cancelled, but the client&rsquo;s account will be gone.
              </p>
            )}
          </div>
        }
      />
    </div>
  );
};

export default AdminClientsPage;
