import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap";

import {
  fetchMyBookings,
  cancelBooking,
  clearBookingFeedback,
} from "../actions/bookingActions";
import {
  fetchMyReviews,
  submitReview,
  clearReviewFeedback,
} from "../actions/reviewActions";

import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import BarberPageHead from "../components/BarberPageHead";
import { formatMoney, formatDateTime, formatDuration } from "../utils/format";

/**
 * A customer's own bookings.
 *
 * The server only ever returns bookings belonging to the logged-in customer, so
 * there is nothing here filtering other people's data out: it never arrives in
 * the first place. That is the right way round. Filtering in the browser would
 * mean the data had already been sent and could be read in devtools.
 */
const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const { mine, isLoadingMine, error, message, isSaving } = useSelector(
    (state) => state.bookings
  );
  const {
    myReviews,
    isSubmitting,
    error: reviewError,
    message: reviewMessage,
  } = useSelector((state) => state.reviews);

  // Which booking is showing its "are you sure" panel.
  const [confirmingId, setConfirmingId] = useState(null);
  const [reason, setReason] = useState("");

  // Which booking is showing the review form.
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchMyReviews());
    return () => {
      dispatch(clearBookingFeedback());
      dispatch(clearReviewFeedback());
    };
  }, [dispatch]);

  const handleCancel = (bookingId) => {
    dispatch(cancelBooking(bookingId, reason));
    setConfirmingId(null);
    setReason("");
  };

  const handleReviewSubmit = (bookingId) => {
    dispatch(
      submitReview(bookingId, reviewRating, reviewComment, () => {
        setReviewingId(null);
        setReviewRating(5);
        setReviewComment("");
        // Refresh the review list so the button disappears for this booking.
        dispatch(fetchMyReviews());
      })
    );
  };

  // Build a Set of booking ids that already have a review.
  const reviewedBookingIds = new Set(
    myReviews.map((r) => (r.bookingId ? String(r.bookingId) : null)).filter(Boolean)
  );

  const now = Date.now();

  const upcoming = mine.filter(
    (booking) =>
      new Date(booking.startAt).getTime() >= now &&
      !booking.status.startsWith("cancelled")
  );
  const past = mine.filter(
    (booking) =>
      new Date(booking.startAt).getTime() < now ||
      booking.status.startsWith("cancelled")
  );

  const renderBooking = (booking, allowCancel) => {
    const alreadyReviewed = reviewedBookingIds.has(String(booking.id));
    const canReview = booking.status === "completed" && !alreadyReviewed;

    return (
      <Col as="li" key={booking.id} md={6} lg={4}>
        <Card className={`h-100 ${allowCancel ? "v-card" : "v-card--muted"}`}>
          <Card.Body className="d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <Card.Title as="h3" className="h6 mb-1">
                  {booking.serviceName}
                </Card.Title>
                <Card.Subtitle className="text-muted fw-normal small">
                  with {booking.barberName || "your barber"}
                </Card.Subtitle>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* A description list is the right element for label/value pairs.
                A screen reader reads "When: Monday 1 June, 10:00" as a pair. */}
            <dl className="row mb-0 small">
              <dt className="col-5">When:</dt>
              <dd className="col-7">{formatDateTime(booking.startAt)}</dd>

              <dt className="col-5">Length:</dt>
              <dd className="col-7">{formatDuration(booking.durationMinutes)}</dd>

              <dt className="col-5">Price agreed:</dt>
              <dd className="col-7 mb-0">
                {formatMoney(booking.priceMinor, booking.currency)}
              </dd>
            </dl>

            {booking.customerNote && (
              <p className="text-muted small mt-3 mb-0">
                Your note: {booking.customerNote}
              </p>
            )}

            {booking.status === "cancelled_by_barber" &&
              booking.cancellationReason && (
                <p className="small mt-3 mb-0">
                  <strong>Barber's reason:</strong> {booking.cancellationReason}
                </p>
              )}

            {alreadyReviewed && booking.status === "completed" && (
              <p className="text-muted small mt-3 mb-0">You reviewed this appointment.</p>
            )}

            {allowCancel && (
              <div className="mt-auto pt-3">
                {confirmingId === booking.id ? (
                  /* An inline confirm step rather than a browser confirm()
                     dialog. window.confirm cannot be styled, reads poorly to
                     screen readers, and leaves no room to explain what happens
                     next. */
                  <div className="v-card-inset">
                    <p className="small mb-2">
                      <strong>Cancel this appointment?</strong> This cannot be
                      undone, and the time will be released for someone else.
                    </p>

                    <Form.Group className="mb-2" controlId={`reason-${booking.id}`}>
                      <Form.Label className="small">Reason (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={300}
                      />
                    </Form.Group>

                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={isSaving}
                      >
                        Yes, cancel this booking
                      </Button>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => {
                          setConfirmingId(null);
                          setReason("");
                        }}
                      >
                        Keep my booking
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setConfirmingId(booking.id)}
                  >
                    Cancel booking
                    {/* Names WHICH booking. A page of identical "Cancel booking"
                        buttons is unusable with a screen reader. */}
                    <span className="visually-hidden">
                      : {booking.serviceName} on {formatDateTime(booking.startAt)}
                    </span>
                  </Button>
                )}
              </div>
            )}

            {canReview && (
              <div className="mt-auto pt-3">
                {reviewingId === booking.id ? (
                  <div className="v-card-inset">
                    <p className="small mb-2">
                      <strong>Leave a review</strong> for {booking.barberName || "your barber"}
                    </p>

                    <Form.Group className="mb-2" controlId={`rating-${booking.id}`}>
                      <Form.Label className="small">Rating</Form.Label>
                      <div className="d-flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Form.Check
                            key={star}
                            inline
                            type="radio"
                            id={`star-${booking.id}-${star}`}
                            name={`rating-${booking.id}`}
                            label={star}
                            value={star}
                            checked={reviewRating === star}
                            onChange={() => setReviewRating(star)}
                          />
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-2" controlId={`comment-${booking.id}`}>
                      <Form.Label className="small">Comment (optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        size="sm"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        maxLength={1000}
                        placeholder="Tell others about your experience..."
                      />
                    </Form.Group>

                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReviewSubmit(booking.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit review"}
                      </Button>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => {
                          setReviewingId(null);
                          setReviewRating(5);
                          setReviewComment("");
                          dispatch(clearReviewFeedback());
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline-dark"
                    size="sm"
                    onClick={() => {
                      setReviewingId(booking.id);
                      setReviewRating(5);
                      setReviewComment("");
                    }}
                  >
                    Write a review
                    <span className="visually-hidden">
                      {" "}for {booking.serviceName} on {formatDateTime(booking.startAt)}
                    </span>
                  </Button>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <Container className="py-5">
      <BarberPageHead
        eyebrow="Your appointments"
        title="My bookings"
        lede="Everything you've booked, and how to leave a review once it's done."
      />

      <Alert type="error" onDismiss={() => dispatch(clearBookingFeedback())}>
        {error}
      </Alert>
      <Alert type="success" onDismiss={() => dispatch(clearBookingFeedback())}>
        {message}
      </Alert>
      <Alert type="error" onDismiss={() => dispatch(clearReviewFeedback())}>
        {reviewError}
      </Alert>
      <Alert type="success" onDismiss={() => dispatch(clearReviewFeedback())}>
        {reviewMessage}
      </Alert>

      {isLoadingMine && (
        <div className="v-loading-row" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading your bookings.</span>
        </div>
      )}

      {!isLoadingMine && mine.length === 0 && (
        <div className="v-empty-state">
          <p className="mb-4">You have no bookings yet.</p>
          <Button as={Link} to="/barbers" variant="primary">
            Find a barber
          </Button>
        </div>
      )}

      {!isLoadingMine && mine.length > 0 && (
        <div className="v-summary-strip">
          <div className="v-summary-item">
            <span className="v-summary-value">{upcoming.length}</span>
            <span className="v-summary-label">Upcoming</span>
          </div>
          <div className="v-summary-item">
            <span className="v-summary-value">{past.length}</span>
            <span className="v-summary-label">Past &amp; cancelled</span>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 mb-3">Upcoming</h2>
          <Row as="ul" className="list-unstyled g-4">
            {upcoming.map((booking) => renderBooking(booking, true))}
          </Row>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="h4 mb-3">Past and cancelled</h2>
          <Row as="ul" className="list-unstyled g-4">
            {past.map((booking) => renderBooking(booking, false))}
          </Row>
        </section>
      )}
    </Container>
  );
};

export default MyBookingsPage;
