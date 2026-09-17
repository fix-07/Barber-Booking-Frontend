import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Form, Button, Table, Spinner, Modal, Badge } from "react-bootstrap";

import {
  fetchAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  fetchBarbersForPicker,
  clearAdminServiceFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { formatMoney } from "../../utils/format";

const blankForm = () => ({ barberId: "", name: "", description: "", durationMinutes: 30, priceMinor: 0, currency: "GBP" });

/**
 * Every barber's services in one place -- adminServiceController.js's
 * listAllServices/createServiceForBarber/updateAnyService/deleteAnyService
 * are the cross-barber equivalents of the barber-only endpoints
 * BarberServicesPage.js (the customer-facing site) already uses.
 */
const AdminServicesPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    servicesList, servicesListTotal, isLoadingServicesList, servicesListError,
    isSavingService, serviceError, serviceFieldErrors, serviceMessage,
    barberOptions,
  } = useSelector((state) => state.admin);

  const [barberFilter, setBarberFilter] = useState(searchParams.get("barberId") || "");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchBarbersForPicker());
  }, [dispatch]);

  useEffect(() => {
    const params = { limit: 100 };
    if (barberFilter) params.barberId = barberFilter;
    dispatch(fetchAdminServices(params));
  }, [dispatch, barberFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...blankForm(), barberId: barberFilter || "" });
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditingId(service.id);
    setForm({
      barberId: service.barberId,
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes,
      priceMinor: service.priceMinor,
      currency: service.currency,
    });
    setShowModal(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const onDone = () => setShowModal(false);
    if (editingId) {
      dispatch(updateAdminService(editingId, {
        name: form.name, description: form.description,
        durationMinutes: Number(form.durationMinutes), priceMinor: Number(form.priceMinor), currency: form.currency,
      }, onDone));
    } else {
      dispatch(createAdminService({
        barberId: form.barberId, name: form.name, description: form.description,
        durationMinutes: Number(form.durationMinutes), priceMinor: Number(form.priceMinor), currency: form.currency,
      }, onDone));
    }
  };

  const handleReactivate = (service) => {
    dispatch(updateAdminService(service.id, { isActive: true }));
  };

  const handleConfirmDelete = () => {
    const service = deleteTarget;
    setDeleteTarget(null);
    dispatch(deleteAdminService(service.id));
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminServiceFeedback())}>{servicesListError || serviceError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminServiceFeedback())}>{serviceMessage}</Alert>

      <Card>
        <Card.Body className="d-flex flex-wrap gap-3 align-items-end justify-content-between">
          <Form.Group style={{ width: 240 }}>
            <Form.Label className="small">Barber</Form.Label>
            <Form.Select
              value={barberFilter}
              onChange={(e) => {
                setBarberFilter(e.target.value);
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("barberId", e.target.value); else next.delete("barberId");
                setSearchParams(next, { replace: true });
              }}
            >
              <option value="">All barbers</option>
              {barberOptions.map((b) => <option key={b.barberId} value={b.barberId}>{b.shopName}</option>)}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={openCreate} className="mb-1">+ Add service</Button>
        </Card.Body>
      </Card>

      <div className="bb-admin-table-card">
        {isLoadingServicesList && (
          <div className="d-flex align-items-center gap-3 p-4" role="status">
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Loading services.</span>
          </div>
        )}

        {!isLoadingServicesList && servicesList.length === 0 && (
          <p className="mb-0 p-4 text-center">No services match this filter.</p>
        )}

        {!isLoadingServicesList && servicesList.length > 0 && (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Barber</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Price</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {servicesList.map((service) => (
                    <tr key={service.id}>
                      <td>{service.name}</td>
                      <td>{service.barberName}</td>
                      <td>{service.durationMinutes} min</td>
                      <td>{formatMoney(service.priceMinor, service.currency)}</td>
                      <td>
                        <Badge bg="" className={`bb-admin-badge ${service.isActive ? "bb-admin-badge-ok" : "bb-admin-badge-muted"}`}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-dark" size="sm" className="me-2" onClick={() => openEdit(service)}>
                          Edit
                        </Button>
                        {service.isActive ? (
                          <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(service)}>
                            Delete
                          </Button>
                        ) : (
                          <Button variant="outline-dark" size="sm" onClick={() => handleReactivate(service)}>
                            Reactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
      </div>

      {servicesListTotal > servicesList.length && (
        <p className="text-muted small">Showing {servicesList.length} of {servicesListTotal}.</p>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Header closeButton>
            <Modal.Title as="h2" className="h5 mb-0">{editingId ? "Edit service" : "Add service"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column gap-2">
            <Alert type="error">{serviceError}</Alert>

            {!editingId && (
              <Form.Group className="mb-2" controlId="serviceBarberId">
                <Form.Label>Barber</Form.Label>
                <Form.Select value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })} required>
                  <option value="">Choose a barber</option>
                  {barberOptions.map((b) => <option key={b.barberId} value={b.barberId}>{b.shopName}</option>)}
                </Form.Select>
              </Form.Group>
            )}

            <FormField id="serviceName" label="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={serviceFieldErrors.name} required />
            <FormField id="serviceDescription" label="Description (optional)" as="textarea" rows={2}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Row>
              <Col sm={6}>
                <FormField id="serviceDuration" label="Duration (minutes)" type="number" value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  error={serviceFieldErrors.durationMinutes} required />
              </Col>
              <Col sm={6}>
                <FormField id="servicePrice" label="Price (minor units, e.g. 2500 = 25.00)" type="number" value={form.priceMinor}
                  onChange={(e) => setForm({ ...form, priceMinor: e.target.value })}
                  error={serviceFieldErrors.priceMinor} required />
              </Col>
            </Row>
            <FormField id="serviceCurrency" label="Currency (3-letter code)" value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              error={serviceFieldErrors.currency} required />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-dark" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSavingService}>
              {isSavingService ? "Saving..." : editingId ? "Save changes" : "Create service"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={Boolean(deleteTarget)}
        title="Delete this service?"
        confirmLabel="Delete Service"
        isConfirming={isSavingService}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        body={
          <div className="d-flex flex-column gap-2">
            <p className="mb-0">
              This permanently deletes <strong>{deleteTarget?.name}</strong>. It disappears from admin and from
              customer booking options immediately. This action cannot be undone.
            </p>
            {deleteTarget?.upcomingBookingsCount > 0 && (
              <p className="text-danger small mb-0">
                This service has {deleteTarget.upcomingBookingsCount} upcoming appointment{deleteTarget.upcomingBookingsCount === 1 ? "" : "s"}.
                They will still happen as booked -- the service name, price and duration are already saved on
                each of those bookings -- but no new appointments can be booked for it once deleted.
              </p>
            )}
          </div>
        }
      />
    </div>
  );
};

export default AdminServicesPage;
