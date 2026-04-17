// // src/components/sidebar/Sidebar.jsx
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   ChevronDownIcon, ChevronUpIcon, HomeIcon, UsersIcon, TruckIcon,
//   DocumentTextIcon, MapIcon, StarIcon, ClipboardDocumentListIcon, Cog6ToothIcon
// } from "@heroicons/react/24/solid";

// const menuSections = [
//   {
//     title: "ADMIN DASHBOARD",
//     items: [
//       { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
//       { name: "Dispatcher Panel", path: "/admin/dispatcher", icon: TruckIcon },
//       { name: "Heat Map", path: "/admin/heatmap", icon: MapIcon },
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
//       // { name: "Fleet Owner", path: "/admin/fleet", icon: TruckIcon },
//       { name: "Account Manager", path: "/admin/accountManager", icon: UsersIcon },
//     ],
//   },
//   {
//     title: "ACCOUNTS",
//     items: [{ name: "Transaction & Statements", path: "/admin/transactions", icon: DocumentTextIcon }],
//   },
//   {
//     title: "DETAILS",
//     items: [
//       { name: "Route Settings", path: "/admin/route-settings", icon: MapIcon },
//       { name: "Ticket Details", path: "/admin/ratings", icon: StarIcon },
//       { name: "Trip Details", path: "/admin/trip-details", icon: StarIcon },
//     ],
//   },
//   {
//     title: "REQUESTS",
//     items: [
//       { name: "Passenger Ratings & Review", path: "/admin/review", icon: ClipboardDocumentListIcon },
//       { name: "Scheduled Trips", path: "/admin/scheduled", icon: ClipboardDocumentListIcon },
//     ],
//   },
//   {
//     title: "GENERAL",
//     items: [
//       { name: "Payout Service", path: "/admin/payouts", icon: Cog6ToothIcon },
//       { name: "Documents", path: "/admin/documents", icon: DocumentTextIcon },

//     ],
//   },
// ];

// const Sidebar = () => {
//   const [open, setOpen] = useState(true);
//   const [activeMenu, setActiveMenu] = useState(null);
//   const location = useLocation();

//   // Auto-expand submenu if a sub-item is active
//   useEffect(() => {
//     menuSections.forEach((section, sIdx) => {
//       section.items.forEach((item, iIdx) => {
//         if (item.subItems) {
//           const isSubItemActive = item.subItems.some((sub) => sub.path === location.pathname);
//           if (isSubItemActive && activeMenu !== `${section.title}-${iIdx}`) {
//             setActiveMenu(`${section.title}-${iIdx}`);
//           }
//         }
//       });
//     });
//   }, [location.pathname]);

//   return (
//     <div className={`flex flex-col h-screen bg-black text-white transition-all duration-300 ${open ? "w-64" : "w-20"}`}>
//       {/* Logo */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-800">
//         <span className={`text-2xl font-bold tracking-wide ${!open && "hidden"}`}>TransEv</span>
//         <button
//           className="text-gray-400 hover:text-white transition-colors"
//           onClick={() => setOpen(!open)}
//         >
//           {open ? "<" : ">"}
//         </button>
//       </div>

//       {/* Menu */}
//       <div className="flex-1 overflow-y-auto mt-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
//         {menuSections.map((section, sIdx) => (
//           <div key={sIdx} className="mb-5">
//             {open && (
//               <div className="px-4 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
//                 {section.title}
//               </div>
//             )}
//             <ul>
//               {section.items.map((item, iIdx) => {
//                 const Icon = item.icon;

//                 // Determine if this item or any of its subItems is active
//                 const isActive =
//                   item.path === location.pathname ||
//                   (item.subItems &&
//                     item.subItems.some((sub) => sub.path === location.pathname));

//                 return (
//                   <li key={iIdx} className="px-2">
//                     {item.subItems ? (
//                       <div>
//                         <button
//                           className={`flex items-center justify-between w-full px-4 py-2 rounded hover:bg-gray-800 transition-colors ${activeMenu === `${section.title}-${iIdx}` || isActive
//                               ? "bg-gray-800 font-semibold"
//                               : ""
//                             }`}
//                           onClick={() =>
//                             setActiveMenu(
//                               activeMenu === `${section.title}-${iIdx}`
//                                 ? null
//                                 : `${section.title}-${iIdx}`
//                             )
//                           }
//                         >
//                           <div className="flex items-center gap-3">
//                             {Icon && <Icon className="w-5 h-5 text-gray-400" />}
//                             <span className={`${!open && "hidden"}`}>{item.name}</span>
//                           </div>
//                           {open &&
//                             (activeMenu === `${section.title}-${iIdx}` ? (
//                               <ChevronUpIcon className="w-5 h-5 text-gray-400" />
//                             ) : (
//                               <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                             ))}
//                         </button>

//                         {/* Animated submenu */}
//                         <ul
//                           className={`ml-6 mt-1 space-y-1 overflow-hidden transition-[max-height] duration-300 ease-in-out ${activeMenu === `${section.title}-${iIdx}` || isActive
//                               ? "max-h-40"
//                               : "max-h-0"
//                             }`}
//                         >
//                           {item.subItems.map((sub, subIdx) => (
//                             <li key={subIdx}>
//                               <Link
//                                 to={sub.path}
//                                 className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 border-l-4 transition-colors ${location.pathname === sub.path
//                                     ? "bg-gray-800 font-semibold border-white"
//                                     : "border-transparent"
//                                   }`}
//                               >
//                                 <span className={`${!open && "hidden"}`}>{sub.name}</span>
//                               </Link>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     ) : (
//                       <Link
//                         to={item.path}
//                         className={`flex items-center px-4 py-2 rounded hover:bg-gray-800 transition-colors border-l-4 ${location.pathname === item.path
//                             ? "bg-gray-800 font-semibold border-white"
//                             : "border-transparent"
//                           }`}
//                       >
//                         {Icon && <Icon className="w-5 h-5 text-gray-400 mr-3" />}
//                         <span className={`${!open && "hidden"}`}>{item.name}</span>
//                       </Link>
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         ))}
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
//         {open && "© 2026 TransEv"}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

// src/components/sidebar/Sidebar.jsximport { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ChevronDownIcon, ChevronUpIcon, HomeIcon, UsersIcon, TruckIcon,
  DocumentTextIcon, MapIcon, StarIcon, ClipboardDocumentListIcon, Cog6ToothIcon,
  ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon
} from "@heroicons/react/24/solid";

const menuSections = [
  {
    title: "ADMIN DASHBOARD",
    items: [
      { name: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
      { name: "Driver Inspection", path: "/admin/inspection", icon: TruckIcon },
      { name: "Heat Map", path: "/admin/heatmap", icon: MapIcon },
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
      { name: "Verify KYC Details", path: "/admin/providers", icon: UsersIcon },
      { name: "Verify Bus Details", path: "/admin/verify-drivers", icon: UsersIcon },
      // { name: "Account Manager", path: "/admin/accountManager", icon: UsersIcon },
    ],
  },
  {
    title: "ACCOUNTS",
    items: [{ name: "Transaction & Statements", path: "/admin/transactions", icon: DocumentTextIcon }],
  },
  {
    title: "DETAILS",
    items: [
      { name: "Route Settings", path: "/admin/route-settings", icon: MapIcon },
      { name: "Ticket Details", path: "/admin/ratings", icon: StarIcon },
      { name: "Trip Details", path: "/admin/trip-details", icon: StarIcon },
    ],
  },
  {
    title: "REQUESTS",
    items: [
      { name: "Passenger Ratings & Review", path: "/admin/review", icon: ClipboardDocumentListIcon },
      { name: "Driver Ratings & Review", path: "/admin/driver-review", icon: ClipboardDocumentListIcon },
      { name: "Scheduled Trips", path: "/admin/scheduled", icon: ClipboardDocumentListIcon },
    ],
  },
  {
    title: "GENERAL",
    items: [
      { name: "Payout Service", path: "/admin/payouts", icon: Cog6ToothIcon },
      { name: "Documents", path: "/admin/documents", icon: DocumentTextIcon },
    ],
  },
];

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Auto-expand submenu if a sub-item is active
  useEffect(() => {
    menuSections.forEach((section, sIdx) => {
      section.items.forEach((item, iIdx) => {
        if (item.subItems) {
          const isSubItemActive = item.subItems.some((sub) => sub.path === location.pathname);
          if (isSubItemActive && activeMenu !== `${section.title}-${iIdx}`) {
            setActiveMenu(`${section.title}-${iIdx}`);
          }
        }
      });
    });
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common['Authorization'];
      navigate("/admin/login", { replace: true });
      
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common['Authorization'];
      navigate("/admin/login", { replace: true });
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white p-2 rounded-xl shadow-lg backdrop-blur-lg"
      >
        {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full 
        bg-gradient-to-b from-gray-900 via-gray-900 to-black
        backdrop-blur-xl
        shadow-2xl
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        z-50
        flex flex-col
        ${open ? 'w-72' : 'w-20'}
        lg:relative
        border-r border-white/10
      `}>
        
        {/* Modern Glass Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
          <div className="flex items-center justify-between p-5 border-b border-white/10 backdrop-blur-sm">
            <div className={`flex items-center gap-3 ${!open && 'justify-center w-full'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent transition-all duration-300 ${!open && 'hidden'}`}>
                TransEv
              </span>
            </div>
            <button
              className="hidden lg:flex text-gray-400 hover:text-white transition-all duration-300 hover:rotate-180"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <ChevronDownIcon className="w-5 h-5 rotate-90" />
              ) : (
                <ChevronUpIcon className="w-5 h-5 -rotate-90" />
              )}
            </button>
          </div>
        </div>

        {/* Menu with modern scrollbar */}
        <div className="flex-1 overflow-y-auto mt-4 px-3 custom-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mb-6">
              {open && (
                <div className="px-3 py-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = item.path === location.pathname ||
                    (item.subItems && item.subItems.some((sub) => sub.path === location.pathname));
                  const isHovered = hoveredItem === `${section.title}-${iIdx}`;

                  return (
                    <li key={iIdx}>
                      {item.subItems ? (
                        <div>
                          <button
                            className={`relative group w-full rounded-xl transition-all duration-300 overflow-hidden
                              ${activeMenu === `${section.title}-${iIdx}` || isActive
                                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg'
                                : 'hover:bg-white/5'
                              }
                            `}
                            onClick={() => setActiveMenu(
                              activeMenu === `${section.title}-${iIdx}` ? null : `${section.title}-${iIdx}`
                            )}
                            onMouseEnter={() => setHoveredItem(`${section.title}-${iIdx}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                {Icon && (
                                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive || isHovered ? 'text-purple-400' : 'text-gray-400'}`} />
                                )}
                                <span className={`font-medium transition-all duration-300 ${!open && 'hidden'} ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                  {item.name}
                                </span>
                              </div>
                              {open && (
                                <div className="transition-transform duration-300">
                                  {activeMenu === `${section.title}-${iIdx}` ? (
                                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Animated underline */}
                            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                          </button>

                          {/* Smooth submenu animation */}
                          <div className={`
                            overflow-hidden transition-all duration-400 ease-in-out
                            ${activeMenu === `${section.title}-${iIdx}` || isActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                          `}>
                            <ul className="ml-8 mt-1 space-y-1">
                              {item.subItems.map((sub, subIdx) => (
                                <li key={subIdx}>
                                  <Link
                                    to={sub.path}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden
                                      ${location.pathname === sub.path
                                        ? 'text-purple-400 bg-purple-500/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                      }
                                    `}
                                  >
                                    <span className="relative z-10 text-sm">{sub.name}</span>
                                    {location.pathname === sub.path && (
                                      <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-r" />
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <Link
                          to={item.path}
                          className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden
                            ${location.pathname === item.path
                              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 shadow-lg text-white'
                              : 'text-gray-300 hover:bg-white/5'
                            }
                          `}
                          onMouseEnter={() => setHoveredItem(`${section.title}-${iIdx}`)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          {Icon && (
                            <Icon className={`w-5 h-5 transition-all duration-300 ${location.pathname === item.path || isHovered ? 'text-purple-400' : 'text-gray-400'}`} />
                          )}
                          <span className={`font-medium transition-all duration-300 ${!open && 'hidden'}`}>
                            {item.name}
                          </span>
                          {location.pathname === item.path && (
                            <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-r" />
                          )}
                          <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Section with Glass Effect */}
        <div className="relative mt-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Logout Button */}
          <div className="relative p-4 border-t border-white/10">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`relative group w-full rounded-xl transition-all duration-300 overflow-hidden
                ${open ? 'px-4 py-3' : 'p-3'}
                hover:bg-red-500/10
              `}
              disabled={loading}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                  <span className={`text-red-400 group-hover:text-red-300 transition-all duration-300 font-medium ${!open && 'hidden'}`}>
                    {loading ? "Logging out..." : "Logout"}
                  </span>
                </div>
                {open && !loading && (
                  <span className="text-xs text-gray-500 group-hover:text-red-300 transition-colors">
                    Click to sign out
                  </span>
                )}
              </div>
              <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/5 transition-all duration-300" />
            </button>
          </div>

          {/* Copyright */}
          {open && (
            <div className="relative px-4 pb-4 text-xs text-center text-gray-500">
              © 2026 TransEv. All rights reserved.
            </div>
          )}
        </div>
      </div>

      {/* Modern Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl shadow-lg">
                  <ArrowRightOnRectangleIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-400 text-center mb-6">
                Are you sure you want to logout from your admin account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg"
                  disabled={loading}
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