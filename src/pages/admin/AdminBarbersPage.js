import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Button, Badge, Spinner, Modal, Form } from "react-bootstrap";

import {
  fetchAdminBarbers, createAdminBarber, deleteAdminBarber,
  suspendAdminBarber, reactivateAdminBarber, clearAdminBarberFeedback,
} from "../../actions/adminActions";
import api from "../../api/axios";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatMoney } from "../../utils/format";

/**
 * Barber cards. "Specialty" was in the original ask but is not a real field
 * anywhere in this schema -- inventing one per barber would be exactly the
 * kind of fabricated data this project avoids, so the card shows the shop's
 * own bio instead, which is the real, barber-written equivalent. Rating,
 * today's appointments and weekly revenue are all real aggregates from
 * adminBarberController.listBarbers, zero for a barber with no bookings yet.
 */
const STATUS_BADGE = {
  pending_approval: { label: "Pending approval", className: "bb-badge-pending" },
  active: { label: "Active", className: "bb-badge-confirmed" },
  rejected: { label: "Rejected", className: "bb-badge-cancelled" },
  suspended: { label: "Suspended", className: "bb-badge-muted" },
};

const AdminBarbersPage = () => {
  const dispatch = useDispatch();
  const {
    barbersList, isLoadingBarbersList, barbersListError,
    isSavingBarber, barberError, barberFieldErrors, barberMessage, lastCreatedBarberPassword,
    isDeletingBarber, barberDeleteError, isUpdatingBarberStatus,
  } = useSelector((state) => state.admin);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(blankForm());

  // Same pattern as AdminClientsPage: fetch the real upcoming-bookings
  // count right when "Delete" is clicked, so the warning is always
  // accurate rather than relying on stale list data.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [upcomingCount, setUpcomingCount] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminBarbers({ limit: 100 }));
  }, [dispatch]);

  const handleCreate = (event) => {
    event.preventDefault();
    dispatch(createAdminBarber(form, () => {
      dispatch(fetchAdminBarbers({ limit: 100 }));
      setForm(blankForm());
    }));
  };

  const openDeleteConfirm = async (barber) => {
    setDeleteTarget(barber);
    setUpcomingCount(null);
    try {
      const { data } = await api.get(`/admin/barbers/${barber.barberId}`);
      setUpcomingCount(data.upcomingBookingsCount);
    } catch {
      setUpcomingCount(0);
    }
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAdminBarber(deleteTarget.barberId, () => setDeleteTarget(null)));
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminBarberFeedback())}>{barbersListError}</Alert>
      {/* A single expression, not multiple JSX children -- passing several
          children here would make Alert's `children` prop an array, which
          is always truthy even when every item is null/false, defeating
          its own `if (!children) return null` guard and leaving an empty
          box on screen with nothing to show. */}
      <Alert type="success" onDismiss={() => dispatch(clearAdminBarberFeedback())}>
        {barberMessage && (
          <>
            {barberMessage}
            {lastCreatedBarberPassword && (
              <> Temporary password: <code>{lastCreatedBarberPassword}</code> (shown once -- share it with them now).</>
            )}
          </>
        )}
      </Alert>

      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add barber</Button>
      </div>

      {isLoadingBarbersList && (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading barbers.</span>
        </div>
      )}

      {!isLoadingBarbersList && barbersList.length === 0 && (
        <p className="text-muted">No barbers yet.</p>
      )}

      <Row className="g-3">
        {barbersList.map((barber) => (
          <Col key={barber.barberId} md={6} xl={4}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <Card.Title as="h2" className="h6 mb-0">{barber.shopName}</Card.Title>
                    <Card.Subtitle className="text-muted small fw-normal">{barber.barberName}</Card.Subtitle>
                  </div>
                  <Badge bg="" className={`bb-badge ${barber.isPublished ? "bb-badge-confirmed" : "bb-badge-muted"}`}>
                    {barber.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </div>

                {barber.status && barber.status !== "active" && (
                  <div className="mb-2">
                    <Badge bg="" className={`bb-badge ${(STATUS_BADGE[barber.status] || STATUS_BADGE.active).className}`}>
                      {(STATUS_BADGE[barber.status] || STATUS_BADGE.active).label}
                    </Badge>
                  </div>
                )}

                <p className="text-muted small mb-2">{barber.city}</p>
                {barber.bio && <p className="small mb-3">{barber.bio}</p>}

                <dl className="row small mb-3">
                  <dt className="col-7">Today's appointments</dt>
                  <dd className="col-5 text-end">{barber.todaysAppointmentsCount}</dd>
                  <dt className="col-7">Weekly revenue</dt>
                  <dd className="col-5 text-end">{formatMoney(barber.weeklyRevenueMinor, "GBP")}</dd>
                  <dt className="col-7">Rating</dt>
                  <dd className="col-5 text-end">
                    {barber.averageRating ? `${barber.averageRating.toFixed(1)} / 5 (${barber.reviewCount})` : "No reviews yet"}
                  </dd>
                </dl>

                <div className="mt-auto d-flex gap-2 flex-wrap">
                  <Badge bg="" className={`bb-badge ${barber.isAcceptingBookings ? "bb-badge-confirmed" : "bb-badge-muted"}`}>
                    {barber.isAcceptingBookings ? "Accepting bookings" : "Paused"}
                  </Badge>
                </div>

                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <Button as={Link} to={`/admin/barbers/${barber.barberId}`} variant="outline-dark" size="sm">
                    Manage
                  </Button>
                  {barber.status === "suspended" || barber.status === "rejected" ? (
                    <Button
                      variant="outline-dark" size="sm" disabled={isUpdatingBarberStatus}
                      onClick={() => dispatch(reactivateAdminBarber(barber.barberId))}
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline-dark" size="sm" disabled={isUpdatingBarberStatus}
                      onClick={() => dispatch(suspendAdminBarber(barber.barberId))}
                    >
                      Suspend
                    </Button>
                  )}
                  <Button variant="outline-danger" size="sm" onClick={() => openDeleteConfirm(barber)}>
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Form onSubmit={handleCreate} noValidate>
          <Modal.Header closeButton>
            <Modal.Title as="h2" className="h5 mb-0">Add barber</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-2">
            <Alert type="error">{barberError}</Alert>
            <FormField id="barberName" label="Full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={barberFieldErrors.name} required />
            <FormField id="barberEmail" label="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={barberFieldErrors.email} required />
            <FormField id="barberPhone" label="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={barberFieldErrors.phone} required />
            <FormField id="barberShopName" label="Shop name" value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              error={barberFieldErrors.shopName} required />
            <FormField id="barberCity" label="City" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              error={barberFieldErrors.city} required />
            <FormField id="barberTimeZone" label="Timezone" value={form.timeZone}
              onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
              error={barberFieldErrors.timeZone} required
              hint="For example Europe/London or America/New_York." />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-dark" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSavingBarber}>
              {isSavingBarber ? "Creating..." : "Create barber"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this barber?"
        confirmLabel="Delete Barber"
        isConfirming={isDeletingBarber}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <div className="d-flex flex-column gap-2">
            <Alert type="error">{barberDeleteError}</Alert>
            <p className="mb-0">
              This will permanently remove the barber from VEYRON. Existing booking history must remain intact.
            </p>
            {upcomingCount === null && <p className="text-muted small mb-0">Checking for upcoming appointments...</p>}
            {upcomingCount > 0 && (
              <p className="text-danger small mb-0">
                <strong>{deleteTarget?.barberName}</strong> has {upcomingCount} upcoming appointment{upcomingCount === 1 ? "" : "s"}.
                They will remain on the books, but no new bookings will be possible for this barber once deleted.
              </p>
            )}
          </div>
        }
      />
    </div>
  );
};

function blankForm() {
  return {
    name: "", email: "", phone: "", shopName: "", city: "",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  };
}

export default AdminBarbersPage;
