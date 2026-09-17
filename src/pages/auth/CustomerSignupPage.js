import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Phone, Lock, Shield, Loader2, AlertTriangle } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { isGoogleSignInConfigured } from "../../auth/googleConfig";
import { register } from "../../actions/authActions";
import { clearVerificationState } from "../../actions/verificationActions";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateAgreeToTerms,
  runValidators,
} from "../../auth/validation";

/**
 * Customer registration. Simple and focused, as the brief asks.
 *
 * ==========================================================================
 *  DATA MINIMIZATION
 * ==========================================================================
 *
 * Four pieces of personal information, and each one has a job:
 *
 *   Name      so a barber knows who is in their chair.
 *   Email     the login identifier, and where the verification code goes.
 *   Phone     so a barber can reach a customer about a change on the day,
 *             when email is too slow.
 *   Password  to protect the account.
 *
 * Deliberately NOT asked: date of birth, gender, home address, postcode,
 * marketing preferences, "how did you hear about us". None is needed to
 * book a haircut, and the less that is held, the less there is to leak.
 * This matches the list in the Privacy Policy -- the two must stay in step.
 *
 * ==========================================================================
 *  CONSENT
 * ==========================================================================
 *
 * The checkbox is never pre-ticked, covers one thing only (confirming the
 * two policies have been read), and links to both so they can actually be
 * read first. The server independently refuses the signup unless it is
 * true and records when it was given -- the checkbox is the interface, the
 * server is the enforcement.
 */
const CustomerSignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Loading/error/fieldErrors come from the VERIFICATION slice, not auth.
   *
   * Registering no longer creates an account or a session (see
   * actions/authActions.js), so it dispatches PENDING_REGISTRATION_* into
   * state.verification rather than state.auth -- reading state.auth here
   * would never see this request in flight or its errors at all.
   */
  const { isSending: isLoading, error, fieldErrors } = useSelector(
    (s) => s.verification
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearVerificationState());
  }, [dispatch]);

  const validators = {
    name: () => validateName(form.name),
    email: () => validateEmail(form.email),
    phone: () => validatePhone(form.phone),
    password: () => validatePassword(form.password, { strict: true }),
    confirmPassword: () =>
      validateConfirmPassword(form.confirmPassword, form.password),
    agreeToTerms: () => validateAgreeToTerms(form.agreeToTerms),
  };

  const change = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const blur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const found = runValidators(validators);
    setErrors(found);
    setTouched(
      Object.keys(validators).reduce((all, k) => ({ ...all, [k]: true }), {})
    );
    if (Object.keys(found).length > 0) return;

    dispatch(
      register(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          // Sent explicitly from this flow, as the brief requires. The
          // server still refuses to trust it for anything but
          // customer/barber -- see the privilege-escalation guard in
          // authController.register.
          role: "customer",
          acceptedPolicies: form.agreeToTerms,
        },
        // Submitting only STARTS a signup now -- see actions/authActions.js.
        // No account and no session exist yet, so there is nothing to watch
        // for in state.auth to trigger this navigation; going there
        // explicitly, right after a successful submit, is the only signal.
        // The email travels in route state as a fallback for VerifyPage if
        // the page is reloaded before the Redux store's own copy
        // (state.verification.pendingEmail) would still be there.
        () => navigate("/verify", { replace: true, state: { email: form.email } })
      )
    );
  };

  const errorFor = (f) => fieldErrors[f] || errors[f] || "";

  return (
    <AuthLayout variant="customer">
      <h1 className="bb-auth-title">Create your account</h1>
      <p className="bb-auth-sub">Book your next cut with confidence.</p>

      {error && (
        <div className="bb-auth-alert bb-auth-alert-error" role="alert">
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/*
        ONE consent checkbox, ABOVE both paths, because agreeing to the
        Terms and Privacy Policy is a single decision -- not a separate
        one for "sign up with Google" versus "sign up with email". Moved
        here (out of the <form> below) specifically so it can also gate
        the Google button, which is not part of that form. Both paths
        read this same `form.agreeToTerms` value.
      */}
      <label className="bb-check" htmlFor="agreeToTerms">
        <input
          type="checkbox"
          id="agreeToTerms"
          checked={form.agreeToTerms}
          onChange={change("agreeToTerms")}
          aria-invalid={errorFor("agreeToTerms") ? "true" : undefined}
          aria-describedby={
            errorFor("agreeToTerms") ? "agreeToTerms-error" : undefined
          }
        />
        <span>
          I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </span>
      </label>

      {errorFor("agreeToTerms") && (
        <p className="bb-authfield-error" id="agreeToTerms-error">
          <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
          <span>{errorFor("agreeToTerms")}</span>
        </p>
      )}

      {isGoogleSignInConfigured() && (
        <>
          <GoogleSignInButton mode="signup" consentGiven={form.agreeToTerms} />
          <div className="bb-auth-divider">or create an account with email</div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="bb-fieldset">
          <legend className="bb-legend">Personal information</legend>

          <AuthField
            label="Full name"
            name="name"
            icon={User}
            value={form.name}
            onChange={change("name")}
            onBlur={blur("name")}
            error={errorFor("name")}
            autoComplete="name"
            required
          />

          <AuthField
            label="Email address"
            name="email"
            type="email"
            icon={Mail}
            value={form.email}
            onChange={change("email")}
            onBlur={blur("email")}
            error={errorFor("email")}
            autoComplete="email"
            placeholder="you@example.com"
            hint="We'll send a 6-digit verification code here."
            required
          />

          <AuthField
            label="Phone number"
            name="phone"
            type="tel"
            icon={Phone}
            value={form.phone}
            onChange={change("phone")}
            onBlur={blur("phone")}
            error={errorFor("phone")}
            autoComplete="tel"
            placeholder="+216 12 345 678"
            hint="So your barber can reach you about your appointment."
            required
          />
        </fieldset>

        <fieldset className="bb-fieldset">
          <legend className="bb-legend">Security</legend>

          <AuthField
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            value={form.password}
            onChange={change("password")}
            onBlur={blur("password")}
            error={errorFor("password")}
            autoComplete="new-password"
            required
          />

          <PasswordStrengthIndicator password={form.password} />

          <AuthField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            icon={Shield}
            value={form.confirmPassword}
            onChange={change("confirmPassword")}
            onBlur={blur("confirmPassword")}
            error={errorFor("confirmPassword")}
            autoComplete="new-password"
            required
          />
        </fieldset>

        <button
          type="submit"
          className="bb-auth-submit bb-mt-5"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              Creating your account...
            </>
          ) : (
            "Create customer account"
          )}
        </button>
      </form>

      <div className="bb-auth-foot">
        <p className="bb-auth-foot-label">
          Already have an account?{" "}
          <Link to="/login" className="bb-auth-link">
            Sign in
          </Link>
        </p>
        <p className="bb-auth-foot-label">
          Are you a barber?{" "}
          <Link to="/signup/barber" className="bb-auth-link">
            Join as a barber
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default CustomerSignupPage;
