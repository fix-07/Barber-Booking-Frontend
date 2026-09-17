import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Form, Badge, Spinner } from "react-bootstrap";

import {
  fetchAdminReviews,
  approveAdminReview,
  hideAdminReview,
  respondToAdminReview,
  deleteAdminReview,
  clearAdminReviewFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatDateTime } from "../../utils/format";

const STATUS_TABS = ["pending", "approved", "hidden"];

/**
 * Review moderation. This starts genuinely empty and stays that way until a
 * customer-facing review path exists -- see the note at the top of
 * server/models/Review.js. Nothing here is seeded or invented; the empty
 * state below is the honest, expected state for a new shop.
 */
const AdminReviewsPage = () => {
  const dispatch = useDispatch();
  const { reviews, isLoadingReviews, reviewsError, isSavingReview, reviewError, reviewMessage } =
    useSelector((state) => state.admin);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [responseDrafts, setResponseDrafts] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminReviews({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handleRespond = (reviewId) => {
    const text = responseDrafts[reviewId];
    if (!text) return;
    dispatch(respondToAdminReview(reviewId, text));
  };

  const handleConfirmDelete = () => {
    dispatch(deleteAdminReview(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminReviewFeedback())}>{reviewsError || reviewError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminReviewFeedback())}>{reviewMessage}</Alert>

      <div className="d-flex flex-wrap gap-2">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            type="button"
            className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-outline-secondary"}`}
            style={statusFilter !== status ? { color: "#3a3a33", borderColor: "#3a3a33" } : undefined}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoadingReviews && (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading reviews.</span>
        </div>
      )}

      {!isLoadingReviews && reviews.length === 0 && (
        <Card className="text-center border-2" style={{ borderStyle: "dashed" }}>
          <Card.Body className="py-5">
            <Card.Text className="mb-2">
              No {statusFilter} reviews.
            </Card.Text>
            <Card.Text className="text-muted small mb-0">
              Customers can leave reviews from their completed bookings on the My Bookings page. Reviews appear here once submitted.
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      {!isLoadingReviews && reviews.map((review) => (
        <Card key={review.id}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <strong>{review.customerName}</strong>
                <span className="text-muted small"> for {review.barberName}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge bg="" className="bb-badge bb-badge-pending">{review.rating} / 5</Badge>
              </div>
            </div>

            {review.comment && <p className="mb-2">{review.comment}</p>}
            <p className="text-muted small mb-3">{formatDateTime(review.createdAt)}</p>

            {review.adminResponse && (
              <p className="small mb-3"><strong>Your response:</strong> {review.adminResponse}</p>
            )}

            <div className="d-flex flex-wrap gap-2 mb-3">
              {review.status !== "approved" && (
                <Button variant="outline-dark" size="sm" disabled={isSavingReview}
                  onClick={() => dispatch(approveAdminReview(review.id))}>
                  Approve
                </Button>
              )}
              {review.status !== "hidden" && (
                <Button variant="outline-dark" size="sm" disabled={isSavingReview}
                  onClick={() => dispatch(hideAdminReview(review.id))}>
                  Hide
                </Button>
              )}
              <Button variant="outline-danger" size="sm" disabled={isSavingReview}
                onClick={() => setDeleteTarget(review)}>
                Delete
              </Button>
            </div>

            <Form.Group className="d-flex gap-2" controlId={`response-${review.id}`}>
              <Form.Control
                type="text"
                size="sm"
                placeholder="Write a response..."
                value={responseDrafts[review.id] ?? review.adminResponse ?? ""}
                onChange={(e) => setResponseDrafts({ ...responseDrafts, [review.id]: e.target.value })}
              />
              <Button variant="outline-dark" size="sm" onClick={() => handleRespond(review.id)} disabled={isSavingReview}>
                Save response
              </Button>
            </Form.Group>
          </Card.Body>
        </Card>
      ))}

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this review?"
        confirmLabel="Delete Review"
        isConfirming={isSavingReview}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <p className="mb-0">
            This will permanently delete the review by <strong>{deleteTarget?.customerName}</strong> for{" "}
            <strong>{deleteTarget?.barberName}</strong>. This action cannot be undone.
          </p>
        }
      />
    </div>
  );
};

export default AdminReviewsPage;
