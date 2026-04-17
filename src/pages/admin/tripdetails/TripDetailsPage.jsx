// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
// import {
//     ClockIcon,
//     UserGroupIcon,
//     TruckIcon,
//     CalendarIcon,
//     CheckCircleIcon,
//     XCircleIcon,
//     ExclamationTriangleIcon,
//     ChevronRightIcon,
//     EnvelopeIcon,
//     CalendarDaysIcon,
//     CurrencyRupeeIcon,
//     FlagIcon
// } from "@heroicons/react/24/solid";
// import {
//     ArrowPathIcon,
//     MagnifyingGlassIcon,
//     XMarkIcon
// } from "@heroicons/react/24/outline";

// const TripDetailsPage = () => {
//     const BASE_URL = "https://be.shuttleapp.transev.site/admin";
//     const token = localStorage.getItem("access_token");
//     const axiosConfig = {
//         headers: {
//             Authorization: `Bearer ${token}`,
//             'Cache-Control': 'no-cache',
//             'Pragma': 'no-cache'
//         }
//     };

//     const [trips, setTrips] = useState([]);
//     const [selectedTrip, setSelectedTrip] = useState(null);
//     const [cancelReason, setCancelReason] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [initialLoad, setInitialLoad] = useState(true);
//     const [loadingTrips, setLoadingTrips] = useState(true);
//     const [cancelError, setCancelError] = useState("");
//     const [searchTerm, setSearchTerm] = useState("");
//     const [statusFilter, setStatusFilter] = useState("all");
//     const [tripLoadError, setTripLoadError] = useState(null);

//     // Manual completion states
//     const [showCompleteModal, setShowCompleteModal] = useState(false);
//     const [completionNote, setCompletionNote] = useState("");
//     const [completingTrip, setCompletingTrip] = useState(false);
//     const [completionError, setCompletionError] = useState("");

//     // Passenger modal states
//     const [selectedPassenger, setSelectedPassenger] = useState(null);
//     const [showPassengerModal, setShowPassengerModal] = useState(false);
//     const [loadingPassenger, setLoadingPassenger] = useState(false);
//     const [passengerDetails, setPassengerDetails] = useState(null);

//     const fetchTrips = async () => {
//         setLoadingTrips(true);
//         setTripLoadError(null);
//         try {
//             console.log("Fetching trips from:", `${BASE_URL}/trips/monitor`);
//             const res = await axios.get(`${BASE_URL}/trips/monitor`, {
//                 ...axiosConfig,
//                 headers: {
//                     ...axiosConfig.headers,
//                     'Cache-Control': 'no-cache',
//                     'Pragma': 'no-cache'
//                 }
//             });
//             console.log("Trips fetched successfully:", res.data);
//             setTrips(res.data);
//         } catch (err) {
//             console.error("Error fetching trips:", err);
//             setTripLoadError("Failed to load trips. Please refresh the page.");
//         } finally {
//             setLoadingTrips(false);
//             setInitialLoad(false);
//         }
//     };

//     const fetchTripDetails = useCallback(async (trip_id) => {
//         if (!trip_id) {
//             console.error("No trip ID provided");
//             return;
//         }

//         setLoading(true);
//         setCancelError("");
//         setTripLoadError(null);

//         try {
//             const url = `${BASE_URL}/trips/${trip_id}`;
//             console.log("Fetching trip details from:", url);
//             console.log("Using token:", token ? "Token exists" : "No token");

//             const response = await axios.get(url, {
//                 ...axiosConfig,
//                 headers: {
//                     ...axiosConfig.headers,
//                     'Cache-Control': 'no-cache',
//                     'Pragma': 'no-cache',
//                     'Expires': '0'
//                 }
//             });

//             console.log("Trip details response:", response.data);
//             setSelectedTrip(response.data);
//         } catch (err) {
//             console.error("Error fetching trip details:", err);
//             console.error("Error response:", err.response);
//             console.error("Error status:", err.response?.status);
//             console.error("Error data:", err.response?.data);

//             let errorMessage = "Failed to load trip details";
//             if (err.response?.status === 401) {
//                 errorMessage = "Authentication failed. Please login again.";
//             } else if (err.response?.status === 404) {
//                 errorMessage = "Trip not found.";
//             } else if (err.response?.status === 403) {
//                 errorMessage = "You don't have permission to view this trip.";
//             }

//             setTripLoadError(errorMessage);
//             alert(errorMessage);
//         } finally {
//             setLoading(false);
//         }
//     }, [axiosConfig, token]);

//     const fetchPassengerDetails = async (passengerId) => {
//         if (!passengerId || passengerId === 'undefined') {
//             console.error("Invalid passenger ID:", passengerId);
//             alert("Unable to fetch passenger details: Invalid passenger ID");
//             return;
//         }

//         setLoadingPassenger(true);
//         try {
//             const url = `${BASE_URL}/passenger/${passengerId}`;
//             console.log("Fetching passenger details from:", url);
//             const res = await axios.get(url, {
//                 ...axiosConfig,
//                 headers: {
//                     ...axiosConfig.headers,
//                     'Cache-Control': 'no-cache',
//                     'Pragma': 'no-cache'
//                 }
//             });
//             console.log("Passenger details:", res.data);
//             setPassengerDetails(res.data);
//         } catch (err) {
//             console.error("Error fetching passenger details:", err);
//             if (err.response?.status === 401) {
//                 alert("Authentication error. Please login again.");
//             } else if (err.response?.status === 404) {
//                 alert("Passenger not found");
//             } else {
//                 alert("Failed to fetch passenger details. Please try again.");
//             }
//         } finally {
//             setLoadingPassenger(false);
//         }
//     };

//     const handlePassengerClick = async (passenger) => {
//         setSelectedPassenger(passenger);
//         setShowPassengerModal(true);
//         setPassengerDetails(null);

//         if (passenger.passenger_id) {
//             await fetchPassengerDetails(passenger.passenger_id);
//         } else {
//             setLoadingPassenger(false);
//             alert("Passenger ID not found in the response");
//         }
//     };

//     const cancelTrip = async () => {
//         if (!cancelReason) {
//             setCancelError("Please provide a cancellation reason");
//             return;
//         }

//         setCancelError("");

//         try {
//             const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/cancel`;
//             console.log("Cancelling trip:", url);
//             await axios.patch(
//                 url,
//                 { reason: cancelReason },
//                 {
//                     ...axiosConfig,
//                     headers: {
//                         ...axiosConfig.headers,
//                         'Cache-Control': 'no-cache',
//                         'Pragma': 'no-cache'
//                     }
//                 }
//             );
//             alert("✅ Trip cancelled successfully");
//             await fetchTrips();
//             setSelectedTrip(null);
//             setCancelReason("");
//             setCancelError("");
//         } catch (err) {
//             console.error("Error cancelling trip:", err);

//             let errorMessage = "Failed to cancel trip";

//             if (err.response) {
//                 const statusCode = err.response.status;
//                 const errorData = err.response.data;

//                 if (errorData?.detail) {
//                     errorMessage = errorData.detail;
//                 } else if (typeof errorData === 'string') {
//                     errorMessage = errorData;
//                 } else if (errorData?.message) {
//                     errorMessage = errorData.message;
//                 }

//                 if (statusCode === 400) {
//                     errorMessage = `❌ ${errorMessage}`;
//                 } else if (statusCode === 401) {
//                     errorMessage = "❌ Unauthorized. Please login again.";
//                 } else if (statusCode === 403) {
//                     errorMessage = "❌ You don't have permission to cancel this trip.";
//                 } else if (statusCode === 404) {
//                     errorMessage = "❌ Trip not found.";
//                 }
//             } else if (err.request) {
//                 errorMessage = "❌ Network error. Please check your connection.";
//             }

//             setCancelError(errorMessage);
//         }
//     };

//     // Manual completion function
//     const completeTripManually = async () => {
//         setCompletionError("");

//         try {
//             setCompletingTrip(true);
//             const requestBody = { note: completionNote || null };
//             const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/complete-manually`;
//             console.log("Completing trip:", url);

//             const response = await axios.post(url, requestBody, {
//                 ...axiosConfig,
//                 headers: {
//                     ...axiosConfig.headers,
//                     'Cache-Control': 'no-cache',
//                     'Pragma': 'no-cache'
//                 }
//             });

//             console.log("Complete trip response:", response.data);

//             if (response.data?.status === "success" || response.status === 200) {
//                 alert("✅ Trip completed successfully!");
//                 setShowCompleteModal(false);
//                 setCompletionNote("");
//                 await fetchTrips();
//                 if (selectedTrip) {
//                     await fetchTripDetails(selectedTrip.trip_id);
//                 }
//             } else {
//                 alert("Trip completed successfully!");
//                 setShowCompleteModal(false);
//                 setCompletionNote("");
//                 await fetchTrips();
//                 if (selectedTrip) {
//                     await fetchTripDetails(selectedTrip.trip_id);
//                 }
//             }
//         } catch (err) {
//             console.error("Error completing trip:", err);

//             let errorMessage = "Failed to complete trip";

//             if (err.response) {
//                 const statusCode = err.response.status;
//                 const errorData = err.response.data;

//                 if (errorData?.detail) {
//                     errorMessage = errorData.detail;
//                 } else if (typeof errorData === 'string') {
//                     errorMessage = errorData;
//                 } else if (errorData?.message) {
//                     errorMessage = errorData.message;
//                 }

//                 if (statusCode === 400) {
//                     errorMessage = `❌ ${errorMessage}`;
//                 } else if (statusCode === 401) {
//                     errorMessage = "❌ Unauthorized. Please login again.";
//                 } else if (statusCode === 403) {
//                     errorMessage = "❌ You don't have permission to complete this trip.";
//                 } else if (statusCode === 404) {
//                     errorMessage = "❌ Trip not found.";
//                 }
//             } else if (err.request) {
//                 errorMessage = "❌ Network error. Please check your connection.";
//             }

//             setCompletionError(errorMessage);
//         } finally {
//             setCompletingTrip(false);
//         }
//     };


//     useEffect(() => {
//         fetchTrips();
//     }, []);

//     const getStatusBadge = (status) => {
//         switch (status) {
//             case "completed":
//                 return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircleIcon, label: "Completed" };
//             case "in_progress":
//                 return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: ArrowPathIcon, label: "In Progress" };
//             case "scheduled":
//                 return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: CalendarIcon, label: "Scheduled" };
//             case "cancelled":
//                 return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircleIcon, label: "Cancelled" };
//             case "premature_end":
//                 return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: ExclamationTriangleIcon, label: "Premature End" };
//             default:
//                 return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: null, label: status };
//         }
//     };

//     const getDelayTag = (planned, actual) => {
//         if (!planned || !actual) return { label: "Not started", color: "text-gray-400", bg: "bg-gray-50" };

//         const diff = (new Date(actual) - new Date(planned)) / 60000;

//         if (diff <= 5 && diff >= -5) {
//             return { label: "On Time", color: "text-emerald-600", bg: "bg-emerald-50" };
//         } else if (diff > 5) {
//             return { label: `${Math.round(diff)} min Late`, color: "text-red-600", bg: "bg-red-50" };
//         } else {
//             return { label: `${Math.abs(Math.round(diff))} min Early`, color: "text-blue-600", bg: "bg-blue-50" };
//         }
//     };

//     const getCriticalAlert = () => {
//         if (!selectedTrip) return null;


//         const startDelay = getDelayTag(
//             selectedTrip?.timing?.planned_start,
//             selectedTrip?.timing?.actual_start
//         );


//         const endDelay = getDelayTag(
//             selectedTrip?.timing?.planned_end,
//             selectedTrip?.timing?.actual_end
//         );

//         if (
//             startDelay?.label?.includes("Critical") ||
//             endDelay?.label?.includes("Critical")
//         ) {
//             return "⚠️ Trip is critically delayed";
//         }

//         return null;
//     };

//     // Filter trips based on search and status
//     const filteredTrips = trips.filter(trip => {
//         const matchesSearch = trip.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             trip.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     if (initialLoad || loadingTrips) {
//         return (
//             <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//                 <Sidebar />
//                 <div className="flex-1 flex flex-col">
//                     <TopNavbarUltra title="Trip Intelligence" />
//                     <div className="flex items-center justify-center h-full">
//                         <div className="text-center">
//                             <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mb-4"></div>
//                             <p className="text-gray-500 font-medium">Loading trips...</p>
//                             <p className="text-sm text-gray-400 mt-1">Fetching real-time data</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const criticalAlert = getCriticalAlert();

//     return (
//         <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//             <Sidebar />

//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <TopNavbarUltra title="Trip Intelligence" />

//                 {criticalAlert && (
//                     <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 mx-6 mt-4 rounded-xl shadow-sm">
//                         <div className="flex items-center gap-3">
//                             <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
//                             <p className="font-medium">{criticalAlert}</p>
//                         </div>
//                     </div>
//                 )}

//                 <div className="flex-1 overflow-hidden p-6">
//                     <div className="flex gap-6 h-full">
//                         {/* LEFT PANEL */}
//                         <div className="w-[380px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-100">
//                             <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                 <h2 className="text-lg font-bold text-gray-800">Active Trips</h2>
//                                 <p className="text-xs text-gray-500 mt-1">{filteredTrips.length} trips available</p>

//                                 <div className="mt-4 relative">
//                                     <input
//                                         type="text"
//                                         placeholder="Search by route, driver, or vehicle..."
//                                         className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                     />
//                                     <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                                 </div>

//                                 <div className="flex gap-2 mt-3 flex-wrap">
//                                     {["all", "scheduled", "in_progress", "completed", "cancelled"].map((status) => (
//                                         <button
//                                             key={status}
//                                             onClick={() => setStatusFilter(status)}
//                                             className={`px-3 py-1 text-xs rounded-lg capitalize transition-all ${statusFilter === status
//                                                 ? "bg-indigo-600 text-white shadow-sm"
//                                                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                                                 }`}
//                                         >
//                                             {status.replace("_", " ")}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="flex-1 overflow-y-auto p-3 space-y-2">
//                                 {filteredTrips.length === 0 ? (
//                                     <div className="text-center py-12">
//                                         <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                                         <p className="text-gray-400 text-sm">No trips found</p>
//                                     </div>
//                                 ) : (
//                                     filteredTrips.map((trip) => {
//                                         const statusStyle = getStatusBadge(trip.status);
//                                         return (
//                                             <div
//                                                 key={trip.trip_id}
//                                                 onClick={() => {
//                                                     console.log("Trip clicked:", trip.trip_id);
//                                                     fetchTripDetails(trip.trip_id);
//                                                 }}
//                                                 className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${selectedTrip?.trip_id === trip.trip_id
//                                                     ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-white shadow-lg"
//                                                     : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
//                                                     }`}
//                                             >
//                                                 <div className="flex justify-between items-start mb-2">
//                                                     <div className="flex-1">
//                                                         <p className="font-semibold text-gray-800 text-sm">{trip.route_name}</p>
//                                                         <div className="flex items-center gap-2 mt-1">
//                                                             <span className="text-xs text-gray-500">{trip.driver}</span>
//                                                             <span className="text-xs text-gray-400">•</span>
//                                                             <span className="text-xs text-gray-500">{trip.vehicle}</span>
//                                                         </div>
//                                                     </div>
//                                                     <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
//                                                         {statusStyle.label}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })
//                                 )}
//                             </div>
//                         </div>

//                         {/* RIGHT PANEL */}
//                         <div className="flex-1 overflow-y-auto">
//                             {!selectedTrip ? (
//                                 <div className="flex items-center justify-center h-full">
//                                     <div className="text-center">
//                                         <div className="bg-white rounded-2xl p-8 shadow-lg inline-block">
//                                             <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                                             <p className="text-gray-500 font-medium">Select a trip to view details</p>
//                                             <p className="text-sm text-gray-400 mt-1">Click on any trip from the left panel</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : loading ? (
//                                 <div className="flex items-center justify-center h-full">
//                                     <div className="text-center">
//                                         <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mb-4"></div>
//                                         <p className="text-gray-500">Loading trip details...</p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-5">
//                                     {/* HEADER CARD */}
//                                     <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
//                                         <div className="flex justify-between items-start">
//                                             <div>
//                                                 <h2 className="text-2xl font-bold mb-1">{selectedTrip.route?.name}</h2>
//                                                 <p className="text-indigo-100 text-sm">{selectedTrip.route?.code}</p>
//                                             </div>
//                                             <div className="text-right">
//                                                 <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text} border ${getStatusBadge(selectedTrip.status).border}`}>
//                                                     {getStatusBadge(selectedTrip.status).label}
//                                                 </span>
//                                                 {selectedTrip.status === "premature_end" && selectedTrip.cancelation?.premature_end_reason && (
//                                                     <div className="mt-2 text-xs bg-white/20 rounded-lg p-2 backdrop-blur-sm">
//                                                         <p className="font-semibold">Reason: {selectedTrip.cancelation.premature_end_reason}</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* STATS GRID - 4 columns */}
//                                     <div className="grid grid-cols-4 gap-4">
//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
//                                                     <p className="text-2xl font-bold text-gray-800 mt-1">{selectedTrip.occupancy?.total_bookings || 0}</p>
//                                                 </div>
//                                                 <UserGroupIcon className="h-8 w-8 text-indigo-400" />
//                                             </div>
//                                         </div>

//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
//                                                     <p className="text-2xl font-bold text-gray-800 mt-1">
//                                                         {selectedTrip.timing?.actual_start && selectedTrip.timing?.actual_end
//                                                             ? `${Math.round((new Date(selectedTrip.timing.actual_end) - new Date(selectedTrip.timing.actual_start)) / 60000)}m`
//                                                             : "-"}
//                                                     </p>
//                                                 </div>
//                                                 <ClockIcon className="h-8 w-8 text-indigo-400" />
//                                             </div>
//                                         </div>

//                                         {(() => {
//                                             const startStatus = getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start);
//                                             return (
//                                                 <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
//                                                     <div className="flex items-center justify-between">
//                                                         <div>
//                                                             <p className="text-xs text-gray-500 uppercase tracking-wide">Start Status</p>
//                                                             <p className={`text-lg font-bold mt-1 ${startStatus.color}`}>{startStatus.label}</p>
//                                                         </div>
//                                                         <div className={`p-2 rounded-lg ${startStatus.bg}`}>
//                                                             <ClockIcon className="h-5 w-5" />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })()}

//                                         {(() => {
//                                             const endStatus = getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end);
//                                             return (
//                                                 <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
//                                                     <div className="flex items-center justify-between">
//                                                         <div>
//                                                             <p className="text-xs text-gray-500 uppercase tracking-wide">End Status</p>
//                                                             <p className={`text-lg font-bold mt-1 ${endStatus.color}`}>{endStatus.label}</p>
//                                                         </div>
//                                                         <div className={`p-2 rounded-lg ${endStatus.bg}`}>
//                                                             <ClockIcon className="h-5 w-5" />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })()}
//                                     </div>

//                                     {/* TRIP DETAILS SECTION */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <h3 className="font-semibold text-gray-800">Trip Details</h3>
//                                         </div>
//                                         <div className="p-5">
//                                             <div className="grid grid-cols-2 gap-6">
//                                                 <div className="space-y-4">
//                                                     <div>
//                                                         <label className="text-xs text-gray-500 uppercase tracking-wide">Route Name</label>
//                                                         <p className="text-gray-800 font-medium mt-1">{selectedTrip.route?.name || "N/A"}</p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-xs text-gray-500 uppercase tracking-wide">Planned Start</label>
//                                                         <p className="text-gray-800 font-medium mt-1">
//                                                             {selectedTrip.timing?.planned_start
//                                                                 ? new Date(selectedTrip.timing.planned_start).toLocaleString("en-IN")
//                                                                 : "-"}
//                                                         </p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-xs text-gray-500 uppercase tracking-wide">Planned End</label>
//                                                         <p className="text-gray-800 font-medium mt-1">
//                                                             {selectedTrip.timing?.planned_end
//                                                                 ? new Date(selectedTrip.timing.planned_end).toLocaleString("en-IN")
//                                                                 : "-"}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <div className="space-y-4">
//                                                     <div>
//                                                         <label className="text-xs text-gray-500 uppercase tracking-wide">Route Code</label>
//                                                         <p className="text-gray-800 font-medium mt-1">{selectedTrip.route?.code || "N/A"}</p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-xs text-gray-500 uppercase tracking-wide">Actual Start</label>
//                                                         <p className="text-gray-800 font-medium mt-1">
//                                                             {selectedTrip.timing?.actual_start
//                                                                 ? new Date(selectedTrip.timing.actual_start).toLocaleString("en-IN")
//                                                                 : "-"}
//                                                         </p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-xs text-gray-500 uppercase tracking-wide">Actual End</label>
//                                                         <p className="text-gray-800 font-medium mt-1">
//                                                             {selectedTrip.timing?.actual_end
//                                                                 ? new Date(selectedTrip.timing.actual_end).toLocaleString("en-IN")
//                                                                 : "-"}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="mt-6 pt-4 border-t border-gray-100">
//                                                 <label className="text-xs text-gray-500 uppercase tracking-wide">Trip ID</label>
//                                                 <p className="text-xs font-mono text-gray-600 mt-1 break-all">{selectedTrip.trip_id}</p>
//                                             </div>
//                                             <div className="mt-4">
//                                                 <label className="text-xs text-gray-500 uppercase tracking-wide">Admin Note</label>
//                                                 <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-3 rounded-lg">{selectedTrip.admin_note || "No notes available"}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* ASSIGNMENT SECTION */}
//                                     <div className="grid grid-cols-2 gap-5">
//                                         <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 shadow-sm border border-blue-100">
//                                             <div className="flex items-center gap-3 mb-3">
//                                                 <div className="p-2 bg-blue-100 rounded-lg">
//                                                     <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                                     </svg>
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">Driver</p>
//                                                     <p className="text-lg font-semibold text-gray-800">{selectedTrip.assignment?.driver || "N/A"}</p>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 shadow-sm border border-emerald-100">
//                                             <div className="flex items-center gap-3 mb-3">
//                                                 <div className="p-2 bg-emerald-100 rounded-lg">
//                                                     <TruckIcon className="h-5 w-5 text-emerald-600" />
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
//                                                     <p className="text-lg font-semibold text-gray-800">{selectedTrip.assignment?.vehicle || "N/A"}</p>
//                                                     {selectedTrip.vehicle?.capacity && (
//                                                         <p className="text-xs text-gray-500 mt-1">Capacity: {selectedTrip.vehicle.capacity} seats</p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* ACTION BUTTONS - Only for in_progress status */}
//                                     {selectedTrip.status === "in_progress" && (
//                                         <div className="flex gap-4">
//                                             <button
//                                                 onClick={() => setShowCompleteModal(true)}
//                                                 className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
//                                             >
//                                                 <FlagIcon className="h-5 w-5" />
//                                                 Complete Trip
//                                             </button>
//                                         </div>
//                                     )}

//                                     {/* CANCEL SECTION - Only for scheduled trips */}
//                                     {selectedTrip.status === "scheduled" && (
//                                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                             <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
//                                                 <h3 className="font-semibold text-red-700">Cancel Trip</h3>
//                                                 <p className="text-xs text-gray-500 mt-1">This action cannot be undone</p>
//                                             </div>
//                                             <div className="p-5">
//                                                 {cancelError && (
//                                                     <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
//                                                         <div className="flex items-start gap-3">
//                                                             <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
//                                                             <div>
//                                                                 <p className="text-sm font-semibold text-red-800">Cannot Cancel Trip</p>
//                                                                 <p className="text-sm text-red-600 mt-1">{cancelError}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 <textarea
//                                                     className={`w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none ${cancelError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
//                                                         }`}
//                                                     placeholder="Enter cancellation reason..."
//                                                     value={cancelReason}
//                                                     onChange={(e) => {
//                                                         setCancelReason(e.target.value);
//                                                         if (cancelError) setCancelError("");
//                                                     }}
//                                                     rows="4"
//                                                 />

//                                                 <button
//                                                     onClick={cancelTrip}
//                                                     className="mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
//                                                 >
//                                                     Cancel Trip
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* PASSENGERS SECTION */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <h3 className="font-semibold text-gray-800">Passengers</h3>
//                                                     <p className="text-xs text-gray-500 mt-1">Total: {selectedTrip.occupancy?.passengers?.length || 0} passengers</p>
//                                                 </div>
//                                                 <UserGroupIcon className="h-5 w-5 text-gray-400" />
//                                             </div>
//                                         </div>

//                                         <div className="p-5">
//                                             {selectedTrip.occupancy?.passengers?.length > 0 ? (
//                                                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                                                     {selectedTrip.occupancy.passengers.map((passenger, index) => (
//                                                         <div
//                                                             key={index}
//                                                             onClick={() => handlePassengerClick(passenger)}
//                                                             className="flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all duration-200 cursor-pointer group"
//                                                         >
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all">
//                                                                     <span className="text-indigo-600 font-semibold text-sm">
//                                                                         {passenger.name?.charAt(0) || "?"}
//                                                                     </span>
//                                                                 </div>
//                                                                 <div>
//                                                                     <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{passenger.name}</p>
//                                                                     <p className="text-xs text-gray-400">ID: {passenger.passenger_id?.slice(0, 13)}...</p>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="flex items-center gap-2">
//                                                                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${passenger.status === "booked"
//                                                                     ? "bg-emerald-100 text-emerald-700"
//                                                                     : passenger.status === "cancelled"
//                                                                         ? "bg-red-100 text-red-700"
//                                                                         : "bg-gray-100 text-gray-600"
//                                                                     }`}>
//                                                                     {passenger.status}
//                                                                 </span>
//                                                                 <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-all" />
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center py-8">
//                                                     <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                                                     <p className="text-gray-400 text-sm">No passengers found</p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* MANUAL COMPLETION MODAL */}
//             {showCompleteModal && selectedTrip && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCompleteModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
//                                     <FlagIcon className="h-5 w-5 text-white" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-lg font-bold text-white">Complete Trip</h2>
//                                     <p className="text-emerald-100 text-xs">{selectedTrip.route?.name}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Modal Content */}
//                         <div className="p-6">
//                             {completionError && (
//                                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//                                     <div className="flex items-start gap-2">
//                                         <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5" />
//                                         <p className="text-sm text-red-600">{completionError}</p>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Completion Note (Optional)
//                                 </label>
//                                 <textarea
//                                     className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
//                                     placeholder="Add a note about why this trip is being completed..."
//                                     value={completionNote}
//                                     onChange={(e) => setCompletionNote(e.target.value)}
//                                     rows="4"
//                                 />
//                                 <p className="text-xs text-gray-400 mt-2">
//                                     This note will be recorded with the trip completion. You can leave it empty if not needed.
//                                 </p>
//                             </div>

//                             <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
//                                 <div className="flex items-start gap-2">
//                                     <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
//                                     <p className="text-xs text-amber-700">
//                                         <span className="font-semibold">Warning:</span> This action will mark the trip as completed.
//                                         This cannot be undone. Please ensure the trip has actually been completed before proceeding.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end gap-3">
//                             <button
//                                 onClick={() => {
//                                     setShowCompleteModal(false);
//                                     setCompletionNote("");
//                                     setCompletionError("");
//                                 }}
//                                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={completeTripManually}
//                                 disabled={completingTrip}
//                                 className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                             >
//                                 {completingTrip ? (
//                                     <>
//                                         <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                                         Completing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FlagIcon className="h-4 w-4" />
//                                         Complete Trip
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* PASSENGER DETAILS MODAL */}
//             {showPassengerModal && selectedPassenger && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPassengerModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
//                             <div className="flex items-center gap-3">
//                                 <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
//                                     <UserGroupIcon className="h-6 w-6 text-white" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-xl font-bold text-white">Passenger Details</h2>
//                                     <p className="text-indigo-100 text-sm">{selectedPassenger.name}</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setShowPassengerModal(false)}
//                                 className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
//                             >
//                                 <XMarkIcon className="h-6 w-6" />
//                             </button>
//                         </div>

//                         {/* Modal Content */}
//                         <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
//                             {loadingPassenger ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-indigo-600"></div>
//                                     <p className="ml-3 text-gray-500">Loading passenger details...</p>
//                                 </div>
//                             ) : passengerDetails ? (
//                                 <div className="space-y-6">
//                                     {/* Profile Section */}
//                                     <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100">
//                                         <div className="flex items-start gap-6">
//                                             <div className="relative">
//                                                 {passengerDetails.profile?.avatar ? (
//                                                     <img
//                                                         src={`https://be.shuttleapp.transev.site${passengerDetails.profile.avatar}`}
//                                                         alt={passengerDetails.profile?.full_name}
//                                                         className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
//                                                         onError={(e) => {
//                                                             e.target.onerror = null;
//                                                             e.target.style.display = 'none';
//                                                             const parent = e.target.parentElement;
//                                                             if (parent) {
//                                                                 const fallback = document.createElement('div');
//                                                                 fallback.className = "h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg";
//                                                                 fallback.innerHTML = `<span class="text-3xl font-bold text-white">${passengerDetails.profile?.full_name?.charAt(0) || "?"}</span>`;
//                                                                 parent.appendChild(fallback);
//                                                             }
//                                                         }}
//                                                     />
//                                                 ) : (
//                                                     <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
//                                                         <span className="text-3xl font-bold text-white">
//                                                             {passengerDetails.profile?.full_name?.charAt(0) || "?"}
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className="flex-1">
//                                                 <h3 className="text-2xl font-bold text-gray-800">{passengerDetails.profile?.full_name}</h3>
//                                                 <div className="flex items-center gap-4 mt-2">
//                                                     <div className="flex items-center gap-1 text-gray-600">
//                                                         <EnvelopeIcon className="h-4 w-4" />
//                                                         <span className="text-sm">{passengerDetails.email}</span>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center gap-4 mt-3">
//                                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${passengerDetails.is_active
//                                                         ? "bg-emerald-100 text-emerald-700"
//                                                         : "bg-red-100 text-red-700"
//                                                         }`}>
//                                                         {passengerDetails.is_active ? "Active" : "Inactive"}
//                                                     </span>
//                                                     <div className="flex items-center gap-1 text-gray-500 text-xs">
//                                                         <CalendarDaysIcon className="h-3 w-3" />
//                                                         <span>Joined: {new Date(passengerDetails.joined_at).toLocaleDateString("en-IN")}</span>
//                                                     </div>
//                                                     <div className="flex items-center gap-1 text-gray-500 text-xs">
//                                                         <CurrencyRupeeIcon className="h-3 w-3" />
//                                                         <span>User ID: {passengerDetails.user_id?.slice(0, 13)}...</span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Statistics Cards */}
//                                     <div className="grid grid-cols-3 gap-4">
//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                                             <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bookings</p>
//                                             <p className="text-2xl font-bold text-gray-800 mt-1">{passengerDetails.booking_history?.total_count || 0}</p>
//                                         </div>
//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                                             <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
//                                             <p className="text-2xl font-bold text-gray-800 mt-1">
//                                                 ₹{passengerDetails.booking_history?.bookings?.reduce((sum, b) => sum + (b.fare || 0), 0).toLocaleString() || 0}
//                                             </p>
//                                         </div>
//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                                             <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Fare</p>
//                                             <p className="text-2xl font-bold text-gray-800 mt-1">
//                                                 ₹{passengerDetails.booking_history?.bookings?.length > 0
//                                                     ? Math.round(passengerDetails.booking_history.bookings.reduce((sum, b) => sum + (b.fare || 0), 0) / passengerDetails.booking_history.bookings.length)
//                                                     : 0}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Booking History */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <h3 className="font-semibold text-gray-800">Booking History</h3>
//                                             <p className="text-xs text-gray-500 mt-1">All passenger bookings</p>
//                                         </div>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-sm">
//                                                 <thead className="bg-gray-50">
//                                                     <tr>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-gray-100">
//                                                     {passengerDetails.booking_history?.bookings?.map((booking, idx) => (
//                                                         <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                                                             <td className="px-4 py-3">
//                                                                 <p className="text-xs font-mono text-gray-600">{booking.booking_id?.slice(0, 13)}...</p>
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <p className="text-sm text-gray-800">{booking.pickup_stop?.name || "N/A"}</p>
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <p className="text-sm text-gray-800">{booking.dropoff_stop?.name || "N/A"}</p>
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <p className="font-medium text-gray-900">₹{booking.fare?.toLocaleString() || 0}</p>
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "completed"
//                                                                     ? "bg-emerald-100 text-emerald-700"
//                                                                     : booking.status === "cancelled"
//                                                                         ? "bg-red-100 text-red-700"
//                                                                         : "bg-amber-100 text-amber-700"
//                                                                     }`}>
//                                                                     {booking.status}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString("en-IN")}</p>
//                                                                 <p className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                         {(!passengerDetails.booking_history?.bookings || passengerDetails.booking_history.bookings.length === 0) && (
//                                             <div className="text-center py-8">
//                                                 <p className="text-gray-400 text-sm">No booking history found</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
//                                     <p className="text-gray-500">Unable to load passenger details</p>
//                                     <p className="text-sm text-gray-400 mt-2">The passenger ID could not be found or the API request failed</p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
//                             <button
//                                 onClick={() => setShowPassengerModal(false)}
//                                 className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TripDetailsPage;
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import {
    ClockIcon,
    UserGroupIcon,
    TruckIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    CurrencyRupeeIcon,
    FlagIcon
} from "@heroicons/react/24/solid";
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

const TripDetailsPage = () => {
    const BASE_URL = "https://be.shuttleapp.transev.site/admin";
    const token = localStorage.getItem("access_token");
    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    };

    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [loadingTrips, setLoadingTrips] = useState(true);
    const [cancelError, setCancelError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [tripLoadError, setTripLoadError] = useState(null);

    // Premature end states
    const [showPrematureEndModal, setShowPrematureEndModal] = useState(false);
    const [prematureEndReason, setPrematureEndReason] = useState("");
    const [endingTrip, setEndingTrip] = useState(false);
    const [prematureEndError, setPrematureEndError] = useState("");

    // Manual completion states
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completionNote, setCompletionNote] = useState("");
    const [completingTrip, setCompletingTrip] = useState(false);
    const [completionError, setCompletionError] = useState("");

    // Passenger modal states
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [showPassengerModal, setShowPassengerModal] = useState(false);
    const [loadingPassenger, setLoadingPassenger] = useState(false);
    const [passengerDetails, setPassengerDetails] = useState(null);

    const fetchTrips = async () => {
        setLoadingTrips(true);
        setTripLoadError(null);
        try {
            console.log("Fetching trips from:", `${BASE_URL}/trips/monitor`);
            const res = await axios.get(`${BASE_URL}/trips/monitor`, {
                ...axiosConfig,
                headers: {
                    ...axiosConfig.headers,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log("Trips fetched successfully:", res.data);
            setTrips(res.data);
        } catch (err) {
            console.error("Error fetching trips:", err);
            setTripLoadError("Failed to load trips. Please refresh the page.");
        } finally {
            setLoadingTrips(false);
            setInitialLoad(false);
        }
    };

    const fetchTripDetails = useCallback(async (trip_id) => {
        if (!trip_id) {
            console.error("No trip ID provided");
            return;
        }

        setLoading(true);
        setCancelError("");
        setTripLoadError(null);

        try {
            const url = `${BASE_URL}/trips/${trip_id}`;
            console.log("Fetching trip details from:", url);
            console.log("Using token:", token ? "Token exists" : "No token");

            const response = await axios.get(url, {
                ...axiosConfig,
                headers: {
                    ...axiosConfig.headers,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log("Trip details response:", response.data);
            setSelectedTrip(response.data);
        } catch (err) {
            console.error("Error fetching trip details:", err);
            console.error("Error response:", err.response);
            console.error("Error status:", err.response?.status);
            console.error("Error data:", err.response?.data);

            let errorMessage = "Failed to load trip details";
            if (err.response?.status === 401) {
                errorMessage = "Authentication failed. Please login again.";
            } else if (err.response?.status === 404) {
                errorMessage = "Trip not found.";
            } else if (err.response?.status === 403) {
                errorMessage = "You don't have permission to view this trip.";
            }

            setTripLoadError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [axiosConfig, token]);

    const fetchPassengerDetails = async (passengerId) => {
        if (!passengerId || passengerId === 'undefined') {
            console.error("Invalid passenger ID:", passengerId);
            alert("Unable to fetch passenger details: Invalid passenger ID");
            return;
        }

        setLoadingPassenger(true);
        try {
            const url = `${BASE_URL}/passenger/${passengerId}`;
            console.log("Fetching passenger details from:", url);
            const res = await axios.get(url, {
                ...axiosConfig,
                headers: {
                    ...axiosConfig.headers,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log("Passenger details:", res.data);
            setPassengerDetails(res.data);
        } catch (err) {
            console.error("Error fetching passenger details:", err);
            if (err.response?.status === 401) {
                alert("Authentication error. Please login again.");
            } else if (err.response?.status === 404) {
                alert("Passenger not found");
            } else {
                alert("Failed to fetch passenger details. Please try again.");
            }
        } finally {
            setLoadingPassenger(false);
        }
    };

    const handlePassengerClick = async (passenger) => {
        setSelectedPassenger(passenger);
        setShowPassengerModal(true);
        setPassengerDetails(null);

        if (passenger.passenger_id) {
            await fetchPassengerDetails(passenger.passenger_id);
        } else {
            setLoadingPassenger(false);
            alert("Passenger ID not found in the response");
        }
    };

    const cancelTrip = async () => {
        if (!cancelReason) {
            setCancelError("Please provide a cancellation reason");
            return;
        }

        setCancelError("");

        try {
            const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/cancel`;
            console.log("Cancelling trip:", url);
            await axios.patch(
                url,
                { reason: cancelReason },
                {
                    ...axiosConfig,
                    headers: {
                        ...axiosConfig.headers,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }
            );
            alert("✅ Trip cancelled successfully");
            await fetchTrips();
            setSelectedTrip(null);
            setCancelReason("");
            setCancelError("");
        } catch (err) {
            console.error("Error cancelling trip:", err);

            let errorMessage = "Failed to cancel trip";

            if (err.response) {
                const statusCode = err.response.status;
                const errorData = err.response.data;

                if (errorData?.detail) {
                    errorMessage = errorData.detail;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }

                if (statusCode === 400) {
                    errorMessage = `❌ ${errorMessage}`;
                } else if (statusCode === 401) {
                    errorMessage = "❌ Unauthorized. Please login again.";
                } else if (statusCode === 403) {
                    errorMessage = "❌ You don't have permission to cancel this trip.";
                } else if (statusCode === 404) {
                    errorMessage = "❌ Trip not found.";
                }
            } else if (err.request) {
                errorMessage = "❌ Network error. Please check your connection.";
            }

            setCancelError(errorMessage);
        }
    };

    // Premature end function

const prematureEndTrip = async () => {
    if (!prematureEndReason) {
        setPrematureEndError("Please provide a reason for ending the trip prematurely");
        return;
    }

    setPrematureEndError("");
    setEndingTrip(true);

    try {
        const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/premature-end`;
        console.log("Ending trip prematurely:", url);
        
        const response = await axios.post(url, {
            reason: prematureEndReason
        }, {
            ...axiosConfig,
            headers: {
                ...axiosConfig.headers,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        console.log("Premature end response:", response.data);

        if (response.data?.status === "success") {
            alert(`✅ Trip ended prematurely!\nCancelled bookings: ${response.data.cancelled_bookings || 0}\nTrip status: ${response.data.trip_status}`);
            setShowPrematureEndModal(false);
            setPrematureEndReason("");
            
            // Refresh the trips list
            await fetchTrips();
            
            // IMPORTANT: Refresh the selected trip details to get updated actual_end
            if (selectedTrip) {
                await fetchTripDetails(selectedTrip.trip_id);
            }
        } else {
            throw new Error("Unexpected response from server");
        }
    } catch (err) {
        console.error("Error ending trip prematurely:", err);

        let errorMessage = "Failed to end trip prematurely";

        if (err.response) {
            const statusCode = err.response.status;
            const errorData = err.response.data;

            if (errorData?.detail) {
                errorMessage = errorData.detail;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            } else if (errorData?.message) {
                errorMessage = errorData.message;
            }

            if (statusCode === 400) {
                errorMessage = `❌ ${errorMessage}`;
            } else if (statusCode === 401) {
                errorMessage = "❌ Unauthorized. Please login again.";
            } else if (statusCode === 403) {
                errorMessage = "❌ You don't have permission to end this trip.";
            } else if (statusCode === 404) {
                errorMessage = "❌ Trip not found.";
            }
        } else if (err.request) {
            errorMessage = "❌ Network error. Please check your connection.";
        }

        setPrematureEndError(errorMessage);
    } finally {
        setEndingTrip(false);
    }
};

    // Manual completion function
    const completeTripManually = async () => {
        setCompletionError("");

        try {
            setCompletingTrip(true);
            const requestBody = { note: completionNote || null };
            const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/complete-manually`;
            console.log("Completing trip:", url);

            const response = await axios.post(url, requestBody, {
                ...axiosConfig,
                headers: {
                    ...axiosConfig.headers,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });

            console.log("Complete trip response:", response.data);

            if (response.data?.status === "success" || response.status === 200) {
                alert("✅ Trip completed successfully!");
                setShowCompleteModal(false);
                setCompletionNote("");
                await fetchTrips();
                if (selectedTrip) {
                    await fetchTripDetails(selectedTrip.trip_id);
                }
            } else {
                alert("Trip completed successfully!");
                setShowCompleteModal(false);
                setCompletionNote("");
                await fetchTrips();
                if (selectedTrip) {
                    await fetchTripDetails(selectedTrip.trip_id);
                }
            }
        } catch (err) {
            console.error("Error completing trip:", err);

            let errorMessage = "Failed to complete trip";

            if (err.response) {
                const statusCode = err.response.status;
                const errorData = err.response.data;

                if (errorData?.detail) {
                    errorMessage = errorData.detail;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }

                if (statusCode === 400) {
                    errorMessage = `❌ ${errorMessage}`;
                } else if (statusCode === 401) {
                    errorMessage = "❌ Unauthorized. Please login again.";
                } else if (statusCode === 403) {
                    errorMessage = "❌ You don't have permission to complete this trip.";
                } else if (statusCode === 404) {
                    errorMessage = "❌ Trip not found.";
                }
            } else if (err.request) {
                errorMessage = "❌ Network error. Please check your connection.";
            }

            setCompletionError(errorMessage);
        } finally {
            setCompletingTrip(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircleIcon, label: "Completed" };
            case "in_progress":
                return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: ArrowPathIcon, label: "In Progress" };
            case "scheduled":
                return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: CalendarIcon, label: "Scheduled" };
            case "cancelled":
                return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircleIcon, label: "Cancelled" };
            case "premature_end":
                return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: ExclamationTriangleIcon, label: "Premature End" };
            default:
                return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: null, label: status };
        }
    };

    const getDelayTag = (planned, actual) => {
        if (!planned || !actual) return { label: "Not started", color: "text-gray-400", bg: "bg-gray-50" };

        const diff = (new Date(actual) - new Date(planned)) / 60000;

        if (diff <= 5 && diff >= -5) {
            return { label: "On Time", color: "text-emerald-600", bg: "bg-emerald-50" };
        } else if (diff > 5) {
            return { label: `${Math.round(diff)} min Late`, color: "text-red-600", bg: "bg-red-50" };
        } else {
            return { label: `${Math.abs(Math.round(diff))} min Early`, color: "text-blue-600", bg: "bg-blue-50" };
        }
    };

    const getCriticalAlert = () => {
        if (!selectedTrip) return null;

        const startDelay = getDelayTag(
            selectedTrip?.timing?.planned_start,
            selectedTrip?.timing?.actual_start
        );

        const endDelay = getDelayTag(
            selectedTrip?.timing?.planned_end,
            selectedTrip?.timing?.actual_end
        );

        if (
            startDelay?.label?.includes("Critical") ||
            endDelay?.label?.includes("Critical")
        ) {
            return "⚠️ Trip is critically delayed";
        }

        return null;
    };

    // Filter trips based on search and status
    const filteredTrips = trips.filter(trip => {
        const matchesSearch = trip.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (initialLoad || loadingTrips) {
        return (
            <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopNavbarUltra title="Trip Intelligence" />
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading trips...</p>
                            <p className="text-sm text-gray-400 mt-1">Fetching real-time data</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const criticalAlert = getCriticalAlert();

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbarUltra title="Trip Intelligence" />

                {criticalAlert && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 mx-6 mt-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                            <p className="font-medium">{criticalAlert}</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-hidden p-6">
                    <div className="flex gap-6 h-full">
                        {/* LEFT PANEL */}
                        <div className="w-[380px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-100">
                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-bold text-gray-800">Active Trips</h2>
                                <p className="text-xs text-gray-500 mt-1">{filteredTrips.length} trips available</p>

                                <div className="mt-4 relative">
                                    <input
                                        type="text"
                                        placeholder="Search by route, driver, or vehicle..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                </div>

                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {["all", "scheduled", "in_progress", "completed", "cancelled", "premature_end"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1 text-xs rounded-lg capitalize transition-all ${statusFilter === status
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {status.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {filteredTrips.length === 0 ? (
                                    <div className="text-center py-12">
                                        <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">No trips found</p>
                                    </div>
                                ) : (
                                    filteredTrips.map((trip) => {
                                        const statusStyle = getStatusBadge(trip.status);
                                        return (
                                            <div
                                                key={trip.trip_id}
                                                onClick={() => {
                                                    console.log("Trip clicked:", trip.trip_id);
                                                    fetchTripDetails(trip.trip_id);
                                                }}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${selectedTrip?.trip_id === trip.trip_id
                                                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-white shadow-lg"
                                                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800 text-sm">{trip.route_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-gray-500">{trip.driver}</span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{trip.vehicle}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                                        {statusStyle.label}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="flex-1 overflow-y-auto">
                            {!selectedTrip ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="bg-white rounded-2xl p-8 shadow-lg inline-block">
                                            <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">Select a trip to view details</p>
                                            <p className="text-sm text-gray-400 mt-1">Click on any trip from the left panel</p>
                                        </div>
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-indigo-600 mb-4"></div>
                                        <p className="text-gray-500">Loading trip details...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* HEADER CARD */}
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-1">{selectedTrip.route?.name}</h2>
                                                <p className="text-indigo-100 text-sm">{selectedTrip.route?.code}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text} border ${getStatusBadge(selectedTrip.status).border}`}>
                                                    {getStatusBadge(selectedTrip.status).label}
                                                </span>
                                                {selectedTrip.status === "premature_end" && selectedTrip.cancelation?.premature_end_reason && (
                                                    <div className="mt-2 text-xs bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                                                        <p className="font-semibold">Reason: {selectedTrip.cancelation.premature_end_reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATS GRID - 4 columns */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
                                                    <p className="text-2xl font-bold text-gray-800 mt-1">{selectedTrip.occupancy?.total_bookings || 0}</p>
                                                </div>
                                                <UserGroupIcon className="h-8 w-8 text-indigo-400" />
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                                        {selectedTrip.timing?.actual_start && selectedTrip.timing?.actual_end
                                                            ? `${Math.round((new Date(selectedTrip.timing.actual_end) - new Date(selectedTrip.timing.actual_start)) / 60000)}m`
                                                            : "-"}
                                                    </p>
                                                </div>
                                                <ClockIcon className="h-8 w-8 text-indigo-400" />
                                            </div>
                                        </div>

                                        {(() => {
                                            const startStatus = getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start);
                                            return (
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Start Status</p>
                                                            <p className={`text-lg font-bold mt-1 ${startStatus.color}`}>{startStatus.label}</p>
                                                        </div>
                                                        <div className={`p-2 rounded-lg ${startStatus.bg}`}>
                                                            <ClockIcon className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {(() => {
                                            const endStatus = getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end);
                                            return (
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase tracking-wide">End Status</p>
                                                            <p className={`text-lg font-bold mt-1 ${endStatus.color}`}>{endStatus.label}</p>
                                                        </div>
                                                        <div className={`p-2 rounded-lg ${endStatus.bg}`}>
                                                            <ClockIcon className="h-5 w-5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* TRIP DETAILS SECTION */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <h3 className="font-semibold text-gray-800">Trip Details</h3>
                                        </div>
                                        <div className="p-5">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Route Name</label>
                                                        <p className="text-gray-800 font-medium mt-1">{selectedTrip.route?.name || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Planned Start</label>
                                                        <p className="text-gray-800 font-medium mt-1">
                                                            {selectedTrip.timing?.planned_start
                                                                ? new Date(selectedTrip.timing.planned_start).toLocaleString("en-IN")
                                                                : "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Planned End</label>
                                                        <p className="text-gray-800 font-medium mt-1">
                                                            {selectedTrip.timing?.planned_end
                                                                ? new Date(selectedTrip.timing.planned_end).toLocaleString("en-IN")
                                                                : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Route Code</label>
                                                        <p className="text-gray-800 font-medium mt-1">{selectedTrip.route?.code || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Actual Start</label>
                                                        <p className="text-gray-800 font-medium mt-1">
                                                            {selectedTrip.timing?.actual_start
                                                                ? new Date(selectedTrip.timing.actual_start).toLocaleString("en-IN")
                                                                : "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Actual End</label>
                                                        <p className="text-gray-800 font-medium mt-1">
                                                            {selectedTrip.timing?.actual_end
                                                                ? new Date(selectedTrip.timing.actual_end).toLocaleString("en-IN")
                                                                : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-gray-100">
                                                <label className="text-xs text-gray-500 uppercase tracking-wide">Trip ID</label>
                                                <p className="text-xs font-mono text-gray-600 mt-1 break-all">{selectedTrip.trip_id}</p>
                                            </div>
                                            <div className="mt-4">
                                                <label className="text-xs text-gray-500 uppercase tracking-wide">Admin Note</label>
                                                <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-3 rounded-lg">{selectedTrip.admin_note || "No notes available"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ASSIGNMENT SECTION */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 shadow-sm border border-blue-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Driver</p>
                                                    <p className="text-lg font-semibold text-gray-800">{selectedTrip.assignment?.driver || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 shadow-sm border border-emerald-100">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <TruckIcon className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Vehicle</p>
                                                    <p className="text-lg font-semibold text-gray-800">{selectedTrip.assignment?.vehicle || "N/A"}</p>
                                                    {selectedTrip.vehicle?.capacity && (
                                                        <p className="text-xs text-gray-500 mt-1">Capacity: {selectedTrip.vehicle.capacity} seats</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTONS - Only for in_progress status */}
                                    {selectedTrip.status === "in_progress" && (
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowPrematureEndModal(true)}
                                                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                                            >
                                                <ExclamationTriangleIcon className="h-5 w-5" />
                                                End Trip Prematurely
                                            </button>
                                            <button
                                                onClick={() => setShowCompleteModal(true)}
                                                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
                                            >
                                                <FlagIcon className="h-5 w-5" />
                                                Complete Trip
                                            </button>
                                        </div>
                                    )}

                                    {/* CANCEL SECTION - Only for scheduled trips */}
                                    {selectedTrip.status === "scheduled" && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
                                                <h3 className="font-semibold text-red-700">Cancel Trip</h3>
                                                <p className="text-xs text-gray-500 mt-1">This action cannot be undone</p>
                                            </div>
                                            <div className="p-5">
                                                {cancelError && (
                                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                                                        <div className="flex items-start gap-3">
                                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-semibold text-red-800">Cannot Cancel Trip</p>
                                                                <p className="text-sm text-red-600 mt-1">{cancelError}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <textarea
                                                    className={`w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none ${cancelError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    placeholder="Enter cancellation reason..."
                                                    value={cancelReason}
                                                    onChange={(e) => {
                                                        setCancelReason(e.target.value);
                                                        if (cancelError) setCancelError("");
                                                    }}
                                                    rows="4"
                                                />

                                                <button
                                                    onClick={cancelTrip}
                                                    className="mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                                                >
                                                    Cancel Trip
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* PASSENGERS SECTION */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Passengers</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Total: {selectedTrip.occupancy?.passengers?.length || 0} passengers</p>
                                                </div>
                                                <UserGroupIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            {selectedTrip.occupancy?.passengers?.length > 0 ? (
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {selectedTrip.occupancy.passengers.map((passenger, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handlePassengerClick(passenger)}
                                                            className="flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all">
                                                                    <span className="text-indigo-600 font-semibold text-sm">
                                                                        {passenger.name?.charAt(0) || "?"}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{passenger.name}</p>
                                                                    <p className="text-xs text-gray-400">ID: {passenger.passenger_id?.slice(0, 13)}...</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${passenger.status === "booked"
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : passenger.status === "cancelled"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : "bg-gray-100 text-gray-600"
                                                                    }`}>
                                                                    {passenger.status}
                                                                </span>
                                                                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-all" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-400 text-sm">No passengers found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PREMATURE END MODAL */}
            {showPrematureEndModal && selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPrematureEndModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">End Trip Prematurely</h2>
                                    <p className="text-orange-100 text-xs">{selectedTrip.route?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {prematureEndError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-start gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5" />
                                        <p className="text-sm text-red-600">{prematureEndError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for premature end <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Please provide a reason why this trip is ending prematurely (e.g., vehicle breakdown, emergency, route issues, etc.)..."
                                    value={prematureEndReason}
                                    onChange={(e) => {
                                        setPrematureEndReason(e.target.value);
                                        if (prematureEndError) setPrematureEndError("");
                                    }}
                                    rows="4"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    This reason will be recorded and visible to admins. Any active bookings will be automatically cancelled.
                                </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700">
                                        <span className="font-semibold">Warning:</span> This action will end the trip immediately and cancel all active bookings. 
                                        Passengers will be notified. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPrematureEndModal(false);
                                    setPrematureEndReason("");
                                    setPrematureEndError("");
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={prematureEndTrip}
                                disabled={endingTrip}
                                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {endingTrip ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Ending Trip...
                                    </>
                                ) : (
                                    <>
                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                        End Trip Prematurely
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL COMPLETION MODAL */}
            {showCompleteModal && selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCompleteModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <FlagIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Complete Trip</h2>
                                    <p className="text-emerald-100 text-xs">{selectedTrip.route?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {completionError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-start gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5" />
                                        <p className="text-sm text-red-600">{completionError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Completion Note (Optional)
                                </label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Add a note about why this trip is being completed..."
                                    value={completionNote}
                                    onChange={(e) => setCompletionNote(e.target.value)}
                                    rows="4"
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    This note will be recorded with the trip completion. You can leave it empty if not needed.
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        <span className="font-semibold">Warning:</span> This action will mark the trip as completed.
                                        This cannot be undone. Please ensure the trip has actually been completed before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    setCompletionNote("");
                                    setCompletionError("");
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={completeTripManually}
                                disabled={completingTrip}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {completingTrip ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <FlagIcon className="h-4 w-4" />
                                        Complete Trip
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PASSENGER DETAILS MODAL */}
            {showPassengerModal && selectedPassenger && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPassengerModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <UserGroupIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Passenger Details</h2>
                                    <p className="text-indigo-100 text-sm">{selectedPassenger.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPassengerModal(false)}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                            {loadingPassenger ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-indigo-600"></div>
                                    <p className="ml-3 text-gray-500">Loading passenger details...</p>
                                </div>
                            ) : passengerDetails ? (
                                <div className="space-y-6">
                                    {/* Profile Section */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100">
                                        <div className="flex items-start gap-6">
                                            <div className="relative">
                                                {passengerDetails.profile?.avatar ? (
                                                    <img
                                                        src={`https://be.shuttleapp.transev.site${passengerDetails.profile.avatar}`}
                                                        alt={passengerDetails.profile?.full_name}
                                                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            const parent = e.target.parentElement;
                                                            if (parent) {
                                                                const fallback = document.createElement('div');
                                                                fallback.className = "h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg";
                                                                fallback.innerHTML = `<span className="text-3xl font-bold text-white">${passengerDetails.profile?.full_name?.charAt(0) || "?"}</span>`;
                                                                parent.appendChild(fallback);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                                                        <span className="text-3xl font-bold text-white">
                                                            {passengerDetails.profile?.full_name?.charAt(0) || "?"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-800">{passengerDetails.profile?.full_name}</h3>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                        <span className="text-sm">{passengerDetails.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${passengerDetails.is_active
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {passengerDetails.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                        <CalendarDaysIcon className="h-3 w-3" />
                                                        <span>Joined: {new Date(passengerDetails.joined_at).toLocaleDateString("en-IN")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                                                        <CurrencyRupeeIcon className="h-3 w-3" />
                                                        <span>User ID: {passengerDetails.user_id?.slice(0, 13)}...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics Cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Bookings</p>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">{passengerDetails.booking_history?.total_count || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Spent</p>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                ₹{passengerDetails.booking_history?.bookings?.reduce((sum, b) => sum + (b.fare || 0), 0).toLocaleString() || 0}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Fare</p>
                                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                                ₹{passengerDetails.booking_history?.bookings?.length > 0
                                                    ? Math.round(passengerDetails.booking_history.bookings.reduce((sum, b) => sum + (b.fare || 0), 0) / passengerDetails.booking_history.bookings.length)
                                                    : 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Booking History */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <h3 className="font-semibold text-gray-800">Booking History</h3>
                                            <p className="text-xs text-gray-500 mt-1">All passenger bookings</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {passengerDetails.booking_history?.bookings?.map((booking, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <p className="text-xs font-mono text-gray-600">{booking.booking_id?.slice(0, 13)}...</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-gray-800">{booking.pickup_stop?.name || "N/A"}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-gray-800">{booking.dropoff_stop?.name || "N/A"}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-gray-900">₹{booking.fare?.toLocaleString() || 0}</p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "completed"
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : booking.status === "cancelled"
                                                                        ? "bg-red-100 text-red-700"
                                                                        : "bg-amber-100 text-amber-700"
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString("en-IN")}</p>
                                                                <p className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {(!passengerDetails.booking_history?.bookings || passengerDetails.booking_history.bookings.length === 0) && (
                                            <div className="text-center py-8">
                                                <p className="text-gray-400 text-sm">No booking history found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                                    <p className="text-gray-500">Unable to load passenger details</p>
                                    <p className="text-sm text-gray-400 mt-2">The passenger ID could not be found or the API request failed</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowPassengerModal(false)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
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

export default TripDetailsPage;
