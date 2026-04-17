// services/notificationService.js
const BASE_URL = "https://be.shuttleapp.transev.site";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Fetch all notifications
export const fetchNotifications = async (limit = 50, offset = 0, unreadOnly = false) => {
  const response = await fetch(
    `${BASE_URL}/notifications?limit=${limit}&offset=${offset}&unread_only=${unreadOnly}`,
    {
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
};

// Get unread count
export const fetchUnreadCount = async () => {
  const response = await fetch(`${BASE_URL}/notifications/unread-count`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch unread count");
  return response.json();
};

// Mark single notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to mark notification as read");
  return response.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to mark all as read");
  return response.json();
};