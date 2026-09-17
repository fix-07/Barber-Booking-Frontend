import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Store,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthField from "../../components/auth/AuthField";
import LocationField from "../../components/auth/LocationField";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";
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
 * Barber registration: a multi-step application, separate from customer
 * signup because it genuinely is a different thing.
 *
 * ==========================================================================
 *  WHY THIS IS STEPPED AND CUSTOMER SIGNUP IS NOT
 * ==========================================================================
 *
 * A customer needs five fields. A barber is submitting an APPLICATION that
 * an admin will review: who they are, how to reach them, what they do, and
 * where. Putting fourteen fields on one screen is how people abandon a
 * form. Splitting it means each screen asks one coherent question, and the
 * progress indicator shows that the end is in sight.
 *
 * ==========================================================================
 *  WHAT HAPPENS AFTER SUBMIT
 * ==========================================================================
 *
 *   register -> NO account yet. A PendingRegistration is stored and a
 *            code is emailed -- see server/controllers/
 *            pendingRegistrationController.js. Sent to /verify.
 *   verify   -> ONLY NOW: account created (status "pending_approval") and
 *            BarberProfile created as the application, together, in one
 *            step. Signed in immediately after.
 *            -> /barber/status shows "pending review"
 *
 * Abandon the form before entering the code, or get the code wrong five
 * times, or let it expire, and NOTHING was created -- no account, no
 * BarberProfile, nothing for the same email to collide with on a second
 * attempt.
 *
 * The barber can reach their account but is NOT publicly visible until an
 * admin approves them. That gate is enforced on the server by
 * requireActiveBarber (middleware/auth.js) and by the isPublished +
 * status filter on the public listing -- not by this form.
 *
 * ==========================================================================
 *  NOT YET IMPLEMENTED HERE, AND SAID PLAINLY
 * ==========================================================================
 *
 * Profile PHOTO is a link, not an upload. Real file upload needs a storage
 * endpoint on the server (multer, type and size validation, serving from
 * our own origin) which does not exist yet. A file input that dropped the
 * file on the floor would be worse than a field that says what it is.
 *
 * LOCATION does have real suggestions and a real map now -- see
 * LocationField.js (free OpenStreetMap/Nominatim search, proxied through
 * controllers/geocodeController.js) and BarberMap.js (Leaflet). Typing a
 * city and picking a suggestion is what sets real, confirmed coordinates;
 * typing without picking one still saves the city as plain text, honestly,
 * with no map shown for it -- see BarberProfile.locationConfirmed.
 */

const STEPS = [
  { id: "profile", label: "Profile" },
  { id: "contact", label: "Contact" },
  { id: "professional", label: "Professional" },
  { id: "review", label: "Review" },
];

/** Offered as suggestions; the barber can also type their own. */
const SPECIALTY_OPTIONS = [
  "Classic cuts",
  "Modern cuts",
  "Fades",
  "Beard grooming",
  "Hair styling",
];

const BarberSignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // From the VERIFICATION slice, not auth -- see the matching comment in
  // CustomerSignupPage.js. Submitting this form only starts a signup; it
  // creates no account and no session, so state.auth never sees it.
  const { isSending: isLoading, error, fieldErrors } = useSelector(
    (s) => s.verification
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    // 01 profile
    name: "",
    bio: "",
    photoUrl: "",
    // 02 contact
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // 03 professional
    specialties: [],
    experience: "",
    shopName: "",
    city: "",
    region: "",
    country: "",
    addressLine: "",
    latitude: null,
    longitude: null,
    locationConfirmed: false,
    // The browser already knows this. Pre-filling it saves the barber
    // guessing at an IANA timezone name, and it stays editable.
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    requestedServices: "",
    // 04 review
    agreeToTerms: false,
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearVerificationState());
  }, [dispatch]);

  const validators = useMemo(
    () => ({
      name: () => validateName(form.name),
      email: () => validateEmail(form.email),
      phone: () => validatePhone(form.phone),
      password: () => validatePassword(form.password, { strict: true }),
      confirmPassword: () =>
        validateConfirmPassword(form.confirmPassword, form.password),
      shopName: () =>
        form.shopName.trim().length < 2
          ? "Shop or business name is required"
          : "",
      city: () => (form.city.trim().length < 2 ? "City or town is required" : ""),
      timeZone: () => (form.timeZone.trim() ? "" : "Timezone is required"),
      agreeToTerms: () => validateAgreeToTerms(form.agreeToTerms),
    }),
    [form]
  );

  // Which validators each step is responsible for. "Next" only checks the
  // step you are on, so you are never blocked by a field you have not
  // reached yet.
  const STEP_FIELDS = {
    profile: ["name"],
    contact: ["email", "phone", "password", "confirmPassword"],
    professional: ["shopName", "city", "timeZone"],
    review: ["agreeToTerms"],
  };

  const step = STEPS[stepIndex];

  const change = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const blur = (field) => () => {
    if (!validators[field]) return;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validators[field]() }));
  };

  const toggleSpecialty = (item) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(item)
        ? prev.specialties.filter((s) => s !== item)
        : [...prev.specialties, item],
    }));
  };

  /** Validates only the current step, then advances. */
  const goNext = () => {
    const fields = STEP_FIELDS[step.id];
    const subset = {};
    fields.forEach((f) => {
      if (validators[f]) subset[f] = validators[f];
    });

    const found = runValidators(subset);
    setErrors((prev) => ({ ...prev, ...found }));
    setTouched((prev) => ({
      ...prev,
      ...fields.reduce((all, f) => ({ ...all, [f]: true }), {}),
    }));

    if (Object.keys(found).length > 0) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const parseList = (text) =>
    text.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Everything, not just this step -- a field left invalid two steps back
    // must not slip through because the last step was fine.
    const found = runValidators(validators);
    setErrors(found);
    setTouched(
      Object.keys(validators).reduce((all, k) => ({ ...all, [k]: true }), {})
    );

    if (Object.keys(found).length > 0) {
      // Send them to the earliest step that has a problem, rather than
      // showing an error on a screen they cannot see.
      const firstBad = STEPS.findIndex((s) =>
        STEP_FIELDS[s.id].some((f) => found[f])
      );
      if (firstBad >= 0) setStepIndex(firstBad);
      return;
    }

    dispatch(
      register(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "barber",
          acceptedPolicies: form.agreeToTerms,
          shopName: form.shopName,
          city: form.city,
          region: form.region || undefined,
          country: form.country || undefined,
          addressLine: form.addressLine || undefined,
          latitude: form.locationConfirmed ? form.latitude : undefined,
          longitude: form.locationConfirmed ? form.longitude : undefined,
          locationConfirmed: form.locationConfirmed,
          timeZone: form.timeZone,
          bio: form.bio || undefined,
          experience: form.experience || undefined,
          specialties: form.specialties,
          requestedServices: parseList(form.requestedServices),
          photoUrl: form.photoUrl || undefined,
        },
        // See the matching comment in CustomerSignupPage.js: submitting
        // only starts the application now, so navigation happens here
        // explicitly rather than by watching state.auth.user.
        () => navigate("/verify", { replace: true, state: { email: form.email } })
      )
    );
  };

  const errorFor = (f) => fieldErrors[f] || errors[f] || "";

  return (
    <AuthLayout variant="barber" wide>
      <h1 className="bb-auth-title">Build your professional profile</h1>
      <p className="bb-auth-sub">
        Join the network and let customers discover your work.
      </p>

      {/* Progress. A subtle numbered index, not a large bar. aria-current
          marks the active step for assistive technology. */}
      <ol className="bb-steps-indicator">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            className={
              "bb-step-chip" +
              (i === stepIndex ? " is-current" : "") +
              (i < stepIndex ? " is-done" : "")
            }
            aria-current={i === stepIndex ? "step" : undefined}
          >
            <span className="bb-step-chip-num">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="bb-step-chip-label">{s.label}</span>
          </li>
        ))}
      </ol>

      {error && (
        <div className="bb-auth-alert bb-auth-alert-error" role="alert">
          <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ------------------------- 01 PROFILE ------------------------ */}
        {step.id === "profile" && (
          <fieldset className="bb-fieldset">
            <legend className="bb-legend">Your profile</legend>

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
              label="Short bio"
              name="bio"
              as="textarea"
              rows={4}
              value={form.bio}
              onChange={change("bio")}
              error={errorFor("bio")}
              placeholder="Tell customers briefly about your experience and style."
              hint="Optional. Shown on your public profile once approved."
            />

            <AuthField
              label="Profile photo link"
              name="photoUrl"
              value={form.photoUrl}
              onChange={change("photoUrl")}
              error={errorFor("photoUrl")}
              placeholder="https://..."
              hint="Optional, and a link for now — direct photo upload is not built yet."
            />
          </fieldset>
        )}

        {/* ------------------------- 02 CONTACT ------------------------ */}
        {step.id === "contact" && (
          <fieldset className="bb-fieldset">
            <legend className="bb-legend">Contact information</legend>

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
              required
            />

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
        )}

        {/* ---------------------- 03 PROFESSIONAL ---------------------- */}
        {step.id === "professional" && (
          <fieldset className="bb-fieldset">
            <legend className="bb-legend">Professional information</legend>

            {/* A real fieldset+legend, so the group is announced as one
                question rather than five loose checkboxes. */}
            <fieldset className="bb-chipset">
              <legend className="bb-authfield-label">
                Specialties
                <span className="bb-authfield-hint-inline">
                  Choose any that apply
                </span>
              </legend>

              <div className="bb-chip-row">
                {SPECIALTY_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={
                      "bb-chip" +
                      (form.specialties.includes(item) ? " is-on" : "")
                    }
                  >
                    <input
                      type="checkbox"
                      className="visually-hidden"
                      checked={form.specialties.includes(item)}
                      onChange={() => toggleSpecialty(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <AuthField
              label="Years of experience"
              name="experience"
              value={form.experience}
              onChange={change("experience")}
              error={errorFor("experience")}
              placeholder="e.g. 6 years, mostly in classic barbering"
              hint="Optional. Free text — the admin reads this when reviewing."
            />

            <AuthField
              label="Shop or business name"
              name="shopName"
              icon={Store}
              value={form.shopName}
              onChange={change("shopName")}
              onBlur={blur("shopName")}
              error={errorFor("shopName")}
              required
            />

            <LocationField
              value={{
                city: form.city,
                region: form.region,
                country: form.country,
                latitude: form.latitude,
                longitude: form.longitude,
                locationConfirmed: form.locationConfirmed,
              }}
              onChange={(location) =>
                setForm((prev) => ({ ...prev, ...location }))
              }
              error={errorFor("city")}
              required
            />

            <AuthField
              label="Street address"
              name="addressLine"
              value={form.addressLine}
              onChange={change("addressLine")}
              error={errorFor("addressLine")}
              hint="Optional. Street-level detail -- your city above is what shows on the map."
            />

            <AuthField
              label="Timezone"
              name="timeZone"
              value={form.timeZone}
              onChange={change("timeZone")}
              onBlur={blur("timeZone")}
              error={errorFor("timeZone")}
              hint="Detected from your browser. Used to work out your opening hours."
              required
            />

            <AuthField
              label="Services you plan to offer"
              name="requestedServices"
              value={form.requestedServices}
              onChange={change("requestedServices")}
              error={errorFor("requestedServices")}
              placeholder="Skin fade, Beard trim, Hot towel shave"
              hint="Optional, comma separated. You set exact prices and durations after approval."
            />
          </fieldset>
        )}

        {/* -------------------------- 04 REVIEW ------------------------ */}
        {step.id === "review" && (
          <fieldset className="bb-fieldset">
            <legend className="bb-legend">Review your application</legend>

            <dl className="bb-review">
              <div>
                <dt>Name</dt>
                <dd>{form.name || "—"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{form.email || "—"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{form.phone || "—"}</dd>
              </div>
              <div>
                <dt>Shop</dt>
                <dd>{form.shopName || "—"}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>
                  {[form.addressLine, form.city].filter(Boolean).join(", ") ||
                    "—"}
                </dd>
              </div>
              <div>
                <dt>Specialties</dt>
                <dd>
                  {form.specialties.length
                    ? form.specialties.join(", ")
                    : "None selected"}
                </dd>
              </div>
            </dl>

            <div className="bb-auth-alert bb-auth-alert-info">
              <AlertTriangle size={16} strokeWidth={2} aria-hidden="true" />
              <span>
                Your profile is reviewed by an admin before it becomes visible
                to customers. You'll be able to sign in straight away and see
                your application status.
              </span>
            </div>

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
          </fieldset>
        )}

        {/* ------------------------ step controls ---------------------- */}
        <div className="bb-step-nav">
          {stepIndex > 0 && (
            <button type="button" className="bb-auth-back" onClick={goBack}>
              <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
              Back
            </button>
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button type="button" className="bb-auth-submit" onClick={goNext}>
              Continue
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="bb-auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="bb-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                "Submit application"
              )}
            </button>
          )}
        </div>
      </form>

      <div className="bb-auth-foot">
        <p className="bb-auth-foot-label">
          Already have an account?{" "}
          <Link to="/login" className="bb-auth-link">
            Sign in
          </Link>
        </p>
        <p className="bb-auth-foot-label">
          Looking to book instead?{" "}
          <Link to="/signup/customer" className="bb-auth-link">
            Create a customer account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default BarberSignupPage;
