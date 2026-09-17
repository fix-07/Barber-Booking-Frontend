import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Spinner, Alert } from "react-bootstrap";

import { homeRouteFor } from "../auth/roleRoutes";

/**
 * Wraps a page so only the right people can open it.
 *
 * ============================================================
 *  READ THIS BEFORE TRUSTING IT
 * ============================================================
 * This component is for CONVENIENCE, not security.
 *
 * Everything here runs in the visitor's own browser, where they can change it.
 * Anyone can open devtools, edit the Redux state, and make this component
 * render whatever it guards. They can also ignore the app entirely and call
 * the API with curl.
 *
 * The REAL protection is on the server: requireAuth and requireRole in
 * server/middleware/auth.js, checked on every single request. Even if someone
 * forces this component open, every API call inside the page comes back 401 or
 * 403 and they see nothing.
 *
 * So this exists to stop honest people landing on a page that cannot work for
 * them. It is not what keeps anyone out.
 */
const ProtectedRoute = ({
  children,
  allowedRoles,
  loginPath = "/login",
  barberActiveGate = false,
  redirectWrongRole = false,
}) => {
  const { user, hasCheckedSession } = useSelector((state) => state.auth);

  /**
   * Wait for the startup session check before deciding.
   *
   * Without this, a logged-in person pressing refresh would be bounced to the
   * login page for a moment, because on the first render we have not yet heard
   * back from /api/auth/me.
   *
   * Bootstrap's Spinner is decorative, so it carries aria-hidden and the real
   * message sits beside it in text. A spinner with no text tells a
   * screen-reader user nothing.
   */
  if (!hasCheckedSession) {
    return (
      <Container className="py-5">
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Checking your sign-in, one moment.</span>
        </div>
      </Container>
    );
  }

  /**
   * Not logged in: send them to log in.
   *
   * Deliberately carries no "come back here" state. Attaching one would
   * sit on the /login history entry after this redirect, and if a
   * DIFFERENT person then signs in from that same entry (e.g. one account
   * logs out from a gated page and another logs in right after), they
   * would inherit a destination that was never theirs -- see
   * pages/auth/LoginPage.js, which always routes by the signed-in role
   * instead.
   */
  if (!user) {
    return <Navigate to={loginPath} replace />;
  }

  // Logged in, but the wrong kind of account. For surfaces where showing
  // the "not available" explanation isn't wanted (see AdminProtectedRoute),
  // send them straight to the page their own role belongs on instead.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (redirectWrongRole) {
      return <Navigate to={homeRouteFor(user)} replace />;
    }

    return (
      <Container className="py-5">
        <h1>This page is not available for your account</h1>
        <Alert variant="secondary" role="status">
          <p className="mb-2">
            You are signed in as a {user.role} account. This page is only for{" "}
            {allowedRoles.join(" or ")} accounts.
          </p>
          <p className="mb-0">
            If you think this is wrong, contact the business directly.
          </p>
        </Alert>
      </Container>
    );
  }

  /**
   * BARBER APPROVAL GATE.
   *
   * A barber whose account is not "active" (still pending_approval,
   * rejected, or suspended -- see server/models/User.js's status field)
   * cannot use the barber dashboard. Redirecting here is convenience only:
   * the real enforcement is requireActiveBarber on the server (see
   * middleware/auth.js), checked independently on every request regardless
   * of what this component does. See App.js for which barber routes pass
   * barberActiveGate.
   */
  if (barberActiveGate && user.role === "barber" && user.status !== "active") {
    return <Navigate to="/barber/status" replace />;
  }

  return children;
};

export default ProtectedRoute;
