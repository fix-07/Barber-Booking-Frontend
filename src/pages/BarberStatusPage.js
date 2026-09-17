import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";

import { resubmitBarberApplication } from "../actions/authActions";
import api from "../api/axios";
import Alert from "../components/Alert";
import FormField from "../components/FormField";

/**
 * Where a barber lands instead of the dashboard while their account is not
 * "active" -- see components/ProtectedRoute.js's barberActiveGate (which
 * sends them here) and middleware/auth.js's requireActiveBarber on the
 * server (the actual enforcement).
 *
 * Three non-active states, three different things to show:
 *   pending_approval -- just the "submitted, waiting" message.
 *   suspended        -- just the suspension message. No resubmit: only an
 *                        admin can reverse a suspension.
 *   rejected         -- the rejection (+ reason, if given) AND a form to
 *                        edit and resubmit the application, per the spec's
 *                        "optionally allow barber to submit application
 *                        again". See PATCH /api/barbers/me/resubmit.
 */
const parseList = (text) =>
  text.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);

const joinList = (list) => (Array.isArray(list) ? list.join(", ") : "");

const blankForm = (profile) => ({
  shopName: profile?.shopName || "",
  city: profile?.city || "",
  timeZone: profile?.timeZone || "",
  bio: profile?.bio || "",
  experience: profile?.experience || "",
  photoUrl: profile?.photoUrl || "",
  specialties: joinList(profile?.specialties),
  requestedServices: joinList(profile?.requestedServices),
});

const BarberStatusPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error, fieldErrors } = useSelector((state) => state.auth);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/barbers/me/status")
      .then(({ data }) => {
        if (cancelled) return;
        setForm(blankForm(data.profile));
      })
      .catch(() => {
        if (!cancelled) setForm(blankForm(null));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Approval can land while this tab is open (or the page was reached
  // directly by URL after already being approved) -- send them straight to
  // the real dashboard rather than showing a stale "pending" message.
  useEffect(() => {
    if (user?.status === "active") {
      navigate("/barber/profile", { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.status === "active") return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResubmit = (event) => {
    event.preventDefault();
    dispatch(
      resubmitBarberApplication({
        ...form,
        specialties: parseList(form.specialties),
        requestedServices: parseList(form.requestedServices),
      })
    );
  };

  return (
    <Container className="py-5" style={{ maxWidth: 640 }}>
      {user.status === "pending_approval" && (
        <Card className="v-card">
          <Card.Body className="py-4">
            <p className="v-status v-status-warn mb-3">Awaiting approval</p>
            <h1 className="h4">Application submitted</h1>
            <p className="mb-0">
              Your application has been submitted. Your account is waiting for VEYRON admin approval.
            </p>
          </Card.Body>
        </Card>
      )}

      {user.status === "suspended" && (
        <Card className="v-card">
          <Card.Body className="py-4">
            <p className="v-status v-status-bad mb-3">Suspended</p>
            <h1 className="h4">Account suspended</h1>
            <p className="mb-0">
              Your account has been suspended. Contact VEYRON for details.
            </p>
          </Card.Body>
        </Card>
      )}

      {user.status === "rejected" && (
        <>
          <Card className="v-card mb-3">
            <Card.Body className="py-4">
              <p className="v-status v-status-bad mb-3">Not approved</p>
              <h1 className="h4">Application not approved</h1>
              <p className="mb-0">
                Your barber application was not approved.
                {user.rejectionReason ? "" : " You can edit and resubmit it below."}
              </p>
              {user.rejectionReason && <p className="mb-0 mt-2 fw-semibold">Reason: {user.rejectionReason}</p>}
            </Card.Body>
          </Card>

          <Card className="v-card">
            <Card.Body>
              <p className="v-fieldset-legend">Edit and resubmit your application</p>
              <Alert type="error">{error}</Alert>

              {isLoadingProfile || !form ? (
                <div className="v-loading-row" role="status">
                  <Spinner animation="border" size="sm" aria-hidden="true" />
                  <span>Loading your application.</span>
                </div>
              ) : (
                <Form onSubmit={handleResubmit} noValidate>
                  <FormField id="shopName" name="shopName" label="Shop or business name" value={form.shopName}
                    onChange={handleChange} error={fieldErrors.shopName} required />
                  <FormField id="city" name="city" label="City" value={form.city}
                    onChange={handleChange} error={fieldErrors.city} required />
                  <FormField id="timeZone" name="timeZone" label="Timezone" value={form.timeZone}
                    onChange={handleChange} error={fieldErrors.timeZone} required
                    hint="For example Europe/London or America/New_York." />
                  <FormField id="experience" name="experience" label="Experience (optional)" as="textarea" rows={2}
                    value={form.experience} onChange={handleChange} />
                  <FormField id="specialties" name="specialties" label="Specialties (comma separated, optional)"
                    value={form.specialties} onChange={handleChange} hint="For example: Fades, Beard trims, Kids cuts" />
                  <FormField id="requestedServices" name="requestedServices" label="Services you plan to offer (comma separated, optional)"
                    value={form.requestedServices} onChange={handleChange} />
                  <FormField id="photoUrl" name="photoUrl" label="Profile photo link (optional)"
                    value={form.photoUrl} onChange={handleChange} hint="A link to a photo of you or your shop." />
                  <FormField id="bio" name="bio" label="About (optional)" as="textarea" rows={2}
                    value={form.bio} onChange={handleChange} />

                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? "Resubmitting..." : "Resubmit application"}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default BarberStatusPage;
