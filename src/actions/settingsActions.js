import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * GET /api/settings -- public, no auth. Called once on app startup (see
 * App.js) the same way loadSession() is, so the live business details are
 * ready before the Footer/legal pages need them.
 */
export const fetchPublicSettings = () => async (dispatch) => {
  dispatch({ type: types.ADMIN_SETTINGS_REQUEST });
  try {
    const { data } = await api.get("/settings");
    dispatch({ type: types.ADMIN_SETTINGS_SUCCESS, payload: data.business });
  } catch (error) {
    // Quiet failure: useBusinessSettings() falls back to the static
    // config/business.js values, so the site still renders correctly.
    dispatch({ type: types.ADMIN_SETTINGS_FAILURE, payload: extractError(error) });
  }
};

export const updateAdminSettings = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.ADMIN_SETTINGS_SAVE_REQUEST });
  try {
    const { data } = await api.patch("/admin/settings", form);
    dispatch({
      type: types.ADMIN_SETTINGS_SAVE_SUCCESS,
      payload: { business: data.business, message: data.message },
    });
    if (onSuccess) onSuccess(data.business);
  } catch (error) {
    dispatch({ type: types.ADMIN_SETTINGS_SAVE_FAILURE, payload: extractError(error) });
  }
};

export const clearAdminSettingsFeedback = () => ({ type: types.ADMIN_SETTINGS_CLEAR_FEEDBACK });
