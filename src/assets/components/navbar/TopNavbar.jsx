
// import React, { useState } from "react";
// import axios from "axios";
// import NotificationBell from "../NotificationBell";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const TopNavbar = ({ title }) => {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const userName = user?.full_name || user?.name || "Admin";
//   const [isLoggingOut, setIsLoggingOut] = useState(false);

//   const handleLogout = async () => {
//     const token = localStorage.getItem("access_token");
    
//     try {
//       setIsLoggingOut(true);
      
//       // Call logout API
//       await axios.post(
//         `${API_BASE}/auth/logout`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
      
//       // Clear local storage
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("user");
      
//       // Redirect to login page
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Logout error:", error);
//       // Even if API fails, still clear local storage and redirect
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("user");
//       window.location.href = "/login";
//     } finally {
//       setIsLoggingOut(false);
//     }
//   };

//   return (
//     <div className="bg-white border-b border-gray-200 px-6 py-4">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
//         </div>
//         <div className="flex items-center gap-4">
//           {/* Notification Bell */}
//           <NotificationBell />

//           {/* User Menu */}
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <p className="text-sm font-medium text-gray-900">{userName}</p>
//               <p className="text-xs text-gray-500">Administrator</p>
//             </div>
//             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-medium">
//               {userName.charAt(0).toUpperCase()}
//             </div>
//             <button
//               onClick={handleLogout}
//               disabled={isLoggingOut}
//               className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Logout"
//             >
//               {isLoggingOut ? (
//                 <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TopNavbar;
import React, { useState, useEffect } from "react";
import axios from "axios";
import NotificationBell from "../NotificationBell";

const API_BASE = "https://be.shuttleapp.transev.site";

const TopNavbar = ({ title, onMenuClick, isMobile }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.full_name || user?.name || "Admin";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check tablet view
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth < 1024 && window.innerWidth >= 768);
    };
    
    checkTablet();
    window.addEventListener('resize', checkTablet);
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

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
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left section with menu button and title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Hamburger Menu Button - Only show on mobile/tablet */}
            {(isMobile || isTablet) && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            {/* Title */}
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">
                {title}
              </h1>
              {/* Optional subtitle for mobile */}
              <p className="text-xs text-gray-500 sm:hidden mt-0.5">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Right section with user controls */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Menu - Desktop View */}
            <div className="relative">
              {/* User Info Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 focus:outline-none group"
              >
                {/* User Text - Hide on smallest screens */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm sm:text-base font-medium shadow-md group-hover:shadow-lg transition-all duration-200">
                  {userName.charAt(0).toUpperCase()}
                </div>
                
                {/* Dropdown Arrow - Hide on very small screens */}
                <svg 
                  className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Click outside to close */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-slideDown">
                    {/* User info for mobile */}
                    <div className="sm:hidden px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // Add profile navigation here if needed
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // Add settings navigation here if needed
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging out...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Logout Button - Shown when user menu is not available */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="sm:hidden text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
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

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TopNavbar;