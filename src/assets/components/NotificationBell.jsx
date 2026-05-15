// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { BellIcon } from "@heroicons/react/24/outline";
// import {
//   fetchNotifications,
//   fetchUnreadCount,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
// } from "./services/notificationService";

// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionError, setConnectionError] = useState(null);
//   const dropdownRef = useRef(null);
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const reconnectAttemptsRef = useRef(0);

//   const getCleanToken = () => {
//     const token = localStorage.getItem("access_token");
//     if (!token) return null;
//     // Remove "Bearer " prefix if it exists
//     return token.replace(/^Bearer\s+/i, '');
//   };
  
//   // Build WebSocket URL with fresh token each time
//   const getWsUrl = () => {
//     const token = getCleanToken();
//     if (!token) {
//       console.error("No token available");
//       return null;
//     }
//     // Make sure token is properly encoded
//     const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(token)}`;
//     console.log("WebSocket URL (token hidden):", wsUrl.replace(token, "REDACTED"));
//     return wsUrl;
//   };

//   // Fetch notifications from API (HTTP fallback)
//   const loadNotifications = useCallback(async () => {
//     try {
//       const data = await fetchNotifications(50, 0, false);
//       console.log("📋 Loaded notifications from API:", data.items?.length || 0);
//       setNotifications(data.items || []);
//     } catch (error) {
//       console.error("Error loading notifications:", error);
//     }
//   }, []);

//   // Fetch unread count
//   const loadUnreadCount = useCallback(async () => {
//     try {
//       const data = await fetchUnreadCount();
//       console.log("📊 Unread count from API:", data.unread_count);
//       setUnreadCount(data.unread_count || 0);
//     } catch (error) {
//       console.error("Error loading unread count:", error);
//     }
//   }, []);

//   // Connect WebSocket
//   const connectWebSocket = useCallback(() => {
//     const token = getCleanToken();
//     const wsUrl = getWsUrl();
    
//     if (!token || !wsUrl) {
//       console.warn("No token available for WebSocket connection");
//       setConnectionError("No authentication token available");
//       return;
//     }

//     // Close existing connection if any
//     if (wsRef.current) {
//       try {
//         wsRef.current.close(1000, "Reconnecting");
//       } catch (e) {
//         console.error("Error closing existing WebSocket:", e);
//       }
//       wsRef.current = null;
//     }

//     try {
//       console.log("🔌 Attempting WebSocket connection...");
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       // Set a connection timeout
//       const connectionTimeout = setTimeout(() => {
//         if (ws.readyState !== WebSocket.OPEN) {
//           console.error("WebSocket connection timeout - still in state:", ws.readyState);
//           ws.close();
//           setIsConnected(false);
//           setConnectionError("Connection timeout");
//         }
//       }, 10000);

//       ws.onopen = () => {
//         clearTimeout(connectionTimeout);
//         console.log("✅ WebSocket connection opened (waiting for authentication)");
//         setConnectionError(null);
//       };

//       ws.onmessage = (event) => {
//         try {
//           const payload = JSON.parse(event.data);
//           console.log("📨 Received WebSocket message:", payload);

//           // Handle ping from server
//           if (payload?.type === "ping") {
//             console.log("🏓 Received ping, sending pong...");
//             if (ws.readyState === WebSocket.OPEN) {
//               ws.send(JSON.stringify({ type: "pong" }));
//             }
//             return;
//           }

//           // Handle authentication success
//           if (payload?.message === "WebSocket authenticated successfully.") {
//             console.log("✅ WebSocket authenticated successfully! User ID:", payload.user_id);
//             setIsConnected(true);
//             setConnectionError(null);
//             reconnectAttemptsRef.current = 0;
//             return;
//           }

//           // Handle authentication error
//           if (payload?.error || payload?.detail) {
//             console.error("Server authentication error:", payload);
//             setConnectionError(payload.error || payload.detail);
//             setIsConnected(false);
//             return;
//           }

//           // Handle live notification
//           if (payload?.id && payload?.title) {
//             console.log("🔔 New notification:", payload.title);

//             setNotifications((prev) => {
//               const exists = prev.some(n => n.id === payload.id);
//               if (exists) return prev;
//               return [payload, ...prev];
//             });

//             setUnreadCount((prev) => prev + 1);

//             if (Notification.permission === "granted") {
//               new Notification(payload.title, {
//                 body: payload.message,
//                 icon: "/favicon.ico",
//               });
//             }

//             if (payload.data?.refresh && Array.isArray(payload.data.refresh)) {
//               payload.data.refresh.forEach((key) => {
//                 console.log(`🔄 Triggering refresh for: ${key}`);
//                 window.dispatchEvent(new CustomEvent(`refresh_${key}`));
//               });
//             }
//           }
//         } catch (error) {
//           console.error("Error parsing WebSocket message:", error);
//         }
//       };

//       ws.onerror = (event) => {
//         console.error("❌ WebSocket error event:", event);
//         console.error("WebSocket readyState at error:", ws.readyState);
//         console.error("WebSocket URL (check if correct):", wsUrl.replace(token, "REDACTED"));
//         setConnectionError("WebSocket connection failed - check console for details");
//         setIsConnected(false);
//       };

//       ws.onclose = (event) => {
//         clearTimeout(connectionTimeout);
//         console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: "${event.reason || 'No reason'}", Clean: ${event.wasClean}`);
//         console.log("Close codes reference: 1000=normal, 1001=going away, 1006=abnormal, 1011=server error");
        
//         setIsConnected(false);
        
//         // Log specific close codes for debugging
//         if (event.code === 1006) {
//           console.error("Abnormal closure - likely network issue or server rejected connection");
//           setConnectionError("Connection closed abnormally - server may have rejected the token");
//         } else if (event.code === 1011) {
//           console.error("Server error - check backend logs");
//           setConnectionError("Server error occurred");
//         } else if (event.code === 4001 || event.code === 4002) {
//           console.error("Authentication failed - invalid token");
//           setConnectionError("Authentication failed - please log in again");
//         }

//         // Don't reconnect for certain codes
//         if (event.code === 1000 || event.code === 1001 || !getCleanToken()) {
//           console.log("Normal closure or no token, not reconnecting");
//           return;
//         }

//         // Exponential backoff reconnect
//         const baseDelay = 5000;
//         const maxDelay = 30000;
//         const delay = Math.min(baseDelay * Math.pow(1.5, reconnectAttemptsRef.current), maxDelay);
        
//         if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
//         reconnectTimeoutRef.current = setTimeout(() => {
//           console.log(`🔄 Reconnecting WebSocket... (attempt ${reconnectAttemptsRef.current + 1})`);
//           reconnectAttemptsRef.current += 1;
//           connectWebSocket();
//         }, delay);
//       };
//     } catch (error) {
//       console.error("WebSocket creation error:", error);
//       setConnectionError(error.message);
//       setIsConnected(false);
//     }
//   }, []);

//   // Manual reconnect button
//   const handleReconnect = () => {
//     console.log("Manual reconnect requested");
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//     }
//     reconnectAttemptsRef.current = 0;
//     connectWebSocket();
//   };

//   const handleMarkAsRead = async (notificationId) => {
//     try {
//       await markNotificationAsRead(notificationId);
//       console.log(`✅ Marked notification ${notificationId} as read via HTTP`);

//       setNotifications((prev) =>
//         prev.map((notif) =>
//           notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif
//         )
//       );
//       setUnreadCount((prev) => Math.max(0, prev - 1));

//       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         wsRef.current.send(JSON.stringify({
//           type: "mark_read",
//           notification_id: notificationId,
//         }));
//         console.log(`📤 Sent mark_read via WebSocket for: ${notificationId}`);
//       }
//     } catch (error) {
//       console.error("Error marking as read:", error);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await markAllNotificationsAsRead();
//       console.log("✅ Marked all notifications as read");
//       setNotifications((prev) =>
//         prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
//       );
//       setUnreadCount(0);
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//     }
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins} min ago`;
//     if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
//     return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
//   };

//   useEffect(() => {
//     if ("Notification" in window && Notification.permission === "default") {
//       Notification.requestPermission();
//     }
//   }, []);

//   useEffect(() => {
//     const token = getCleanToken();
//     if (token) {
//       loadNotifications();
//       loadUnreadCount();
//       connectWebSocket();
//     } else {
//       console.warn("No token found");
//       setConnectionError("No authentication token");
//     }

//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       if (wsRef.current) {
//         wsRef.current.close(1000, "Component unmounting");
//       }
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//     };
//   }, [loadNotifications, loadUnreadCount, connectWebSocket]);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-full hover:bg-gray-100"
//       >
//         <BellIcon className="w-6 h-6" />
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
//             {unreadCount > 99 ? "99+" : unreadCount}
//           </span>
//         )}
//         <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
//           <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//             <h3 className="font-semibold text-gray-900">
//               Notifications
//               {isConnected && <span className="ml-2 text-xs text-green-500">● Live</span>}
//               {!isConnected && <span className="ml-2 text-xs text-red-500">● Offline</span>}
//             </h3>
//             {unreadCount > 0 && (
//               <button
//                 onClick={handleMarkAllAsRead}
//                 className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
//               >
//                 Mark all as read
//               </button>
//             )}
//           </div>

//           {connectionError && !isConnected && (
//             <div className="px-4 py-2 bg-red-50 border-b border-red-100">
//               <p className="text-xs text-red-600 mb-1">Connection Error: {connectionError}</p>
//               <button
//                 onClick={handleReconnect}
//                 className="text-xs text-red-600 hover:text-red-700 underline"
//               >
//                 Try to reconnect
//               </button>
//             </div>
//           )}

//           <div className="max-h-96 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="text-center py-8">
//                 <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                 <p className="text-gray-500 text-sm">No notifications yet</p>
//                 <p className="text-gray-400 text-xs mt-1">We'll notify you when something arrives</p>
//               </div>
//             ) : (
//               notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read_at ? "bg-blue-50/30" : ""
//                     }`}
//                   onClick={() => handleMarkAsRead(notification.id)}
//                 >
//                   <div className="flex items-start gap-3">
//                     <div
//                       className={`w-2 h-2 rounded-full mt-2 ${!notification.read_at ? "bg-blue-500" : "bg-gray-300"
//                         }`}
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-gray-900">{notification.title}</p>
//                       <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
//                         {notification.message}
//                       </p>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {formatTime(notification.created_at)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { BellIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const API_BASE = "https://be.shuttleapp.transev.site";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const token = localStorage.getItem("access_token");

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      const notificationsList = data.items || data.notifications || data.data || [];
      setNotifications(notificationsList);
      
      const unread = notificationsList.filter(n => n.is_read === false).length;
      setUnreadCount(unread);
      console.log("Fetched notifications, unread count:", unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${API_BASE}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        const newUnreadCount = updated.filter(n => n.is_read === false).length;
        setUnreadCount(newUnreadCount);
        console.log("After mark as read, unread count:", newUnreadCount);
        return updated;
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (markingAsRead) return;
    
    setMarkingAsRead(true);
    try {
      await axios.post(
        `${API_BASE}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, is_read: true }));
        setUnreadCount(0);
        console.log("Marked all as read, unread count: 0");
        return updated;
      });
      
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Connect to WebSocket for real-time notifications
  const connectWebSocket = useCallback(() => {
    if (!token) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(token)}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log("Notification WebSocket connected");
    };
    
    websocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("WebSocket message received:", payload);
        
        // Handle ping/pong
        if (payload?.type === "ping") {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "pong" }));
          }
          return;
        }
        
        // Authentication success
        if (payload?.message === "WebSocket authenticated successfully.") {
          console.log("WebSocket authenticated");
          return;
        }
        
        // Check for notification in different possible formats
        let notificationData = null;
        
        if (payload?.type === "notification" || payload?.notification) {
          notificationData = payload.notification || payload;
        } else if (payload?.id && (payload?.title || payload?.message)) {
          notificationData = payload;
        }
        
        if (notificationData && notificationData.id) {
          const newNotification = {
            id: notificationData.id,
            title: notificationData.title || "New Notification",
            message: notificationData.message || notificationData.content || "",
            content: notificationData.message || notificationData.content,
            created_at: notificationData.created_at || new Date().toISOString(),
            is_read: false
          };
          
          console.log("New notification received:", newNotification);
          
          setNotifications(prev => {
            // Check if notification already exists
            const exists = prev.some(n => n.id === newNotification.id);
            if (exists) {
              console.log("Notification already exists, skipping");
              return prev;
            }
            const updated = [newNotification, ...prev];
            const newUnreadCount = updated.filter(n => n.is_read === false).length;
            setUnreadCount(newUnreadCount);
            console.log("Updated unread count to:", newUnreadCount);
            return updated;
          });
          
          // Show browser notification if permitted
          if (Notification.permission === "granted") {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: "/favicon.ico"
            });
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    websocket.onclose = () => {
      console.log("WebSocket disconnected, reconnecting...");
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 5000);
    };
    
    wsRef.current = websocket;
  }, [token]);

  // Poll for notifications every 10 seconds as fallback
  const startPolling = useCallback(() => {
    const interval = setInterval(() => {
      console.log("Polling for new notifications...");
      fetchNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Initial fetch and WebSocket connection
  useEffect(() => {
    fetchNotifications();
    connectWebSocket();
    const cleanupPolling = startPolling();
    
    return () => {
      cleanupPolling();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [fetchNotifications, connectWebSocket, startPolling]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    // Refresh notifications when opening dropdown
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="relative inline-block">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-1 rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none"
        aria-label="Notifications"
      >
        <BellIcon className="w-4 h-4 text-gray-600" />
        
        {/* Badge - Shows number of unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown Menu */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-1 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-gray-400 mt-0.5">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={markingAsRead}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          
          {/* Notifications List */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800 mx-auto"></div>
                <p className="text-[10px] text-gray-400 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <BellIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No notifications</p>
                <p className="text-[10px] text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!notification.is_read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title || "Notification"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 break-words">
                        {notification.message || notification.content}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-1">
                        {formatTimeAgo(notification.created_at || notification.timestamp)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 text-center">
              <button
                onClick={() => setShowDropdown(false)}
                className="text-[10px] text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;