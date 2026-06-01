// import { useState, useEffect, useRef, useCallback } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   ChevronDownIcon, 
//   ChevronUpIcon, 
//   HomeIcon, 
//   UsersIcon, 
//   TruckIcon,
//   DocumentTextIcon, 
//   MapIcon, 
//   StarIcon, 
//   ClipboardDocumentListIcon, 
//   Cog6ToothIcon,
//   ArrowRightOnRectangleIcon, 
//   Bars3Icon, 
//   XMarkIcon, 
//   CreditCardIcon, 
//   DevicePhoneMobileIcon,
//   ChartBarIcon,
//   UserCircleIcon,
//   ShieldCheckIcon,
//   QrCodeIcon,
//   CurrencyRupeeIcon,
//   BanknotesIcon,
//   ArrowPathIcon,
//   ComputerDesktopIcon, // Added for Device Management
//   AdjustmentsHorizontalIcon // Added for Device Settings
// } from "@heroicons/react/24/outline";

// const menuSections = [
//   {
//     title: "MAIN",
//     items: [
//       { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
//       { name: "Driver Inspection", path: "/admin/inspection", icon: TruckIcon },
//       { name: "Heat Map", path: "/admin/heatmap", icon: MapIcon },
//       { name: "Driver Payments", path: "/admin/payments", icon: DocumentTextIcon },
//     ],
//   },
//   {
//     title: "RFID MANAGEMENT",
//     items: [
//       {
//         name: "RFID Devices",
//         icon: DevicePhoneMobileIcon,
//         subItems: [
//           { name: "All Devices", path: "/admin/rfid/devices" },
//           { name: "Register Device", path: "/admin/rfid/devices/register" },
//         ],
//       },
//       {
//         name: "Cards Inventory",
//         icon: CreditCardIcon,
//         subItems: [
//           { name: "All Cards", path: "/admin/rfid/cards" },
//           { name: "Register Card", path: "/admin/rfid/cards/register" },
//           { name: "Bulk Register", path: "/admin/rfid/cards/bulk-register" },
//         ],
//       },
//       {
//         name: "Reports & History",
//         icon: ChartBarIcon,
//         subItems: [
//           { name: "Transaction Ledger", path: "/admin/rfid/transaction-ledger" },
//           { name: "Recharge History", path: "/admin/rfid/recharge-history" },
//           { name: "Card Activity Log", path: "/admin/rfid/card-activity-log" },
//         ],
//       },
//       {
//         name: "Scan & Ride",
//         icon: QrCodeIcon,
//         subItems: [
//           { name: "Scan Events", path: "/admin/rfid/scan-events" },
//           { name: "Ride History", path: "/admin/rfid/ride-history" },
//         ],
//       },
//       {
//         name: "Seat Policy",
//         icon: ShieldCheckIcon,
//         path: "/admin/rfid/seat-policy",
//       },
//     ],
//   },
//   {
//     title: "RFID PAYOUT MANAGEMENT",
//     items: [
//       {
//         name: "Payout Operations",
//         icon: CurrencyRupeeIcon,
//         subItems: [
//           { name: "Payout Dashboard", path: "/admin/rfid/payout-dashboard" },
//           { name: "Payout Transfers", path: "/admin/rfid/payout-transfers" },
//           { name: "Ready Queue", path: "/admin/rfid/payout-ready" },
//           { name: "Reversal Audit", path: "/admin/rfid/payout-reversals" },
//         ],
//       },
//     ],
//   },
//   {
//     title: "MEMBERS",
//     items: [
//       {
//         name: "Users",
//         icon: UsersIcon,
//         subItems: [
//           { name: "All App Users", path: "/admin/users/list" },
//           { name: "All Driver List", path: "/admin/drivers/list" },
//         ],
//       },
//       { name: "Verify KYC Details", path: "/admin/providers", icon: UserCircleIcon },
//       { name: "Verify Bus Details", path: "/admin/verify-drivers", icon: TruckIcon },
//     ],
//   },
//   {
//     title: "DEVICE MANAGEMENT",
//     items: [
//       {
//         name: "Device Management",
//         icon: ComputerDesktopIcon,
//         subItems: [
//           { name: "All Devices", path: "/admin/all-devices" },
//           { name: "Device Settings", path: "/admin/device-settings" },
//         ],
//       },
//     ],
//   },
//   {
//     title: "FINANCE",
//     items: [
//       { name: "Transaction & Statements", path: "/admin/transactions", icon: DocumentTextIcon },
//       { name: "Passenger All Trips", path: "/admin/Passenger-all-trips", icon: MapIcon },
//       { name: "Payout Service", path: "/admin/payouts", icon: Cog6ToothIcon },
//       { name: "Cancellation Fine", path: "/admin/cancellation-fine", icon: DocumentTextIcon },
//     ],
//   },
//   {
//     title: "SETTINGS",
//     items: [
//       { name: "Route Settings", path: "/admin/route-settings", icon: MapIcon },
//       { name: "Ticket Details", path: "/admin/ratings", icon: StarIcon },
//       { name: "Trip Details", path: "/admin/trip-details", icon: StarIcon },
//       { name: "Passenger Ratings", path: "/admin/review", icon: ClipboardDocumentListIcon },
//       { name: "Driver Ratings", path: "/admin/driver-review", icon: ClipboardDocumentListIcon },
//       { name: "Scheduled Trips", path: "/admin/scheduled", icon: ClipboardDocumentListIcon },
//     ],
//   },
// ];

// const Sidebar = ({ onClose }) => {
//   const [open, setOpen] = useState(true);
//   const [openSubmenus, setOpenSubmenus] = useState({});
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const logoutTimeoutRef = useRef(null);

//   const API_BASE = "https://be.shuttleapp.transev.site";

//   // Check mobile view - only once on mount
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       const savedSidebarState = localStorage.getItem("sidebarOpen");
//       if (!mobile && savedSidebarState !== null) {
//         setOpen(savedSidebarState === "true");
//       } else if (mobile) {
//         setOpen(false);
//       } else if (!mobile && savedSidebarState === null) {
//         setOpen(true);
//       }
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Save sidebar state - only when open changes
//   useEffect(() => {
//     if (!isMobile) {
//       localStorage.setItem("sidebarOpen", open);
//     }
//   }, [open, isMobile]);

//   // Close sidebar on mobile route change
//   useEffect(() => {
//     if (isMobile && open) {
//       setOpen(false);
//       if (onClose) onClose();
//     }
//   }, [location.pathname, isMobile, onClose]);

//   // Auto-expand submenu if sub-item is active - without causing re-renders
//   useEffect(() => {
//     const newOpenSubmenus = {};
//     menuSections.forEach((section) => {
//       section.items.forEach((item, iIdx) => {
//         if (item.subItems) {
//           const isSubItemActive = item.subItems.some((sub) => sub.path === location.pathname);
//           if (isSubItemActive) {
//             const menuKey = `${section.title}-${iIdx}`;
//             newOpenSubmenus[menuKey] = true;
//           }
//         } else if (item.path === location.pathname) {
//           // For non-submenu items, we don't need to expand anything
//         }
//       });
//     });

//     setOpenSubmenus(prev => ({
//       ...prev,
//       ...newOpenSubmenus
//     }));
//   }, [location.pathname]);

//   const toggleSubmenu = useCallback((menuKey, e) => {
//     if (e) {
//       e.preventDefault();
//       e.stopPropagation();
//     }
//     setOpenSubmenus(prev => ({
//       ...prev,
//       [menuKey]: !prev[menuKey]
//     }));
//   }, []);

//   const handleLogout = async () => {
//     if (loading) return;

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (token) {
//         await axios.post(`${API_BASE}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
//       }
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("sidebarOpen");
//       delete axios.defaults.headers.common['Authorization'];
//       setShowLogoutConfirm(false);
//       navigate("/admin/login", { replace: true });
//     } catch (err) {
//       console.error("Logout error:", err);
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("user");
//       delete axios.defaults.headers.common['Authorization'];
//       setShowLogoutConfirm(false);
//       navigate("/admin/login", { replace: true });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSidebar = useCallback(() => {
//     setOpen(prev => !prev);
//     if (open && onClose) onClose();
//   }, [open, onClose]);

//   // Tooltip state for hover
//   const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

//   const handleMouseEnter = useCallback((e, itemName, hasSubItems) => {
//     if (!open && !hasSubItems) {
//       const rect = e.currentTarget.getBoundingClientRect();
//       setTooltip({
//         show: true,
//         text: itemName,
//         x: rect.right + 10,
//         y: rect.top + rect.height / 2 - 15
//       });
//     }
//   }, [open]);

//   const handleMouseLeave = useCallback(() => {
//     setTooltip({ show: false, text: '', x: 0, y: 0 });
//   }, []);

//   // Open logout modal with delay to prevent immediate closing
//   const handleLogoutClick = useCallback((e) => {
//     if (e) {
//       e.preventDefault();
//       e.stopPropagation();
//     }

//     // Clear any existing timeout
//     if (logoutTimeoutRef.current) {
//       clearTimeout(logoutTimeoutRef.current);
//     }

//     // Small delay to ensure proper state update
//     logoutTimeoutRef.current = setTimeout(() => {
//       setShowLogoutConfirm(true);
//     }, 10);
//   }, []);

//   // Cleanup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (logoutTimeoutRef.current) {
//         clearTimeout(logoutTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Memoize section render to prevent unnecessary re-renders
//   const renderMenuSections = useCallback(() => {
//     return menuSections.map((section, sIdx) => (
//       <div key={sIdx} className="mb-5">
//         {open && (
//           <div className="px-3 py-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
//             {section.title}
//           </div>
//         )}
//         <ul className="space-y-1">
//           {section.items.map((item, iIdx) => {
//             const Icon = item.icon;
//             const isActive = item.path === location.pathname;
//             const hasSubItems = item.subItems && item.subItems.length > 0;
//             const isParentActive = hasSubItems && item.subItems.some((sub) => sub.path === location.pathname);
//             const menuKey = `${section.title}-${iIdx}`;
//             const isSubmenuOpen = openSubmenus[menuKey] || isParentActive;

//             return (
//               <li 
//                 key={iIdx} 
//                 className="relative"
//                 onMouseEnter={(e) => handleMouseEnter(e, item.name, hasSubItems)}
//                 onMouseLeave={handleMouseLeave}
//               >
//                 {hasSubItems ? (
//                   <div>
//                     <button
//                       onClick={(e) => toggleSubmenu(menuKey, e)}
//                       className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
//                         ${isParentActive 
//                           ? 'bg-slate-100 text-slate-900' 
//                           : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
//                         }
//                       `}
//                     >
//                       <div className="flex items-center gap-3">
//                         <Icon className={`w-5 h-5 transition-colors duration-200 ${isParentActive ? 'text-slate-900' : 'text-slate-400'}`} />
//                         <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>{item.name}</span>
//                       </div>
//                       {open && (
//                         <div className={`text-slate-400 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : 'rotate-0'}`}>
//                           <ChevronDownIcon className="w-4 h-4" />
//                         </div>
//                       )}
//                     </button>

//                     <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isSubmenuOpen && open ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
//                       <ul className="ml-9 space-y-1">
//                         {item.subItems.map((sub, subIdx) => (
//                           <li key={subIdx}>
//                             <Link
//                               to={sub.path}
//                               className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-200
//                                 ${location.pathname === sub.path 
//                                   ? 'text-slate-900 bg-slate-100 font-medium' 
//                                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
//                                 }
//                               `}
//                             >
//                               {sub.name}
//                             </Link>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 ) : (
//                   <Link
//                     to={item.path}
//                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200
//                       ${isActive 
//                         ? 'bg-slate-100 text-slate-900' 
//                         : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
//                       }
//                     `}
//                   >
//                     <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
//                     <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>{item.name}</span>
//                   </Link>
//                 )}
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     ));
//   }, [open, openSubmenus, location.pathname, handleMouseEnter, handleMouseLeave, toggleSubmenu]);

//   return (
//     <>
//       <style>{`
//         .sidebar-scroll::-webkit-scrollbar {
//           width: 4px;
//         }
//         .sidebar-scroll::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
//         .sidebar-scroll::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 10px;
//         }
//         .sidebar-scroll::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//         @keyframes slideIn {
//           from {
//             transform: translateX(-100%);
//           }
//           to {
//             transform: translateX(0);
//           }
//         }
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-in-out;
//         }
//         /* Prevent body scroll when modal is open */
//         body.modal-open {
//           overflow: hidden;
//         }
//       `}</style>

//       {/* Tooltip */}
//       {tooltip.show && (
//         <div 
//           className="fixed z-[60] px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
//           style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
//         >
//           <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
//             <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
//           </div>
//           {tooltip.text}
//         </div>
//       )}

//       {/* Mobile Menu Button */}
//       {isMobile && !open && (
//         <button
//           onClick={toggleSidebar}
//           className="fixed top-4 left-4 z-50 lg:hidden bg-white text-slate-900 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
//         >
//           <Bars3Icon className="w-5 h-5" />
//         </button>
//       )}

//       {/* Mobile Overlay */}
//       {isMobile && open && (
//         <div 
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn" 
//           onClick={toggleSidebar} 
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`
//           fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col
//           ${isMobile ? (open ? 'translate-x-0 animate-slideIn' : '-translate-x-full') : 'translate-x-0'}
//           ${open ? 'w-64' : 'lg:w-20'}
//         `}
//       >
//         {/* Logo Section - No animation on click */}
//         <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100 shrink-0">
//           <div className={`flex items-center gap-2.5 ${!open && 'lg:justify-center lg:w-full'}`}>
//             <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-md">
//               <span className="text-white font-bold text-lg">T</span>
//             </div>
//             <span className={`text-xl font-semibold text-slate-800 transition-opacity duration-300 ${!open && 'lg:hidden'}`}>
//               TransEV
//             </span>
//           </div>
//           {!isMobile && (
//             <button 
//               onClick={toggleSidebar} 
//               className="hidden lg:flex text-slate-400 hover:text-slate-600 transition-colors duration-200"
//             >
//               {open ? <ChevronDownIcon className="w-4 h-4 rotate-90" /> : <ChevronUpIcon className="w-4 h-4 -rotate-90" />}
//             </button>
//           )}
//           {isMobile && open && (
//             <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors duration-200">
//               <XMarkIcon className="w-5 h-5" />
//             </button>
//           )}
//         </div>

//         {/* Navigation Menu - No scroll reset on click */}
//         <div className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
//           {renderMenuSections()}
//         </div>

//         {/* Logout Button */}
//         <div className="p-3 border-t border-slate-100 shrink-0">
//           <button
//             onClick={handleLogoutClick}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200 group"
//           >
//             <ArrowRightOnRectangleIcon className="w-5 h-5" />
//             <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>
//               {loading ? "Logging out..." : "Logout"}
//             </span>
//           </button>
//         </div>

//         {/* Version Footer */}
//         <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
//           <div className="px-4 pb-4 text-center">
//             <p className="text-[10px] text-slate-400">© 2026 TransEV Admin</p>
//           </div>
//         </div>
//       </div>

//       {/* Logout Modal - Fixed to prevent auto-closing */}
//       {showLogoutConfirm && (
//         <div 
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
//           onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             setShowLogoutConfirm(false);
//           }}
//           style={{ animation: 'fadeIn 0.2s ease-in-out' }}
//         >
//           <div 
//             className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//             }}
//           >
//             <div className="text-center">
//               <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <ArrowRightOnRectangleIcon className="w-7 h-7 text-red-500" />
//               </div>
//               <h3 className="text-xl font-semibold text-slate-900 mb-2">Confirm Logout</h3>
//               <p className="text-slate-500 text-sm mb-6">Are you sure you want to logout from your admin account?</p>
//               <div className="flex gap-3">
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     setShowLogoutConfirm(false);
//                   }}
//                   className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
//                   type="button"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     handleLogout();
//                   }}
//                   disabled={loading}
//                   className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
//                   type="button"
//                 >
//                   {loading ? "Logging out..." : "Yes, Logout"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Sidebar;

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
  UserCircleIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  CurrencyRupeeIcon,
  Square3Stack3DIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  TruckIcon as TruckIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  MapIcon as MapIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  DevicePhoneMobileIcon as DevicePhoneMobileIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  ShieldCheckIcon as ShieldCheckIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  CurrencyRupeeIcon as CurrencyRupeeIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid
} from "@heroicons/react/24/solid";

const menuSections = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon, iconSolid: HomeIconSolid },
      { name: "Driver Inspection", path: "/admin/inspection", icon: TruckIcon, iconSolid: TruckIconSolid },
      { name: "Heat Map", path: "/admin/heatmap", icon: MapIcon, iconSolid: MapIconSolid },
      { name: "Driver Payments", path: "/admin/payments", icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
    ],
  },
  {
    title: "RFID MANAGEMENT",
    items: [
      {
        name: "RFID Devices",
        icon: DevicePhoneMobileIcon,
        iconSolid: DevicePhoneMobileIconSolid,
        subItems: [
          { name: "All Devices", path: "/admin/rfid/devices" },
          { name: "Register Device", path: "/admin/rfid/devices/register" },
        ],
      },
      {
        name: "Cards Inventory",
        icon: CreditCardIcon,
        iconSolid: CreditCardIconSolid,
        subItems: [
          { name: "All Cards", path: "/admin/rfid/cards" },
          { name: "Register Card", path: "/admin/rfid/cards/register" },
          { name: "Bulk Register", path: "/admin/rfid/cards/bulk-register" },
        ],
      },
      {
        name: "Reports & History",
        icon: ChartBarIcon,
        iconSolid: ChartBarIconSolid,
        subItems: [
          { name: "Transaction Ledger", path: "/admin/rfid/transaction-ledger" },
          { name: "Recharge History", path: "/admin/rfid/recharge-history" },
          { name: "Card Activity Log", path: "/admin/rfid/card-activity-log" },
        ],
      },
      {
        name: "Scan & Ride",
        icon: QrCodeIcon,
        iconSolid: QrCodeIconSolid,
        subItems: [
          { name: "Scan Events", path: "/admin/rfid/scan-events" },
          { name: "Ride History", path: "/admin/rfid/ride-history" },
        ],
      },
      {
        name: "Seat Policy",
        icon: ShieldCheckIcon,
        iconSolid: ShieldCheckIconSolid,
        path: "/admin/rfid/seat-policy",
      },
    ],
  },
  {
    title: "RFID PAYOUT MANAGEMENT",
    items: [
      {
        name: "Payout Operations",
        icon: CurrencyRupeeIcon,
        iconSolid: CurrencyRupeeIconSolid,
        subItems: [
          { name: "Payout Dashboard", path: "/admin/rfid/payout-dashboard" },
          { name: "Payout Transfers", path: "/admin/rfid/payout-transfers" },
          { name: "Ready Queue", path: "/admin/rfid/payout-ready" },
          { name: "Reversal Audit", path: "/admin/rfid/payout-reversals" },
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
        iconSolid: UsersIconSolid,
        subItems: [
          { name: "All App Users", path: "/admin/users/list" },
          { name: "All Driver List", path: "/admin/drivers/list" },
        ],
      },
      { name: "Verify KYC Details", path: "/admin/providers", icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
      { name: "Verify Bus Details", path: "/admin/verify-drivers", icon: TruckIcon, iconSolid: TruckIconSolid },
    ],
  },
  {
    title: "DEVICE MANAGEMENT",
    items: [
      {
        name: "Device Management",
        icon: ComputerDesktopIcon,
        iconSolid: ComputerDesktopIconSolid,
        subItems: [
          { name: "All Devices", path: "/admin/all-devices" },
          { name: "Device Settings", path: "/admin/device-settings" },
        ],
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "Transaction & Statements", path: "/admin/transactions", icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
      { name: "Passenger All Trips", path: "/admin/Passenger-all-trips", icon: MapIcon, iconSolid: MapIconSolid },
      { name: "Payout Service", path: "/admin/payouts", icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
      { name: "Cancellation Fine", path: "/admin/cancellation-fine", icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { name: "Route Settings", path: "/admin/route-settings", icon: MapIcon, iconSolid: MapIconSolid },
      { name: "Ticket Details", path: "/admin/ratings", icon: StarIcon, iconSolid: StarIcon },
      { name: "Trip Details", path: "/admin/trip-details", icon: StarIcon, iconSolid: StarIcon },
      { name: "Passenger Ratings", path: "/admin/review", icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
      { name: "Driver Ratings", path: "/admin/driver-review", icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
      { name: "Scheduled Trips", path: "/admin/scheduled", icon: ClipboardDocumentListIcon, iconSolid: ClipboardDocumentListIconSolid },
    ],
  },
];

const Sidebar = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const logoutTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const savedScrollPosition = useRef(0);

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
    setHoveredItem(itemName);
  }, [open]);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
    setHoveredItem(null);
  }, []);

  // Open logout modal with delay to prevent immediate closing
  const handleLogoutClick = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }

    logoutTimeoutRef.current = setTimeout(() => {
      setShowLogoutConfirm(true);
    }, 10);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  // Memoize section render to prevent unnecessary re-renders
  const renderMenuSections = () => {
    return menuSections.map((section, sIdx) => (
      <div key={sIdx} className="mb-7">
        {open && (
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {section.title}
          </div>
        )}
        <ul className="space-y-1.5">
          {section.items.map((item, iIdx) => {
            const Icon = item.icon;
            const IconSolid = item.iconSolid;
            const isActive = item.path === location.pathname;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isParentActive = hasSubItems && item.subItems.some((sub) => sub.path === location.pathname);
            const menuKey = `${section.title}-${iIdx}`;
            const isSubmenuOpen = openSubmenus[menuKey];
            const isHovered = hoveredItem === item.name;

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
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300 group
                        relative overflow-hidden
                        ${isParentActive
                          ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          transition-all duration-300
                          ${isParentActive ? 'scale-110' : 'group-hover:scale-110'}
                        `}>
                          {isParentActive ? (
                            <IconSolid className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${!open && 'lg:hidden'} ${isParentActive ? 'font-semibold' : ''}`}>
                          {item.name}
                        </span>
                      </div>
                      {open && (
                        <div className={`
                          text-gray-400 transition-all duration-300 
                          ${isSubmenuOpen ? 'rotate-180 text-indigo-500' : 'rotate-0'}
                          group-hover:text-indigo-500
                        `}>
                          <ChevronDownIcon className="w-4 h-4" />
                        </div>
                      )}
                    </button>

                    {/* Submenu items with premium design */}
                    {open && isSubmenuOpen && (
                      <ul className="ml-11 mt-2 space-y-1 border-l-2 border-indigo-200/50 pl-3">
                        {item.subItems.map((sub, subIdx) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <li key={subIdx}>
                              <Link
                                to={sub.path}
                                onClick={() => {
                                  sessionStorage.setItem(
                                    "sidebarScroll",
                                    scrollContainerRef.current?.scrollTop || 0
                                  );
                                }}
                                className={`
                                  block px-3 py-2 rounded-xl text-sm transition-all duration-300
                                  ${isSubActive
                                    ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 font-medium shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50/50 hover:text-gray-700 hover:translate-x-1"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`
                                    w-1.5 h-1.5 rounded-full transition-all duration-300
                                    ${isSubActive ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}
                                  `} />
                                  <span className={isSubActive ? 'font-semibold' : ''}>
                                    {sub.name}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => {
                      sessionStorage.setItem(
                        "sidebarScroll",
                        scrollContainerRef.current?.scrollTop || 0
                      );
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300 group relative
                      ${isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-gray-600 hover:bg-gray-50/50 hover:text-gray-900"
                      }
                    `}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full animate-pulse" />
                    )}
                    
                    {/* Glow effect on hover */}
                    {!isActive && isHovered && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl" />
                    )}
                    
                    <div className={`
                      transition-all duration-300 relative z-10
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `}>
                      {isActive ? (
                        <IconSolid className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      )}
                    </div>
                    
                    <span className={`
                      text-sm font-medium relative z-10
                      ${!open ? 'lg:hidden' : ''}
                      ${isActive ? 'font-semibold' : 'group-hover:font-medium'}
                    `}>
                      {item.name}
                    </span>
                    
                    {/* Active item shine effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    ));
  };

  useEffect(() => {
    const sidebar = scrollContainerRef.current;
    if (!sidebar) return;
    const savedPosition = sessionStorage.getItem("sidebarScroll");
    if (savedPosition) {
      sidebar.scrollTop = Number(savedPosition);
    }
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .sidebar-scroll {
          overflow-anchor: none;
          scrollbar-width: thin;
          scrollbar-color: #c7d2fe #f1f1f1;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #4f46e5, #9333ea);
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
        
        body.modal-open {
          overflow: hidden;
        }
        
        .sidebar-glass {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
        }
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      {/* Tooltip with premium design */}
      {tooltip.show && (
        <div 
          className="fixed z-[60] px-3 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg shadow-2xl whitespace-nowrap pointer-events-none backdrop-blur-sm"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
          </div>
          {tooltip.text}
        </div>
      )}

      {/* Mobile Menu Button - Premium */}
      {isMobile && !open && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-2xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Overlay - Premium blur */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden animate-fadeIn" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar - Premium glassmorphism design */}
      <div
        className={`
          fixed top-0 left-0 h-full sidebar-glass shadow-2xl transition-all duration-500 ease-out z-50 flex flex-col
          ${isMobile ? (open ? 'translate-x-0 animate-slideIn' : '-translate-x-full') : 'translate-x-0'}
          ${open ? 'w-72' : 'lg:w-24'}
          border-r border-white/20
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
        }}
      >
        {/* Logo Section - Premium */}
        <div className="relative flex items-center justify-between px-5 py-6 border-b border-gray-200/50 shrink-0">
          <div className={`flex items-center gap-3 ${!open && 'lg:justify-center lg:w-full'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse-slow" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-black text-2xl">T</span>
              </div>
            </div>
            <div className={`transition-all duration-300 ${!open && 'lg:hidden'}`}>
              <span className="text-2xl font-black gradient-text">
                TransEV
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="block w-1 h-1 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Admin Portal</span>
                <span className="block w-1 h-1 rounded-full bg-purple-500" />
              </div>
            </div>
          </div>
          {!isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="hidden lg:flex w-7 h-7 items-center justify-center rounded-xl bg-gray-100/50 text-gray-500 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-300 hover:scale-110"
            >
              {open ? <ChevronDownIcon className="w-4 h-4 rotate-90" /> : <ChevronUpIcon className="w-4 h-4 -rotate-90" />}
            </button>
          )}
          {isMobile && open && (
            <button onClick={toggleSidebar} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-200">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto py-6 px-4 sidebar-scroll"
          style={{
            scrollBehavior: "auto",
            overflowAnchor: "none",
          }}
        >
          {renderMenuSections()}
        </div>

        {/* User Profile Section - Premium */}
        <div className="p-4 border-t border-gray-200/50 shrink-0">
          <div className="mb-3">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50/50 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-3">
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-300" />
                <span className={`text-sm font-semibold ${!open && 'lg:hidden'} group-hover:text-red-700`}>
                  {loading ? "Logging out..." : "Logout"}
                </span>
              </div>
            </button>
          </div>
          
          {/* Version Footer */}
          <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="text-center pt-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">© 2026 TransEV Admin</p>
              <p className="text-[8px] text-gray-300 mt-1">Version 3.0.0 • Enterprise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal - Premium */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLogoutConfirm(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl relative transform transition-all duration-300 scale-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse-slow" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <ArrowRightOnRectangleIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3">Confirm Logout</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to logout from your admin account? You'll need to login again to access the dashboard.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                  disabled={loading}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-red-500/50 hover:scale-105"
                  type="button"
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