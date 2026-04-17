import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../assets/components/navbar/TopNavbar";
import DashboardHeader from "../../assets/components/dashboard/DashboardHeader";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalDrivers: 0,
      activeVehicles: 0,
      totalBookings: 0,
      pendingVerifications: 0,
      activeTrips: 0,
      monthlyRevenue: 0,
    },
    recentBookings: [],
    topStops: [],
    topRoutes: [],
    bookingTrends: [],
    recentDrivers: [],
    pendingTickets: 0,
    tripStats: {
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    },
  });

  const token = localStorage.getItem("access_token");
  const API_BASE = "https://be.shuttleapp.transev.site/admin";

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        driversRes,
        tripsRes,
        transactionsRes,
        topStopsRes,
        topRoutesRes,
        ticketsRes,
        vehiclesRes,
      ] = await Promise.allSettled([
        axios.get(`${API_BASE}/view/all-drivers`, axiosConfig),
        axios.get(`${API_BASE}/trips/monitor`, axiosConfig),
        axios.get(`${API_BASE}/transactions/all`, axiosConfig),
        axios.get(`${API_BASE}/analytics/top-pickup-stops`, axiosConfig),
        axios.get(`${API_BASE}/analytics/most-booked-routes`, axiosConfig),
        axios.get(`${API_BASE}/tickets`, axiosConfig),
        axios.get(`${API_BASE}/available_vehicles`, axiosConfig),
      ]);

      // Process Drivers
      const drivers = driversRes.status === "fulfilled" ? driversRes.value.data : [];
      const verifiedDrivers = drivers.filter(d => d.profile?.verification === "verified");
      const pendingDrivers = drivers.filter(d => d.profile?.verification === "pending");

      // Process Trips
      const trips = tripsRes.status === "fulfilled" ? tripsRes.value.data : [];
      const scheduledTrips = trips.filter(t => t.status === "scheduled").length;
      const inProgressTrips = trips.filter(t => t.status === "in_progress").length;
      const completedTrips = trips.filter(t => t.status === "completed").length;
      const cancelledTrips = trips.filter(t => t.status === "cancelled").length;

      // Process Transactions/Bookings
      const transactions = transactionsRes.status === "fulfilled" ? transactionsRes.value.data : [];
      const bookings = transactions.filter(t => t.status === "booked");
      const totalBookings = bookings.length;
      
      // Calculate monthly revenue from successful bookings
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = bookings.filter(b => {
        const date = new Date(b.timestamp);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.financials?.total_fare || 0), 0);

      // Get recent bookings (last 5)
      const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(b => ({
          id: b.booking_id?.slice(0, 8),
          amount: b.financials?.total_fare || 0,
          status: b.status,
          created_at: b.timestamp,
          user: b.passenger?.name || "N/A",
          pickup: b.trip_details?.pickup?.name || b.trip_details?.pickup,
          dropoff: b.trip_details?.dropoff?.name || b.trip_details?.dropoff,
        }));

      // Process Top Stops
      const topStops = topStopsRes.status === "fulfilled" ? topStopsRes.value.data.slice(0, 5) : [];

      // Process Top Routes
      const topRoutes = topRoutesRes.status === "fulfilled" ? topRoutesRes.value.data.slice(0, 5) : [];

      // Process Tickets
      const tickets = ticketsRes.status === "fulfilled" ? ticketsRes.value.data : [];
      const pendingTickets = tickets.filter(t => t.status === "pending").length;

      // Process Vehicles
      const vehicles = vehiclesRes.status === "fulfilled" ? vehiclesRes.value.vehicles || [] : [];
      const activeVehicles = vehicles.filter(v => v.is_active).length;

      // Calculate booking trends (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const bookingTrends = last7Days.map(date => {
        return bookings.filter(b => b.timestamp?.split('T')[0] === date).length;
      });

      // Get recent drivers (last 5)
      const recentDrivers = [...drivers]
        .sort((a, b) => new Date(b.profile?.profile_verification_req_date || 0) - new Date(a.profile?.profile_verification_req_date || 0))
        .slice(0, 5)
        .map(d => ({
          id: d.user_id,
          name: d.profile?.name || "N/A",
          email: d.email,
          status: d.profile?.verification || "pending",
          phone: d.profile?.phone || "N/A",
        }));

      setDashboardData({
        stats: {
          totalDrivers: drivers.length,
          activeVehicles: activeVehicles,
          totalBookings: totalBookings,
          pendingVerifications: pendingDrivers.length,
          activeTrips: inProgressTrips,
          monthlyRevenue: monthlyRevenue,
        },
        recentBookings,
        topStops,
        topRoutes,
        bookingTrends,
        recentDrivers,
        pendingTickets,
        tripStats: {
          scheduled: scheduledTrips,
          inProgress: inProgressTrips,
          completed: completedTrips,
          cancelled: cancelledTrips,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate max for progress bars
  const maxBookings = Math.max(...dashboardData.bookingTrends, 1);
  const maxStops = dashboardData.topStops[0]?.booking_count || 1;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNavbarUltra />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbarUltra />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Dashboard Header */}
            <DashboardHeader
              title="Admin Dashboard"
              subtitle="Welcome to your admin control panel. Monitor and manage your platform from here."
              stats={dashboardData.stats}
              loading={loading}
            />

            {/* Trip Status Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Scheduled", value: dashboardData.tripStats.scheduled, color: "blue", icon: "⏰" },
                { label: "In Progress", value: dashboardData.tripStats.inProgress, color: "yellow", icon: "🚀" },
                { label: "Completed", value: dashboardData.tripStats.completed, color: "green", icon: "✅" },
                { label: "Cancelled", value: dashboardData.tripStats.cancelled, color: "red", icon: "❌" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-${stat.color}-100 flex items-center justify-center text-xl`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Booking Trends Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Booking Trends</h3>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {dashboardData.bookingTrends.map((count, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const percentage = maxBookings > 0 ? (count / maxBookings) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{dayName}</span>
                        <span className="text-gray-800 font-medium">{count} bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Stops Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Top Pickup Stops</h3>
                  <p className="text-xs text-gray-500">Most popular locations</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                {dashboardData.topStops.map((stop, index) => {
                  const percentage = (stop.booking_count / maxStops) * 100;
                  const colors = [
                    "from-blue-500 to-cyan-500",
                    "from-green-500 to-emerald-500",
                    "from-purple-500 to-pink-500",
                    "from-orange-500 to-red-500",
                    "from-teal-500 to-green-500",
                  ];
                  return (
                    <div key={stop.stop_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                          <span className="text-gray-700 font-medium">{stop.stop_name}</span>
                        </div>
                        <span className="text-gray-800 font-semibold">{stop.booking_count} bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={`bg-gradient-to-r ${colors[index % colors.length]} h-3 rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
                {dashboardData.topStops.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No stop data available</div>
                )}
              </div>
            </motion.div>

            {/* Top Routes Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Most Booked Routes</h3>
                  <p className="text-xs text-gray-500">Popular journey patterns</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {dashboardData.topRoutes.map((route, index) => {
                  const maxBookings = dashboardData.topRoutes[0]?.total_bookings || 1;
                  const percentage = (route.total_bookings / maxBookings) * 100;
                  return (
                    <div key={route.route_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                          <span className="text-gray-700 font-medium">{route.route_name}</span>
                        </div>
                        <span className="text-gray-800 font-semibold">{route.total_bookings} bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
                {dashboardData.topRoutes.length === 0 && (
                  <div className="text-center py-8 text-gray-400">No route data available</div>
                )}
              </div>
            </motion.div>

            {/* Two Column Layout for Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
                      <p className="text-xs text-gray-500">Latest 5 bookings</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {dashboardData.recentBookings.length > 0 ? (
                    dashboardData.recentBookings.map((booking, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{booking.user}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.pickup} → {booking.dropoff}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(booking.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">₹{booking.amount}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              booking.status === "booked" ? "bg-green-100 text-green-700" :
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">No recent bookings</div>
                  )}
                </div>
              </motion.div>

              {/* Recent Drivers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Recent Drivers</h3>
                      <p className="text-xs text-gray-500">Latest 5 registered drivers</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {dashboardData.recentDrivers.length > 0 ? (
                    dashboardData.recentDrivers.map((driver, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white font-medium">
                              {driver.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{driver.name}</p>
                              <p className="text-xs text-gray-500">{driver.email}</p>
                              <p className="text-xs text-gray-400">{driver.phone}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            driver.status === "verified" ? "bg-green-100 text-green-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {driver.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">No recent drivers</div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">Need to take action?</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    You have {dashboardData.pendingTickets} pending tickets and {dashboardData.stats.pendingVerifications} pending verifications
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = "/admin/support-tickets"}
                    className="px-5 py-2.5 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg"
                  >
                    View Tickets
                  </button>
                  <button
                    onClick={() => window.location.href = "/admin/verify-drivers"}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg"
                  >
                    Verify Drivers
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;