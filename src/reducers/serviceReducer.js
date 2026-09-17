import * as types from "../actionTypes";

const initialState = {
  mine: [],
  isLoading: false,
  isSaving: false,
  error: null,
  fieldErrors: {},
  message: null,
};

const serviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SERVICE_LIST_REQUEST:
      return { ...state, isLoading: true, error: null };

    case types.SERVICE_LIST_SUCCESS:
      return { ...state, isLoading: false, mine: action.payload };

    case types.SERVICE_LIST_FAILURE:
      return { ...state, isLoading: false, error: action.payload.message };

    case types.SERVICE_SAVE_REQUEST:
    case types.SERVICE_DELETE_REQUEST:
      return {
        ...state,
        isSaving: true,
        error: null,
        fieldErrors: {},
        message: null,
      };

    case types.SERVICE_SAVE_SUCCESS: {
      const saved = action.payload.service;

      // Replace the matching service if we already have it, otherwise add it.
      // .map keeps the list order stable, so a row does not jump to the
      // bottom of the table just because it was edited.
      const exists = state.mine.some((item) => item.id === saved.id);

      return {
        ...state,
        isSaving: false,
        message: action.payload.message,
        mine: exists
          ? state.mine.map((item) => (item.id === saved.id ? saved : item))
          : [...state.mine, saved],
      };
    }

    case types.SERVICE_DELETE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        message: action.payload.message,
        // If the server deactivated it instead of deleting, keep the row and
        // update it. Removing it would tell the barber it is gone when it is
        // not.
        mine: action.payload.wasDeactivated
          ? state.mine.map((item) =>
              item.id === action.payload.serviceId
                ? action.payload.service
                : item
            )
          : state.mine.filter((item) => item.id !== action.payload.serviceId),
      };

    case types.SERVICE_SAVE_FAILURE:
    case types.SERVICE_DELETE_FAILURE:
      return {
        ...state,
        isSaving: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    case types.SERVICE_CLEAR_FEEDBACK:
      return { ...state, message: null, error: null, fieldErrors: {} };

    default:
      return state;
  }
};

export default serviceReducer;
