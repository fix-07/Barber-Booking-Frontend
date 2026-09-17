import React from "react";

import ProtectedRoute from "./ProtectedRoute";

/**
 * Thin wrapper around ProtectedRoute for the /admin/* surface: same
 * session-loading and role-check logic, just fixed to role "admin", and
 * signed-out visitors are sent to /login.
 *
 * redirectWrongRole: a signed-in non-admin (customer/barber) hitting
 * /admin/* is sent straight to their own home page rather than shown
 * ProtectedRoute's generic "not available for your account" screen --
 * nobody who lands on /admin/* signed in as something else got there on
 * purpose, so there is nothing for that page to explain.
 *
 * Reminder from ProtectedRoute.js still applies here: this is convenience,
 * not security. The real barrier is requireAuth + requireRole("admin") on
 * every /api/admin/* route on the server.
 */
const AdminProtectedRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={["admin"]} loginPath="/login" redirectWrongRole>
    {children}
  </ProtectedRoute>
);

export default AdminProtectedRoute;
