import * as types from "../actionTypes";

/**
 * Who is logged in, and what the login screens should show.
 *
 * PRIVACY / SECURITY NOTE:
 * `user` holds only what the server chose to send: id, name, email, phone,
 * role, createdAt. There is no token here, because the token lives in an
 * httpOnly cookie the browser handles for us. Nothing sensitive is kept in
 * JavaScript, and nothing is written to localStorage, so closing the tab
 * leaves no trace of the account on the device beyond the cookie itself.
 */
const initialState = {
  user: null,

  // True while a request is in flight, so buttons can disable themselves.
  isLoading: false,

  /**
   * False until we have asked the server "is anyone logged in?" once.
   *
   * WHY THIS MATTERS: without it, a protected page would briefly see
   * user === null on first render and bounce a logged-in person to the login
   * screen every time they refreshed.
   */
  hasCheckedSession: false,

  error: null,        // a general message, e.g. "Invalid email or password."
  fieldErrors: {},    // per-field messages, e.g. { email: "..." }
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // --- startup session check ---
    case types.AUTH_SESSION_REQUEST:
      return { ...state, isLoading: true };

    // Verification returns the updated user. It lands here so anything
    // reading user.emailVerified -- the route guards in auth/roleRoutes.js,
    // the verification screen itself -- sees the new value immediately,
    // without another round trip to /auth/me.
    case types.VERIFY_CODE_SUCCESS:
      return { ...state, user: action.payload };

    case types.AUTH_SESSION_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        hasCheckedSession: true,
      };

    // Not an error: this is simply a visitor who is not logged in.
    case types.AUTH_SESSION_NONE:
      return {
        ...state,
        user: null,
        isLoading: false,
        hasCheckedSession: true,
      };

    // --- login and register ---
    case types.AUTH_LOGIN_REQUEST:
    case types.AUTH_REGISTER_REQUEST:
      // Clearing old errors here stops a stale red message sitting on screen
      // while the new attempt is still running.
      return { ...state, isLoading: true, error: null, fieldErrors: {} };

    case types.AUTH_LOGIN_SUCCESS:
    case types.AUTH_REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        hasCheckedSession: true,
        error: null,
        fieldErrors: {},
      };

    case types.AUTH_LOGIN_FAILURE:
    case types.AUTH_REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    // --- logout ---
    case types.AUTH_LOGOUT:
      return {
        ...initialState,
        // Keep this true: we know for certain nobody is logged in now.
        hasCheckedSession: true,
      };

    case types.AUTH_CLEAR_ERROR:
      return { ...state, error: null, fieldErrors: {} };

    // --- barber resubmitting a rejected application ---
    case types.AUTH_BARBER_RESUBMIT_REQUEST:
      return { ...state, isLoading: true, error: null, fieldErrors: {} };

    case types.AUTH_BARBER_RESUBMIT_SUCCESS:
      return { ...state, isLoading: false, user: action.payload, error: null, fieldErrors: {} };

    case types.AUTH_BARBER_RESUBMIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    default:
      return state;
  }
};

export default authReducer;
