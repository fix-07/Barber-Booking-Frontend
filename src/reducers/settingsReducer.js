import * as types from "../actionTypes";

const initialState = {
  // null until the first successful fetch -- see hooks/useBusinessSettings.js,
  // which falls back to the static config/business.js values while this is null.
  business: null,
  isLoading: false,
  error: null,

  isSaving: false,
  saveError: null,
  saveFieldErrors: {},
  message: null,
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.ADMIN_SETTINGS_REQUEST:
      return { ...state, isLoading: true, error: null };

    case types.ADMIN_SETTINGS_SUCCESS:
      return { ...state, isLoading: false, business: action.payload };

    case types.ADMIN_SETTINGS_FAILURE:
      return { ...state, isLoading: false, error: action.payload.message };

    case types.ADMIN_SETTINGS_SAVE_REQUEST:
      return { ...state, isSaving: true, saveError: null, saveFieldErrors: {} };

    case types.ADMIN_SETTINGS_SAVE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        business: action.payload.business,
        message: action.payload.message,
      };

    case types.ADMIN_SETTINGS_SAVE_FAILURE:
      return {
        ...state,
        isSaving: false,
        saveError: action.payload.message,
        saveFieldErrors: action.payload.fieldErrors || {},
      };

    case types.ADMIN_SETTINGS_CLEAR_FEEDBACK:
      return { ...state, message: null, saveError: null, saveFieldErrors: {} };

    default:
      return state;
  }
};

export default settingsReducer;
