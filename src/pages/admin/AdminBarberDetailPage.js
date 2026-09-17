import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Form, Button, Spinner, Badge } from "react-bootstrap";

import {
  fetchAdminBarberDetail,
  updateAdminBarber,
  deleteAdminBarber,
  suspendAdminBarber,
  reactivateAdminBarber,
  clearAdminBarberFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";
import BarberHoursEditor from "../../components/admin/BarberHoursEditor";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatMoney } from "../../utils/format";

const STATUS_BADGE = {
  pending_approval: { label: "Pending approval", className: "bb-badge-pending" },
  active: { label: "Active", className: "bb-badge-confirmed" },
  rejected: { label: "Rejected", className: "bb-badge-cancelled" },
  suspended: { label: "Suspended", className: "bb-badge-muted" },
};

const blankHours = () =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, isOpen: false, open: "09:00", close: "18:00", breakStart: "", breakEnd: "" }));

/**
 * Editing one barber as staff: everything the barber's own profile page can
 * change (see BarberProfilePage.js, the customer-facing equivalent), plus
 * time off and the publish/accepting toggles on their behalf -- see
 * adminBarberController.updateBarber for why there is no separate
 * "deactivate" endpoint: it is this same PATCH with both toggles off.
 */
const AdminBarberDetailPage = () => {
  const { barberId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    barberDetail, isLoadingBarberDetail, barberDetailError,
    isSavingBarber, barberError, barberFieldErrors, barberMessage,
    isDeletingBarber, barberDeleteError, isUpdatingBarberStatus,
  } = useSelector((state) => state.admin);

  const [form, setForm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminBarberDetail(barberId));
    return () => dispatch(clearAdminBarberFeedback());
  }, [dispatch, barberId]);

  useEffect(() => {
    if (!barberDetail) return;
    const { barber } = barberDetail;
    const profile = barber.profile || {};
    setForm({
      name: barber.name || "",
      phone: barber.phone || "",
      shopName: profile.shopName || "",
      bio: profile.bio || "",
      city: profile.city || "",
      addressLine: profile.addressLine || "",
      publicPhone: profile.publicPhone || "",
      timeZone: profile.timeZone || "",
      isPublished: Boolean(profile.isPublished),
      isAcceptingBookings: profile.isAcceptingBookings !== false,
      workingHours: profile.workingHours?.length === 7 ? profile.workingHours : blankHours(),
      timeOff: profile.timeOff || [],
    });
  }, [barberDetail]);

  const handleSave = (event) => {
    event.preventDefault();
    dispatch(updateAdminBarber(barberId, form));
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAdminBarber(barberId, () => navigate("/admin/barbers")));
  };

  if (isLoadingBarberDetail && !barberDetail) {
    return (
      <div className="d-flex align-items-center gap-3" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Loading barber.</span>
      </div>
    );
  }

  if (barberDetailError) return <Alert type="error">{barberDetailError}</Alert>;
  if (!barberDetail || !form) return null;

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminBarberFeedback())}>{barberError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminBarberFeedback())}>{barberMessage}</Alert>

      {barberDetail.barber.status && barberDetail.barber.status !== "active" && (
        <div>
          <Badge bg="" className={`bb-badge ${(STATUS_BADGE[barberDetail.barber.status] || STATUS_BADGE.active).className}`}>
            {(STATUS_BADGE[barberDetail.barber.status] || STATUS_BADGE.active).label}
          </Badge>
          {barberDetail.barber.status === "rejected" && barberDetail.barber.rejectionReason && (
            <span className="text-muted small ms-2">Reason: {barberDetail.barber.rejectionReason}</span>
          )}
        </div>
      )}

      <Row className="g-3">
        <Col md={4}><StatCard label="Today's appointments" value={barberDetail.todaysAppointmentsCount} /></Col>
        <Col md={4}><StatCard label="Weekly revenue" value={formatMoney(barberDetail.weeklyRevenueMinor, "GBP")} /></Col>
        <Col md={4}>
          <StatCard
            label="Rating"
            value={barberDetail.averageRating ? `${barberDetail.averageRating.toFixed(1)} / 5` : "No reviews yet"}
          />
        </Col>
      </Row>

      <Form onSubmit={handleSave} noValidate className="d-flex flex-column gap-3">
        <Card>
          <Card.Body>
            <Card.Title as="h2" className="h6 mb-3">Account</Card.Title>
            <Row>
              <Col md={6}>
                <FormField id="name" label="Full name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={barberFieldErrors.name} required />
              </Col>
              <Col md={6}>
                <FormField id="phone" label="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  error={barberFieldErrors.phone} required />
              </Col>
            </Row>
            <p className="text-muted small mb-0">Email: {barberDetail.barber.email} (not editable here)</p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title as="h2" className="h6 mb-3">Shop details</Card.Title>
            <FormField id="shopName" label="Shop name" value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              error={barberFieldErrors.shopName} required />
            <FormField id="city" label="City" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              error={barberFieldErrors.city} required />
            <FormField id="addressLine" label="Street address (optional)" value={form.addressLine}
              onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
            <FormField id="publicPhone" label="Public phone (optional)" value={form.publicPhone}
              onChange={(e) => setForm({ ...form, publicPhone: e.target.value })} />
            <FormField id="bio" label="About (optional)" as="textarea" rows={3} value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <FormField id="timeZone" label="Timezone" value={form.timeZone}
              onChange={(e) => setForm({ ...form, timeZone: e.target.value })}
              error={barberFieldErrors.timeZone} required />
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title as="h2" className="h6 mb-3">Visibility</Card.Title>
            <Form.Check
              type="checkbox" id="isPublished" className="mb-2"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              label="Published (visible to customers)"
            />
            <Form.Check
              type="checkbox" id="isAcceptingBookings"
              checked={form.isAcceptingBookings}
              onChange={(e) => setForm({ ...form, isAcceptingBookings: e.target.checked })}
              label="Accepting new bookings"
            />
            <p className="text-muted small mt-2 mb-0">
              Turning both off is the same as deactivating this barber -- their page and any booking button disappear, but their account and booking history stay intact.
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <Card.Title as="h2" className="h6 mb-3">Availability</Card.Title>
            <BarberHoursEditor
              workingHours={form.workingHours}
              timeOff={form.timeOff}
              onChangeHours={(workingHours) => setForm({ ...form, workingHours })}
              onChangeTimeOff={(timeOff) => setForm({ ...form, timeOff })}
              hoursError={barberFieldErrors.workingHours}
              timeOffError={barberFieldErrors.timeOff}
            />
          </Card.Body>
        </Card>

        <div className="d-flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={isSavingBarber}>
            {isSavingBarber ? "Saving..." : "Save changes"}
          </Button>
          <Button as={Link} to={`/admin/services?barberId=${barberId}`} variant="outline-dark">
            Manage services
          </Button>
          {barberDetail.barber.status === "suspended" || barberDetail.barber.status === "rejected" ? (
            <Button
              variant="outline-dark" disabled={isUpdatingBarberStatus}
              onClick={() => dispatch(reactivateAdminBarber(barberId))}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              variant="outline-dark" disabled={isUpdatingBarberStatus}
              onClick={() => dispatch(suspendAdminBarber(barberId))}
            >
              Suspend
            </Button>
          )}
          <Button variant="outline-danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete Barber
          </Button>
        </div>
      </Form>

      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete this barber?"
        confirmLabel="Delete Barber"
        isConfirming={isDeletingBarber}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        body={
          <div className="d-flex flex-column gap-2">
            <Alert type="error">{barberDeleteError}</Alert>
            <p className="mb-0">
              This will permanently remove the barber from VEYRON. Existing booking history must remain intact.
            </p>
            {barberDetail.upcomingBookingsCount > 0 && (
              <p className="text-danger small mb-0">
                This barber has {barberDetail.upcomingBookingsCount} upcoming appointment{barberDetail.upcomingBookingsCount === 1 ? "" : "s"}.
                They will remain on the books, but no new bookings will be possible for this barber once deleted.
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

export default AdminBarberDetailPage;
