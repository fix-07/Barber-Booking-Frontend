import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Form, Button, Spinner } from "react-bootstrap";

import {
  fetchBarbersForPicker,
  fetchAdminBarberDetail,
  updateAdminBarber,
  clearAdminBarberFeedback,
} from "../../actions/adminActions";
import Alert from "../../components/Alert";
import BarberHoursEditor from "../../components/admin/BarberHoursEditor";

const blankHours = () =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, isOpen: false, open: "09:00", close: "18:00", breakStart: "", breakEnd: "" }));

/**
 * A barber picker wrapped around the same BarberHoursEditor
 * AdminBarberDetailPage uses -- one editor, reached two ways: from a
 * specific barber's own page, or from this dedicated Availability section
 * for staff who think in terms of "who's off this week" rather than "edit
 * a barber's profile".
 *
 * There is no separate shop-wide "business hours" setting here: hours are
 * genuinely per-barber in this schema (see BarberProfile.workingHours) --
 * a shared default would be a new concept with nothing backing it, not a
 * real toggle on existing data.
 */
const AdminAvailabilityPage = () => {
  const dispatch = useDispatch();
  const {
    barberOptions, barberDetail, isLoadingBarberDetail,
    isSavingBarber, barberError, barberFieldErrors, barberMessage,
  } = useSelector((state) => state.admin);

  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [hours, setHours] = useState(null);
  const [timeOff, setTimeOff] = useState(null);

  useEffect(() => {
    dispatch(fetchBarbersForPicker());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBarberId) dispatch(fetchAdminBarberDetail(selectedBarberId));
  }, [dispatch, selectedBarberId]);

  useEffect(() => {
    if (!barberDetail || barberDetail.barber.id !== selectedBarberId) return;
    const profile = barberDetail.barber.profile || {};
    setHours(profile.workingHours?.length === 7 ? profile.workingHours : blankHours());
    setTimeOff(profile.timeOff || []);
  }, [barberDetail, selectedBarberId]);

  const handleSave = (event) => {
    event.preventDefault();
    dispatch(updateAdminBarber(selectedBarberId, { workingHours: hours, timeOff }));
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Alert type="error" onDismiss={() => dispatch(clearAdminBarberFeedback())}>{barberError}</Alert>
      <Alert type="success" onDismiss={() => dispatch(clearAdminBarberFeedback())}>{barberMessage}</Alert>

      <Card>
        <Card.Body>
          <Form.Group style={{ maxWidth: 320 }}>
            <Form.Label>Barber</Form.Label>
            <Form.Select value={selectedBarberId} onChange={(e) => setSelectedBarberId(e.target.value)}>
              <option value="">Choose a barber</option>
              {barberOptions.map((b) => <option key={b.barberId} value={b.barberId}>{b.shopName} ({b.barberName})</option>)}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {!selectedBarberId && <p className="text-muted">Choose a barber to view or change their availability.</p>}

      {selectedBarberId && isLoadingBarberDetail && !hours && (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" aria-hidden="true" />
          <span>Loading availability.</span>
        </div>
      )}

      {selectedBarberId && hours && (
        <Card>
          <Card.Body>
            <Form onSubmit={handleSave} noValidate>
              <BarberHoursEditor
                workingHours={hours}
                timeOff={timeOff}
                onChangeHours={setHours}
                onChangeTimeOff={setTimeOff}
                hoursError={barberFieldErrors.workingHours}
                timeOffError={barberFieldErrors.timeOff}
              />
              <Button type="submit" variant="primary" className="mt-3" disabled={isSavingBarber}>
                {isSavingBarber ? "Saving..." : "Save availability"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AdminAvailabilityPage;
