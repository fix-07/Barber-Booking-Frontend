import * as types from "../actionTypes";

/**
 * State for the verification and password-reset screens.
 *
 * WHAT IS DELIBERATELY NOT HERE: the code. The server never sends it (see
 * controllers/verificationController.js), so there is nothing to store,
 * and a future change that tried to put one here would be visible as a
 * change to this file.
 *
 * `sentTo` holds the MASKED address the server echoed back
 * ("al•••••@example.com"), which is safe to show and is the only
 * destination information the client ever receives.
 *
 * `pendingEmail` is the PLAIN address of a registration awaiting
 * verification -- set once, right after a successful submit, by
 * PENDING_REGISTRATION_SUCCESS. Unlike sentTo it is not masked, because
 * VerifyPage has to send it back to the server on every verify/resend call
 * (POST /api/auth/verify-registration takes { email, code }). Holding the
 * plain address here is not a new exposure: it is the same address the
 * person just typed into the signup form themselves, in the same browser
 * tab, seconds earlier.
 */
const initialState = {
  isSending: false,
  isVerifying: false,

  sentTo: null,
  resendAfterSeconds: 0,
  expiresInMinutes: null,

  pendingEmail: null,

  // Feedback for the reset flow, which has no user object to update.
  message: null,

  error: null,
  fieldErrors: {},
};

const verificationReducer = (state = initialState, action) => {
  switch (action.type) {
    /* ---- sending / resending a code ---- */
    case types.VERIFY_SEND_REQUEST:
      return { ...state, isSending: true, error: null, fieldErrors: {} };

    case types.VERIFY_SEND_SUCCESS:
      return {
        ...state,
        isSending: false,
        sentTo: action.payload.sentTo || state.sentTo,
        resendAfterSeconds: action.payload.resendAfterSeconds || 0,
        expiresInMinutes: action.payload.expiresInMinutes || null,
        error: null,
      };

    case types.VERIFY_SEND_FAILURE:
      return {
        ...state,
        isSending: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
        // A 429 carries how long is left on the cooldown. Keeping it lets
        // the countdown restart at the right number instead of guessing.
        resendAfterSeconds:
          action.payload.status === 429 ? state.resendAfterSeconds : 0,
      };

    /* ---- checking a code ---- */
    case types.VERIFY_CODE_REQUEST:
      return { ...state, isVerifying: true, error: null, fieldErrors: {} };

    case types.VERIFY_CODE_SUCCESS:
      // Whichever flow just succeeded (an existing account's own
      // verify-account, or a pending registration's verify-registration),
      // there is nothing left pending afterwards.
      return {
        ...state,
        isVerifying: false,
        error: null,
        fieldErrors: {},
        pendingEmail: null,
      };

    case types.VERIFY_CODE_FAILURE:
      return {
        ...state,
        isVerifying: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    /* ---- password reset ---- */
    case types.RESET_REQUEST_REQUEST:
    case types.RESET_PASSWORD_REQUEST:
      return { ...state, isSending: true, error: null, fieldErrors: {}, message: null };

    case types.RESET_REQUEST_SUCCESS:
    case types.RESET_PASSWORD_SUCCESS:
      return { ...state, isSending: false, message: action.payload, error: null };

    case types.RESET_REQUEST_FAILURE:
    case types.RESET_PASSWORD_FAILURE:
      return {
        ...state,
        isSending: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    /* ---- pending registration (the submit step; see authActions.js) ---- */
    case types.PENDING_REGISTRATION_REQUEST:
      return { ...state, isSending: true, error: null, fieldErrors: {} };

    case types.PENDING_REGISTRATION_SUCCESS:
      return {
        ...state,
        isSending: false,
        pendingEmail: action.payload.pendingEmail,
        sentTo: action.payload.sentTo || state.sentTo,
        resendAfterSeconds: action.payload.resendAfterSeconds || 0,
        expiresInMinutes: action.payload.expiresInMinutes || null,
        error: null,
      };

    case types.PENDING_REGISTRATION_FAILURE:
      return {
        ...state,
        isSending: false,
        error: action.payload.message,
        fieldErrors: action.payload.fieldErrors || {},
      };

    case types.VERIFY_CLEAR:
      return initialState;

    default:
      return state;
  }
};

export default verificationReducer;
