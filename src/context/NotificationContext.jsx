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
  const pollingIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Function to refresh token
  const refreshToken = useCallback(() => {
    const newToken = localStorage.getItem("access_token");
    if (newToken !== token) {
      console.log("Token changed, updating...");
      setToken(newToken);
      return true;
    }
    return false;
  }, [token]);

  // Listen for token changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        console.log("Token changed in storage");
        const changed = refreshToken();
        if (changed) {
          // Reconnect with new token
          if (wsRef.current) {
            wsRef.current.close();
          }
          setTimeout(() => {
            if (localStorage.getItem("access_token")) {
              connectWebSocket();
              fetchNotifications();
              fetchUnreadCount();
            }
          }, 100);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshToken]);

  // Fetch notifications from API - PRESERVE READ STATUS
  const fetchNotifications = useCallback(async () => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) {
      console.log("No token, skipping fetch");
      return [];
    }

    try {
      console.log("Fetching notifications from API...");
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/notifications?limit=50&offset=0&unread_only=false",
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      const items = response.data.items || [];
      console.log(`Fetched ${items.length} notifications from API`);
      
      // Update unread count based on API data
      const unreadItems = items.filter(item => !item.read_at).length;
      
      // Only update notifications if we're not currently loading or if it's initial load
      setNotifications(prevNotifications => {
        // Check if this is the first load
        if (prevNotifications.length === 0 && items.length > 0) {
          console.log("Initial load, setting notifications");
          return items;
        }
        
        // Merge existing notifications with new ones to preserve client-side read status
        // But don't lose any notifications
        const existingMap = new Map(prevNotifications.map(n => [n.id, n]));
        
        items.forEach(item => {
          if (!existingMap.has(item.id)) {
            // New notification
            existingMap.set(item.id, item);
          } else {
            // Existing notification - only update if server has newer data
            const existing = existingMap.get(item.id);
            const existingDate = new Date(existing.updated_at || existing.created_at);
            const newDate = new Date(item.updated_at || item.created_at);
            
            if (newDate > existingDate) {
              existingMap.set(item.id, item);
            }
          }
        });
        
        const mergedNotifications = Array.from(existingMap.values());
        console.log(`Merged notifications: ${mergedNotifications.length} total`);
        
        // Sort by created_at descending (newest first)
        mergedNotifications.sort((a, b) => {
          const dateA = new Date(a.created_at || a.timestamp);
          const dateB = new Date(b.created_at || b.timestamp);
          return dateB - dateA;
        });
        
        return mergedNotifications;
      });
      
      setUnreadCount(unreadItems);
      console.log(`Unread count from API: ${unreadItems}`);

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
      const count = response.data.unread_count || 0;
      console.log(`Unread count from API: ${count}`);
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }, []);

  // Mark notification as read via HTTP - THIS SHOULD BE THE ONLY WAY TO MARK AS READ
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

      // Update local state - mark as read but KEEP the notification in the list
      setNotifications(prev => prev.map(notif =>
        notif.id === notificationId 
          ? { ...notif, read_at: new Date().toISOString(), is_read: true } 
          : notif
      ));
      
      // Decrease unread count
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log(`Unread count decreased to: ${newCount}`);
        return newCount;
      });

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

      // Update local state - mark all as read but KEEP all notifications
      setNotifications(prev => prev.map(notif => ({ 
        ...notif, 
        read_at: new Date().toISOString(),
        is_read: true 
      })));
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
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "pong" }));
        }
        return;
      }

      // Handle authentication success
      if (payload?.message === "WebSocket authenticated successfully.") {
        console.log("WebSocket authenticated successfully");
        setWsConnected(true);
        return;
      }

      // Handle live notification - ONLY ADD, NEVER REMOVE
      if (payload?.id && (payload?.title || payload?.message)) {
        console.log("🔔 NEW NOTIFICATION RECEIVED:", payload);

        // Add to notifications list (prepend) - preserve existing notifications
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === payload.id);
          if (exists) {
            console.log("Notification already exists, updating instead of adding");
            return prev.map(n => n.id === payload.id ? { ...n, ...payload } : n);
          }
          
          console.log("Adding new notification to list");
          const newNotification = {
            ...payload,
            read_at: payload.read_at || null,
            is_read: payload.read_at ? true : false,
            created_at: payload.created_at || payload.timestamp || new Date().toISOString()
          };
          
          return [newNotification, ...prev];
        });

        // Update unread count only if notification is unread
        if (!payload.read_at) {
          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log(`Unread count increased: ${prev} -> ${newCount}`);
            return newCount;
          });
        }

        setLastNotification(payload);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    const currentToken = localStorage.getItem("access_token");
    if (!currentToken) {
      console.error("No token available for WebSocket connection");
      return;
    }

    if (wsRef.current) {
      console.log("Closing existing WebSocket connection");
      wsRef.current.close();
    }

    const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(currentToken)}`;
    console.log("Connecting to WebSocket...");
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

  // Start polling for notifications (gentle polling)
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    console.log("Starting gentle polling for unread count...");
    // Only poll for unread count, not full notifications
    pollingIntervalRef.current = setInterval(() => {
      const currentToken = localStorage.getItem("access_token");
      if (currentToken && wsRef.current?.readyState !== WebSocket.OPEN) {
        // Only poll if WebSocket is not connected
        console.log("WebSocket not connected, polling for unread count...");
        fetchUnreadCount();
      }
    }, 60000); // Poll every 60 seconds, less frequent
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

  // Initialize - only once
  useEffect(() => {
    if (token && !isInitializedRef.current) {
      console.log("Initializing NotificationProvider...");
      isInitializedRef.current = true;
      fetchNotifications();
      fetchUnreadCount();
      connectWebSocket();
      startPolling();
    }

    return () => {
      console.log("Cleaning up NotificationProvider...");
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [token, fetchNotifications, fetchUnreadCount, connectWebSocket, startPolling]);

  // Refresh notifications on route change but DON'T clear state
  useEffect(() => {
    const handleRouteChange = () => {
      console.log("Route changed, refreshing unread count only...");
      if (localStorage.getItem("access_token")) {
        // Only refresh unread count, not full notifications
        fetchUnreadCount();
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('routeChange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, [fetchUnreadCount]);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'last_notification') {
        console.log("Cross-tab notification detected");
        fetchUnreadCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUnreadCount]);

  // Listen for rating submitted event
  useEffect(() => {
    const handleRatingSubmitted = () => {
      console.log("Rating submitted event detected, refreshing...");
      fetchUnreadCount();
    };

    window.addEventListener('ratingSubmitted', handleRatingSubmitted);
    return () => window.removeEventListener('ratingSubmitted', handleRatingSubmitted);
  }, [fetchUnreadCount]);

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