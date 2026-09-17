import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";

import { fetchBarbers } from "../actions/barberActions";
import BarberCarousel from "../components/BarberCarousel";
import Alert from "../components/Alert";
import FeatureCard from "../components/FeatureCard";
import RevealOnScroll from "../components/RevealOnScroll";
import HeroDiscoveryPanel from "../components/home/HeroDiscoveryPanel";
import {
  ClockIcon,
  PriceTagIcon,
  CalendarCheckIcon,
  VisibilityIcon,
} from "../components/homeFeatureIcons";

/**
 * What the barber dashboard actually does, used by the "For barbers" section
 * below. Every line here is checkable against the real code:
 *   - hours + publish/accepting toggles: server/models/BarberProfile.js
 *   - service price and duration: server/models/Service.js
 *   - bookings starting as "pending" until confirmed: server/models/Booking.js
 * Nothing here is a claim about how good the dashboard is, only a statement
 * of what it does.
 */
const BARBER_FEATURES = [
  {
    icon: <ClockIcon />,
    title: "Set your own hours",
    description:
      "Choose which days you're open and when. Customers can only book inside the hours you set.",
  },
  {
    icon: <PriceTagIcon />,
    title: "List services and prices",
    description:
      "Add each service with its price and how long it takes, so customers know exactly what to expect before they book.",
  },
  {
    icon: <CalendarCheckIcon />,
    title: "Confirm each booking",
    description:
      "New requests wait for your confirmation before they're agreed, so nothing is booked without you seeing it first.",
  },
  {
    icon: <VisibilityIcon />,
    title: "Control your visibility",
    description:
      "Publish your shop when you're ready, and turn off new bookings any time you need a break.",
  },
];

const STEPS = [
  {
    title: "Browse barbers",
    text: "Search by town or city and open a barber's page to see their services, prices and opening hours.",
  },
  {
    title: "Pick a service",
    text: "Each service shows how long it takes and what it costs, so you know before you book.",
  },
  {
    title: "Choose a time",
    text: "Only times the barber is actually free are offered. Times already booked cannot be selected.",
  },
  {
    title: "Get confirmation",
    text: "Your request goes to the barber. It is confirmed once they accept it, and you can check the status any time under My bookings.",
  },
];

/**
 * Home page.
 *
 * WHAT IS DELIBERATELY NOT ON THIS PAGE:
 *
 * No review quotes, no star ratings, no "trusted by 2,000 customers", no
 * booking counter, no "only 3 slots left", no awards. Every one of those would
 * be a number I made up. Inventing them is dishonest, and in many places
 * inventing reviews or urgency is a consumer-protection problem too.
 *
 * The barbers below are REAL records from your database. If none exist yet,
 * the page says so plainly rather than filling the space with fiction. Once
 * real barbers sign up, this section fills itself.
 *
 * That applies to the hero panel too: rather than a mocked-up "example"
 * barber card, it shows a real barber, a real service price, and a real free
 * appointment -- see HeroDiscoveryPanel.js. When there are no barbers yet the
 * hero is a single column and the panel is simply absent, which is honest and
 * still composes.
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const { list, isLoading, error } = useSelector((state) => state.barbers);

  useEffect(() => {
    dispatch(fetchBarbers({ limit: 6 }));
  }, [dispatch]);

  const featured = list.slice(0, 6);
  const spotlight = featured[0] || null;

  return (
    <>
      {/* ---------------------------- Hero -----------------------------
          Left: the editorial headline and the two things a visitor can do.
          Right: a composed panel assembled from several connected pieces of
          real data -- who, where, what, and when -- instead of one large
          photograph. */}
      <section className="bb-hero">
        <Container>
          <div className={"bb-hero-grid" + (spotlight ? "" : " bb-hero-grid-single")}>
            <div>
              <p className="v-eyebrow">The barber discovery experience</p>
              <h1 className="bb-hero-title">
                <span>Find the barber</span>
                <span>you'd have asked</span>
                <span className="bb-hero-title-accent">a friend for.</span>
              </h1>
              <p className="bb-hero-lead">
                Browse the barbers on the platform, see exactly what each one
                charges and when they're free, and book the time you want
                without a single phone call.
              </p>
              <div className="bb-hero-actions">
                <Button as={Link} to="/barbers" variant="primary" size="lg">
                  Find a barber
                </Button>
                <Button
                  as={Link}
                  to="/register?role=barber"
                  variant="outline-light"
                  size="lg"
                >
                  Join as a barber
                </Button>
              </div>
            </div>

            {spotlight && (
              <div className="bb-hero-panel">
                <HeroDiscoveryPanel barber={spotlight} />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ---------------------- How booking works ---------------------
          An ordered list, because the steps genuinely have an order. The
          numbers come from a CSS counter, so they are decoration and the
          <ol> itself carries the meaning for assistive technology. */}
      <section className="v-section">
        <Container>
          <div className="bb-section-head">
            <div>
              <p className="v-eyebrow">The process</p>
              <h2>How booking works</h2>
            </div>
            <p className="v-dim">Four steps from start to finish.</p>
          </div>

          <ol className="bb-steps">
            {STEPS.map((step) => (
              <li className="bb-step" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ------------------------- Real barbers -----------------------
          The carousel shows REAL barbers from the database. If there are none
          it does not render at all, and the honest empty state below shows
          instead. Nothing here is invented to fill the space. */}

      {isLoading && (
        <section className="v-section">
          <Container>
            <div className="d-flex align-items-center gap-3" role="status">
              <Spinner animation="border" size="sm" aria-hidden="true" />
              <span className="v-dim">Loading barbers.</span>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && error && (
        <section className="v-section">
          <Container>
            <p className="v-eyebrow">Browse barbers</p>
            <h2 className="mb-4">Barbers on the platform</h2>
            <Alert type="error">{error}</Alert>
          </Container>
        </section>
      )}

      {!isLoading && !error && featured.length === 0 && (
        <section className="v-section">
          <Container>
            <p className="v-eyebrow">Browse barbers</p>
            <h2 className="mb-4">Barbers on the platform</h2>
            <div className="bb-empty">
              <h3>No barbers have published a profile yet.</h3>
              <p>
                If you cut hair, you can create a barber account and list your
                services.
              </p>
              <Button as={Link} to="/register?role=barber" variant="primary">
                Join as a barber
              </Button>
            </div>
          </Container>
        </section>
      )}

      {!isLoading && !error && featured.length > 0 && (
        <BarberCarousel barbers={featured} sectionLabel="Browse barbers" />
      )}

      {/* --------------------------- For barbers -----------------------
          Gives the "Join as a barber" button in the hero something to back it
          up. Every card states a real capability of the barber dashboard --
          see the BARBER_FEATURES comment above -- nothing here is a claim
          about quality or popularity, only a fact about what the code does.

          FeatureCard deliberately does NOT lift on hover, unlike BarberCard:
          these tiles are not links to anything, so a hover animation would
          invite a click that does nothing. Each one fades up once as it
          scrolls into view via RevealOnScroll. */}
      <section className="v-section bb-band">
        <Container>
          <div className="bb-section-head">
            <div>
              <p className="v-eyebrow">For barbers</p>
              <h2>Everything you need to take bookings online</h2>
            </div>
            <p className="v-dim">
              Set up your shop once, and customers book directly into times
              you choose.
            </p>
          </div>

          <Row className="g-3 mb-5">
            {BARBER_FEATURES.map((feature, index) => (
              <Col key={feature.title} sm={6} lg={3}>
                <RevealOnScroll delay={index * 70}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </RevealOnScroll>
              </Col>
            ))}
          </Row>

          <Button as={Link} to="/register?role=barber" variant="primary">
            Join as a barber
          </Button>
        </Container>
      </section>
    </>
  );
};

export default HomePage;
