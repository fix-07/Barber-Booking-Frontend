import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
} from "react-bootstrap";

import {
  fetchMyServices,
  saveService,
  deleteService,
  setServiceActive,
  clearServiceFeedback,
} from "../actions/serviceActions";

import Alert from "../components/Alert";
import FormField from "../components/FormField";
import BarberPageHead from "../components/BarberPageHead";
import { formatMoney, formatDuration } from "../utils/format";

const EMPTY_FORM = {
  name: "",
  description: "",
  durationMinutes: "30",
  price: "",
  currency: "",
};

/**
 * A barber manages their own services.
 *
 * THE PRICE FIELD IS WORTH EXPLAINING.
 *
 * The barber types a normal amount like "12.50". The server stores money as a
 * whole number of minor units, so 12.50 must become 1250 before it is sent.
 *
 * We do that with Math.round(Number(price) * 100) rather than parsing the
 * string, because floating point is not exact:
 *     12.50 * 100  gives  1250.0000000000002  in JavaScript.
 * Without the rounding you would eventually store 1250.0000000002 and the
 * server would reject it for not being a whole number. Same reason the database
 * never stores a decimal in the first place.
 */
const BarberServicesPage = () => {
  const dispatch = useDispatch();
  const { mine, isLoading, isSaving, error, fieldErrors, message } = useSelector(
    (state) => state.services
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    dispatch(fetchMyServices());
    return () => dispatch(clearServiceFeedback());
  }, [dispatch]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: String(service.durationMinutes),
      // Convert stored minor units back to a normal amount for the input.
      price: (service.priceMinor / 100).toFixed(2),
      currency: service.currency,
    });
    setPriceError("");

    // Move focus to the form so a keyboard user is taken to what they just
    // chose to edit, instead of being left at the bottom of the table.
    const field = document.getElementById("name");
    if (field) field.focus();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPriceError("");
    dispatch(clearServiceFeedback());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setPriceError("");

    const amount = Number(form.price);
    if (!form.price.trim() || Number.isNaN(amount) || amount < 0) {
      setPriceError("Enter a price, for example 12.50");
      return;
    }

    // See the note at the top of this file for why Math.round is required.
    const priceMinor = Math.round(amount * 100);

    dispatch(
      saveService(
        {
          name: form.name,
          description: form.description,
          durationMinutes: form.durationMinutes,
          priceMinor,
          currency: form.currency.trim().toUpperCase(),
        },
        editingId
      )
    );

    if (!editingId) setForm(EMPTY_FORM);
  };

  return (
    <Container className="py-5">
      <BarberPageHead
        eyebrow="Your offering"
        title="My services"
        lede="These are what customers choose from when they book. Each one needs a length and a price."
      />

      <Alert type="error" onDismiss={() => dispatch(clearServiceFeedback())}>
        {error}
      </Alert>
      <Alert type="success" onDismiss={() => dispatch(clearServiceFeedback())}>
        {message}
      </Alert>

      {/* --------------------------- The form --------------------------- */}
      <Row className="mb-5">
        <Col lg={7}>
          <Card className="v-card">
            <Card.Body>
              <Card.Title as="h2" className="h5 mb-3">
                {editingId ? "Edit service" : "Add a service"}
              </Card.Title>

              <Form onSubmit={handleSubmit} noValidate>
                <FormField
                  id="name"
                  label="Service name"
                  value={form.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  required
                  hint="For example: Skin fade, Beard trim, Child's cut."
                />

                <FormField
                  id="description"
                  label="Description (optional)"
                  type="textarea"
                  value={form.description}
                  onChange={handleChange}
                  error={fieldErrors.description}
                  rows={3}
                />

                <Row>
                  <Col sm={6}>
                    <FormField
                      id="durationMinutes"
                      label="How long does it take?"
                      type="number"
                      value={form.durationMinutes}
                      onChange={handleChange}
                      error={fieldErrors.durationMinutes}
                      required
                      min={5}
                      max={480}
                      step={5}
                      inputMode="numeric"
                      hint="In minutes, 5 to 480. This decides how much of your day the appointment blocks out."
                    />
                  </Col>

                  <Col sm={6}>
                    <FormField
                      id="price"
                      label="Price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      error={priceError || fieldErrors.priceMinor}
                      required
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      hint="Enter it the normal way, for example 12.50"
                    />
                  </Col>
                </Row>

                <FormField
                  id="currency"
                  label="Currency code"
                  value={form.currency}
                  onChange={handleChange}
                  error={fieldErrors.currency}
                  required
                  hint="Three letters, for example GBP, USD, EUR or PKR. I have not guessed this for you, because the wrong currency on a price is worse than an empty field."
                />

                <div className="d-flex flex-wrap gap-2">
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    {isSaving
                      ? "Saving..."
                      : editingId
                      ? "Save changes"
                      : "Add service"}
                  </Button>

                  {editingId && (
                    <Button variant="outline-dark" onClick={cancelEdit}>
                      Cancel editing
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --------------------------- The list --------------------------- */}
      <h2 className="h4 mb-3">Your services</h2>

      {isLoading && (
        <div className="v-loading-row" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading your services.</span>
        </div>
      )}

      {!isLoading && mine.length === 0 && (
        <div className="v-empty-state">
          <p className="mb-0">
            You have not added any services yet. Customers cannot book until
            you add at least one.
          </p>
        </div>
      )}

      {mine.length > 0 && (
        <div className="v-card" style={{ overflow: "hidden" }}>
        <Table responsive bordered className="v-table align-middle mb-0">
          <caption className="text-muted small px-3">
            Services customers can book. Hidden services stay on past bookings
            but are not offered to new customers.
          </caption>
          <thead>
            <tr>
              <th scope="col">Service</th>
              <th scope="col">Length</th>
              <th scope="col">Price</th>
              <th scope="col">Shown to customers</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((service) => (
              <tr key={service.id}>
                <td>
                  <strong>{service.name}</strong>
                  {service.description && (
                    <>
                      <br />
                      <span className="text-muted small">
                        {service.description}
                      </span>
                    </>
                  )}
                </td>

                <td className="text-nowrap">
                  {formatDuration(service.durationMinutes)}
                </td>

                <td className="text-nowrap">
                  {formatMoney(service.priceMinor, service.currency)}
                </td>

                <td>
                  {/* A word, not a coloured dot. "Yes" and "Hidden" are
                      readable in greyscale and by a screen reader. */}
                  {service.isActive ? "Yes" : "Hidden"}
                </td>

                <td>
                  {confirmDeleteId === service.id ? (
                    <div>
                      <p className="small mb-2">
                        Delete <strong>{service.name}</strong>? If it has
                        upcoming appointments it will be hidden instead, so
                        those appointments are not broken.
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            dispatch(deleteService(service.id));
                            setConfirmDeleteId(null);
                          }}
                          disabled={isSaving}
                        >
                          Yes, delete
                        </Button>
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Keep it
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => startEdit(service)}
                      >
                        Edit
                        <span className="visually-hidden"> {service.name}</span>
                      </Button>

                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() =>
                          dispatch(setServiceActive(service.id, !service.isActive))
                        }
                        disabled={isSaving}
                      >
                        {service.isActive ? "Hide" : "Show"}
                        <span className="visually-hidden"> {service.name}</span>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setConfirmDeleteId(service.id)}
                      >
                        Delete
                        <span className="visually-hidden"> {service.name}</span>
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      )}
    </Container>
  );
};

export default BarberServicesPage;
