import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Spinner,
} from "react-bootstrap";

import { fetchBarber } from "../actions/barberActions";
import {
  fetchAvailability,
  createBooking,
  clearAvailability,
  clearBookingFeedback,
} from "../actions/bookingActions";

import Alert from "../components/Alert";
import FormField from "../components/FormField";
import AppointmentPicker from "../components/AppointmentPicker";
import WhatsAppButton from "../components/WhatsAppButton";
import BarberMap from "../components/BarberMap";
import {
  formatMoney,
  formatDuration,
  formatDateTime,
  dayName,
} from "../utils/format";
import { formatDistanceToNow } from "date-fns";

/**
 * One barber's page, including the booking flow.
 *
 * The flow is four deliberate steps: pick a service, pick a date, pick a time,
 * confirm. Each step only appears once the previous one is answered, so there
 * is never a half-filled form with nothing to do.
 *
 * ACCESSIBILITY NOTES FOR THE SLOT PICKER:
 *
 * - Each slot is a real <Button> in a list item, so Tab reaches every one and
 *   Enter or Space activates it. Clickable <div>s would be invisible to the
 *   keyboard.
 *
 * - The chosen slot uses aria-pressed, the correct attribute for a button that
 *   stays switched on. A screen reader then says "10:15, pressed".
 *
 * - A taken slot is a disabled button with the word "booked" in its accessible
 *   name, not merely a grey colour.
 *
 * - Times are shown in the SHOP'S timezone, named on screen. If a customer is
 *   travelling, 10:00 must still mean 10:00 at the shop.
 */
const BarberDetailPage = () => {
  const { barberId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { current, isLoadingOne, errorOne } = useSelector(
    (state) => state.barbers
  );
  const { availability, isLoadingSlots, isSaving, error, message } = useSelector(
    (state) => state.bookings
  );
  const { user } = useSelector((state) => state.auth);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    dispatch(fetchBarber(barberId));
    dispatch(clearAvailability());
    dispatch(clearBookingFeedback());
  }, [dispatch, barberId]);

  // Load slots whenever both a service and a date are chosen.
  useEffect(() => {
    setSlot("");
    if (serviceId && date) {
      dispatch(fetchAvailability(barberId, serviceId, date));
    } else {
      dispatch(clearAvailability());
    }
  }, [dispatch, barberId, serviceId, date]);

  if (isLoadingOne) {
    return (
      <Container className="py-5">
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading this barber's page.</span>
        </div>
      </Container>
    );
  }

  if (errorOne || !current) {
    return (
      <Container className="py-5">
        <h1>Barber not found</h1>
        <p>
          This barber's page is not available. They may have removed their
          listing.
        </p>
        <Button as={Link} to="/barbers" variant="outline-dark">
          Back to all barbers
        </Button>
      </Container>
    );
  }

  const { barber, services, averageRating, reviewCount, reviews = [] } = current;
  const chosenService = services.find((item) => item.id === serviceId);

  const handleBook = (event) => {
    event.preventDefault();
    dispatch(
      createBooking({ serviceId, startAt: slot, customerNote: note }, () => {
        navigate("/my-bookings");
      })
    );
  };

  // A customer must be logged in to book. A barber cannot book a chair.
  const canBook = user && user.role === "customer";
  const bookingOpen = canBook && barber.isAcceptingBookings !== false;

  return (
    <>
      <Container className="pt-5 pb-4">
        <h1 className="mb-1">{barber.shopName}</h1>
        <p className="text-muted">
          {barber.city}
          {barber.barberName ? ` — ${barber.barberName}` : ""}
        </p>
      </Container>

      <Container className="pb-5">
        {/* Bootstrap's grid collapses to one column below lg automatically,
            so the booking form comes first on a phone. */}
        <Row className="g-4">
          {/* ----------------------- Main column ----------------------- */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title as="h2" className="h5">
                  About this barber
                </Card.Title>
                {barber.bio ? (
                  <Card.Text className="mb-0">{barber.bio}</Card.Text>
                ) : (
                  <Card.Text className="text-muted mb-0">
                    This barber has not added a description yet.
                  </Card.Text>
                )}
              </Card.Body>

              {(barber.addressLine || barber.publicPhone) && (
                <Card.Footer className="bg-white">
                  {barber.addressLine && (
                    <div className="mb-1">
                      <strong>Address:</strong> {barber.addressLine}
                      {barber.city ? `, ${barber.city}` : ""}
                    </div>
                  )}
                  {barber.publicPhone && (
                    <div className="mb-2">
                      <strong>Phone:</strong>{" "}
                      <a href={`tel:${barber.publicPhone.replace(/\s/g, "")}`}>
                        {barber.publicPhone}
                      </a>
                    </div>
                  )}
                  {barber.publicPhone && (
                    <WhatsAppButton
                      phone={barber.publicPhone}
                      message={`Hi ${barber.shopName || ""}, I found you on VEYRON.`}
                      className="btn-sm"
                    />
                  )}
                </Card.Footer>
              )}
            </Card>

            {barber.locationConfirmed && barber.latitude && barber.longitude && (
              <BarberMap
                latitude={barber.latitude}
                longitude={barber.longitude}
                label={barber.shopName}
              />
            )}

            {/* ----------------------- Reviews ----------------------- */}
            {(reviewCount > 0 || reviews.length > 0) && (
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title as="h2" className="h5 mb-1">
                    Customer reviews
                  </Card.Title>
                  {averageRating && (
                    <p className="text-muted small mb-3">
                      <strong>{averageRating.toFixed(1)} / 5</strong>
                      {" "}— {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </p>
                  )}

                  {reviews.length === 0 && (
                    <p className="text-muted small mb-0">No approved reviews yet.</p>
                  )}

                  {reviews.length > 0 && (
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                      {reviews.map((review) => (
                        <li key={review.id} className="border-bottom pb-3">
                          <div className="d-flex justify-content-between align-items-baseline gap-2">
                            <strong className="small">{review.customerName}</strong>
                            <span className="text-muted small">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="text-muted small mb-1">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                          {review.comment && <p className="small mb-1">{review.comment}</p>}
                          {review.adminResponse && (
                            <p className="small mb-0 text-muted">
                              <strong>Shop response:</strong> {review.adminResponse}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* ----------------------- Booking ----------------------- */}
            <Card>
              <Card.Body>
                <Card.Title as="h2" className="h5 mb-3">
                  Book an appointment
                </Card.Title>

                <Alert
                  type="error"
                  onDismiss={() => dispatch(clearBookingFeedback())}
                >
                  {error}
                </Alert>
                <Alert type="success">{message}</Alert>

                {services.length === 0 && (
                  <p className="text-muted mb-0">
                    This barber has not listed any services yet, so there is
                    nothing to book.
                  </p>
                )}

                {services.length > 0 && barber.isAcceptingBookings === false && (
                  <Alert type="info">
                    This barber is not accepting new bookings at the moment. You
                    can still see their services and prices.
                  </Alert>
                )}

                {services.length > 0 && !canBook && (
                  <Alert type="info">
                    {!user ? (
                      <>
                        <Link to="/login">Log in</Link> or{" "}
                        <Link to="/register">create a customer account</Link> to
                        book an appointment.
                      </>
                    ) : (
                      <>
                        You are signed in as a barber account. Bookings can only
                        be made from a customer account.
                      </>
                    )}
                  </Alert>
                )}

                {services.length > 0 && (
                  <Form onSubmit={handleBook} noValidate>
                    {/* Step 1: service */}
                    <fieldset className="mb-4">
                      <legend className="h6 fw-semibold">
                        1. Choose a service
                      </legend>

                      {/* Radio buttons rather than a dropdown, so every price
                          and duration is visible at once. A customer should not
                          have to open a menu to compare prices. */}
                      {services.map((service) => (
                        <Form.Check
                          key={service.id}
                          type="radio"
                          id={`service-${service.id}`}
                          name="serviceId"
                          value={service.id}
                          checked={serviceId === service.id}
                          onChange={(event) => setServiceId(event.target.value)}
                          disabled={!bookingOpen}
                          className="mb-3"
                          label={
                            <>
                              <strong>{service.name}</strong>
                              {" — "}
                              <span className="fw-semibold">
                                {formatMoney(service.priceMinor, service.currency)}
                              </span>
                              {", "}
                              {formatDuration(service.durationMinutes)}
                              {service.description && (
                                <>
                                  <br />
                                  <span className="text-muted small">
                                    {service.description}
                                  </span>
                                </>
                              )}
                            </>
                          }
                        />
                      ))}
                    </fieldset>

                    {/* Steps 2 and 3: date and time, in one picker.

                        This replaces a plain <input type="date"> plus a grid of
                        buttons. A calendar makes the barber's closed days
                        visible before you click, which the date input could not
                        do, and it keeps the day and the times side by side. */}
                    {serviceId && bookingOpen && (
                      <div className="mb-4">
                        <p className="h6 fw-semibold mb-2">
                          2. Choose a date and time
                        </p>

                        <AppointmentPicker
                          date={date}
                          onDateChange={setDate}
                          workingHours={barber.workingHours}
                          availability={availability}
                          isLoadingSlots={isLoadingSlots}
                          selectedSlot={slot}
                          onSlotSelect={setSlot}
                        />
                      </div>
                    )}


                    {/*
                      Step 4: confirm.

                      The `availability &&` guard is not decoration. When a
                      booking succeeds the reducer sets availability back to
                      null on purpose, because the slot list it holds is now out
                      of date. But React re-renders once with the new state
                      BEFORE the redirect happens, and `slot` is still set.
                      Without this guard that render reads availability.timeZone
                      on null and throws. I hit exactly this while testing.
                    */}
                    {slot && chosenService && availability && (
                      <>
                        <FormField
                          id="customerNote"
                          label="4. Anything the barber should know? (optional)"
                          type="textarea"
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          rows={3}
                          hint="For example, which style you want. Please do not put health or payment details here."
                        />

                        {/* A plain summary of exactly what is about to happen.
                            No countdown, no "hurry", no invented scarcity. */}
                        <Alert type="info">
                          <p className="mb-1">
                            <strong>You are requesting:</strong>
                          </p>
                          <p className="mb-1">
                            {chosenService.name},{" "}
                            {formatDuration(chosenService.durationMinutes)}, at{" "}
                            {formatMoney(
                              chosenService.priceMinor,
                              chosenService.currency
                            )}
                          </p>
                          <p className="mb-1">
                            {formatDateTime(slot, availability.timeZone)} (
                            {availability.timeZone})
                          </p>
                          <p className="mb-0">
                            The barber needs to confirm this before it is agreed.
                            No payment is taken on this site.
                          </p>
                        </Alert>

                        <Button type="submit" variant="primary" disabled={isSaving}>
                          {isSaving
                            ? "Sending request..."
                            : "Request this appointment"}
                        </Button>
                      </>
                    )}
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* ----------------------- Side column ----------------------- */}
          <Col lg={4}>
            <Card className="bb-dark-card mb-4">
              <Card.Body>
                <Card.Title as="h2" className="h6">
                  Opening hours
                </Card.Title>
              </Card.Body>

              <ListGroup variant="flush">
                {(barber.workingHours || [])
                  .slice()
                  // Monday first reads more naturally, even though day 0 is
                  // Sunday in the data.
                  .sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7))
                  .map((entry) => (
                    <ListGroup.Item
                      key={entry.day}
                      className="d-flex justify-content-between small"
                    >
                      <span className="fw-semibold">{dayName(entry.day)}</span>
                      <span>
                        {entry.isOpen
                          ? `${entry.open} to ${entry.close}`
                          : "Closed"}
                      </span>
                    </ListGroup.Item>
                  ))}
              </ListGroup>

              <Card.Body>
                <Card.Text className="small mb-0" style={{ color: "#a9a9b2" }}>
                  Timezone: {barber.timeZone}
                </Card.Text>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <Card.Title as="h2" className="h6">
                  Services and prices
                </Card.Title>
              </Card.Body>

              {services.length === 0 ? (
                <Card.Body className="pt-0">
                  <Card.Text className="text-muted mb-0">
                    No services listed yet.
                  </Card.Text>
                </Card.Body>
              ) : (
                <ListGroup variant="flush">
                  {services.map((service) => (
                    <ListGroup.Item
                      key={service.id}
                      className="d-flex justify-content-between gap-3"
                    >
                      <span>
                        {service.name}
                        <br />
                        <span className="text-muted small">
                          {formatDuration(service.durationMinutes)}
                        </span>
                      </span>
                      <span className="fw-bold text-nowrap">
                        {formatMoney(service.priceMinor, service.currency)}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BarberDetailPage;
