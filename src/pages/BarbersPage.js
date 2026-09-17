import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card, Spinner } from "react-bootstrap";

import { fetchBarbers } from "../actions/barberActions";
import BarberCard from "../components/BarberCard";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import { SearchIcon } from "../components/formIcons";

/**
 * Browse and search barbers.
 *
 * The search term lives in the URL (/barbers?city=Manchester), so a search can
 * be bookmarked, shared, and survives the back button. That is better than
 * keeping it only in component state, and it costs nothing.
 *
 * ACCESSIBILITY POINT - announcing results:
 * When someone searches, the list changes but their focus does not move, so a
 * screen-reader user would not be told anything happened. The result count
 * below sits in an aria-live region, so it is read out automatically: "4
 * barbers found". Without it, searching is a silent, confusing experience.
 * Bootstrap has no component for this; it has to be done deliberately.
 */
const BarbersPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { list, isLoading, error, total } = useSelector(
    (state) => state.barbers
  );

  const cityFromUrl = searchParams.get("city") || "";
  const queryFromUrl = searchParams.get("q") || "";

  // Local copies so typing does not fire a request on every keystroke.
  const [city, setCity] = useState(cityFromUrl);
  const [shopQuery, setShopQuery] = useState(queryFromUrl);

  useEffect(() => {
    dispatch(fetchBarbers({ city: cityFromUrl, q: queryFromUrl }));
  }, [dispatch, cityFromUrl, queryFromUrl]);

  const handleSearch = (event) => {
    event.preventDefault();
    const next = {};
    if (city.trim()) next.city = city.trim();
    if (shopQuery.trim()) next.q = shopQuery.trim();
    setSearchParams(next);
  };

  const handleClear = () => {
    setCity("");
    setShopQuery("");
    setSearchParams({});
  };

  const hasFilter = Boolean(cityFromUrl || queryFromUrl);

  return (
    <>
      <Container className="pt-5 pb-4">
        <h1>Find a barber</h1>
        <p className="text-muted" style={{ maxWidth: 640 }}>
          Search by town or city, or by shop name. Open a barber's page to see
          their services, prices and opening hours.
        </p>

        {/* role="search" names this region so assistive technology can jump
            straight to it. */}
        <Form onSubmit={handleSearch} noValidate role="search" className="mt-4">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <FormField
                id="city"
                label="Town or city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                onClear={() => setCity("")}
                autoComplete="address-level2"
                icon={<SearchIcon />}
              />
            </Col>

            <Col md={4}>
              <FormField
                id="q"
                label="Shop name"
                value={shopQuery}
                onChange={(event) => setShopQuery(event.target.value)}
                onClear={() => setShopQuery("")}
                icon={<SearchIcon />}
              />
            </Col>

            <Col md={4}>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Button type="submit" variant="primary">
                  Search barbers
                </Button>
                {hasFilter && (
                  <Button type="button" variant="outline-dark" onClick={handleClear}>
                    Clear search
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </Container>

      <section className="py-4 bg-light">
        <Container>
          {/*
            A heading for the results section.

            It is visually hidden because the page title and result count
            already make it obvious on screen. But headings are how
            screen-reader users navigate, and each barber card is an <h3>.
            Going straight from <h1> to <h3> leaves a gap in the outline that
            reads as a missing section.
          */}
          <h2 className="visually-hidden">Search results</h2>

          {/* aria-live="polite" makes a screen reader announce changes here
              without interrupting. This is how the result count reaches
              someone who cannot see the list refresh. */}
          <p aria-live="polite" className="text-muted">
            {isLoading
              ? "Searching."
              : error
              ? ""
              : total === 0
              ? "No barbers found."
              : `${total} barber${total === 1 ? "" : "s"} found.`}
          </p>

          {isLoading && (
            <div className="d-flex align-items-center gap-3 mb-3" role="status">
              <Spinner animation="border" size="sm" aria-hidden="true" />
              <span>Loading barbers.</span>
            </div>
          )}

          {error && <Alert type="error">{error}</Alert>}

          {!isLoading && !error && list.length === 0 && (
            <Card className="text-center border-2" style={{ borderStyle: "dashed" }}>
              <Card.Body className="py-5">
                <Card.Text className="mb-3">
                  {hasFilter
                    ? "No barbers matched your search."
                    : "No barbers have published a profile yet."}
                </Card.Text>
                {hasFilter && (
                  <Button variant="outline-dark" onClick={handleClear}>
                    Clear search
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}

          {list.length > 0 && (
            <Row as="ul" className="list-unstyled g-4">
              {list.map((barber) => (
                <Col as="li" key={barber.id} md={6} lg={4}>
                  <BarberCard barber={barber} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </>
  );
};

export default BarbersPage;
