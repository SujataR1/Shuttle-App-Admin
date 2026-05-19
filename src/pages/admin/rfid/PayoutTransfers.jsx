// src/pages/admin/rfid/PayoutTransfers.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import {
  CurrencyRupeeIcon,
  EyeIcon,
  PlayIcon,
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ChevronDownIcon,
  FireIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const PayoutTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransfers, setSelectedTransfers] = useState(new Set());
  const [filters, setFilters] = useState({
    status: new URLSearchParams(window.location.search).get('status') || "",
    driver_user_id: "",
    scheduled_trip_id: "",
    rfid_ride_id: ""
  });
  const [pagination, setPagination] = useState({ page: 1, page_size: 25, total: 0 });
  const [triggeringId, setTriggeringId] = useState(null);
  const [bulkTriggering, setBulkTriggering] = useState(false);
  
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
  const [showFilters, setShowFilters] = useState(true);

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

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
        ...(filters.status && { status: filters.status }),
        ...(filters.driver_user_id && { driver_user_id: filters.driver_user_id }),
        ...(filters.scheduled_trip_id && { scheduled_trip_id: filters.scheduled_trip_id }),
        ...(filters.rfid_ride_id && { rfid_ride_id: filters.rfid_ride_id })
      };
      
      const response = await axios.get(`${API_BASE}/admin/rfid/payout-transfers`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTransfers(response.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.count || 0 }));
      // Clear selections when data changes
      setSelectedTransfers(new Set());
    } catch (error) {
      console.error("Error fetching transfers:", error);
      toast.error("Failed to load payout transfers");
    } finally {
      setLoading(false);
    }
  };

  const triggerTransfer = async (transferId) => {
    if (!window.confirm("Are you sure you want to trigger this payout transfer?")) return;
    
    setTriggeringId(transferId);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/payout-transfers/${transferId}/trigger`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Payout transfer triggered successfully");
      // Remove from selected set if it was selected
      setSelectedTransfers(prev => {
        const newSet = new Set(prev);
        newSet.delete(transferId);
        return newSet;
      });
      await fetchTransfers();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to trigger transfer";
      toast.error(message);
      console.error("Error triggering transfer:", error);
    } finally {
      setTriggeringId(null);
    }
  };

  const bulkTriggerReady = async () => {
    const selectedArray = Array.from(selectedTransfers);
    if (selectedArray.length === 0) {
      toast.warning("No transfers selected");
      return;
    }
    
    if (!window.confirm(`Trigger ${selectedArray.length} selected payout transfers?`)) return;
    
    setBulkTriggering(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE}/admin/rfid/payout-transfers/trigger-ready`,
        { transfer_ids: selectedArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Triggered ${response.data.processed_count || 0} transfers`);
      setSelectedTransfers(new Set());
      await fetchTransfers();
    } catch (error) {
      console.error("Error bulk triggering:", error);
      toast.error("Failed to trigger transfers");
    } finally {
      setBulkTriggering(false);
    }
  };

  const viewTransferDetail = (transferId) => {
    window.location.href = `/admin/rfid/payout-transfers/${transferId}`;
  };

  const toggleSelectAll = () => {
    if (selectedTransfers.size === transfers.length) {
      setSelectedTransfers(new Set());
    } else {
      // Only select transfers with status 'ready'
      const readyTransferIds = transfers.filter(t => t.status === 'ready').map(t => t.id);
      setSelectedTransfers(new Set(readyTransferIds));
    }
  };

  const toggleSelect = (transferId) => {
    setSelectedTransfers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transferId)) {
        newSet.delete(transferId);
      } else {
        newSet.add(transferId);
      }
      return newSet;
    });
  };

  // Load drivers and trips on mount
  useEffect(() => {
    fetchDrivers();
    fetchTrips();
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [pagination.page, filters.status, filters.driver_user_id, filters.scheduled_trip_id, filters.rfid_ride_id]);

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

  const getStatusBadge = (status) => {
    const badges = {
      ready: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircleIcon, label: "Ready" },
      created: { color: "bg-amber-100 text-amber-700", icon: ClockIcon, label: "Created" },
      processed: { color: "bg-green-100 text-green-700", icon: CheckCircleIcon, label: "Processed" },
      failed: { color: "bg-red-100 text-red-700", icon: XCircleIcon, label: "Failed" },
      withheld: { color: "bg-orange-100 text-orange-700", icon: ExclamationTriangleIcon, label: "Withheld" },
      reversed: { color: "bg-purple-100 text-purple-700", icon: ArrowPathIcon, label: "Reversed" }
    };
    const badge = badges[status] || { color: "bg-gray-100 text-gray-700", icon: ClockIcon, label: status };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

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
    trip.vehicle?.toLowerCase().includes(tripSearch.toLowerCase())
  );

  const handleDriverSelect = (driver) => {
    setFilters(prev => ({ ...prev, driver_user_id: driver.user_id, page: 1 }));
    setSelectedDriverName(`${driver.profile?.name || 'Unknown'} • ${driver.bus_details?.reg_no || 'No Bus'}`);
    setShowDriverDropdown(false);
    setDriverSearch("");
  };

  const handleTripSelect = (trip) => {
    setFilters(prev => ({ ...prev, scheduled_trip_id: trip.trip_id, page: 1 }));
    const formattedDate = trip.planned_start ? new Date(trip.planned_start).toLocaleString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }) : 'No Date';
    setSelectedTripInfo(`${trip.route_name} • ${formattedDate}`);
    setShowTripDropdown(false);
    setTripSearch("");
  };

  const clearDriverFilter = () => {
    setFilters(prev => ({ ...prev, driver_user_id: "", page: 1 }));
    setSelectedDriverName("");
  };

  const clearTripFilter = () => {
    setFilters(prev => ({ ...prev, scheduled_trip_id: "", page: 1 }));
    setSelectedTripInfo("");
  };

  const clearAllFilters = () => {
    setFilters({ status: "", driver_user_id: "", scheduled_trip_id: "", rfid_ride_id: "" });
    setSelectedDriverName("");
    setSelectedTripInfo("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Count how many ready transfers are selected
  const selectedReadyCount = Array.from(selectedTransfers).filter(id => 
    transfers.find(t => t.id === id)?.status === 'ready'
  ).length;

  const hasReadyTransfers = transfers.some(t => t.status === 'ready');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <TopNavbar />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl opacity-5 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Payout Transfers
                  </h1>
                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <TruckIcon className="w-4 h-4" />
                    Manage and monitor driver payout transfers
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full shadow-lg">
                    <FireIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-white font-medium">
                      Total: {pagination.total} Transfers
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="relative mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-visible">
                <div 
                  className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 cursor-pointer"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/10 rounded-lg">
                        <FunnelIcon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-white font-semibold">Filters</h3>
                      {(filters.driver_user_id || filters.scheduled_trip_id || filters.rfid_ride_id || filters.status) && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-white transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {showFilters && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                          Status
                        </label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                          className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value="">All Statuses</option>
                          <option value="ready">Ready</option>
                          <option value="created">Created</option>
                          <option value="processed">Processed</option>
                          <option value="failed">Failed</option>
                          <option value="withheld">Withheld</option>
                          <option value="reversed">Reversed</option>
                        </select>
                      </div>

                      {/* RFID Ride ID Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <TruckIcon className="w-4 h-4 text-gray-500" />
                          RFID Ride ID
                        </label>
                        <input
                          type="text"
                          value={filters.rfid_ride_id}
                          onChange={(e) => setFilters(prev => ({ ...prev, rfid_ride_id: e.target.value, page: 1 }))}
                          placeholder="Search by ride ID..."
                          className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>

                      {/* Driver Selection Dropdown */}
                      <div className="relative driver-dropdown">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          Driver
                        </label>
                        <div className="relative">
                          <div
                            onClick={() => {
                              setShowDriverDropdown(!showDriverDropdown);
                              setShowTripDropdown(false);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-all duration-200"
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
                                    placeholder="Search by name, email, or bus..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Trip Selection Dropdown */}
                      <div className="relative trip-dropdown">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          Scheduled Trip
                        </label>
                        <div className="relative">
                          <div
                            onClick={() => {
                              setShowTripDropdown(!showTripDropdown);
                              setShowDriverDropdown(false);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-all duration-200"
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
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={clearAllFilters}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                      >
                        Clear All Filters
                      </button>
                    </div>

                    {/* Active Filters Display */}
                    {(filters.driver_user_id || filters.scheduled_trip_id || filters.rfid_ride_id || filters.status) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">Active filters:</span>
                          {filters.status && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                              Status: {filters.status}
                            </span>
                          )}
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
                          {filters.rfid_ride_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                              <TruckIcon className="w-3 h-3" />
                              Ride: {filters.rfid_ride_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Actions - Only show if there are selected ready transfers */}
            {selectedReadyCount > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">{selectedReadyCount} ready transfer{selectedReadyCount !== 1 ? 's' : ''} selected</span>
                </div>
                <button
                  onClick={bulkTriggerReady}
                  disabled={bulkTriggering}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  {bulkTriggering ? "Triggering..." : "Trigger Selected"}
                </button>
              </div>
            )}

            {/* Transfers Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={hasReadyTransfers && selectedTransfers.size === transfers.filter(t => t.status === 'ready').length}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                          disabled={!hasReadyTransfers}
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payable</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ride ID</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-gray-500 mt-3 font-medium">Loading transfers...</p>
                        </td>
                      </tr>
                    ) : transfers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center">
                          <CurrencyRupeeIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No payout transfers found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      transfers.map((transfer, index) => (
                        <tr key={transfer.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedTransfers.has(transfer.id)}
                              onChange={() => toggleSelect(transfer.id)}
                              disabled={transfer.status !== 'ready'}
                              className="rounded border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-gray-900">{formatCurrency(transfer.amount)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(transfer.payable_amount)}</p>
                            {transfer.has_reversals && (
                              <p className="text-xs text-red-500 mt-0.5">Reversed: {formatCurrency(transfer.reversed_amount)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(transfer.status)}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-mono text-gray-700">{transfer.driver_user_id?.slice(0, 8)}...</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-mono text-gray-700">{transfer.rfid_ride_id?.slice(0, 8)}...</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-500">{formatDateTime(transfer.created_at)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewTransferDetail(transfer.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              {transfer.status === 'ready' && (
                                <button
                                  onClick={() => triggerTransfer(transfer.id)}
                                  disabled={triggeringId === transfer.id}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Trigger Payout"
                                >
                                  {triggeringId === transfer.id ? (
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <PlayIcon className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.page_size) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(pagination.page * pagination.page_size, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> results
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.page_size >= pagination.total}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default PayoutTransfers;