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
  XMarkIcon
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

  // Check if mobile/tablet view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all passengers
  const fetchAllPassengers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/view/all-passengers`,
        axiosConfig
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching passengers:", error);
      return [];
    }
  };

  // Fetch booking history for a specific passenger
  const fetchPassengerBookings = async (passengerId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/passenger/${passengerId}`,
        axiosConfig
      );
      return response.data?.booking_history?.bookings || [];
    } catch (error) {
      console.error(`Error fetching bookings for passenger ${passengerId}:`, error);
      return [];
    }
  };

  // Fetch all bookings from all passengers
  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      // First get all passengers
      const passengers = await fetchAllPassengers();
      setAllPassengers(passengers);

      // Then fetch bookings for each passenger
      const allBookingsPromises = passengers.map(async (passenger) => {
        const bookings = await fetchPassengerBookings(passenger.user_id);
        return bookings.map(booking => ({
          ...booking,
          passenger_name: passenger.profile?.full_name || passenger.profile?.name || "N/A",
          passenger_email: passenger.email,
          passenger_phone: passenger.profile?.phone || "N/A",
          passenger_id: passenger.user_id,
          passenger_avatar: passenger.profile?.avatar,
          // Ensure we have a valid date for sorting
          booking_date: booking.created_at || booking.timestamp || booking.date || new Date().toISOString()
        }));
      });

      const allBookingsArrays = await Promise.all(allBookingsPromises);
      const flatBookings = allBookingsArrays.flat();
      
      // Sort by date (newest first)
      flatBookings.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
      
      setAllBookings(flatBookings);
      
      // Group bookings by date
      groupBookingsByDate(flatBookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Group bookings by date (Today, Yesterday, Older)
  const groupBookingsByDate = (bookings) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const grouped = {
      today: [],
      yesterday: [],
      older: []
    };
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_date);
      bookingDate.setHours(0, 0, 0, 0);
      
      if (bookingDate.getTime() === today.getTime()) {
        grouped.today.push(booking);
      } else if (bookingDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(booking);
      } else {
        grouped.older.push(booking);
      }
    });
    
    // Sort each group by date (newest first)
    grouped.today.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    grouped.yesterday.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    grouped.older.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    
    const result = [];
    
    if (grouped.today.length > 0) {
      result.push({ title: "Today", bookings: grouped.today, date: today });
    }
    if (grouped.yesterday.length > 0) {
      result.push({ title: "Yesterday", bookings: grouped.yesterday, date: yesterday });
    }
    if (grouped.older.length > 0) {
      result.push({ title: "Previous Bookings", bookings: grouped.older });
    }
    
    setGroupedBookings(result);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    await fetchAllBookings();
    setLoading(false);
  };

  // Handle view booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Filter bookings based on search term
  const getFilteredGroupedBookings = () => {
    if (!searchTerm) return groupedBookings;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return groupedBookings.map(group => ({
      ...group,
      bookings: group.bookings.filter(booking =>
        booking.passenger_name?.toLowerCase().includes(lowerSearchTerm) ||
        booking.passenger_email?.toLowerCase().includes(lowerSearchTerm) ||
        booking.booking_id?.toLowerCase().includes(lowerSearchTerm) ||
        booking.pickup_stop?.name?.toLowerCase().includes(lowerSearchTerm) ||
        booking.dropoff_stop?.name?.toLowerCase().includes(lowerSearchTerm)
      )
    })).filter(group => group.bookings.length > 0);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "booked":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "N/A";
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const filteredGroupedBookings = getFilteredGroupedBookings();
  const totalBookings = allBookings.length;

  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
          <TopNavbar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            isMobile={isMobile} 
            title="Passenger All Trips" 
          />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-gray-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
              <p className="text-gray-500 font-medium text-sm sm:text-base">Loading passenger trips...</p>
              <p className="text-xs text-gray-400 mt-1">Fetching all booking history</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Sidebar onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
        <TopNavbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          isMobile={isMobile} 
          title="Passenger All Trips" 
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    All Passenger Trips
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    View complete booking history of all passengers
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalBookings}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Unique Passengers</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{allPassengers.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Today's Bookings</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {groupedBookings.find(g => g.title === "Today")?.bookings.length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(allBookings.reduce((sum, b) => sum + (b.fare || 0), 0))}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by passenger name, email, booking ID, or stop..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Bookings by Date */}
            {filteredGroupedBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredGroupedBookings.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    {/* Group Header */}
                    <div className="flex items-center gap-2">
                      <div className={`w-1 h-6 rounded-full ${
                        group.title === "Today" ? "bg-blue-500" :
                        group.title === "Yesterday" ? "bg-amber-500" : "bg-gray-400"
                      }`} />
                      <h2 className="text-lg font-semibold text-gray-800">{group.title}</h2>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {group.bookings.length} bookings
                      </span>
                    </div>

                    {/* Bookings Cards */}
                    <div className="grid grid-cols-1 gap-3">
                      {group.bookings.map((booking, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          <div className="p-4">
                            {/* Header Row */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                  {booking.passenger_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                    {booking.passenger_name}
                                  </p>
                                  <p className="text-xs text-gray-400 font-mono">
                                    ID: {booking.booking_id?.slice(0, 13)}...
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                {booking.status?.toUpperCase() || "UNKNOWN"}
                              </span>
                            </div>

                            {/* Trip Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPinIcon className="w-3 h-3 text-green-500" />
                                  <span>Pickup</span>
                                </div>
                                <p className="text-sm text-gray-800">{booking.pickup_stop?.name || "N/A"}</p>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPinIcon className="w-3 h-3 text-red-500" />
                                  <span>Dropoff</span>
                                </div>
                                <p className="text-sm text-gray-800">{booking.dropoff_stop?.name || "N/A"}</p>
                              </div>
                            </div>

                            {/* Actual Dropoff (if different) */}
                            {booking.actual_drop_stop_name && booking.actual_drop_stop_name !== booking.dropoff_stop?.name && (
                              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                  <span>🔽</span>
                                  <span className="font-semibold">Actually dropped at:</span>
                                  <span>{booking.actual_drop_stop_name}</span>
                                  {booking.actual_dropped_at && (
                                    <span className="text-gray-400 text-xs">
                                      at {new Date(booking.actual_dropped_at).toLocaleTimeString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Footer Row */}
                            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-gray-100">
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <CurrencyRupeeIcon className="w-3 h-3" />
                                  <span className="font-semibold text-gray-800">{formatCurrency(booking.fare)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  <span>{formatDate(booking.booking_date)}</span>
                                </div>
                                {booking.passenger_email && (
                                  <div className="flex items-center gap-1">
                                    <EnvelopeIcon className="w-3 h-3" />
                                    <span className="truncate max-w-[150px]">{booking.passenger_email}</span>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                              >
                                <EyeIcon className="w-3 h-3" />
                                View Details
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

      {/* Booking Details Modal */}


{/* Booking Details Modal - Full scrollable */}
{showDetailsModal && selectedBooking && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowDetailsModal(false)}>
    <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-[90%] md:w-[85%] lg:w-[800px] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
      
      {/* Modal Header - Fixed at top */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10 rounded-t-2xl flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl font-bold text-white truncate">Booking Details</h2>
          <p className="text-indigo-100 text-[10px] sm:text-xs font-mono truncate">
            ID: {selectedBooking.booking_id}
          </p>
        </div>
        <button
          onClick={() => setShowDetailsModal(false)}
          className="text-white hover:bg-white/20 rounded-lg p-1 transition-all flex-shrink-0 ml-2"
        >
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Modal Content - Scrollable area */}
      <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Passenger Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-4 border border-indigo-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            Passenger Information
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block">Name</label>
                <p className="text-sm font-semibold text-gray-900 break-words">{selectedBooking.passenger_name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 block">Passenger ID</label>
                <p className="text-xs font-mono text-gray-500 break-all">{selectedBooking.passenger_id}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Email</label>
              <p className="text-sm text-gray-700 break-all">{selectedBooking.passenger_email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Phone</label>
              <p className="text-sm text-gray-700">{selectedBooking.passenger_phone}</p>
            </div>
          </div>
        </div>

        {/* Trip Section */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Trip Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block">Pickup Stop</label>
              <p className="text-sm font-medium text-gray-900 mt-1 flex items-start gap-2">
                <span className="text-green-600 flex-shrink-0">🚏</span>
                <span className="break-words">{selectedBooking.pickup_stop?.name || "N/A"}</span>
              </p>
              {selectedBooking.pickup_stop?.sequence && (
                <p className="text-xs text-gray-400 ml-6">Stop #{selectedBooking.pickup_stop.sequence}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Planned Dropoff Stop</label>
              <p className="text-sm font-medium text-gray-900 mt-1 flex items-start gap-2">
                <span className="text-red-600 flex-shrink-0">📍</span>
                <span className="break-words">{selectedBooking.dropoff_stop?.name || "N/A"}</span>
              </p>
              {selectedBooking.dropoff_stop?.sequence && (
                <p className="text-xs text-gray-400 ml-6">Stop #{selectedBooking.dropoff_stop.sequence}</p>
              )}
            </div>
            
            {/* Actual Dropoff */}
            {selectedBooking.actual_drop_stop_name && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <label className="text-xs text-blue-600 font-semibold block">🔽 Actual Dropoff Stop</label>
                <p className="text-sm font-bold text-blue-700 mt-1 flex items-start gap-2">
                  <span className="text-blue-600 flex-shrink-0">📍</span>
                  <span className="break-words">{selectedBooking.actual_drop_stop_name}</span>
                </p>
                {selectedBooking.actual_dropped_at && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Dropped at: {new Date(selectedBooking.actual_dropped_at).toLocaleString()}
                  </p>
                )}
                {selectedBooking.actual_drop_stop_name !== selectedBooking.dropoff_stop?.name && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1 ml-6">
                    <span>⚠️</span> Different location than planned
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Financial Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 border border-emerald-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <CurrencyRupeeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            Financial Details
          </h3>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm text-gray-600">Fare Amount</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(selectedBooking.fare)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
              <span className="text-sm text-gray-600">Booking Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedBooking.status)}`}>
                {selectedBooking.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Date Section - Now fully scrollable */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            Date Information
          </h3>
          <div className="space-y-3">
            {(selectedBooking.booking_date || selectedBooking.created_at) ? (
              <>
                {/* Booking Date & Time */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="text-xs text-gray-500 font-medium sm:w-28 flex-shrink-0">Booking Date:</span>
                  <span className="text-sm text-gray-900 font-medium break-words">
                    {formatDate(selectedBooking.booking_date || selectedBooking.created_at)}
                  </span>
                </div>
                
                {/* Full Day Information */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium sm:w-28 flex-shrink-0">Day:</span>
                  <span className="text-sm text-gray-800 break-words">
                    {new Date(selectedBooking.booking_date || selectedBooking.created_at).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Time Information (if available) */}
                {(selectedBooking.booking_date || selectedBooking.created_at) && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 pt-1">
                    <span className="text-xs text-gray-500 font-medium sm:w-28 flex-shrink-0">Time:</span>
                    <span className="text-sm text-gray-700 break-words">
                      {new Date(selectedBooking.booking_date || selectedBooking.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="text-xs text-gray-500 font-medium sm:w-28 flex-shrink-0">Booking Date:</span>
                <span className="text-sm text-gray-500">N/A</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Footer - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-end rounded-b-2xl flex-shrink-0">
        <button
          onClick={() => setShowDetailsModal(false)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-xs sm:text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PassengerAllTrips;