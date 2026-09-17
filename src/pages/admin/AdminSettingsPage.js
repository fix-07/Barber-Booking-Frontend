import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Form, Button } from "react-bootstrap";

import { updateAdminSettings, clearAdminSettingsFeedback, fetchPublicSettings } from "../../actions/settingsActions";
import Alert from "../../components/Alert";
import FormField from "../../components/FormField";
import useBusinessSettings from "../../hooks/useBusinessSettings";

/**
 * Business information here is real and DB-backed (see
 * models/BusinessSettings.js on the server) -- saving it here changes what
 * the live Footer and legal pages show, not just what the admin sees.
 *
 * The other sections (payments, notifications, staff permissions,
 * branding) are informational, not editable controls: this codebase has no
 * payment processor, no email/SMS provider, and only one staff role today.
 * A toggle for any of those would look like a setting but do nothing --
 * exactly the kind of decorative control this project avoids throughout.
 * Each says plainly what is and is not true right now.
 */
const AdminSettingsPage = () => {
  const dispatch = useDispatch();
  const business = useBusinessSettings();
  const { isSaving, saveError, saveFieldErrors, message } = useSelector((state) => state.settings);

  const [form, setForm] = useState(business);

  useEffect(() => {
    setForm(business);
  }, [business]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(updateAdminSettings(form, () => dispatch(fetchPublicSettings())));
  };

  const field = (id, label, hint) => (
    <FormField
      id={id}
      label={label}
      value={form[id] || ""}
      onChange={(e) => setForm({ ...form, [id]: e.target.value })}
      error={saveFieldErrors[id]}
      hint={hint}
    />
  );

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminSettingsFeedback())}>{saveError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminSettingsFeedback())}>{message}</Alert>

      <Form onSubmit={handleSubmit} noValidate>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title as="h2" className="h6 mb-1">Business information</Card.Title>
            <p className="text-muted small mb-3">
              Shown in the site footer and the four legal pages. Saving here updates the live customer site immediately.
            </p>
            <Row>
              <Col md={6}>{field("name", "Trading name")}</Col>
              <Col md={6}>{field("legalName", "Registered legal name")}</Col>
            </Row>
            <Row>
              <Col md={6}>{field("email", "Contact email")}</Col>
              <Col md={6}>{field("phone", "Contact phone")}</Col>
            </Row>
            {field("address", "Postal address")}
            <Row>
              <Col md={6}>{field("registration", "Company / tax registration number")}</Col>
              <Col md={6}>{field("jurisdiction", "Governing jurisdiction", "For example \"England and Wales\". Have a lawyer confirm this.")}</Col>
            </Row>
            <Row>
              <Col md={6}>{field("hours", "Opening hours (free text)")}</Col>
              <Col md={6}>{field("policyUpdated", "Policies last reviewed")}</Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Body>
            <Card.Title as="h2" className="h6 mb-1">Cancellation policy</Card.Title>
            <p className="text-muted small mb-3">
              Plain-language text shown on the Refund Policy page. There is no enforced notice-period rule in the booking system today -- a customer or barber can cancel at any time before the appointment -- so this is a statement of your policy, not a system that blocks late cancellations.
            </p>
            <FormField
              id="cancellationPolicy"
              label="Policy text"
              as="textarea"
              rows={4}
              value={form.cancellationPolicy || ""}
              onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
              error={saveFieldErrors.cancellationPolicy}
            />
          </Card.Body>
        </Card>

        <Button type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save business settings"}
        </Button>
      </Form>

      <Row className="g-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-2">Payment settings</Card.Title>
              <p className="small mb-0">
                No online payment processor is connected. Customers pay in person; staff record payment on each booking (see the Payments page). Nothing here charges a card.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-2">Notifications</Card.Title>
              <p className="small mb-0">
                No email or SMS provider is configured on the server, so there are no notification settings to toggle yet.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-2">Staff permissions</Card.Title>
              <p className="small mb-0">
                Every admin account has the same, full access today. There are no separate permission tiers yet.
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-2">Branding</Card.Title>
              <div className="d-flex gap-2 mb-2">
                <span className="rounded" style={{ width: 24, height: 24, background: "#0e0e10", border: "1px solid #ddd" }} title="Black" />
                <span className="rounded" style={{ width: 24, height: 24, background: "#17171a", border: "1px solid #ddd" }} title="Charcoal" />
                <span className="rounded" style={{ width: 24, height: 24, background: "#d4a63c" }} title="Gold" />
                <span className="rounded" style={{ width: 24, height: 24, background: "#f6f5f2", border: "1px solid #ddd" }} title="Off-white" />
              </div>
              <p className="small mb-0">
                Fixed in code, not a live theme editor -- see styles/theme.css and admin.css.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminSettingsPage;
