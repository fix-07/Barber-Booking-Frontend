import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * PUBLIC: the list of barbers for the browse page.
 * `filters` may contain { city, q, page }.
 */
export const fetchBarbers = (filters = {}) => async (dispatch) => {
  dispatch({ type: types.BARBER_LIST_REQUEST });

  try {
    // Axios turns this object into ?city=...&q=... and URL-encodes it for us,
    // which is safer than building the query string by hand.
    const { data } = await api.get("/barbers", {
      params: {
        city: filters.city || undefined,
        q: filters.q || undefined,
        page: filters.page || undefined,
      },
    });

    dispatch({ type: types.BARBER_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.BARBER_LIST_FAILURE, payload: extractError(error) });
  }
};

/**
 * PUBLIC: one barber plus their active services.
 */
export const fetchBarber = (barberId) => async (dispatch) => {
  dispatch({ type: types.BARBER_DETAIL_REQUEST });

  try {
    const { data } = await api.get(`/barbers/${barberId}`);
    dispatch({ type: types.BARBER_DETAIL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.BARBER_DETAIL_FAILURE, payload: extractError(error) });
  }
};

/**
 * BARBER ONLY: load my own shop profile.
 *
 * Note there is no id argument. The server works out whose profile to send
 * from the login cookie. Passing an id from the browser would be exactly the
 * mistake the backend is built to refuse.
 */
export const fetchMyProfile = () => async (dispatch) => {
  dispatch({ type: types.MY_PROFILE_REQUEST });

  try {
    const { data } = await api.get("/barbers/me");
    dispatch({ type: types.MY_PROFILE_SUCCESS, payload: data.profile });
  } catch (error) {
    dispatch({ type: types.MY_PROFILE_FAILURE, payload: extractError(error) });
  }
};

/**
 * BARBER ONLY: save my own shop profile. Creates it the first time.
 */
export const saveMyProfile = (form) => async (dispatch) => {
  dispatch({ type: types.MY_PROFILE_SAVE_REQUEST });

  try {
    const { data } = await api.put("/barbers/me", form);
    dispatch({
      type: types.MY_PROFILE_SAVE_SUCCESS,
      payload: { profile: data.profile, message: data.message },
    });
  } catch (error) {
    dispatch({
      type: types.MY_PROFILE_SAVE_FAILURE,
      payload: extractError(error),
    });
  }
};
