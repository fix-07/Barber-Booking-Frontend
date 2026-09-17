import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * Account verification and password reset.
 *
 * These talk to the real endpoints in server/controllers/
 * verificationController.js. There is no simulated delay and no fabricated
 * success anywhere in this file -- every resolution here is the server's
 * own answer.
 *
 * NOTE ON WHAT COMES BACK: the server never returns the code. These
 * actions could not leak it even if a component asked, because it is not
 * in the payload. The only things returned are whether the call succeeded,
 * the masked destination, and the cooldown.
 */

/** POST /api/auth/send-verification -- also used for "resend". */
export const sendVerificationCode = (onSuccess) => async (dispatch) => {
  dispatch({ type: types.VERIFY_SEND_REQUEST });

  try {
    const { data } = await api.post("/auth/send-verification");
    dispatch({ type: types.VERIFY_SEND_SUCCESS, payload: data });
    if (onSuccess) onSuccess(data);
    return data;
  } catch (error) {
    const failure = extractError(error);
    dispatch({ type: types.VERIFY_SEND_FAILURE, payload: failure });
    return null;
  }
};

/** POST /api/auth/verify-account */
export const verifyAccount = (code, onSuccess) => async (dispatch) => {
  dispatch({ type: types.VERIFY_CODE_REQUEST });

  try {
    const { data } = await api.post("/auth/verify-account", { code });

    // The verified user replaces the one in auth state, so anything reading
    // `user.emailVerified` (route guards, the header) updates at once.
    dispatch({ type: types.VERIFY_CODE_SUCCESS, payload: data.user });
    if (onSuccess) onSuccess(data.user);
    return true;
  } catch (error) {
    dispatch({ type: types.VERIFY_CODE_FAILURE, payload: extractError(error) });
    return false;
  }
};

/**
 * POST /api/auth/verify-registration
 *
 * The OTHER "enter a code" action -- for a signup that has not become an
 * account yet, rather than an existing account that isn't verified. See
 * auth/roleRoutes.js and VerifyPage.js for how the two are told apart:
 * this one is public (no session exists to authenticate with) and takes
 * the email explicitly, since there is nothing else to identify the
 * attempt by.
 *
 * Reuses VERIFY_CODE_REQUEST/SUCCESS/FAILURE rather than a parallel set of
 * types: either way, success means "a real, logged-in user now exists" and
 * failure means "wrong or expired code" -- the exact same shape
 * verifyAccount already produces, so the same reducer cases apply.
 * VERIFY_CODE_SUCCESS's payload IS the newly created account.
 */
export const verifyRegistrationCode = (email, code, onSuccess) => async (dispatch) => {
  dispatch({ type: types.VERIFY_CODE_REQUEST });

  try {
    const { data } = await api.post("/auth/verify-registration", { email, code });
    dispatch({ type: types.VERIFY_CODE_SUCCESS, payload: data.user });
    if (onSuccess) onSuccess(data.user);
    return true;
  } catch (error) {
    dispatch({ type: types.VERIFY_CODE_FAILURE, payload: extractError(error) });
    return false;
  }
};

/**
 * POST /api/auth/resend-registration-code
 *
 * The pending-registration equivalent of sendVerificationCode. Reuses
 * VERIFY_SEND_REQUEST/SUCCESS/FAILURE for the same reason verifyRegistrationCode
 * reuses VERIFY_CODE_*: the response shape (sentTo/expiresInMinutes/
 * resendAfterSeconds, or a 429 with the wait) is identical either way.
 */
export const resendRegistrationCode = (email, onSuccess) => async (dispatch) => {
  dispatch({ type: types.VERIFY_SEND_REQUEST });

  try {
    const { data } = await api.post("/auth/resend-registration-code", { email });
    dispatch({ type: types.VERIFY_SEND_SUCCESS, payload: data });
    if (onSuccess) onSuccess(data);
    return data;
  } catch (error) {
    const failure = extractError(error);
    dispatch({ type: types.VERIFY_SEND_FAILURE, payload: failure });
    return null;
  }
};

/**
 * POST /api/auth/forgot-password
 *
 * Resolves true for any well-formed request, because the SERVER answers
 * identically whether or not the account exists -- see the comment on
 * forgotPassword in verificationController.js. The UI must not try to
 * infer existence from this; doing so would rebuild the membership oracle
 * the server deliberately avoids.
 */
export const requestPasswordReset = (email) => async (dispatch) => {
  dispatch({ type: types.RESET_REQUEST_REQUEST });

  try {
    const { data } = await api.post("/auth/forgot-password", { email });
    dispatch({ type: types.RESET_REQUEST_SUCCESS, payload: data.message });
    return true;
  } catch (error) {
    dispatch({
      type: types.RESET_REQUEST_FAILURE,
      payload: extractError(error),
    });
    return false;
  }
};

/** POST /api/auth/reset-password */
export const resetPassword =
  ({ email, code, password }) =>
  async (dispatch) => {
    dispatch({ type: types.RESET_PASSWORD_REQUEST });

    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        code,
        password,
      });
      dispatch({ type: types.RESET_PASSWORD_SUCCESS, payload: data.message });
      return true;
    } catch (error) {
      dispatch({
        type: types.RESET_PASSWORD_FAILURE,
        payload: extractError(error),
      });
      return false;
    }
  };

export const clearVerificationState = () => ({ type: types.VERIFY_CLEAR });
