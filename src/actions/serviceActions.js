import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * BARBER ONLY: my own services.
 */
export const fetchMyServices = () => async (dispatch) => {
  dispatch({ type: types.SERVICE_LIST_REQUEST });

  try {
    const { data } = await api.get("/services/mine");
    dispatch({ type: types.SERVICE_LIST_SUCCESS, payload: data.services });
  } catch (error) {
    dispatch({ type: types.SERVICE_LIST_FAILURE, payload: extractError(error) });
  }
};

/**
 * BARBER ONLY: create a new service, or update one I already own.
 *
 * If `serviceId` is given we update, otherwise we create. One function for
 * both, because from the barber's point of view it is one action: "save".
 *
 * NOTE ON PRICE: the form collects a normal amount like "12.50" and converts
 * it to 1250 before calling this. Money is stored as a whole number of minor
 * units, never a decimal. See server/models/Service.js for why.
 */
export const saveService = (form, serviceId) => async (dispatch) => {
  dispatch({ type: types.SERVICE_SAVE_REQUEST });

  try {
    const body = {
      name: form.name,
      description: form.description,
      durationMinutes: Number(form.durationMinutes),
      priceMinor: form.priceMinor,
      currency: form.currency,
    };

    const { data } = serviceId
      ? await api.put(`/services/${serviceId}`, body)
      : await api.post("/services", body);

    dispatch({
      type: types.SERVICE_SAVE_SUCCESS,
      payload: { service: data.service, message: data.message },
    });
  } catch (error) {
    dispatch({ type: types.SERVICE_SAVE_FAILURE, payload: extractError(error) });
  }
};

/**
 * BARBER ONLY: toggle a service on or off without deleting it.
 * Useful when a barber stops offering something but has old bookings for it.
 */
export const setServiceActive = (serviceId, isActive) => async (dispatch) => {
  dispatch({ type: types.SERVICE_SAVE_REQUEST });

  try {
    const { data } = await api.put(`/services/${serviceId}`, { isActive });
    dispatch({
      type: types.SERVICE_SAVE_SUCCESS,
      payload: {
        service: data.service,
        message: isActive
          ? "Service is now visible to customers."
          : "Service is now hidden from customers.",
      },
    });
  } catch (error) {
    dispatch({ type: types.SERVICE_SAVE_FAILURE, payload: extractError(error) });
  }
};

/**
 * BARBER ONLY: delete one of my services.
 *
 * The server may DEACTIVATE it instead of deleting, if upcoming appointments
 * depend on it. It tells us which happened via deactivatedInsteadOfDeleted,
 * and we pass the server's own message straight through rather than claiming
 * it was deleted.
 */
export const deleteService = (serviceId) => async (dispatch) => {
  dispatch({ type: types.SERVICE_DELETE_REQUEST });

  try {
    const { data } = await api.delete(`/services/${serviceId}`);

    dispatch({
      type: types.SERVICE_DELETE_SUCCESS,
      payload: {
        serviceId,
        message: data.message,
        wasDeactivated: Boolean(data.deactivatedInsteadOfDeleted),
        service: data.service,
      },
    });
  } catch (error) {
    dispatch({
      type: types.SERVICE_DELETE_FAILURE,
      payload: extractError(error),
    });
  }
};

export const clearServiceFeedback = () => ({
  type: types.SERVICE_CLEAR_FEEDBACK,
});
