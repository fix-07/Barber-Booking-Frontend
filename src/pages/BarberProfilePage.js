import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";

import { fetchMyProfile, saveMyProfile } from "../actions/barberActions";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import BarberPageHead from "../components/BarberPageHead";
import { dayName } from "../utils/format";

/** Every day closed by default. The barber opts each day in themselves. */
const blankHours = () =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    isOpen: false,
    open: "09:00",
    close: "17:00",
  }));

/**
 * A barber edits their own shop profile.
 *
 * OWNERSHIP: there is no barber id anywhere on this page. It loads from
 * GET /api/barbers/me and saves to PUT /api/barbers/me, and the server works
 * out whose profile that is from the login cookie. A barber cannot edit another
 * barber's shop because there is nowhere to put another barber's id.
 *
 * WHY THE TIMEZONE FIELD EXISTS, since it looks like an odd thing to ask:
 * "I open at 09:00" is a local clock time at your shop. A booking is stored as
 * a moment in time. Without knowing your timezone the server cannot tell
 * whether a particular moment falls inside your opening hours, and customers
 * get told you are closed when you are open. We pre-fill it from the browser,
 * which is right nearly always.
 */
const BarberProfilePage = () => {
  const dispatch = useDispatch();
  const {
    myProfile,
    isLoadingMine,
    isSaving,
    errorMine,
    fieldErrors,
    saveMessage,
  } = useSelector((state) => state.barbers);

  const [form, setForm] = useState({
    shopName: "",
    bio: "",
    city: "",
    addressLine: "",
    publicPhone: "",
    // Ask the browser what timezone this computer is in. Almost always right,
    // and the barber can change it.
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    isPublished: false,
    isAcceptingBookings: true,
    workingHours: blankHours(),
  });

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  // Fill the form once the saved profile arrives.
  useEffect(() => {
    if (!myProfile) return;

    setForm({
      shopName: myProfile.shopName || "",
      bio: myProfile.bio || "",
      city: myProfile.city || "",
      addressLine: myProfile.addressLine || "",
      publicPhone: myProfile.publicPhone || "",
      timeZone: myProfile.timeZone || "",
      isPublished: Boolean(myProfile.isPublished),
      isAcceptingBookings: myProfile.isAcceptingBookings !== false,
      workingHours:
        myProfile.workingHours && myProfile.workingHours.length === 7
          ? myProfile.workingHours.map((entry) => ({
              day: entry.day,
              isOpen: Boolean(entry.isOpen),
              open: entry.open,
              close: entry.close,
            }))
          : blankHours(),
    });
  }, [myProfile]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleHourChange = (day, key, value) => {
    setForm({
      ...form,
      workingHours: form.workingHours.map((entry) =>
        entry.day === day ? { ...entry, [key]: value } : entry
      ),
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(saveMyProfile(form));
  };

  if (isLoadingMine && !myProfile) {
    return (
      <Container className="py-5">
        <div className="v-loading-row" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading your shop profile.</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <BarberPageHead
        eyebrow="Your shop"
        title="Shop profile"
        lede="This is what customers see. You control whether it appears in search results at all."
      />

      <Alert type="error">{errorMine}</Alert>
      <Alert type="success">{saveMessage}</Alert>

      {!myProfile && (
        <Alert type="info">
          You have not set up your shop yet. Fill this in and publish it so
          customers can find you.
        </Alert>
      )}

      <Row>
        <Col lg={9} xl={8}>
          <Form onSubmit={handleSubmit} noValidate>
            {/* ------------------------ Shop details ------------------------ */}
            <Card className="v-card mb-4">
              <Card.Body>
                <fieldset>
                  <legend className="v-fieldset-legend">Shop details</legend>

                  <FormField
                    id="shopName"
                    label="Shop or business name"
                    value={form.shopName}
                    onChange={handleChange}
                    error={fieldErrors.shopName}
                    required
                  />

                  <FormField
                    id="city"
                    label="Town or city"
                    value={form.city}
                    onChange={handleChange}
                    error={fieldErrors.city}
                    required
                    autoComplete="address-level2"
                    hint="Customers search by this, so use the name people would type."
                  />

                  <FormField
                    id="addressLine"
                    label="Street address (optional)"
                    value={form.addressLine}
                    onChange={handleChange}
                    error={fieldErrors.addressLine}
                    hint="Leave blank if you would rather not publish it, for example if you are mobile or share a space."
                  />

                  <FormField
                    id="publicPhone"
                    label="Contact phone to publish (optional)"
                    type="tel"
                    value={form.publicPhone}
                    onChange={handleChange}
                    error={fieldErrors.publicPhone}
                    hint="Shown publicly on your page. Separate from the phone on your account, which stays private. Leave blank to publish nothing."
                  />

                  <FormField
                    id="bio"
                    label="About your shop (optional)"
                    type="textarea"
                    value={form.bio}
                    onChange={handleChange}
                    error={fieldErrors.bio}
                    rows={4}
                    hint="Describe what you actually offer. Please keep it factual: no invented awards, ratings or customer numbers."
                  />

                  <FormField
                    id="timeZone"
                    label="Shop timezone"
                    value={form.timeZone}
                    onChange={handleChange}
                    error={fieldErrors.timeZone}
                    required
                    hint="For example Europe/London, America/New_York or Asia/Karachi. We filled this in from your computer. Your opening hours are read in this timezone."
                  />
                </fieldset>
              </Card.Body>
            </Card>

            {/* ------------------------ Opening hours ----------------------- */}
            <Card className="v-card mb-4">
              <Card.Body>
                <fieldset>
                  <legend className="v-fieldset-legend">Opening hours</legend>

                  <p className="text-muted small">
                    Tick each day you are open. Customers can only book inside
                    these hours, and an appointment must finish before you close.
                  </p>

                  {form.workingHours
                    .slice()
                    // Monday first reads more naturally, even though day 0 is
                    // Sunday in the data.
                    .sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7))
                    .map((entry) => (
                      <Row
                        key={entry.day}
                        className="v-hours-row align-items-end g-2"
                      >
                        <Col xs={12} sm={4}>
                          <Form.Check
                            type="checkbox"
                            id={`open-${entry.day}`}
                            checked={entry.isOpen}
                            onChange={(event) =>
                              handleHourChange(
                                entry.day,
                                "isOpen",
                                event.target.checked
                              )
                            }
                            label={dayName(entry.day)}
                          />
                        </Col>

                        {/* Time inputs are disabled on a closed day, so there is
                            no pointless field to fill in. */}
                        <Col xs={6} sm={4}>
                          <Form.Group controlId={`from-${entry.day}`}>
                            <Form.Label className="small mb-1">Opens</Form.Label>
                            <Form.Control
                              type="time"
                              size="sm"
                              value={entry.open}
                              disabled={!entry.isOpen}
                              onChange={(event) =>
                                handleHourChange(
                                  entry.day,
                                  "open",
                                  event.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>

                        <Col xs={6} sm={4}>
                          <Form.Group controlId={`to-${entry.day}`}>
                            <Form.Label className="small mb-1">Closes</Form.Label>
                            <Form.Control
                              type="time"
                              size="sm"
                              value={entry.close}
                              disabled={!entry.isOpen}
                              onChange={(event) =>
                                handleHourChange(
                                  entry.day,
                                  "close",
                                  event.target.value
                                )
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    ))}

                  {fieldErrors.workingHours && (
                    <p className="text-danger small fw-semibold mt-3 mb-0">
                      {fieldErrors.workingHours}
                    </p>
                  )}
                </fieldset>
              </Card.Body>
            </Card>

            {/* ------------------------- Visibility -------------------------- */}
            <Card className="v-card mb-4">
              <Card.Body>
                <fieldset>
                  <legend className="v-fieldset-legend">Visibility</legend>

                  <Form.Check
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                    className="mb-3"
                    label={
                      <>
                        <strong>Show my shop in search results</strong>
                        <br />
                        <span className="text-muted small">
                          While this is off, nobody can find your page or book
                          with you. Turn it on when your services and hours are
                          ready.
                        </span>
                      </>
                    }
                  />

                  <Form.Check
                    type="checkbox"
                    id="isAcceptingBookings"
                    name="isAcceptingBookings"
                    checked={form.isAcceptingBookings}
                    onChange={handleChange}
                    label={
                      <>
                        <strong>Accept new bookings</strong>
                        <br />
                        <span className="text-muted small">
                          Turn this off while you are away. Your page stays
                          visible but nobody can book a new appointment.
                        </span>
                      </>
                    }
                  />
                </fieldset>
              </Card.Body>
            </Card>

            <div className="d-flex flex-wrap gap-2">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save shop profile"}
              </Button>

              <Button as={Link} to="/barber/services" variant="outline-dark">
                Manage my services
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default BarberProfilePage;
