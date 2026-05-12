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