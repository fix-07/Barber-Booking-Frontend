import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

import Placeholder from "./Placeholder";
import useBusinessSettings from "../hooks/useBusinessSettings";
import { isAuthRoute } from "../auth/isAuthRoute";

/**
 * Site footer.
 *
 * Mirrors the header's brand mark, the way the reference site's footer
 * repeats its header rather than treating the footer as an afterthought of
 * plain links. Four columns instead of three: the brand gets its own column
 * with the mark, the wordmark and one factual line, so the footer reads as
 * the close of the page rather than a list that happens to sit at the
 * bottom of it.
 *
 * A NOTE ON WHAT THIS DOES AND DOES NOT MEAN:
 * Linking these four policy pages is normal and expected for a booking site.
 * It does NOT by itself make the site compliant with any law. What matters
 * is whether the content of those pages is accurate for your business, which
 * a qualified local lawyer should check. There is no "we are compliant"
 * claim anywhere on this site, on purpose.
 */
const Footer = () => {
  const location = useLocation();
  // Called before the early return below: hooks must run unconditionally
  // on every render.
  const business = useBusinessSettings();

  // Same reasoning as Header.js: the admin section has its own shell and
  // renders no customer chrome.
  if (location.pathname.startsWith("/admin")) return null;

  // The authentication pages are a full-screen split layout that provides
  // its own brand mark -- see auth/isAuthRoute.js.
  if (isAuthRoute(location.pathname)) return null;

  return (
  <footer className="bb-footer">
    <Container className="bb-footer-inner">
      <Row className="gy-5">
        <Col lg={4}>
          <Link to="/" className="bb-footer-brand">
            <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <rect x="14" y="17" width="36" height="7" rx="2" fill="#C8A96A" />
              <rect x="17" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="25" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="33" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
              <rect x="41" y="26" width="4" height="21" rx="1.6" fill="#C8A96A" />
            </svg>
            VEYRON
          </Link>
          <p className="bb-footer-tagline">
            <Placeholder value={business.name} /> is a service for finding a
            barber and booking an appointment online.
          </p>
        </Col>

        <Col sm={6} lg={3}>
          {/* Real headings, so a screen reader can list the footer sections. */}
          <h2>Booking</h2>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <Link to="/barbers">Find a barber</Link>
            </li>
            <li className="mb-2">
              <Link to="/register?role=barber">Become a barber</Link>
            </li>
            <li className="mb-2">
              <Link to="/login">Log in</Link>
            </li>
          </ul>
        </Col>

        <Col sm={6} lg={2}>
          <h2>Policies</h2>
          <ul className="list-unstyled mb-0">
            <li className="mb-2">
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li className="mb-2">
              <Link to="/terms">Terms and Conditions</Link>
            </li>
            <li className="mb-2">
              <Link to="/cookie-policy">Cookie Policy</Link>
            </li>
            <li className="mb-2">
              <Link to="/refund-policy">Refund Policy</Link>
            </li>
          </ul>
        </Col>

        <Col sm={6} lg={3}>
          <h2>Contact</h2>
          {/* <address> is the correct element for the page owner's contact
              details. Screen readers announce it as contact information.
              Bootstrap's .fst-normal removes the browser's default italics. */}
          <address className="fst-normal mb-0">
            <div className="mb-2">
              <Placeholder value={business.address} />
            </div>
            <div className="mb-2">
              Email: <Placeholder value={business.email} />
            </div>
            <div className="mb-2">
              Phone: <Placeholder value={business.phone} />
            </div>
            <div>
              Hours: <Placeholder value={business.hours} />
            </div>
          </address>
        </Col>
      </Row>

      <div className="bb-footer-rule" />

      <div className="bb-footer-bottom">
        <p className="mb-0 small">
          <Placeholder value={business.name} />
        </p>
        <p className="mb-0 small">
          Policies last reviewed: <Placeholder value={business.policyUpdated} />
        </p>
      </div>
    </Container>
  </footer>
  );
};

export default Footer;
