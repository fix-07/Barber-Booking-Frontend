import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";

import { login, clearAuthError } from "../actions/authActions";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import AuthCard from "../components/AuthCard";
import { MailIcon, LockIcon } from "../components/authIcons";

/**
 * Log in.
 *
 * DATA MINIMIZATION: email and password, nothing else. A login form has no
 * business asking for anything more.
 *
 * There is no consent checkbox here, deliberately. Logging into an account you
 * already created is not a new collection of data, and asking again would be
 * consent theatre. The agreement happened at registration and was recorded
 * then.
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isLoading, error, fieldErrors } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({ email: "", password: "" });

  /**
   * Where to send them after logging in.
   *
   * WHY THIS IS CHECKED RATHER THAN USED DIRECTLY:
   *
   * Handing any string straight to navigate() is how open-redirect bugs
   * happen. An attacker sends someone a link that lands on the login page
   * carrying a destination like "//evil.example.com". After a genuine,
   * successful login the app obediently sends them off-site, to a page that
   * can be made to look exactly like this one and ask for their password
   * again.
   *
   * The version of React Router this project uses has a published advisory for
   * this exact shape of bug, including a backslash variant
   * (GHSA-wrjc-x8rr-h8h6). The upstream fix is React Router 7, a major version
   * with breaking changes, so instead we make sure the value can only ever be
   * an internal path.
   *
   * The rule: must start with a single "/" not followed by another "/" or
   * "\". That allows "/my-bookings" and rejects "//evil.com", "/\evil.com"
   * and "https://evil.com".
   */
  const isSafeInternalPath = (path) =>
    typeof path === "string" && /^\/(?![/\\])/.test(path);

  const requestedFrom = location.state && location.state.from;
  const cameFrom = isSafeInternalPath(requestedFrom) ? requestedFrom : null;

  // Clear any leftover error on arrival, so a previous failed attempt does not
  // greet them with red text.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Already logged in? Do not show them a login form.
  useEffect(() => {
    if (!user) return;
    const home = user.role === "barber" ? "/barber/appointments" : "/my-bookings";
    navigate(cameFrom || home, { replace: true });
  }, [user, cameFrom, navigate]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    // Stops the browser reloading the page, which is a form's default.
    event.preventDefault();
    dispatch(login(form));
  };

  return (
    <AuthCard>
      <h1>Log in</h1>
      <p className="bb-auth-sub">
        Log in to see your bookings, change a time, or cancel one.
      </p>

      {/*
        No "Do not have an account? Create one." line here. Before this pass
        that sentence was the only way to move to the register page; now the
        Sign Up option in the switcher above does that job, and saying the
        same thing two different ways in one small card is clutter rather
        than help.
      */}

      <Alert type="error">{error}</Alert>

      {/*
        A real <form> element. That is what makes pressing Enter in a
        field submit it, which many people rely on and keyboard-only
        users expect.

        noValidate turns off the browser's own bubble messages so ours
        are used instead: consistent, tied to each field, and announced
        by screen readers.
      */}
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
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </Form>

      <p className="bb-auth-footnote mb-0">
        By logging in you agree to our{" "}
        <Link to="/terms">Terms and Conditions</Link> and{" "}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
    </AuthCard>
  );
};

export default LoginPage;
