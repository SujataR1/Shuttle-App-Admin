// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import {
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from 'recharts';
// import Sidebar from "../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../assets/components/navbar/TopNavbar"; // Changed from TopNavbarUltra to TopNavbar

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [error, setError] = useState(null);
//   const [dateRange, setDateRange] = useState("week");
//   const intervalRef = useRef(null);
  
//   const [dashboardData, setDashboardData] = useState({
//     stats: {
//       totalDrivers: 0,
//       activeVehicles: 0,
//       totalBookings: 0,
//       pendingVerifications: 0,
//       pendingBusVerifications: 0,
//       pendingKycVerifications: 0,
//       activeTrips: 0,
//       monthlyRevenue: 0,
//       totalRevenue: 0,
//       completionRate: 0,
//       avgBookingValue: 0,
//     },
//     recentBookings: [],
//     topStops: [],
//     topRoutes: [],
//     bookingTrends: [],
//     revenueTrends: [],
//     statusDistribution: [],
//     recentDrivers: [],
//     pendingTickets: 0,
//     tripStats: {
//       scheduled: 0,
//       inProgress: 0,
//       completed: 0,
//       cancelled: 0,
//     },
//     activeTripsList: [],
//     pendingBusDrivers: [],
//     pendingKycDrivers: [],
//     hourlyBookings: [],
//   });

//   const token = localStorage.getItem("access_token");
//   const API_BASE = "https://be.shuttleapp.transev.site/admin";

//   const axiosConfig = {
//     headers: { 
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json"
//     },
//   };

//   // Check if mobile view
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Toggle sidebar function
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const processDriversForVerifications = (drivers) => {
//     const pendingBusDrivers = drivers.filter(
//       (d) => d.bus_details && d.bus_details.vehicle_id && d.bus_details.status !== "verified"
//     );
//     const pendingKycDrivers = drivers.filter(
//       (d) => d.profile && d.profile.verification !== "verified"
//     );
//     return { pendingBusDrivers, pendingKycDrivers };
//   };

//   const calculateActiveVehicles = (drivers) => {
//     return drivers.filter((d) => d.bus_details && d.bus_details.status === "verified").length;
//   };

//   const fetchDashboardData = useCallback(async () => {
//     if (!dashboardData.stats.totalDrivers) setLoading(true);
//     setError(null);

//     try {
//       if (!token) {
//         setError("Authentication token not found. Please login again.");
//         setLoading(false);
//         return;
//       }

//       const [driversRes, tripsRes, transactionsRes] = await Promise.all([
//         axios.get(`${API_BASE}/view/all-drivers`, axiosConfig).catch(() => ({ data: [] })),
//         axios.get(`${API_BASE}/trips/monitor`, axiosConfig).catch(() => ({ data: [] })),
//         axios.get(`${API_BASE}/transactions/all`, axiosConfig).catch(() => ({ data: { data: [] } })),
//       ]);

//       let drivers = Array.isArray(driversRes.data) ? driversRes.data : [];
//       const pendingDrivers = drivers.filter((d) => d.profile?.verification === "pending" || d.profile?.verification === "N/A");
//       const { pendingBusDrivers, pendingKycDrivers } = processDriversForVerifications(drivers);
//       const activeVehicles = calculateActiveVehicles(drivers);

//       let trips = Array.isArray(tripsRes.data) ? tripsRes.data : [];
//       const scheduledTrips = trips.filter((t) => t.status === "scheduled").length;
//       const inProgressTrips = trips.filter((t) => t.status === "in_progress").length;
//       const completedTrips = trips.filter((t) => t.status === "completed").length;
//       const cancelledTrips = trips.filter((t) => t.status === "cancelled").length;
//       const activeTripsList = trips.filter((t) => t.status === "in_progress");

//       let transactionsData = transactionsRes.data;
//       let allBookings = [];
//       if (Array.isArray(transactionsData)) {
//         allBookings = transactionsData;
//       } else if (transactionsData && Array.isArray(transactionsData.data)) {
//         allBookings = transactionsData.data;
//       }
      
//       const totalBookings = allBookings.length;
//       const completedBookings = allBookings.filter(b => b.status === "completed");
//       const completionRate = totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0;
//       const avgBookingValue = completedBookings.length > 0 
//         ? completedBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0) / completedBookings.length 
//         : 0;

//       const currentMonth = new Date().getMonth();
//       const currentYear = new Date().getFullYear();
//       const monthlyBookings = allBookings.filter((b) => {
//         const date = new Date(b.timestamp);
//         return date.getMonth() === currentMonth && date.getFullYear() === currentYear && b.status === "completed";
//       });
//       const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0);

//       const completedRevenueBookings = allBookings.filter(
//         (t) => t.status === "completed" && t.financials?.total_fare
//       );
//       const totalRevenue = completedRevenueBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0);

//       const statusDistribution = [
//         { name: "Completed", value: completedTrips, color: "#10b981" },
//         { name: "In Progress", value: inProgressTrips, color: "#f59e0b" },
//         { name: "Scheduled", value: scheduledTrips, color: "#3b82f6" },
//         { name: "Cancelled", value: cancelledTrips, color: "#ef4444" },
//       ].filter(s => s.value > 0);

//       const recentBookings = [...allBookings]
//         .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
//         .slice(0, 6)
//         .map((b) => ({
//           id: b.booking_id?.slice(0, 8),
//           amount: b.financials?.total_fare || 0,
//           status: b.status,
//           created_at: b.timestamp,
//           user: b.passenger?.name || "N/A",
//           pickup: b.trip_details?.pickup?.name || b.trip_details?.pickup || "N/A",
//           dropoff: b.trip_details?.dropoff?.name || b.trip_details?.dropoff || "N/A",
//         }));

//       const stopCounts = {};
//       allBookings.forEach((b) => {
//         const pickupName = b.trip_details?.pickup?.name;
//         if (pickupName) stopCounts[pickupName] = (stopCounts[pickupName] || 0) + 1;
//       });
//       const topStops = Object.entries(stopCounts)
//         .map(([stop_name, booking_count]) => ({ stop_name, booking_count }))
//         .sort((a, b) => b.booking_count - a.booking_count)
//         .slice(0, 5);

//       const routeCounts = {};
//       allBookings.forEach((b) => {
//         const routeName = b.trip_details?.route_name;
//         if (routeName) routeCounts[routeName] = (routeCounts[routeName] || 0) + 1;
//       });
//       const topRoutes = Object.entries(routeCounts)
//         .map(([route_name, total_bookings]) => ({ route_name, total_bookings }))
//         .sort((a, b) => b.total_bookings - a.total_bookings)
//         .slice(0, 5);

//       const last30Days = Array.from({ length: 30 }, (_, i) => {
//         const date = new Date();
//         date.setDate(date.getDate() - i);
//         return date.toISOString().split("T")[0];
//       }).reverse();

//       const bookingTrends = last30Days.map((date) => ({
//         date: date.slice(5),
//         bookings: allBookings.filter((b) => b.timestamp?.split("T")[0] === date).length,
//         revenue: allBookings
//           .filter((b) => b.timestamp?.split("T")[0] === date && b.status === "completed")
//           .reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0),
//       }));

//       const monthlyRevenueMap = {};
//       allBookings.forEach((b) => {
//         if (b.status === "completed" && b.financials?.total_fare) {
//           const date = new Date(b.timestamp);
//           const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
//           monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + b.financials.total_fare;
//         }
//       });
//       const revenueTrends = Object.entries(monthlyRevenueMap)
//         .slice(-6)
//         .map(([month, revenue]) => ({ month, revenue }));

//       const hourlyMap = {};
//       allBookings.forEach((b) => {
//         const hour = new Date(b.timestamp).getHours();
//         hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
//       });
//       const hourlyBookings = Array.from({ length: 24 }, (_, i) => ({
//         hour: `${i}:00`,
//         bookings: hourlyMap[i] || 0,
//       }));

//       const recentDrivers = [...drivers]
//         .sort((a, b) => new Date(b.profile?.profile_verification_req_date || 0) - new Date(a.profile?.profile_verification_req_date || 0))
//         .slice(0, 6)
//         .map((d) => ({
//           id: d.user_id,
//           name: d.profile?.name || "N/A",
//           email: d.email,
//           status: d.profile?.verification || "pending",
//           phone: d.profile?.phone || "N/A",
//           busStatus: d.bus_details?.status || "N/A",
//         }));

//       setDashboardData({
//         stats: {
//           totalDrivers: drivers.length,
//           activeVehicles: activeVehicles,
//           totalBookings: totalBookings,
//           pendingVerifications: pendingDrivers.length,
//           pendingBusVerifications: pendingBusDrivers.length,
//           pendingKycVerifications: pendingKycDrivers.length,
//           activeTrips: inProgressTrips,
//           monthlyRevenue: monthlyRevenue,
//           totalRevenue: totalRevenue,
//           completionRate: completionRate,
//           avgBookingValue: avgBookingValue,
//         },
//         recentBookings,
//         topStops,
//         topRoutes,
//         bookingTrends,
//         revenueTrends,
//         statusDistribution,
//         recentDrivers,
//         pendingTickets: 0,
//         tripStats: { scheduled: scheduledTrips, inProgress: inProgressTrips, completed: completedTrips, cancelled: cancelledTrips },
//         activeTripsList,
//         pendingBusDrivers,
//         pendingKycDrivers,
//         hourlyBookings,
//       });
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//       setError("Failed to load dashboard data. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchDashboardData();
//     intervalRef.current = setInterval(() => fetchDashboardData(), 30000);
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [fetchDashboardData]);

//   const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//           <TopNavbar 
//             title="Dashboard" 
//             onMenuClick={toggleSidebar} 
//             isMobile={isMobile} 
//           />
//           <div className="flex-1 flex items-center justify-center p-4">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//               <p className="text-gray-400">Loading dashboard...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//           <TopNavbar 
//             title="Dashboard" 
//             onMenuClick={toggleSidebar} 
//             isMobile={isMobile} 
//           />
//           <div className="flex-1 flex items-center justify-center p-4">
//             <div className="text-center bg-gray-800 rounded-xl p-8 shadow-lg max-w-md border border-gray-700">
//               <div className="text-red-500 text-5xl mb-4">⚠️</div>
//               <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
//               <p className="text-gray-400 mb-4">{error}</p>
//               <button 
//                 onClick={() => window.location.reload()}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
//       <Sidebar onClose={() => setSidebarOpen(false)} />
      
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//         <TopNavbar 
//           title="Dashboard" 
//           onMenuClick={toggleSidebar} 
//           isMobile={isMobile} 
//         />
        
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-6 space-y-6">
//             {/* Header with date filter */}
//             <div className="flex justify-between items-center">
//               <div>
//                 <h1 className="text-3xl font-bold text-white">Dashboard</h1>
//                 <p className="text-gray-400 mt-1">Real-time analytics & insights</p>
//               </div>
//               <select 
//                 value={dateRange} 
//                 onChange={(e) => setDateRange(e.target.value)}
//                 className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600"
//               >
//                 <option value="week">Last 7 Days</option>
//                 <option value="month">Last 30 Days</option>
//                 <option value="year">Last Year</option>
//               </select>
//             </div>

//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition">
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-gray-400 text-sm">Total Revenue</span>
//                   <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
//                     <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <p className="text-3xl font-bold text-white">₹{dashboardData.stats.totalRevenue.toFixed(2)}</p>
//                 <p className="text-xs text-green-400 mt-2">↑ +12.5% from last month</p>
//               </div>

//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition">
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-gray-400 text-sm">Total Bookings</span>
//                   <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
//                     <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                   </div>
//                 </div>
//                 <p className="text-3xl font-bold text-white">{dashboardData.stats.totalBookings}</p>
//                 <p className="text-xs text-gray-400 mt-2">Completion rate: {dashboardData.stats.completionRate.toFixed(1)}%</p>
//               </div>

//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition">
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-gray-400 text-sm">Active Drivers</span>
//                   <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
//                     <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <p className="text-3xl font-bold text-white">{dashboardData.stats.activeVehicles}</p>
//                 <p className="text-xs text-gray-400 mt-2">Out of {dashboardData.stats.totalDrivers} total</p>
//               </div>

//               <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5">
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-indigo-200 text-sm">Avg. Booking Value</span>
//                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
//                     <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <p className="text-3xl font-bold text-white">₹{dashboardData.stats.avgBookingValue.toFixed(2)}</p>
//                 <p className="text-xs text-indigo-200 mt-2">Per completed booking</p>
//               </div>
//             </div>

//             {/* Rest of your dashboard content remains the same */}
//             {/* Charts Row 1 */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <h3 className="text-white font-semibold">Booking & Revenue Trends</h3>
//                     <p className="text-xs text-gray-500 mt-1">Last 30 days performance</p>
//                   </div>
//                 </div>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={dashboardData.bookingTrends.slice(-14)}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                     <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
//                     <YAxis yAxisId="left" stroke="#9ca3af" fontSize={10} />
//                     <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={10} />
//                     <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
//                     <Legend />
//                     <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} name="Bookings" />
//                     <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue (₹)" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <h3 className="text-white font-semibold">Trip Status Distribution</h3>
//                     <p className="text-xs text-gray-500 mt-1">Current trip breakdown</p>
//                   </div>
//                 </div>
//                 <ResponsiveContainer width="100%" height={280}>
//                   <PieChart>
//                     <Pie
//                       data={dashboardData.statusDistribution}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       paddingAngle={5}
//                       dataKey="value"
//                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                       labelLine={false}
//                     >
//                       {dashboardData.statusDistribution.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div className="flex justify-center gap-4 mt-2 flex-wrap">
//                   {dashboardData.statusDistribution.map((item, idx) => (
//                     <div key={idx} className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
//                       <span className="text-xs text-gray-400">{item.name}: {item.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Charts Row 2 */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <h3 className="text-white font-semibold">Hourly Booking Distribution</h3>
//                     <p className="text-xs text-gray-500 mt-1">Peak hours analysis</p>
//                   </div>
//                 </div>
//                 <ResponsiveContainer width="100%" height={280}>
//                   <BarChart data={dashboardData.hourlyBookings}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                     <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} interval={3} />
//                     <YAxis stroke="#9ca3af" fontSize={10} />
//                     <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
//                     <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
//                 <div className="flex justify-between items-center mb-4">
//                   <div>
//                     <h3 className="text-white font-semibold">Monthly Revenue</h3>
//                     <p className="text-xs text-gray-500 mt-1">Last 6 months performance</p>
//                   </div>
//                 </div>
//                 <ResponsiveContainer width="100%" height={280}>
//                   <BarChart data={dashboardData.revenueTrends}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                     <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} />
//                     <YAxis stroke="#9ca3af" fontSize={10} />
//                     <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
//                     <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* Top Routes & Stops */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
//                     <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                     </svg>
//                   </div>
//                   <h3 className="text-white font-semibold">Most Booked Routes</h3>
//                 </div>
//                 <div className="space-y-3">
//                   {dashboardData.topRoutes.map((route, index) => {
//                     const maxRoute = dashboardData.topRoutes[0]?.total_bookings || 1;
//                     const percentage = (route.total_bookings / maxRoute) * 100;
//                     return (
//                       <div key={index}>
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-gray-300">{route.route_name}</span>
//                           <span className="text-gray-400">{route.total_bookings} bookings</span>
//                         </div>
//                         <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
//                           <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
//                     <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                     </svg>
//                   </div>
//                   <h3 className="text-white font-semibold">Top Pickup Locations</h3>
//                 </div>
//                 <div className="space-y-3">
//                   {dashboardData.topStops.map((stop, index) => {
//                     const maxStop = dashboardData.topStops[0]?.booking_count || 1;
//                     const percentage = (stop.booking_count / maxStop) * 100;
//                     return (
//                       <div key={index}>
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-gray-300">{stop.stop_name}</span>
//                           <span className="text-gray-400">{stop.booking_count} pickups</span>
//                         </div>
//                         <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
//                           <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Recent Activity */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
//                 <div className="px-5 py-4 border-b border-gray-700">
//                   <h3 className="text-white font-semibold">Recent Bookings</h3>
//                   <p className="text-xs text-gray-500 mt-1">Latest transactions</p>
//                 </div>
//                 <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
//                   {dashboardData.recentBookings.map((booking, idx) => (
//                     <div key={idx} className="p-4 hover:bg-gray-700/30 transition">
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <p className="text-white text-sm font-medium">{booking.user}</p>
//                           <p className="text-xs text-gray-500 mt-0.5">{booking.pickup} → {booking.dropoff}</p>
//                           <p className="text-xs text-gray-600 mt-1">{new Date(booking.created_at).toLocaleString()}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-green-400 font-semibold">₹{booking.amount}</p>
//                           <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
//                             booking.status === "completed" ? "bg-green-500/20 text-green-400" :
//                             booking.status === "booked" ? "bg-blue-500/20 text-blue-400" :
//                             "bg-red-500/20 text-red-400"
//                           }`}>
//                             {booking.status}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
//                 <div className="px-5 py-4 border-b border-gray-700">
//                   <h3 className="text-white font-semibold">Recent Drivers</h3>
//                   <p className="text-xs text-gray-500 mt-1">Latest registrations</p>
//                 </div>
//                 <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
//                   {dashboardData.recentDrivers.map((driver, idx) => (
//                     <div key={idx} className="p-4 hover:bg-gray-700/30 transition">
//                       <div className="flex justify-between items-center">
//                         <div className="flex items-center gap-3">
//                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
//                             {driver.name.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <p className="text-white text-sm font-medium">{driver.name}</p>
//                             <p className="text-xs text-gray-500">{driver.email}</p>
//                           </div>
//                         </div>
//                         <div className="flex gap-1">
//                           <span className={`px-2 py-0.5 rounded text-xs ${
//                             driver.status === "verified" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
//                           }`}>
//                             {driver.status}
//                           </span>
//                           <span className={`px-2 py-0.5 rounded text-xs ${
//                             driver.busStatus === "verified" ? "bg-green-500/20 text-green-400" : "bg-gray-600 text-gray-400"
//                           }`}>
//                             {driver.busStatus}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Sidebar from "../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../assets/components/navbar/TopNavbar";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("week");
  const intervalRef = useRef(null);
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalDrivers: 0,
      activeVehicles: 0,
      totalBookings: 0,
      pendingVerifications: 0,
      pendingBusVerifications: 0,
      pendingKycVerifications: 0,
      activeTrips: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
      completionRate: 0,
      avgBookingValue: 0,
    },
    recentBookings: [],
    topStops: [],
    topRoutes: [],
    bookingTrends: [],
    revenueTrends: [],
    statusDistribution: [],
    recentDrivers: [],
    pendingTickets: 0,
    tripStats: {
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    },
    activeTripsList: [],
    pendingBusDrivers: [],
    pendingKycDrivers: [],
    hourlyBookings: [],
  });

  const token = localStorage.getItem("access_token");
  const API_BASE = "https://be.shuttleapp.transev.site/admin";

  const axiosConfig = {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  };

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const processDriversForVerifications = (drivers) => {
    const pendingBusDrivers = drivers.filter(
      (d) => d.bus_details && d.bus_details.vehicle_id && d.bus_details.status !== "verified"
    );
    const pendingKycDrivers = drivers.filter(
      (d) => d.profile && d.profile.verification !== "verified"
    );
    return { pendingBusDrivers, pendingKycDrivers };
  };

  const calculateActiveVehicles = (drivers) => {
    return drivers.filter((d) => d.bus_details && d.bus_details.status === "verified").length;
  };

  const fetchDashboardData = useCallback(async () => {
    if (!dashboardData.stats.totalDrivers) setLoading(true);
    setError(null);

    try {
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const [driversRes, tripsRes, transactionsRes] = await Promise.all([
        axios.get(`${API_BASE}/view/all-drivers`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/trips/monitor`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/transactions/all`, axiosConfig).catch(() => ({ data: { data: [] } })),
      ]);

      let drivers = Array.isArray(driversRes.data) ? driversRes.data : [];
      const pendingDrivers = drivers.filter((d) => d.profile?.verification === "pending" || d.profile?.verification === "N/A");
      const { pendingBusDrivers, pendingKycDrivers } = processDriversForVerifications(drivers);
      const activeVehicles = calculateActiveVehicles(drivers);

      let trips = Array.isArray(tripsRes.data) ? tripsRes.data : [];
      const scheduledTrips = trips.filter((t) => t.status === "scheduled").length;
      const inProgressTrips = trips.filter((t) => t.status === "in_progress").length;
      const completedTrips = trips.filter((t) => t.status === "completed").length;
      const cancelledTrips = trips.filter((t) => t.status === "cancelled").length;
      const activeTripsList = trips.filter((t) => t.status === "in_progress");

      let transactionsData = transactionsRes.data;
      let allBookings = [];
      if (Array.isArray(transactionsData)) {
        allBookings = transactionsData;
      } else if (transactionsData && Array.isArray(transactionsData.data)) {
        allBookings = transactionsData.data;
      }
      
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter(b => b.status === "completed");
      const completionRate = totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0;
      const avgBookingValue = completedBookings.length > 0 
        ? completedBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0) / completedBookings.length 
        : 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = allBookings.filter((b) => {
        const date = new Date(b.timestamp);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear && b.status === "completed";
      });
      const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0);

      const completedRevenueBookings = allBookings.filter(
        (t) => t.status === "completed" && t.financials?.total_fare
      );
      const totalRevenue = completedRevenueBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0);

      const statusDistribution = [
        { name: "Completed", value: completedTrips, color: "#10b981" },
        { name: "In Progress", value: inProgressTrips, color: "#f59e0b" },
        { name: "Scheduled", value: scheduledTrips, color: "#3b82f6" },
        { name: "Cancelled", value: cancelledTrips, color: "#ef4444" },
      ].filter(s => s.value > 0);

      const recentBookings = [...allBookings]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 6)
        .map((b) => ({
          id: b.booking_id?.slice(0, 8),
          amount: b.financials?.total_fare || 0,
          status: b.status,
          created_at: b.timestamp,
          user: b.passenger?.name || "N/A",
          pickup: b.trip_details?.pickup?.name || b.trip_details?.pickup || "N/A",
          dropoff: b.trip_details?.dropoff?.name || b.trip_details?.dropoff || "N/A",
        }));

      const stopCounts = {};
      allBookings.forEach((b) => {
        const pickupName = b.trip_details?.pickup?.name;
        if (pickupName) stopCounts[pickupName] = (stopCounts[pickupName] || 0) + 1;
      });
      const topStops = Object.entries(stopCounts)
        .map(([stop_name, booking_count]) => ({ stop_name, booking_count }))
        .sort((a, b) => b.booking_count - a.booking_count)
        .slice(0, 5);

      const routeCounts = {};
      allBookings.forEach((b) => {
        const routeName = b.trip_details?.route_name;
        if (routeName) routeCounts[routeName] = (routeCounts[routeName] || 0) + 1;
      });
      const topRoutes = Object.entries(routeCounts)
        .map(([route_name, total_bookings]) => ({ route_name, total_bookings }))
        .sort((a, b) => b.total_bookings - a.total_bookings)
        .slice(0, 5);

      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const bookingTrends = last30Days.map((date) => ({
        date: date.slice(5),
        bookings: allBookings.filter((b) => b.timestamp?.split("T")[0] === date).length,
        revenue: allBookings
          .filter((b) => b.timestamp?.split("T")[0] === date && b.status === "completed")
          .reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0),
      }));

      const monthlyRevenueMap = {};
      allBookings.forEach((b) => {
        if (b.status === "completed" && b.financials?.total_fare) {
          const date = new Date(b.timestamp);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + b.financials.total_fare;
        }
      });
      const revenueTrends = Object.entries(monthlyRevenueMap)
        .slice(-6)
        .map(([month, revenue]) => ({ month, revenue }));

      const hourlyMap = {};
      allBookings.forEach((b) => {
        const hour = new Date(b.timestamp).getHours();
        hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
      });
      const hourlyBookings = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        bookings: hourlyMap[i] || 0,
      }));

      const recentDrivers = [...drivers]
        .sort((a, b) => new Date(b.profile?.profile_verification_req_date || 0) - new Date(a.profile?.profile_verification_req_date || 0))
        .slice(0, 6)
        .map((d) => ({
          id: d.user_id,
          name: d.profile?.name || "N/A",
          email: d.email,
          status: d.profile?.verification || "pending",
          phone: d.profile?.phone || "N/A",
          busStatus: d.bus_details?.status || "N/A",
        }));

      setDashboardData({
        stats: {
          totalDrivers: drivers.length,
          activeVehicles: activeVehicles,
          totalBookings: totalBookings,
          pendingVerifications: pendingDrivers.length,
          pendingBusVerifications: pendingBusDrivers.length,
          pendingKycVerifications: pendingKycDrivers.length,
          activeTrips: inProgressTrips,
          monthlyRevenue: monthlyRevenue,
          totalRevenue: totalRevenue,
          completionRate: completionRate,
          avgBookingValue: avgBookingValue,
        },
        recentBookings,
        topStops,
        topRoutes,
        bookingTrends,
        revenueTrends,
        statusDistribution,
        recentDrivers,
        pendingTickets: 0,
        tripStats: { scheduled: scheduledTrips, inProgress: inProgressTrips, completed: completedTrips, cancelled: cancelledTrips },
        activeTripsList,
        pendingBusDrivers,
        pendingKycDrivers,
        hourlyBookings,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
    intervalRef.current = setInterval(() => fetchDashboardData(), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchDashboardData]);

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 transition-all duration-300">
          <TopNavbar onMenuClick={() => {}} />
          <div className="flex items-center justify-center h-[calc(100vh-73px)]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-slate-400">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64 transition-all duration-300">
          <TopNavbar onMenuClick={() => {}} />
          <div className="flex items-center justify-center h-[calc(100vh-73px)] p-4">
            <div className="text-center bg-slate-800 rounded-xl p-8 shadow-lg max-w-md border border-slate-700">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64 transition-all duration-300">
        <TopNavbar onMenuClick={() => {}} />
        
        <main className="p-6">
          <div className="space-y-6">
            {/* Header with date filter */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-0.5">Real-time analytics & insights</p>
              </div>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-slate-800 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Total Revenue</span>
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">₹{dashboardData.stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-emerald-400 mt-2">↑ +12.5% from last month</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Total Bookings</span>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{dashboardData.stats.totalBookings}</p>
                <p className="text-xs text-slate-400 mt-2">Completion rate: {dashboardData.stats.completionRate.toFixed(1)}%</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Active Drivers</span>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{dashboardData.stats.activeVehicles}</p>
                <p className="text-xs text-slate-400 mt-2">Out of {dashboardData.stats.totalDrivers} total</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-200 text-sm">Avg. Booking Value</span>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">₹{dashboardData.stats.avgBookingValue.toFixed(2)}</p>
                <p className="text-xs text-emerald-200 mt-2">Per completed booking</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Booking & Revenue Trends</h3>
                    <p className="text-xs text-slate-500 mt-1">Last 30 days performance</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.bookingTrends.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} name="Bookings" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Trip Status Distribution</h3>
                    <p className="text-xs text-slate-500 mt-1">Current trip breakdown</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dashboardData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {dashboardData.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {dashboardData.statusDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                      <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Hourly Booking Distribution</h3>
                    <p className="text-xs text-slate-500 mt-1">Peak hours analysis</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashboardData.hourlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} interval={3} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Monthly Revenue</h3>
                    <p className="text-xs text-slate-500 mt-1">Last 6 months performance</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashboardData.revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Routes & Stops */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold">Most Booked Routes</h3>
                </div>
                <div className="space-y-3">
                  {dashboardData.topRoutes.map((route, index) => {
                    const maxRoute = dashboardData.topRoutes[0]?.total_bookings || 1;
                    const percentage = (route.total_bookings / maxRoute) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{route.route_name}</span>
                          <span className="text-slate-400">{route.total_bookings} bookings</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold">Top Pickup Locations</h3>
                </div>
                <div className="space-y-3">
                  {dashboardData.topStops.map((stop, index) => {
                    const maxStop = dashboardData.topStops[0]?.booking_count || 1;
                    const percentage = (stop.booking_count / maxStop) * 100;
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{stop.stop_name}</span>
                          <span className="text-slate-400">{stop.booking_count} pickups</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700">
                  <h3 className="text-white font-semibold">Recent Bookings</h3>
                  <p className="text-xs text-slate-500 mt-1">Latest transactions</p>
                </div>
                <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                  {dashboardData.recentBookings.map((booking, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-700/30 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{booking.user}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{booking.pickup} → {booking.dropoff}</p>
                          <p className="text-xs text-slate-600 mt-1">{new Date(booking.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-semibold">₹{booking.amount}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                            booking.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                            booking.status === "booked" ? "bg-blue-500/20 text-blue-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700">
                  <h3 className="text-white font-semibold">Recent Drivers</h3>
                  <p className="text-xs text-slate-500 mt-1">Latest registrations</p>
                </div>
                <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                  {dashboardData.recentDrivers.map((driver, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-700/30 transition">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {driver.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            driver.status === "verified" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {driver.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            driver.busStatus === "verified" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600 text-slate-400"
                          }`}>
                            {driver.busStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;