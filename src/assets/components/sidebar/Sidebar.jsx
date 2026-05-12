// import { useState, useEffect, useRef } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   ChevronDownIcon, ChevronUpIcon, HomeIcon, UsersIcon, TruckIcon,
//   DocumentTextIcon, MapIcon, StarIcon, ClipboardDocumentListIcon, Cog6ToothIcon,
//   ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, CreditCardIcon, DevicePhoneMobileIcon,
//   ChartBarIcon
// } from "@heroicons/react/24/solid";

// const menuSections = [
//   {
//     title: "ADMIN DASHBOARD",
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
//       { name: "Verify KYC Details", path: "/admin/providers", icon: UsersIcon },
//       { name: "Verify Bus Details", path: "/admin/verify-drivers", icon: UsersIcon },
//     ],
//   },
//   {
//     title: "ACCOUNTS",
//     items: [
//       { name: "Transaction & Statements", path: "/admin/transactions", icon: DocumentTextIcon },
//       { name: "Passenger All Trips", path: "/admin/Passenger-all-trips", icon: DocumentTextIcon }
//     ],
//   },
//   {
//     title: "DETAILS",
//     items: [
//       { name: "Route Settings", path: "/admin/route-settings", icon: MapIcon },
//       { name: "Ticket Details", path: "/admin/ratings", icon: StarIcon },
//       { name: "Trip Details", path: "/admin/trip-details", icon: StarIcon }
//     ],
//   },
//   {
//     title: "REQUESTS",
//     items: [
//       { name: "Passenger Ratings & Review", path: "/admin/review", icon: ClipboardDocumentListIcon },
//       { name: "Driver Ratings & Review", path: "/admin/driver-review", icon: ClipboardDocumentListIcon },
//       { name: "Scheduled Trips", path: "/admin/scheduled", icon: ClipboardDocumentListIcon },
//     ],
//   },
//   {
//     title: "GENERAL",
//     items: [
//       { name: "Payout Service", path: "/admin/payouts", icon: Cog6ToothIcon },
//       { name: "Cancellation Fine", path: "/admin/cancellation-fine", icon: DocumentTextIcon },
//     ],
//   },
// ];

// const Sidebar = ({ onClose }) => {
//   const [open, setOpen] = useState(true);
//   const [activeMenu, setActiveMenu] = useState(null);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const [savedScrollPosition, setSavedScrollPosition] = useState(0);
//   const menuContainerRef = useRef(null);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const API_BASE = "https://be.shuttleapp.transev.site";

//   // Save scroll position before navigation
//   const saveScrollPosition = () => {
//     if (menuContainerRef.current) {
//       setSavedScrollPosition(menuContainerRef.current.scrollTop);
//     }
//   };

//   // Restore scroll position after navigation
//   const restoreScrollPosition = () => {
//     setTimeout(() => {
//       if (menuContainerRef.current && savedScrollPosition > 0) {
//         menuContainerRef.current.scrollTop = savedScrollPosition;
//       }
//     }, 50);
//   };

//   // Check if mobile view and load saved sidebar state from localStorage
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
      
//       // Load saved sidebar state from localStorage (only for desktop)
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

//   // Save sidebar state to localStorage when it changes (desktop only)
//   useEffect(() => {
//     if (!isMobile) {
//       localStorage.setItem("sidebarOpen", open);
//     }
//   }, [open, isMobile]);

//   // Close sidebar on mobile when route changes
//   useEffect(() => {
//     if (isMobile && open) {
//       setOpen(false);
//       if (onClose) onClose();
//     }
//     // Restore scroll position after route change
//     restoreScrollPosition();
//   }, [location.pathname, isMobile]);

//   // Auto-expand submenu if a sub-item is active
//   useEffect(() => {
//     menuSections.forEach((section, sIdx) => {
//       section.items.forEach((item, iIdx) => {
//         if (item.subItems) {
//           const isSubItemActive = item.subItems.some((sub) => sub.path === location.pathname);
//           const menuKey = `${section.title}-${iIdx}`;
//           if (isSubItemActive && activeMenu !== menuKey) {
//             setActiveMenu(menuKey);
//           }
//         }
//       });
//     });
//   }, [location.pathname]);

//   const handleLogout = async () => {
//     if (loading) return;
    
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
      
//       if (token) {
//         await axios.post(
//           `${API_BASE}/auth/logout`,
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         );
//       }
      
//       // Clear storage
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

//   const toggleSidebar = () => {
//     setOpen(!open);
//     if (!open && onClose) onClose();
//   };

//   const openLogoutModal = () => {
//     setShowLogoutConfirm(true);
//   };

//   const closeLogoutModal = () => {
//     setShowLogoutConfirm(false);
//   };

//   // Handle link click - save scroll position before navigation
//   const handleLinkClick = () => {
//     saveScrollPosition();
//   };

//   return (
//     <>
//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.05);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(255, 255, 255, 0.3);
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-in-out;
//         }
//         @keyframes slideIn {
//           from { transform: translateX(-100%); }
//           to { transform: translateX(0); }
//         }
//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>

//       {/* Mobile Menu Button */}
//       {isMobile && !open && (
//         <button
//           onClick={toggleSidebar}
//           className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2.5 rounded-xl shadow-lg backdrop-blur-lg hover:scale-105 transition-transform"
//         >
//           <Bars3Icon className="w-5 h-5" />
//         </button>
//       )}

//       {/* Overlay for mobile */}
//       {isMobile && open && (
//         <div 
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
//           onClick={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed top-0 left-0 h-full 
//         bg-gradient-to-b from-gray-900 via-gray-900 to-black
//         backdrop-blur-xl
//         shadow-2xl
//         transition-all duration-300 ease-in-out
//         z-50
//         flex flex-col
//         ${isMobile ? (open ? 'translate-x-0 animate-slideIn' : '-translate-x-full') : 'translate-x-0'}
//         ${open ? 'w-72' : 'lg:w-20'}
//         border-r border-white/10
//       `}>
        
//         {/* Header */}
//         <div className="relative overflow-hidden flex-shrink-0">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
//           <div className="flex items-center justify-between p-5 border-b border-white/10 backdrop-blur-sm">
//             <div className={`flex items-center gap-3 ${!open && 'lg:justify-center lg:w-full'}`}>
//               <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-white font-bold text-xl">T</span>
//               </div>
//               <span className={`text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent transition-all duration-300 ${!open && 'lg:hidden'}`}>
//                 TransEV
//               </span>
//             </div>
            
//             {isMobile && open && (
//               <button
//                 onClick={toggleSidebar}
//                 className="lg:hidden text-gray-400 hover:text-white transition-all duration-300"
//               >
//                 <XMarkIcon className="w-5 h-5" />
//               </button>
//             )}
            
//             {!isMobile && (
//               <button
//                 className="hidden lg:flex text-gray-400 hover:text-white transition-all duration-300 hover:rotate-180"
//                 onClick={toggleSidebar}
//               >
//                 {open ? (
//                   <ChevronDownIcon className="w-5 h-5 rotate-90" />
//                 ) : (
//                   <ChevronUpIcon className="w-5 h-5 -rotate-90" />
//                 )}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Menu - Scrollable area with ref for scroll position */}
//         <div 
//           ref={menuContainerRef}
//           className="flex-1 overflow-y-auto mt-4 px-3 custom-scrollbar"
//         >
//           {menuSections.map((section, sIdx) => (
//             <div key={sIdx} className="mb-6">
//               {open && (
//                 <div className="px-3 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
//                   {section.title}
//                 </div>
//               )}
//               <ul className="space-y-1">
//                 {section.items.map((item, iIdx) => {
//                   const Icon = item.icon;
//                   const isActive = item.path === location.pathname ||
//                     (item.subItems && item.subItems.some((sub) => sub.path === location.pathname));
//                   const isHovered = hoveredItem === `${section.title}-${iIdx}`;
//                   const menuKey = `${section.title}-${iIdx}`;
//                   const isMenuOpen = activeMenu === menuKey;

//                   return (
//                     <li key={iIdx}>
//                       {item.subItems ? (
//                         <div>
//                           <button
//                             className={`relative group w-full rounded-xl transition-all duration-300 overflow-hidden
//                               ${isMenuOpen || isActive
//                                 ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg'
//                                 : 'hover:bg-white/5'
//                               }
//                             `}
//                             onClick={() => {
//                               // Toggle submenu - stays open when clicked
//                               setActiveMenu(isMenuOpen ? null : menuKey);
//                             }}
//                             onMouseEnter={() => setHoveredItem(menuKey)}
//                             onMouseLeave={() => setHoveredItem(null)}
//                           >
//                             <div className="flex items-center justify-between px-4 py-3">
//                               <div className="flex items-center gap-3">
//                                 {Icon && (
//                                   <Icon className={`w-5 h-5 transition-all duration-300 flex-shrink-0 ${isActive || isHovered ? 'text-purple-400' : 'text-gray-400'}`} />
//                                 )}
//                                 <span className={`font-medium transition-all duration-300 ${!open && 'lg:hidden'} ${isActive ? 'text-white' : 'text-gray-300'}`}>
//                                   {item.name}
//                                 </span>
//                               </div>
//                               {open && (
//                                 <div className="transition-transform duration-300">
//                                   {isMenuOpen ? (
//                                     <ChevronUpIcon className="w-4 h-4 text-gray-400" />
//                                   ) : (
//                                     <ChevronDownIcon className="w-4 h-4 text-gray-400" />
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                             <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
//                           </button>

//                           {/* Submenu - stays open when active or toggled */}
//                           <div className={`
//                             overflow-hidden transition-all duration-300 ease-in-out
//                             ${isMenuOpen || isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
//                           `}>
//                             <ul className="ml-8 mt-1 space-y-1">
//                               {item.subItems.map((sub, subIdx) => (
//                                 <li key={subIdx}>
//                                   <Link
//                                     to={sub.path}
//                                     onClick={handleLinkClick}
//                                     className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden
//                                       ${location.pathname === sub.path
//                                         ? 'text-purple-400 bg-purple-500/10'
//                                         : 'text-gray-400 hover:text-white hover:bg-white/5'
//                                       }
//                                     `}
//                                   >
//                                     <span className="relative z-10 text-sm">{sub.name}</span>
//                                     {location.pathname === sub.path && (
//                                       <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-r" />
//                                     )}
//                                   </Link>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </div>
//                       ) : (
//                         <Link
//                           to={item.path}
//                           onClick={handleLinkClick}
//                           className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden
//                             ${location.pathname === item.path
//                               ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg text-white'
//                               : 'text-gray-300 hover:bg-white/5'
//                             }
//                           `}
//                           onMouseEnter={() => setHoveredItem(`${section.title}-${iIdx}`)}
//                           onMouseLeave={() => setHoveredItem(null)}
//                         >
//                           {Icon && (
//                             <Icon className={`w-5 h-5 transition-all duration-300 flex-shrink-0 ${location.pathname === item.path || isHovered ? 'text-purple-400' : 'text-gray-400'}`} />
//                           )}
//                           <span className={`font-medium transition-all duration-300 ${!open && 'lg:hidden'}`}>
//                             {item.name}
//                           </span>
//                           {location.pathname === item.path && (
//                             <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-r" />
//                           )}
//                           <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
//                         </Link>
//                       )}
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           ))}
//         </div>

//         {/* Footer with Logout Button - Fixed at bottom */}
//         <div className="relative flex-shrink-0 mt-auto">
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
//           <div className="relative p-4 border-t border-white/10">
//             <button
//               onClick={openLogoutModal}
//               className={`relative group w-full rounded-xl transition-all duration-300 overflow-hidden
//                 ${open ? 'px-4 py-3' : 'lg:p-3'}
//                 hover:bg-red-500/10
//               `}
//               disabled={loading}
//               type="button"
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors flex-shrink-0" />
//                   <span className={`text-red-400 group-hover:text-red-300 transition-all duration-300 font-medium ${!open && 'lg:hidden'}`}>
//                     {loading ? "Logging out..." : "Logout"}
//                   </span>
//                 </div>
//                 {open && !loading && (
//                   <span className="text-xs text-gray-500 group-hover:text-red-300 transition-colors hidden lg:block">
//                     Click to sign out
//                   </span>
//                 )}
//               </div>
//               <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/5 transition-all duration-300" />
//             </button>
//           </div>

//           {open && (
//             <div className="relative px-4 pb-4 text-xs text-center text-gray-500">
//               © 2026 TransEV. All rights reserved.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Logout Confirmation Modal */}
//       {showLogoutConfirm && (
//         <div 
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(0, 0, 0, 0.7)',
//             backdropFilter: 'blur(8px)',
//             zIndex: 9999,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: '1rem',
//           }}
//           onClick={closeLogoutModal}
//         >
//           <div 
//             style={{
//               maxWidth: '28rem',
//               width: '100%',
//             }}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div style={{
//               background: 'linear-gradient(to bottom, #111827, #111827)',
//               borderRadius: '1rem',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
//               position: 'relative',
//               overflow: 'hidden',
//             }}>
//               <div style={{
//                 position: 'absolute',
//                 inset: 0,
//                 background: 'linear-gradient(to right, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
//                 borderRadius: '1rem',
//               }} />
              
//               <div style={{ position: 'relative', padding: '1.5rem' }}>
//                 <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
//                   <div style={{
//                     background: 'linear-gradient(to bottom right, #ef4444, #dc2626)',
//                     padding: '1rem',
//                     borderRadius: '1rem',
//                     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
//                   }}>
//                     <ArrowRightOnRectangleIcon style={{ width: '2rem', height: '2rem', color: 'white' }} />
//                   </div>
//                 </div>
                
//                 <h3 style={{
//                   fontSize: '1.5rem',
//                   fontWeight: 'bold',
//                   color: 'white',
//                   textAlign: 'center',
//                   marginBottom: '0.5rem',
//                 }}>
//                   Confirm Logout
//                 </h3>
//                 <p style={{
//                   color: '#9ca3af',
//                   textAlign: 'center',
//                   marginBottom: '1.5rem',
//                 }}>
//                   Are you sure you want to logout from your admin account?
//                 </p>
                
//                 <div style={{ display: 'flex', gap: '0.75rem' }}>
//                   <button
//                     onClick={closeLogoutModal}
//                     style={{
//                       flex: 1,
//                       padding: '0.625rem 1rem',
//                       backgroundColor: '#1f2937',
//                       color: 'white',
//                       borderRadius: '0.75rem',
//                       border: 'none',
//                       cursor: 'pointer',
//                       fontWeight: '500',
//                       transition: 'all 0.3s',
//                     }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     style={{
//                       flex: 1,
//                       padding: '0.625rem 1rem',
//                       background: 'linear-gradient(to right, #ef4444, #dc2626)',
//                       color: 'white',
//                       borderRadius: '0.75rem',
//                       border: 'none',
//                       cursor: loading ? 'not-allowed' : 'pointer',
//                       fontWeight: '500',
//                       transition: 'all 0.3s',
//                       opacity: loading ? 0.5 : 1,
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!loading) {
//                         e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (!loading) {
//                         e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
//                       }
//                     }}
//                     disabled={loading}
//                   >
//                     {loading ? "Logging out..." : "Yes, Logout"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Sidebar;


import { useState, useEffect, useRef } from "react";
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
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);
  const [hoveredItem, setHoveredItem] = useState(null);
  const menuContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE = "https://be.shuttleapp.transev.site";

  const saveScrollPosition = () => {
    if (menuContainerRef.current) {
      setSavedScrollPosition(menuContainerRef.current.scrollTop);
    }
  };

  const restoreScrollPosition = () => {
    setTimeout(() => {
      if (menuContainerRef.current && savedScrollPosition > 0) {
        menuContainerRef.current.scrollTop = savedScrollPosition;
      }
    }, 50);
  };

  // Check mobile view
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

  // Save sidebar state
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
    restoreScrollPosition();
  }, [location.pathname, isMobile, onClose]);

  // Auto-expand submenu if sub-item is active
  useEffect(() => {
    const newOpenSubmenus = { ...openSubmenus };
    menuSections.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        if (item.subItems) {
          const isSubItemActive = item.subItems.some((sub) => sub.path === location.pathname);
          const menuKey = `${section.title}-${iIdx}`;
          if (isSubItemActive && !newOpenSubmenus[menuKey]) {
            newOpenSubmenus[menuKey] = true;
          }
        }
      });
    });
    if (JSON.stringify(openSubmenus) !== JSON.stringify(newOpenSubmenus)) {
      setOpenSubmenus(newOpenSubmenus);
    }
  }, [location.pathname]);

  const toggleSubmenu = (menuKey) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

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

  const toggleSidebar = () => {
    setOpen(!open);
    if (!open && onClose) onClose();
  };

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-in-out; }
        
        /* Tooltip styles */
        .sidebar-tooltip {
          position: fixed;
          left: 80px;
          z-index: 9999;
          padding: 6px 12px;
          background-color: #1e293b;
          color: white;
 font-size: 12px;
          border-radius: 8px;
          white-space: nowrap;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          pointer-events: none;
          font-weight: 500;
        }
        
        .sidebar-tooltip::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #1e293b;
        }
      `}</style>

      {/* Mobile Menu Button */}
      {isMobile && !open && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden bg-white text-slate-900 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col
        ${isMobile ? (open ? 'translate-x-0 animate-slideIn' : '-translate-x-full') : 'translate-x-0'}
        ${open ? 'w-64' : 'lg:w-20'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
          <div className={`flex items-center gap-2.5 ${!open && 'lg:justify-center lg:w-full'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className={`text-xl font-semibold text-slate-800 transition-all duration-300 ${!open && 'lg:hidden'}`}>
              TransEV
            </span>
          </div>
          {!isMobile && (
            <button onClick={toggleSidebar} className="hidden lg:flex text-slate-400 hover:text-slate-600 transition-colors">
              {open ? <ChevronDownIcon className="w-4 h-4 rotate-90" /> : <ChevronUpIcon className="w-4 h-4 -rotate-90" />}
            </button>
          )}
          {isMobile && open && (
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div ref={menuContainerRef} className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
          {menuSections.map((section, sIdx) => (
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
                      onMouseEnter={(e) => {
                        if (!open && !hasSubItems) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const tooltip = document.createElement('div');
                          tooltip.className = 'sidebar-tooltip';
                          tooltip.textContent = item.name;
                          tooltip.style.top = `${rect.top + rect.height / 2 - 15}px`;
                          tooltip.id = `tooltip-${menuKey}`;
                          document.body.appendChild(tooltip);
                        }
                      }}
                      onMouseLeave={() => {
                        const tooltip = document.getElementById(`tooltip-${menuKey}`);
                        if (tooltip) tooltip.remove();
                      }}
                    >
                      {hasSubItems ? (
                        <div>
                          <button
                            onClick={() => toggleSubmenu(menuKey)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                              ${isParentActive 
                                ? 'bg-slate-100 text-slate-900' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 transition-colors ${isParentActive ? 'text-slate-900' : 'text-slate-400'}`} />
                              <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>{item.name}</span>
                            </div>
                            {open && (
                              <div className="text-slate-400 transition-transform duration-200">
                                {isSubmenuOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                              </div>
                            )}
                          </button>

                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubmenuOpen && open ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <ul className="ml-9 space-y-1">
                              {item.subItems.map((sub, subIdx) => (
                                <li key={subIdx}>
                                  <Link
                                    to={sub.path}
                                    onClick={saveScrollPosition}
                                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200
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
                          onClick={saveScrollPosition}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                            ${isActive 
                              ? 'bg-slate-100 text-slate-900' 
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                          <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>{item.name}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Logout Button with Tooltip */}
        <div 
          className="p-3 border-t border-slate-100"
          onMouseEnter={(e) => {
            if (!open) {
              const rect = e.currentTarget.getBoundingClientRect();
              const tooltip = document.createElement('div');
              tooltip.className = 'sidebar-tooltip';
              tooltip.textContent = 'Logout';
              tooltip.style.top = `${rect.top + rect.height / 2 - 15}px`;
              tooltip.id = 'tooltip-logout';
              document.body.appendChild(tooltip);
            }
          }}
          onMouseLeave={() => {
            const tooltip = document.getElementById('tooltip-logout');
            if (tooltip) tooltip.remove();
          }}
        >
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className={`text-sm font-medium ${!open && 'lg:hidden'}`}>
              {loading ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>

        {/* Version Footer */}
        {open && (
          <div className="px-4 pb-4 text-center">
            <p className="text-[10px] text-slate-400">© 2026 TransEV Admin</p>
          </div>
        )}
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
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50"
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