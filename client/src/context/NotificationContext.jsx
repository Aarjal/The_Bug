import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  getNotifications as fetchNotificationsAPI,
  getUnreadCount as fetchUnreadCountAPI,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationAPI,
  getUnreadClaimsCount as fetchUnreadClaimsCountAPI,
} from "../api/services";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadClaimsCount, setUnreadClaimsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const [notifRes, claimsRes] = await Promise.all([
        fetchUnreadCountAPI(),
        fetchUnreadClaimsCountAPI(),
      ]);
      setUnreadCount(notifRes.data.count);
      setUnreadClaimsCount(claimsRes.data.count);
    } catch (err) {
      console.error("Failed to load unread counts:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await fetchNotificationsAPI();
      setNotifications(data);
      // Derive unread count from results to keep it synced
      const unreads = data.filter((n) => !n.read).length;
      setUnreadCount(unreads);
      fetchUnreadCount();
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Poll for new notifications and unread claims every 30 seconds if user is logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setUnreadClaimsCount(0);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteNotificationAPI(id);
      
      // Filter out of local state
      setNotifications((prev) => {
        const item = prev.find((n) => n._id === id);
        if (item && !item.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadClaimsCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
