import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import {
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FireIcon,
  FunnelIcon,
  ChevronDownIcon,
  CurrencyRupeeIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const PayoutReversals = () => {
  const [reversals, setReversals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    rfid_payout_transfer_id: "",
    rfid_ride_id: "",
    driver_user_id: "",
    scheduled_trip_id: ""
  });
  const [pagination, setPagination] = useState({ page: 1, page_size: 25, total: 0 });
  const [showFilters, setShowFilters] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Dropdown states
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [payoutTransfers, setPayoutTransfers] = useState([]);
  const [rides, setRides] = useState([]);
  
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [loadingRides, setLoadingRides] = useState(false);
  
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);
  const [showRideDropdown, setShowRideDropdown] = useState(false);
  
  const [driverSearch, setDriverSearch] = useState("");
  const [tripSearch, setTripSearch] = useState("");
  const [transferSearch, setTransferSearch] = useState("");
  const [rideSearch, setRideSearch] = useState("");
  
  const [selectedDriverName, setSelectedDriverName] = useState("");
  const [selectedTripInfo, setSelectedTripInfo] = useState("");
  const [selectedTransferInfo, setSelectedTransferInfo] = useState("");
  const [selectedRideInfo, setSelectedRideInfo] = useState("");

  // Check device type and get sidebar state from localStorage
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Get sidebar state from localStorage (set by Sidebar component)
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    
    // Listen for sidebar state changes
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for sidebar state changes (since Sidebar doesn't dispatch storage events)
    const interval = setInterval(() => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    }, 100);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate sidebar width based on state (matches your Sidebar component)
  const getSidebarWidth = () => {
    if (isMobile) return 0; // Mobile sidebar overlays
    return sidebarOpen ? 288 : 96; // w-72 = 288px, lg:w-24 = 96px
  };

  const sidebarWidth = getSidebarWidth();

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

  // Fetch payout transfers for dropdown
  const fetchPayoutTransfers = async () => {
    setLoadingTransfers(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE}/admin/rfid/payout-transfers`, {
        params: { page: 1, page_size: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayoutTransfers(response.data.items || []);
    } catch (error) {
      console.error("Error fetching payout transfers:", error);
    } finally {
      setLoadingTransfers(false);
    }
  };

  // Fetch rides for dropdown (from payout-ready endpoint)
  const fetchRides = async () => {
    setLoadingRides(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE}/admin/rfid/rides/payout-ready`, {
        params: { page: 1, page_size: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRides(response.data.items || []);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoadingRides(false);
    }
  };

  const fetchReversals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = {
        page: pagination.page,
        page_size: pagination.page_size,
        ...(filters.status && { status: filters.status }),
        ...(filters.rfid_payout_transfer_id && { rfid_payout_transfer_id: filters.rfid_payout_transfer_id }),
        ...(filters.rfid_ride_id && { rfid_ride_id: filters.rfid_ride_id }),
        ...(filters.driver_user_id && { driver_user_id: filters.driver_user_id }),
        ...(filters.scheduled_trip_id && { scheduled_trip_id: filters.scheduled_trip_id })
      };
      
      const response = await axios.get(`${API_BASE}/admin/rfid/payout-transfer-reversals`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReversals(response.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.count || 0 }));
    } catch (error) {
      console.error("Error fetching reversals:", error);
      toast.error("Failed to load reversal audit");
    } finally {
      setLoading(false);
    }
  };

  const viewTransferDetail = (transferId) => {
    if (transferId) {
      window.location.href = `/admin/rfid/payout-transfers/${transferId}`;
    }
  };

  // Load all dropdown data on mount
  useEffect(() => {
    fetchDrivers();
    fetchTrips();
    fetchPayoutTransfers();
    fetchRides();
  }, []);

  useEffect(() => {
    fetchReversals();
  }, [pagination.page, filters.status, filters.rfid_payout_transfer_id, filters.rfid_ride_id, filters.driver_user_id, filters.scheduled_trip_id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDriverDropdown && !event.target.closest('.driver-dropdown')) setShowDriverDropdown(false);
      if (showTripDropdown && !event.target.closest('.trip-dropdown')) setShowTripDropdown(false);
      if (showTransferDropdown && !event.target.closest('.transfer-dropdown')) setShowTransferDropdown(false);
      if (showRideDropdown && !event.target.closest('.ride-dropdown')) setShowRideDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDriverDropdown, showTripDropdown, showTransferDropdown, showRideDropdown]);

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

  const getStatusBadge = (status) => {
    const badges = {
      created: { color: "bg-amber-100 text-amber-700", icon: ClockIcon, label: "Created" },
      processed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircleIcon, label: "Processed" },
      failed: { color: "bg-red-100 text-red-700", icon: XCircleIcon, label: "Failed" }
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

  // Filter functions
  const filteredDrivers = drivers.filter(driver => 
    driver.profile?.name?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.email?.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.bus_details?.reg_no?.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredTrips = trips.filter(trip =>
    trip.route_name?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.route_code?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.driver?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.vehicle?.toLowerCase().includes(tripSearch.toLowerCase())
  );

  const filteredTransfers = payoutTransfers.filter(transfer =>
    transfer.id?.toLowerCase().includes(transferSearch.toLowerCase()) ||
    transfer.rfid_ride_id?.toLowerCase().includes(transferSearch.toLowerCase())
  );

  const filteredRides = rides.filter(ride =>
    ride.id?.toLowerCase().includes(rideSearch.toLowerCase()) ||
    ride.rfid_ride_id?.toLowerCase().includes(rideSearch.toLowerCase())
  );

  // Handle select functions
  const handleDriverSelect = (driver) => {
    setFilters(prev => ({ ...prev, driver_user_id: driver.user_id, page: 1 }));
    setSelectedDriverName(`${driver.profile?.name || 'Unknown'} • ${driver.bus_details?.reg_no || 'No Bus'}`);
    setShowDriverDropdown(false);
    setDriverSearch("");
  };

  const handleTripSelect = (trip) => {
    setFilters(prev => ({ ...prev, scheduled_trip_id: trip.trip_id, page: 1 }));
    const formattedDate = trip.planned_start ? new Date(trip.planned_start).toLocaleString('en-IN', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    }) : 'No Date';
    setSelectedTripInfo(`${trip.route_name} • ${formattedDate}`);
    setShowTripDropdown(false);
    setTripSearch("");
  };

  const handleTransferSelect = (transfer) => {
    setFilters(prev => ({ ...prev, rfid_payout_transfer_id: transfer.id, page: 1 }));
    setSelectedTransferInfo(`Transfer: ${transfer.id?.slice(0, 8)}... • Amount: ${formatCurrency(transfer.driver_payout_amount || transfer.amount)}`);
    setShowTransferDropdown(false);
    setTransferSearch("");
  };

  const handleRideSelect = (ride) => {
    const rideId = ride.rfid_ride_id || ride.id;
    setFilters(prev => ({ ...prev, rfid_ride_id: rideId, page: 1 }));
    setSelectedRideInfo(`Ride: ${rideId?.slice(0, 8)}...`);
    setShowRideDropdown(false);
    setRideSearch("");
  };

  const clearFilter = (filterName) => {
    setFilters(prev => ({ ...prev, [filterName]: "", page: 1 }));
    if (filterName === 'driver_user_id') setSelectedDriverName("");
    if (filterName === 'scheduled_trip_id') setSelectedTripInfo("");
    if (filterName === 'rfid_payout_transfer_id') setSelectedTransferInfo("");
    if (filterName === 'rfid_ride_id') setSelectedRideInfo("");
  };

  const clearAllFilters = () => {
    setFilters({ status: "", rfid_payout_transfer_id: "", rfid_ride_id: "", driver_user_id: "", scheduled_trip_id: "" });
    setSelectedDriverName("");
    setSelectedTripInfo("");
    setSelectedTransferInfo("");
    setSelectedRideInfo("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.status || filters.driver_user_id || filters.scheduled_trip_id || filters.rfid_payout_transfer_id || filters.rfid_ride_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <TopNavbar />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl opacity-5 blur-2xl" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Provider Reversal Audit
                  </h1>
                  <p className="text-gray-500 mt-2 flex items-center gap-2">
                    <ArrowsRightLeftIcon className="w-4 h-4" />
                    Track driver payout reversals and provider-side adjustments
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full shadow-lg">
                  <FireIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-white font-medium">
                    Total: {pagination.total} Reversals
                  </span>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Understanding Reversal Amounts</p>
                  <p className="text-xs text-blue-600 mt-1">
                    The <strong>amount</strong> shown represents the <strong>driver payout reversal amount</strong>.
                    This is the amount being reversed from the driver's payout, not the passenger fare.
                  </p>
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
                      {hasActiveFilters && (
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
                          <option value="created">Created</option>
                          <option value="processed">Processed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>

                      {/* Payout Transfer ID Dropdown */}
                      <div className="relative transfer-dropdown">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <BanknotesIcon className="w-4 h-4 text-gray-500" />
                          Payout Transfer
                        </label>
                        <div className="relative">
                          <div
                            onClick={() => {
                              setShowTransferDropdown(!showTransferDropdown);
                              setShowDriverDropdown(false);
                              setShowTripDropdown(false);
                              setShowRideDropdown(false);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-all duration-200"
                          >
                            <span className={selectedTransferInfo ? "text-gray-900 font-medium" : "text-gray-400"}>
                              {selectedTransferInfo || "Choose a payout transfer..."}
                            </span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showTransferDropdown ? 'rotate-180' : ''}`} />
                          </div>
                          
                          {showTransferDropdown && (
                            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                              <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                                <div className="relative">
                                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={transferSearch}
                                    onChange={(e) => setTransferSearch(e.target.value)}
                                    placeholder="Search by transfer ID or ride ID..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              {loadingTransfers ? (
                                <div className="p-8 text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                  <p className="text-xs text-gray-500 mt-3">Loading transfers...</p>
                                </div>
                              ) : filteredTransfers.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                  <BanknotesIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                  No transfers found
                                </div>
                              ) : (
                                filteredTransfers.map((transfer) => (
                                  <div
                                    key={transfer.id}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                                    onClick={() => handleTransferSelect(transfer)}
                                  >
                                    <div className="font-semibold text-gray-900 font-mono text-sm">{transfer.id?.slice(0, 12)}...</div>
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                      <span className="text-gray-500">Driver Payout:</span>
                                      <span className="font-medium text-emerald-600">{formatCurrency(transfer.driver_payout_amount || transfer.amount)}</span>
                                      <span className="text-gray-300">|</span>
                                      <span className="text-gray-500">Payable:</span>
                                      <span className="font-medium text-blue-600">{formatCurrency(transfer.driver_payout_payable_amount || transfer.payable_amount)}</span>
                                    </div>
                                    {transfer.has_reversals && (
                                      <div className="text-xs text-red-500 mt-1">
                                        ⚠️ Has reversals ({transfer.reversal_count || 0})
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        {filters.rfid_payout_transfer_id && (
                          <button
                            onClick={() => clearFilter('rfid_payout_transfer_id')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Ride ID Dropdown */}
                      <div className="relative ride-dropdown">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <TruckIcon className="w-4 h-4 text-gray-500" />
                          RFID Ride
                        </label>
                        <div className="relative">
                          <div
                            onClick={() => {
                              setShowRideDropdown(!showRideDropdown);
                              setShowDriverDropdown(false);
                              setShowTripDropdown(false);
                              setShowTransferDropdown(false);
                            }}
                            className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-all duration-200"
                          >
                            <span className={selectedRideInfo ? "text-gray-900 font-medium" : "text-gray-400"}>
                              {selectedRideInfo || "Choose a ride..."}
                            </span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showRideDropdown ? 'rotate-180' : ''}`} />
                          </div>
                          
                          {showRideDropdown && (
                            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                              <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                                <div className="relative">
                                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={rideSearch}
                                    onChange={(e) => setRideSearch(e.target.value)}
                                    placeholder="Search by ride ID..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              {loadingRides ? (
                                <div className="p-8 text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                  <p className="text-xs text-gray-500 mt-3">Loading rides...</p>
                                </div>
                              ) : filteredRides.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                  <TruckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                  No rides found
                                </div>
                              ) : (
                                filteredRides.map((ride) => {
                                  const rideId = ride.rfid_ride_id || ride.id;
                                  return (
                                    <div
                                      key={rideId}
                                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                                      onClick={() => handleRideSelect(ride)}
                                    >
                                      <div className="font-semibold text-gray-900 font-mono text-sm">{rideId?.slice(0, 12)}...</div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Driver Payout: {formatCurrency(ride.driver_payout_amount || ride.amount)}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                        {filters.rfid_ride_id && (
                          <button
                            onClick={() => clearFilter('rfid_ride_id')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
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
                              setShowTransferDropdown(false);
                              setShowRideDropdown(false);
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
                            onClick={() => clearFilter('driver_user_id')}
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
                              setShowTransferDropdown(false);
                              setShowRideDropdown(false);
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
                            onClick={() => clearFilter('scheduled_trip_id')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">Active filters:</span>
                          {filters.status && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                              Status: {filters.status}
                            </span>
                          )}
                          {filters.rfid_payout_transfer_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                              <BanknotesIcon className="w-3 h-3" />
                              {selectedTransferInfo}
                            </span>
                          )}
                          {filters.rfid_ride_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                              <TruckIcon className="w-3 h-3" />
                              {selectedRideInfo}
                            </span>
                          )}
                          {filters.driver_user_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                              <UserIcon className="w-3 h-3" />
                              {selectedDriverName}
                            </span>
                          )}
                          {filters.scheduled_trip_id && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                              <CalendarIcon className="w-3 h-3" />
                              {selectedTripInfo}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reversals Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Reversal Amount
                        <p className="text-[9px] text-gray-400 font-normal mt-0.5">Driver Payout Reversal</p>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transfer Info</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ride Info</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason / Admin Note</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-gray-500 mt-3 font-medium">Loading reversals...</p>
                        </td>
                      </tr>
                    ) : reversals.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <ArrowsRightLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No reversal records found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      reversals.map((reversal, index) => (
                        <tr key={reversal.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <p className="font-bold text-gray-900 text-lg">{formatCurrency(reversal.driver_payout_reversal_amount || reversal.amount)}</p>
                              <p className="text-xs text-gray-500 mt-1">Reversal Amount</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(reversal.status)}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-mono text-gray-700">{reversal.rfid_payout_transfer_id?.slice(0, 12)}...</p>
                              {reversal.rfid_payout_transfer_id && (
                                <p className="text-xs text-gray-500">
                                  Transfer: {formatCurrency(reversal.driver_payout_amount)} / {formatCurrency(reversal.driver_payout_payable_amount)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-mono text-gray-700">{reversal.rfid_ride_id?.slice(0, 12)}...</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 max-w-xs">
                              <p className="text-sm text-gray-600 truncate">{reversal.reason || '-'}</p>
                              {reversal.admin_note && (
                                <p className="text-xs text-gray-400 italic">Note: {reversal.admin_note}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500">{formatDateTime(reversal.created_at)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewTransferDetail(reversal.rfid_payout_transfer_id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="View Transfer Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
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
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </div>
  );
};

export default PayoutReversals;