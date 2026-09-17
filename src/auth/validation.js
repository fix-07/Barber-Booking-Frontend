import {
  calculatePasswordStrength,
  MIN_ACCEPTABLE_SCORE,
} from "./passwordStrength";

/**
 * Field validation for every authentication screen.
 *
 * PORTED FROM THE SUPPLIED AuthForm. The rules, the regexes and the error
 * wording are carried over as they were; what changed is the shape.
 *
 * The original had one validateField with a switch over every field, which
 * closed over the component's authMode and registrationStep. That works
 * when there is a single component doing login, signup and reset. This app
 * now has six separate screens, so instead each rule is its own small
 * function and each screen composes the ones it actually uses. Same logic,
 * no hidden dependency on which mode a shared component happens to be in.
 *
 * TWO DELIBERATE CHANGES, both required by the brief:
 *
 *   phone  The original treated phone as optional ("Phone Number
 *          (Optional)"). This platform requires it -- a barber needs to
 *          reach a customer about a change on the day -- and the server
 *          already refuses a signup without one (routes/authRoutes.js).
 *          A browser rule that disagreed with the server would just be a
 *          confusing round trip.
 *
 *   phone  The character set is narrowed to match the server's regex
 *   chars  exactly, so the same value cannot pass here and fail there.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches server/routes/authRoutes.js: digits, spaces, + ( ) and -.
const PHONE_PATTERN = /^[0-9+()\-\s]+$/;

export const validateName = (value) => {
  if (!String(value).trim()) return "Name is required";
  if (String(value).trim().length < 2) return "Name must be at least 2 characters";
  return "";
};

export const validateEmail = (value) => {
  if (!value || !String(value).trim()) return "Email is required";
  if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address";
  return "";
};

/**
 * `strict` applies the signup rule (strength must reach MIN_ACCEPTABLE_SCORE).
 * Login passes strict=false: rejecting an existing password for being weak
 * would lock people out of accounts they already have.
 */
export const validatePassword = (value, { strict = false } = {}) => {
  if (!value) return "Password is required";
  if (String(value).length < 8) return "Password must be at least 8 characters";

  if (strict) {
    const { score } = calculatePasswordStrength(String(value));
    if (score < MIN_ACCEPTABLE_SCORE) return "Password is too weak";
  }

  return "";
};

export const validateConfirmPassword = (value, password) => {
  if (!value) return "Please confirm your password";
  if (value !== password) return "Passwords do not match";
  return "";
};

export const validatePhone = (value) => {
  if (!String(value).trim()) return "Phone number is required";
  if (!PHONE_PATTERN.test(value)) return "Please enter a valid phone number";
  return "";
};

export const validateVerificationCode = (value) => {
  if (!/^\d{6}$/.test(String(value))) return "Verification code must be 6 digits";
  return "";
};

export const validateAgreeToTerms = (value) => {
  if (!value) return "You must agree to the terms and conditions";
  return "";
};

/**
 * Runs a set of rules and returns { field: message } for the ones that fail.
 *
 * `rules` is an object of field -> function returning "" or a message.
 */
export const runValidators = (rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, check]) => {
    const message = check();
    if (message) errors[field] = message;
  });

  return errors;
};

/**
 * The touched-then-live behaviour from the original, as a hook-friendly
 * helper: a field says nothing until you leave it, and from then on it
 * updates as you type.
 *
 * This is the interaction detail worth preserving from the supplied form.
 * Validating on every keystroke from the first character tells someone
 * their email is invalid while they are still typing the first letter of
 * it; waiting until submit hides every problem until the end. Blur-then-
 * live is the middle, and it is what the brief means by "validate fields
 * naturally when the user leaves them".
 */
export const shouldShowError = (field, touched) => Boolean(touched[field]);
