import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Shield, Loader2, AlertTriangle, Check } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import VerificationCodeInput from "../../components/auth/VerificationCodeInput";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";
import {
  resetPassword,
  clearVerificationState,
} from "../../actions/verificationActions";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateVerificationCode,
  runValidators,
} from "../../auth/validation";

/**
 * Steps 3-5 of the reset: the code, the new password, and confirmation.
 *
 * The email is carried in router state from the previous screen, so the
 * usual path does not ask for it twice. It stays editable, because someone
 * arriving here directly (from a bookmark, or after a reload that cleared
 * the state) still needs to be able to fill it in.
 *
 * ==========================================================================
 *  NOT SIGNED IN ON SUCCESS, BY DESIGN
 * ==========================================================================
 *
 * The server issues no cookie here (see resetPassword in
 * verificationController.js), so this screen ends by sending the person to
 * sign in with the password they just chose. Logging them in automatically
 * would mean a single emailed code was enough to take over an account.
 * Making them use the new password proves they hold the thing they set.
 */
const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isSending, error, fieldErrors } = useSelector(
    (state) => state.verification
  );

  const [form, setForm] = useState({
    email: (location.state && location.state.email) || "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => () => dispatch(clearVerificationState()), [dispatch]);

  const validators = {
    email: () => validateEmail(form.email),
    code: () => validateVerificationCode(form.code),
    // strict: this IS a new password, so the full strength rule applies --
    // unlike the login screen, which must accept whatever already exists.
    password: () => validatePassword(form.password, { strict: true }),
    confirmPassword: () =>
      validateConfirmPassword(form.confirmPassword, form.password),
  };

  const change = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const blur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = runValidators(validators);
    setErrors(found);
    setTouched({ email: true, code: true, password: true, confirmPassword: true });
    if (Object.keys(found).length > 0) return;

    const ok = await dispatch(resetPassword(form));
    if (ok) setDone(true);
  };

  const errorFor = (f) => fieldErrors[f] || errors[f] || "";

  if (done) {
    return (
      <AuthLayout variant="signin">
        <div className="bb-auth-success">
          <span className="bb-auth-success-mark" aria-hidden="true">
            <Check size={26} strokeWidth={2.5} />
          </span>

          <h1 className="bb-auth-title">Password changed</h1>
          <p className="bb-auth-sub">
            Your password has been updated. Sign in with your new password to
            continue.
          </p>

          <button
            type="button"
            className="bb-auth-submit"
            onClick={() => navigate("/login", { replace: true })}
          >
            Go to sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="signin">
      <h1 className="bb-auth-title">Set a new password</h1>
      <p className="bb-auth-sub">
        Enter the code we emailed you, then choose a new password.
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
          value={form.email}
          onChange={change("email")}
          onBlur={blur("email")}
          error={errorFor("email")}
          autoComplete="email"
          required
        />

        <VerificationCodeInput
          value={form.code}
          onChange={(v) => setForm((prev) => ({ ...prev, code: v }))}
          error={errorFor("code")}
          disabled={isSending}
          label="Reset code"
        />

        <AuthField
          label="New password"
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
          label="Confirm new password"
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

        <button type="submit" className="bb-auth-submit" disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Change password"
          )}
        </button>
      </form>

      <div className="bb-auth-resend">
        <Link to="/forgot-password" className="bb-auth-link">
          Request a new code
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
