import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronDownIcon, 
  ChevronUpIcon, 
  HomeIcon, 
  UsersIcon, 
  TruckIcon,
  DocumentTextIcon, 
  MapIcon, 
  StarIcon, 
  ClipboardDocumentListIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon, 
  Bars3Icon, 
  XMarkIcon, 
  CreditCardIcon, 
  DevicePhoneMobileIcon,
  ChartBarIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

const menuSections = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
      { name: "Driver Inspection", path: "/admin/inspection", icon: TruckIcon },
      { name: "Heat Map", path: "/admin/heatmap", icon: MapIcon },
      { name: "Driver Payments", path: "/admin/payments", icon: DocumentTextIcon },
    ],
  },
  {
    title: "RFID MANAGEMENT",
    items: [
      {
        name: "RFID Devices",
        icon: DevicePhoneMobileIcon,
        subItems: [
          { name: "All Devices", path: "/admin/rfid/devices" },
          { name: "Register Device", path: "/admin/rfid/devices/register" },
        ],
      },
      {
        name: "Cards Inventory",
        icon: CreditCardIcon,
        subItems: [
          { name: "All Cards", path: "/admin/rfid/cards" },
          { name: "Register Card", path: "/admin/rfid/cards/register" },
          { name: "Bulk Register", path: "/admin/rfid/cards/bulk-register" },
        ],
      },
      {
        name: "Reports & History",
        icon: ChartBarIcon,
        subItems: [
          { name: "Transaction Ledger", path: "/admin/rfid/transaction-ledger" },
          { name: "Recharge History", path: "/admin/rfid/recharge-history" },
          { name: "Card Activity Log", path: "/admin/rfid/card-activity-log" },
        ],
      },
    ],
  },
  {
    title: "MEMBERS",
    items: [
      {
        name: "Users",
        icon: UsersIcon,
        subItems: [
          { name: "All App Users", path: "/admin/users/list" },
          { name: "All Driver List", path: "/admin/drivers/list" },
        ],
      },
      { name: "Verify KYC Details", path: "/admin/providers", icon: UserCircleIcon },
      { name: "Verify Bus Details", path: "/admin/verify-drivers", icon: TruckIcon },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "Transaction & Statements", path: "/admin/transactions", icon: DocumentTextIcon },
      { name: "Passenger All Trips", path: "/admin/Passenger-all-trips", icon: MapIcon },
      { name: "Payout Service", path: "/admin/payouts", icon: Cog6ToothIcon },
      { name: "Cancellation Fine", path: "/admin/cancellation-fine", icon: DocumentTextIcon },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { name: "Route Settings", path: "/admin/route-settings", icon: MapIcon },
      { name: "Ticket Details", path: "/admin/ratings", icon: StarIcon },
      { name: "Trip Details", path: "/admin/trip-details", icon: StarIcon },
      { name: "Passenger Ratings", path: "/admin/review", icon: ClipboardDocumentListIcon },
      { name: "Driver Ratings", path: "/admin/driver-review", icon: ClipboardDocumentListIcon },
      { name: "Scheduled Trips", path: "/admin/scheduled", icon: ClipboardDocumentListIcon },
    ],
  },
];

const Sidebar = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Check mobile view - only once on mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      const savedSidebarState = localStorage.getItem("sidebarOpen");
      if (!mobile && savedSidebarState !== null) {
        setOpen(savedSidebarState === "true");
      } else if (mobile) {
        setOpen(false);
      } else if (!mobile && savedSidebarState === null) {
        setOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar state - only when open changes
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarOpen", open);
    }
  }, [open, isMobile]);

  // Close sidebar on mobile route change
  useEffect(() => {
    if (isMobile && open) {
      setOpen(false);
      if (onClose) onClose();
    }
  }, [location.pathname, isMobile, onClose]);

  // Auto-expand submenu if sub-item is active - without causing re-renders
  useEffect(() => {
    const newOpenSubmenus = {};
    menuSections.forEach((section) => {
      section.items.forEach((item, iIdx) => {
        if (item.subItems) {
          const isSubItemActive = item.subItems.some((sub) => sub.path === location.pathname);
          if (isSubItemActive) {
            const menuKey = `${section.title}-${iIdx}`;
            newOpenSubmenus[menuKey] = true;
          }
        }
      });
    });
    
    setOpenSubmenus(prev => ({
      ...prev,
      ...newOpenSubmenus
    }));
  }, [location.pathname]);

  const toggleSubmenu = useCallback((menuKey, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenSubmenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  }, []);

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await axios.post(`${API_BASE}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("sidebarOpen");
      delete axios.defaults.headers.common['Authorization'];
      setShowLogoutConfirm(false);
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common['Authorization'];
      setShowLogoutConfirm(false);
      navigate("/admin/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = useCallback(() => {
    setOpen(prev => !prev);
    if (open && onClose) onClose();
  }, [open, onClose]);

  // Tooltip state for hover
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const handleMouseEnter = useCallback((e, itemName, hasSubItems) => {
    if (!open && !hasSubItems) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        show: true,
        text: itemName,
        x: rect.right + 10,
        y: rect.top + rect.height / 2 - 15
      });
    }
  }, [open]);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  }, []);

  // Memoize section render to prevent unnecessary re-renders
  const renderMenuSections = useCallback(() => {
    return menuSections.map((section, sIdx) => (
      <div key={sIdx} className="mb-5">
        {open && (
          <div className="px-3 py-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            {section.title}
          </div>
        )}
        <ul className="space-y-1">
          {section.items.map((item, iIdx) => {
            const Icon = item.icon;
            const isActive = item.path === location.pathname;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isParentActive = hasSubItems && item.subItems.some((sub) => sub.path === location.pathname);
            const menuKey = `${section.title}-${iIdx}`;
            const isSubmenuOpen = openSubmenus[menuKey] || isParentActive;

            return (
              <li 
                key={iIdx} 
                className="relative"
                onMouseEnter={(e) => handleMouseEnter(e, item.name, hasSubItems)}
                onMouseLeave={handleMouseLeave}
              >
                {hasSubItems ? (
                  <div>
                    <button
                      onClick={(e) => toggleSubmenu(menuKey, e)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                        ${isParentActive 
                          ? 'bg-slate-100 text-slate-900' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 transition-colors duration-200 ${isParentActive ? 'text-slate-900' : 'text-slate-400'}`} />
                        <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>{item.name}</span>
                      </div>
                      {open && (
                        <div className={`text-slate-400 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                          <ChevronDownIcon className="w-4 h-4" />
                        </div>
                      )}
                    </button>

                    <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isSubmenuOpen && open ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                      <ul className="ml-9 space-y-1">
                        {item.subItems.map((sub, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={sub.path}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-200
                                ${location.pathname === sub.path 
                                  ? 'text-slate-900 bg-slate-100 font-medium' 
                                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }
                              `}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200
                      ${isActive 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    ));
  }, [open, openSubmenus, location.pathname, handleMouseEnter, handleMouseLeave, toggleSubmenu]);

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>

      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="fixed z-[60] px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
          </div>
          {tooltip.text}
        </div>
      )}

      {/* Mobile Menu Button */}
      {isMobile && !open && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white text-slate-900 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col
          ${isMobile ? (open ? 'translate-x-0 animate-slideIn' : '-translate-x-full') : 'translate-x-0'}
          ${open ? 'w-64' : 'lg:w-20'}
        `}
      >
        {/* Logo Section - No animation on click */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100 shrink-0">
          <div className={`flex items-center gap-2.5 ${!open && 'lg:justify-center lg:w-full'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className={`text-xl font-semibold text-slate-800 transition-opacity duration-300 ${!open && 'lg:hidden'}`}>
              TransEV
            </span>
          </div>
          {!isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="hidden lg:flex text-slate-400 hover:text-slate-600 transition-colors duration-200"
            >
              {open ? <ChevronDownIcon className="w-4 h-4 rotate-90" /> : <ChevronUpIcon className="w-4 h-4 -rotate-90" />}
            </button>
          )}
          {isMobile && open && (
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors duration-200">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu - No scroll reset on click */}
        <div className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
          {renderMenuSections()}
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200 group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>
              {loading ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>

        {/* Version Footer */}
        <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 text-center">
            <p className="text-[10px] text-slate-400">© 2026 TransEV Admin</p>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightOnRectangleIcon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Confirm Logout</h3>
              <p className="text-slate-500 text-sm mb-6">Are you sure you want to logout from your admin account?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? "Logging out..." : "Yes, Logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;