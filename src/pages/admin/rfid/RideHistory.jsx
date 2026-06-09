import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  TruckIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const RideHistory = () => {
  const [rideId, setRideId] = useState("");
  const [loading, setLoading] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Dropdown states for ride selection
  const [payoutTransfers, setPayoutTransfers] = useState([]);
  const [showRideDropdown, setShowRideDropdown] = useState(false);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRideInfo, setSelectedRideInfo] = useState("");
  
  // Cache for driver names and vehicle plates
  const [driverNames, setDriverNames] = useState({});
  const [vehiclePlates, setVehiclePlates] = useState({});

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
    
    // Poll for sidebar state changes
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
    if (isMobile) return 0;
    return sidebarOpen ? 288 : 96;
  };

  const sidebarWidth = getSidebarWidth();

  // Fetch all drivers to get names
  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE}/admin/view/all-drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const driverMap = {};
      response.data.forEach(driver => {
        driverMap[driver.user_id] = driver.profile?.name || driver.email;
      });
      setDriverNames(driverMap);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Fetch vehicle options to get license plates
  const fetchVehicleOptions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let allItems = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await axios.get(`${API_BASE}/admin/rfid/device-vehicle-options`, {
          params: { page: currentPage, page_size: 100 },
          headers: { Authorization: `Bearer ${token}` }
        });
        const items = response.data.items || [];
        allItems = [...allItems, ...items];
        hasMore = items.length === 100;
        currentPage++;
      }
      
      const vehicleMap = {};
      allItems.forEach(item => {
        vehicleMap[item.vehicle_id] = {
          licensePlate: item.vehicle_license_plate,
          driverName: item.driver_name,
          driverId: item.driver_user_id
        };
      });
      setVehiclePlates(vehicleMap);
    } catch (error) {
      console.error("Error fetching vehicle options:", error);
    }
  };

  // Fetch all payout transfers to get ride IDs
  const fetchPayoutTransfers = async () => {
    setLoadingTransfers(true);
    try {
      const token = localStorage.getItem("access_token");
      let allTransfers = [];
      let currentPage = 1;
      let hasMore = true;
      
      // Fetch all pages to get complete list of transfers
      while (hasMore) {
        const response = await axios.get(`${API_BASE}/admin/rfid/payout-transfers`, {
          params: { page: currentPage, page_size: 100 },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const items = response.data.items || [];
        allTransfers = [...allTransfers, ...items];
        hasMore = items.length === 100;
        currentPage++;
      }
      
      // Fetch ride money details for each transfer to get driver and vehicle info
      const enhancedTransfers = [];
      for (const transfer of allTransfers) {
        try {
          const rideResponse = await axios.get(`${API_BASE}/admin/rfid/rides/${transfer.rfid_ride_id}/money-detail`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const rideData = rideResponse.data.ride;
          enhancedTransfers.push({
            ...transfer,
            driver_user_id: rideData?.driver_user_id || transfer.driver_user_id,
            vehicle_id: rideData?.vehicle_id || transfer.vehicle_id,
          });
        } catch (err) {
          // If can't fetch ride details, still add the transfer without extra info
          enhancedTransfers.push(transfer);
        }
      }
      
      setPayoutTransfers(enhancedTransfers);
      console.log("Loaded enhanced transfers:", enhancedTransfers.length);
    } catch (error) {
      console.error("Error fetching payout transfers:", error);
      toast.error("Failed to load ride list");
    } finally {
      setLoadingTransfers(false);
    }
  };

  // Fetch ride details by ID
  const fetchRideMoneyDetails = async (id = rideId) => {
    if (!id || !id.trim()) {
      toast.error("Please select or enter a Ride ID");
      return;
    }

    setLoading(true);
    setError(null);
    setRideDetails(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/rides/${id}/money-detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = response.data;
      setRideDetails({
        ride: data.ride,
        ledger_entries: data.ledger_entries || [],
        funding_allocations: data.funding_allocations || [],
        payout_transfers: data.payout_transfers || [],
        payout_transfer_reversals: data.payout_transfer_reversals || [],
        ledger_entry_count: data.ledger_entry_count || 0,
        funding_allocation_count: data.funding_allocation_count || 0,
        payout_transfer_count: data.payout_transfer_count || 0,
        payout_transfer_reversal_count: data.payout_transfer_reversal_count || 0
      });
      
      // Update selected ride info
      const selectedTransfer = payoutTransfers.find(t => t.rfid_ride_id === id);
      if (selectedTransfer) {
        const driverName = driverNames[selectedTransfer.driver_user_id] || selectedTransfer.driver_user_id?.slice(0, 8);
        const vehicleInfo = vehiclePlates[selectedTransfer.vehicle_id];
        const vehicleDisplay = vehicleInfo?.licensePlate || selectedTransfer.vehicle_id?.slice(0, 8);
        
        setSelectedRideInfo(`Ride ID: ${id.slice(0, 8)}... | Driver: ${driverName} | Vehicle: ${vehicleDisplay} | Amount: ${formatCurrency(selectedTransfer.amount)}`);
      } else {
        setSelectedRideInfo(`Ride ID: ${id.slice(0, 8)}...`);
      }
      
      toast.success("Ride details loaded successfully");
    } catch (error) {
      console.error("Error fetching ride details:", error);
      const message = error.response?.data?.detail?.message || 
                      error.response?.data?.message || 
                      "Failed to fetch ride details. Please check the Ride ID.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDrivers(),
        fetchVehicleOptions(),
        fetchPayoutTransfers()
      ]);
    };
    loadData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRideDropdown && !event.target.closest('.ride-dropdown')) {
        setShowRideDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRideDropdown]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getLedgerEntryTypeBadge = (type) => {
    const types = {
      'fare_hold': { color: 'bg-blue-100 text-blue-700', label: 'Fare Hold' },
      'fare_debit': { color: 'bg-red-100 text-red-700', label: 'Fare Debit' },
      'hold_release': { color: 'bg-green-100 text-green-700', label: 'Hold Release' },
      'fare_reversal_credit': { color: 'bg-purple-100 text-purple-700', label: 'Fare Reversal' }
    };
    const config = types[type] || { color: 'bg-gray-100 text-gray-700', label: type || 'Unknown' };
    return (
      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAmountDisplay = (entry) => {
    if (entry.entry_type === 'fare_hold') {
      return `Held: ${formatCurrency(entry.held_delta)}`;
    } else if (entry.entry_type === 'fare_debit') {
      return formatCurrency(entry.amount_delta);
    } else if (entry.entry_type === 'hold_release') {
      return `Released: ${formatCurrency(Math.abs(entry.held_delta))}`;
    }
    return formatCurrency(entry.amount_delta);
  };

  // Get display info for a transfer
  const getTransferDisplayInfo = (transfer) => {
    const driverName = driverNames[transfer.driver_user_id] || transfer.driver_user_id?.slice(0, 8);
    const vehicleInfo = vehiclePlates[transfer.vehicle_id];
    const vehicleDisplay = vehicleInfo?.licensePlate || transfer.vehicle_id?.slice(0, 8);
    const dateDisplay = formatDate(transfer.created_at);
    const rideIdShort = transfer.rfid_ride_id?.slice(0, 8);
    
    return {
      driverName: driverName || 'Unknown',
      vehicleDisplay: vehicleDisplay || 'Unknown',
      dateDisplay,
      rideIdShort,
      amount: transfer.amount,
      status: transfer.status
    };
  };

  // Filter transfers based on search
  const filteredTransfers = payoutTransfers.filter(transfer => {
    const info = getTransferDisplayInfo(transfer);
    return transfer.rfid_ride_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           info.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           info.vehicleDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           transfer.status?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRideSelect = (transfer) => {
    const rideIdValue = transfer.rfid_ride_id;
    setRideId(rideIdValue);
    const info = getTransferDisplayInfo(transfer);
    setSelectedRideInfo(`Ride ID: ${info.rideIdShort}... | Driver: ${info.driverName} | Vehicle: ${info.vehicleDisplay} | Amount: ${formatCurrency(transfer.amount)}`);
    setShowRideDropdown(false);
    setSearchTerm("");
    fetchRideMoneyDetails(rideIdValue);
  };

  const handleSearch = () => {
    if (rideId.trim()) {
      fetchRideMoneyDetails();
    } else {
      toast.error("Please enter or select a Ride ID");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} isMobile={isMobile} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen} />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">RFID Ride Details</h1>
                <p className="text-gray-500 mt-1">View detailed ride information and money transactions</p>
              </div>
            </div>

            {/* Search Section with Dropdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select or Enter RFID Ride ID
              </label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative ride-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={rideId}
                      onChange={(e) => {
                        setRideId(e.target.value);
                        setSelectedRideInfo("");
                      }}
                      placeholder="Search by Ride ID, Driver, Vehicle, or Status..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent font-mono text-sm pr-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      onClick={() => setShowRideDropdown(!showRideDropdown)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showRideDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Ride ID, Driver, Vehicle, or Status..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      {loadingTransfers ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                          <p className="text-xs text-gray-500 mt-3">Loading rides...</p>
                        </div>
                      ) : filteredTransfers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <ListBulletIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          No rides found
                        </div>
                      ) : (
                        filteredTransfers.map((transfer) => {
                          const info = getTransferDisplayInfo(transfer);
                          return (
                            <div
                              key={transfer.id}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                              onClick={() => handleRideSelect(transfer)}
                            >
                              {/* Ride ID and Status */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm font-semibold text-gray-900">
                                    Ride ID: {info.rideIdShort}...
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  transfer.status === 'processed' || transfer.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : transfer.status === 'withheld'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {transfer.status}
                                </span>
                              </div>
                              
                              {/* Driver and Vehicle */}
                              <div className="flex flex-wrap gap-3 mb-2 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <UserIcon className="w-3 h-3" />
                                  <span>Driver: {info.driverName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TruckIcon className="w-3 h-3" />
                                  <span>Vehicle: {info.vehicleDisplay}</span>
                                </div>
                              </div>
                              
                              {/* Amount and Date */}
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-emerald-600 text-sm">
                                  {formatCurrency(transfer.amount)}
                                </span>
                                <span className="text-xs text-gray-400">{info.dateDisplay}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  )}
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
              
              {selectedRideInfo && (
                <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                  {selectedRideInfo}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Search by <strong>Ride ID</strong>, <strong>Driver Name</strong>, <strong>Vehicle Number</strong>, or <strong>Status</strong>
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ride Details Display */}
            {rideDetails && rideDetails.ride && (
              <div className="space-y-6">
                {/* Ride Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-900 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" />
                      Ride Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ride ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{rideDetails.ride.id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          rideDetails.ride.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : rideDetails.ride.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {rideDetails.ride.status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fare Amount</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(rideDetails.ride.fare_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Driver Payout</p>
                        <p className="text-sm font-medium text-emerald-600">{formatCurrency(rideDetails.ride.driver_payout_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Transfer Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          rideDetails.ride.transfer_status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : rideDetails.ride.transfer_status === 'withheld'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {rideDetails.ride.transfer_status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Hold Amount</p>
                        <p className="text-sm text-gray-900">{formatCurrency(rideDetails.ride.hold_amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Started At</p>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDateTime(rideDetails.ride.boarded_at)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completed At</p>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDateTime(rideDetails.ride.dropped_at)}</span>
                        </div>
                      </div>
                      {rideDetails.ride.card_id && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Card ID</p>
                          <p className="text-sm font-mono text-gray-900">{rideDetails.ride.card_id}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Additional Ride Info */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Driver User ID</p>
                          <p className="text-sm font-mono text-gray-900">{rideDetails.ride.driver_user_id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Vehicle ID</p>
                          <p className="text-sm font-mono text-gray-900">{rideDetails.ride.vehicle_id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Route ID</p>
                          <p className="text-sm font-mono text-gray-900">{rideDetails.ride.route_id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Scheduled Trip ID</p>
                          <p className="text-sm font-mono text-gray-900">{rideDetails.ride.scheduled_trip_id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Ledger Entries</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{rideDetails.ledger_entry_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Funding Allocations</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{rideDetails.funding_allocation_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Payout Transfers</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{rideDetails.payout_transfer_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Payout Reversals</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{rideDetails.payout_transfer_reversal_count || 0}</p>
                  </div>
                </div>

                {/* Ledger Entries Table */}
                {rideDetails.ledger_entries && rideDetails.ledger_entries.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5" />
                        Ledger Entries
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rideDetails.ledger_entries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4">
                                {getLedgerEntryTypeBadge(entry.entry_type)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {getAmountDisplay(entry)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatCurrency(entry.balance_after)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                {entry.note || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatDateTime(entry.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Funding Allocations Table */}
                {rideDetails.funding_allocations && rideDetails.funding_allocations.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCardIcon className="w-5 h-5" />
                        Funding Allocations
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recharge ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rideDetails.funding_allocations.map((allocation, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {formatCurrency(allocation.amount)}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {allocation.recharge_id?.slice(0, 12)}...
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {allocation.driver_user_id?.slice(0, 12)}...
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {allocation.vehicle_id?.slice(0, 12)}...
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatDateTime(allocation.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payout Transfers Table */}
                {rideDetails.payout_transfers && rideDetails.payout_transfers.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CurrencyRupeeIcon className="w-5 h-5" />
                        Payout Transfers
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payable Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rideDetails.payout_transfers.map((transfer, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {formatCurrency(transfer.amount)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                                {formatCurrency(transfer.payable_amount)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                  transfer.status === 'completed' || transfer.status === 'processed'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : transfer.status === 'withheld'
                                    ? 'bg-orange-50 text-orange-700'
                                    : transfer.status === 'failed'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {transfer.status?.toUpperCase() || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-red-600 max-w-xs">
                                {transfer.failure_reason || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatDateTime(transfer.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Failure Reason Info Box */}
                {rideDetails.payout_transfers?.some(t => t.failure_reason) && (
                  <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-orange-700">
                          <strong>Payout Withheld:</strong> The payout is withheld because the funding source is not a Razorpay payment. 
                          Use the "Refresh Withheld" action on the dashboard after fixing the funding source.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!rideDetails && !loading && !error && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Ride Selected</h3>
                <p className="text-gray-500">Select a ride from the dropdown or enter a Ride ID above</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading ride details...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RideHistory;