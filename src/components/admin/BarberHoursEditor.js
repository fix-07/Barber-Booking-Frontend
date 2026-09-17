import React, { useState } from "react";
import { Row, Col, Form, Button, Table } from "react-bootstrap";

import { dayName } from "../../utils/format";

const blankTimeOffEntry = () => ({ startDate: "", endDate: "", reason: "" });

/**
 * Editable weekly hours (+ an optional break per day) and one-off time-off
 * ranges (holidays, days off). Shared by AdminBarberDetailPage (editing one
 * barber inline) and AdminAvailabilityPage (a barber-picker wrapped around
 * this same editor) -- one editor, not two copies that could drift apart.
 *
 * Mirrors the shape and field names BarberProfilePage.js already uses for
 * plain open/close editing (the barber's own self-service page), extended
 * with breakStart/breakEnd and timeOff, which only staff can set for now.
 */
const BarberHoursEditor = ({ workingHours, timeOff, onChangeHours, onChangeTimeOff, hoursError, timeOffError }) => {
  const [newEntry, setNewEntry] = useState(blankTimeOffEntry());

  const handleHourChange = (day, key, value) => {
    onChangeHours(workingHours.map((entry) => (entry.day === day ? { ...entry, [key]: value } : entry)));
  };

  const addTimeOff = () => {
    if (!newEntry.startDate || !newEntry.endDate) return;
    onChangeTimeOff([...timeOff, newEntry]);
    setNewEntry(blankTimeOffEntry());
  };

  const removeTimeOff = (index) => {
    onChangeTimeOff(timeOff.filter((_, i) => i !== index));
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h3 className="h6 mb-2">Weekly hours</h3>
        <p className="text-muted small">
          Tick each day the barber is open. A break is optional and must fall inside that day's hours.
        </p>

        {workingHours
          .slice()
          .sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7))
          .map((entry) => (
            <Row key={entry.day} className="align-items-end g-2 py-2 border-bottom">
              <Col xs={12} sm={2}>
                <Form.Check
                  type="checkbox"
                  id={`hours-open-${entry.day}`}
                  checked={entry.isOpen}
                  onChange={(e) => handleHourChange(entry.day, "isOpen", e.target.checked)}
                  label={dayName(entry.day)}
                />
              </Col>
              <Col xs={6} sm={2}>
                <Form.Group controlId={`hours-from-${entry.day}`}>
                  <Form.Label className="small mb-1">Opens</Form.Label>
                  <Form.Control type="time" size="sm" value={entry.open} disabled={!entry.isOpen}
                    onChange={(e) => handleHourChange(entry.day, "open", e.target.value)} />
                </Form.Group>
              </Col>
              <Col xs={6} sm={2}>
                <Form.Group controlId={`hours-to-${entry.day}`}>
                  <Form.Label className="small mb-1">Closes</Form.Label>
                  <Form.Control type="time" size="sm" value={entry.close} disabled={!entry.isOpen}
                    onChange={(e) => handleHourChange(entry.day, "close", e.target.value)} />
                </Form.Group>
              </Col>
              <Col xs={6} sm={3}>
                <Form.Group controlId={`hours-break-start-${entry.day}`}>
                  <Form.Label className="small mb-1">Break from</Form.Label>
                  <Form.Control type="time" size="sm" value={entry.breakStart || ""} disabled={!entry.isOpen}
                    onChange={(e) => handleHourChange(entry.day, "breakStart", e.target.value)} />
                </Form.Group>
              </Col>
              <Col xs={6} sm={3}>
                <Form.Group controlId={`hours-break-end-${entry.day}`}>
                  <Form.Label className="small mb-1">Break to</Form.Label>
                  <Form.Control type="time" size="sm" value={entry.breakEnd || ""} disabled={!entry.isOpen}
                    onChange={(e) => handleHourChange(entry.day, "breakEnd", e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          ))}

        {hoursError && <p className="text-danger small fw-semibold mt-2 mb-0">{hoursError}</p>}
      </div>

      <div>
        <h3 className="h6 mb-2">Time off</h3>
        <p className="text-muted small">
          Holidays or days off. The barber shows as closed for customers on every date in these ranges.
        </p>

        {timeOff.length > 0 && (
          <Table size="sm" className="mb-3">
            <thead>
              <tr>
                <th scope="col">From</th>
                <th scope="col">To</th>
                <th scope="col">Reason</th>
                <th scope="col"><span className="visually-hidden">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {timeOff.map((entry, index) => (
                <tr key={`${entry.startDate}-${entry.endDate}-${index}`}>
                  <td>{entry.startDate}</td>
                  <td>{entry.endDate}</td>
                  <td>{entry.reason || "—"}</td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => removeTimeOff(index)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Row className="g-2 align-items-end">
          <Col xs={6} sm={3}>
            <Form.Group controlId="timeOffStart">
              <Form.Label className="small mb-1">From</Form.Label>
              <Form.Control type="date" size="sm" value={newEntry.startDate}
                onChange={(e) => setNewEntry({ ...newEntry, startDate: e.target.value })} />
            </Form.Group>
          </Col>
          <Col xs={6} sm={3}>
            <Form.Group controlId="timeOffEnd">
              <Form.Label className="small mb-1">To</Form.Label>
              <Form.Control type="date" size="sm" value={newEntry.endDate}
                onChange={(e) => setNewEntry({ ...newEntry, endDate: e.target.value })} />
            </Form.Group>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Group controlId="timeOffReason">
              <Form.Label className="small mb-1">Reason (optional)</Form.Label>
              <Form.Control type="text" size="sm" value={newEntry.reason}
                onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })} />
            </Form.Group>
          </Col>
          <Col xs={12} sm={2}>
            <Button variant="outline-dark" size="sm" onClick={addTimeOff} disabled={!newEntry.startDate || !newEntry.endDate}>
              + Add
            </Button>
          </Col>
        </Row>

        {timeOffError && <p className="text-danger small fw-semibold mt-2 mb-0">{timeOffError}</p>}
      </div>
    </div>
  );
};

export default BarberHoursEditor;
