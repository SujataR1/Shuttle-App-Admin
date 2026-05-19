// src/pages/admin/rfid/PayoutDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import {
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ChevronDownIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  WalletIcon,
  ChartBarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const PayoutDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    driver_user_id: "",
    scheduled_trip_id: ""
  });
  const [refreshing, setRefreshing] = useState(false);
  
  // Dropdown states
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [tripSearch, setTripSearch] = useState("");
  const [selectedDriverName, setSelectedDriverName] = useState("");
  const [selectedTripInfo, setSelectedTripInfo] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch all drivers
  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE}/admin/view/all-drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers list");
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Fetch all trips
  const fetchTrips = async () => {
    setLoadingTrips(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE}/admin/trips/monitor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips list");
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = {};
      if (filters.driver_user_id) params.driver_user_id = filters.driver_user_id;
      if (filters.scheduled_trip_id) params.scheduled_trip_id = filters.scheduled_trip_id;
      
      const response = await axios.get(`${API_BASE}/admin/rfid/payout-operations-summary`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching payout summary:", error);
      toast.error("Failed to load payout summary");
    } finally {
      setLoading(false);
    }
  };

  const refreshWithheld = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE}/admin/rfid/payout-transfers/refresh-withheld`,
        {
          driver_user_id: filters.driver_user_id || null,
          scheduled_trip_id: filters.scheduled_trip_id || null,
          limit: 100
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✨ ${response.data.ready_count} payouts moved to ready queue`);
      fetchSummary();
    } catch (error) {
      console.error("Error refreshing withheld:", error);
      toast.error("Failed to refresh withheld payouts");
    } finally {
      setRefreshing(false);
    }
  };

  const reconcileCreated = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE}/admin/rfid/payout-transfers/reconcile-created`,
        {
          driver_user_id: filters.driver_user_id || null,
          scheduled_trip_id: filters.scheduled_trip_id || null,
          limit: 100
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("🔄 Created payouts reconciled successfully");
      fetchSummary();
    } catch (error) {
      console.error("Error reconciling created:", error);
      toast.error("Failed to reconcile created payouts");
    } finally {
      setRefreshing(false);
    }
  };

  // Load drivers and trips on mount
  useEffect(() => {
    fetchDrivers();
    fetchTrips();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [filters.driver_user_id, filters.scheduled_trip_id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDriverDropdown && !event.target.closest('.driver-dropdown')) {
        setShowDriverDropdown(false);
      }
      if (showTripDropdown && !event.target.closest('.trip-dropdown')) {
        setShowTripDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDriverDropdown, showTripDropdown]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle, trend, onClick }) => (
    <div 
      onClick={onClick}
      onMouseEnter={() => setHoveredCard(title)}
      onMouseLeave={() => setHoveredCard(null)}
      className={`relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-lg transition-all duration-300 cursor-pointer ${hoveredCard === title ? 'scale-105 shadow-2xl -translate-y-1' : 'hover:shadow-xl'}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 ${hoveredCard === title ? 'opacity-5' : 'group-hover:opacity-10'}`} />
      <div className={`absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-300 ${hoveredCard === title ? 'border-gray-900' : ''}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform transition-transform duration-300 ${hoveredCard === title ? 'scale-110 rotate-6' : ''}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {trend > 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Filter drivers based on search
  const filteredDrivers = drivers.filter(driver => 
    driver.profile?.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.email?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.bus_details?.reg_no?.toLowerCase().includes(driverSearch.toLowerCase())
  );

  // Filter trips based on search
  const filteredTrips = trips.filter(trip =>
    trip.route_name?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.route_code?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.driver?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.vehicle?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.trip_id?.toLowerCase().includes(tripSearch.toLowerCase())
  );

  const handleDriverSelect = (driver) => {
    setFilters(prev => ({ ...prev, driver_user_id: driver.user_id }));
    setSelectedDriverName(`${driver.profile?.name || 'Unknown'} • ${driver.bus_details?.reg_no || 'No Bus'}`);
    setShowDriverDropdown(false);
    setDriverSearch("");
    toast.info(`Filtering by driver: ${driver.profile?.name}`);
  };

  const handleTripSelect = (trip) => {
    setFilters(prev => ({ ...prev, scheduled_trip_id: trip.trip_id }));
    const formattedDate = trip.planned_start ? new Date(trip.planned_start).toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : 'No Date';
    setSelectedTripInfo(`${trip.route_name} • ${formattedDate}`);
    setShowTripDropdown(false);
    setTripSearch("");
    toast.info(`Filtering by trip: ${trip.route_name}`);
  };

  const clearDriverFilter = () => {
    setFilters(prev => ({ ...prev, driver_user_id: "" }));
    setSelectedDriverName("");
    toast.info("Driver filter cleared");
  };

  const clearTripFilter = () => {
    setFilters(prev => ({ ...prev, scheduled_trip_id: "" }));
    setSelectedTripInfo("");
    toast.info("Trip filter cleared");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <TopNavbar />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl opacity-5 blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Payout Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                      <ChartBarIcon className="w-4 h-4" />
                      Monitor and manage RFID driver payouts in real-time
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full shadow-lg">
                      <FireIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-white font-medium">Live Updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Section - Fixed dropdown overflow */}
            <div className="relative mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-visible">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <WalletIcon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-white font-semibold">Filter Payouts</h3>
                    <span className="text-xs text-gray-400 ml-auto">Refine your view</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Driver Selection Dropdown */}
                    <div className="relative driver-dropdown">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        Select Driver
                      </label>
                      <div className="relative">
                        <div
                          onClick={() => {
                            setShowDriverDropdown(!showDriverDropdown);
                            setShowTripDropdown(false);
                          }}
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-all duration-200"
                        >
                          <span className={selectedDriverName ? "text-gray-900 font-medium" : "text-gray-400"}>
                            {selectedDriverName || "Choose a driver..."}
                          </span>
                          <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showDriverDropdown ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {showDriverDropdown && (
                          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                            <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                              <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={driverSearch}
                                  onChange={(e) => setDriverSearch(e.target.value)}
                                  placeholder="Search by name, email, or bus number..."
                                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            {loadingDrivers ? (
                              <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="text-xs text-gray-500 mt-3">Loading drivers...</p>
                              </div>
                            ) : filteredDrivers.length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                No drivers found
                              </div>
                            ) : (
                              filteredDrivers.map((driver) => (
                                <div
                                  key={driver.user_id}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                                  onClick={() => handleDriverSelect(driver)}
                                >
                                  <div className="font-semibold text-gray-900">{driver.profile?.name || 'Unknown'}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {driver.email} • {driver.bus_details?.reg_no || 'No Bus'}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {filters.driver_user_id && (
                        <button
                          onClick={clearDriverFilter}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          title="Clear driver filter"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Trip Selection Dropdown */}
                    <div className="relative trip-dropdown">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        Select Scheduled Trip
                      </label>
                      <div className="relative">
                        <div
                          onClick={() => {
                            setShowTripDropdown(!showTripDropdown);
                            setShowDriverDropdown(false);
                          }}
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-all duration-200"
                        >
                          <span className={selectedTripInfo ? "text-gray-900 font-medium" : "text-gray-400"}>
                            {selectedTripInfo || "Choose a trip..."}
                          </span>
                          <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showTripDropdown ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {showTripDropdown && (
                          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                            <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                              <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={tripSearch}
                                  onChange={(e) => setTripSearch(e.target.value)}
                                  placeholder="Search by route, driver, or vehicle..."
                                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            {loadingTrips ? (
                              <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="text-xs text-gray-500 mt-3">Loading trips...</p>
                              </div>
                            ) : filteredTrips.length === 0 ? (
                              <div className="p-8 text-center text-gray-500">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                No trips found
                              </div>
                            ) : (
                              filteredTrips.map((trip) => (
                                <div
                                  key={trip.trip_id}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                                  onClick={() => handleTripSelect(trip)}
                                >
                                  <div className="font-semibold text-gray-900">{trip.route_name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Driver: {trip.driver} • Vehicle: {trip.vehicle}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {trip.planned_start ? new Date(trip.planned_start).toLocaleString() : 'No date'}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {filters.scheduled_trip_id && (
                        <button
                          onClick={clearTripFilter}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          title="Clear trip filter"
                        >
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={refreshWithheld}
                      disabled={refreshing}
                      className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative flex items-center gap-2">
                        <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? "Processing..." : "Refresh Withheld Payouts"}
                      </span>
                    </button>
                    
                    <button
                      onClick={reconcileCreated}
                      disabled={refreshing}
                      className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <span className="relative flex items-center gap-2">
                        <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? "Processing..." : "Reconcile Created Payouts"}
                      </span>
                    </button>

                    {(filters.driver_user_id || filters.scheduled_trip_id) && (
                      <button
                        onClick={() => {
                          setFilters({ driver_user_id: "", scheduled_trip_id: "" });
                          setSelectedDriverName("");
                          setSelectedTripInfo("");
                        }}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>

                  {/* Active Filters Display */}
                  {(filters.driver_user_id || filters.scheduled_trip_id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Active filters:</span>
                        {filters.driver_user_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            <UserIcon className="w-3 h-3" />
                            {selectedDriverName}
                          </span>
                        )}
                        {filters.scheduled_trip_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                            <CalendarIcon className="w-3 h-3" />
                            {selectedTripInfo}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CurrencyRupeeIcon className="w-6 h-6 text-gray-900 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-gray-500 mt-4 font-medium">Loading dashboard data...</p>
                </div>
              </div>
            )}

            {/* Summary Cards Grid */}
            {summary && !loading && (
              <>
                {/* Main Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Ready Payouts"
                    value={summary.ready_transfer_count || 0}
                    icon={CheckCircleIcon}
                    gradient="from-emerald-500 to-green-600"
                    subtitle={formatCurrency(summary.payout_transfer_amount_by_status?.ready)}
                    trend={12}
                    onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=ready'}
                  />
                  <StatCard
                    title="Created (Awaiting Reconcile)"
                    value={summary.created_transfer_count || 0}
                    icon={ClockIcon}
                    gradient="from-amber-500 to-orange-600"
                    subtitle={formatCurrency(summary.payout_transfer_amount_by_status?.created)}
                    trend={-5}
                    onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=created'}
                  />
                  <StatCard
                    title="Withheld Payouts"
                    value={summary.withheld_transfer_count || 0}
                    icon={ExclamationTriangleIcon}
                    gradient="from-orange-500 to-red-600"
                    subtitle={formatCurrency(summary.payout_transfer_amount_by_status?.withheld)}
                    trend={8}
                    onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=withheld'}
                  />
                  <StatCard
                    title="Failed Payouts"
                    value={summary.failed_transfer_count || 0}
                    icon={XCircleIcon}
                    gradient="from-red-500 to-pink-600"
                    subtitle={formatCurrency(summary.payout_transfer_amount_by_status?.failed)}
                    trend={-2}
                    onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=failed'}
                  />
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    title="Processed Payouts"
                    value={summary.processed_transfer_count || 0}
                    icon={BanknotesIcon}
                    gradient="from-green-600 to-emerald-700"
                    subtitle={formatCurrency(summary.payout_transfer_amount_by_status?.processed)}
                    trend={24}
                    onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=processed'}
                  />
                  <StatCard
                    title="Reversed Payouts"
                    value={summary.reversed_transfer_count || 0}
                    icon={ArrowPathIcon}
                    gradient="from-purple-600 to-indigo-700"
                    subtitle={formatCurrency(summary.payout_transfer_amount_by_status?.reversed)}
                    trend={3}
                    onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=reversed'}
                  />
                  <StatCard
                    title="Provider Reversals"
                    value={`${summary.processed_provider_reversal_count || 0} / ${summary.failed_provider_reversal_count || 0}`}
                    icon={ArrowPathIcon}
                    gradient="from-indigo-600 to-blue-700"
                    subtitle={`Total: ${formatCurrency(summary.provider_reversal_total)}`}
                    onClick={() => window.location.href = '/admin/rfid/payout-reversals'}
                  />
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FireIcon className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-white font-semibold">Quick Actions</h3>
                      <span className="text-xs text-gray-400 ml-auto">One-click operations</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=ready'}
                        className="group relative p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        <CheckCircleIcon className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <p className="font-semibold text-gray-900">Ready Queue</p>
                        <p className="text-xs text-gray-500 mt-1">Trigger ready payouts</p>
                      </button>
                      
                      <button
                        onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=withheld'}
                        className="group relative p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        <ExclamationTriangleIcon className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <p className="font-semibold text-gray-900">Withheld Queue</p>
                        <p className="text-xs text-gray-500 mt-1">Fix driver account issues</p>
                      </button>
                      
                      <button
                        onClick={() => window.location.href = '/admin/rfid/payout-transfers?status=created'}
                        className="group relative p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        <ClockIcon className="w-8 h-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <p className="font-semibold text-gray-900">Created Queue</p>
                        <p className="text-xs text-gray-500 mt-1">Reconcile with Razorpay</p>
                      </button>
                      
                      <button
                        onClick={() => window.location.href = '/admin/rfid/payout-reversals'}
                        className="group relative p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        <ArrowPathIcon className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <p className="font-semibold text-gray-900">Reversal Audit</p>
                        <p className="text-xs text-gray-500 mt-1">Track provider reversals</p>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PayoutDashboard;