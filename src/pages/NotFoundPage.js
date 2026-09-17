import React from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

/**
 * Shown for any address that does not exist.
 *
 * It deliberately offers a way forward rather than just saying "404", which
 * means nothing to most people.
 */
const NotFoundPage = () => (
  <Container className="py-5">
    <h1>Page not found</h1>
    <p>
      That address does not exist. It may have been removed, or the link may
      have been mistyped.
    </p>

    <div className="d-flex flex-wrap gap-2">
      <Button as={Link} to="/" variant="primary">
        Go to the home page
      </Button>
      <Button as={Link} to="/barbers" variant="outline-dark">
        Find a barber
      </Button>
    </div>
  </Container>
);

export default NotFoundPage;
