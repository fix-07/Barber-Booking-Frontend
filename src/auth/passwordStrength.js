/**
 * Password strength.
 *
 * PORTED FROM THE SUPPLIED AuthForm, deliberately unchanged in behaviour.
 * The five requirements, the score as "how many are met", and the feedback
 * wording are all exactly as they were in premium-auth.tsx. The only edits
 * are mechanical: TypeScript types removed, and the whole thing pulled out
 * into its own module so the login page, both signup flows and the password
 * reset screen all measure strength the same way instead of each having
 * their own copy.
 *
 * WHY IT LIVES ALONE IN A FILE: this is the rule that decides whether a
 * password is acceptable, and it has to agree with the server. Keeping it
 * in one place means there is one thing to change when that rule changes.
 * The server's own floor (8-72 characters) is enforced independently in
 * routes/authRoutes.js -- the browser deciding a password is strong is a
 * convenience, never the control.
 */

export const calculatePasswordStrength = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const feedback = [];

  if (!requirements.length) feedback.push("At least 8 characters");
  if (!requirements.uppercase) feedback.push("One uppercase letter");
  if (!requirements.lowercase) feedback.push("One lowercase letter");
  if (!requirements.number) feedback.push("One number");
  if (!requirements.special) feedback.push("One special character");

  return { score, feedback, requirements };
};

/**
 * The label for a score.
 *
 * Same five bands as the original. The words are what the person reads, so
 * they are kept identical rather than reworded.
 */
export const strengthLabel = (score) => {
  if (score <= 1) return "Very weak";
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Good";
  return "Strong";
};

/**
 * Which CSS modifier the meter uses for a score.
 *
 * The original mapped these to Tailwind colour utilities
 * (text-destructive, text-orange-500, ...). Here they become class names so
 * the colours come from the design tokens in veyron.css, which are the ones
 * that have been contrast-checked against this app's dark background.
 *
 * The meter is never the ONLY signal: the label above spells the strength
 * out in words, so the bar's colour is reinforcement rather than the
 * message. That matters for anyone who cannot separate red from green.
 */
export const strengthVariant = (score) => {
  if (score <= 1) return "danger";
  if (score <= 2) return "warn";
  if (score <= 3) return "fair";
  if (score <= 4) return "good";
  return "strong";
};

/** The signup threshold from the original: below 3 is rejected as too weak. */
export const MIN_ACCEPTABLE_SCORE = 3;
