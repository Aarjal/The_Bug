import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckSquare, Trash2, Compass, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { formatRelativeTime } from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
import "../styles/Notifications.css";

function NotificationsHeader({ hasUnread, onMarkAllAsRead }) {
  return (
    <div className="notifications-header">
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
          Notifications
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Stay updated on new potential matches for your lost or found items.
        </p>
      </div>
      {hasUnread && (
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="btn btn-outline"
          style={{ fontSize: "0.85rem", height: "42px" }}
        >
          <CheckSquare size={16} aria-hidden="true" />
          <span>Mark All as Read</span>
        </button>
      )}
    </div>
  );
}

function NotificationCard({ notification, onClick, onDelete }) {
  const hasRelatedItem = Boolean(notification.relatedItemId || notification.itemId);

  return (
    <div
      onClick={() => onClick(notification)}
      className={`notification-card ${!notification.read ? "unread" : ""}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(notification);
      }}
    >
      <div className="notification-icon-wrapper">
        <Bell size={20} aria-hidden="true" />
      </div>

      <div className="notification-content">
        <span className="notification-text">{notification.message}</span>
        {hasRelatedItem && (
          <span className="notification-item-link">
            View item details <ArrowRight size={12} style={{ display: "inline", marginLeft: "2px" }} />
          </span>
        )}
        <span className="notification-time">{formatRelativeTime(notification.createdAt)}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", alignSelf: "stretch" }}>
        {!notification.read && <div className="unread-indicator-dot" />}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          className="notification-delete-btn"
          title="Delete notification"
          aria-label="Delete notification"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function NotificationsSkeletonList() {
  return (
    <div className="notifications-list">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="skeleton-card" style={{ height: "80px", padding: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", gap: "1rem", width: "100%", height: "100%", alignItems: "center" }}>
            <div className="skeleton-avatar" style={{ width: "40px", height: "40px", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
              <div className="skeleton-line" style={{ width: "80%" }} />
              <div className="skeleton-line" style={{ width: "30%" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsEmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Compass size={32} aria-hidden="true" />
      </div>
      <h3>You&apos;re all caught up!</h3>
      <p>You have no notifications at the moment. We will notify you when a match is found.</p>
    </div>
  );
}

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

  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markAsRead(item._id);
    }

    const linkedItemId =
      item.relatedItemId?._id ||
      item.relatedItemId ||
      item.itemId?._id ||
      item.itemId;

    if (linkedItemId) {
      navigate(`/item/${linkedItemId}`);
    }
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      deleteNotification(pendingDeleteId);
    }
    setPendingDeleteId(null);
  };

  const hasUnread = notifications.some((item) => !item.read);

  return (
    <div className="container main-content">
      <NotificationsHeader hasUnread={hasUnread} onMarkAllAsRead={markAllAsRead} />

      {loading ? (
        <NotificationsSkeletonList />
      ) : error ? (
        <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>Failed to load notifications</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
          <button
            type="button"
            onClick={fetchNotifications}
            className="btn btn-primary"
            style={{ display: "inline-flex", margin: "0 auto", gap: "0.5rem" }}
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onClick={handleNotificationClick}
              onDelete={setPendingDeleteId}
            />
          ))}
        </div>
      ) : (
        <NotificationsEmptyState />
      )}

      <ConfirmationModal
        isOpen={Boolean(pendingDeleteId)}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
