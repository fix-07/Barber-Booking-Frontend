import * as types from "../actionTypes";

const initialState = {
  // Overview / analytics
  overview: null, // { range, today, snapshot, period } -- see adminAnalyticsController.js
  isLoadingOverview: false,
  overviewError: null,

  // Bookings (also used by the Calendar page, which just asks for a wider
  // date range)
  bookings: [],
  bookingsTotal: 0,
  isLoadingBookings: false,
  bookingsError: null,

  isSavingBooking: false,
  bookingError: null,
  bookingFieldErrors: {},
  bookingMessage: null,

  isDeletingBooking: false,
  bookingDeleteError: null,

  // Booking-form pickers
  barberOptions: [],
  isLoadingBarberOptions: false,
  serviceOptions: [],
  isLoadingServiceOptions: false,

  // Clients
  clients: [],
  clientsTotal: 0,
  isLoadingClients: false,
  clientsError: null,

  clientDetail: null, // { client, favoriteService, totalSpentMinor, totalVisits, lastVisit, upcomingAppointments, bookingHistory }
  isLoadingClientDetail: false,
  clientDetailError: null,

  isSavingClient: false,
  clientError: null,
  clientFieldErrors: {},
  clientMessage: null,

  isDeletingClient: false,
  clientDeleteError: null,

  isUpdatingClientStatus: false,
  clientStatusError: null,

  // Barbers (the full admin list/detail -- separate from barberOptions
  // above, which is the lightweight picker shape for a <select>)
  barbersList: [],
  barbersListTotal: 0,
  isLoadingBarbersList: false,
  barbersListError: null,

  barberDetail: null, // { barber: { id, name, email, phone, profile }, todaysAppointmentsCount, weeklyRevenueMinor }
  isLoadingBarberDetail: false,
  barberDetailError: null,

  isSavingBarber: false,
  barberError: null,
  barberFieldErrors: {},
  barberMessage: null,
  // Shown once right after creating a barber -- see adminBarberController.js
  // on why this is the only time it is ever available.
  lastCreatedBarberPassword: null,

  isDeletingBarber: false,
  barberDeleteError: null,

  isUpdatingBarberStatus: false,
  barberStatusError: null,

  // Barber applications (Admin -> Barber Approvals). Separate from
  // barbersList above: this is the review queue (pending/approved/rejected
  // tabs, with application-only fields like photo/experience/specialties),
  // not the general "manage every barber" list.
  barberApplications: [],
  barberApplicationsTotal: 0,
  isLoadingBarberApplications: false,
  barberApplicationsError: null,

  isDecidingBarberApplication: false,
  barberApplicationError: null,
  barberApplicationMessage: null,

  // Services (the full cross-barber admin list -- separate from
  // serviceOptions above, the picker shape for the booking form)
  servicesList: [],
  servicesListTotal: 0,
  isLoadingServicesList: false,
  servicesListError: null,

  isSavingService: false,
  serviceError: null,
  serviceFieldErrors: {},
  serviceMessage: null,

  // Audit log (read only)
  auditLogs: [],
  auditLogsTotal: 0,
  auditResourceTypes: [],
  auditActions: [],
  isLoadingAuditLogs: false,
  auditLogsError: null,

  // Reviews
  reviews: [],
  reviewsTotal: 0,
  isLoadingReviews: false,
  reviewsError: null,

  isSavingReview: false,
  reviewError: null,
  reviewMessage: null,
};

/** Same idea as bookingReducer's replaceIn, plus: unknown id -> prepend. */
const upsertBooking = (list, booking) => {
  const exists = list.some((item) => item.id === booking.id);
  if (exists) {
    return list.map((item) => (item.id === booking.id ? { ...item, ...booking } : item));
  }
  return [booking, ...list];
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    /* ---------------- overview ---------------- */
    case types.ADMIN_OVERVIEW_REQUEST:
      return { ...state, isLoadingOverview: true, overviewError: null };

    case types.ADMIN_OVERVIEW_SUCCESS:
      return { ...state, isLoadingOverview: false, overview: action.payload };

    case types.ADMIN_OVERVIEW_FAILURE:
      return { ...state, isLoadingOverview: false, overviewError: action.payload.message };

    /* ---------------- bookings list ------------ */
    case types.ADMIN_BOOKINGS_LIST_REQUEST:
      return { ...state, isLoadingBookings: true, bookingsError: null };

    case types.ADMIN_BOOKINGS_LIST_SUCCESS:
      return {
        ...state,
        isLoadingBookings: false,
        bookings: action.payload.bookings,
        bookingsTotal: action.payload.total,
      };

    case types.ADMIN_BOOKINGS_LIST_FAILURE:
      return { ...state, isLoadingBookings: false, bookingsError: action.payload.message };

    /* ---------------- create / update one ------ */
    case types.ADMIN_BOOKING_SAVE_REQUEST:
      return { ...state, isSavingBooking: true, bookingError: null, bookingFieldErrors: {} };

    case types.ADMIN_BOOKING_SAVE_SUCCESS:
      return {
        ...state,
        isSavingBooking: false,
        bookingMessage: action.payload.message,
        bookings: upsertBooking(state.bookings, action.payload.booking),
      };

    case types.ADMIN_BOOKING_SAVE_FAILURE:
      return {
        ...state,
        isSavingBooking: false,
        bookingError: action.payload.message,
        bookingFieldErrors: action.payload.fieldErrors || {},
      };

    case types.ADMIN_BOOKING_CLEAR_FEEDBACK:
      return { ...state, bookingMessage: null, bookingError: null, bookingFieldErrors: {} };

    case types.ADMIN_BOOKING_DELETE_REQUEST:
      return { ...state, isDeletingBooking: true, bookingDeleteError: null };

    case types.ADMIN_BOOKING_DELETE_SUCCESS:
      return {
        ...state,
        isDeletingBooking: false,
        bookingMessage: action.payload.message,
        bookings: state.bookings.filter((b) => b.id !== action.payload.bookingId),
        bookingsTotal: Math.max(0, state.bookingsTotal - 1),
      };

    case types.ADMIN_BOOKING_DELETE_FAILURE:
      return { ...state, isDeletingBooking: false, bookingDeleteError: action.payload.message };

    /* ---------------- pickers ------------------- */
    case types.ADMIN_BARBERS_PICKER_REQUEST:
      return { ...state, isLoadingBarberOptions: true };

    case types.ADMIN_BARBERS_PICKER_SUCCESS:
      return { ...state, isLoadingBarberOptions: false, barberOptions: action.payload };

    case types.ADMIN_BARBERS_PICKER_FAILURE:
      return { ...state, isLoadingBarberOptions: false, barberOptions: [] };

    case types.ADMIN_SERVICES_PICKER_REQUEST:
      return { ...state, isLoadingServiceOptions: true };

    case types.ADMIN_SERVICES_PICKER_SUCCESS:
      return { ...state, isLoadingServiceOptions: false, serviceOptions: action.payload };

    case types.ADMIN_SERVICES_PICKER_FAILURE:
      return { ...state, isLoadingServiceOptions: false, serviceOptions: [] };

    case types.ADMIN_SERVICES_PICKER_CLEAR:
      return { ...state, serviceOptions: [] };

    /* ==================== clients ==================== */
    case types.ADMIN_CLIENTS_LIST_REQUEST:
      return { ...state, isLoadingClients: true, clientsError: null };

    case types.ADMIN_CLIENTS_LIST_SUCCESS:
      return {
        ...state,
        isLoadingClients: false,
        clients: action.payload.clients,
        clientsTotal: action.payload.total,
      };

    case types.ADMIN_CLIENTS_LIST_FAILURE:
      return { ...state, isLoadingClients: false, clientsError: action.payload.message };

    case types.ADMIN_CLIENT_DETAIL_REQUEST:
      return { ...state, isLoadingClientDetail: true, clientDetailError: null };

    case types.ADMIN_CLIENT_DETAIL_SUCCESS:
      return { ...state, isLoadingClientDetail: false, clientDetail: action.payload };

    case types.ADMIN_CLIENT_DETAIL_FAILURE:
      return { ...state, isLoadingClientDetail: false, clientDetailError: action.payload.message };

    case types.ADMIN_CLIENT_SAVE_REQUEST:
      return { ...state, isSavingClient: true, clientError: null, clientFieldErrors: {} };

    case types.ADMIN_CLIENT_SAVE_SUCCESS: {
      const client = action.payload.client;
      const exists = state.clients.some((c) => c.id === client.id);
      return {
        ...state,
        isSavingClient: false,
        clientMessage: action.payload.message,
        clients: exists
          ? state.clients.map((c) => (c.id === client.id ? { ...c, ...client } : c))
          : [client, ...state.clients],
        clientDetail:
          state.clientDetail && state.clientDetail.client.id === client.id
            ? { ...state.clientDetail, client: { ...state.clientDetail.client, ...client } }
            : state.clientDetail,
      };
    }

    case types.ADMIN_CLIENT_SAVE_FAILURE:
      return {
        ...state,
        isSavingClient: false,
        clientError: action.payload.message,
        clientFieldErrors: action.payload.fieldErrors || {},
      };

    case types.ADMIN_CLIENT_CLEAR_FEEDBACK:
      return { ...state, clientMessage: null, clientError: null, clientFieldErrors: {} };

    case types.ADMIN_CLIENT_DELETE_REQUEST:
      return { ...state, isDeletingClient: true, clientDeleteError: null };

    case types.ADMIN_CLIENT_DELETE_SUCCESS:
      return {
        ...state,
        isDeletingClient: false,
        clients: state.clients.filter((c) => c.id !== action.payload.clientId),
        clientsTotal: Math.max(0, state.clientsTotal - 1),
      };

    case types.ADMIN_CLIENT_DELETE_FAILURE:
      return { ...state, isDeletingClient: false, clientDeleteError: action.payload.message };

    case types.ADMIN_CLIENT_STATUS_REQUEST:
      return { ...state, isUpdatingClientStatus: true, clientStatusError: null };

    case types.ADMIN_CLIENT_STATUS_SUCCESS: {
      const { clientId, status, message } = action.payload;
      return {
        ...state,
        isUpdatingClientStatus: false,
        clientMessage: message,
        clients: state.clients.map((c) => (c.id === clientId ? { ...c, status } : c)),
        clientDetail:
          state.clientDetail && String(state.clientDetail.client.id) === String(clientId)
            ? { ...state.clientDetail, client: { ...state.clientDetail.client, status } }
            : state.clientDetail,
      };
    }

    case types.ADMIN_CLIENT_STATUS_FAILURE:
      return { ...state, isUpdatingClientStatus: false, clientStatusError: action.payload.message };

    /* ==================== barbers ==================== */
    case types.ADMIN_BARBERS_LIST_REQUEST:
      return { ...state, isLoadingBarbersList: true, barbersListError: null };

    case types.ADMIN_BARBERS_LIST_SUCCESS:
      return {
        ...state,
        isLoadingBarbersList: false,
        barbersList: action.payload.barbers,
        barbersListTotal: action.payload.total,
      };

    case types.ADMIN_BARBERS_LIST_FAILURE:
      return { ...state, isLoadingBarbersList: false, barbersListError: action.payload.message };

    case types.ADMIN_BARBER_DETAIL_REQUEST:
      return { ...state, isLoadingBarberDetail: true, barberDetailError: null };

    case types.ADMIN_BARBER_DETAIL_SUCCESS:
      return { ...state, isLoadingBarberDetail: false, barberDetail: action.payload };

    case types.ADMIN_BARBER_DETAIL_FAILURE:
      return { ...state, isLoadingBarberDetail: false, barberDetailError: action.payload.message };

    case types.ADMIN_BARBER_SAVE_REQUEST:
      return { ...state, isSavingBarber: true, barberError: null, barberFieldErrors: {} };

    case types.ADMIN_BARBER_SAVE_SUCCESS:
      return {
        ...state,
        isSavingBarber: false,
        barberMessage: action.payload.message,
        lastCreatedBarberPassword: action.payload.temporaryPassword || state.lastCreatedBarberPassword,
        barberDetail:
          action.payload.profile && state.barberDetail
            ? { ...state.barberDetail, barber: { ...state.barberDetail.barber, profile: action.payload.profile } }
            : state.barberDetail,
      };

    case types.ADMIN_BARBER_SAVE_FAILURE:
      return {
        ...state,
        isSavingBarber: false,
        barberError: action.payload.message,
        barberFieldErrors: action.payload.fieldErrors || {},
      };

    case types.ADMIN_BARBER_CLEAR_FEEDBACK:
      return {
        ...state,
        barberMessage: null,
        barberError: null,
        barberFieldErrors: {},
        lastCreatedBarberPassword: null,
      };

    case types.ADMIN_BARBER_DELETE_REQUEST:
      return { ...state, isDeletingBarber: true, barberDeleteError: null };

    case types.ADMIN_BARBER_DELETE_SUCCESS:
      return {
        ...state,
        isDeletingBarber: false,
        barbersList: state.barbersList.filter((b) => b.barberId !== action.payload.barberId),
        barbersListTotal: Math.max(0, state.barbersListTotal - 1),
      };

    case types.ADMIN_BARBER_DELETE_FAILURE:
      return { ...state, isDeletingBarber: false, barberDeleteError: action.payload.message };

    case types.ADMIN_BARBER_STATUS_REQUEST:
      return { ...state, isUpdatingBarberStatus: true, barberStatusError: null };

    case types.ADMIN_BARBER_STATUS_SUCCESS: {
      const { barberId, status, isPublished, message } = action.payload;
      const patch = isPublished === undefined ? { status } : { status, isPublished };
      return {
        ...state,
        isUpdatingBarberStatus: false,
        barberMessage: message,
        barbersList: state.barbersList.map((b) => (b.barberId === barberId ? { ...b, ...patch } : b)),
        barberDetail:
          state.barberDetail && String(state.barberDetail.barber.id) === String(barberId)
            ? { ...state.barberDetail, barber: { ...state.barberDetail.barber, status } }
            : state.barberDetail,
      };
    }

    case types.ADMIN_BARBER_STATUS_FAILURE:
      return { ...state, isUpdatingBarberStatus: false, barberStatusError: action.payload.message };

    /* ==================== barber applications ==================== */
    case types.ADMIN_BARBER_APPLICATIONS_LIST_REQUEST:
      return { ...state, isLoadingBarberApplications: true, barberApplicationsError: null };

    case types.ADMIN_BARBER_APPLICATIONS_LIST_SUCCESS:
      return {
        ...state,
        isLoadingBarberApplications: false,
        barberApplications: action.payload.applications,
        barberApplicationsTotal: action.payload.total,
      };

    case types.ADMIN_BARBER_APPLICATIONS_LIST_FAILURE:
      return { ...state, isLoadingBarberApplications: false, barberApplicationsError: action.payload.message };

    case types.ADMIN_BARBER_APPLICATION_DECIDE_REQUEST:
      return { ...state, isDecidingBarberApplication: true, barberApplicationError: null };

    case types.ADMIN_BARBER_APPLICATION_DECIDE_SUCCESS:
      return {
        ...state,
        isDecidingBarberApplication: false,
        barberApplicationMessage: action.payload.message,
        // The decided application no longer belongs in whichever tab was
        // loaded (pending -> approved/rejected) -- remove it here for
        // instant feedback; switching tabs refetches the real list.
        barberApplications: state.barberApplications.filter((a) => a.id !== action.payload.applicantId),
        barberApplicationsTotal: Math.max(0, state.barberApplicationsTotal - 1),
      };

    case types.ADMIN_BARBER_APPLICATION_DECIDE_FAILURE:
      return { ...state, isDecidingBarberApplication: false, barberApplicationError: action.payload.message };

    case types.ADMIN_BARBER_APPLICATION_CLEAR_FEEDBACK:
      return { ...state, barberApplicationMessage: null, barberApplicationError: null };

    /* ==================== services ==================== */
    case types.ADMIN_SERVICES_LIST_REQUEST:
      return { ...state, isLoadingServicesList: true, servicesListError: null };

    case types.ADMIN_SERVICES_LIST_SUCCESS:
      return {
        ...state,
        isLoadingServicesList: false,
        servicesList: action.payload.services,
        servicesListTotal: action.payload.total,
      };

    case types.ADMIN_SERVICES_LIST_FAILURE:
      return { ...state, isLoadingServicesList: false, servicesListError: action.payload.message };

    case types.ADMIN_SERVICE_SAVE_REQUEST:
      return { ...state, isSavingService: true, serviceError: null, serviceFieldErrors: {} };

    case types.ADMIN_SERVICE_SAVE_SUCCESS: {
      const service = action.payload.service;
      const exists = state.servicesList.some((s) => s.id === service.id);
      return {
        ...state,
        isSavingService: false,
        serviceMessage: action.payload.message,
        servicesList: exists
          ? state.servicesList.map((s) => (s.id === service.id ? { ...s, ...service } : s))
          : [service, ...state.servicesList],
      };
    }

    case types.ADMIN_SERVICE_SAVE_FAILURE:
      return {
        ...state,
        isSavingService: false,
        serviceError: action.payload.message,
        serviceFieldErrors: action.payload.fieldErrors || {},
      };

    case types.ADMIN_SERVICE_DELETE_REQUEST:
      return { ...state, isSavingService: true, serviceError: null };

    case types.ADMIN_SERVICE_DELETE_SUCCESS:
      return {
        ...state,
        isSavingService: false,
        serviceMessage: action.payload.message,
        // A real, permanent delete -- always removed from the list, no
        // "deactivated instead" fallback. See adminServiceController.js's
        // deleteAnyService for why this is safe (Booking already snapshots
        // everything an existing booking needs independently).
        servicesList: state.servicesList.filter((s) => s.id !== action.payload.serviceId),
      };

    case types.ADMIN_SERVICE_DELETE_FAILURE:
      return { ...state, isSavingService: false, serviceError: action.payload.message };

    case types.ADMIN_SERVICE_CLEAR_FEEDBACK:
      return { ...state, serviceMessage: null, serviceError: null, serviceFieldErrors: {} };

    /* ==================== reviews ==================== */
    case types.ADMIN_REVIEWS_LIST_REQUEST:
      return { ...state, isLoadingReviews: true, reviewsError: null };

    case types.ADMIN_REVIEWS_LIST_SUCCESS:
      return {
        ...state,
        isLoadingReviews: false,
        reviews: action.payload.reviews,
        reviewsTotal: action.payload.total,
      };

    case types.ADMIN_REVIEWS_LIST_FAILURE:
      return { ...state, isLoadingReviews: false, reviewsError: action.payload.message };

    case types.ADMIN_REVIEW_UPDATE_REQUEST:
      return { ...state, isSavingReview: true, reviewError: null };

    case types.ADMIN_REVIEW_UPDATE_SUCCESS:
      return {
        ...state,
        isSavingReview: false,
        reviewMessage: action.payload.message,
        reviews: state.reviews.map((r) => (r.id === action.payload.review.id ? action.payload.review : r)),
      };

    case types.ADMIN_REVIEW_UPDATE_FAILURE:
      return { ...state, isSavingReview: false, reviewError: action.payload.message };

    case types.ADMIN_REVIEW_DELETE_REQUEST:
      return { ...state, isSavingReview: true, reviewError: null };

    case types.ADMIN_REVIEW_DELETE_SUCCESS:
      return {
        ...state,
        isSavingReview: false,
        reviews: state.reviews.filter((r) => r.id !== action.payload.reviewId),
        reviewsTotal: Math.max(0, state.reviewsTotal - 1),
      };

    case types.ADMIN_REVIEW_DELETE_FAILURE:
      return { ...state, isSavingReview: false, reviewError: action.payload.message };

    case types.ADMIN_REVIEW_CLEAR_FEEDBACK:
      return { ...state, reviewMessage: null, reviewError: null };

    /* ==================== audit log ==================== */
    case types.ADMIN_AUDIT_LOGS_REQUEST:
      return { ...state, isLoadingAuditLogs: true, auditLogsError: null };

    case types.ADMIN_AUDIT_LOGS_SUCCESS:
      return {
        ...state,
        isLoadingAuditLogs: false,
        auditLogs: action.payload.logs,
        auditLogsTotal: action.payload.total,
        auditResourceTypes: action.payload.resourceTypes,
        auditActions: action.payload.actions,
      };

    case types.ADMIN_AUDIT_LOGS_FAILURE:
      return { ...state, isLoadingAuditLogs: false, auditLogsError: action.payload.message };

    default:
      return state;
  }
};

export default adminReducer;
