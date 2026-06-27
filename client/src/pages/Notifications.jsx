import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckSquare, Trash2, Compass, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { formatRelativeTime } from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
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

  // Confirmation Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCardClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    const targetItemId =
      notification.relatedItemId?._id ||
      notification.relatedItemId ||
      notification.itemId?._id ||
      notification.itemId;
    if (targetItemId) {
      navigate(`/item/${targetItemId}`);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (confirmId) {
      deleteNotification(confirmId);
    }
    setIsConfirmOpen(false);
    setConfirmId(null);
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
        // Modern loading skeleton items
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
      ) : error ? (
        <div className="error-card card" style={{ maxWidth: "480px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
          <AlertCircle size={40} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>Failed to load notifications</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
          <button
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
                    onClick={(e) => handleDeleteClick(e, n._id)}
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
          <h3>You're all caught up!</h3>
          <p>You have no notifications at the moment. We will notify you when a match is found.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
