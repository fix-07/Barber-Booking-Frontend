import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * Action creators for logging in, out, registering, and restoring a session.
 *
 * HOW THESE WORK (the "thunk" pattern):
 * A normal Redux action is a plain object. But talking to a server takes
 * time, so instead we return a FUNCTION. redux-thunk sees a function and
 * calls it with `dispatch`, letting us dispatch several actions over time:
 * first REQUEST (show a spinner), then SUCCESS or FAILURE.
 */

/**
 * Asks the server who the logged-in user is.
 *
 * WHY THIS EXISTS AT ALL:
 * The login token is in an httpOnly cookie, so JavaScript cannot read it.
 * After a page refresh the app has no idea whether anyone is logged in.
 * This runs once on startup and asks the server.
 *
 * A 401 here is the NORMAL answer for a visitor who is not logged in. It is
 * not an error and must not show a red message.
 */
export const loadSession = () => async (dispatch) => {
  dispatch({ type: types.AUTH_SESSION_REQUEST });

  try {
    const { data } = await api.get("/auth/me");
    dispatch({ type: types.AUTH_SESSION_SUCCESS, payload: data.user });
  } catch (error) {
    // Quietly mean "nobody is logged in".
    dispatch({ type: types.AUTH_SESSION_NONE });
  }
};

/**
 * Submits a signup.
 *
 * ==========================================================================
 *  THIS DOES NOT LOG ANYONE IN, AND THERE IS NO ACCOUNT YET
 * ==========================================================================
 *
 * POST /api/auth/register no longer creates a User -- it creates a
 * PendingRegistration and emails a code (see
 * server/controllers/pendingRegistrationController.js for why: so an
 * abandoned or mistyped signup never leaves a real account behind). The
 * response here has no `user` and sets no session cookie, so this
 * dispatches into the VERIFICATION slice (PENDING_REGISTRATION_*), not the
 * auth slice -- dispatching an auth "success" with no real account would
 * make the rest of the app think someone is logged in when they are not.
 *
 * The actual account is created by verifyRegistrationCode, in
 * verificationActions.js, once the emailed code is entered correctly. That
 * is also the point at which `state.auth.user` finally gets set.
 *
 * `onSuccess` is an optional callback so the page can redirect to /verify
 * afterwards, carrying the email forward. We keep routing out of the
 * action: an action's job is state, not navigation.
 */
export const register = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.PENDING_REGISTRATION_REQUEST });

  try {
    const { data } = await api.post("/auth/register", {
      name: form.name,
      email: form.email,
      password: form.password,
      // Only send phone if the person actually filled it in. It is optional.
      phone: form.phone ? form.phone : undefined,
      role: form.role,
      acceptedPolicies: form.acceptedPolicies,
      // Barber application fields -- see BarberSignupPage.js's form and
      // models/BarberProfile.js for the shapes. Undefined for a customer
      // signup, which the server ignores anyway (it only reads these when
      // role === "barber").
      ...(form.role === "barber"
        ? {
            shopName: form.shopName,
            city: form.city,
            timeZone: form.timeZone,
            bio: form.bio || undefined,
            experience: form.experience || undefined,
            specialties: form.specialties,
            requestedServices: form.requestedServices,
            photoUrl: form.photoUrl || undefined,
          }
        : {}),
    });

    dispatch({
      type: types.PENDING_REGISTRATION_SUCCESS,
      payload: { pendingEmail: data.pendingEmail, ...data.verification },
    });

    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: types.PENDING_REGISTRATION_FAILURE,
      payload: extractError(error),
    });
  }
};

/**
 * Logs in.
 */
export const login = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.AUTH_LOGIN_REQUEST });

  try {
    const { data } = await api.post("/auth/login", {
      email: form.email,
      password: form.password,
      // Lengthens the session only. The server decides what it means (see
      // sendSession in verificationController.js); nothing about the
      // account is stored in the browser either way.
      rememberMe: form.rememberMe === true,
    });

    dispatch({ type: types.AUTH_LOGIN_SUCCESS, payload: data.user });
    if (onSuccess) onSuccess(data.user);
  } catch (error) {
    dispatch({ type: types.AUTH_LOGIN_FAILURE, payload: extractError(error) });
  }
};

/**
 * "Sign in with Google" -- also, unavoidably, "Sign up with Google": the
 * first time this Google account is seen, POST /api/auth/google creates
 * it. There is no separate action for that; a real Google button never
 * asks "log in or register?" first, the button already answered that. See
 * controllers/googleAuthController.js for the account-linking rules.
 *
 * Reuses AUTH_LOGIN_SUCCESS/FAILURE rather than new types: the result is
 * the same shape either way -- a real user, a real session -- so the same
 * reducer case applies whether the account already existed or was just
 * created.
 *
 * `idToken` comes from Google's own script (window.google.accounts.id),
 * loaded in components/auth/GoogleSignInButton.js. This action never talks
 * to Google itself; it only forwards what Google already handed the
 * browser to our own server, which is the only place that actually
 * verifies it.
 *
 * `acceptedPolicies` matters ONLY the first time this Google account is
 * seen (a brand-new account) -- see the matching check in
 * googleAuthController.js for why signing into an account that already
 * exists does not need to re-ask. GoogleSignInButton.js only passes true
 * when the page it is on actually shows and requires that checkbox
 * (CustomerSignupPage.js); LoginPage.js's button always passes false,
 * which is correct there BECAUSE that page can only ever be signing into
 * an existing account or -- Google's OWN account picker having no way to
 * distinguish "I am new here" from "I already have an account" -- creating
 * one without having shown any consent UI at all. The server refuses that
 * combination outright, which is the intended outcome: this button is for
 * sign-in, not sign-up.
 */
export const loginWithGoogle = (idToken, acceptedPolicies, onSuccess) => async (dispatch) => {
  dispatch({ type: types.AUTH_LOGIN_REQUEST });

  try {
    const { data } = await api.post("/auth/google", { idToken, acceptedPolicies });
    dispatch({ type: types.AUTH_LOGIN_SUCCESS, payload: data.user });
    if (onSuccess) onSuccess(data.user);
  } catch (error) {
    dispatch({ type: types.AUTH_LOGIN_FAILURE, payload: extractError(error) });
  }
};

/**
 * PATCH /api/auth/complete-profile -- the one-field screen a brand-new
 * Google account is sent to (see auth/roleRoutes.js's homeRouteFor). Reuses
 * AUTH_LOGIN_SUCCESS again: the response is the same account, just with
 * `phone` now filled in, which is exactly what that reducer case already
 * does with any user object it is given.
 */
export const completeProfile = (phone, onSuccess) => async (dispatch) => {
  dispatch({ type: types.AUTH_LOGIN_REQUEST });

  try {
    const { data } = await api.patch("/auth/complete-profile", { phone });
    dispatch({ type: types.AUTH_LOGIN_SUCCESS, payload: data.user });
    if (onSuccess) onSuccess(data.user);
  } catch (error) {
    dispatch({ type: types.AUTH_LOGIN_FAILURE, payload: extractError(error) });
  }
};

/**
 * Logs out.
 *
 * WHY THIS CALLS THE SERVER:
 * The cookie is httpOnly, so the browser's JavaScript cannot delete it.
 * Only the server can clear it. Wiping our Redux state alone would make the
 * UI look logged out while the token stayed valid, which is worse than not
 * logging out at all.
 *
 * We clear local state even if the request fails, so a network problem
 * cannot trap someone in a logged-in-looking app.
 */
export const logout = (onSuccess) => async (dispatch) => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Ignored on purpose: see the comment above.
  }

  dispatch({ type: types.AUTH_LOGOUT });
  if (onSuccess) onSuccess();
};

export const clearAuthError = () => ({ type: types.AUTH_CLEAR_ERROR });

/**
 * PATCH /api/barbers/me/resubmit
 * A rejected barber editing and resending their application -- see
 * pages/BarberStatusPage.js. On success the server flips status back to
 * "pending_approval" (see barberController.resubmitApplication), so the
 * returned user is dispatched the same way login/register would, updating
 * state.auth.user in place.
 */
export const resubmitBarberApplication = (form, onSuccess) => async (dispatch) => {
  dispatch({ type: types.AUTH_BARBER_RESUBMIT_REQUEST });

  try {
    const { data } = await api.patch("/barbers/me/resubmit", {
      shopName: form.shopName,
      city: form.city,
      timeZone: form.timeZone,
      bio: form.bio || undefined,
      experience: form.experience || undefined,
      specialties: form.specialties,
      requestedServices: form.requestedServices,
      photoUrl: form.photoUrl || undefined,
    });

    dispatch({ type: types.AUTH_BARBER_RESUBMIT_SUCCESS, payload: data.user });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({ type: types.AUTH_BARBER_RESUBMIT_FAILURE, payload: extractError(error) });
  }
};
