import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

import { logout } from "../actions/authActions";
import { isAuthRoute } from "../auth/isAuthRoute";
import NotificationBell from "./NotificationBell";

/**
 * Site header, built from React Bootstrap's Navbar.
 *
 * WHY THE BOOTSTRAP COMPONENT IS WORTH USING:
 * Navbar.Toggle and Navbar.Collapse give a working mobile menu with the
 * show/hide behaviour, the animation, and the collapsed styling already done.
 *
 * ============================================================
 *  TWO THINGS BOOTSTRAP DOES NOT DO, THAT WE ADD HERE
 * ============================================================
 *
 * 1. aria-expanded on the toggle button.
 *
 *    I checked React Bootstrap's source: NavbarToggle adds aria-label and a
 *    "collapsed" CSS class, and that is the ONLY aria attribute it sets. So
 *    the open/closed state is communicated visually but not to assistive
 *    technology, and a screen-reader user pressing the button is told nothing
 *    about whether the menu opened.
 *
 *    To fix it we control the Navbar ourselves with `expanded` state and pass
 *    aria-expanded through. This is a good example of why you still have to
 *    check a component library rather than assume it handles everything.
 *
 * 2. Closing the menu after you tap a link.
 *
 *    Bootstrap's collapse has no idea that React Router changed the page, so
 *    on a phone the menu would stay open on top of the new page. We close it
 *    on every link click.
 *
 * We also pass `as={NavLink}` on each link. That is React Router's NavLink,
 * which sets aria-current="page" for the page you are on. Our theme.css shows
 * that with an underline as well as a colour, so it never depends on colour
 * alone.
 */
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Controlling this ourselves is what makes aria-expanded possible.
  const [expanded, setExpanded] = useState(false);

  /**
   * The header sits transparent over the top of the hero and picks up a
   * solid ground and a hairline once the page scrolls, so the top of the
   * site reads as one composition rather than a bar stuck above it.
   *
   * The listener is passive, so it cannot block scrolling, and it only ever
   * flips a boolean -- React skips the re-render when the value has not
   * actually changed, so this does not re-render on every scroll event.
   */
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The admin section is staff software with its own shell (see
  // components/admin/AdminLayout.js), not a page of the customer site --
  // it renders no customer nav at all.
  if (location.pathname.startsWith("/admin")) return null;

  // The authentication pages are a full-screen split layout that provides
  // its own brand mark -- see auth/isAuthRoute.js.
  if (isAuthRoute(location.pathname)) return null;

  const closeMenu = () => setExpanded(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout(() => navigate("/")));
  };

  return (
    <Navbar
      expand="lg"
      className={"bb-navbar" + (isScrolled ? " is-scrolled" : "")}
      variant="dark"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          onClick={closeMenu}
          className="d-flex align-items-center gap-2 fw-bold"
        >
          {/* Decorative: the word "VEYRON" already names the link, so
              announcing the icon too would just repeat it. */}
          <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <rect x="14" y="17" width="36" height="7" rx="2" fill="#C8A96A" />
            <rect x="17" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
            <rect x="25" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
            <rect x="33" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
            <rect x="41" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
          </svg>
          VEYRON
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="main-navigation"
          // Added by us. React Bootstrap does not set this itself.
          aria-expanded={expanded}
          label={expanded ? "Close the main menu" : "Open the main menu"}
        />

        <Navbar.Collapse id="main-navigation">
          <Nav className="ms-auto align-items-lg-center gap-lg-1">
            <Nav.Link as={NavLink} to="/barbers" onClick={closeMenu}>
              Find a barber
            </Nav.Link>

            {/*
              Sign In only -- no separate "Create account" link. The Sign
              In page itself (LoginPage.js) is where "Create Customer
              Account" and "Join as a Barber" live as two clearly separate
              choices, exactly the way WelcomePage.js already presents
              them. Putting a second signup entry point in the nav bar
              would just be a shortcut around that choice, not a shorter
              path to the same place.
            */}
            {!user && (
              <Nav.Link as={NavLink} to="/login" onClick={closeMenu}>
                Sign In
              </Nav.Link>
            )}

            {user && user.role === "customer" && (
              <Nav.Link as={NavLink} to="/my-bookings" onClick={closeMenu}>
                My bookings
              </Nav.Link>
            )}

            {user && user.role === "barber" && (
              <>
                <Nav.Link as={NavLink} to="/barber/appointments" onClick={closeMenu}>
                  Appointments
                </Nav.Link>
                <Nav.Link as={NavLink} to="/barber/services" onClick={closeMenu}>
                  My services
                </Nav.Link>
                <Nav.Link as={NavLink} to="/barber/profile" onClick={closeMenu}>
                  Shop profile
                </Nav.Link>
              </>
            )}

            {user && (
              <span className="my-2 my-lg-0">
                <NotificationBell />
              </span>
            )}

            {user && (
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleLogout}
                className="ms-lg-2 my-2 my-lg-0"
              >
                Log out
                {/* Names whose session ends, for anyone hearing the page. */}
                <span className="visually-hidden"> of {user.name}'s account</span>
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
