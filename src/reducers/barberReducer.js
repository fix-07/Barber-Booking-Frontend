import * as types from "../actionTypes";

const initialState = {
  // Public browse page
  list: [],
  total: 0,
  page: 1,
  isLoading: false,
  error: null,

  // Public single-barber page
  current: null,       // { barber, services }
  isLoadingOne: false,
  errorOne: null,

  // The logged-in barber's own profile
  myProfile: null,
  isLoadingMine: false,
  isSaving: false,
  saveMessage: null,
  errorMine: null,
  fieldErrors: {},
};

const barberReducer = (state = initialState, action) => {
  switch (action.type) {
    /* ---------------- public list ---------------- */
    case types.BARBER_LIST_REQUEST:
      return { ...state, isLoading: true, error: null };

    case types.BARBER_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        list: action.payload.barbers,
        total: action.payload.total,
        page: action.payload.page,
      };

    case types.BARBER_LIST_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.message,
        list: [],
      };

    /* ---------------- public detail -------------- */
    case types.BARBER_DETAIL_REQUEST:
      // Clearing `current` matters: without it, moving from barber A to
      // barber B would briefly show A's details under B's heading.
      return { ...state, isLoadingOne: true, errorOne: null, current: null };

    case types.BARBER_DETAIL_SUCCESS:
      return { ...state, isLoadingOne: false, current: action.payload };

    case types.BARBER_DETAIL_FAILURE:
      return {
        ...state,
        isLoadingOne: false,
        errorOne: action.payload.message,
      };

    /* ---------------- my own profile ------------- */
    case types.MY_PROFILE_REQUEST:
      return { ...state, isLoadingMine: true, errorMine: null };

    case types.MY_PROFILE_SUCCESS:
      // payload may be null, which simply means "not filled in yet".
      return { ...state, isLoadingMine: false, myProfile: action.payload };

    case types.MY_PROFILE_FAILURE:
      return {
        ...state,
        isLoadingMine: false,
        errorMine: action.payload.message,
      };

    case types.MY_PROFILE_SAVE_REQUEST:
      return {
        ...state,
        isSaving: true,
        errorMine: null,
        fieldErrors: {},
        saveMessage: null,
      };

    case types.MY_PROFILE_SAVE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        myProfile: action.payload.profile,
        saveMessage: action.payload.message,
      };

    case types.MY_PROFILE_SAVE_FAILURE:
      return {
        ...state,
        isSaving: false,
        errorMine: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    default:
      return state;
  }
};

export default barberReducer;
