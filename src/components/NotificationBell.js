import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Check, CheckCheck, Trash2, Loader2, AlertTriangle } from "lucide-react";

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../actions/notificationActions";

/**
 * The notification bell: unread badge, a dropdown of recent notifications,
 * mark-read/mark-all/delete, and the four states the spec asks for --
 * loading, error, empty, and the real list.
 *
 * ==========================================================================
 *  POLLING, NOT A WEBSOCKET
 * ==========================================================================
 *
 * This app's whole architecture is classic request/response Express +
 * REST, with no WebSocket server, no Socket.IO, no SSE endpoint anywhere
 * in it. Adding one just for this would be a much larger, riskier change
 * than the feature itself -- a new persistent-connection layer, its own
 * auth story, its own failure modes -- for a feature that a 30-second poll
 * genuinely serves well: nobody needs their booking-confirmed email to
 * arrive with sub-second latency in the bell too. So this polls
 * GET /api/notifications/unread-count every 30 seconds while the tab is
 * open, which is the "safe polling" the brief allows for explicitly when
 * real-time infrastructure is not already there.
 */
const POLL_INTERVAL_MS = 30000;

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { items, unreadCount, isLoading, error } = useSelector((s) => s.notifications);
  const [isOpen, setIsOpen] = useState(false);

  // Unread count poll -- runs whether or not the dropdown is open, so the
  // badge itself stays live.
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const timer = setInterval(() => dispatch(fetchUnreadCount()), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [dispatch]);

  // The full list only loads when the dropdown actually opens -- no point
  // fetching notification bodies nobody is looking at yet.
  useEffect(() => {
    if (isOpen) dispatch(fetchNotifications());
  }, [isOpen, dispatch]);

  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = (notification) => {
    if (!notification.isRead) dispatch(markNotificationRead(notification.id));
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="bb-notif" ref={containerRef}>
      <button
        type="button"
        className="bb-notif-bell"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
      >
        <Bell size={20} strokeWidth={1.75} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="bb-notif-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bb-notif-panel" role="menu">
          <div className="bb-notif-panel-head">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="bb-notif-markall"
                onClick={() => dispatch(markAllNotificationsRead())}
              >
                <CheckCheck size={14} strokeWidth={2} aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>

          {isLoading && (
            <div className="bb-notif-state" role="status">
              <Loader2 size={18} className="bb-spin" aria-hidden="true" />
              <span>Loading notifications...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="bb-notif-state bb-notif-state-error" role="alert">
              <AlertTriangle size={18} strokeWidth={2} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="bb-notif-state">
              <span>No notifications yet.</span>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (
            <ul className="bb-notif-list">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={"bb-notif-item" + (n.isRead ? "" : " is-unread")}
                >
                  <button
                    type="button"
                    className="bb-notif-item-main"
                    onClick={() => handleOpen(n)}
                  >
                    <span className="bb-notif-item-title">{n.title}</span>
                    <span className="bb-notif-item-message">{n.message}</span>
                    <span className="bb-notif-item-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </button>

                  <div className="bb-notif-item-actions">
                    {!n.isRead && (
                      <button
                        type="button"
                        className="bb-notif-icon-btn"
                        aria-label="Mark as read"
                        onClick={() => dispatch(markNotificationRead(n.id))}
                      >
                        <Check size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="bb-notif-icon-btn"
                      aria-label="Delete notification"
                      onClick={() => dispatch(deleteNotification(n.id))}
                    >
                      <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
