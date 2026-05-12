import React, { useState, useEffect } from "react";
import axios from "axios";
import NotificationBell from "../NotificationBell";

const API_BASE = "https://be.shuttleapp.transev.site";

const TopNavbar = ({ title, onMenuClick, isMobile }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.full_name || user?.name || "Admin";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showMenuButton = windowWidth < 1024; // Show on mobile and tablet

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    
    try {
      setIsLoggingOut(true);
      
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left section with menu button and title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Hamburger Menu Button - Show on mobile and tablet */}
            {showMenuButton && (
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
                {title || "Dashboard"}
              </h1>
              <p className="text-xs text-gray-500 sm:hidden mt-0.5">
                Admin Panel
              </p>
            </div>
          </div>
          {/* Right section with user controls - Simplified */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Simple User Avatar and Name - No Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-base font-medium shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
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