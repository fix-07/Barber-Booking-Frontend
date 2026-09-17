import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * Admin-side thunks. Same hand-written REQUEST/SUCCESS/FAILURE pattern as
 * actions/bookingActions.js -- see the comment at the top of that file for
 * why. Every request here hits an /api/admin/* route, which the server
 * rejects with 401/403 for anyone who is not logged in as "admin" (see
 * server/server.js's adminOnly middleware) regardless of what this code
 * does -- these thunks are convenience, not the security boundary.
 */

/**
 * GET /api/admin/analytics/overview?range=
 * Powers both the Overview dashboard (range="today") and the Analytics
 * page (any range) -- see adminAnalyticsController.js for why it is one
 * endpoint.
 */
export const fetchAdminOverview = (range = "today") => async (dispatch) => {
  dispatch({ type: types.ADMIN_OVERVIEW_REQUEST });

  try {
    const { data } = await api.get("/admin/analytics/overview", { params: { range } });
    dispatch({ type: types.ADMIN_OVERVIEW_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_OVERVIEW_FAILURE, payload: extractError(error) });
  }
};

/**
 * GET /api/admin/bookings
 * `params` can include page, limit, date, from, to, barberId, serviceId,
 * status, paymentStatus -- see adminBookingRoutes.js for the full list.
 */
export const fetchAdminBookings = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BOOKINGS_LIST_REQUEST });

  try {
    const { data } = await api.get("/admin/bookings", { params });
    dispatch({ type: types.ADMIN_BOOKINGS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_BOOKINGS_LIST_FAILURE, payload: extractError(error) });
  }
};

/**
 * POST /api/admin/bookings
 * `form` is either { existingUserId, serviceId, barberId, startAt, staffNote }
 * or { name, email, phone, serviceId, barberId, startAt, staffNote } for a
 * brand new walk-in client -- see utils/walkInUser.js on the server.
 */
export const createAdminBooking = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BOOKING_SAVE_REQUEST });

  try {
    const { data } = await api.post("/admin/bookings", form);
    dispatch({
      type: types.ADMIN_BOOKING_SAVE_SUCCESS,
      payload: { booking: data.booking, message: data.message },
    });
    if (onSuccess) onSuccess(data.booking);
  } catch (error) {
    dispatch({ type: types.ADMIN_BOOKING_SAVE_FAILURE, payload: extractError(error) });
  }
};

/** PATCH /api/admin/bookings/:id/status */
export const setAdminBookingStatus =
  (bookingId, status, reason, onSuccess) => async (dispatch) => {
    dispatch({ type: types.ADMIN_BOOKING_SAVE_REQUEST });

    try {
      const { data } = await api.patch(`/admin/bookings/${bookingId}/status`, {
        status,
        reason: reason || undefined,
      });
      dispatch({
        type: types.ADMIN_BOOKING_SAVE_SUCCESS,
        payload: { booking: data.booking, message: data.message },
      });
      if (onSuccess) onSuccess(data.booking);
    } catch (error) {
      dispatch({ type: types.ADMIN_BOOKING_SAVE_FAILURE, payload: extractError(error) });
    }
  };

/** PATCH /api/admin/bookings/:id/reschedule */
export const rescheduleAdminBooking =
  (bookingId, startAt, onSuccess) => async (dispatch) => {
    dispatch({ type: types.ADMIN_BOOKING_SAVE_REQUEST });

    try {
      const { data } = await api.patch(`/admin/bookings/${bookingId}/reschedule`, { startAt });
      dispatch({
        type: types.ADMIN_BOOKING_SAVE_SUCCESS,
        payload: { booking: data.booking, message: data.message },
      });
      if (onSuccess) onSuccess(data.booking);
    } catch (error) {
      dispatch({ type: types.ADMIN_BOOKING_SAVE_FAILURE, payload: extractError(error) });
      // So a failed drag-and-drop reschedule can snap back in the UI
      // instead of silently leaving a card in a place the server refused.
      throw error;
    }
  };

/** PATCH /api/admin/bookings/:id/payment */
export const recordAdminBookingPayment =
  (bookingId, status, method) => async (dispatch) => {
    dispatch({ type: types.ADMIN_BOOKING_SAVE_REQUEST });

    try {
      const { data } = await api.patch(`/admin/bookings/${bookingId}/payment`, {
        status,
        method: method || undefined,
      });
      dispatch({
        type: types.ADMIN_BOOKING_SAVE_SUCCESS,
        payload: { booking: data.booking, message: data.message },
      });
    } catch (error) {
      dispatch({ type: types.ADMIN_BOOKING_SAVE_FAILURE, payload: extractError(error) });
    }
  };

/**
 * DELETE /api/admin/bookings/:id
 * A REAL, permanent delete -- the booking row is removed from the database.
 * Separate from cancelling (PATCH /:id/status, still available as "Cancel"
 * in the Actions menu, which keeps the record). See
 * adminBookingController.deleteBooking.
 */
export const deleteAdminBooking = (bookingId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BOOKING_DELETE_REQUEST });
  try {
    const { data } = await api.delete(`/admin/bookings/${bookingId}`);
    dispatch({ type: types.ADMIN_BOOKING_DELETE_SUCCESS, payload: { bookingId, message: data.message } });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BOOKING_DELETE_FAILURE, payload: extractError(error) });
  }
};

/** DELETE /api/admin/bookings/:id/payment */
export const deleteAdminBookingPayment = (bookingId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BOOKING_SAVE_REQUEST });

  try {
    const { data } = await api.delete(`/admin/bookings/${bookingId}/payment`);
    dispatch({
      type: types.ADMIN_BOOKING_SAVE_SUCCESS,
      payload: { booking: data.booking, message: data.message },
    });
    if (onSuccess) onSuccess(data.booking);
  } catch (error) {
    dispatch({ type: types.ADMIN_BOOKING_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const clearAdminBookingFeedback = () => ({ type: types.ADMIN_BOOKING_CLEAR_FEEDBACK });

/**
 * GET /api/admin/barbers -- lightweight list for the booking form's barber
 * dropdown. Deliberately not the same request as the full Barbers page will
 * eventually make (that will want more per barber); this asks for a small
 * page, which is all a <select> needs.
 */
export const fetchBarbersForPicker = () => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBERS_PICKER_REQUEST });

  try {
    const { data } = await api.get("/admin/barbers", { params: { limit: 100 } });
    dispatch({ type: types.ADMIN_BARBERS_PICKER_SUCCESS, payload: data.barbers });
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBERS_PICKER_FAILURE, payload: extractError(error) });
  }
};

/** GET /api/admin/services?barberId=&isActive=true -- for the booking form's service dropdown, once a barber is chosen. */
export const fetchServicesForPicker = (barberId) => async (dispatch) => {
  if (!barberId) {
    dispatch({ type: types.ADMIN_SERVICES_PICKER_CLEAR });
    return;
  }

  dispatch({ type: types.ADMIN_SERVICES_PICKER_REQUEST });

  try {
    const { data } = await api.get("/admin/services", {
      params: { barberId, isActive: "true", limit: 100 },
    });
    dispatch({ type: types.ADMIN_SERVICES_PICKER_SUCCESS, payload: data.services });
  } catch (error) {
    dispatch({ type: types.ADMIN_SERVICES_PICKER_FAILURE, payload: extractError(error) });
  }
};

/* ================================ Clients ================================ */

export const fetchAdminClients = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENTS_LIST_REQUEST });
  try {
    const { data } = await api.get("/admin/clients", { params });
    dispatch({ type: types.ADMIN_CLIENTS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENTS_LIST_FAILURE, payload: extractError(error) });
  }
};

export const fetchAdminClientDetail = (clientId) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENT_DETAIL_REQUEST });
  try {
    const { data } = await api.get(`/admin/clients/${clientId}`);
    dispatch({ type: types.ADMIN_CLIENT_DETAIL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENT_DETAIL_FAILURE, payload: extractError(error) });
  }
};

export const createAdminClient = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENT_SAVE_REQUEST });
  try {
    const { data } = await api.post("/admin/clients", form);
    dispatch({ type: types.ADMIN_CLIENT_SAVE_SUCCESS, payload: { client: data.client, message: data.message } });
    if (onSuccess) onSuccess(data.client);
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENT_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const updateAdminClient = (clientId, form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENT_SAVE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/clients/${clientId}`, form);
    dispatch({ type: types.ADMIN_CLIENT_SAVE_SUCCESS, payload: { client: data.client, message: data.message } });
    if (onSuccess) onSuccess(data.client);
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENT_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const clearAdminClientFeedback = () => ({ type: types.ADMIN_CLIENT_CLEAR_FEEDBACK });

/**
 * DELETE /api/admin/clients/:id
 * Permanent. See adminClientController.deleteClient on the server for what
 * this does and does not remove (the account and its personal data; never
 * the booking history).
 */
export const deleteAdminClient = (clientId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENT_DELETE_REQUEST });
  try {
    const { data } = await api.delete(`/admin/clients/${clientId}`);
    dispatch({ type: types.ADMIN_CLIENT_DELETE_SUCCESS, payload: { clientId, message: data.message } });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENT_DELETE_FAILURE, payload: extractError(error) });
  }
};

/**
 * PATCH /api/admin/clients/:id/suspend and /reactivate.
 * ADMIN FULL CONTROL: blocks (or restores) a client's ability to log in and
 * book, without touching their account or booking history -- see
 * adminClientController.suspendClient/reactivateClient.
 */
export const suspendAdminClient = (clientId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENT_STATUS_REQUEST });
  try {
    const { data } = await api.patch(`/admin/clients/${clientId}/suspend`);
    dispatch({ type: types.ADMIN_CLIENT_STATUS_SUCCESS, payload: data });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENT_STATUS_FAILURE, payload: extractError(error) });
  }
};

export const reactivateAdminClient = (clientId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_CLIENT_STATUS_REQUEST });
  try {
    const { data } = await api.patch(`/admin/clients/${clientId}/reactivate`);
    dispatch({ type: types.ADMIN_CLIENT_STATUS_SUCCESS, payload: data });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_CLIENT_STATUS_FAILURE, payload: extractError(error) });
  }
};

/* ================================ Barbers ================================= */

export const fetchAdminBarbers = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBERS_LIST_REQUEST });
  try {
    const { data } = await api.get("/admin/barbers", { params });
    dispatch({ type: types.ADMIN_BARBERS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBERS_LIST_FAILURE, payload: extractError(error) });
  }
};

export const fetchAdminBarberDetail = (barberId) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_DETAIL_REQUEST });
  try {
    const { data } = await api.get(`/admin/barbers/${barberId}`);
    dispatch({ type: types.ADMIN_BARBER_DETAIL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_DETAIL_FAILURE, payload: extractError(error) });
  }
};

export const createAdminBarber = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_SAVE_REQUEST });
  try {
    const { data } = await api.post("/admin/barbers", form);
    dispatch({
      type: types.ADMIN_BARBER_SAVE_SUCCESS,
      payload: { message: data.message, temporaryPassword: data.temporaryPassword },
    });
    if (onSuccess) onSuccess(data);
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const updateAdminBarber = (barberId, form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_SAVE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/barbers/${barberId}`, form);
    dispatch({ type: types.ADMIN_BARBER_SAVE_SUCCESS, payload: { profile: data.profile, message: data.message } });
    if (onSuccess) onSuccess(data.profile);
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const clearAdminBarberFeedback = () => ({ type: types.ADMIN_BARBER_CLEAR_FEEDBACK });

/**
 * DELETE /api/admin/barbers/:id
 * Permanent. See adminBarberController.deleteBarber on the server: the
 * account and shop profile are gone (so they can never receive a new
 * booking again), their services are deactivated or deleted the same safe
 * way a single service delete already works, and every booking they ever
 * had keeps its history.
 */
export const deleteAdminBarber = (barberId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_DELETE_REQUEST });
  try {
    const { data } = await api.delete(`/admin/barbers/${barberId}`);
    dispatch({ type: types.ADMIN_BARBER_DELETE_SUCCESS, payload: { barberId, message: data.message } });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_DELETE_FAILURE, payload: extractError(error) });
  }
};

/**
 * PATCH /api/admin/barbers/:id/suspend and /reactivate.
 * ADMIN FULL CONTROL: takes a barber offline (or brings them back) without
 * touching their account or booking history -- see
 * adminBarberController.suspendBarber/reactivateBarber.
 */
export const suspendAdminBarber = (barberId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_STATUS_REQUEST });
  try {
    const { data } = await api.patch(`/admin/barbers/${barberId}/suspend`);
    dispatch({ type: types.ADMIN_BARBER_STATUS_SUCCESS, payload: data });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_STATUS_FAILURE, payload: extractError(error) });
  }
};

export const reactivateAdminBarber = (barberId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_STATUS_REQUEST });
  try {
    const { data } = await api.patch(`/admin/barbers/${barberId}/reactivate`);
    dispatch({ type: types.ADMIN_BARBER_STATUS_SUCCESS, payload: data });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_STATUS_FAILURE, payload: extractError(error) });
  }
};

/* ========================= Barber approvals (applications) ================= */

/**
 * GET /api/admin/barber-approvals?status=pending_approval|active|rejected
 * Powers Admin -> Barber Approvals' Pending/Approved/Rejected tabs -- see
 * adminBarberApprovalController.listApplications.
 */
export const fetchBarberApplications = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_APPLICATIONS_LIST_REQUEST });
  try {
    const { data } = await api.get("/admin/barber-approvals", { params });
    dispatch({ type: types.ADMIN_BARBER_APPLICATIONS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_APPLICATIONS_LIST_FAILURE, payload: extractError(error) });
  }
};

export const approveBarberApplication = (applicantId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_APPLICATION_DECIDE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/barber-approvals/${applicantId}/approve`);
    dispatch({
      type: types.ADMIN_BARBER_APPLICATION_DECIDE_SUCCESS,
      payload: { applicantId, message: data.message },
    });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_APPLICATION_DECIDE_FAILURE, payload: extractError(error) });
  }
};

export const rejectBarberApplication = (applicantId, reason, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_APPLICATION_DECIDE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/barber-approvals/${applicantId}/reject`, {
      reason: reason || undefined,
    });
    dispatch({
      type: types.ADMIN_BARBER_APPLICATION_DECIDE_SUCCESS,
      payload: { applicantId, message: data.message },
    });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_APPLICATION_DECIDE_FAILURE, payload: extractError(error) });
  }
};

/**
 * DELETE /api/admin/barber-approvals/:id
 * A real, permanent delete -- only allowed by the server for pending or
 * rejected applications (never-active accounts with no booking history to
 * protect). See adminBarberApprovalController.deleteApplication.
 */
export const deleteBarberApplication = (applicantId, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_BARBER_APPLICATION_DECIDE_REQUEST });
  try {
    const { data } = await api.delete(`/admin/barber-approvals/${applicantId}`);
    dispatch({
      type: types.ADMIN_BARBER_APPLICATION_DECIDE_SUCCESS,
      payload: { applicantId, message: data.message },
    });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.ADMIN_BARBER_APPLICATION_DECIDE_FAILURE, payload: extractError(error) });
  }
};

export const clearBarberApplicationFeedback = () => ({ type: types.ADMIN_BARBER_APPLICATION_CLEAR_FEEDBACK });

/* ================================ Services ================================ */

export const fetchAdminServices = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_SERVICES_LIST_REQUEST });
  try {
    const { data } = await api.get("/admin/services", { params });
    dispatch({ type: types.ADMIN_SERVICES_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_SERVICES_LIST_FAILURE, payload: extractError(error) });
  }
};

export const createAdminService = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_SERVICE_SAVE_REQUEST });
  try {
    const { data } = await api.post("/admin/services", form);
    dispatch({ type: types.ADMIN_SERVICE_SAVE_SUCCESS, payload: { service: data.service, message: data.message } });
    if (onSuccess) onSuccess(data.service);
  } catch (error) {
    dispatch({ type: types.ADMIN_SERVICE_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const updateAdminService = (serviceId, form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_SERVICE_SAVE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/services/${serviceId}`, form);
    dispatch({ type: types.ADMIN_SERVICE_SAVE_SUCCESS, payload: { service: data.service, message: data.message } });
    if (onSuccess) onSuccess(data.service);
  } catch (error) {
    dispatch({ type: types.ADMIN_SERVICE_SAVE_FAILURE, payload: extractError(error) });
  }
};

/** DELETE /api/admin/services/:id -- a real, permanent delete. See adminServiceController.deleteAnyService. */
export const deleteAdminService = (serviceId) => async (dispatch) => {
  dispatch({ type: types.ADMIN_SERVICE_DELETE_REQUEST });
  try {
    const { data } = await api.delete(`/admin/services/${serviceId}`);
    dispatch({
      type: types.ADMIN_SERVICE_DELETE_SUCCESS,
      payload: { serviceId, message: data.message },
    });
  } catch (error) {
    dispatch({ type: types.ADMIN_SERVICE_DELETE_FAILURE, payload: extractError(error) });
  }
};

export const clearAdminServiceFeedback = () => ({ type: types.ADMIN_SERVICE_CLEAR_FEEDBACK });

/* ================================= Reviews ================================= */

export const fetchAdminReviews = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_REVIEWS_LIST_REQUEST });
  try {
    const { data } = await api.get("/admin/reviews", { params });
    dispatch({ type: types.ADMIN_REVIEWS_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_REVIEWS_LIST_FAILURE, payload: extractError(error) });
  }
};

export const approveAdminReview = (reviewId) => async (dispatch) => {
  dispatch({ type: types.ADMIN_REVIEW_UPDATE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/reviews/${reviewId}/approve`);
    dispatch({ type: types.ADMIN_REVIEW_UPDATE_SUCCESS, payload: { review: data.review, message: data.message } });
  } catch (error) {
    dispatch({ type: types.ADMIN_REVIEW_UPDATE_FAILURE, payload: extractError(error) });
  }
};

export const hideAdminReview = (reviewId) => async (dispatch) => {
  dispatch({ type: types.ADMIN_REVIEW_UPDATE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/reviews/${reviewId}/hide`);
    dispatch({ type: types.ADMIN_REVIEW_UPDATE_SUCCESS, payload: { review: data.review, message: data.message } });
  } catch (error) {
    dispatch({ type: types.ADMIN_REVIEW_UPDATE_FAILURE, payload: extractError(error) });
  }
};

export const respondToAdminReview = (reviewId, adminResponse) => async (dispatch) => {
  dispatch({ type: types.ADMIN_REVIEW_UPDATE_REQUEST });
  try {
    const { data } = await api.patch(`/admin/reviews/${reviewId}/respond`, { adminResponse });
    dispatch({ type: types.ADMIN_REVIEW_UPDATE_SUCCESS, payload: { review: data.review, message: data.message } });
  } catch (error) {
    dispatch({ type: types.ADMIN_REVIEW_UPDATE_FAILURE, payload: extractError(error) });
  }
};

export const deleteAdminReview = (reviewId) => async (dispatch) => {
  dispatch({ type: types.ADMIN_REVIEW_DELETE_REQUEST });
  try {
    await api.delete(`/admin/reviews/${reviewId}`);
    dispatch({ type: types.ADMIN_REVIEW_DELETE_SUCCESS, payload: { reviewId } });
  } catch (error) {
    dispatch({ type: types.ADMIN_REVIEW_DELETE_FAILURE, payload: extractError(error) });
  }
};

export const clearAdminReviewFeedback = () => ({ type: types.ADMIN_REVIEW_CLEAR_FEEDBACK });

/* ================================ Audit log ================================ */

/**
 * GET /api/admin/audit-logs?resourceType=&action=
 * Read only by design -- there is no action here to edit or delete an entry,
 * because the server has no endpoint for it. See adminAuditLogController.js.
 */
export const fetchAuditLogs = (params = {}) => async (dispatch) => {
  dispatch({ type: types.ADMIN_AUDIT_LOGS_REQUEST });
  try {
    const { data } = await api.get("/admin/audit-logs", { params });
    dispatch({ type: types.ADMIN_AUDIT_LOGS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.ADMIN_AUDIT_LOGS_FAILURE, payload: extractError(error) });
  }
};
