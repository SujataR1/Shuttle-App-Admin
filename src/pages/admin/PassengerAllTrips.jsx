// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import Sidebar from "../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../assets/components/navbar/TopNavbar";
// import {
//   UserGroupIcon,
//   MagnifyingGlassIcon,
//   CalendarIcon,
//   CurrencyRupeeIcon,
//   TruckIcon,
//   MapPinIcon,
//   EnvelopeIcon,
//   PhoneIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   EyeIcon,
//   ChevronRightIcon,
//   ArrowPathIcon,
//   XMarkIcon,
//   FunnelIcon,
//   ChevronDownIcon,
//   StarIcon,
//   UserIcon,
//   CalendarDaysIcon,
//   TicketIcon
// } from "@heroicons/react/24/solid";

// const PassengerAllTrips = () => {
//   const BASE_URL = "https://be.shuttleapp.transev.site/admin";
//   const token = localStorage.getItem("access_token");
//   const axiosConfig = {
//     headers: { Authorization: `Bearer ${token}` }
//   };

//   const [allPassengers, setAllPassengers] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
//   const [groupedBookings, setGroupedBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Advanced Filters
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     status: "all",
//     dateRange: "all",
//     minAmount: "",
//     maxAmount: ""
//   });
//   const [sortBy, setSortBy] = useState("date_desc");

//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const fetchAllPassengers = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/view/all-passengers`, axiosConfig);
//       return response.data || [];
//     } catch (error) {
//       console.error("Error fetching passengers:", error);
//       return [];
//     }
//   };

//   const fetchPassengerBookings = async (passengerId) => {
//     try {
//       const response = await axios.get(`${BASE_URL}/passenger/${passengerId}`, axiosConfig);
//       return response.data?.booking_history?.bookings || [];
//     } catch (error) {
//       console.error(`Error fetching bookings for passenger ${passengerId}:`, error);
//       return [];
//     }
//   };

//   const fetchAllBookings = async () => {
//     setLoading(true);
//     try {
//       const passengers = await fetchAllPassengers();
//       setAllPassengers(passengers);

//       const allBookingsPromises = passengers.map(async (passenger) => {
//         const bookings = await fetchPassengerBookings(passenger.user_id);
//         return bookings.map(booking => ({
//           ...booking,
//           passenger_name: passenger.profile?.full_name || passenger.profile?.name || "N/A",
//           passenger_email: passenger.email,
//           passenger_phone: passenger.profile?.phone || "N/A",
//           passenger_id: passenger.user_id,
//           booking_date: booking.created_at || booking.timestamp || booking.date || new Date().toISOString(),
//           fare_amount: booking.fare || booking.amount || 0
//         }));
//       });

//       const allBookingsArrays = await Promise.all(allBookingsPromises);
//       const flatBookings = allBookingsArrays.flat();
//       const sortedBookings = applySorting(flatBookings);
//       setAllBookings(sortedBookings);
//       groupBookingsByDate(sortedBookings);
//     } catch (error) {
//       console.error("Error fetching all bookings:", error);
//     } finally {
//       setLoading(false);
//       setInitialLoad(false);
//     }
//   };

//   const applySorting = (bookings) => {
//     const sorted = [...bookings];
//     switch (sortBy) {
//       case "date_desc": return sorted.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
//       case "date_asc": return sorted.sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
//       case "amount_desc": return sorted.sort((a, b) => (b.fare_amount || 0) - (a.fare_amount || 0));
//       case "amount_asc": return sorted.sort((a, b) => (a.fare_amount || 0) - (b.fare_amount || 0));
//       case "name_asc": return sorted.sort((a, b) => (a.passenger_name || "").localeCompare(b.passenger_name || ""));
//       default: return sorted;
//     }
//   };

//   const applyFilters = (bookings) => {
//     let filtered = [...bookings];
    
//     if (filters.status !== "all") {
//       filtered = filtered.filter(b => b.status?.toLowerCase() === filters.status.toLowerCase());
//     }
    
//     if (filters.dateRange !== "all") {
//       const now = new Date();
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
//       switch (filters.dateRange) {
//         case "today": filtered = filtered.filter(b => new Date(b.booking_date) >= today); break;
//         case "week": const weekAgo = new Date(now.setDate(now.getDate() - 7)); filtered = filtered.filter(b => new Date(b.booking_date) >= weekAgo); break;
//         case "month": const monthAgo = new Date(now.setMonth(now.getMonth() - 1)); filtered = filtered.filter(b => new Date(b.booking_date) >= monthAgo); break;
//         case "year": const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1)); filtered = filtered.filter(b => new Date(b.booking_date) >= yearAgo); break;
//       }
//     }
    
//     if (filters.minAmount) filtered = filtered.filter(b => (b.fare_amount || 0) >= parseFloat(filters.minAmount));
//     if (filters.maxAmount) filtered = filtered.filter(b => (b.fare_amount || 0) <= parseFloat(filters.maxAmount));
    
//     if (searchTerm) {
//       const lowerSearchTerm = searchTerm.toLowerCase();
//       filtered = filtered.filter(booking =>
//         booking.passenger_name?.toLowerCase().includes(lowerSearchTerm) ||
//         booking.passenger_email?.toLowerCase().includes(lowerSearchTerm) ||
//         booking.booking_id?.toLowerCase().includes(lowerSearchTerm) ||
//         booking.pickup_stop?.name?.toLowerCase().includes(lowerSearchTerm) ||
//         booking.dropoff_stop?.name?.toLowerCase().includes(lowerSearchTerm)
//       );
//     }
    
//     return applySorting(filtered);
//   };

//   const groupBookingsByDate = (bookings) => {
//     const today = new Date(); today.setHours(0, 0, 0, 0);
//     const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    
//     const grouped = { today: [], yesterday: [], older: [] };
    
//     bookings.forEach(booking => {
//       const bookingDate = new Date(booking.booking_date); bookingDate.setHours(0, 0, 0, 0);
//       if (bookingDate.getTime() === today.getTime()) grouped.today.push(booking);
//       else if (bookingDate.getTime() === yesterday.getTime()) grouped.yesterday.push(booking);
//       else grouped.older.push(booking);
//     });
    
//     grouped.today.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
//     grouped.yesterday.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
//     grouped.older.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    
//     const result = [];
//     if (grouped.today.length > 0) result.push({ title: "Today", bookings: grouped.today, icon: "🌟", color: "blue" });
//     if (grouped.yesterday.length > 0) result.push({ title: "Yesterday", bookings: grouped.yesterday, icon: "📅", color: "amber" });
//     if (grouped.older.length > 0) result.push({ title: "Previous Bookings", bookings: grouped.older, icon: "📆", color: "gray" });
    
//     setGroupedBookings(result);
//   };

//   const handleRefresh = async () => { setLoading(true); await fetchAllBookings(); setLoading(false); };
//   const handleViewDetails = (booking) => { setSelectedBooking(booking); setShowDetailsModal(true); };
  
//   const clearFilters = () => {
//     setFilters({ status: "all", dateRange: "all", minAmount: "", maxAmount: "" });
//     setSearchTerm("");
//     setSortBy("date_desc");
//     setShowFilters(false);
//   };

//   useEffect(() => { fetchAllBookings(); }, []);
//   useEffect(() => { if (allBookings.length > 0) groupBookingsByDate(applyFilters(allBookings)); }, [filters, searchTerm, sortBy]);

//   const filteredGroupedBookings = groupedBookings;
//   const totalBookings = allBookings.length;
//   const totalRevenue = allBookings.reduce((sum, b) => sum + (b.fare_amount || 0), 0);
//   const completedBookings = allBookings.filter(b => b.status === "completed").length;
//   const activeFilterCount = Object.values(filters).filter(v => v !== "all" && v !== "").length + (searchTerm ? 1 : 0);

//   if (initialLoad || loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//           <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Passenger All Trips" />
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-indigo-200 border-t-indigo-600 mb-4"></div>
//               <p className="text-slate-600 font-medium">Loading passenger trips...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const getStatusBadge = (status) => {
//     const styles = {
//       completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
//       booked: "bg-amber-50 text-amber-700 border-amber-200", 
//       cancelled: "bg-red-50 text-red-700 border-red-200",
//       in_progress: "bg-blue-50 text-blue-700 border-blue-200"
//     };
//     const style = styles[status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-200";
//     return `px-2.5 py-1 rounded-full text-xs font-medium border ${style}`;
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return "₹0";
//     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "N/A";
//       return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
//     } catch { return "N/A"; }
//   };

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
//       <Sidebar onClose={() => setSidebarOpen(false)} />

//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//         <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Passenger All Trips" />

//         <div className="flex-1 overflow-y-auto">
//           <div className="p-6 md:p-8">
//             {/* Header Section */}
//             <div className="mb-8">
//               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                 <div>
//                   <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Passenger Trips</h1>
//                   <p className="text-sm text-slate-500 mt-1">Complete booking history across all passengers</p>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
//                       showFilters || activeFilterCount > 0
//                         ? "bg-slate-800 text-white shadow-md"
//                         : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
//                     }`}
//                   >
//                     <FunnelIcon className="w-4 h-4" />
//                     Filters
//                     {activeFilterCount > 0 && (
//                       <span className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{activeFilterCount}</span>
//                     )}
//                   </button>
//                   <button
//                     onClick={handleRefresh}
//                     className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-slate-600 rounded-xl font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all"
//                   >
//                     <ArrowPathIcon className="w-4 h-4" />
//                     Refresh
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Stats Grid - Premium Design */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//               <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Bookings</p>
//                     <p className="text-3xl font-bold text-slate-800 mt-1">{totalBookings}</p>
//                   </div>
//                   <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
//                     <TicketIcon className="w-6 h-6 text-indigo-600" />
//                   </div>
//                 </div>
//                 <div className="mt-3 text-xs text-slate-400">All time bookings</div>
//               </div>
              
//               <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Passengers</p>
//                     <p className="text-3xl font-bold text-slate-800 mt-1">{allPassengers.length}</p>
//                   </div>
//                   <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
//                     <UserIcon className="w-6 h-6 text-emerald-600" />
//                   </div>
//                 </div>
//                 <div className="mt-3 text-xs text-slate-400">Unique passengers</div>
//               </div>
              
//               <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</p>
//                     <p className="text-3xl font-bold text-emerald-600 mt-1">{completedBookings}</p>
//                   </div>
//                   <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
//                     <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
//                   </div>
//                 </div>
//                 <div className="mt-3 text-xs text-slate-400">Successfully completed</div>
//               </div>
              
//               <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-md">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
//                     <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
//                   </div>
//                   <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
//                     <CurrencyRupeeIcon className="w-6 h-6 text-white" />
//                   </div>
//                 </div>
//                 <div className="mt-3 text-xs text-slate-400">Gross collection</div>
//               </div>
//             </div>

//             {/* Filters Panel */}
//             {showFilters && (
//               <div className="bg-white rounded-2xl border border-slate-200 shadow-lg mb-6 overflow-hidden">
//                 <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                       <FunnelIcon className="w-5 h-5 text-slate-600" />
//                       <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
//                     </div>
//                     <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-red-500 transition flex items-center gap-1">
//                       <XMarkIcon className="w-3.5 h-3.5" />
//                       Clear all
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//                     <div>
//                       <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Status</label>
//                       <select
//                         value={filters.status}
//                         onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                         className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
//                       >
//                         <option value="all">All Status</option>
//                         <option value="completed">Completed</option>
//                         <option value="booked">Booked</option>
//                         <option value="cancelled">Cancelled</option>
//                         <option value="in_progress">In Progress</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Date Range</label>
//                       <select
//                         value={filters.dateRange}
//                         onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
//                         className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
//                       >
//                         <option value="all">All Time</option>
//                         <option value="today">Today</option>
//                         <option value="week">Last 7 Days</option>
//                         <option value="month">Last 30 Days</option>
//                         <option value="year">Last Year</option>
//                       </select>
//                     </div>
                    
//                     <div>
//                       <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Min Amount</label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
//                         <input
//                           type="number"
//                           placeholder="0"
//                           value={filters.minAmount}
//                           onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
//                           className="w-full pl-7 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
//                         />
//                       </div>
//                     </div>
                    
//                     <div>
//                       <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Max Amount</label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
//                         <input
//                           type="number"
//                           placeholder="Any"
//                           value={filters.maxAmount}
//                           onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
//                           className="w-full pl-7 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="mt-5 pt-4 border-t border-slate-100">
//                     <div className="flex items-center gap-4">
//                       <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sort By:</span>
//                       <select
//                         value={sortBy}
//                         onChange={(e) => setSortBy(e.target.value)}
//                         className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
//                       >
//                         <option value="date_desc">Newest First</option>
//                         <option value="date_asc">Oldest First</option>
//                         <option value="amount_desc">Highest Amount</option>
//                         <option value="amount_asc">Lowest Amount</option>
//                         <option value="name_asc">Passenger Name A-Z</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Search Bar */}
//             <div className="mb-6">
//               <div className="relative max-w-md">
//                 <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by passenger, booking ID, or stop..."
//                   className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Active Filter Chips */}
//             {activeFilterCount > 0 && (
//               <div className="flex flex-wrap gap-2 mb-6">
//                 {filters.status !== "all" && (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
//                     Status: {filters.status}
//                     <button onClick={() => setFilters({ ...filters, status: "all" })} className="hover:text-red-500 ml-1">
//                       <XMarkIcon className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filters.dateRange !== "all" && (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
//                     Date: {filters.dateRange}
//                     <button onClick={() => setFilters({ ...filters, dateRange: "all" })} className="hover:text-red-500 ml-1">
//                       <XMarkIcon className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filters.minAmount && (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
//                     Min: ₹{filters.minAmount}
//                     <button onClick={() => setFilters({ ...filters, minAmount: "" })} className="hover:text-red-500 ml-1">
//                       <XMarkIcon className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {filters.maxAmount && (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
//                     Max: ₹{filters.maxAmount}
//                     <button onClick={() => setFilters({ ...filters, maxAmount: "" })} className="hover:text-red-500 ml-1">
//                       <XMarkIcon className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//                 {searchTerm && (
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
//                     Search: {searchTerm}
//                     <button onClick={() => setSearchTerm("")} className="hover:text-red-500 ml-1">
//                       <XMarkIcon className="w-3 h-3" />
//                     </button>
//                   </span>
//                 )}
//               </div>
//             )}

//             {/* Bookings List */}
//             {filteredGroupedBookings.length === 0 ? (
//               <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
//                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <TicketIcon className="w-10 h-10 text-slate-400" />
//                 </div>
//                 <p className="text-slate-500 font-medium">No bookings found</p>
//                 {activeFilterCount > 0 && (
//                   <button onClick={clearFilters} className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
//                     Clear all filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="space-y-8">
//                 {filteredGroupedBookings.map((group, idx) => (
//                   <div key={idx} className="space-y-4">
//                     {/* Group Header */}
//                     <div className="flex items-center gap-3">
//                       <div className={`w-1 h-8 rounded-full bg-${group.color === 'blue' ? 'blue' : group.color === 'amber' ? 'amber' : 'slate'}-500`} />
//                       <div>
//                         <h2 className="text-lg font-semibold text-slate-800">{group.title}</h2>
//                         <p className="text-xs text-slate-400">{group.bookings.length} bookings</p>
//                       </div>
//                     </div>

//                     {/* Bookings Grid */}
//                     <div className="space-y-3">
//                       {group.bookings.map((booking, index) => (
//                         <div
//                           key={index}
//                           className="group bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
//                           onClick={() => handleViewDetails(booking)}
//                         >
//                           <div className="p-5">
//                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
//                               <div className="flex items-center gap-3">
//                                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
//                                   {booking.passenger_name?.charAt(0).toUpperCase() || "U"}
//                                 </div>
//                                 <div>
//                                   <p className="font-semibold text-slate-800">{booking.passenger_name}</p>
//                                   <div className="flex items-center gap-2 mt-0.5">
//                                     <span className="text-xs text-slate-400 font-mono">{booking.booking_id?.slice(0, 12)}...</span>
//                                     <span className="text-xs text-slate-300">•</span>
//                                     <span className="text-xs text-slate-400">{formatDate(booking.booking_date)}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                               <span className={`${getStatusBadge(booking.status)}`}>
//                                 {booking.status?.toUpperCase() || "UNKNOWN"}
//                               </span>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                               <div className="flex items-start gap-2">
//                                 <MapPinIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
//                                 <div>
//                                   <p className="text-xs text-slate-500">Pickup</p>
//                                   <p className="text-sm text-slate-700">{booking.pickup_stop?.name || "N/A"}</p>
//                                 </div>
//                               </div>
//                               <div className="flex items-start gap-2">
//                                 <MapPinIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//                                 <div>
//                                   <p className="text-xs text-slate-500">Dropoff</p>
//                                   <p className="text-sm text-slate-700">{booking.dropoff_stop?.name || "N/A"}</p>
//                                 </div>
//                               </div>
//                             </div>

//                             {booking.actual_drop_stop_name && booking.actual_drop_stop_name !== booking.dropoff_stop?.name && (
//                               <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
//                                 <div className="flex items-center gap-2 text-xs text-blue-700">
//                                   <span className="text-sm">🔽</span>
//                                   <span className="font-medium">Actual Dropoff:</span>
//                                   <span>{booking.actual_drop_stop_name}</span>
//                                   {booking.actual_dropped_at && (
//                                     <span className="text-slate-500 text-xs">
//                                       at {new Date(booking.actual_dropped_at).toLocaleTimeString()}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             )}

//                             <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-100">
//                               <div className="flex items-center gap-4 text-sm">
//                                 <div className="flex items-center gap-1">
//                                   <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
//                                   <span className="font-bold text-slate-800">{formatCurrency(booking.fare_amount)}</span>
//                                 </div>
//                                 {booking.passenger_email && (
//                                   <div className="flex items-center gap-1 text-slate-500">
//                                     <EnvelopeIcon className="w-3.5 h-3.5" />
//                                     <span className="text-xs truncate max-w-[150px] md:max-w-[200px]">{booking.passenger_email}</span>
//                                   </div>
//                                 )}
//                               </div>
//                               <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
//                                 <EyeIcon className="w-3.5 h-3.5" />
//                                 View Details
//                                 <ChevronRightIcon className="w-3 h-3" />
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Booking Details Modal - Premium Design */}
//       {showDetailsModal && selectedBooking && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            
//             <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center rounded-t-2xl">
//               <div>
//                 <h2 className="text-lg font-bold text-white">Booking Details</h2>
//                 <p className="text-slate-400 text-xs font-mono mt-0.5">{selectedBooking.booking_id}</p>
//               </div>
//               <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
//                 <XMarkIcon className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="overflow-y-auto flex-1 p-6 space-y-5">
//               {/* Passenger Info */}
//               <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 border border-indigo-100">
//                 <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
//                   <UserIcon className="w-4 h-4 text-indigo-600" />
//                   Passenger Information
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div><label className="text-xs text-slate-500">Name</label><p className="text-sm font-medium text-slate-900">{selectedBooking.passenger_name}</p></div>
//                   <div><label className="text-xs text-slate-500">ID</label><p className="text-xs font-mono text-slate-500 break-all">{selectedBooking.passenger_id}</p></div>
//                   <div><label className="text-xs text-slate-500">Email</label><p className="text-sm text-slate-700 break-all">{selectedBooking.passenger_email}</p></div>
//                   <div><label className="text-xs text-slate-500">Phone</label><p className="text-sm text-slate-700">{selectedBooking.passenger_phone}</p></div>
//                 </div>
//               </div>

//               {/* Trip Info */}
//               <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
//                 <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
//                   <TruckIcon className="w-4 h-4 text-blue-600" />
//                   Trip Information
//                 </h3>
//                 <div className="space-y-3">
//                   <div><label className="text-xs text-slate-500">Pickup Stop</label><p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2"><span className="text-green-600">🚏</span>{selectedBooking.pickup_stop?.name || "N/A"}</p></div>
//                   <div><label className="text-xs text-slate-500">Planned Dropoff</label><p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2"><span className="text-red-600">📍</span>{selectedBooking.dropoff_stop?.name || "N/A"}</p></div>
//                   {selectedBooking.actual_drop_stop_name && (
//                     <div className="mt-3 pt-3 border-t border-blue-200">
//                       <label className="text-xs text-blue-600 font-semibold">🔽 Actual Dropoff</label>
//                       <p className="text-sm font-bold text-blue-700 mt-1 flex items-center gap-2"><span className="text-blue-600">📍</span>{selectedBooking.actual_drop_stop_name}</p>
//                       {selectedBooking.actual_dropped_at && <p className="text-xs text-slate-500 mt-1">Time: {new Date(selectedBooking.actual_dropped_at).toLocaleString()}</p>}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Financial Info */}
//               <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100">
//                 <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
//                   <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
//                   Financial Details
//                 </h3>
//                 <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Fare Amount</span><span className="text-xl font-bold text-slate-900">{formatCurrency(selectedBooking.fare_amount)}</span></div>
//                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-emerald-100"><span className="text-sm text-slate-600">Status</span><span className={`${getStatusBadge(selectedBooking.status)}`}>{selectedBooking.status?.toUpperCase()}</span></div>
//               </div>

//               {/* Date Info */}
//               <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-100">
//                 <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm"><CalendarIcon className="w-4 h-4 text-slate-600" />Date Information</h3>
//                 {selectedBooking.booking_date ? (
//                   <>
//                     <div className="flex justify-between"><span className="text-xs text-slate-500">Booking Date</span><span className="text-sm text-slate-700">{formatDate(selectedBooking.booking_date)}</span></div>
//                     <div className="flex justify-between mt-2"><span className="text-xs text-slate-500">Day</span><span className="text-sm text-slate-700">{new Date(selectedBooking.booking_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
//                   </>
//                 ) : <p className="text-slate-500">N/A</p>}
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end rounded-b-2xl">
//               <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition text-sm font-medium">Close</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PassengerAllTrips;
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../assets/components/navbar/TopNavbar";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
  StarIcon,
  UserIcon,
  CalendarDaysIcon,
  TicketIcon,
  BriefcaseIcon
} from "@heroicons/react/24/solid";

const PassengerAllTrips = () => {
  const BASE_URL = "https://be.shuttleapp.transev.site/admin";
  const token = localStorage.getItem("access_token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const [allPassengers, setAllPassengers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
    minAmount: "",
    maxAmount: ""
  });
  const [sortBy, setSortBy] = useState("date_desc");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchAllPassengers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/view/all-passengers`, axiosConfig);
      // The API now returns enhanced passenger data with the structure:
      // {
      //   user_id, email, is_active, joined_at, profile: {name}, 
      //   total_trips_booked, traveller_profile_count, 
      //   booking_session_count, active_booking_session_count
      // }
      return response.data || [];
    } catch (error) {
      console.error("Error fetching passengers:", error);
      return [];
    }
  };

  const fetchPassengerBookings = async (passengerId) => {
    try {
      const response = await axios.get(`${BASE_URL}/passenger/${passengerId}`, axiosConfig);
      return response.data?.booking_history?.bookings || [];
    } catch (error) {
      console.error(`Error fetching bookings for passenger ${passengerId}:`, error);
      return [];
    }
  };

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const passengers = await fetchAllPassengers();
      setAllPassengers(passengers);

      const allBookingsPromises = passengers.map(async (passenger) => {
        const bookings = await fetchPassengerBookings(passenger.user_id);
        return bookings.map(booking => ({
          ...booking,
          // Enhanced passenger data from the new endpoint structure
          passenger_name: passenger.profile?.name || passenger.profile?.full_name || "N/A",
          passenger_email: passenger.email,
          passenger_phone: passenger.profile?.phone || "N/A",
          passenger_id: passenger.user_id,
          passenger_is_active: passenger.is_active,
          passenger_joined_at: passenger.joined_at,
          passenger_total_trips: passenger.total_trips_booked || 0,
          passenger_traveller_profiles: passenger.traveller_profile_count || 0,
          passenger_booking_sessions: passenger.booking_session_count || 0,
          passenger_active_sessions: passenger.active_booking_session_count || 0,
          booking_date: booking.created_at || booking.timestamp || booking.date || new Date().toISOString(),
          fare_amount: booking.fare || booking.amount || 0
        }));
      });

      const allBookingsArrays = await Promise.all(allBookingsPromises);
      const flatBookings = allBookingsArrays.flat();
      const sortedBookings = applySorting(flatBookings);
      setAllBookings(sortedBookings);
      groupBookingsByDate(sortedBookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const applySorting = (bookings) => {
    const sorted = [...bookings];
    switch (sortBy) {
      case "date_desc": return sorted.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
      case "date_asc": return sorted.sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
      case "amount_desc": return sorted.sort((a, b) => (b.fare_amount || 0) - (a.fare_amount || 0));
      case "amount_asc": return sorted.sort((a, b) => (a.fare_amount || 0) - (b.fare_amount || 0));
      case "name_asc": return sorted.sort((a, b) => (a.passenger_name || "").localeCompare(b.passenger_name || ""));
      default: return sorted;
    }
  };

  const applyFilters = (bookings) => {
    let filtered = [...bookings];
    
    if (filters.status !== "all") {
      filtered = filtered.filter(b => b.status?.toLowerCase() === filters.status.toLowerCase());
    }
    
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case "today": filtered = filtered.filter(b => new Date(b.booking_date) >= today); break;
        case "week": const weekAgo = new Date(now.setDate(now.getDate() - 7)); filtered = filtered.filter(b => new Date(b.booking_date) >= weekAgo); break;
        case "month": const monthAgo = new Date(now.setMonth(now.getMonth() - 1)); filtered = filtered.filter(b => new Date(b.booking_date) >= monthAgo); break;
        case "year": const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1)); filtered = filtered.filter(b => new Date(b.booking_date) >= yearAgo); break;
      }
    }
    
    if (filters.minAmount) filtered = filtered.filter(b => (b.fare_amount || 0) >= parseFloat(filters.minAmount));
    if (filters.maxAmount) filtered = filtered.filter(b => (b.fare_amount || 0) <= parseFloat(filters.maxAmount));
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.passenger_name?.toLowerCase().includes(lowerSearchTerm) ||
        booking.passenger_email?.toLowerCase().includes(lowerSearchTerm) ||
        booking.booking_id?.toLowerCase().includes(lowerSearchTerm) ||
        booking.pickup_stop?.name?.toLowerCase().includes(lowerSearchTerm) ||
        booking.dropoff_stop?.name?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return applySorting(filtered);
  };

  const groupBookingsByDate = (bookings) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    
    const grouped = { today: [], yesterday: [], older: [] };
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_date); bookingDate.setHours(0, 0, 0, 0);
      if (bookingDate.getTime() === today.getTime()) grouped.today.push(booking);
      else if (bookingDate.getTime() === yesterday.getTime()) grouped.yesterday.push(booking);
      else grouped.older.push(booking);
    });
    
    grouped.today.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    grouped.yesterday.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    grouped.older.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    
    const result = [];
    if (grouped.today.length > 0) result.push({ title: "Today", bookings: grouped.today, icon: "🌟", color: "blue" });
    if (grouped.yesterday.length > 0) result.push({ title: "Yesterday", bookings: grouped.yesterday, icon: "📅", color: "amber" });
    if (grouped.older.length > 0) result.push({ title: "Previous Bookings", bookings: grouped.older, icon: "📆", color: "gray" });
    
    setGroupedBookings(result);
  };

  const handleRefresh = async () => { setLoading(true); await fetchAllBookings(); setLoading(false); };
  const handleViewDetails = (booking) => { setSelectedBooking(booking); setShowDetailsModal(true); };
  
  const clearFilters = () => {
    setFilters({ status: "all", dateRange: "all", minAmount: "", maxAmount: "" });
    setSearchTerm("");
    setSortBy("date_desc");
    setShowFilters(false);
  };

  useEffect(() => { fetchAllBookings(); }, []);
  useEffect(() => { if (allBookings.length > 0) groupBookingsByDate(applyFilters(allBookings)); }, [filters, searchTerm, sortBy]);

  const filteredGroupedBookings = groupedBookings;
  const totalBookings = allBookings.length;
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.fare_amount || 0), 0);
  const completedBookings = allBookings.filter(b => b.status === "completed").length;
  const activeFilterCount = Object.values(filters).filter(v => v !== "all" && v !== "").length + (searchTerm ? 1 : 0);
  
  // Enhanced stats using new passenger data
  const totalPassengerTrips = allPassengers.reduce((sum, p) => sum + (p.total_trips_booked || 0), 0);
  const totalTravellerProfiles = allPassengers.reduce((sum, p) => sum + (p.traveller_profile_count || 0), 0);
  const totalBookingSessions = allPassengers.reduce((sum, p) => sum + (p.booking_session_count || 0), 0);
  const activePassengers = allPassengers.filter(p => p.is_active === true).length;

  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
          <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Passenger All Trips" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-indigo-200 border-t-indigo-600 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading passenger trips...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      booked: "bg-amber-50 text-amber-700 border-amber-200", 
      cancelled: "bg-red-50 text-red-700 border-red-200",
      in_progress: "bg-blue-50 text-blue-700 border-blue-200"
    };
    const style = styles[status?.toLowerCase()] || "bg-slate-50 text-slate-600 border-slate-200";
    return `px-2.5 py-1 rounded-full text-xs font-medium border ${style}`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return "N/A"; }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      <Sidebar onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Passenger All Trips" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Passenger Trips</h1>
                  <p className="text-sm text-slate-500 mt-1">Complete booking history across all passengers</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      showFilters || activeFilterCount > 0
                        ? "bg-slate-800 text-white shadow-md"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{activeFilterCount}</span>
                    )}
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-slate-600 rounded-xl font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid - Enhanced with new passenger metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Bookings</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{totalBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <TicketIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Across {allPassengers.length} passengers
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Passenger Stats</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{allPassengers.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  {activePassengers} active | {totalPassengerTrips} total trips
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{completedBookings}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  {((completedBookings / totalBookings) * 100).toFixed(1)}% completion rate
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
                    <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Avg. ₹{(totalRevenue / totalBookings).toFixed(0)} per booking
                </div>
              </div>
            </div>

            {/* New Enhanced Passenger Insights Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-sm font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4" />
                  Passenger Engagement Insights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-xl p-3">
                    <p className="text-xs text-indigo-600 font-medium">Traveller Profiles</p>
                    <p className="text-xl font-bold text-slate-800">{totalTravellerProfiles}</p>
                    <p className="text-xs text-slate-500 mt-1">Avg {(totalTravellerProfiles / allPassengers.length).toFixed(1)} per passenger</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3">
                    <p className="text-xs text-indigo-600 font-medium">Booking Sessions</p>
                    <p className="text-xl font-bold text-slate-800">{totalBookingSessions}</p>
                    <p className="text-xs text-slate-500 mt-1">{(totalBookingSessions / totalBookings).toFixed(1)} sessions per booking</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3">
                    <p className="text-xs text-indigo-600 font-medium">Active Sessions</p>
                    <p className="text-xl font-bold text-slate-800">{allPassengers.reduce((sum, p) => sum + (p.active_booking_session_count || 0), 0)}</p>
                    <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg mb-6 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FunnelIcon className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
                    </div>
                    <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-red-500 transition flex items-center gap-1">
                      <XMarkIcon className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="booked">Booked</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="in_progress">In Progress</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last Year</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Min Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={filters.minAmount}
                          onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                          className="w-full pl-7 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">Max Amount</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                          type="number"
                          placeholder="Any"
                          value={filters.maxAmount}
                          onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                          className="w-full pl-7 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Sort By:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
                      >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                        <option value="amount_desc">Highest Amount</option>
                        <option value="amount_asc">Lowest Amount</option>
                        <option value="name_asc">Passenger Name A-Z</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by passenger, booking ID, or stop..."
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.status !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Status: {filters.status}
                    <button onClick={() => setFilters({ ...filters, status: "all" })} className="hover:text-red-500 ml-1">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.dateRange !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Date: {filters.dateRange}
                    <button onClick={() => setFilters({ ...filters, dateRange: "all" })} className="hover:text-red-500 ml-1">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.minAmount && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Min: ₹{filters.minAmount}
                    <button onClick={() => setFilters({ ...filters, minAmount: "" })} className="hover:text-red-500 ml-1">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.maxAmount && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Max: ₹{filters.maxAmount}
                    <button onClick={() => setFilters({ ...filters, maxAmount: "" })} className="hover:text-red-500 ml-1">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="hover:text-red-500 ml-1">
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Bookings List */}
            {filteredGroupedBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TicketIcon className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">No bookings found</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {filteredGroupedBookings.map((group, idx) => (
                  <div key={idx} className="space-y-4">
                    {/* Group Header */}
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full bg-${group.color === 'blue' ? 'blue' : group.color === 'amber' ? 'amber' : 'slate'}-500`} />
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">{group.title}</h2>
                        <p className="text-xs text-slate-400">{group.bookings.length} bookings</p>
                      </div>
                    </div>

                    {/* Bookings Grid */}
                    <div className="space-y-3">
                      {group.bookings.map((booking, index) => (
                        <div
                          key={index}
                          className="group bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <div className="p-5">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                  {booking.passenger_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800">{booking.passenger_name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400 font-mono">{booking.booking_id?.slice(0, 12)}...</span>
                                    <span className="text-xs text-slate-300">•</span>
                                    <span className="text-xs text-slate-400">{formatDate(booking.booking_date)}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`${getStatusBadge(booking.status)}`}>
                                {booking.status?.toUpperCase() || "UNKNOWN"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-slate-500">Pickup</p>
                                  <p className="text-sm text-slate-700">{booking.pickup_stop?.name || "N/A"}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-slate-500">Dropoff</p>
                                  <p className="text-sm text-slate-700">{booking.dropoff_stop?.name || "N/A"}</p>
                                </div>
                              </div>
                            </div>

                            {booking.actual_drop_stop_name && booking.actual_drop_stop_name !== booking.dropoff_stop?.name && (
                              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 text-xs text-blue-700">
                                  <span className="text-sm">🔽</span>
                                  <span className="font-medium">Actual Dropoff:</span>
                                  <span>{booking.actual_drop_stop_name}</span>
                                  {booking.actual_dropped_at && (
                                    <span className="text-slate-500 text-xs">
                                      at {new Date(booking.actual_dropped_at).toLocaleTimeString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
                                  <span className="font-bold text-slate-800">{formatCurrency(booking.fare_amount)}</span>
                                </div>
                                {booking.passenger_email && (
                                  <div className="flex items-center gap-1 text-slate-500">
                                    <EnvelopeIcon className="w-3.5 h-3.5" />
                                    <span className="text-xs truncate max-w-[150px] md:max-w-[200px]">{booking.passenger_email}</span>
                                  </div>
                                )}
                              </div>
                              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                <EyeIcon className="w-3.5 h-3.5" />
                                View Details
                                <ChevronRightIcon className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal - Enhanced with new passenger data */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-white">Booking Details</h2>
                <p className="text-slate-400 text-xs font-mono mt-0.5">{selectedBooking.booking_id}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Passenger Info - Enhanced with new fields */}
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-5 border border-indigo-100">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  Passenger Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-500">Name</label><p className="text-sm font-medium text-slate-900">{selectedBooking.passenger_name}</p></div>
                  <div><label className="text-xs text-slate-500">ID</label><p className="text-xs font-mono text-slate-500 break-all">{selectedBooking.passenger_id}</p></div>
                  <div><label className="text-xs text-slate-500">Email</label><p className="text-sm text-slate-700 break-all">{selectedBooking.passenger_email}</p></div>
                  <div><label className="text-xs text-slate-500">Phone</label><p className="text-sm text-slate-700">{selectedBooking.passenger_phone}</p></div>
                  <div><label className="text-xs text-slate-500">Status</label>
                    <p className="text-sm">
                      {selectedBooking.passenger_is_active ? 
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Active</span> : 
                        <span className="text-red-600 flex items-center gap-1"><XCircleIcon className="w-3 h-3" /> Inactive</span>
                      }
                    </p>
                  </div>
                  <div><label className="text-xs text-slate-500">Joined</label><p className="text-sm text-slate-700">{formatDate(selectedBooking.passenger_joined_at)}</p></div>
                </div>
              </div>

              {/* Passenger Stats - New section from enhanced data */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <BriefcaseIcon className="w-4 h-4 text-blue-600" />
                  Passenger Activity Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Total Trips</p>
                    <p className="text-xl font-bold text-slate-800">{selectedBooking.passenger_total_trips}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Traveller Profiles</p>
                    <p className="text-xl font-bold text-slate-800">{selectedBooking.passenger_traveller_profiles}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Booking Sessions</p>
                    <p className="text-xl font-bold text-slate-800">{selectedBooking.passenger_booking_sessions}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Active Sessions</p>
                    <p className="text-xl font-bold text-slate-800">{selectedBooking.passenger_active_sessions}</p>
                  </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <TruckIcon className="w-4 h-4 text-blue-600" />
                  Trip Information
                </h3>
                <div className="space-y-3">
                  <div><label className="text-xs text-slate-500">Pickup Stop</label><p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2"><span className="text-green-600">🚏</span>{selectedBooking.pickup_stop?.name || "N/A"}</p></div>
                  <div><label className="text-xs text-slate-500">Planned Dropoff</label><p className="text-sm font-medium text-slate-900 mt-1 flex items-center gap-2"><span className="text-red-600">📍</span>{selectedBooking.dropoff_stop?.name || "N/A"}</p></div>
                  {selectedBooking.actual_drop_stop_name && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <label className="text-xs text-blue-600 font-semibold">🔽 Actual Dropoff</label>
                      <p className="text-sm font-bold text-blue-700 mt-1 flex items-center gap-2"><span className="text-blue-600">📍</span>{selectedBooking.actual_drop_stop_name}</p>
                      {selectedBooking.actual_dropped_at && <p className="text-xs text-slate-500 mt-1">Time: {new Date(selectedBooking.actual_dropped_at).toLocaleString()}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-100">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
                  Financial Details
                </h3>
                <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Fare Amount</span><span className="text-xl font-bold text-slate-900">{formatCurrency(selectedBooking.fare_amount)}</span></div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-emerald-100"><span className="text-sm text-slate-600">Status</span><span className={`${getStatusBadge(selectedBooking.status)}`}>{selectedBooking.status?.toUpperCase()}</span></div>
              </div>

              {/* Date Info */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm"><CalendarIcon className="w-4 h-4 text-slate-600" />Date Information</h3>
                {selectedBooking.booking_date ? (
                  <>
                    <div className="flex justify-between"><span className="text-xs text-slate-500">Booking Date</span><span className="text-sm text-slate-700">{formatDate(selectedBooking.booking_date)}</span></div>
                    <div className="flex justify-between mt-2"><span className="text-xs text-slate-500">Day</span><span className="text-sm text-slate-700">{new Date(selectedBooking.booking_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                  </>
                ) : <p className="text-slate-500">N/A</p>}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end rounded-b-2xl">
              <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerAllTrips;