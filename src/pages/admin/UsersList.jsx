
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
//   const hasFetched = useRef(false);

//   const token = localStorage.getItem("access_token");
//   const BASE_URL = "https://be.shuttleapp.transev.site";

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

//       const mappedUsers = data.map((user, idx) => ({
//         id: idx + 1,
//         user_id: user.user_id,
//         name: user.profile?.name || user.profile?.full_name || "Not Set",
//         email: user.email,
//         is_active: user.is_active,
//         joined_at: user.joined_at,
//         total_trips_booked: user.total_trips_booked || 0,
//         status: user.is_active ? "Active" : "Inactive",
//         avatar: user.profile?.avatar || null,
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

//   if (initialLoad || loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Sidebar />
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <TopNavbar />
//           <div className="flex items-center justify-center h-full">
//             <div className="text-center">
//               <div className="relative">
//                 <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-800"></div>
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
//               total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0,
//               total_earned: 0
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

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar />

//         <div className="flex-1 overflow-auto p-6">
//           {/* Header Section */}
//           <div className="mb-8">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//                   All App Users
//                 </h1>
//                 <p className="text-gray-500 mt-1">Manage and view all registered users</p>
//               </div>
//               <div className="mt-4 sm:mt-0">
//                 <div className="relative">
//                   <input
//                     type="text"
//                     placeholder="Search by name or email..."
//                     className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent w-64 transition-all duration-200"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                   <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Users Table */}
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-100">
//                 <thead className="bg-gray-50/50">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filteredUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
//                             {user.name.charAt(0).toUpperCase()}
//                           </div>
//                           <span className="font-medium text-gray-900">{user.name}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.joined_at)}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
//                           {user.total_trips_booked} trips
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
//                           {user.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <button
//                           onClick={() => handleViewUserDetails(user)}
//                           className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow"
//                         >
//                           View Details
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {filteredUsers.length === 0 && (
//                 <div className="text-center py-12">
//                   <div className="text-gray-400">
//                     <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <p className="text-sm">No users found</p>
//                     <p className="text-xs mt-1">Try adjusting your search</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Users</p>
//                   <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
//                   <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Active Users</p>
//                   <p className="text-3xl font-bold text-emerald-600 mt-1">{users.filter(u => u.is_active).length}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
//                   <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Bookings</p>
//                   <p className="text-3xl font-bold text-sky-600 mt-1">{users.reduce((sum, u) => sum + u.total_trips_booked, 0)}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center">
//                   <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* User Details Modal */}
//       {showUserModal && selectedUser && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowUserModal(false)}>
//           <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//               <div className="flex items-center gap-4">
//                 {selectedUser?.avatar ? (
//                   <img
//                     src={getAvatarUrl(selectedUser.avatar)}
//                     alt={selectedUser?.full_name || selectedUser?.name}
//                     className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg cursor-pointer hover:opacity-90 transition"
//                     onClick={() => setShowAvatarModal(true)}
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6366f1&color=fff&rounded=true&size=56`;
//                     }}
//                   />
//                 ) : (
//                   <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xl shadow-lg">
//                     {(selectedUser?.full_name?.charAt(0) || selectedUser?.name?.charAt(0) || 'U').toUpperCase()}
//                   </div>
//                 )}
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">User Details</h3>
//                   <p className="text-sm text-gray-500 mt-0.5">{selectedUser?.full_name || selectedUser?.name} • {selectedUser?.email}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
//                 className="text-gray-400 hover:text-gray-600 text-2xl transition-all duration-200 hover:rotate-90"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Tab Navigation */}
//             <div className="flex border-b border-gray-100 px-6 bg-gray-50/30">
//               <button
//                 onClick={() => setActiveTab("transactions")}
//                 className={`px-5 py-3 font-medium text-sm transition-all duration-200 relative ${activeTab === "transactions" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 💰 Transactions
//                 {activeTab === "transactions" && (
//                   <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
//                 )}
//               </button>
//               <button
//                 onClick={() => setActiveTab("bookings")}
//                 className={`px-5 py-3 font-medium text-sm transition-all duration-200 relative ${activeTab === "bookings" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 📅 Bookings {bookingError && "⚠️"}
//                 {activeTab === "bookings" && (
//                   <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
//                 )}
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
//               {(transactionsLoading || bookingLoading) && (
//                 <div className="flex items-center justify-center h-64">
//                   <div className="text-center">
//                     <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-gray-800"></div>
//                     <p className="text-gray-500 mt-4 font-medium">Loading {activeTab}...</p>
//                   </div>
//                 </div>
//               )}

//               {activeTab === "transactions" && !transactionsLoading && (
//                 <>
//                   {userTransactions ? (
//                     <>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                         <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-5 border border-rose-100 shadow-sm">
//                           <p className="text-sm text-rose-600 font-medium">Total Spent</p>
//                           <p className="text-3xl font-bold text-rose-700 mt-1">{formatCurrency(userTransactions.summary?.total_spent || 0)}</p>
//                         </div>
//                         <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100 shadow-sm">
//                           <p className="text-sm text-emerald-600 font-medium">Total Earned</p>
//                           <p className="text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(userTransactions.summary?.total_earned || 0)}</p>
//                         </div>
//                       </div>

//                       <div className="space-y-4">
//                         <div className="flex items-center gap-2 mb-4">
//                           <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
//                           <h4 className="text-md font-semibold text-gray-800">Transaction History</h4>
//                           <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{userTransactions.outbound_payments?.length || 0} transactions</span>
//                         </div>

//                         {userTransactions.outbound_payments && userTransactions.outbound_payments.length > 0 ? (
//                           <div className="space-y-4">
//                             {userTransactions.outbound_payments.map((payment, idx) => (
//                               <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                                   <div className="space-y-3">
//                                     <div className="flex items-center justify-between pb-2 border-b border-gray-50">
//                                       <span className="text-xs text-gray-500 font-medium">Transaction ID</span>
//                                       <span className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">{payment.transaction_id || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Amount</span>
//                                       <span className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Status</span>
//                                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(payment.status)}`}>
//                                         {payment.status?.toUpperCase() || 'UNKNOWN'}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Date</span>
//                                       <span className="text-sm text-gray-600">{formatDate(payment.timestamp || payment.date)}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Booking ID</span>
//                                       <span className="text-xs font-mono text-gray-500">{payment.booking_id?.substring(0, 13)}...</span>
//                                     </div>
//                                   </div>
//                                   <div className="space-y-3">
//                                     <div className="flex items-center justify-between pb-2 border-b border-gray-50">
//                                       <span className="text-xs text-gray-500 font-medium">Trip Details</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Pickup Stop</span>
//                                       <span className="text-sm text-gray-700 font-medium">{payment.trip_details?.pickup?.name || payment.trip_details?.pickup_stop || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Dropoff Stop</span>
//                                       <span className="text-sm text-gray-700 font-medium">{payment.trip_details?.dropoff?.name || payment.trip_details?.dropoff_stop || 'N/A'}</span>
//                                     </div>
//                                     <div className="flex items-center justify-between">
//                                       <span className="text-xs text-gray-500">Route</span>
//                                       <span className="text-sm text-gray-700">{payment.trip_details?.route_name || 'N/A'}</span>
//                                     </div>
//                                     {userBookings?.booking_history?.bookings && (() => {
//                                       const matchedBooking = userBookings.booking_history.bookings.find(b => b.booking_id === payment.booking_id);
//                                       if (matchedBooking) {
//                                         return (
//                                           <>
//                                             <div className="flex items-center justify-between">
//                                               <span className="text-xs text-gray-500">Commission</span>
//                                               <span className="text-sm text-gray-700">{matchedBooking.financials?.commission_percent || 0}%</span>
//                                             </div>
//                                             <div className="flex items-center justify-between">
//                                               <span className="text-xs text-gray-500">Admin Earned</span>
//                                               <span className="text-sm text-gray-700">{formatCurrency(matchedBooking.financials?.admin_earned)}</span>
//                                             </div>
//                                             <div className="flex items-center justify-between">
//                                               <span className="text-xs text-gray-500">Driver Payout</span>
//                                               <span className="text-sm font-semibold text-emerald-600">{formatCurrency(matchedBooking.financials?.driver_payout)}</span>
//                                             </div>
//                                             <div className="flex items-center justify-between">
//                                               {/* <span className="text-xs text-gray-500">Audit</span>
//                                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${matchedBooking.financials?.audit_passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
//                                                 {matchedBooking.financials?.audit_passed ? 'Passed' : 'Failed'}
//                                               </span> */}
//                                             </div>
//                                           </>
//                                         );
//                                       }
//                                       return null;
//                                     })()}
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
//                             <p className="text-gray-500">No transactions found</p>
//                           </div>
//                         )}
//                       </div>
//                     </>
//                   ) : (
//                     <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
//                       <p className="text-gray-500">No transaction data available</p>
//                     </div>
//                   )}
//                 </>
//               )}

//               {activeTab === "bookings" && !bookingLoading && (
//                 <>
//                   {bookingError ? (
//                     <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
//                       <p className="text-rose-600 font-semibold mb-2">Unable to load bookings</p>
//                       <p className="text-sm text-rose-500">{bookingError}</p>
//                     </div>
//                   ) : userBookings ? (
//                     <>
//                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//                         <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl p-5 border border-sky-100">
//                           <p className="text-sm text-sky-600 font-medium">Total Bookings</p>
//                           <p className="text-3xl font-bold text-sky-700 mt-1">{userBookings.booking_history?.total_count || 0}</p>
//                         </div>
//                         <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100">
//                           <p className="text-sm text-emerald-600 font-medium">Active/Booked</p>
//                           <p className="text-3xl font-bold text-emerald-700 mt-1">{userBookings.booking_history?.bookings?.filter(b => b.status === "booked").length || 0}</p>
//                         </div>
//                         <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-5 border border-rose-100">
//                           <p className="text-sm text-rose-600 font-medium">Cancelled</p>
//                           <p className="text-3xl font-bold text-rose-700 mt-1">{userBookings.booking_history?.bookings?.filter(b => b.status === "cancelled").length || 0}</p>
//                         </div>
//                       </div>

//                       <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
//                         <div className="overflow-x-auto">
//                           <table className="w-full text-sm">
//                             <thead className="bg-gray-50/50">
//                               <tr className="border-b border-gray-100">
//                                 <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
//                                 <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Fare</th>
//                                 <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Pickup Stop</th>
//                                 <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Dropoff Stop</th>
//                                 <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
//                               </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                               {userBookings.booking_history?.bookings?.map((booking) => (
//                                 <tr key={booking.booking_id} className="hover:bg-gray-50/50 transition-all duration-200">
//                                   <td className="px-5 py-3">
//                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusBadge(booking.status)}`}>
//                                       {booking.status?.toUpperCase() || 'UNKNOWN'}
//                                     </span>
//                                   </td>
//                                   <td className="px-5 py-3 font-semibold text-gray-900">{formatCurrency(booking.fare)}</td>
//                                   <td className="px-5 py-3 text-gray-600">{booking.pickup_stop?.name || 'N/A'}</td>
//                                   <td className="px-5 py-3 text-gray-600">{booking.dropoff_stop?.name || 'N/A'}</td>
//                                   <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(booking.created_at)}</td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
//                       <p className="text-gray-500">No booking data available</p>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             {/* Modal Footer */}
//             <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50/30">
//               <button
//                 onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
//                 className="px-5 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Avatar Popup Modal */}
//       {showAvatarModal && selectedUser?.avatar && (
//         <div
//           className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
//           onClick={() => setShowAvatarModal(false)}
//         >
//           <div className="relative max-w-[90%] max-h-[90%]">
//             <img
//               src={getAvatarUrl(selectedUser.avatar)}
//               alt={selectedUser?.full_name || selectedUser?.name}
//               className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6366f1&color=fff&rounded=true&size=200`;
//               }}
//             />
//             <button
//               onClick={() => setShowAvatarModal(false)}
//               className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-all duration-200 shadow-lg text-gray-800 hover:rotate-90"
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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const hasFetched = useRef(false);

  const token = localStorage.getItem("access_token");
  const BASE_URL = "https://be.shuttleapp.transev.site";

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
        status: user.is_active ? "Active" : "Inactive",
        avatar: user.profile?.avatar || null,
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

  // 🔔 WebSocket refresh event listener
  useEffect(() => {
    const refreshBookingsData = () => {
      console.log("🔄 Real-time refresh: Updating bookings data...");
      if (selectedUser && showUserModal) {
        const refreshData = async () => {
          const token = localStorage.getItem("access_token");

          // Refresh bookings
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
              setUserBookings(bookingsData);
              console.log("✅ Bookings data refreshed");
            }
          } catch (error) {
            console.error("Error refreshing bookings:", error);
          }

          // Refresh transactions
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
                  total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0,
                  total_earned: 0
                },
                outbound_payments: transactionsData.data || []
              };
              setUserTransactions(transformedData);
              console.log("✅ Transactions data refreshed");
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
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-800"></div>
              </div>
              <p className="text-gray-500 mt-4 font-medium">Loading users...</p>
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

    try {
      const token = localStorage.getItem("access_token");

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
              total_spent: transactionsData.data?.reduce((sum, item) => sum + (item.financials?.total_fare || 0), 0) || 0,
              total_earned: 0
            },
            outbound_payments: transactionsData.data || []
          };
          setUserTransactions(transformedData);
        } else {
          console.error("Transactions API failed:", transactionsResponse.status);
          setUserTransactions(null);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setUserTransactions(null);
      } finally {
        setTransactionsLoading(false);
      }

      try {
        const bookingsResponse = await fetch(
          `${BASE_URL}/admin/passenger/${user.user_id}`,
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
          setUserBookings(bookingsData);

          if (bookingsData.profile?.avatar) {
            setSelectedUser(prev => ({
              ...prev,
              avatar: bookingsData.profile.avatar,
              full_name: bookingsData.profile.full_name
            }));
          }
        } else {
          console.warn("Bookings API returned status:", bookingsResponse.status);
          setBookingError(`Bookings API Error: ${bookingsResponse.status}`);
          setUserBookings(null);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
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
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const getBookingStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "completed":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "refunded":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "failed":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <div className="flex-1 overflow-auto p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  All App Users
                </h1>
                <p className="text-gray-500 mt-1">Manage and view all registered users</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent w-64 transition-all duration-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.joined_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          {user.total_trips_booked} trips
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewUserDetails(user)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{users.filter(u => u.is_active).length}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-sky-600 mt-1">{users.reduce((sum, u) => sum + u.total_trips_booked, 0)}</p>
                </div>
                <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                {selectedUser?.avatar ? (
                  <img
                    src={getAvatarUrl(selectedUser.avatar)}
                    alt={selectedUser?.full_name || selectedUser?.name}
                    className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg cursor-pointer hover:opacity-90 transition"
                    onClick={() => setShowAvatarModal(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6366f1&color=fff&rounded=true&size=56`;
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {(selectedUser?.full_name?.charAt(0) || selectedUser?.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedUser?.full_name || selectedUser?.name} • {selectedUser?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-all duration-200 hover:rotate-90"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 px-6 bg-gray-50/30">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-5 py-3 font-medium text-sm transition-all duration-200 relative ${activeTab === "transactions" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                💰 Transactions
                {activeTab === "transactions" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-5 py-3 font-medium text-sm transition-all duration-200 relative ${activeTab === "bookings" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                📅 Bookings {bookingError && "⚠️"}
                {activeTab === "bookings" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
              {(transactionsLoading || bookingLoading) && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-gray-800"></div>
                    <p className="text-gray-500 mt-4 font-medium">Loading {activeTab}...</p>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && !transactionsLoading && (
                <>
                  {userTransactions ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-5 border border-rose-100 shadow-sm">
                          <p className="text-sm text-rose-600 font-medium">Total Spent</p>
                          <p className="text-3xl font-bold text-rose-700 mt-1">{formatCurrency(userTransactions.summary?.total_spent || 0)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100 shadow-sm">
                          <p className="text-sm text-emerald-600 font-medium">Total Earned</p>
                          <p className="text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(userTransactions.summary?.total_earned || 0)}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 bg-gray-800 rounded-full"></div>
                          <h4 className="text-md font-semibold text-gray-800">Transaction History</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{userTransactions.outbound_payments?.length || 0} transactions</span>
                        </div>

                        {userTransactions.outbound_payments && userTransactions.outbound_payments.length > 0 ? (
                          <div className="space-y-4">

                            {userTransactions.outbound_payments.map((payment, idx) => (
                              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                                      <span className="text-xs text-gray-500 font-medium">Booking ID</span>
                                      <span className="text-xs font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                                        {payment.booking_id || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Amount</span>
                                      <span className="text-xl font-bold text-gray-900">
                                        {formatCurrency(payment.financials?.total_fare || 0)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Status</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusBadge(payment.status)}`}>
                                        {payment.status?.toUpperCase() || 'UNKNOWN'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Date</span>
                                      <span className="text-sm text-gray-600">{formatDate(payment.timestamp)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Refund Status</span>
                                      <span className="text-xs font-medium text-purple-600">
                                        {payment.refund_info?.is_refunded ? '✓ Refunded' : 'Not Refunded'}
                                      </span>
                                    </div>
                                    {payment.refund_info?.cancelled_at && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Cancelled At</span>
                                        <span className="text-xs text-gray-500">{formatDate(payment.refund_info.cancelled_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                                      <span className="text-xs text-gray-500 font-medium">Trip Details</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Route</span>
                                      <span className="text-sm text-gray-700 font-medium">
                                        {payment.trip_details?.route_name || 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Pickup</span>
                                      <span className="text-sm text-gray-700">{payment.trip_details?.pickup?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Dropoff</span>
                                      <span className="text-sm text-gray-700">{payment.trip_details?.dropoff?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Driver</span>
                                      <span className="text-sm text-gray-700">{payment.trip_details?.driver_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Passenger</span>
                                      <span className="text-sm text-gray-700">{payment.passenger?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Payment Gateway</span>
                                      <span className="text-xs font-mono text-gray-500">
                                        {payment.payment_gateway?.[0]?.razorpay_payment_id?.substring(0, 10) || 'N/A'}...
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <p className="text-gray-500">No transactions found</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                      <p className="text-gray-500">No transaction data available</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "bookings" && !bookingLoading && (
                <>
                  {bookingError ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                      <p className="text-rose-600 font-semibold mb-2">Unable to load bookings</p>
                      <p className="text-sm text-rose-500">{bookingError}</p>
                    </div>
                  ) : userBookings ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-sky-50 to-white rounded-xl p-5 border border-sky-100">
                          <p className="text-sm text-sky-600 font-medium">Total Bookings</p>
                          <p className="text-3xl font-bold text-sky-700 mt-1">{userBookings.booking_history?.total_count || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100">
                          <p className="text-sm text-emerald-600 font-medium">Active/Booked</p>
                          <p className="text-3xl font-bold text-emerald-700 mt-1">{userBookings.booking_history?.bookings?.filter(b => b.status === "booked").length || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-5 border border-rose-100">
                          <p className="text-sm text-rose-600 font-medium">Cancelled</p>
                          <p className="text-3xl font-bold text-rose-700 mt-1">{userBookings.booking_history?.bookings?.filter(b => b.status === "cancelled").length || 0}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50/50">
                              <tr className="border-b border-gray-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Fare</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Pickup Stop</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Dropoff Stop</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {userBookings.booking_history?.bookings?.map((booking) => (
                                <tr key={booking.booking_id} className="hover:bg-gray-50/50 transition-all duration-200">
                                  <td className="px-5 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBookingStatusBadge(booking.status)}`}>
                                      {booking.status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 font-semibold text-gray-900">{formatCurrency(booking.fare)}</td>
                                  <td className="px-5 py-3 text-gray-600">{booking.pickup_stop?.name || 'N/A'}</td>
                                  <td className="px-5 py-3 text-gray-600">{booking.dropoff_stop?.name || 'N/A'}</td>
                                  <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(booking.created_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                      <p className="text-gray-500">No booking data available</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50/30">
              <button
                onClick={() => { setShowUserModal(false); setUserBookings(null); setUserTransactions(null); setSelectedUser(null); setActiveTab("transactions"); setBookingError(null); }}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Popup Modal */}
      {showAvatarModal && selectedUser?.avatar && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-[90%] max-h-[90%]">
            <img
              src={getAvatarUrl(selectedUser.avatar)}
              alt={selectedUser?.full_name || selectedUser?.name}
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser?.full_name || selectedUser?.name || 'User')}&background=6366f1&color=fff&rounded=true&size=200`;
              }}
            />
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-all duration-200 shadow-lg text-gray-800 hover:rotate-90"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;