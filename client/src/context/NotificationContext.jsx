import { createContext, useContext, useState, useEffect, useCallback } from "react";
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

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const [notificationsRes, claimsRes] = await Promise.all([
        fetchUnreadCountAPI(),
        fetchUnreadClaimsCountAPI(),
      ]);
      setUnreadCount(notificationsRes.data.count);
      setUnreadClaimsCount(claimsRes.data.count);
    } catch (err) {
      console.error("Failed to synchronize notification badges:", err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const { data: fetchedNotifications } = await fetchNotificationsAPI();
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((item) => !item.read).length);

      const claimsRes = await fetchUnreadClaimsCountAPI();
      setUnreadClaimsCount(claimsRes.data.count);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function initializeNotifications() {
      try {
        const { data: fetchedNotifications } = await fetchNotificationsAPI();
        if (isMounted) {
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter((item) => !item.read).length);
        }
        const claimsRes = await fetchUnreadClaimsCountAPI();
        if (isMounted) {
          setUnreadClaimsCount(claimsRes.data.count);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load notifications.");
        }
      }
    }

    initializeNotifications();
    const pollInterval = setInterval(fetchUnreadCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [user, fetchUnreadCount]);

  const markAsRead = async (targetId) => {
    try {
      await markNotificationRead(targetId);
      setNotifications((prevItems) =>
        prevItems.map((item) => (item._id === targetId ? { ...item, read: true } : item))
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prevItems) =>
        prevItems.map((item) => ({ ...item, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (targetId) => {
    try {
      await deleteNotificationAPI(targetId);
      setNotifications((prevItems) => {
        const itemToDelete = prevItems.find((item) => item._id === targetId);
        if (itemToDelete && !itemToDelete.read) {
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
        }
        return prevItems.filter((item) => item._id !== targetId);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: user ? notifications : [],
        unreadCount: user ? unreadCount : 0,
        unreadClaimsCount: user ? unreadClaimsCount : 0,
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
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
