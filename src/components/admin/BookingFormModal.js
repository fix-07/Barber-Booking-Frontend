import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import api from "../../api/axios";
import { createAdminBooking, fetchServicesForPicker } from "../../actions/adminActions";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";

/**
 * Creates a walk-in / phone booking as staff -- see
 * server/controllers/adminBookingController.js's adminCreateBooking for the
 * validation this hits (working hours, time off, breaks, double-booking are
 * all still enforced server-side; nothing here is trusted on its own).
 *
 * Client search is plain component state rather than Redux: it is
 * throwaway UI state for this one form, not something another part of the
 * app needs to read.
 */
const BookingFormModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const { barberOptions, serviceOptions, isSavingBooking, bookingError, bookingFieldErrors } =
    useSelector((state) => state.admin);

  const [clientMode, setClientMode] = useState("existing"); // "existing" | "new"
  const [clientQuery, setClientQuery] = useState("");
  const [clientResults, setClientResults] = useState([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [form, setForm] = useState({
    barberId: "",
    serviceId: "",
    startAt: "",
    name: "",
    email: "",
    phone: "",
    staffNote: "",
  });

  const resetAndClose = () => {
    setClientMode("existing");
    setClientQuery("");
    setClientResults([]);
    setSelectedClient(null);
    setForm({ barberId: "", serviceId: "", startAt: "", name: "", email: "", phone: "", staffNote: "" });
    onClose();
  };

  useEffect(() => {
    dispatch(fetchServicesForPicker(form.barberId || null));
  }, [dispatch, form.barberId]);

  const handleClientSearch = async (event) => {
    event.preventDefault();
    if (!clientQuery.trim()) return;

    setIsSearchingClients(true);
    try {
      const { data } = await api.get("/admin/clients", { params: { q: clientQuery, limit: 10 } });
      setClientResults(data.clients);
    } catch {
      setClientResults([]);
    } finally {
      setIsSearchingClients(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const startAtIso = form.startAt ? new Date(form.startAt).toISOString() : "";

    const payload = {
      barberId: form.barberId,
      serviceId: form.serviceId,
      startAt: startAtIso,
      staffNote: form.staffNote || undefined,
      ...(clientMode === "existing"
        ? { existingUserId: selectedClient?.id }
        : { name: form.name, email: form.email, phone: form.phone }),
    };

    dispatch(createAdminBooking(payload, () => resetAndClose()));
  };

  const canSubmit =
    form.barberId &&
    form.serviceId &&
    form.startAt &&
    (clientMode === "existing" ? Boolean(selectedClient) : form.name && form.email && form.phone);

  return (
    <Modal show={show} onHide={resetAndClose} centered>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">New booking</Modal.Title>
        </Modal.Header>

        <Modal.Body className="d-flex flex-column gap-3">
          <Alert type="error">{bookingError}</Alert>

          <fieldset>
            <legend className="h6">Client</legend>

            <div className="d-flex gap-3 mb-2">
              <Form.Check
                type="radio"
                id="client-mode-existing"
                name="clientMode"
                label="Existing client"
                checked={clientMode === "existing"}
                onChange={() => setClientMode("existing")}
              />
              <Form.Check
                type="radio"
                id="client-mode-new"
                name="clientMode"
                label="New client"
                checked={clientMode === "new"}
                onChange={() => setClientMode("new")}
              />
            </div>

            {clientMode === "existing" ? (
              <div>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email or phone"
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    aria-label="Search clients"
                  />
                  <Button variant="outline-dark" onClick={handleClientSearch} disabled={isSearchingClients}>
                    Search
                  </Button>
                </div>

                {selectedClient && (
                  <p className="small mb-2">
                    Booking for <strong>{selectedClient.name}</strong> ({selectedClient.email}){" "}
                    <Button variant="link" size="sm" className="p-0" onClick={() => setSelectedClient(null)}>
                      Change
                    </Button>
                  </p>
                )}

                {!selectedClient && clientResults.length > 0 && (
                  <ul className="list-unstyled border rounded mb-0" style={{ maxHeight: 160, overflowY: "auto" }}>
                    {clientResults.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          className="btn btn-light w-100 text-start rounded-0 border-0"
                          onClick={() => {
                            setSelectedClient(client);
                            setClientResults([]);
                          }}
                        >
                          {client.name} <span className="text-muted small">({client.email})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Row className="g-2">
                <Col md={4}>
                  <FormField
                    id="name"
                    label="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Col>
                <Col md={4}>
                  <FormField
                    id="email"
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </Col>
                <Col md={4}>
                  <FormField
                    id="phone"
                    label="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </Col>
              </Row>
            )}
          </fieldset>

          <fieldset>
            <legend className="h6">Appointment</legend>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group className="mb-2" controlId="barberId">
                  <Form.Label>Barber</Form.Label>
                  <Form.Select
                    value={form.barberId}
                    onChange={(e) => setForm({ ...form, barberId: e.target.value, serviceId: "" })}
                    isInvalid={Boolean(bookingFieldErrors.barberId)}
                    required
                  >
                    <option value="">Choose a barber</option>
                    {barberOptions.map((barber) => (
                      <option key={barber.barberId} value={barber.barberId}>
                        {barber.shopName} ({barber.barberName})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2" controlId="serviceId">
                  <Form.Label>Service</Form.Label>
                  <Form.Select
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    disabled={!form.barberId}
                    required
                  >
                    <option value="">
                      {form.barberId ? "Choose a service" : "Choose a barber first"}
                    </option>
                    {serviceOptions.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.durationMinutes} min)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-2" controlId="startAt">
                  <Form.Label>Date and time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <FormField
              id="staffNote"
              label="Internal note (optional)"
              as="textarea"
              rows={2}
              value={form.staffNote}
              onChange={(e) => setForm({ ...form, staffNote: e.target.value })}
            />
          </fieldset>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-dark" onClick={resetAndClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!canSubmit || isSavingBooking}>
            {isSavingBooking ? "Creating..." : "Create booking"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookingFormModal;
