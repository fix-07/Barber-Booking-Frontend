/**
 * Where each role belongs after signing in.
 *
 * ==========================================================================
 *  THIS IS NAVIGATION, NOT SECURITY
 * ==========================================================================
 *
 * Nothing in this file protects anything. It decides which URL to send a
 * browser to, and a browser can be pointed anywhere regardless. The actual
 * enforcement is on the server, on every request:
 *
 *   requireAuth          there is a valid session          middleware/auth.js
 *   requireRole          this role may call this route     middleware/auth.js
 *   requireActiveBarber  barber is approved, not pending   middleware/auth.js
 *   adminOnly            mounted in front of every
 *                        /api/admin/* router               server.js
 *
 * Those run whether or not this file exists, and they read the role from
 * the database rather than from the token, so a stale token cannot carry an
 * old role. A customer who types /admin sees the admin shell fail to load
 * anything, because every request it makes is refused.
 *
 * ==========================================================================
 *  WHY A BARBER DOES NOT GO STRAIGHT TO THE DASHBOARD
 * ==========================================================================
 *
 * A barber's account exists the moment they register, but their PROFILE is
 * an application waiting for an admin. Sending a pending barber to the
 * dashboard would show them a shell full of routes the server refuses.
 * They go to their status page instead, which tells them where the
 * application stands -- and which forwards an already-approved barber
 * straight on, so an active barber never notices it.
 */

/** Unverified accounts finish verification before anything else. */
export const VERIFY_ROUTE = "/verify";

/**
 * A brand-new Google account has no phone number -- Google never hands one
 * over (see controllers/googleAuthController.js). Every LOCAL account
 * already has one by the time it exists at all, so this only ever
 * actually redirects a Google sign-in that has not yet finished its
 * profile.
 *
 * This is the convenience redirect, not the rule: the real enforcement is
 * server-side, in bookingController.createBooking, which refuses to
 * create a booking for an account with no phone regardless of what route
 * the browser happens to be on.
 */
export const COMPLETE_PROFILE_ROUTE = "/complete-profile";

export const homeRouteFor = (user) => {
  if (!user) return "/login";

  // Verification first, for the roles it applies to. An admin account is
  // created directly in the database and has no signup flow to verify
  // through, so it is never held here. A Google account is also skipped:
  // Google's own verification IS what emailVerified:true records for it
  // (see googleAuthController.js), so it never needs this screen.
  if (
    user.authProvider !== "google" &&
    user.role !== "admin" &&
    user.emailVerified === false
  ) {
    return VERIFY_ROUTE;
  }

  if (!user.phone && user.role !== "admin") {
    return COMPLETE_PROFILE_ROUTE;
  }

  if (user.role === "admin") return "/admin";

  if (user.role === "barber") {
    // Anything other than an approved, active barber needs the status page,
    // which is the only barber route not behind the active gate.
    return user.status === "active" ? "/barber/dashboard" : "/barber/status";
  }

  return "/dashboard";
};
