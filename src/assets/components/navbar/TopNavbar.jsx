import React, { useState, useEffect } from "react";
import axios from "axios";
import NotificationBell from "../NotificationBell";

const API_BASE = "https://be.shuttleapp.transev.site";

const TopNavbar = ({ onMenuClick, sidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.full_name || user?.name || "Admin";

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");

    try {
      setIsLoggingOut(true);
      await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`
      fixed top-0 right-0 z-40 transition-all duration-300
      ${scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' 
        : 'bg-transparent'
      }
    `}
    style={{ left: sidebarOpen ? '256px' : '80px' }}
    >
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-end">
          {/* RIGHT - Only Notification Bell */}
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;



// import React, { useState, useEffect } from "react";
// import { Bell } from "lucide-react";
// import io from "socket.io-client";

// const SOCKET_URL = "https://be.shuttleapp.transev.site"; // your backend

// const TopNavbar = ({ sidebarOpen }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [open, setOpen] = useState(false);

//   // 🔌 SOCKET CONNECTION (REAL-TIME)
//   useEffect(() => {
//     const socket = io(SOCKET_URL, {
//       transports: ["websocket"],
//     });

//     socket.on("connect", () => {
//       console.log("✅ Connected to socket");
//     });

//     // 🔔 Listen for notifications
//     socket.on("new_notification", (data) => {
//       setNotifications((prev) => [data, ...prev]);
//     });

//     return () => socket.disconnect();
//   }, []);

//   // 🔢 Count
//   const unreadCount = notifications.filter((n) => !n.read).length;

//   // ✅ Mark as read
//   const handleRead = (index) => {
//     const updated = [...notifications];
//     updated[index].read = true;
//     setNotifications(updated);
//   };

//   // 📱 Swipe to close (mobile)
//   let touchStartX = 0;

//   const handleTouchStart = (e) => {
//     touchStartX = e.changedTouches[0].screenX;
//   };

//   const handleTouchEnd = (e) => {
//     const diff = e.changedTouches[0].screenX - touchStartX;
//     if (diff > 80) {
//       setOpen(false); // swipe right to close
//     }
//   };

//   return (
//     <div
//       className="fixed top-0 right-0 z-50"
//       style={{ left: sidebarOpen ? "256px" : "80px" }}
//     >
//       <div className="w-full pr-4 pt-1 flex justify-end">

//         {/* 🔔 Notification Bell */}
//         <div className="relative mr-2">
//           <div
//             onClick={() => setOpen(!open)}
//             className="relative cursor-pointer"
//           >
//             <Bell className="w-4 h-4 text-gray-600 hover:scale-110 transition" />

//             {/* 🔴 Tiny Badge */}
//             {unreadCount > 0 && (
//               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-[4px] rounded-full animate-pulse">
//                 {unreadCount}
//               </span>
//             )}
//           </div>

//           {/* 📦 Notification Popup */}
//           {open && (
//             <div
//               className="
//                 fixed sm:absolute right-0 mt-2 
//                 w-full sm:w-64 
//                 h-[60vh] sm:h-auto 
//                 bg-white shadow-xl rounded-t-xl sm:rounded-lg 
//                 border text-xs overflow-y-auto
//               "
//               onTouchStart={handleTouchStart}
//               onTouchEnd={handleTouchEnd}
//             >
//               {/* Header */}
//               <div className="p-3 font-semibold border-b flex justify-between">
//                 Notifications
//                 <button
//                   onClick={() => setOpen(false)}
//                   className="text-gray-400"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* List */}
//               {notifications.length > 0 ? (
//                 notifications.map((note, index) => (
//                   <div
//                     key={index}
//                     onClick={() => handleRead(index)}
//                     className={`
//                       p-3 cursor-pointer border-b
//                       ${note.read ? "bg-white" : "bg-gray-100"}
//                       hover:bg-gray-200
//                     `}
//                   >
//                     {note.message || "New Notification"}
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-3 text-gray-400 text-center">
//                   No notifications
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default TopNavbar;