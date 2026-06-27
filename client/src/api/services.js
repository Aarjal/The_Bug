import API from "./axios";

// --- Auth ---
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// --- Items ---
export const getFeed = (params) => API.get("/items", { params });
export const getItem = (id) => API.get(`/items/${id}`);
export const getMyItems = () => API.get("/items/my-posts");
export const createItem = (data) => API.post("/items", data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const resolveItem = (id) => API.patch(`/items/${id}/resolve`);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const getItemMatches = (id) => API.get(`/items/${id}/matches`);

export const getNotifications = () => API.get("/notifications");
export const getUnreadCount = () => API.get("/notifications/unread-count");
export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  API.patch("/notifications/read-all");
export const deleteNotification = (id) =>
  API.delete(`/notifications/${id}`);

// --- Admin ---
export const getAdminDashboard = () => API.get("/admin/dashboard");

// --- Recovery Requests ---
export const createRecoveryRequest = (data) => API.post("/recovery-requests", data);
export const getSentRecoveryRequests = () => API.get("/recovery-requests/sent");
export const getReceivedRecoveryRequests = () => API.get("/recovery-requests/received");
export const acceptRecoveryRequest = (id) => API.patch(`/recovery-requests/${id}/accept`);
export const rejectRecoveryRequest = (id) => API.patch(`/recovery-requests/${id}/reject`);
export const getUnreadClaimsCount = () => API.get("/recovery-requests/unread-count");
export const markClaimsRead = (role) => API.patch("/recovery-requests/mark-read", { role });
