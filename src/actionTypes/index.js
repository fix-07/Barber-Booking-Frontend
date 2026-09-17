/**
 * Action type constants.
 *
 * WHY BOTHER WITH CONSTANTS instead of typing the string each time:
 * if you misspell "BOOKING_CREATE_SUCESS" in a reducer, nothing happens and
 * nothing warns you. Misspell the CONSTANT name and you get an immediate
 * "is not defined" error pointing at the line. The bug finds you instead of
 * you hunting for it.
 *
 * The pattern REQUEST / SUCCESS / FAILURE repeats for anything that talks to
 * the server, because the UI needs all three states: show a spinner, show
 * the data, show the error.
 */

/* ----------------------------- Auth ----------------------------- */

export const AUTH_REGISTER_REQUEST = "AUTH_REGISTER_REQUEST";
export const AUTH_REGISTER_SUCCESS = "AUTH_REGISTER_SUCCESS";
export const AUTH_REGISTER_FAILURE = "AUTH_REGISTER_FAILURE";

export const AUTH_LOGIN_REQUEST = "AUTH_LOGIN_REQUEST";
export const AUTH_LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS";
export const AUTH_LOGIN_FAILURE = "AUTH_LOGIN_FAILURE";

export const AUTH_LOGOUT = "AUTH_LOGOUT";

// Runs once when the app starts, to ask the server "am I still logged in?".
// Needed because the token is in an httpOnly cookie that JavaScript cannot
// read, so asking the server is the only way to find out.
export const AUTH_SESSION_REQUEST = "AUTH_SESSION_REQUEST";
export const AUTH_SESSION_SUCCESS = "AUTH_SESSION_SUCCESS";
export const AUTH_SESSION_NONE = "AUTH_SESSION_NONE";

export const AUTH_CLEAR_ERROR = "AUTH_CLEAR_ERROR";

// A rejected barber editing and resubmitting their application -- see
// pages/BarberStatusPage.js and PATCH /api/barbers/me/resubmit.
export const AUTH_BARBER_RESUBMIT_REQUEST = "AUTH_BARBER_RESUBMIT_REQUEST";
export const AUTH_BARBER_RESUBMIT_SUCCESS = "AUTH_BARBER_RESUBMIT_SUCCESS";
export const AUTH_BARBER_RESUBMIT_FAILURE = "AUTH_BARBER_RESUBMIT_FAILURE";

/* ---------------------------- Barbers --------------------------- */

export const BARBER_LIST_REQUEST = "BARBER_LIST_REQUEST";
export const BARBER_LIST_SUCCESS = "BARBER_LIST_SUCCESS";
export const BARBER_LIST_FAILURE = "BARBER_LIST_FAILURE";

export const BARBER_DETAIL_REQUEST = "BARBER_DETAIL_REQUEST";
export const BARBER_DETAIL_SUCCESS = "BARBER_DETAIL_SUCCESS";
export const BARBER_DETAIL_FAILURE = "BARBER_DETAIL_FAILURE";

// A barber managing their own shop profile.
export const MY_PROFILE_REQUEST = "MY_PROFILE_REQUEST";
export const MY_PROFILE_SUCCESS = "MY_PROFILE_SUCCESS";
export const MY_PROFILE_FAILURE = "MY_PROFILE_FAILURE";

export const MY_PROFILE_SAVE_REQUEST = "MY_PROFILE_SAVE_REQUEST";
export const MY_PROFILE_SAVE_SUCCESS = "MY_PROFILE_SAVE_SUCCESS";
export const MY_PROFILE_SAVE_FAILURE = "MY_PROFILE_SAVE_FAILURE";

/* ---------------------------- Services -------------------------- */

export const SERVICE_LIST_REQUEST = "SERVICE_LIST_REQUEST";
export const SERVICE_LIST_SUCCESS = "SERVICE_LIST_SUCCESS";
export const SERVICE_LIST_FAILURE = "SERVICE_LIST_FAILURE";

export const SERVICE_SAVE_REQUEST = "SERVICE_SAVE_REQUEST";
export const SERVICE_SAVE_SUCCESS = "SERVICE_SAVE_SUCCESS";
export const SERVICE_SAVE_FAILURE = "SERVICE_SAVE_FAILURE";

export const SERVICE_DELETE_REQUEST = "SERVICE_DELETE_REQUEST";
export const SERVICE_DELETE_SUCCESS = "SERVICE_DELETE_SUCCESS";
export const SERVICE_DELETE_FAILURE = "SERVICE_DELETE_FAILURE";

export const SERVICE_CLEAR_FEEDBACK = "SERVICE_CLEAR_FEEDBACK";

/* ---------------------------- Bookings -------------------------- */

export const AVAILABILITY_REQUEST = "AVAILABILITY_REQUEST";
export const AVAILABILITY_SUCCESS = "AVAILABILITY_SUCCESS";
export const AVAILABILITY_FAILURE = "AVAILABILITY_FAILURE";
export const AVAILABILITY_CLEAR = "AVAILABILITY_CLEAR";

export const BOOKING_CREATE_REQUEST = "BOOKING_CREATE_REQUEST";
export const BOOKING_CREATE_SUCCESS = "BOOKING_CREATE_SUCCESS";
export const BOOKING_CREATE_FAILURE = "BOOKING_CREATE_FAILURE";

export const MY_BOOKINGS_REQUEST = "MY_BOOKINGS_REQUEST";
export const MY_BOOKINGS_SUCCESS = "MY_BOOKINGS_SUCCESS";
export const MY_BOOKINGS_FAILURE = "MY_BOOKINGS_FAILURE";

export const APPOINTMENTS_REQUEST = "APPOINTMENTS_REQUEST";
export const APPOINTMENTS_SUCCESS = "APPOINTMENTS_SUCCESS";
export const APPOINTMENTS_FAILURE = "APPOINTMENTS_FAILURE";

export const BOOKING_UPDATE_REQUEST = "BOOKING_UPDATE_REQUEST";
export const BOOKING_UPDATE_SUCCESS = "BOOKING_UPDATE_SUCCESS";
export const BOOKING_UPDATE_FAILURE = "BOOKING_UPDATE_FAILURE";

export const BOOKING_CLEAR_FEEDBACK = "BOOKING_CLEAR_FEEDBACK";

/* ----------------------------- Admin ------------------------------ */

export const ADMIN_OVERVIEW_REQUEST = "ADMIN_OVERVIEW_REQUEST";
export const ADMIN_OVERVIEW_SUCCESS = "ADMIN_OVERVIEW_SUCCESS";
export const ADMIN_OVERVIEW_FAILURE = "ADMIN_OVERVIEW_FAILURE";

export const ADMIN_BOOKINGS_LIST_REQUEST = "ADMIN_BOOKINGS_LIST_REQUEST";
export const ADMIN_BOOKINGS_LIST_SUCCESS = "ADMIN_BOOKINGS_LIST_SUCCESS";
export const ADMIN_BOOKINGS_LIST_FAILURE = "ADMIN_BOOKINGS_LIST_FAILURE";

// Covers create, status change, reschedule, and payment recording -- every
// one of these is "send a change, get one updated booking back". The
// reducer replaces that booking in the list if its id is already there, or
// prepends it (a brand new booking) if not -- see adminReducer.js.
export const ADMIN_BOOKING_SAVE_REQUEST = "ADMIN_BOOKING_SAVE_REQUEST";
export const ADMIN_BOOKING_SAVE_SUCCESS = "ADMIN_BOOKING_SAVE_SUCCESS";
export const ADMIN_BOOKING_SAVE_FAILURE = "ADMIN_BOOKING_SAVE_FAILURE";

export const ADMIN_BOOKING_CLEAR_FEEDBACK = "ADMIN_BOOKING_CLEAR_FEEDBACK";

// A REAL, permanent delete -- separate from ADMIN_BOOKING_SAVE_* (which
// covers status changes, reschedules and payment updates, all "one booking
// comes back changed"). This one removes the booking from the list
// entirely instead of upserting it. See adminBookingController.deleteBooking.
export const ADMIN_BOOKING_DELETE_REQUEST = "ADMIN_BOOKING_DELETE_REQUEST";
export const ADMIN_BOOKING_DELETE_SUCCESS = "ADMIN_BOOKING_DELETE_SUCCESS";
export const ADMIN_BOOKING_DELETE_FAILURE = "ADMIN_BOOKING_DELETE_FAILURE";

// A lightweight barber/service list for the booking form's dropdowns --
// separate from the public `barbers`/`services` slices, which only ever
// show published/active ones and are scoped to what a customer should see.
export const ADMIN_BARBERS_PICKER_REQUEST = "ADMIN_BARBERS_PICKER_REQUEST";
export const ADMIN_BARBERS_PICKER_SUCCESS = "ADMIN_BARBERS_PICKER_SUCCESS";
export const ADMIN_BARBERS_PICKER_FAILURE = "ADMIN_BARBERS_PICKER_FAILURE";

export const ADMIN_SERVICES_PICKER_REQUEST = "ADMIN_SERVICES_PICKER_REQUEST";
export const ADMIN_SERVICES_PICKER_SUCCESS = "ADMIN_SERVICES_PICKER_SUCCESS";
export const ADMIN_SERVICES_PICKER_FAILURE = "ADMIN_SERVICES_PICKER_FAILURE";
export const ADMIN_SERVICES_PICKER_CLEAR = "ADMIN_SERVICES_PICKER_CLEAR";

/* ------------------------------ Admin: clients --------------------------- */

export const ADMIN_CLIENTS_LIST_REQUEST = "ADMIN_CLIENTS_LIST_REQUEST";
export const ADMIN_CLIENTS_LIST_SUCCESS = "ADMIN_CLIENTS_LIST_SUCCESS";
export const ADMIN_CLIENTS_LIST_FAILURE = "ADMIN_CLIENTS_LIST_FAILURE";

export const ADMIN_CLIENT_DETAIL_REQUEST = "ADMIN_CLIENT_DETAIL_REQUEST";
export const ADMIN_CLIENT_DETAIL_SUCCESS = "ADMIN_CLIENT_DETAIL_SUCCESS";
export const ADMIN_CLIENT_DETAIL_FAILURE = "ADMIN_CLIENT_DETAIL_FAILURE";

export const ADMIN_CLIENT_SAVE_REQUEST = "ADMIN_CLIENT_SAVE_REQUEST";
export const ADMIN_CLIENT_SAVE_SUCCESS = "ADMIN_CLIENT_SAVE_SUCCESS";
export const ADMIN_CLIENT_SAVE_FAILURE = "ADMIN_CLIENT_SAVE_FAILURE";

export const ADMIN_CLIENT_CLEAR_FEEDBACK = "ADMIN_CLIENT_CLEAR_FEEDBACK";

export const ADMIN_CLIENT_DELETE_REQUEST = "ADMIN_CLIENT_DELETE_REQUEST";
export const ADMIN_CLIENT_DELETE_SUCCESS = "ADMIN_CLIENT_DELETE_SUCCESS";
export const ADMIN_CLIENT_DELETE_FAILURE = "ADMIN_CLIENT_DELETE_FAILURE";

// Suspend / reactivate a client -- see adminClientController.js's
// suspendClient/reactivateClient. Mirrors ADMIN_BARBER_STATUS_* below.
export const ADMIN_CLIENT_STATUS_REQUEST = "ADMIN_CLIENT_STATUS_REQUEST";
export const ADMIN_CLIENT_STATUS_SUCCESS = "ADMIN_CLIENT_STATUS_SUCCESS";
export const ADMIN_CLIENT_STATUS_FAILURE = "ADMIN_CLIENT_STATUS_FAILURE";

/* ------------------------------ Admin: barbers ---------------------------- */

export const ADMIN_BARBERS_LIST_REQUEST = "ADMIN_BARBERS_LIST_REQUEST";
export const ADMIN_BARBERS_LIST_SUCCESS = "ADMIN_BARBERS_LIST_SUCCESS";
export const ADMIN_BARBERS_LIST_FAILURE = "ADMIN_BARBERS_LIST_FAILURE";

export const ADMIN_BARBER_DETAIL_REQUEST = "ADMIN_BARBER_DETAIL_REQUEST";
export const ADMIN_BARBER_DETAIL_SUCCESS = "ADMIN_BARBER_DETAIL_SUCCESS";
export const ADMIN_BARBER_DETAIL_FAILURE = "ADMIN_BARBER_DETAIL_FAILURE";

export const ADMIN_BARBER_SAVE_REQUEST = "ADMIN_BARBER_SAVE_REQUEST";
export const ADMIN_BARBER_SAVE_SUCCESS = "ADMIN_BARBER_SAVE_SUCCESS";
export const ADMIN_BARBER_SAVE_FAILURE = "ADMIN_BARBER_SAVE_FAILURE";

export const ADMIN_BARBER_CLEAR_FEEDBACK = "ADMIN_BARBER_CLEAR_FEEDBACK";

export const ADMIN_BARBER_DELETE_REQUEST = "ADMIN_BARBER_DELETE_REQUEST";
export const ADMIN_BARBER_DELETE_SUCCESS = "ADMIN_BARBER_DELETE_SUCCESS";
export const ADMIN_BARBER_DELETE_FAILURE = "ADMIN_BARBER_DELETE_FAILURE";

// Suspend / reactivate an already-active (or suspended/rejected) barber --
// see adminBarberController.js's suspendBarber/reactivateBarber. Kept apart
// from ADMIN_BARBER_SAVE_* because the request carries no editable fields,
// just an id.
export const ADMIN_BARBER_STATUS_REQUEST = "ADMIN_BARBER_STATUS_REQUEST";
export const ADMIN_BARBER_STATUS_SUCCESS = "ADMIN_BARBER_STATUS_SUCCESS";
export const ADMIN_BARBER_STATUS_FAILURE = "ADMIN_BARBER_STATUS_FAILURE";

/* ------------------------- Admin: barber approvals ------------------------ */

export const ADMIN_BARBER_APPLICATIONS_LIST_REQUEST = "ADMIN_BARBER_APPLICATIONS_LIST_REQUEST";
export const ADMIN_BARBER_APPLICATIONS_LIST_SUCCESS = "ADMIN_BARBER_APPLICATIONS_LIST_SUCCESS";
export const ADMIN_BARBER_APPLICATIONS_LIST_FAILURE = "ADMIN_BARBER_APPLICATIONS_LIST_FAILURE";

// Covers both approve and reject -- both are "decide on one application",
// and the reducer's job in either case is the same: remove it from
// whichever list is currently loaded (it no longer belongs in the tab the
// admin was just looking at).
export const ADMIN_BARBER_APPLICATION_DECIDE_REQUEST = "ADMIN_BARBER_APPLICATION_DECIDE_REQUEST";
export const ADMIN_BARBER_APPLICATION_DECIDE_SUCCESS = "ADMIN_BARBER_APPLICATION_DECIDE_SUCCESS";
export const ADMIN_BARBER_APPLICATION_DECIDE_FAILURE = "ADMIN_BARBER_APPLICATION_DECIDE_FAILURE";

export const ADMIN_BARBER_APPLICATION_CLEAR_FEEDBACK = "ADMIN_BARBER_APPLICATION_CLEAR_FEEDBACK";

/* ------------------------------ Admin: services --------------------------- */

export const ADMIN_SERVICES_LIST_REQUEST = "ADMIN_SERVICES_LIST_REQUEST";
export const ADMIN_SERVICES_LIST_SUCCESS = "ADMIN_SERVICES_LIST_SUCCESS";
export const ADMIN_SERVICES_LIST_FAILURE = "ADMIN_SERVICES_LIST_FAILURE";

export const ADMIN_SERVICE_SAVE_REQUEST = "ADMIN_SERVICE_SAVE_REQUEST";
export const ADMIN_SERVICE_SAVE_SUCCESS = "ADMIN_SERVICE_SAVE_SUCCESS";
export const ADMIN_SERVICE_SAVE_FAILURE = "ADMIN_SERVICE_SAVE_FAILURE";

export const ADMIN_SERVICE_DELETE_REQUEST = "ADMIN_SERVICE_DELETE_REQUEST";
export const ADMIN_SERVICE_DELETE_SUCCESS = "ADMIN_SERVICE_DELETE_SUCCESS";
export const ADMIN_SERVICE_DELETE_FAILURE = "ADMIN_SERVICE_DELETE_FAILURE";

export const ADMIN_SERVICE_CLEAR_FEEDBACK = "ADMIN_SERVICE_CLEAR_FEEDBACK";

/* ------------------------------ Admin: reviews ---------------------------- */

export const ADMIN_REVIEWS_LIST_REQUEST = "ADMIN_REVIEWS_LIST_REQUEST";
export const ADMIN_REVIEWS_LIST_SUCCESS = "ADMIN_REVIEWS_LIST_SUCCESS";
export const ADMIN_REVIEWS_LIST_FAILURE = "ADMIN_REVIEWS_LIST_FAILURE";

export const ADMIN_REVIEW_UPDATE_REQUEST = "ADMIN_REVIEW_UPDATE_REQUEST";
export const ADMIN_REVIEW_UPDATE_SUCCESS = "ADMIN_REVIEW_UPDATE_SUCCESS";
export const ADMIN_REVIEW_UPDATE_FAILURE = "ADMIN_REVIEW_UPDATE_FAILURE";

export const ADMIN_REVIEW_DELETE_REQUEST = "ADMIN_REVIEW_DELETE_REQUEST";
export const ADMIN_REVIEW_DELETE_SUCCESS = "ADMIN_REVIEW_DELETE_SUCCESS";
export const ADMIN_REVIEW_DELETE_FAILURE = "ADMIN_REVIEW_DELETE_FAILURE";

export const ADMIN_REVIEW_CLEAR_FEEDBACK = "ADMIN_REVIEW_CLEAR_FEEDBACK";

/* ----------------------------- Admin: settings ----------------------------- */

export const ADMIN_SETTINGS_REQUEST = "ADMIN_SETTINGS_REQUEST";
export const ADMIN_SETTINGS_SUCCESS = "ADMIN_SETTINGS_SUCCESS";
export const ADMIN_SETTINGS_FAILURE = "ADMIN_SETTINGS_FAILURE";

export const ADMIN_SETTINGS_SAVE_REQUEST = "ADMIN_SETTINGS_SAVE_REQUEST";
export const ADMIN_SETTINGS_SAVE_SUCCESS = "ADMIN_SETTINGS_SAVE_SUCCESS";
export const ADMIN_SETTINGS_SAVE_FAILURE = "ADMIN_SETTINGS_SAVE_FAILURE";

export const ADMIN_SETTINGS_CLEAR_FEEDBACK = "ADMIN_SETTINGS_CLEAR_FEEDBACK";

/* ---------------------------- Admin: audit log ---------------------------- */

// Read only -- there is deliberately no create/update/delete here, matching
// the server (see adminAuditLogController.js).
export const ADMIN_AUDIT_LOGS_REQUEST = "ADMIN_AUDIT_LOGS_REQUEST";
export const ADMIN_AUDIT_LOGS_SUCCESS = "ADMIN_AUDIT_LOGS_SUCCESS";
export const ADMIN_AUDIT_LOGS_FAILURE = "ADMIN_AUDIT_LOGS_FAILURE";

/* --------------------- Account verification & password reset --------------------- */

// Sending (and re-sending) a 6-digit code. The server never returns the
// code itself -- see controllers/verificationController.js -- so no action
// here can carry one.
export const VERIFY_SEND_REQUEST = "VERIFY_SEND_REQUEST";
export const VERIFY_SEND_SUCCESS = "VERIFY_SEND_SUCCESS";
export const VERIFY_SEND_FAILURE = "VERIFY_SEND_FAILURE";

export const VERIFY_CODE_REQUEST = "VERIFY_CODE_REQUEST";
export const VERIFY_CODE_SUCCESS = "VERIFY_CODE_SUCCESS";
export const VERIFY_CODE_FAILURE = "VERIFY_CODE_FAILURE";

export const RESET_REQUEST_REQUEST = "RESET_REQUEST_REQUEST";
export const RESET_REQUEST_SUCCESS = "RESET_REQUEST_SUCCESS";
export const RESET_REQUEST_FAILURE = "RESET_REQUEST_FAILURE";

export const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
export const RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS";
export const RESET_PASSWORD_FAILURE = "RESET_PASSWORD_FAILURE";

export const VERIFY_CLEAR = "VERIFY_CLEAR";

/* ------------------------------ Reviews ----------------------------------- */

export const REVIEW_SUBMIT_REQUEST = "REVIEW_SUBMIT_REQUEST";
export const REVIEW_SUBMIT_SUCCESS = "REVIEW_SUBMIT_SUCCESS";
export const REVIEW_SUBMIT_FAILURE = "REVIEW_SUBMIT_FAILURE";

export const MY_REVIEWS_REQUEST = "MY_REVIEWS_REQUEST";
export const MY_REVIEWS_SUCCESS = "MY_REVIEWS_SUCCESS";
export const MY_REVIEWS_FAILURE = "MY_REVIEWS_FAILURE";

export const REVIEW_CLEAR_FEEDBACK = "REVIEW_CLEAR_FEEDBACK";

/* --------------------- Pending registration (verify-before-create) --------------------- */

// Registering no longer creates an account -- see server/controllers/
// pendingRegistrationController.js. These cover the submission step only;
// the account is actually created by verifyRegistrationCode in
// verificationActions.js, which reuses VERIFY_CODE_SUCCESS (the account
// now genuinely exists and the person is logged in) rather than a fourth
// set of types for the same shape.
export const PENDING_REGISTRATION_REQUEST = "PENDING_REGISTRATION_REQUEST";
export const PENDING_REGISTRATION_SUCCESS = "PENDING_REGISTRATION_SUCCESS";
export const PENDING_REGISTRATION_FAILURE = "PENDING_REGISTRATION_FAILURE";

/* ------------------------------ Notifications ------------------------------ */

export const NOTIFICATIONS_REQUEST = "NOTIFICATIONS_REQUEST";
export const NOTIFICATIONS_SUCCESS = "NOTIFICATIONS_SUCCESS";
export const NOTIFICATIONS_FAILURE = "NOTIFICATIONS_FAILURE";
export const NOTIFICATIONS_UNREAD_COUNT = "NOTIFICATIONS_UNREAD_COUNT";
export const NOTIFICATION_MARK_READ = "NOTIFICATION_MARK_READ";
export const NOTIFICATIONS_MARK_ALL_READ = "NOTIFICATIONS_MARK_ALL_READ";
export const NOTIFICATION_DELETE = "NOTIFICATION_DELETE";
