import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Button, Badge, Spinner, Modal, Form } from "react-bootstrap";

import {
  fetchBarberApplications,
  approveBarberApplication,
  rejectBarberApplication,
  deleteBarberApplication,
  clearBarberApplicationFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatDateTime } from "../../utils/format";

const TABS = [
  { key: "pending_approval", label: "Pending" },
  { key: "active", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_BADGE = {
  pending_approval: { label: "Pending", className: "bb-badge-pending" },
  active: { label: "Approved", className: "bb-badge-confirmed" },
  rejected: { label: "Rejected", className: "bb-badge-cancelled" },
  suspended: { label: "Suspended", className: "bb-badge-muted" },
};

const Initials = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  return (
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{
        width: 48, height: 48, borderRadius: "50%",
        backgroundColor: "var(--bb-black)", color: "var(--bb-gold)",
        fontWeight: 700, fontSize: "0.95rem",
      }}
      aria-hidden="true"
    >
      {initials || "?"}
    </div>
  );
};

/**
 * Admin -> Barber Approvals. New barber applications land here as
 * PENDING_APPROVAL (see authController.register) and cannot use the barber
 * dashboard or receive bookings until decided here -- the server enforces
 * that independently via requireActiveBarber (middleware/auth.js) no matter
 * what this page does.
 *
 * Suspend/reactivate for already-active barbers lives on the Barbers page
 * instead (AdminBarbersPage.js) -- this page is specifically the new-
 * application review queue: Pending / Approved / Rejected, matching the
 * spec's card layout.
 */
const AdminBarberApprovalsPage = () => {
  const dispatch = useDispatch();
  const {
    barberApplications, isLoadingBarberApplications, barberApplicationsError,
    isDecidingBarberApplication, barberApplicationError, barberApplicationMessage,
  } = useSelector((state) => state.admin);

  const [tab, setTab] = useState("pending_approval");
  const [viewTarget, setViewTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchBarberApplications({ status: tab, limit: 100 }));
  }, [dispatch, tab]);

  const openReject = (application) => {
    setRejectReason("");
    setRejectTarget(application);
  };

  const handleApprove = () => {
    dispatch(approveBarberApplication(approveTarget.id, () => setApproveTarget(null)));
  };

  const handleReject = () => {
    dispatch(rejectBarberApplication(rejectTarget.id, rejectReason, () => setRejectTarget(null)));
  };

  const handleConfirmDelete = () => {
    dispatch(deleteBarberApplication(deleteTarget.id, () => setDeleteTarget(null)));
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearBarberApplicationFeedback())}>
        {barberApplicationsError || barberApplicationError}
      </Alert>
      <Alert type="success" onDismiss={() => dispatch(clearBarberApplicationFeedback())}>
        {barberApplicationMessage}
      </Alert>

      <div className="d-flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-outline-secondary"}`}
            style={tab !== t.key ? { color: "#3a3a33", borderColor: "#3a3a33" } : undefined}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoadingBarberApplications && (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading applications.</span>
        </div>
      )}

      {!isLoadingBarberApplications && barberApplications.length === 0 && (
        <Card className="text-center border-2" style={{ borderStyle: "dashed" }}>
          <Card.Body className="py-5">
            <Card.Text className="mb-0">
              No {TABS.find((t) => t.key === tab)?.label.toLowerCase()} applications.
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <Row className="g-3">
        {barberApplications.map((application) => {
          const badge = STATUS_BADGE[application.status] || STATUS_BADGE.pending_approval;
          return (
            <Col key={application.id} md={6} xl={4}>
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      {application.photoUrl ? (
                        <img
                          src={application.photoUrl}
                          alt=""
                          width={48}
                          height={48}
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <Initials name={application.name} />
                      )}
                      <div>
                        <Card.Title as="h2" className="h6 mb-0">{application.name}</Card.Title>
                        <Card.Subtitle className="text-muted small fw-normal">
                          {application.shopName || "No shop name yet"}
                        </Card.Subtitle>
                      </div>
                    </div>
                    <Badge bg="" className={`bb-badge ${badge.className}`}>{badge.label}</Badge>
                  </div>

                  <dl className="row small mb-3">
                    <dt className="col-5">Email</dt>
                    <dd className="col-7 text-end text-truncate">{application.email}</dd>
                    <dt className="col-5">Phone</dt>
                    <dd className="col-7 text-end">{application.phone}</dd>
                    <dt className="col-5">Applied</dt>
                    <dd className="col-7 text-end">{formatDateTime(application.appliedAt)}</dd>
                  </dl>

                  {application.specialties?.length > 0 && (
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {application.specialties.map((s) => (
                        <Badge key={s} bg="" className="bb-badge bb-badge-muted">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {application.status === "rejected" && application.rejectionReason && (
                    <p className="small text-danger mb-3">Reason: {application.rejectionReason}</p>
                  )}

                  <div className="mt-auto d-flex flex-wrap gap-2">
                    <Button variant="outline-dark" size="sm" onClick={() => setViewTarget(application)}>
                      View Details
                    </Button>
                    {application.status === "pending_approval" && (
                      <>
                        <Button variant="primary" size="sm" onClick={() => setApproveTarget(application)}>
                          Approve
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => openReject(application)}>
                          Reject
                        </Button>
                      </>
                    )}
                    {(application.status === "pending_approval" || application.status === "rejected") && (
                      <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(application)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* View Details */}
      <Modal show={Boolean(viewTarget)} onHide={() => setViewTarget(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">{viewTarget?.name}</Modal.Title>
        </Modal.Header>
        {viewTarget && (
          <Modal.Body>
            <dl className="row small mb-0">
              <dt className="col-4">Email</dt>
              <dd className="col-8">{viewTarget.email}</dd>
              <dt className="col-4">Phone</dt>
              <dd className="col-8">{viewTarget.phone}</dd>
              <dt className="col-4">Applied</dt>
              <dd className="col-8">{formatDateTime(viewTarget.appliedAt)}</dd>
              <dt className="col-4">Shop name</dt>
              <dd className="col-8">{viewTarget.shopName || "—"}</dd>
              <dt className="col-4">City</dt>
              <dd className="col-8">{viewTarget.city || "—"}</dd>
              <dt className="col-4">Timezone</dt>
              <dd className="col-8">{viewTarget.timeZone || "—"}</dd>
              <dt className="col-4">Experience</dt>
              <dd className="col-8">{viewTarget.experience || "Not provided"}</dd>
              <dt className="col-4">Specialties</dt>
              <dd className="col-8">
                {viewTarget.specialties?.length > 0 ? viewTarget.specialties.join(", ") : "Not provided"}
              </dd>
              <dt className="col-4">Requested services</dt>
              <dd className="col-8">
                {viewTarget.requestedServices?.length > 0 ? viewTarget.requestedServices.join(", ") : "Not provided"}
              </dd>
              <dt className="col-4">About</dt>
              <dd className="col-8">{viewTarget.bio || "Not provided"}</dd>
            </dl>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="outline-dark" onClick={() => setViewTarget(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={Boolean(approveTarget)}
        title="Approve this barber?"
        confirmLabel="Approve Barber"
        confirmVariant="primary"
        isConfirming={isDecidingBarberApplication}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
        body={
          <p className="mb-0">
            <strong>{approveTarget?.name}</strong> will be able to log in, use the barber dashboard, and take bookings on VEYRON immediately.
          </p>
        }
      />

      <ConfirmModal
        show={Boolean(rejectTarget)}
        title="Reject this application?"
        confirmLabel="Reject Application"
        isConfirming={isDecidingBarberApplication}
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
        body={
          <div className="d-flex flex-column gap-2">
            <p className="mb-0">
              <strong>{rejectTarget?.name}</strong> will not be able to access the barber dashboard. They can edit and resubmit their application.
            </p>
            <Form.Group controlId="rejectReason">
              <Form.Label className="small">Reason (optional, shown to the applicant)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={500}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </Form.Group>
          </div>
        }
      />

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this application?"
        confirmLabel="Delete Application"
        isConfirming={isDecidingBarberApplication}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <p className="mb-0">
            This permanently deletes <strong>{deleteTarget?.name}</strong>'s account and application. This
            action cannot be undone.
          </p>
        }
      />
    </div>
  );
};

export default AdminBarberApprovalsPage;
