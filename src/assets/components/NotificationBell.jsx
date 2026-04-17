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

import React, { useState, useEffect, useRef } from "react";
import { useNotifications } from "../../context/NotificationContext";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, wsConnected, fetchNotifications, fetchUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debug: Log when props change
  useEffect(() => {
    console.log("NotificationBell - Notifications updated:", notifications);
    console.log("NotificationBell - Unread count from context:", unreadCount);
    console.log("NotificationBell - WebSocket connected:", wsConnected);
  }, [notifications, unreadCount, wsConnected]);

  // Fetch initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Loading initial notification data...");
      await fetchNotifications();
      await fetchUnreadCount();
    };
    loadInitialData();
  }, [fetchNotifications, fetchUnreadCount]);

  // Refresh data periodically (every 15 seconds) as fallback - increased frequency
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Polling for notification updates...");
      await fetchNotifications();
      await fetchUnreadCount();
    }, 15000); // Changed from 30s to 15s for faster updates
    
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  // Also refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing notifications...");
        fetchNotifications();
        fetchUnreadCount();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchNotifications, fetchUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId) => {
    console.log("Marking notification as read:", notificationId);
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    console.log("Marking all notifications as read");
    await markAllAsRead();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with connection indicator */}
      <button
        onClick={() => {
          console.log("Toggling notification dropdown");
          setIsOpen(!isOpen);
          // Refresh when opening dropdown
          fetchNotifications();
          fetchUnreadCount();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
      >
        {/* Connection status dot */}
        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        
        {/* Bell Icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {!wsConnected && (
              <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                ⚠️ Reconnecting to notification service...
              </div>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                    !notification.read_at ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.read_at ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
                    </div>
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;