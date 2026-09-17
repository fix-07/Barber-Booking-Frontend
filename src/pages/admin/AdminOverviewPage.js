import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Spinner, Table } from "react-bootstrap";

import { fetchAdminOverview, fetchAdminBookings } from "../../actions/adminActions";
import KpiCard from "../../components/admin/KpiCard";
import WeeklyChart from "../../components/admin/WeeklyChart";
import StatusBadge from "../../components/StatusBadge";
import PaymentStatusBadge from "../../components/admin/PaymentStatusBadge";
import { formatMoney, formatDateTime, dateToInputValue, dateInputPlusDays } from "../../utils/format";

/**
 * The admin Dashboard.
 *
 * Every number on this page comes from adminAnalyticsController.js's one
 * overview endpoint, plus a single bookings fetch for the two lists that
 * need actual records rather than aggregates (the timeline and "upcoming").
 * Nothing here is sample data -- a brand new shop sees real zeros and real
 * empty states, not placeholder figures (see the empty-state note on
 * Reviews below).
 */
const AdminOverviewPage = () => {
  const dispatch = useDispatch();
  const { overview, isLoadingOverview, bookings, isLoadingBookings } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    // "30d", not "today": overview.today.* (the KPI cards above) is always
    // computed as literally today regardless of this range -- see
    // adminAnalyticsController.getOverview, where todayStart/todayEnd never
    // depend on it. Only overview.period.* (barberPerformance below) is
    // scoped to whatever range is requested here, and that section is
    // explicitly labelled "last 30 days" -- it needs to actually ask for
    // 30 days, or it silently shows a single day's worth of data under a
    // 30-day label.
    dispatch(fetchAdminOverview("30d"));
    dispatch(
      fetchAdminBookings({
        from: dateToInputValue(new Date()),
        to: dateInputPlusDays(14),
        limit: 500,
      })
    );
  }, [dispatch]);

  const todayKey = dateToInputValue(new Date());

  const todaysTimeline = useMemo(
    () =>
      bookings
        // Local calendar date, not the raw UTC date substring -- otherwise
        // a booking near midnight could be misfiled by a day for anyone
        // not at UTC+0. See the matching note in AdminCalendarPage.js.
        .filter((b) => dateToInputValue(new Date(b.startAt)) === todayKey)
        .slice()
        .sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    [bookings, todayKey]
  );

  const upcoming = useMemo(() => {
    const now = Date.now();
    // Confirmed only: pending hasn't been agreed yet, and every cancelled/
    // completed/no_show status is not something still "upcoming" even if
    // its startAt happens to be in the future (a booking cancelled ahead of
    // time keeps its original startAt).
    return bookings
      .filter((b) => new Date(b.startAt).getTime() >= now && b.status === "confirmed")
      .slice()
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      .slice(0, 5);
  }, [bookings]);

  if (isLoadingOverview && !overview) {
    return (
      <div className="d-flex align-items-center gap-3" role="status">
        <Spinner animation="border" size="sm" aria-hidden="true" />
        <span>Loading the dashboard.</span>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className="d-flex flex-column gap-4">
      <Row className="g-3">
        <Col sm={6} xl={3}>
          <KpiCard
            label="Today's bookings"
            value={overview.today.bookingsCount}
            changePercent={overview.today.bookingsChangePercent}
            changeLabel="vs yesterday"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard
            label="Today's revenue"
            value={formatMoney(overview.today.revenueMinor, overview.today.currency || overview.period.currency || "GBP")}
            changePercent={overview.today.revenueChangePercent}
            changeLabel="vs yesterday"
          />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Total clients" value={overview.snapshot.totalClients} />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Available barbers" value={overview.snapshot.activeBarbers} />
        </Col>
      </Row>

      <Row className="g-3 align-items-stretch">
        <Col lg={7}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6">Bookings this week</Card.Title>
              <WeeklyChart series={overview.dailySeries} currency={overview.period.currency || "GBP"} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Barber performance (last 30 days)</Card.Title>
              {overview.period.barberPerformance.length === 0 ? (
                <p className="text-muted small mb-0">No completed, paid bookings yet.</p>
              ) : (
                <Table size="sm" borderless className="mb-0">
                  <thead>
                    <tr className="text-muted small">
                      <th scope="col">Barber</th>
                      <th scope="col">Bookings</th>
                      <th scope="col">Revenue</th>
                      <th scope="col">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.period.barberPerformance.map((b) => (
                      <tr key={b.barberId}>
                        <td>{b.barberName}</td>
                        <td>{b.bookingsCount}</td>
                        <td>{formatMoney(b.revenueMinor, overview.period.currency || "GBP")}</td>
                        <td>{b.averageRating ? `${b.averageRating.toFixed(1)} / 5` : "No reviews yet"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 align-items-stretch">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Today's timeline</Card.Title>

              {isLoadingBookings && <Spinner animation="border" size="sm" aria-hidden="true" />}

              {!isLoadingBookings && todaysTimeline.length === 0 && (
                <p className="text-muted small mb-0">No appointments today.</p>
              )}

              {todaysTimeline.length > 0 && (
                <ol className="bb-admin-timeline list-unstyled mb-0">
                  {todaysTimeline.map((booking) => (
                    <li key={booking.id} className="bb-admin-timeline-item">
                      <span className="bb-admin-timeline-time">
                        {formatDateTime(booking.startAt).split(", ").pop()}
                      </span>
                      <div className="bb-admin-timeline-content">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <strong>{booking.customerName || "Walk-in"}</strong>
                          <StatusBadge status={booking.status} />
                        </div>
                        <div className="text-muted small">
                          {booking.serviceName} with {booking.barberName}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Upcoming appointments</Card.Title>

              {upcoming.length === 0 && (
                <p className="text-muted small mb-0">Nothing confirmed and upcoming right now.</p>
              )}

              {upcoming.length > 0 && (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {upcoming.map((booking) => (
                    <li key={booking.id} className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <strong>{booking.customerName || "Walk-in"}</strong>
                        <div className="text-muted small">
                          {booking.serviceName} with {booking.barberName}
                        </div>
                      </div>
                      <span className="text-muted small text-end">{formatDateTime(booking.startAt)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3">
                <Link to="/admin/bookings">See all bookings</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 align-items-stretch">
        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Recent payments</Card.Title>

              {overview.recentPayments.length === 0 ? (
                <p className="text-muted small mb-0">No payments recorded yet.</p>
              ) : (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {overview.recentPayments.map((payment) => (
                    <li
                      key={payment.bookingId}
                      className="d-flex justify-content-between align-items-start gap-2"
                    >
                      <div>
                        <strong>{payment.customerName || "Walk-in"}</strong>
                        <div className="text-muted small">{payment.serviceName}</div>
                      </div>
                      <div className="text-end">
                        <div>{formatMoney(payment.amountMinor, payment.currency)}</div>
                        <PaymentStatusBadge status={payment.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title as="h2" className="h6 mb-3">Recent reviews</Card.Title>

              {/* Genuinely empty until a customer-facing review path exists
                  -- see the note at the top of server/models/Review.js. */}
              {overview.recentReviews.length === 0 ? (
                <p className="text-muted small mb-0">
                  No reviews yet. This will fill in once customers can leave one.
                </p>
              ) : (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                  {overview.recentReviews.map((review) => (
                    <li key={review.id}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <strong>{review.customerName}</strong>
                        <span>{review.rating} / 5</span>
                      </div>
                      <div className="text-muted small">for {review.barberName}</div>
                      {review.comment && <p className="small mb-0 mt-1">{review.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOverviewPage;
