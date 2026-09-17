import React from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "react-bootstrap";

import { logout } from "../../actions/authActions";
import VeyronMonogram from "../VeyronMonogram";
import NotificationBell from "../NotificationBell";

/**
 * The whole /admin shell: sidebar + topbar, with the matched admin page
 * rendered through <Outlet />. Mounted once in App.js as the element of the
 * parent "/admin" route, with every admin page as a nested child route -- see
 * App.js for the route tree.
 *
 * This intentionally does NOT reuse the customer <Header>/<Footer>: this is
 * staff software, not a page of the customer site, and it needs its own
 * fixed sidebar layout rather than a top nav bar. Header.js/Footer.js return
 * null on any /admin* path for exactly this reason -- see those files.
 */
const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/clients", label: "Clients" },
  { to: "/admin/barbers", label: "Barbers" },
  { to: "/admin/barber-approvals", label: "Barber Approvals" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/availability", label: "Availability" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/admin/audit-log", label: "Audit Log" },
];

// Longest matching `to` wins, so a detail route like /admin/clients/abc123
// still shows "Clients" as the page title.
const pageTitleFor = (pathname) => {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
  return match ? match.label : "Dashboard";
};

const today = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout(() => navigate("/login")));
  };

  return (
    <div className="bb-admin-shell">
      <aside className="bb-admin-sidebar">
        <Link to="/admin" className="bb-admin-brand">
          <VeyronMonogram />
          <span>VEYRON</span>
        </Link>

        <nav aria-label="Admin sections" className="bb-admin-nav">
          <ul className="list-unstyled">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    "bb-admin-nav-link" + (isActive ? " is-active" : "")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="bb-admin-sidebar-bottom">
          <div className="bb-admin-profile">
            <span className="bb-admin-profile-name">{user?.name}</span>
            <span className="bb-admin-profile-role">Admin</span>
          </div>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </aside>

      <div className="bb-admin-main">
        <header className="bb-admin-topbar">
          <div>
            <h1 className="bb-admin-page-title">{pageTitleFor(location.pathname)}</h1>
            <p className="bb-admin-date">{today()}</p>
          </div>

          <div className="bb-admin-topbar-actions">
            {/* The real notification bell (see NotificationBell.js) --
                replaces the old static "No notifications yet." placeholder
                now that admin_announcement / barber_application_received
                notifications actually exist and are stored per-admin. */}
            <NotificationBell />

            <Button as={Link} to="/admin/bookings?new=1" variant="primary">
              + New Booking
            </Button>
          </div>
        </header>

        <main className="bb-admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
