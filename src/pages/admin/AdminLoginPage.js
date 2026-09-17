import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";

import { login, logout, clearAuthError } from "../../actions/authActions";
import FormField from "../../components/FormField";
import Alert from "../../components/Alert";
import VeyronMonogram from "../../components/VeyronMonogram";
import { MailIcon, LockIcon } from "../../components/authIcons";

/**
 * Separate sign-in page for /admin, not a variant of the customer LoginPage.
 *
 * WHY A SEPARATE PAGE RATHER THAN REUSING AuthCard:
 * AuthCard's Log In / Sign Up switcher exists because a customer arriving at
 * /login might actually want /register. Nobody arrives at a staff sign-in
 * page wanting to create a customer account, so that switcher would be
 * pure clutter here -- this is deliberately just a form.
 *
 * The backend has exactly one login endpoint for every role (see
 * actions/authActions.js -- login() is role-agnostic), so a customer or
 * barber's credentials WILL authenticate here. The role check below is what
 * turns that into "not authorized for this surface": on success, if the
 * account is not an admin, we immediately log it back out rather than leave
 * a non-admin session sitting on the admin surface.
 */
const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error, fieldErrors } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({ email: "", password: "" });
  const [staffOnlyMessage, setStaffOnlyMessage] = useState("");

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Already an admin session (e.g. this tab was left open)? Skip the form.
  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    setStaffOnlyMessage("");
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStaffOnlyMessage("");

    dispatch(
      login(form, (loggedInUser) => {
        if (loggedInUser.role !== "admin") {
          dispatch(logout());
          setStaffOnlyMessage("This sign-in is for VEYRON staff only.");
        }
        // role === "admin": the effect above sends them to /admin once the
        // store updates.
      })
    );
  };

  return (
    <div className="bb-auth-page bb-admin-login-page">
      <div className="bb-auth-card">
        <div className="bb-auth-card-body">
          <div className="bb-admin-login-mark" aria-hidden="true">
            <VeyronMonogram />
          </div>

          <h1>VEYRON staff sign-in</h1>
          <p className="bb-auth-sub">Admin access only.</p>

          <Alert type="error">{staffOnlyMessage || error}</Alert>

          <Form onSubmit={handleSubmit} noValidate>
            <FormField
              id="email"
              label="Email address"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
              required
              autoComplete="email"
              icon={<MailIcon />}
            />

            <FormField
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
              icon={<LockIcon />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
