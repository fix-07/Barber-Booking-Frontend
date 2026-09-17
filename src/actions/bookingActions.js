import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * PUBLIC: free slots for one barber, one service, one date.
 * `date` must be "YYYY-MM-DD".
 */
export const fetchAvailability =
  (barberId, serviceId, date) => async (dispatch) => {
    dispatch({ type: types.AVAILABILITY_REQUEST });

    try {
      const { data } = await api.get("/bookings/availability", {
        params: { barberId, serviceId, date },
      });
      dispatch({ type: types.AVAILABILITY_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: types.AVAILABILITY_FAILURE,
        payload: extractError(error),
      });
    }
  };

export const clearAvailability = () => ({ type: types.AVAILABILITY_CLEAR });

/**
 * CUSTOMER ONLY: request an appointment.
 *
 * Notice we send only serviceId, startAt and an optional note.
 * We do NOT send who the barber is, how long it takes, or what it costs.
 * The server reads all of that from the service record. If the browser could
 * send the price, a customer could book a 25.00 haircut for 0.01.
 */
export const createBooking =
  ({ serviceId, startAt, customerNote }, onSuccess) =>
  async (dispatch) => {
    dispatch({ type: types.BOOKING_CREATE_REQUEST });

    try {
      const { data } = await api.post("/bookings", {
        serviceId,
        startAt,
        customerNote: customerNote || undefined,
      });

      dispatch({
        type: types.BOOKING_CREATE_SUCCESS,
        payload: { booking: data.booking, message: data.message },
      });

      if (onSuccess) onSuccess(data.booking);
    } catch (error) {
      dispatch({
        type: types.BOOKING_CREATE_FAILURE,
        payload: extractError(error),
      });
    }
  };

/**
 * CUSTOMER ONLY: my own bookings.
 */
export const fetchMyBookings = () => async (dispatch) => {
  dispatch({ type: types.MY_BOOKINGS_REQUEST });

  try {
    const { data } = await api.get("/bookings/mine");
    dispatch({ type: types.MY_BOOKINGS_SUCCESS, payload: data.bookings });
  } catch (error) {
    dispatch({
      type: types.MY_BOOKINGS_FAILURE,
      payload: extractError(error),
    });
  }
};

/**
 * BARBER ONLY: appointments in my chair.
 */
export const fetchAppointments = () => async (dispatch) => {
  dispatch({ type: types.APPOINTMENTS_REQUEST });

  try {
    const { data } = await api.get("/bookings/appointments");
    dispatch({ type: types.APPOINTMENTS_SUCCESS, payload: data.bookings });
  } catch (error) {
    dispatch({
      type: types.APPOINTMENTS_FAILURE,
      payload: extractError(error),
    });
  }
};

/**
 * EITHER SIDE: cancel a booking I am part of.
 *
 * We do not tell the server whether we are the customer or the barber. It
 * works that out from the login cookie and records the correct status,
 * cancelled_by_customer or cancelled_by_barber. That distinction can decide
 * a refund, so it must not be something the browser can choose.
 */
export const cancelBooking = (bookingId, reason) => async (dispatch) => {
  dispatch({ type: types.BOOKING_UPDATE_REQUEST, payload: { bookingId } });

  try {
    const { data } = await api.patch(`/bookings/${bookingId}/cancel`, {
      reason: reason || undefined,
    });

    dispatch({
      type: types.BOOKING_UPDATE_SUCCESS,
      payload: { booking: data.booking, message: data.message },
    });
  } catch (error) {
    dispatch({
      type: types.BOOKING_UPDATE_FAILURE,
      payload: extractError(error),
    });
  }
};

/**
 * BARBER ONLY: confirm, complete, or mark a no-show.
 * The server refuses any change its transition rules do not allow.
 */
export const updateBookingStatus =
  (bookingId, status, reason) => async (dispatch) => {
    dispatch({ type: types.BOOKING_UPDATE_REQUEST, payload: { bookingId } });

    try {
      const { data } = await api.patch(`/bookings/${bookingId}/status`, {
        status,
        reason: reason || undefined,
      });

      dispatch({
        type: types.BOOKING_UPDATE_SUCCESS,
        payload: { booking: data.booking, message: data.message },
      });
    } catch (error) {
      dispatch({
        type: types.BOOKING_UPDATE_FAILURE,
        payload: extractError(error),
      });
    }
  };

export const clearBookingFeedback = () => ({
  type: types.BOOKING_CLEAR_FEEDBACK,
});
