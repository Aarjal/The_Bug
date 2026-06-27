import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckSquare, Trash2, Compass, ArrowRight } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { formatRelativeTime } from "../utils/helpers";
import "../styles/Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCardClick = (notification) => {
    // 1. Mark as read on the backend/state if unread
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // 2. Navigate to matched item details if available, otherwise User's item
    const targetItemId = notification.relatedItemId?._id || notification.relatedItemId || notification.itemId?._id || notification.itemId;
    if (targetItemId) {
      navigate(`/item/${targetItemId}`);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // prevent card click navigation
    if (window.confirm("Delete this notification?")) {
      deleteNotification(id);
    }
  };

  return (
    <div className="container main-content">
      {/* Header controls */}
      <div className="notifications-header">
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
            Notifications
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Stay updated on new potential matches for your lost or found items.
          </p>
        </div>
        {notifications.length > 0 && notifications.some((n) => !n.read) && (
          <button onClick={markAllAsRead} className="btn btn-outline" style={{ fontSize: "0.85rem", height: "42px" }}>
            <CheckSquare size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Content wrapper */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "30vh" }}>
          <div className="spinner spinner-dark" style={{ width: "2rem", height: "2rem" }} />
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((n) => {
            return (
              <div
                key={n._id}
                onClick={() => handleCardClick(n)}
                className={`notification-card ${!n.read ? "unread" : ""}`}
              >
                {/* Left side: Icon */}
                <div className="notification-icon-wrapper">
                  <Bell size={20} />
                </div>

                {/* Center: Details */}
                <div className="notification-content">
                  <span className="notification-text">{n.message}</span>
                  {n.relatedItemId && (
                    <span className="notification-item-link">
                      View item details <ArrowRight size={12} style={{ display: "inline", marginLeft: "2px" }} />
                    </span>
                  )}
                  <span className="notification-time">{formatRelativeTime(n.createdAt)}</span>
                </div>

                {/* Right Side: Unread dot & Delete */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", alignSelf: "stretch" }}>
                  {!n.read && <div className="unread-indicator-dot" />}
                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    className="notification-delete-btn"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Compass size={32} />
          </div>
          <h3>All caught up!</h3>
          <p>You have no notifications at the moment. We will notify you when a match is found.</p>
        </div>
      )}
    </div>
  );
}
