import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import { loadSession } from "./actions/authActions";
import { fetchPublicSettings } from "./actions/settingsActions";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

import HomePage from "./pages/HomePage";
import WelcomePage from "./pages/auth/WelcomePage";
import LoginPage from "./pages/auth/LoginPage";
import CustomerSignupPage from "./pages/auth/CustomerSignupPage";
import BarberSignupPage from "./pages/auth/BarberSignupPage";
import VerifyPage from "./pages/auth/VerifyPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import CompleteProfilePage from "./pages/auth/CompleteProfilePage";
import BarbersPage from "./pages/BarbersPage";
import BarberDetailPage from "./pages/BarberDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import BarberProfilePage from "./pages/BarberProfilePage";
import BarberServicesPage from "./pages/BarberServicesPage";
import BarberAppointmentsPage from "./pages/BarberAppointmentsPage";
import BarberStatusPage from "./pages/BarberStatusPage";

import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsPage from "./pages/legal/TermsPage";
import CookiePolicyPage from "./pages/legal/CookiePolicyPage";
import RefundPolicyPage from "./pages/legal/RefundPolicyPage";

import NotFoundPage from "./pages/NotFoundPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminClientDetailPage from "./pages/admin/AdminClientDetailPage";
import AdminBarbersPage from "./pages/admin/AdminBarbersPage";
import AdminBarberDetailPage from "./pages/admin/AdminBarberDetailPage";
import AdminBarberApprovalsPage from "./pages/admin/AdminBarberApprovalsPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminAvailabilityPage from "./pages/admin/AdminAvailabilityPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";

/**
 * Moves keyboard focus to the top of the page after each navigation.
 *
 * WHY THIS IS NEEDED:
 * In a normal website, clicking a link loads a new page and the browser resets
 * focus to the top. In a single-page React app nothing reloads, so focus stays
 * wherever it was. A screen-reader user clicks "Find a barber", the content
 * changes completely, and they hear nothing at all, because their focus is
 * still on the old link.
 *
 * Focusing the <main> element fixes it: the new page is announced and the next
 * Tab press continues from the top of the new content. This is one of the most
 * commonly missed accessibility bugs in React apps.
 */
const FocusOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) main.focus();
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const dispatch = useDispatch();

  /**
   * Ask the server once, on startup, whether anyone is logged in.
   *
   * The login token is in an httpOnly cookie that JavaScript cannot read, so
   * this request is the only way the app can know. A 401 here simply means
   * "not logged in" and is handled quietly.
   */
  useEffect(() => {
    dispatch(loadSession());
    // The live business details (name, contact info, ...) behind the
    // Footer and legal pages -- see hooks/useBusinessSettings.js for the
    // static fallback used until this resolves.
    dispatch(fetchPublicSettings());
  }, [dispatch]);

  return (
    <div className="bb-page">
      <FocusOnRouteChange />

      {/* First thing in the tab order: lets a keyboard user skip the nav. */}
      <a className="bb-skip-link" href="#main-content">
        Skip to main content
      </a>

      <Header />

      {/*
        A real <main> landmark, so assistive technology can jump straight to
        the content. tabIndex={-1} makes it focusable by script (for
        FocusOnRouteChange above) without adding it to the tab order.
      */}
      <main className="bb-main" id="main-content" tabIndex={-1}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/barbers" element={<BarbersPage />} />
          <Route path="/barbers/:barberId" element={<BarberDetailPage />} />
          {/* The entry screen: three separate doors rather than one form
              with a role picker in it. See pages/auth/WelcomePage.js. */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Two dedicated signup flows, deliberately separate routes
              rather than one form with a role picker. */}
          <Route path="/signup/customer" element={<CustomerSignupPage />} />
          <Route path="/signup/barber" element={<BarberSignupPage />} />

          {/* Verification needs a session (the code is sent to the
              logged-in account), so the page itself bounces a signed-out
              visitor to /login. */}
          <Route path="/verify" element={<VerifyPage />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Where a brand-new Google account lands if it has no phone
              number yet -- see auth/roleRoutes.js's homeRouteFor. */}
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          {/* RegisterPage.js -- the old single signup form with the
              customer/barber radio group -- is retired now that the two
              dedicated flows above have landed. It also could not have
              kept working: it watched state.auth.user to redirect after
              signing up, and registering no longer sets that (see
              actions/authActions.js) -- the account isn't created until
              /verify succeeds. A redirect, not a 404, for anyone with the
              old link bookmarked. */}
          <Route path="/register" element={<Navigate to="/welcome" replace />} />

          {/* Policies, public on purpose: someone must be able to read them
              BEFORE creating an account and agreeing to them. */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />

          {/* Customer only.
              Reminder: ProtectedRoute is a convenience, not security. The real
              check is requireAuth + requireRole on the server, on every
              request. See components/ProtectedRoute.js. */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          {/* The role-based landing route from the auth spec. Same page as
              /my-bookings rather than a copy of it -- a customer's bookings
              ARE their dashboard, and two components showing the same data
              would be two things to keep in step. /my-bookings stays valid
              so no existing link or bookmark breaks. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Barber only. barberActiveGate additionally requires
              status === "active" -- a pending/rejected/suspended barber is
              redirected to /barber/status instead. This is convenience only;
              the real enforcement is requireActiveBarber on the server (see
              middleware/auth.js). */}
          <Route
            path="/barber/profile"
            element={
              <ProtectedRoute allowedRoles={["barber"]} barberActiveGate>
                <BarberProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barber/services"
            element={
              <ProtectedRoute allowedRoles={["barber"]} barberActiveGate>
                <BarberServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/barber/appointments"
            element={
              <ProtectedRoute allowedRoles={["barber"]} barberActiveGate>
                <BarberAppointmentsPage />
              </ProtectedRoute>
            }
          />
          {/* The barber landing route from the auth spec. Appointments are
              what a barber opens the app to see, so this is that page
              rather than a new one. Still behind barberActiveGate: a
              pending or suspended barber is sent to /barber/status. */}
          <Route
            path="/barber/dashboard"
            element={
              <ProtectedRoute allowedRoles={["barber"]} barberActiveGate>
                <BarberAppointmentsPage />
              </ProtectedRoute>
            }
          />
          {/* Deliberately NOT barberActiveGate -- this is exactly the page a
              pending/rejected/suspended barber needs to reach. */}
          <Route
            path="/barber/status"
            element={
              <ProtectedRoute allowedRoles={["barber"]}>
                <BarberStatusPage />
              </ProtectedRoute>
            }
          />

          {/* Admin. /admin/login is public; everything else under /admin is
              gated by AdminProtectedRoute (role "admin" only) and rendered
              through AdminLayout's <Outlet /> -- see that file for the full
              nav list. Header/Footer render nothing on any /admin* path
              (see their own files), so this is a self-contained shell, not
              a page of the customer site. */}
          {/* <Route path="/admin/login" element={<AdminLoginPage />} /> */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="calendar" element={<AdminCalendarPage />} />
            <Route path="clients" element={<AdminClientsPage />} />
            <Route path="clients/:clientId" element={<AdminClientDetailPage />} />
            <Route path="barbers" element={<AdminBarbersPage />} />
            <Route path="barbers/:barberId" element={<AdminBarberDetailPage />} />
            <Route path="barber-approvals" element={<AdminBarberApprovalsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="availability" element={<AdminAvailabilityPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="audit-log" element={<AdminAuditLogPage />} />
          </Route>

          {/* Anything else */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
