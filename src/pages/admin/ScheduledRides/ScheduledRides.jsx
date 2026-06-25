import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";

import { 
  ClockIcon, 
  CalendarIcon, 
  UserIcon, 
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  StopCircleIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowPathIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const ScheduledRides = () => {
    const BASE_URL = "https://be.shuttleapp.transev.site/admin";
    const token = localStorage.getItem("access_token");
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const [trips, setTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showVehicleTripsModal, setShowVehicleTripsModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedVehicleTrips, setSelectedVehicleTrips] = useState([]);
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

    // Fetch trips
    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/trips/monitor`, axiosConfig);
            setTrips(res.data);
            setFilteredTrips(res.data);
        } catch (err) {
            console.error("Error fetching trips:", err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...trips];

        if (searchTerm) {
            result = result.filter(trip =>
                trip.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.route_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.trip_id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(trip => trip.status === statusFilter);
        }

        setFilteredTrips(result);
    }, [searchTerm, statusFilter, trips]);

    const getStatusConfig = (status) => {
        switch (status) {
            case "completed":
                return { icon: CheckCircleIcon, color: "text-green-700", bg: "bg-green-100", label: "Completed", description: "Trip completed successfully" };
            case "in_progress":
                return { icon: PlayCircleIcon, color: "text-blue-700", bg: "bg-blue-100", label: "In Progress", description: "Trip is currently active" };
            case "scheduled":
                return { icon: CalendarIcon, color: "text-yellow-700", bg: "bg-yellow-100", label: "Scheduled", description: "Trip is planned for future" };
            case "cancelled":
                return { icon: XCircleIcon, color: "text-red-700", bg: "bg-red-100", label: "Cancelled", description: "Trip was cancelled" };
            case "premature_end":
                return { icon: StopCircleIcon, color: "text-orange-700", bg: "bg-orange-100", label: "Premature End", description: "Trip ended early" };
            default:
                return { icon: ClockIcon, color: "text-gray-700", bg: "bg-gray-100", label: status || "Unknown", description: "Status unknown" };
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date - now;
        const diffMins = Math.round(diffMs / 60000);
        
        if (diffMins < 0) return `${Math.abs(diffMins)} mins ago`;
        if (diffMins === 0) return "Now";
        if (diffMins < 60) return `${diffMins} mins from now`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours from now`;
        return `${Math.floor(diffHours / 24)} days from now`;
    };

    const getCancellationReason = (trip) => {
        if (trip.cancellation_reason) {
            return { reason: trip.cancellation_reason, type: "cancellation" };
        }
        if (trip.premature_end_reason) {
            return { reason: trip.premature_end_reason, type: "premature_end" };
        }
        return null;
    };

    // Group trips by vehicle for better understanding
    const tripsByVehicle = filteredTrips.reduce((acc, trip) => {
        const vehicle = trip.vehicle || "Unknown Vehicle";
        if (!acc[vehicle]) acc[vehicle] = [];
        acc[vehicle].push(trip);
        return acc;
    }, {});

    // Sort trips within each vehicle by planned start time (newest first)
    Object.keys(tripsByVehicle).forEach(vehicle => {
        tripsByVehicle[vehicle].sort((a, b) => new Date(b.planned_start) - new Date(a.planned_start));
    });

    const handleViewAllTrips = (vehicle, trips) => {
        setSelectedVehicle(vehicle);
        setSelectedVehicleTrips(trips);
        setShowVehicleTripsModal(true);
    };

    const stats = {
        total: trips.length,
        completed: trips.filter(t => t.status === "completed").length,
        inProgress: trips.filter(t => t.status === "in_progress").length,
        scheduled: trips.filter(t => t.status === "scheduled").length,
        cancelled: trips.filter(t => t.status === "cancelled").length,
        prematureEnd: trips.filter(t => t.status === "premature_end").length,
        totalBookings: trips.reduce((sum, t) => sum + (t.bookings_count || 0), 0),
        uniqueVehicles: new Set(trips.map(t => t.vehicle).filter(Boolean)).size,
        uniqueDrivers: new Set(trips.map(t => t.driver).filter(Boolean)).size
    };

    if (initialLoad || loading) {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar onClose={() => setSidebarOpen(false)} />
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                    <TopNavbar 
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                        isMobile={isMobile} 
                        title="Trip Management" 
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-600 text-sm sm:text-base">Loading trip schedules...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                <TopNavbar 
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                    isMobile={isMobile} 
                    title="Trip Management" 
                />
                
                <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-blue-800">Understanding Trip Records</p>
                                <p className="text-[11px] sm:text-xs text-blue-600 mt-1">
                                    Each row represents a <strong>trip instance</strong> - a specific journey of a vehicle at a particular time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide">Total Trip Instances</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Individual journeys</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide">Active Vehicles</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.uniqueVehicles}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Unique registration numbers</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide">Active Drivers</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.uniqueDrivers}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Drivers operating trips</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide">Total Bookings</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Across all trips</p>
                        </div>
                    </div>

                    {/* Status Breakdown - Responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
                            <p className="text-green-700 text-[10px] sm:text-xs font-medium">Completed</p>
                            <p className="text-lg sm:text-xl font-bold text-green-800">{stats.completed}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                            <p className="text-blue-700 text-[10px] sm:text-xs font-medium">In Progress</p>
                            <p className="text-lg sm:text-xl font-bold text-blue-800">{stats.inProgress}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-2 sm:p-3 border border-yellow-200">
                            <p className="text-yellow-700 text-[10px] sm:text-xs font-medium">Scheduled</p>
                            <p className="text-lg sm:text-xl font-bold text-yellow-800">{stats.scheduled}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2 sm:p-3 border border-red-200">
                            <p className="text-red-700 text-[10px] sm:text-xs font-medium">Cancelled</p>
                            <p className="text-lg sm:text-xl font-bold text-red-800">{stats.cancelled}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2 sm:p-3 border border-orange-200">
                            <p className="text-orange-700 text-[10px] sm:text-xs font-medium">Premature End</p>
                            <p className="text-lg sm:text-xl font-bold text-orange-800">{stats.prematureEnd}</p>
                        </div>
                    </div>

                    {/* Search and Filter - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by Trip ID, Route, Driver, or Vehicle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors text-xs sm:text-sm"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer text-xs sm:text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="premature_end">Premature End</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                fetchTrips();
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
                        >
                            Reset Filters
                        </button>
                    </div>

                    {/* Trips Table - Responsive with horizontal scroll */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1000px] lg:min-w-full w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Trip ID / Route</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled Time</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Bookings</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTrips.map((trip, idx) => {
                                        const StatusIcon = getStatusConfig(trip.status).icon;
                                        const statusConfig = getStatusConfig(trip.status);
                                        
                                        return (
                                            <tr key={trip.trip_id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <p className="text-[10px] sm:text-xs font-mono text-gray-500">{trip.trip_id?.substring(0, 13)}...</p>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 mt-1 break-words max-w-[200px]">{trip.route_name}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-400">{trip.route_code}</p>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px]">{trip.driver || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                            <TruckIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-xs sm:text-sm text-gray-900 font-mono break-all">{trip.vehicle || "N/A"}</span>
                                                        </div>
                                                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Registration</p>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs sm:text-sm text-gray-800">{formatDateTime(trip.planned_start)}</span>
                                                        <span className="text-[10px] sm:text-xs text-gray-500 mt-1">{getRelativeTime(trip.planned_start)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-700">
                                                        {trip.bookings_count || 0} passengers
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${statusConfig.bg} ${statusConfig.color} w-fit`}>
                                                            <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs text-gray-400 hidden sm:inline">{statusConfig.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTrip(trip);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-all duration-200"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredTrips.length === 0 && (
                            <div className="text-center py-8 sm:py-12">
                                <p className="text-gray-500 text-sm">No trip instances found</p>
                            </div>
                        )}
                    </div>

                    {/* Vehicle Summary Section - Responsive */}
                    <div className="mt-4 sm:mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                            <TruckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            Vehicle Trip Summary (Same vehicle can have multiple trips)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {Object.entries(tripsByVehicle).slice(0, isMobile ? 6 : undefined).map(([vehicle, vehicleTrips]) => {
                                const displayTrips = vehicleTrips.slice(0, isMobile ? 2 : 3);
                                const remainingCount = vehicleTrips.length - displayTrips.length;
                                
                                return (
                                    <div key={vehicle} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-xs sm:text-sm font-semibold text-gray-800 break-all">{vehicle}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{vehicleTrips.length} trip(s)</p>
                                            </div>
                                            {remainingCount > 0 && (
                                                <button
                                                    onClick={() => handleViewAllTrips(vehicle, vehicleTrips)}
                                                    className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 flex-shrink-0 ml-2"
                                                >
                                                    View all <ChevronRightIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {displayTrips.map(trip => (
                                                <span 
                                                    key={trip.trip_id} 
                                                    className={`text-[9px] sm:text-xs px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusConfig(trip.status).bg} ${getStatusConfig(trip.status).color}`}
                                                    onClick={() => {
                                                        setSelectedTrip(trip);
                                                        setShowDetailModal(true);
                                                    }}
                                                    title={`Click to view trip details - ${trip.route_name}`}
                                                >
                                                    {formatTime(trip.planned_start)}
                                                </span>
                                            ))}
                                            {remainingCount > 0 && (
                                                <button
                                                    onClick={() => handleViewAllTrips(vehicle, vehicleTrips)}
                                                    className="text-[9px] sm:text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                                                >
                                                    +{remainingCount}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Details Modal - Responsive */}
            {showDetailModal && selectedTrip && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-xl font-semibold text-gray-900">Trip Instance Details</h3>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1 break-all">Trip ID: {selectedTrip.trip_id}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl sm:text-2xl ml-2 flex-shrink-0">✕</button>
                        </div>
                        
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                                <p className="text-[11px] sm:text-xs text-blue-700 font-medium">This is a specific trip instance</p>
                                <p className="text-[10px] sm:text-xs text-blue-600 mt-1">Vehicle {selectedTrip.vehicle} is scheduled for this specific journey at this time.</p>
                            </div>

                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                                    <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Trip Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div className="col-span-1 sm:col-span-2">
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Route</p>
                                        <p className="text-sm sm:text-base text-gray-900 font-medium mt-1 break-words">{selectedTrip.route_name}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-400">{selectedTrip.route_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Driver</p>
                                        <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{selectedTrip.driver || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Vehicle Registration</p>
                                        <p className="text-sm sm:text-base text-gray-900 font-mono font-medium mt-1 break-all">{selectedTrip.vehicle || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Scheduled Start</p>
                                        <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{formatDateTime(selectedTrip.planned_start)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium mt-1 ${getStatusConfig(selectedTrip.status).bg} ${getStatusConfig(selectedTrip.status).color}`}>
                                            {getStatusConfig(selectedTrip.status).label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Bookings</p>
                                        <p className="text-sm sm:text-base text-gray-900 font-medium mt-1">{selectedTrip.bookings_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {(selectedTrip.cancellation_reason || selectedTrip.premature_end_reason) && (
                                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-3 sm:p-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs sm:text-sm font-semibold text-red-800 uppercase tracking-wide">
                                                {selectedTrip.cancellation_reason ? "Cancellation Reason" : "Premature End Reason"}
                                            </p>
                                            <p className="text-xs sm:text-sm text-red-700 mt-1 break-words">
                                                {selectedTrip.cancellation_reason || selectedTrip.premature_end_reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {selectedTrip.admin_note && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Note</p>
                                    <p className="text-xs sm:text-sm text-gray-700 break-words">{selectedTrip.admin_note}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                            <button onClick={() => setShowDetailModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 text-xs sm:text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle All Trips Modal - Responsive */}
            {showVehicleTripsModal && selectedVehicle && selectedVehicleTrips.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowVehicleTripsModal(false)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full shadow-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-xl font-semibold text-gray-900">All Trips for Vehicle</h3>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    <span className="font-mono font-semibold break-all">{selectedVehicle}</span> - {selectedVehicleTrips.length} total trip(s)
                                </p>
                            </div>
                            <button onClick={() => setShowVehicleTripsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl sm:text-2xl ml-2 flex-shrink-0">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-3">
                                {selectedVehicleTrips.map((trip, idx) => {
                                    const StatusIcon = getStatusConfig(trip.status).icon;
                                    const statusConfig = getStatusConfig(trip.status);
                                    
                                    return (
                                        <div 
                                            key={trip.trip_id}
                                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                            onClick={() => {
                                                setShowVehicleTripsModal(false);
                                                setSelectedTrip(trip);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-[10px] sm:text-xs font-mono text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded">
                                                            {trip.trip_id?.substring(0, 13)}...
                                                        </p>
                                                        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                            <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-900 mt-2 break-words">{trip.route_name}</p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500">{trip.route_code}</p>
                                                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                                            <span className="text-[10px] sm:text-xs text-gray-600 truncate max-w-[100px]">{trip.driver || "N/A"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                                            <span className="text-[10px] sm:text-xs text-gray-600">{formatDateTime(trip.planned_start)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <DocumentTextIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                                            <span className="text-[10px] sm:text-xs text-gray-600">{trip.bookings_count || 0} bookings</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 self-end sm:self-center" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex justify-end p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
                            <button onClick={() => setShowVehicleTripsModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200 text-xs sm:text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduledRides;