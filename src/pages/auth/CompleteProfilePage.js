import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2, AlertTriangle } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import { completeProfile } from "../../actions/authActions";
import { validatePhone } from "../../auth/validation";
import { homeRouteFor } from "../../auth/roleRoutes";

/**
 * The one-field screen a brand-new Google account is sent to.
 *
 * ==========================================================================
 *  WHY THIS SCREEN EXISTS AT ALL
 * ==========================================================================
 *
 * Every account elsewhere in this app arrives with a phone number, because
 * a barber needs a way to reach a customer about their appointment. Google
 * never hands one over, so a brand-new "Sign in with Google" account is
 * real, logged in, and phone-less for a moment -- see
 * controllers/googleAuthController.js and models/User.js.
 *
 * This is the courtesy that closes that gap quickly, not the rule itself.
 * The actual enforcement is server-side: bookingController.createBooking
 * refuses to create a booking for an account with no phone regardless of
 * what page the browser happens to be showing (see auth/roleRoutes.js's
 * homeRouteFor, which is what sends a phone-less account here in the
 * first place -- also convenience, not security).
 */
const CompleteProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, error, fieldErrors } = useSelector((s) => s.auth);

  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState("");

  /** Nothing to complete: no session, or already has a phone. */
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.phone) {
      navigate(homeRouteFor(user), { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.phone) return null;

  const handleBlur = () => {
    setTouched(true);
    setLocalError(validatePhone(phone));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const problem = validatePhone(phone);
    setTouched(true);
    setLocalError(problem);
    if (problem) return;

    dispatch(
      completeProfile(phone, (updatedUser) =>
        navigate(homeRouteFor(updatedUser), { replace: true })
      )
    );
  };

  return (
    <AuthLayout variant="customer">
      <h1 className="bb-auth-title">One more thing</h1>
      <p className="bb-auth-sub">
        Add a phone number so your barber can reach you about your
        appointment. Google doesn't share one with us automatically.
      </p>

      {error && (
        <div className="bb-auth-alert bb-auth-alert-error" role="alert">
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Phone number"
          name="phone"
          type="tel"
          icon={Phone}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (touched) setLocalError(validatePhone(e.target.value));
          }}
          onBlur={handleBlur}
          error={fieldErrors.phone || localError}
          autoComplete="tel"
          placeholder="+216 12 345 678"
          required
        />

        <button type="submit" className="bb-auth-submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default CompleteProfilePage;
