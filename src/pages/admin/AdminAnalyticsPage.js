import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Table, Spinner, ButtonGroup, Button } from "react-bootstrap";

import { fetchAdminOverview } from "../../actions/adminActions";
import KpiCard from "../../components/admin/KpiCard";
import { formatMoney } from "../../utils/format";

const RANGE_LABELS = { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" };

/**
 * Reporting over a chosen period -- reuses the exact same
 * GET /api/admin/analytics/overview endpoint the Dashboard's "today" cards
 * use, just with a longer range. See adminAnalyticsController.js: every
 * number here is a real query, including "no comparison available" showing
 * as no badge rather than an invented percentage when the previous period
 * had nothing to compare against.
 */
const AdminAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { overview, isLoadingOverview, overviewError } = useSelector((state) => state.admin);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    dispatch(fetchAdminOverview(range));
  }, [dispatch, range]);

  if (isLoadingOverview && !overview) {
    return (
      <div className="d-flex align-items-center gap-3" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Loading analytics.</span>
      </div>
    );
  }

  if (overviewError) return <p className="text-danger">{overviewError}</p>;
  if (!overview) return null;

  const { period } = overview;

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-end">
        <ButtonGroup>
          {Object.keys(RANGE_LABELS).map((r) => (
            <Button key={r} variant={range === r ? "primary" : "outline-secondary"} size="sm" style={range !== r ? { color: "#3a3a33", borderColor: "#3a3a33" } : undefined} onClick={() => setRange(r)}>
              {RANGE_LABELS[r]}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <Row className="g-3">
        <Col md={3}>
          <KpiCard label="Revenue" value={formatMoney(period.revenueMinor, period.currency || "GBP")}
            changePercent={period.revenueChangePercent} changeLabel="vs previous period" />
        </Col>
        <Col md={3}>
          <KpiCard label="Bookings" value={period.liveBookingsCount}
            changePercent={period.bookingsChangePercent} changeLabel="vs previous period" />
        </Col>
        <Col md={3}>
          <KpiCard label="New clients" value={period.newClientsCount} />
        </Col>
        <Col md={3}>
          <KpiCard label="Returning clients" value={period.returningClientsCount} />
        </Col>
      </Row>

      <Row className="g-3">
        <Col md={4}><KpiCard label="Average booking value" value={formatMoney(period.averageBookingValueMinor, period.currency || "GBP")} /></Col>
        <Col md={4}><KpiCard label="Cancellation rate" value={`${Math.round(period.cancellationRate * 100)}%`} /></Col>
        <Col md={4}><KpiCard label="Total bookings (incl. cancelled)" value={period.bookingsCount} /></Col>
      </Row>

      <Row className="g-3 align-items-stretch">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Popular services</Card.Title>
              {period.popularServices.length === 0 ? (
                <p className="text-muted small mb-0">No bookings in this period yet.</p>
              ) : (
                <Table size="sm" borderless className="mb-0">
                  <tbody>
                    {period.popularServices.map((s) => (
                      <tr key={s.serviceName}>
                        <td>{s.serviceName}</td>
                        <td className="text-end">{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Barber performance</Card.Title>
              {period.barberPerformance.length === 0 ? (
                <p className="text-muted small mb-0">No bookings in this period yet.</p>
              ) : (
                <Table size="sm" borderless className="mb-0">
                  <thead>
                    <tr className="text-muted small">
                      <th>Barber</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {period.barberPerformance.map((b) => (
                      <tr key={b.barberId}>
                        <td>{b.barberName}</td>
                        <td>{b.bookingsCount}</td>
                        <td>{formatMoney(b.revenueMinor, period.currency || "GBP")}</td>
                        <td>{b.averageRating ? `${b.averageRating.toFixed(1)} / 5` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalyticsPage;
