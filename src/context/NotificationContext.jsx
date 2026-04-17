import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [token, setToken] = useState(localStorage.getItem("access_token"));

  // Function to refresh token
  const refreshToken = useCallback(() => {
    const newToken = localStorage.getItem("access_token");
    if (newToken !== token) {
      setToken(newToken);
    }
  }, [token]);

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = () => {
      refreshToken();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshToken]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) return;

    try {
      console.log("Fetching notifications from API...");
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/notifications?limit=50&offset=0&unread_only=false",
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      const items = response.data.items || [];
      console.log(`Fetched ${items.length} notifications`);
      setNotifications(items);

      // Also update unread count
      const unreadItems = items.filter(item => !item.read_at).length;
      setUnreadCount(unreadItems);

      return items;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }, []);

  // Fetch unread count separately
  const fetchUnreadCount = useCallback(async () => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) return 0;

    try {
      console.log("Fetching unread count...");
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/notifications/unread-count",
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      const count = response.data.unread_count;
      console.log(`Unread count: ${count}`);
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }, []);

  // Mark notification as read via HTTP
  const markAsRead = useCallback(async (notificationId) => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) return false;

    try {
      console.log(`Marking notification ${notificationId} as read...`);
      await axios.post(
        `https://be.shuttleapp.transev.site/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      // Update local state
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

      console.log("Notification marked as read successfully");
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) return false;

    try {
      console.log("Marking all notifications as read...");
      await axios.post(
        "https://be.shuttleapp.transev.site/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read_at: new Date().toISOString() })));
      setUnreadCount(0);

      console.log("All notifications marked as read");
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.data);
      console.log("WebSocket message received:", payload);

      // Handle ping
      if (payload?.type === "ping") {
        console.log("Ping received, sending pong...");
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "pong" }));
        }
        return;
      }

      // Handle authentication success
      if (payload?.message === "WebSocket authenticated successfully.") {
        console.log("WebSocket authenticated successfully for user:", payload.user_id);
        setWsConnected(true);
        // Fetch initial notifications after authentication
        fetchNotifications();
        fetchUnreadCount();
        return;
      }

      // Handle live notification
      if (payload?.id && payload?.title && payload?.message) {
        console.log("🔔 LIVE NOTIFICATION RECEIVED:", payload);

        // Add to notifications list (prepend)
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === payload.id);
          if (!exists) {
            console.log("Adding new notification to list");
            return [payload, ...prev];
          }
          return prev;
        });

        // Update unread count
        setUnreadCount(prev => {
          const newCount = prev + 1;
          console.log(`Unread count updated: ${prev} -> ${newCount}`);
          return newCount;
        });

        setLastNotification(payload);

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('newNotification', { detail: payload }));

        // Also trigger a storage event to notify other tabs
        localStorage.setItem('last_notification', JSON.stringify({
          id: payload.id,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) {
      console.error("No token available for WebSocket connection");
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      console.log("Closing existing WebSocket connection");
      wsRef.current.close();
    }

    const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(currentToken)}`;
    console.log("Connecting to WebSocket:", wsUrl);
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    websocket.onmessage = handleWebSocketMessage;

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    websocket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setWsConnected(false);

      // Reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        connectWebSocket();
      }, 5000);
    };

    wsRef.current = websocket;
  }, [handleWebSocketMessage]);

  // Initial setup
  useEffect(() => {
    if (token) {
      console.log("Initializing NotificationProvider...");
      fetchNotifications();
      fetchUnreadCount();
      connectWebSocket();
    } else {
      console.log("No token found, skipping notification initialization");
    }

    return () => {
      console.log("Cleaning up NotificationProvider...");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [token, fetchNotifications, fetchUnreadCount, connectWebSocket]);

  // Listen for storage events (for cross-tab notifications)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'last_notification') {
        console.log("Cross-tab notification detected");
        fetchNotifications();
        fetchUnreadCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchNotifications, fetchUnreadCount]);

  // Add this useEffect in NotificationContext.jsx
  useEffect(() => {
    const handleRatingSubmitted = () => {
      console.log("Rating submitted event detected, refreshing notifications...");
      fetchNotifications();
      fetchUnreadCount();
    };

    window.addEventListener('ratingSubmitted', handleRatingSubmitted);

    return () => {
      window.removeEventListener('ratingSubmitted', handleRatingSubmitted);
    };
  }, [fetchNotifications, fetchUnreadCount]);


  const value = {
    notifications,
    unreadCount,
    wsConnected,
    lastNotification,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};