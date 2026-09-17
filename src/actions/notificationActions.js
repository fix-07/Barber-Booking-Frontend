import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

/**
 * The notification bell's actions. All five talk to the real API in
 * server/controllers/notificationController.js -- every list, count,
 * mark-read and delete here is a genuine request, never simulated.
 */

export const fetchNotifications = (page = 1) => async (dispatch) => {
  dispatch({ type: types.NOTIFICATIONS_REQUEST });
  try {
    const { data } = await api.get("/notifications", { params: { page } });
    dispatch({ type: types.NOTIFICATIONS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: types.NOTIFICATIONS_FAILURE, payload: extractError(error) });
  }
};

/**
 * Lighter-weight than fetchNotifications -- just the badge number, for
 * polling. See NotificationBell.js: this is called every 30s regardless
 * of whether the dropdown is open, so it deliberately does not touch the
 * loading/error state the full list uses (a background poll failing
 * silently is correct; it must not flash an error banner over an open
 * dropdown the person is reading).
 */
export const fetchUnreadCount = () => async (dispatch) => {
  try {
    const { data } = await api.get("/notifications/unread-count");
    dispatch({ type: types.NOTIFICATIONS_UNREAD_COUNT, payload: data.unreadCount });
  } catch {
    // Silent on purpose -- see the comment above.
  }
};

export const markNotificationRead = (id) => async (dispatch) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    dispatch({ type: types.NOTIFICATION_MARK_READ, payload: id });
  } catch (error) {
    dispatch({ type: types.NOTIFICATIONS_FAILURE, payload: extractError(error) });
  }
};

export const markAllNotificationsRead = () => async (dispatch) => {
  try {
    await api.patch("/notifications/read-all");
    dispatch({ type: types.NOTIFICATIONS_MARK_ALL_READ });
  } catch (error) {
    dispatch({ type: types.NOTIFICATIONS_FAILURE, payload: extractError(error) });
  }
};

export const deleteNotification = (id) => async (dispatch) => {
  try {
    await api.delete(`/notifications/${id}`);
    dispatch({ type: types.NOTIFICATION_DELETE, payload: id });
  } catch (error) {
    dispatch({ type: types.NOTIFICATIONS_FAILURE, payload: extractError(error) });
  }
};
