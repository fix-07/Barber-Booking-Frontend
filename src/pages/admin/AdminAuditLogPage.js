import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Row, Col, Table, Spinner, Badge, Button } from "react-bootstrap";

import { fetchAuditLogs } from "../../actions/adminActions";
import Alert from "../../components/Alert";
import { formatDateTime } from "../../utils/format";

/**
 * Admin -> Audit Log.
 *
 * A read-only record of what admins have actually done: who, what, which
 * record, and when. Entries are written by the server as a side effect of
 * the real action (see server/utils/auditLog.js) -- there is no way to add,
 * edit or remove one from here, and no endpoint that would allow it, which
 * is the entire point of keeping a log.
 *
 * WHAT IS NOT HERE, deliberately: passwords, temporary passwords, tokens,
 * OTPs or any other credential. A barber created through the admin panel
 * gets a one-time temporary password, and that password is specifically
 * excluded from its own log entry -- see the note in
 * adminBarberController.createBarber.
 */

// Colour is a hint; the badge always spells the resource out as a word, so
// it still reads correctly in greyscale or read aloud.
const RESOURCE_BADGE = {
  barber: "bb-badge-confirmed",
  client: "bb-badge-done",
  booking: "bb-badge-pending",
  service: "bb-badge-muted",
  payment: "bb-badge-muted",
  review: "bb-badge-muted",
  settings: "bb-badge-muted",
};

const AdminAuditLogPage = () => {
  const dispatch = useDispatch();
  const {
    auditLogs, auditLogsTotal, auditResourceTypes, auditActions,
    isLoadingAuditLogs, auditLogsError,
  } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({ resourceType: "", action: "" });

  useEffect(() => {
    const params = { limit: 200 };
    if (filters.resourceType) params.resourceType = filters.resourceType;
    if (filters.action) params.action = filters.action;
    dispatch(fetchAuditLogs(params));
  }, [dispatch, filters]);

  const handleFilterChange = (field) => (event) =>
    setFilters({ ...filters, [field]: event.target.value });

  const hasFilter = Boolean(filters.resourceType || filters.action);

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error">{auditLogsError}</Alert>

      <Card>
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Group controlId="auditResourceType">
                <Form.Label className="small">Record type</Form.Label>
                <Form.Select
                  value={filters.resourceType}
                  onChange={handleFilterChange("resourceType")}
                >
                  <option value="">All types</option>
                  {auditResourceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="auditAction">
                <Form.Label className="small">Action</Form.Label>
                <Form.Select value={filters.action} onChange={handleFilterChange("action")}>
                  <option value="">All actions</option>
                  {auditActions.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={5} className="d-flex gap-2">
              {hasFilter && (
                <Button
                  variant="outline-dark"
                  onClick={() => setFilters({ resourceType: "", action: "" })}
                >
                  Clear filters
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="bb-admin-table-card">
        {isLoadingAuditLogs && (
          <div className="d-flex align-items-center gap-3 p-4" role="status">
            <Spinner animation="border" size="sm" aria-hidden="true" />
            <span>Loading the audit log.</span>
          </div>
        )}

        {!isLoadingAuditLogs && auditLogs.length === 0 && (
          <div className="bb-admin-empty" style={{ border: "none" }}>
            <p className="mb-1">
              {hasFilter ? "No entries match these filters." : "No admin actions recorded yet."}
            </p>
            <p className="mb-0">
              Entries appear here automatically when an admin approves, suspends,
              deletes or edits something.
            </p>
          </div>
        )}

        {!isLoadingAuditLogs && auditLogs.length > 0 && (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">Admin</th>
                    <th scope="col">Action</th>
                    <th scope="col">Type</th>
                    <th scope="col">What happened</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-nowrap small">{formatDateTime(log.createdAt)}</td>
                      <td className="small">
                        {log.adminName}
                        <div className="text-muted">{log.adminEmail}</div>
                      </td>
                      <td>
                        <code className="small">{log.action}</code>
                      </td>
                      <td>
                        <Badge
                          bg=""
                          className={`bb-badge ${RESOURCE_BADGE[log.resourceType] || "bb-badge-muted"}`}
                        >
                          {log.resourceType}
                        </Badge>
                      </td>
                      <td className="small">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
      </div>

      {auditLogsTotal > auditLogs.length && (
        <p className="text-muted small">
          Showing the {auditLogs.length} most recent of {auditLogsTotal}. Narrow the
          filters to see older entries.
        </p>
      )}
    </div>
  );
};

export default AdminAuditLogPage;
