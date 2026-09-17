import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  Lock,
  Loader2,
  AlertTriangle,
  CalendarCheck,
  Scissors,
  ChevronRight,
} from "lucide-react";

import { login, clearAuthError } from "../../actions/authActions";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { isGoogleSignInConfigured } from "../../auth/googleConfig";
import { validateEmail, validatePassword, runValidators } from "../../auth/validation";
import { homeRouteFor } from "../../auth/roleRoutes";

/**
 * The one shared sign-in page. Everybody uses it -- customer, barber and
 * admin -- and where you land afterwards is decided by the role the SERVER
 * reports, never by anything chosen here. See auth/roleRoutes.js.
 *
 * ==========================================================================
 *  "REMEMBER ME" AND WHAT IT DOES NOT DO
 * ==========================================================================
 *
 * The supplied AuthForm saved the email to localStorage and set a
 * "rememberMe" flag there. Saving the EMAIL is kept -- it is the person's
 * own address on their own device, it only prefills a field, and it is the
 * bit that makes the setting feel like it works.
 *
 * What is NOT kept is any notion that the browser decides whether you stay
 * logged in. The session is a signed httpOnly cookie the server issues; the
 * checkbox just asks the server for a longer one. Nothing here can extend a
 * session by editing localStorage, and no password or token is written to
 * the browser at any point. The brief is explicit about that and it is
 * also simply the correct design.
 *
 * localStorage access is wrapped: it throws in a private window in some
 * browsers, and a login page that crashes because it could not prefill an
 * email would be a bad trade.
 */

const REMEMBERED_EMAIL_KEY = "veyron.rememberedEmail";

const readRememberedEmail = () => {
  try {
    return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

const writeRememberedEmail = (email) => {
  try {
    if (email) window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    // A browser that refuses storage still logs in fine; it just will not
    // prefill next time.
  }
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, error, fieldErrors } = useSelector((s) => s.auth);

  const remembered = readRememberedEmail();

  const [form, setForm] = useState({
    email: remembered,
    password: "",
    rememberMe: Boolean(remembered),
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  /**
   * Once the session exists, go where THIS role belongs -- always, never
   * wherever the browser happened to be pointed before.
   *
   * This deliberately ignores any "come back to this page" state a route
   * guard may have attached to the /login history entry. That state can
   * outlive the session that created it (e.g. an admin gets bounced off
   * /admin/clients to /login, then a different person signs in on that
   * same /login entry) -- honoring it would land the new session on a page
   * that belonged to the previous one, and possibly to a role it should
   * not see at all. Role-based routing has no such ambiguity: see
   * auth/roleRoutes.js.
   */
  useEffect(() => {
    if (!user) return;
    navigate(homeRouteFor(user), { replace: true });
  }, [user, navigate]);

  const validators = {
    email: () => validateEmail(form.email),
    // Not strict: an existing password must never be refused here for
    // failing today's strength rules. That would lock people out of
    // accounts they already have.
    password: () => validatePassword(form.password, { strict: false }),
  };

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));

    // Live only after the field has been left once -- see auth/validation.js.
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validators[field]
        ? validators[field]()
        : "" }));
    }
  };

  // Recomputed against the NEW value rather than the stale closure.
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const found = runValidators(validators);
    setErrors(found);
    setTouched({ email: true, password: true });
    if (Object.keys(found).length > 0) return;

    writeRememberedEmail(form.rememberMe ? form.email : "");

    dispatch(login(form));
  };

  // A field error from the server outranks the local one: it is the more
  // authoritative answer about that field.
  const errorFor = (field) => fieldErrors[field] || errors[field] || "";

  return (
    <AuthLayout variant="signin">
      <h1 className="bb-auth-title">Welcome back</h1>
      <p className="bb-auth-sub">Sign in to your VEYRON account.</p>

      {error && (
        <div className="bb-auth-alert bb-auth-alert-error" role="alert">
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isGoogleSignInConfigured() && (
        <>
          <GoogleSignInButton mode="signin" />
          <div className="bb-auth-divider">or sign in with email</div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          error={errorFor("email")}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <AuthField
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          error={errorFor("password")}
          autoComplete="current-password"
          required
        />

        <div className="bb-check-row">
          <label className="bb-check" htmlFor="rememberMe">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange("rememberMe")}
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="bb-auth-link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="bb-auth-submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/*
        Two separate doors, not a dropdown. See WelcomePage.js for the
        reasoning -- customer and barber signup are genuinely different
        journeys, so they are different destinations.
      */}
      <div className="bb-auth-foot">
        <p className="bb-auth-foot-label">Don't have an account?</p>

        <div className="bb-auth-choices">
          <Link to="/signup/customer" className="bb-choice">
            <span className="bb-choice-icon" aria-hidden="true">
              <CalendarCheck size={20} strokeWidth={1.75} />
            </span>
            <span className="bb-choice-body">
              <span className="bb-choice-title">Create customer account</span>
              <span className="bb-choice-text">
                Discover and book barbers.
              </span>
            </span>
            <ChevronRight size={18} className="bb-choice-arrow" aria-hidden="true" />
          </Link>

          <Link to="/signup/barber" className="bb-choice bb-choice-pro">
            <span className="bb-choice-icon" aria-hidden="true">
              <Scissors size={20} strokeWidth={1.75} />
            </span>
            <span className="bb-choice-body">
              <span className="bb-choice-title">Join as a barber</span>
              <span className="bb-choice-text">
                Build a profile and accept bookings.
              </span>
            </span>
            <ChevronRight size={18} className="bb-choice-arrow" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
