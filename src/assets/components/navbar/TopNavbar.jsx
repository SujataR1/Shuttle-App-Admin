// // src/components/navbar/TopNavbarUltra.jsx
// import { useState, useRef, useEffect } from "react";
// import { BellIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

// const TopNavbarUltra = ({ user }) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const notifRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
//       if (notifRef.current && !notifRef.current.contains(event.target)) setNotificationsOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     console.log("Logout clicked");
//   };

//   return (
//     <nav className="flex justify-between items-center px-6 py-3 bg-white/70 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
//       {/* Left: Hamburger */}
//       <button className="md:hidden text-gray-600 text-2xl hover:text-gray-900 transition-colors">
//         ☰
//       </button>

//       {/* Center: Title */}
//       <div className="text-xl font-semibold text-gray-800">
//         Admin Dashboard
//         <span className="block text-sm text-gray-500 font-normal">Welcome back, {user?.name || "Admin"}!</span>
//       </div>

//       {/* Right: Icons + User */}
//       <div className="flex items-center gap-4">
//         {/* Notifications */}
//         <div className="relative" ref={notifRef}>
//           <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative">
//             <BellIcon className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
//             <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
//           </button>
//           {notificationsOpen && (
//             <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-scale origin-top-right">
//               <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
//                 Notifications
//               </div>
//               <div className="flex flex-col max-h-64 overflow-y-auto">
//                 <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2">
//                   <EnvelopeIcon className="w-5 h-5 text-blue-500" />
//                   <span className="text-gray-600 text-sm">New message from John Doe</span>
//                 </div>
//                 <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2">
//                   <EnvelopeIcon className="w-5 h-5 text-green-500" />
//                   <span className="text-gray-600 text-sm">Trip completed by driver #234</span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* User Avatar */}
//         <div className="relative" ref={dropdownRef}>
//           <button
//             className="flex items-center gap-2 focus:outline-none"
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//           >
//             <img
//               src={user?.avatar || "https://via.placeholder.com/40"}
//               alt="User Avatar"
//               className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all shadow-sm"
//             />
//           </button>

//           {dropdownOpen && (
//             <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-scale origin-top-right">
//               <div className="p-4 flex items-center gap-3 border-b border-gray-100">
//                 <img
//                   src={user?.avatar || "https://via.placeholder.com/50"}
//                   alt="User"
//                   className="w-12 h-12 rounded-full object-cover shadow"
//                 />
//                 <div>
//                   <p className="text-gray-800 font-semibold">{user?.name || "John Doe"}</p>
//                   <p className="text-gray-500 text-sm">{user?.email || "user@example.com"}</p>
//                 </div>
//               </div>
//               <div className="flex flex-col">
//                 <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700">
//                   <Cog6ToothIcon className="w-5 h-5" /> Settings
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
//                 >
//                   <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default TopNavbarUltra;
import React, { useState } from "react";
import axios from "axios";
import NotificationBell from "../NotificationBell";

const API_BASE = "https://be.shuttleapp.transev.site";

const TopNavbar = ({ title }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.full_name || user?.name || "Admin";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    
    try {
      setIsLoggingOut(true);
      
      // Call logout API
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Clear local storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, still clear local storage and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Logout"
            >
              {isLoggingOut ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;