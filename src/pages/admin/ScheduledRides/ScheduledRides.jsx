import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
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
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopNavbarUltra title="Trip Management" />
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p className="text-gray-600">Loading trip schedules...</p>
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
                <TopNavbarUltra title="Trip Management" />
                
                <div className="flex-1 overflow-auto p-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <ArrowPathIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Understanding Trip Records</p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Each row represents a <strong>trip instance</strong> - a specific journey of a vehicle at a particular time. 
                                    The same vehicle (registration number) can appear in multiple trips as it runs different schedules. 
                                    Trip ID uniquely identifies each journey.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Total Trip Instances</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            <p className="text-xs text-gray-400 mt-1">Individual journeys</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Active Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.uniqueVehicles}</p>
                            <p className="text-xs text-gray-400 mt-1">Unique registration numbers</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Active Drivers</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.uniqueDrivers}</p>
                            <p className="text-xs text-gray-400 mt-1">Drivers operating trips</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-500 text-xs uppercase tracking-wide">Total Bookings</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                            <p className="text-xs text-gray-400 mt-1">Across all trips</p>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-green-700 text-xs font-medium">Completed</p>
                            <p className="text-xl font-bold text-green-800">{stats.completed}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-blue-700 text-xs font-medium">In Progress</p>
                            <p className="text-xl font-bold text-blue-800">{stats.inProgress}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <p className="text-yellow-700 text-xs font-medium">Scheduled</p>
                            <p className="text-xl font-bold text-yellow-800">{stats.scheduled}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <p className="text-red-700 text-xs font-medium">Cancelled</p>
                            <p className="text-xl font-bold text-red-800">{stats.cancelled}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <p className="text-orange-700 text-xs font-medium">Premature End</p>
                            <p className="text-xl font-bold text-orange-800">{stats.prematureEnd}</p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by Trip ID, Route, Driver, or Vehicle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-colors cursor-pointer"
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
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all duration-200 font-medium"
                        >
                            Reset Filters
                        </button>
                    </div>

                    {/* Trips Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trip ID / Route</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Driver</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehicle (Reg No)</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bookings</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredTrips.map((trip, idx) => {
                                        const StatusIcon = getStatusConfig(trip.status).icon;
                                        const statusConfig = getStatusConfig(trip.status);
                                        
                                        return (
                                            <tr 
                                                key={trip.trip_id} 
                                                className="hover:bg-gray-50 transition-colors duration-150"
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-mono text-gray-500">{trip.trip_id?.substring(0, 13)}...</p>
                                                    <p className="font-medium text-gray-900 mt-1">{trip.route_name}</p>
                                                    <p className="text-xs text-gray-400">{trip.route_code}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-700">{trip.driver || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <TruckIcon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-900 font-mono text-sm">{trip.vehicle || "N/A"}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">Vehicle Registration</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-800">{formatDateTime(trip.planned_start)}</span>
                                                        <span className="text-xs text-gray-500 mt-1">{getRelativeTime(trip.planned_start)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {trip.bookings_count || 0} passengers
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} w-fit`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{statusConfig.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTrip(trip);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-all duration-200"
                                                    >
                                                        View Trip Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredTrips.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No trip instances found</p>
                            </div>
                        )}
                    </div>

                    {/* Vehicle Summary Section */}
                    <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <TruckIcon className="w-4 h-4" />
                            Vehicle Trip Summary (Same vehicle can have multiple trips)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(tripsByVehicle).map(([vehicle, vehicleTrips]) => {
                                const displayTrips = vehicleTrips.slice(0, 3);
                                const remainingCount = vehicleTrips.length - 3;
                                
                                return (
                                    <div key={vehicle} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-gray-800">{vehicle}</p>
                                                <p className="text-xs text-gray-500 mt-1">{vehicleTrips.length} trip(s)</p>
                                            </div>
                                            {remainingCount > 0 && (
                                                <button
                                                    onClick={() => handleViewAllTrips(vehicle, vehicleTrips)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                >
                                                    View all <ChevronRightIcon className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {displayTrips.map(trip => (
                                                <span 
                                                    key={trip.trip_id} 
                                                    className={`text-xs px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusConfig(trip.status).bg} ${getStatusConfig(trip.status).color}`}
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
                                                    className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                                                >
                                                    +{remainingCount} more
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

            {/* Trip Details Modal */}
            {showDetailModal && selectedTrip && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Trip Instance Details</h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">Trip ID: {selectedTrip.trip_id}</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-700 font-medium">This is a specific trip instance</p>
                                <p className="text-xs text-blue-600 mt-1">Vehicle {selectedTrip.vehicle} is scheduled for this specific journey at this time.</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Trip Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
                                        <p className="text-gray-900 font-medium mt-1">{selectedTrip.route_name}</p>
                                        <p className="text-xs text-gray-400">{selectedTrip.route_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Driver</p>
                                        <p className="text-gray-900 font-medium mt-1">{selectedTrip.driver || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle Registration</p>
                                        <p className="text-gray-900 font-mono font-medium mt-1">{selectedTrip.vehicle || "N/A"}</p>
                                        <p className="text-xs text-gray-400">Vehicle number (same vehicle can appear in multiple trips)</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled Start</p>
                                        <p className="text-gray-900 font-medium mt-1">{formatDateTime(selectedTrip.planned_start)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${getStatusConfig(selectedTrip.status).bg} ${getStatusConfig(selectedTrip.status).color}`}>
                                            {getStatusConfig(selectedTrip.status).label}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bookings</p>
                                        <p className="text-gray-900 font-medium mt-1">{selectedTrip.bookings_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {(selectedTrip.cancellation_reason || selectedTrip.premature_end_reason) && (
                                <div className="border-l-4 border-red-500 bg-red-50 rounded-r-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <XCircleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-red-800 uppercase tracking-wide">
                                                {selectedTrip.cancellation_reason ? "Cancellation Reason" : "Premature End Reason"}
                                            </p>
                                            <p className="text-red-700 mt-1 text-base">
                                                {selectedTrip.cancellation_reason || selectedTrip.premature_end_reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {selectedTrip.admin_note && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Note</p>
                                    <p className="text-gray-700 text-sm">{selectedTrip.admin_note}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehicle All Trips Modal */}
            {showVehicleTripsModal && selectedVehicle && selectedVehicleTrips.length > 0 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowVehicleTripsModal(false)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 shadow-xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">All Trips for Vehicle</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    <span className="font-mono font-semibold">{selectedVehicle}</span> - {selectedVehicleTrips.length} total trip(s)
                                </p>
                            </div>
                            <button onClick={() => setShowVehicleTripsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-2xl">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-6">
                            <div className="grid grid-cols-1 gap-3">
                                {selectedVehicleTrips.map((trip, idx) => {
                                    const StatusIcon = getStatusConfig(trip.status).icon;
                                    const statusConfig = getStatusConfig(trip.status);
                                    
                                    return (
                                        <div 
                                            key={trip.trip_id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                            onClick={() => {
                                                setShowVehicleTripsModal(false);
                                                setSelectedTrip(trip);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <p className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                            {trip.trip_id?.substring(0, 13)}...
                                                        </p>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-gray-900 mt-2">{trip.route_name}</p>
                                                    <p className="text-xs text-gray-500">{trip.route_code}</p>
                                                    <div className="flex flex-wrap gap-4 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <UserIcon className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-600">{trip.driver || "N/A"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <CalendarIcon className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-600">{formatDateTime(trip.planned_start)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <ClockIcon className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-600">{getRelativeTime(trip.planned_start)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <DocumentTextIcon className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs text-gray-600">{trip.bookings_count || 0} bookings</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button onClick={() => setShowVehicleTripsModal(false)} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all duration-200">
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