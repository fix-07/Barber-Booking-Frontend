/**
 * Whether Google Sign-In is configured for this deployment.
 *
 * One tiny shared check, so LoginPage.js and CustomerSignupPage.js agree
 * on whether to show the "or sign in with email" / "or create an account
 * with email" divider. Without this, the divider text rendered
 * unconditionally while GoogleSignInButton.js quietly rendered nothing
 * above it (correct behaviour when unconfigured) -- leaving a stray
 * "OR SIGN IN WITH EMAIL" heading with no button it was dividing anything
 * from.
 */
export const isGoogleSignInConfigured = () =>
  Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);
