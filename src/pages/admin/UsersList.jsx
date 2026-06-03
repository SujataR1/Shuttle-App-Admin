// import React, { useState, useEffect, useRef } from "react";
// import Sidebar from "../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../assets/components/navbar/TopNavbar";

// const UsersList = () => {
//   const [users, setUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userBookings, setUserBookings] = useState(null);
//   const [userTransactions, setUserTransactions] = useState(null);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [transactionsLoading, setTransactionsLoading] = useState(false);
//   const [bookingError, setBookingError] = useState(null);
//   const [showAvatarModal, setShowAvatarModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("transactions");
//   const [isMobile, setIsMobile] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const hasFetched = useRef(false);

//   const token = localStorage.getItem("access_token");
//   const BASE_URL = "https://be.shuttleapp.transev.site";

//   // Check if mobile/tablet view
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("access_token");

//       if (!token) {
//         console.error("No token found");
//         setLoading(false);
//         setInitialLoad(false);
//         return;
//       }

//       const res = await fetch(
//         "https://be.shuttleapp.transev.site/admin/view/all-passengers",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) {
//         console.error("API Error:", res.status);
//         setLoading(false);
//         setInitialLoad(false);
//         return;
//       }

//       const data = await res.json();

//       // Enhanced mapping with all new fields from the API response
//       const mappedUsers = data.map((user, idx) => ({
//         id: idx + 1,
//         user_id: user.user_id,
//         name: user.profile?.name || user.profile?.full_name || "Not Set",
//         email: user.email,
//         is_active: user.is_active,
//         joined_at: user.joined_at,
//         // New fields from enhanced endpoint
//         total_trips_booked: user.total_trips_booked || 0,
//         traveller_profile_count: user.traveller_profile_count || 0,
//         booking_session_count: user.booking_session_count || 0,
//         active_booking_session_count: user.active_booking_session_count || 0,
//         status: user.is_active ? "Active" : "Inactive",
//         avatar: user.profile?.avatar || null,
//         profile: user.profile || {}
//       }));

//       setUsers(mappedUsers);
//     } catch (err) {
//       console.error("Error fetching users:", err);
//     } finally {
//       setLoading(false);
//       setInitialLoad(false);
//     }
//   };

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;
//     fetchUsers();
//   }, []);

//   // WebSocket refresh event listener
//   useEffect(() => {
//     const refreshBookingsData = () => {
//       console.log("🔄 Real-time refresh: Updating bookings data...");
//       if (selectedUser && showUserModal) {
//         const refreshData = async () => {
//           const token = localStorage.getItem("access_token");

//           // Refresh bookings
//           try {
//             const bookingsResponse = await fetch(
//               `${BASE_URL}/admin/passenger/${selectedUser.user_id}`,
//               {
//                 method: "GET",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${token}`,
//                 },
//               }
//             );

//             if (bookingsResponse.ok) {
//               const bookingsData = await bookingsResponse.json();
//               setUserBookings(bookingsData);
//               console.log("✅ Bookings data refreshed");
//             }
//           } catch (error) {
//             console.error("Error refreshing bookings:", error);
//           }

//           // Refresh transactions
//           try {
//             const transactionsResponse = await fetch(
//               `${BASE_URL}/admin/${selectedUser.user_id}/transaction_history`,
//               {
//                 method: "GET",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${token}`,
//                 },
//               }
//             );

//             if (transactionsResponse.ok) {
//               const transactionsData = await transactionsResponse.json();
//               const transformedData = {
//                 summary: {
//                   total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0
//                 },
//                 outbound_payments: transactionsData.data || []
//               };
//               setUserTransactions(transformedData);
//               console.log("✅ Transactions data refreshed");
//             }
//           } catch (error) {
//             console.error("Error refreshing transactions:", error);
//           }
//         };

//         refreshData();
//       }
//     };

//     window.addEventListener("refresh_bookings_list", refreshBookingsData);
//     window.addEventListener("refresh_booking_detail", refreshBookingsData);
//     window.addEventListener("refresh_current_booking", refreshBookingsData);
//     window.addEventListener("refresh_history", refreshBookingsData);

//     return () => {
//       window.removeEventListener("refresh_bookings_list", refreshBookingsData);
//       window.removeEventListener("refresh_booking_detail", refreshBookingsData);
//       window.removeEventListener("refresh_current_booking", refreshBookingsData);
//       window.removeEventListener("refresh_history", refreshBookingsData);
//     };
//   }, [selectedUser, showUserModal, BASE_URL]);

//   if (initialLoad || loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//           <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="All App Users" />
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="relative">
//                 <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-200 border-t-gray-800"></div>
//               </div>
//               <p className="text-gray-500 mt-4 font-medium">Loading users...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const handleViewUserDetails = async (user) => {
//     setSelectedUser(user);
//     setShowUserModal(true);
//     setTransactionsLoading(true);
//     setBookingLoading(true);
//     setBookingError(null);
//     setActiveTab("transactions");

//     try {
//       const token = localStorage.getItem("access_token");

//       try {
//         const transactionsResponse = await fetch(
//           `${BASE_URL}/admin/${user.user_id}/transaction_history`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (transactionsResponse.ok) {
//           const transactionsData = await transactionsResponse.json();
//           const transformedData = {
//             summary: {
//               total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0
//             },
//             outbound_payments: transactionsData.data || []
//           };
//           setUserTransactions(transformedData);
//         } else {
//           console.error("Transactions API failed:", transactionsResponse.status);
//           setUserTransactions(null);
//         }
//       } catch (error) {
//         console.error("Error fetching transactions:", error);
//         setUserTransactions(null);
//       } finally {
//         setTransactionsLoading(false);
//       }

//       try {
//         const bookingsResponse = await fetch(
//           `${BASE_URL}/admin/passenger/${user.user_id}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (bookingsResponse.ok) {
//           const bookingsData = await bookingsResponse.json();
//           setUserBookings(bookingsData);

//           if (bookingsData.profile?.avatar) {
//             setSelectedUser(prev => ({
//               ...prev,
//               avatar: bookingsData.profile.avatar,
//               full_name: bookingsData.profile.full_name
//             }));
//           }
//         } else {
//           console.warn("Bookings API returned status:", bookingsResponse.status);
//           setBookingError(`Bookings API Error: ${bookingsResponse.status}`);
//           setUserBookings(null);
//         }
//       } catch (error) {
//         console.error("Error fetching bookings:", error);
//         setBookingError(error.message);
//         setUserBookings(null);
//       } finally {
//         setBookingLoading(false);
//       }
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//       setTransactionsLoading(false);
//       setBookingLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch (error) {
//       return "Invalid Date";
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2
//     }).format(amount || 0);
//   };

//   const getBookingStatusBadge = (status) => {
//     switch (status?.toLowerCase()) {
//       case "booked":
//         return "bg-emerald-50 text-emerald-700 border border-emerald-200";
//       case "cancelled":
//         return "bg-rose-50 text-rose-700 border border-rose-200";
//       case "completed":
//         return "bg-sky-50 text-sky-700 border border-sky-200";
//       default:
//         return "bg-gray-50 text-gray-700 border border-gray-200";
//     }
//   };

//   const getPaymentStatusBadge = (status) => {
//     switch (status?.toLowerCase()) {
//       case "paid":
//         return "bg-emerald-50 text-emerald-700 border border-emerald-200";
//       case "refunded":
//         return "bg-purple-50 text-purple-700 border border-purple-200";
//       case "failed":
//         return "bg-rose-50 text-rose-700 border border-rose-200";
//       default:
//         return "bg-gray-50 text-gray-700 border border-gray-200";
//     }
//   };

//   const getAvatarUrl = (avatarPath) => {
//     if (!avatarPath) return null;
//     if (avatarPath.startsWith('http')) return avatarPath;
//     const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
//     return `${BASE_URL}/${cleanPath}`;
//   };

//   const filteredUsers = users.filter(
//     (user) =>
//       user.name.toLowerCase().includes(search.toLowerCase()) ||
//       user.email.toLowerCase().includes(search.toLowerCase())
//   );

//   // Calculate enhanced stats using new fields
//   const totalUsers = users.length;
//   const activeUsers = users.filter(u => u.is_active).length;
//   const totalBookingsAcrossUsers = users.reduce((sum, u) => sum + u.total_trips_booked, 0);
//   const totalTravellerProfiles = users.reduce((sum, u) => sum + (u.traveller_profile_count || 0), 0);
//   const totalBookingSessions = users.reduce((sum, u) => sum + (u.booking_session_count || 0), 0);
//   const totalActiveSessions = users.reduce((sum, u) => sum + (u.active_booking_session_count || 0), 0);

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//       <Sidebar onClose={() => setSidebarOpen(false)} />
      
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//         <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="All App Users" />

//         <div className="flex-1 overflow-auto p-4 sm:p-6">
//           {/* Header Section */}
//           <div className="mb-6 sm:mb-8">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//                   All App Users
//                 </h1>
//                 <p className="text-sm text-gray-500 mt-1">Manage and view all registered users with enhanced analytics</p>
//               </div>
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search by name or email..."
//                   className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent w-full sm:w-64 text-sm"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//                 <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Enhanced Stats Grid with 6 cards for new metrics */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
//                   <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-full flex items-center justify-center">
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm text-gray-500">Active Users</p>
//                   <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{activeUsers}</p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-full flex items-center justify-center">
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm text-gray-500">Total Bookings</p>
//                   <p className="text-2xl sm:text-3xl font-bold text-sky-600 mt-1">{totalBookingsAcrossUsers}</p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-50 rounded-full flex items-center justify-center">
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
            
//             {/* New Enhanced Stats Cards */}
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm text-gray-500">Traveller Profiles</p>
//                   <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">{totalTravellerProfiles}</p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-full flex items-center justify-center">
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">Avg {(totalTravellerProfiles / totalUsers).toFixed(1)} per user</p>
//             </div>
            
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm text-gray-500">Booking Sessions</p>
//                   <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{totalBookingSessions}</p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 rounded-full flex items-center justify-center">
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">{(totalBookingSessions / totalBookingsAcrossUsers).toFixed(1)} sessions/booking</p>
//             </div>
            
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs sm:text-sm text-gray-500">Active Sessions</p>
//                   <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1">{totalActiveSessions}</p>
//                 </div>
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-50 rounded-full flex items-center justify-center">
//                   <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-400 mt-2">Currently in progress</p>
//             </div>
//           </div>

//           {/* Users Table */}
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-[800px] lg:min-w-full divide-y divide-gray-100">
//                 <thead className="bg-gray-50/50">
//                   <tr>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Traveller Profiles</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Sessions</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filteredUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{user.id}</td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2 sm:gap-3">
//                           <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
//                             {user.name.charAt(0).toUpperCase()}
//                           </div>
//                           <span className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{user.name}</span>
//                         </div>
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 break-all max-w-[150px] sm:max-w-none">
//                         {user.email}
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{formatDate(user.joined_at)}</td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
//                         <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
//                           {user.total_trips_booked} trips
//                         </span>
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
//                         <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
//                           {user.traveller_profile_count}
//                         </span>
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
//                         <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
//                           {user.active_booking_session_count}
//                         </span>
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
//                         <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
//                           {user.status}
//                         </span>
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
//                         <button
//                           onClick={() => handleViewUserDetails(user)}
//                           className="px-2 sm:px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {filteredUsers.length === 0 && (
//                 <div className="text-center py-8 sm:py-12">
//                   <div className="text-gray-400">
//                     <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <p className="text-sm">No users found</p>
//                     <p className="text-xs mt-1">Try adjusting your search</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Old Stats Cards Section Removed - Now using enhanced grid above */}
//         </div>
//       </div>

//       {/* User Details Modal - Responsive with enhanced data display */}
//       {showUserModal && selectedUser && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowUserModal(false)}>
//           <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-[90%] max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
//             {/* Modal Header with enhanced user info */}
//             <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
//               <div className="flex items-center gap-3 sm:gap-4">
//                 {selectedUser?.avatar ? (
//                   <img
//                     src={getAvatarUrl(selectedUser.avatar)}
//                     alt={selectedUser?.full_name || selectedUser?.name}
//                     className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-3 border-white shadow-lg cursor-pointer hover:opacity-90 transition"
//                     onClick={() => setShowAvatarModal(true)}
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6366f1&color=fff&rounded=true&size=56`;
//                     }}
//                   />
//                 ) : (
//                   <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-lg">
//                     {(selectedUser?.full_name?.charAt(0) || selectedUser?.name?.charAt(0) || 'U').toUpperCase()}
//                   </div>
//                 )}
//                 <div>
//                   <h3 className="text-base sm:text-xl font-bold text-gray-900">User Details</h3>
//                   <p className="text-xs sm:text-sm text-gray-500 mt-0.5 break-all">{selectedUser?.full_name || selectedUser?.name} • {selectedUser?.email}</p>
//                   <div className="flex gap-2 mt-1">
//                     <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedUser.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
//                       {selectedUser.is_active ? "Active" : "Inactive"}
//                     </span>
//                     <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
//                       {selectedUser.total_trips_booked || 0} total trips
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
//                 className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl transition-all duration-200 hover:rotate-90"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* User Stats Cards in Modal - New enhanced section */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50/30 border-b border-gray-100 flex-shrink-0">
//               <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
//                 <p className="text-[10px] sm:text-xs text-gray-500">Traveller Profiles</p>
//                 <p className="text-base sm:text-lg font-bold text-purple-600">{selectedUser.traveller_profile_count || 0}</p>
//               </div>
//               <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
//                 <p className="text-[10px] sm:text-xs text-gray-500">Booking Sessions</p>
//                 <p className="text-base sm:text-lg font-bold text-amber-600">{selectedUser.booking_session_count || 0}</p>
//               </div>
//               <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
//                 <p className="text-[10px] sm:text-xs text-gray-500">Active Sessions</p>
//                 <p className="text-base sm:text-lg font-bold text-rose-600">{selectedUser.active_booking_session_count || 0}</p>
//               </div>
//               <div className="bg-white rounded-lg p-2 sm:p-3 text-center shadow-sm">
//                 <p className="text-[10px] sm:text-xs text-gray-500">Joined Date</p>
//                 <p className="text-[11px] sm:text-sm font-medium text-gray-700">{formatDate(selectedUser.joined_at)}</p>
//               </div>
//             </div>

//             {/* Tab Navigation */}
//             <div className="flex border-b border-gray-100 px-4 sm:px-6 bg-gray-50/30 flex-shrink-0">
//               <button
//                 onClick={() => setActiveTab("transactions")}
//                 className={`px-3 sm:px-5 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-all duration-200 relative ${activeTab === "transactions" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 💰 Transactions
//                 {activeTab === "transactions" && (
//                   <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
//                 )}
//               </button>
//               <button
//                 onClick={() => setActiveTab("bookings")}
//                 className={`px-3 sm:px-5 py-2 sm:py-3 font-medium text-xs sm:text-sm transition-all duration-200 relative ${activeTab === "bookings" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 📅 Bookings {bookingError && "⚠️"}
//                 {activeTab === "bookings" && (
//                   <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
//                 )}
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50/30">
//               {(transactionsLoading || bookingLoading) && (
//                 <div className="flex items-center justify-center h-48 sm:h-64">
//                   <div className="text-center">
//                     <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-3 border-gray-200 border-t-gray-800"></div>
//                     <p className="text-gray-500 mt-3 sm:mt-4 font-medium text-sm sm:text-base">Loading {activeTab}...</p>
//                   </div>
//                 </div>
//               )}

//               {activeTab === "transactions" && !transactionsLoading && (
//                 <>
//                   {userTransactions ? (
//                     <>
//                       {/* Only Total Spent card - Removed Total Earned */}
//                       <div className="mb-4 sm:mb-6">
//                         <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-4 sm:p-5 border border-rose-100 shadow-sm">
//                           <p className="text-xs sm:text-sm text-rose-600 font-medium">Total Spent</p>
//                           <p className="text-xl sm:text-3xl font-bold text-rose-700 mt-1">{formatCurrency(userTransactions.summary?.total_spent || 0)}</p>
//                         </div>
//                       </div>

//                       <div className="space-y-3 sm:space-y-4">
//                         <div className="flex items-center gap-2 mb-3 sm:mb-4">
//                           <div className="w-1 h-5 sm:h-6 bg-gray-800 rounded-full"></div>
//                           <h4 className="text-sm sm:text-md font-semibold text-gray-800">Transaction History</h4>
//                           <span className="text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{userTransactions.outbound_payments?.length || 0} transactions</span>
//                         </div>

//                         {userTransactions.outbound_payments && userTransactions.outbound_payments.length > 0 ? (
//                           <div className="space-y-3 sm:space-y-4">
//                             {userTransactions.outbound_payments.map((payment, idx) => (
//                               <div key={idx} className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 hover:shadow-lg transition-all duration-300">
//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
//                                   <div className="space-y-2 sm:space-y-3">
//                                     <div className="flex items-center justify-between pb-2 border-b border-gray-50">
//                                       <span className="text-xs text-gray-500 font-medium">Booking ID</span>
//                                       <span className="text-[10px] sm:text-xs font-mono text-gray-700 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded break-all">
//                                         {payment.booking_id || 'N/A'}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Amount</span>
//                                       <span className="text-base sm:text-xl font-bold text-gray-900">
//                                         {formatCurrency(payment.financials?.total_fare || 0)}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Status</span>
//                                       <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getBookingStatusBadge(payment.status)}`}>
//                                         {payment.status?.toUpperCase() || 'UNKNOWN'}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Date</span>
//                                       <span className="text-[11px] sm:text-sm text-gray-600">{formatDate(payment.timestamp)}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Refund Status</span>
//                                       <span className="text-[10px] sm:text-xs font-medium text-purple-600">
//                                         {payment.refund_info?.is_refunded ? '✓ Refunded' : 'Not Refunded'}
//                                       </span>
//                                     </div>
//                                     {payment.refund_info?.cancelled_at && (
//                                       <div className="flex items-center justify-between">
//                                         <span className="text-xs text-gray-500">Cancelled At</span>
//                                         <span className="text-[10px] sm:text-xs text-gray-500">{formatDate(payment.refund_info.cancelled_at)}</span>
//                                       </div>
//                                     )}
//                                   </div>
//                                   <div className="space-y-2 sm:space-y-3">
//                                     <div className="flex items-center justify-between pb-2 border-b border-gray-50">
//                                       <span className="text-xs text-gray-500 font-medium">Trip Details</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Route</span>
//                                       <span className="text-[11px] sm:text-sm text-gray-700 font-medium break-all text-right">
//                                         {payment.trip_details?.route_name || 'N/A'}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Pickup</span>
//                                       <span className="text-[11px] sm:text-sm text-gray-700 break-all text-right">{payment.trip_details?.pickup?.name || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Dropoff</span>
//                                       <span className="text-[11px] sm:text-sm text-gray-700 break-all text-right">{payment.trip_details?.dropoff?.name || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Driver</span>
//                                       <span className="text-[11px] sm:text-sm text-gray-700 break-all text-right">{payment.trip_details?.driver_name || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Passenger</span>
//                                       <span className="text-[11px] sm:text-sm text-gray-700 break-all text-right">{payment.passenger?.name || 'N/A'}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100">
//                             <p className="text-sm text-gray-500">No transactions found</p>
//                           </div>
//                         )}
//                       </div>
//                     </>
//                   ) : (
//                     <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100">
//                       <p className="text-sm text-gray-500">No transaction data available</p>
//                     </div>
//                   )}
//                 </>
//               )}

//               {activeTab === "bookings" && !bookingLoading && (
//                 <>
//                   {bookingError ? (
//                     <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100">
//                       <p className="text-rose-600 font-semibold mb-2 text-sm">Unable to load bookings</p>
//                       <p className="text-xs text-rose-500">{bookingError}</p>
//                     </div>
//                   ) : userBookings ? (
//                     <>
//                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
//                         <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl p-4 sm:p-5 border border-sky-100">
//                           <p className="text-xs sm:text-sm text-sky-600 font-medium">Total Bookings</p>
//                           <p className="text-xl sm:text-3xl font-bold text-sky-700 mt-1">{userBookings.booking_history?.total_count || 0}</p>
//                         </div>
//                         <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 sm:p-5 border border-emerald-100">
//                           <p className="text-xs sm:text-sm text-emerald-600 font-medium">Active/Booked</p>
//                           <p className="text-xl sm:text-3xl font-bold text-emerald-700 mt-1">{userBookings.booking_history?.bookings?.filter(b => b.status === "booked").length || 0}</p>
//                         </div>
//                         <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-4 sm:p-5 border border-rose-100">
//                           <p className="text-xs sm:text-sm text-rose-600 font-medium">Cancelled</p>
//                           <p className="text-xl sm:text-3xl font-bold text-rose-700 mt-1">{userBookings.booking_history?.bookings?.filter(b => b.status === "cancelled").length || 0}</p>
//                         </div>
//                       </div>

//                       <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//                         <div className="overflow-x-auto">
//                           <table className="min-w-[600px] w-full text-xs sm:text-sm">
//                             <thead className="bg-gray-50/50">
//                               <tr className="border-b border-gray-100">
//                                 <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500">Status</th>
//                                 <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500">Fare</th>
//                                 <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500">Pickup Stop</th>
//                                 <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500">Dropoff Stop</th>
//                                 <th className="px-3 sm:px-5 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-500">Date</th>
//                               </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                               {userBookings.booking_history?.bookings?.map((booking) => (
//                                 <tr key={booking.booking_id} className="hover:bg-gray-50/50 transition-all duration-200">
//                                   <td className="px-3 sm:px-5 py-2 sm:py-3">
//                                     <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getBookingStatusBadge(booking.status)}`}>
//                                       {booking.status?.toUpperCase() || 'UNKNOWN'}
//                                     </span>
//                                   </td>
//                                   <td className="px-3 sm:px-5 py-2 sm:py-3 font-semibold text-gray-900 text-xs sm:text-sm">{formatCurrency(booking.fare)}</td>
//                                   <td className="px-3 sm:px-5 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm break-all max-w-[150px]">{booking.pickup_stop?.name || 'N/A'}</td>
//                                   <td className="px-3 sm:px-5 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm break-all max-w-[150px]">{booking.dropoff_stop?.name || 'N/A'}</td>
//                                   <td className="px-3 sm:px-5 py-2 sm:py-3 text-gray-500 text-[10px] sm:text-xs">{formatDate(booking.created_at)}</td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <div className="text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100">
//                       <p className="text-sm text-gray-500">No booking data available</p>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* Modal Footer */}
//             <div className="flex justify-end p-4 sm:p-5 border-t border-gray-100 bg-gray-50/30 flex-shrink-0">
//               <button
//                 onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
//                 className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {/* Avatar Popup Modal - Responsive */}
//       {showAvatarModal && selectedUser?.avatar && (
//         <div
//           className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
//           onClick={() => setShowAvatarModal(false)}
//         >
//           <div className="relative max-w-[90%] max-h-[90%]">
//             <img
//               src={getAvatarUrl(selectedUser.avatar)}
//               alt={selectedUser?.full_name || selectedUser?.name}
//               className="max-w-full max-h-[80vh] sm:max-h-[90vh] rounded-2xl shadow-2xl object-contain"
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6366f1&color=fff&rounded=true&size=200`;
//               }}
//             />
//             <button
//               onClick={() => setShowAvatarModal(false)}
//               className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white rounded-full p-1.5 sm:p-2 hover:bg-gray-100 transition-all duration-200 shadow-lg text-gray-800 hover:rotate-90"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UsersList;
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../assets/components/navbar/TopNavbar";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState(null);
  const [userTransactions, setUserTransactions] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [selectedTraveller, setSelectedTraveller] = useState(null);
  const hasFetched = useRef(false);

  const token = localStorage.getItem("access_token");
  const BASE_URL = "https://be.shuttleapp.transev.site";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.error("No token found");
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      const res = await fetch(
        "https://be.shuttleapp.transev.site/admin/view/all-passengers",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error("API Error:", res.status);
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      const data = await res.json();

      const mappedUsers = data.map((user, idx) => ({
        id: idx + 1,
        user_id: user.user_id,
        name: user.profile?.name || user.profile?.full_name || "Not Set",
        email: user.email,
        is_active: user.is_active,
        joined_at: user.joined_at,
        total_trips_booked: user.total_trips_booked || 0,
        traveller_profile_count: user.traveller_profile_count || 0,
        booking_session_count: user.booking_session_count || 0,
        active_booking_session_count: user.active_booking_session_count || 0,
        status: user.is_active ? "Active" : "Inactive",
        avatar: user.profile?.avatar || null,
        profile: user.profile || {}
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchUsers();
  }, []);

  useEffect(() => {
    const refreshBookingsData = () => {
      if (selectedUser && showUserModal) {
        const refreshData = async () => {
          const token = localStorage.getItem("access_token");

          try {
            const bookingsResponse = await fetch(
              `${BASE_URL}/admin/passenger/${selectedUser.user_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (bookingsResponse.ok) {
              const bookingsData = await bookingsResponse.json();
              setUserDetails(bookingsData);
              setUserBookings(bookingsData);
            }
          } catch (error) {
            console.error("Error refreshing bookings:", error);
          }

          try {
            const transactionsResponse = await fetch(
              `${BASE_URL}/admin/${selectedUser.user_id}/transaction_history`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (transactionsResponse.ok) {
              const transactionsData = await transactionsResponse.json();
              const transformedData = {
                summary: {
                  total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0
                },
                outbound_payments: transactionsData.data || []
              };
              setUserTransactions(transformedData);
            }
          } catch (error) {
            console.error("Error refreshing transactions:", error);
          }
        };

        refreshData();
      }
    };

    window.addEventListener("refresh_bookings_list", refreshBookingsData);
    window.addEventListener("refresh_booking_detail", refreshBookingsData);
    window.addEventListener("refresh_current_booking", refreshBookingsData);
    window.addEventListener("refresh_history", refreshBookingsData);

    return () => {
      window.removeEventListener("refresh_bookings_list", refreshBookingsData);
      window.removeEventListener("refresh_booking_detail", refreshBookingsData);
      window.removeEventListener("refresh_current_booking", refreshBookingsData);
      window.removeEventListener("refresh_history", refreshBookingsData);
    };
  }, [selectedUser, showUserModal, BASE_URL]);

  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
          <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="All App Users" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mb-3"></div>
              <p className="text-gray-500 text-sm">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleViewUserDetails = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setTransactionsLoading(true);
    setBookingLoading(true);
    setBookingError(null);
    setActiveTab("transactions");
    setUserDetails(null);

    try {
      const token = localStorage.getItem("access_token");

      // Fetch transactions
      try {
        const transactionsResponse = await fetch(
          `${BASE_URL}/admin/${user.user_id}/transaction_history`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          const transformedData = {
            summary: {
              total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0
            },
            outbound_payments: transactionsData.data || []
          };
          setUserTransactions(transformedData);
        } else {
          setUserTransactions(null);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setUserTransactions(null);
      } finally {
        setTransactionsLoading(false);
      }

      // Fetch enhanced passenger details
      try {
        const passengerResponse = await fetch(
          `${BASE_URL}/admin/passenger/${user.user_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (passengerResponse.ok) {
          const passengerData = await passengerResponse.json();
          setUserDetails(passengerData);
          setUserBookings(passengerData);

          if (passengerData.profile?.avatar) {
            setSelectedUser(prev => ({
              ...prev,
              avatar: passengerData.profile.avatar,
              full_name: passengerData.profile.full_name
            }));
          }
        } else {
          setBookingError(`Failed to load passenger details: ${passengerResponse.status}`);
          setUserBookings(null);
        }
      } catch (error) {
        console.error("Error fetching passenger details:", error);
        setBookingError(error.message);
        setUserBookings(null);
      } finally {
        setBookingLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setTransactionsLoading(false);
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getBookingStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    const cleanPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
    return `${BASE_URL}/${cleanPath}`;
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const totalBookingsAcrossUsers = users.reduce((sum, u) => sum + u.total_trips_booked, 0);
  const totalTravellerProfiles = users.reduce((sum, u) => sum + (u.traveller_profile_count || 0), 0);
  const totalBookingSessions = users.reduce((sum, u) => sum + (u.booking_session_count || 0), 0);
  const totalActiveSessions = users.reduce((sum, u) => sum + (u.active_booking_session_count || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="All App Users" />

        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all registered users</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Active Users</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{activeUsers}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Total Bookings</p>
              <p className="text-2xl font-semibold text-blue-600 mt-1">{totalBookingsAcrossUsers}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Traveller Profiles</p>
              <p className="text-2xl font-semibold text-purple-600 mt-1">{totalTravellerProfiles}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Booking Sessions</p>
              <p className="text-2xl font-semibold text-amber-600 mt-1">{totalBookingSessions}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase">Active Sessions</p>
              <p className="text-2xl font-semibold text-rose-600 mt-1">{totalActiveSessions}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profiles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(user.joined_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.total_trips_booked}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.traveller_profile_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewUserDetails(user)}
                          className="text-gray-600 hover:text-gray-900 text-sm"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal - Enhanced with new API data */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {selectedUser?.avatar ? (
                  <img
                    src={getAvatarUrl(selectedUser.avatar)}
                    alt={selectedUser?.full_name || selectedUser?.name}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                    onClick={() => setShowAvatarModal(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6B7280&color=fff&rounded=true&size=40`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {(selectedUser?.full_name?.charAt(0) || selectedUser?.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser?.full_name || selectedUser?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setUserDetails(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* Enhanced Passenger Stats - From new API */}
            {userDetails && (
              <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Total Bookings</p>
                  <p className="text-lg font-semibold text-gray-900">{userDetails.booking_history?.total_count || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Sessions</p>
                  <p className="text-lg font-semibold text-gray-900">{userDetails.booking_sessions_summary?.total_sessions || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Payments</p>
                  <p className="text-lg font-semibold text-gray-900">{userDetails.booking_sessions_summary?.total_payments || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Traveller Profiles</p>
                  <p className="text-lg font-semibold text-purple-600">{userDetails.traveller_profiles?.length || 0}</p>
                </div>
              </div>
            )}

            {/* Traveller Profiles Section - New */}
            {userDetails?.traveller_profiles && userDetails.traveller_profiles.length > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Traveller Profiles</h4>
                <div className="flex flex-wrap gap-2">
                  {userDetails.traveller_profiles.map((profile, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTraveller(profile);
                        setShowTravellerModal(true);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
                    >
                      {profile.full_name} ({profile.relationship_label})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "transactions" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "bookings" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                Bookings
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6">
              {(transactionsLoading || bookingLoading) && (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              )}

              {activeTab === "transactions" && !transactionsLoading && (
                <>
                  {userTransactions ? (
                    <>
                      <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-500">Total Spent</p>
                          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(userTransactions.summary?.total_spent || 0)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Transaction History</h4>
                        {userTransactions.outbound_payments && userTransactions.outbound_payments.length > 0 ? (
                          <div className="space-y-3">
                            {userTransactions.outbound_payments.map((payment, idx) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Booking ID</p>
                                    <p className="text-sm font-mono text-gray-900">{payment.booking_id || 'N/A'}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusBadge(payment.status)}`}>
                                    {payment.status?.toUpperCase() || 'UNKNOWN'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(payment.financials?.total_fare || 0)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Date</p>
                                    <p className="text-gray-600">{formatDate(payment.timestamp)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Route</p>
                                    <p className="text-gray-600">{payment.trip_details?.route_name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Driver</p>
                                    <p className="text-gray-600">{payment.trip_details?.driver_name || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-8">No transactions found</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No transaction data available</p>
                  )}
                </>
              )}

              {activeTab === "bookings" && !bookingLoading && (
                <>
                  {bookingError ? (
                    <p className="text-sm text-red-600 text-center py-8">{bookingError}</p>
                  ) : userDetails?.booking_history ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-xl font-semibold text-gray-900">{userDetails.booking_history.total_count || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                          <p className="text-xs text-gray-500">Active</p>
                          <p className="text-xl font-semibold text-green-600">{userDetails.booking_history.bookings?.filter(b => b.status === "booked").length || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-xl font-semibold text-blue-600">{userDetails.booking_history.bookings?.filter(b => b.status === "completed").length || 0}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Booking History</h4>
                        {userDetails.booking_history.bookings && userDetails.booking_history.bookings.length > 0 ? (
                          <div className="space-y-3">
                            {userDetails.booking_history.bookings.map((booking) => (
                              <div key={booking.booking_id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Booking ID</p>
                                    <p className="text-xs font-mono text-gray-900">{booking.booking_id}</p>
                                    <p className="text-xs text-gray-500 mt-1">Session: {booking.booking_session_id}</p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusBadge(booking.status)}`}>
                                    {booking.status?.toUpperCase()}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Traveller</p>
                                    <p className="font-medium text-gray-900">{booking.traveller_name}</p>
                                    <p className="text-xs text-gray-500">{booking.traveller_relationship_label}</p>
                                    {booking.traveller_phone && (
                                      <p className="text-xs text-gray-500">{booking.traveller_phone}</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Seat</p>
                                    <p className="text-sm font-medium text-gray-900">{booking.seat_number || "N/A"}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                  <div>
                                    <p className="text-xs text-gray-500">Pickup</p>
                                    <p className="text-sm text-gray-700">{booking.pickup_stop?.name || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Dropoff</p>
                                    <p className="text-sm text-gray-700">{booking.dropoff_stop?.name || "N/A"}</p>
                                  </div>
                                </div>
                                
                                {booking.actual_drop_stop_name && (
                                  <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                                    <p className="text-blue-600">Actual Dropoff: {booking.actual_drop_stop_name}</p>
                                    {booking.actual_dropped_at && (
                                      <p className="text-blue-500 text-xs mt-1">
                                        Dropped at {formatDateTime(booking.actual_dropped_at)}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                  <div>
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(booking.fare)}</p>
                                  </div>
                                  <p className="text-xs text-gray-500">{formatDate(booking.created_at)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-8">No bookings found</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">No booking data available</p>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setUserDetails(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
                className="px-4 py-1.5 text-sm text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Traveller Profile Details Modal */}
      {showTravellerModal && selectedTraveller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTravellerModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Traveller Profile</h3>
              <button onClick={() => setShowTravellerModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-base font-medium text-gray-900">{selectedTraveller.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Profile ID</p>
                <p className="text-sm font-mono text-gray-600">{selectedTraveller.traveller_profile_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Relationship</p>
                <p className="text-sm text-gray-700">{selectedTraveller.relationship_label}</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowTravellerModal(false)} className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Popup Modal */}
      {showAvatarModal && selectedUser?.avatar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-[90%] max-h-[90%]">
            <img
              src={getAvatarUrl(selectedUser.avatar)}
              alt={selectedUser?.full_name || selectedUser?.name}
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6B7280&color=fff&rounded=true&size=200`;
              }}
            />
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100 transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;