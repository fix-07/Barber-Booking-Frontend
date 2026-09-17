import * as types from "../actionTypes";

const initialState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.NOTIFICATIONS_REQUEST:
      return { ...state, isLoading: true, error: null };

    case types.NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        items: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
      };

    case types.NOTIFICATIONS_FAILURE:
      return { ...state, isLoading: false, error: action.payload.message };

    case types.NOTIFICATIONS_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };

    case types.NOTIFICATION_MARK_READ:
      return {
        ...state,
        items: state.items.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case types.NOTIFICATIONS_MARK_ALL_READ:
      return {
        ...state,
        items: state.items.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      };

    case types.NOTIFICATION_DELETE: {
      const removed = state.items.find((n) => n.id === action.payload);
      return {
        ...state,
        items: state.items.filter((n) => n.id !== action.payload),
        unreadCount:
          removed && !removed.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }

    default:
      return state;
  }
};

export default notificationReducer;
