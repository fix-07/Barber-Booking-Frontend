import * as types from "../actionTypes";

const initialState = {
  // Customer's own bookings
  mine: [],
  isLoadingMine: false,

  // Barber's appointments
  appointments: [],
  isLoadingAppointments: false,

  // Slot picker
  availability: null,   // { date, timeZone, durationMinutes, slots, closed }
  isLoadingSlots: false,

  isSaving: false,
  error: null,
  fieldErrors: {},
  message: null,
  lastCreated: null,
};

/**
 * Replaces one booking wherever it appears in a list.
 * Used after a cancel or status change so the screen updates without a
 * second round trip to the server.
 */
const replaceIn = (list, updated) =>
  list.map((item) => (item.id === updated.id ? { ...item, ...updated } : item));

const bookingReducer = (state = initialState, action) => {
  switch (action.type) {
    /* ---------------- availability ---------------- */
    case types.AVAILABILITY_REQUEST:
      return { ...state, isLoadingSlots: true, error: null };

    case types.AVAILABILITY_SUCCESS:
      return { ...state, isLoadingSlots: false, availability: action.payload };

    case types.AVAILABILITY_FAILURE:
      return {
        ...state,
        isLoadingSlots: false,
        availability: null,
        error: action.payload.message,
      };

    case types.AVAILABILITY_CLEAR:
      return { ...state, availability: null };

    /* ---------------- create ---------------------- */
    case types.BOOKING_CREATE_REQUEST:
      return {
        ...state,
        isSaving: true,
        error: null,
        fieldErrors: {},
        message: null,
      };

    case types.BOOKING_CREATE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        message: action.payload.message,
        lastCreated: action.payload.booking,
        mine: [action.payload.booking, ...state.mine],
        // The slot we just took is no longer free, so drop the cached slot
        // list rather than showing a stale one.
        availability: null,
      };

    case types.BOOKING_CREATE_FAILURE:
      return {
        ...state,
        isSaving: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    /* ---------------- my bookings ----------------- */
    case types.MY_BOOKINGS_REQUEST:
      return { ...state, isLoadingMine: true, error: null };

    case types.MY_BOOKINGS_SUCCESS:
      return { ...state, isLoadingMine: false, mine: action.payload };

    case types.MY_BOOKINGS_FAILURE:
      return { ...state, isLoadingMine: false, error: action.payload.message };

    /* ---------------- appointments ---------------- */
    case types.APPOINTMENTS_REQUEST:
      return { ...state, isLoadingAppointments: true, error: null };

    case types.APPOINTMENTS_SUCCESS:
      return {
        ...state,
        isLoadingAppointments: false,
        appointments: action.payload,
      };

    case types.APPOINTMENTS_FAILURE:
      return {
        ...state,
        isLoadingAppointments: false,
        error: action.payload.message,
      };

    /* ---------------- cancel / status ------------- */
    case types.BOOKING_UPDATE_REQUEST:
      return { ...state, isSaving: true, error: null, message: null };

    case types.BOOKING_UPDATE_SUCCESS:
      return {
        ...state,
        isSaving: false,
        message: action.payload.message,
        // Update both lists. A person can be a customer on one screen and a
        // barber on another, and we do not know which list holds this id.
        mine: replaceIn(state.mine, action.payload.booking),
        appointments: replaceIn(state.appointments, action.payload.booking),
      };

    case types.BOOKING_UPDATE_FAILURE:
      return { ...state, isSaving: false, error: action.payload.message };

    case types.BOOKING_CLEAR_FEEDBACK:
      return { ...state, message: null, error: null, fieldErrors: {} };

    default:
      return state;
  }
};

export default bookingReducer;
