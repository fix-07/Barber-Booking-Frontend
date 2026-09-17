import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Loader2, AlertTriangle, KeyRound } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import {
  requestPasswordReset,
  clearVerificationState,
} from "../../actions/verificationActions";
import { validateEmail } from "../../auth/validation";

/**
 * Step 1 of the password reset: ask where to send the code.
 *
 * ==========================================================================
 *  THIS SCREEN CANNOT TELL YOU WHETHER AN ACCOUNT EXISTS
 * ==========================================================================
 *
 * That is on purpose, and it is the whole reason the server replies
 * identically for a known and an unknown address (see forgotPassword in
 * verificationController.js). If this page said "no account with that
 * email", anyone could feed it a list of addresses and learn which of a
 * barber shop's customers have accounts here.
 *
 * So the confirmation below is deliberately conditional in its wording --
 * "if an account exists" -- and it is shown for every well-formed address.
 * A real account holder gets an email; someone fishing gets a sentence
 * that tells them nothing.
 */
const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isSending, error } = useSelector((state) => state.verification);

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => () => dispatch(clearVerificationState()), [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const problem = validateEmail(email);
    setTouched(true);
    setFieldError(problem);
    if (problem) return;

    const ok = await dispatch(requestPasswordReset(email));
    if (ok) setSent(true);
  };

  /* --------------------------- confirmation --------------------------- */
  if (sent) {
    return (
      <AuthLayout variant="signin">
        <span className="bb-auth-badge" aria-hidden="true">
          <Mail size={22} strokeWidth={1.75} />
        </span>

        <h1 className="bb-auth-title">Check your email</h1>
        <p className="bb-auth-sub">
          If an account exists for <strong>{email}</strong>, a 6-digit reset
          code is on its way. The code expires in 10 minutes.
        </p>

        <button
          type="button"
          className="bb-auth-submit"
          onClick={() =>
            navigate("/reset-password", { state: { email }, replace: true })
          }
        >
          I have a code
        </button>

        <div className="bb-auth-resend">
          <Link to="/login" className="bb-auth-link">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  /* ------------------------------ the form ---------------------------- */
  return (
    <AuthLayout variant="signin">
      <span className="bb-auth-badge" aria-hidden="true">
        <KeyRound size={22} strokeWidth={1.75} />
      </span>

      <h1 className="bb-auth-title">Reset your password</h1>
      <p className="bb-auth-sub">
        Enter the email address on your account and we'll send you a code to
        set a new password.
      </p>

      {error && (
        <div className="bb-auth-alert bb-auth-alert-error" role="alert">
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched) setFieldError(validateEmail(e.target.value));
          }}
          onBlur={() => {
            setTouched(true);
            setFieldError(validateEmail(email));
          }}
          error={fieldError}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <button type="submit" className="bb-auth-submit" disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              Sending...
            </>
          ) : (
            <>
              <KeyRound size={17} strokeWidth={2} aria-hidden="true" />
              Send reset code
            </>
          )}
        </button>
      </form>

      <div className="bb-auth-resend">
        <Link to="/login" className="bb-auth-link">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
