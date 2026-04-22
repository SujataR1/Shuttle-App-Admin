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
//     FlagIcon,
//     MapPinIcon,
//     SignalIcon,
//     ArrowRightIcon
// } from "@heroicons/react/24/solid";
// import {
//     ArrowPathIcon,
//     MagnifyingGlassIcon,
//     XMarkIcon
// } from "@heroicons/react/24/outline";
// import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix Leaflet icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//     iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
// });

// // Custom bus icon
// const busIcon = new L.Icon({
//     iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
//     iconSize: [32, 32],
//     iconAnchor: [16, 32],
//     popupAnchor: [1, -34],
//     shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//     shadowSize: [41, 41],
// });

// // Stop marker icon - different colors based on status
// const getStopIcon = (isCurrent = false, isPassed = false) => {
//     let color = "green";
//     if (isCurrent) color = "blue";
//     else if (isPassed) color = "gray";

//     return new L.Icon({
//         iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//         shadowSize: [41, 41],
//     });
// };

// // Function to calculate distance between two coordinates (Haversine formula)
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
// };

// // Function to find nearest stop and determine if driver has arrived
// const findNearestStopWithArrival = (currentLat, currentLng, stops) => {
//     if (!stops || stops.length === 0) return null;

//     let nearestStop = null;
//     let minDistance = Infinity;

//     for (const stop of stops) {
//         const stopLat = stop.latitude || stop.lat;
//         const stopLng = stop.longitude || stop.lng;

//         if (stopLat && stopLng) {
//             const distance = calculateDistance(
//                 currentLat, currentLng,
//                 parseFloat(stopLat), parseFloat(stopLng)
//             );
//             if (distance < minDistance) {
//                 minDistance = distance;
//                 const distanceInMeters = distance * 1000;
//                 nearestStop = {
//                     ...stop,
//                     id: stop.id || stop.stop_id,
//                     stop_name: stop.stop_name || stop.name,
//                     sequence: stop.sequence || stop.stop_sequence || 0,
//                     distance_km: distance,
//                     distance_meters: distanceInMeters,
//                     has_arrived: distanceInMeters <= 50,
//                     is_approaching: distanceInMeters > 50 && distanceInMeters <= 200,
//                     eta_minutes: Math.ceil(distanceInMeters / 200)
//                 };
//             }
//         }
//     }

//     return nearestStop;
// };

// // Function to get location name from coordinates using reverse geocoding
// const getLocationName = async (lat, lng) => {
//     try {
//         const response = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
//             {
//                 headers: {
//                     'User-Agent': 'ShuttleApp/1.0'
//                 }
//             }
//         );
//         const data = await response.json();

//         if (data && data.display_name) {
//             const address = data.address;
//             let locationName = "";

//             if (address.road) locationName += address.road;
//             if (address.suburb) locationName += locationName ? `, ${address.suburb}` : address.suburb;
//             if (address.city) locationName += locationName ? `, ${address.city}` : address.city;

//             return locationName || data.display_name.split(',')[0];
//         }
//         return null;
//     } catch (error) {
//         console.error("Error getting location name:", error);
//         return null;
//     }
// };

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

//     // Live tracking states
//     const [liveTracking, setLiveTracking] = useState(null);
//     const [trackingLoading, setTrackingLoading] = useState(false);
//     const [trackingError, setTrackingError] = useState(null);
//     const [lastUpdated, setLastUpdated] = useState(null);
//     const [currentStop, setCurrentStop] = useState(null);
//     const [locationName, setLocationName] = useState(null);
//     const [routeStops, setRouteStops] = useState([]);
//     const [routeCoordinates, setRouteCoordinates] = useState([]);
//     const [syncing, setSyncing] = useState(false);
//     const [passedStopIds, setPassedStopIds] = useState([]);

//     // Premature end states
//     const [showPrematureEndModal, setShowPrematureEndModal] = useState(false);
//     const [prematureEndReason, setPrematureEndReason] = useState("");
//     const [endingTrip, setEndingTrip] = useState(false);
//     const [prematureEndError, setPrematureEndError] = useState("");

//     // Manual completion states
//     const [showCompleteModal, setShowCompleteModal] = useState(false);
//     const [completionNote, setCompletionNote] = useState("");
//     const [completingTrip, setCompletingTrip] = useState(false);
//     const [completionError, setCompletionError] = useState(null);

//     // Passenger modal states
//     const [selectedPassenger, setSelectedPassenger] = useState(null);
//     const [showPassengerModal, setShowPassengerModal] = useState(false);
//     const [loadingPassenger, setLoadingPassenger] = useState(false);
//     const [passengerDetails, setPassengerDetails] = useState(null);

//     // Fetch route stops
//     const fetchRouteStops = async (routeId) => {
//         if (!routeId) return [];
//         try {
//             const response = await axios.get(`${BASE_URL}/routes/${routeId}/stops`, axiosConfig);
//             console.log("Route stops:", response.data);
//             return response.data || [];
//         } catch (err) {
//             console.error("Error fetching route stops:", err);
//             return [];
//         }
//     };

//     // Fetch live tracking status
//     const fetchLiveTracking = useCallback(async (tripId, showLoading = true) => {
//         if (!tripId) return;

//         if (showLoading) {
//             setSyncing(true);
//         }
//         setTrackingError(null);

//         try {
//             const url = `${BASE_URL}/trip/${tripId}/status-only`;
//             console.log("Fetching live tracking from:", url);
//             const response = await axios.get(url, axiosConfig);
//             console.log("Live tracking response:", response.data);
//             setLiveTracking(response.data);
//             setLastUpdated(new Date());

//             if (response.data.last_known_location) {
//                 const name = await getLocationName(
//                     response.data.last_known_location.lat,
//                     response.data.last_known_location.lng
//                 );
//                 setLocationName(name);
//             }

//             if (routeStops.length > 0 && response.data.last_known_location) {
//                 const nearest = findNearestStopWithArrival(
//                     response.data.last_known_location.lat,
//                     response.data.last_known_location.lng,
//                     routeStops
//                 );
//                 setCurrentStop(nearest);

//                 if (nearest && nearest.has_arrived) {
//                     setPassedStopIds(prev => {
//                         if (!prev.includes(nearest.id)) {
//                             return [...prev, nearest.id];
//                         }
//                         return prev;
//                     });
//                 }

//                 console.log("Current stop info:", nearest);
//             }
//         } catch (err) {
//             console.error("Error fetching live tracking:", err);
//             if (err.response?.status === 404) {
//                 setTrackingError("Trip not found or tracking not available");
//             } else if (err.response?.status === 401) {
//                 setTrackingError("Authentication failed. Please login again.");
//             } else {
//                 setTrackingError("Unable to fetch bus location");
//             }
//             setLiveTracking(null);
//         } finally {
//             if (showLoading) {
//                 setSyncing(false);
//             }
//         }
//     }, [BASE_URL, axiosConfig, routeStops]);

//     const fetchTrips = async () => {
//         setLoadingTrips(true);
//         setTripLoadError(null);
//         try {
//             console.log("Fetching trips from:", `${BASE_URL}/trips/monitor`);
//             const res = await axios.get(`${BASE_URL}/trips/monitor`, axiosConfig);
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
//             const response = await axios.get(url, axiosConfig);
//             console.log("Trip details response:", response.data);
//             setSelectedTrip(response.data);

//             if (response.data.route?.id) {
//                 const stops = await fetchRouteStops(response.data.route.id);
//                 setRouteStops(stops);

//                 const coords = stops
//                     .filter(stop => (stop.latitude || stop.lat) && (stop.longitude || stop.lng))
//                     .map(stop => [parseFloat(stop.latitude || stop.lat), parseFloat(stop.longitude || stop.lng)]);
//                 setRouteCoordinates(coords);
//             }

//             setLiveTracking(null);
//             setCurrentStop(null);
//             setLocationName(null);
//             setTrackingError(null);
//             setPassedStopIds([]);
//         } catch (err) {
//             console.error("Error fetching trip details:", err);
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
//     }, [axiosConfig]);

//     const handleSyncLocation = async () => {
//         if (selectedTrip?.trip_id && selectedTrip.status === "in_progress") {
//             await fetchLiveTracking(selectedTrip.trip_id, true);
//         } else if (selectedTrip?.status !== "in_progress") {
//             setTrackingError("Trip is not in progress. Live tracking only available for active trips.");
//             setTimeout(() => setTrackingError(null), 3000);
//         }
//     };

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
//             const res = await axios.get(url, axiosConfig);
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
//                 axiosConfig
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
//                 if (statusCode === 401) {
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

//     const prematureEndTrip = async () => {
//         if (!prematureEndReason) {
//             setPrematureEndError("Please provide a reason for ending the trip prematurely");
//             return;
//         }

//         setPrematureEndError("");
//         setEndingTrip(true);

//         try {
//             const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/premature-end`;
//             console.log("Ending trip prematurely:", url);

//             const response = await axios.post(url, {
//                 reason: prematureEndReason
//             }, axiosConfig);

//             console.log("Premature end response:", response.data);

//             if (response.data?.status === "success") {
//                 alert(`✅ Trip ended prematurely!\nCancelled bookings: ${response.data.cancelled_bookings || 0}\nTrip status: ${response.data.trip_status}`);
//                 setShowPrematureEndModal(false);
//                 setPrematureEndReason("");
//                 await fetchTrips();
//                 if (selectedTrip) {
//                     await fetchTripDetails(selectedTrip.trip_id);
//                 }
//             } else {
//                 throw new Error("Unexpected response from server");
//             }
//         } catch (err) {
//             console.error("Error ending trip prematurely:", err);
//             let errorMessage = "Failed to end trip prematurely";
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
//                 if (statusCode === 401) {
//                     errorMessage = "❌ Unauthorized. Please login again.";
//                 } else if (statusCode === 403) {
//                     errorMessage = "❌ You don't have permission to end this trip.";
//                 } else if (statusCode === 404) {
//                     errorMessage = "❌ Trip not found.";
//                 }
//             } else if (err.request) {
//                 errorMessage = "❌ Network error. Please check your connection.";
//             }
//             setPrematureEndError(errorMessage);
//         } finally {
//             setEndingTrip(false);
//         }
//     };

//     const completeTripManually = async () => {
//         setCompletionError(null);

//         try {
//             setCompletingTrip(true);
//             const requestBody = { note: completionNote || null };
//             const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/complete-manually`;
//             console.log("Completing trip:", url);

//             const response = await axios.post(url, requestBody, axiosConfig);

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
//             let errorTitle = "Cannot Complete Trip";

//             if (err.response) {
//                 const statusCode = err.response.status;
//                 const errorData = err.response.data;

//                 if (errorData?.detail?.error === "passengers_still_on_board") {
//                     errorTitle = "⚠️ Passengers Still On Board";
//                     errorMessage = errorData.detail?.message || "Cannot complete the trip while passengers are still on board. Please ensure all passengers have disembarked before completing the trip.";
//                 } else if (errorData?.detail) {
//                     errorMessage = errorData.detail;
//                 } else if (typeof errorData === 'string') {
//                     errorMessage = errorData;
//                 } else if (errorData?.message) {
//                     errorMessage = errorData.message;
//                 }

//                 if (statusCode === 401) {
//                     errorMessage = "❌ Unauthorized. Please login again.";
//                     errorTitle = "Authentication Error";
//                 } else if (statusCode === 403) {
//                     errorMessage = "❌ You don't have permission to complete this trip.";
//                     errorTitle = "Permission Denied";
//                 } else if (statusCode === 404) {
//                     errorMessage = "❌ Trip not found.";
//                     errorTitle = "Not Found";
//                 }
//             } else if (err.request) {
//                 errorMessage = "❌ Network error. Please check your connection.";
//                 errorTitle = "Network Error";
//             }

//             setCompletionError({ title: errorTitle, message: errorMessage });
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
//         const startDelay = getDelayTag(selectedTrip?.timing?.planned_start, selectedTrip?.timing?.actual_start);
//         const endDelay = getDelayTag(selectedTrip?.timing?.planned_end, selectedTrip?.timing?.actual_end);
//         if (startDelay?.label?.includes("Critical") || endDelay?.label?.includes("Critical")) {
//             return "⚠️ Trip is critically delayed";
//         }
//         return null;
//     };

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
//                                     {["all", "scheduled", "in_progress", "completed", "cancelled", "premature_end"].map((status) => (
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

//                                     {/* LIVE TRACKING SECTION */}
//                                     {selectedTrip.status === "in_progress" && (
//                                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                             <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
//                                                 <div className="flex items-center gap-2">
//                                                     <SignalIcon className="h-5 w-5 text-blue-600" />
//                                                     <h3 className="font-semibold text-gray-800">Live Bus Tracking</h3>
//                                                 </div>
//                                                 <button
//                                                     onClick={handleSyncLocation}
//                                                     disabled={syncing}
//                                                     className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
//                                                 >
//                                                     <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
//                                                     {syncing ? "Syncing..." : "Sync Location"}
//                                                 </button>
//                                             </div>
//                                             <div className="p-5">
//                                                 {!liveTracking && !trackingError && (
//                                                     <div className="text-center py-8">
//                                                         <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                                                         <p className="text-gray-500">Click "Sync Location" to see current bus position</p>
//                                                         <button
//                                                             onClick={handleSyncLocation}
//                                                             className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
//                                                         >
//                                                             Sync Now
//                                                         </button>
//                                                     </div>
//                                                 )}

//                                                 {trackingError && (
//                                                     <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
//                                                         <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
//                                                         <p className="text-yellow-700 text-sm">{trackingError}</p>
//                                                         <button
//                                                             onClick={handleSyncLocation}
//                                                             className="mt-3 px-4 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-all"
//                                                         >
//                                                             Try Again
//                                                         </button>
//                                                     </div>
//                                                 )}

//                                                 {liveTracking && (
//                                                     <div className="space-y-4">
//                                                         <div className={`rounded-xl p-5 border ${currentStop?.has_arrived
//                                                             ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
//                                                             : currentStop?.is_approaching
//                                                                 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
//                                                                 : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
//                                                             }`}>
//                                                             <div className="flex items-start gap-3">
//                                                                 <div className={`p-3 rounded-full ${currentStop?.has_arrived ? "bg-green-100" :
//                                                                     currentStop?.is_approaching ? "bg-yellow-100" : "bg-blue-100"
//                                                                     }`}>
//                                                                     <MapPinIcon className={`h-6 w-6 ${currentStop?.has_arrived ? "text-green-600" :
//                                                                         currentStop?.is_approaching ? "text-yellow-600" : "text-blue-600"
//                                                                         }`} />
//                                                                 </div>
//                                                                 <div className="flex-1">
//                                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">
//                                                                         {currentStop?.has_arrived ? "Current Stop (Arrived)" :
//                                                                             currentStop?.is_approaching ? "Next Stop (Approaching)" :
//                                                                                 "Current Location"}
//                                                                     </p>

//                                                                     {currentStop ? (
//                                                                         <>
//                                                                             <p className="text-xl font-bold text-gray-800 mt-1">
//                                                                                 {currentStop.stop_name}
//                                                                             </p>
//                                                                             <div className="mt-2 space-y-1">
//                                                                                 {currentStop.has_arrived ? (
//                                                                                     <div>
//                                                                                         <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
//                                                                                             <CheckCircleIcon className="w-3 h-3" />
//                                                                                             ✓ Driver has arrived at this stop
//                                                                                         </span>
//                                                                                         <p className="text-xs text-green-600 mt-1">
//                                                                                             Stop #{currentStop.sequence} • Arrival confirmed
//                                                                                         </p>
//                                                                                     </div>
//                                                                                 ) : currentStop.is_approaching ? (
//                                                                                     <div>
//                                                                                         <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
//                                                                                             <ClockIcon className="w-3 h-3" />
//                                                                                             Approaching stop
//                                                                                         </span>
//                                                                                         <p className="text-xs text-yellow-600 mt-1">
//                                                                                             {currentStop.distance_meters.toFixed(0)}m away • ETA: ~{currentStop.eta_minutes} min
//                                                                                         </p>
//                                                                                     </div>
//                                                                                 ) : (
//                                                                                     <div>
//                                                                                         <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
//                                                                                             <TruckIcon className="w-3 h-3" />
//                                                                                             En route to next stop
//                                                                                         </span>
//                                                                                         <p className="text-xs text-blue-600 mt-1">
//                                                                                             {currentStop.distance_meters.toFixed(0)}m to {currentStop.stop_name}
//                                                                                         </p>
//                                                                                     </div>
//                                                                                 )}
//                                                                             </div>
//                                                                             <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
//                                                                                 <span>Stop #{currentStop.sequence}</span>
//                                                                                 <span>•</span>
//                                                                                 <span>Distance: {currentStop.distance_meters.toFixed(0)}m</span>
//                                                                             </div>
//                                                                         </>
//                                                                     ) : locationName ? (
//                                                                         <>
//                                                                             <p className="text-lg font-bold text-gray-800 mt-1">
//                                                                                 {locationName}
//                                                                             </p>
//                                                                             <p className="text-xs text-gray-500 mt-1">
//                                                                                 📍 Bus is between stops
//                                                                             </p>
//                                                                         </>
//                                                                     ) : (
//                                                                         <p className="text-sm text-gray-500 mt-1">
//                                                                             Loading stop information...
//                                                                         </p>
//                                                                     )}
//                                                                     {lastUpdated && (
//                                                                         <p className="text-xs text-gray-400 mt-2">
//                                                                             Last synced: {lastUpdated.toLocaleTimeString()}
//                                                                         </p>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                                                             <div className="bg-blue-50 rounded-lg p-3">
//                                                                 <p className="text-xs text-gray-500">Trip Status</p>
//                                                                 <p className="text-lg font-bold text-blue-600">
//                                                                     {liveTracking.status?.replace("_", " ").toUpperCase()}
//                                                                 </p>
//                                                             </div>
//                                                             <div className="bg-green-50 rounded-lg p-3">
//                                                                 <p className="text-xs text-gray-500">Driver</p>
//                                                                 <p className="text-sm font-semibold text-gray-800">{liveTracking.driver_name}</p>
//                                                             </div>
//                                                             <div className="bg-purple-50 rounded-lg p-3">
//                                                                 <p className="text-xs text-gray-500">Route</p>
//                                                                 <p className="text-sm font-semibold text-gray-800 truncate">{liveTracking.route_name}</p>
//                                                             </div>
//                                                         </div>

//                                                         <div className="rounded-xl overflow-hidden border border-gray-200">
//                                                             <div className="bg-gray-50 px-4 py-2 border-b">
//                                                                 <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
//                                                                     <MapPinIcon className="h-4 w-4 text-red-500" />
//                                                                     Route Map with Bus Location
//                                                                 </p>
//                                                             </div>
//                                                             <div className="h-[400px] w-full">
//                                                                 <MapContainer
//                                                                     center={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
//                                                                     zoom={13}
//                                                                     className="h-full w-full"
//                                                                     style={{ background: "#f0f0f0" }}
//                                                                 >
//                                                                     <TileLayer
//                                                                         url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
//                                                                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
//                                                                     />

//                                                                     {routeCoordinates.length > 0 && (
//                                                                         <Polyline
//                                                                             positions={routeCoordinates}
//                                                                             color="#3b82f6"
//                                                                             weight={4}
//                                                                             opacity={0.7}
//                                                                         />
//                                                                     )}

//                                                                     {routeStops.map((stop, idx) => {
//                                                                         const stopLat = stop.latitude || stop.lat;
//                                                                         const stopLng = stop.longitude || stop.lng;
//                                                                         if (stopLat && stopLng) {
//                                                                             const isCurrentStop = currentStop && (currentStop.id === stop.id || currentStop.stop_name === stop.stop_name);
//                                                                             const isPassed = passedStopIds.includes(stop.id);
//                                                                             return (
//                                                                                 <Marker
//                                                                                     key={idx}
//                                                                                     position={[parseFloat(stopLat), parseFloat(stopLng)]}
//                                                                                     icon={getStopIcon(isCurrentStop, isPassed)}
//                                                                                 >
//                                                                                     <Popup>
//                                                                                         <div className="text-center">
//                                                                                             <p className="font-bold text-gray-800">{stop.stop_name || stop.name}</p>
//                                                                                             <p className="text-xs text-gray-500">Stop #{stop.sequence || stop.stop_sequence}</p>
//                                                                                             {isCurrentStop && currentStop?.has_arrived && (
//                                                                                                 <p className="text-xs text-green-600 font-semibold mt-1">📍 Current Location (Arrived)</p>
//                                                                                             )}
//                                                                                             {isCurrentStop && !currentStop?.has_arrived && (
//                                                                                                 <p className="text-xs text-blue-600 font-semibold mt-1">📍 Approaching</p>
//                                                                                             )}
//                                                                                             {isPassed && !isCurrentStop && (
//                                                                                                 <p className="text-xs text-gray-500 mt-1">✓ Passed</p>
//                                                                                             )}
//                                                                                         </div>
//                                                                                     </Popup>
//                                                                                 </Marker>
//                                                                             );
//                                                                         }
//                                                                         return null;
//                                                                     })}

//                                                                     <Marker
//                                                                         position={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
//                                                                         icon={busIcon}
//                                                                     >
//                                                                         <Popup>
//                                                                             <div className="text-center">
//                                                                                 <p className="font-bold text-gray-800">{liveTracking.route_name}</p>
//                                                                                 <p className="text-sm text-gray-600">Driver: {liveTracking.driver_name}</p>
//                                                                                 <p className="text-xs text-gray-500 mt-1">
//                                                                                     Status: {liveTracking.status}
//                                                                                 </p>
//                                                                                 {currentStop && (
//                                                                                     <p className="text-xs text-green-600 mt-1">
//                                                                                         {currentStop.has_arrived ? `At: ${currentStop.stop_name}` : `Next: ${currentStop.stop_name}`}
//                                                                                     </p>
//                                                                                 )}
//                                                                             </div>
//                                                                         </Popup>
//                                                                     </Marker>

//                                                                     <CircleMarker
//                                                                         center={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
//                                                                         radius={50}
//                                                                         fillColor="#3b82f6"
//                                                                         color="transparent"
//                                                                         fillOpacity={0.1}
//                                                                     />
//                                                                 </MapContainer>
//                                                             </div>
//                                                         </div>

//                                                         {routeStops.length > 0 && currentStop && (
//                                                             <div className="bg-gray-50 rounded-xl p-4">
//                                                                 <p className="text-sm font-medium text-gray-700 mb-3">Stop Progress</p>
//                                                                 <div className="flex items-center justify-between flex-wrap gap-2">
//                                                                     {routeStops.map((stop, idx) => {
//                                                                         const isPassed = currentStop.sequence > stop.sequence || passedStopIds.includes(stop.id);
//                                                                         const isCurrent = currentStop.id === stop.id;
//                                                                         const isCompleted = isPassed && !isCurrent;
//                                                                         return (
//                                                                             <div key={idx} className="flex items-center">
//                                                                                 <div className={`text-center ${isCompleted || isPassed ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
//                                                                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent && currentStop?.has_arrived ? 'bg-green-500 text-white ring-4 ring-green-200' :
//                                                                                         isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-200' :
//                                                                                             isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
//                                                                                         }`}>
//                                                                                         {stop.sequence}
//                                                                                     </div>
//                                                                                     <p className="text-xs mt-1 max-w-[60px] truncate">{stop.stop_name?.split(' ')[0]}</p>
//                                                                                     {isCurrent && currentStop?.has_arrived && (
//                                                                                         <p className="text-xs text-green-600">Arrived ✓</p>
//                                                                                     )}
//                                                                                 </div>
//                                                                                 {idx < routeStops.length - 1 && (
//                                                                                     <ArrowRightIcon className={`w-4 h-4 mx-1 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`} />
//                                                                                 )}
//                                                                             </div>
//                                                                         );
//                                                                     })}
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         <div className="bg-gray-50 rounded-xl p-4">
//                                                             <p className="text-sm font-medium text-gray-700 mb-3">Trip Timeline</p>
//                                                             <div className="space-y-2">
//                                                                 <div className="flex justify-between text-sm">
//                                                                     <span className="text-gray-500">Planned Start:</span>
//                                                                     <span className="font-medium">{new Date(liveTracking.planned_times?.start).toLocaleString()}</span>
//                                                                 </div>
//                                                                 <div className="flex justify-between text-sm">
//                                                                     <span className="text-gray-500">Actual Start:</span>
//                                                                     <span className="font-medium text-green-600">
//                                                                         {liveTracking.actual_times?.start ? new Date(liveTracking.actual_times.start).toLocaleString() : "Not started"}
//                                                                     </span>
//                                                                 </div>
//                                                                 <div className="flex justify-between text-sm">
//                                                                     <span className="text-gray-500">Planned End:</span>
//                                                                     <span className="font-medium">{new Date(liveTracking.planned_times?.end).toLocaleString()}</span>
//                                                                 </div>
//                                                                 <div className="flex justify-between text-sm">
//                                                                     <span className="text-gray-500">Actual End:</span>
//                                                                     <span className="font-medium text-orange-600">
//                                                                         {liveTracking.actual_times?.end ? new Date(liveTracking.actual_times.end).toLocaleString() : "In progress"}
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* STATS GRID */}
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

//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">Start Status</p>
//                                                     <p className={`text-lg font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).color}`}>
//                                                         {getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).label}
//                                                     </p>
//                                                 </div>
//                                                 <ClockIcon className="h-8 w-8 text-indigo-400" />
//                                             </div>
//                                         </div>

//                                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <p className="text-xs text-gray-500 uppercase tracking-wide">End Status</p>
//                                                     <p className={`text-lg font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).color}`}>
//                                                         {getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).label}
//                                                     </p>
//                                                 </div>
//                                                 <ClockIcon className="h-8 w-8 text-indigo-400" />
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* ROUTE STOPS SUMMARY - NEW */}
//                                     {/* ROUTE STOPS SUMMARY - UPDATED WITH ACTUAL DROP */}
//                                     {selectedTrip.occupancy?.passengers?.length > 0 && (
//                                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                             <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                                 <div className="flex items-center gap-2">
//                                                     <MapPinIcon className="w-5 h-5 text-gray-600" />
//                                                     <h3 className="font-semibold text-gray-800">Passenger Pickup/Dropoff Summary</h3>
//                                                 </div>
//                                                 <p className="text-xs text-gray-500 mt-1">Stops for each passenger on this trip</p>
//                                             </div>
//                                             <div className="p-5">
//                                                 <div className="space-y-3">
//                                                     {selectedTrip.occupancy.passengers.map((passenger, idx) => (
//                                                         <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-xl">
//                                                             <div className="flex items-center justify-between">
//                                                                 <div className="flex-1">
//                                                                     <p className="font-medium text-gray-800">{passenger.name}</p>
//                                                                     <div className="flex items-center gap-2 mt-1 text-sm">
//                                                                         <span className="text-green-600">🚏 Pickup: {passenger.pickup_stop_name || 'N/A'}</span>
//                                                                         <span className="text-gray-400">→</span>
//                                                                         <span className="text-red-600">📍 Dropoff: {passenger.dropoff_stop_name || 'N/A'}</span>
//                                                                     </div>
//                                                                     {/* NEW: Actual Drop Stop */}
//                                                                     {passenger.actual_drop_stop_name && (
//                                                                         <div className="flex items-center gap-2 mt-2 text-sm">
//                                                                             <span className="text-blue-600">🔽 Actual Drop: {passenger.actual_drop_stop_name}</span>
//                                                                             {passenger.actual_dropped_at && (
//                                                                                 <span className="text-gray-400 text-xs">
//                                                                                     at {new Date(passenger.actual_dropped_at).toLocaleTimeString()}
//                                                                                 </span>
//                                                                             )}
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${passenger.status === "booked" ? "bg-emerald-100 text-emerald-700" :
//                                                                     passenger.status === "cancelled" ? "bg-red-100 text-red-700" :
//                                                                         passenger.status === "boarded" ? "bg-blue-100 text-blue-700" :
//                                                                             "bg-gray-100 text-gray-600"
//                                                                     }`}>
//                                                                     {passenger.status}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}

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

//                                     {/* ACTION BUTTONS */}
//                                     {selectedTrip.status === "in_progress" && (
//                                         <div className="flex gap-4">
//                                             <button
//                                                 onClick={() => setShowPrematureEndModal(true)}
//                                                 className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
//                                             >
//                                                 <ExclamationTriangleIcon className="h-5 w-5" />
//                                                 End Trip Prematurely
//                                             </button>
//                                             <button
//                                                 onClick={() => setShowCompleteModal(true)}
//                                                 className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
//                                             >
//                                                 <FlagIcon className="h-5 w-5" />
//                                                 Complete Trip
//                                             </button>
//                                         </div>
//                                     )}

//                                     {/* CANCEL SECTION */}
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

//                                     {/* PASSENGERS SECTION - UPDATED WITH PICKUP/DROPOFF */}
//                                     {/* PASSENGERS SECTION - UPDATED WITH ACTUAL DROP STOP */}
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
//                                                             <div className="flex items-center gap-3 flex-1">
//                                                                 <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all">
//                                                                     <span className="text-indigo-600 font-semibold text-sm">
//                                                                         {passenger.name?.charAt(0) || "?"}
//                                                                     </span>
//                                                                 </div>
//                                                                 <div className="flex-1">
//                                                                     <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{passenger.name}</p>
//                                                                     <p className="text-xs text-gray-400">ID: {passenger.passenger_id?.slice(0, 13)}...</p>
//                                                                     {/* Pickup and Dropoff Stops */}
//                                                                     <div className="flex flex-col gap-1 mt-1 text-xs">
//                                                                         <div className="flex items-center gap-2">
//                                                                             <span className="text-green-600">🚏 Pickup: {passenger.pickup_stop_name || 'N/A'}</span>
//                                                                         </div>
//                                                                         <div className="flex items-center gap-2">
//                                                                             <span className="text-red-600">📍 Dropoff: {passenger.dropoff_stop_name || 'N/A'}</span>
//                                                                         </div>
//                                                                         {/* NEW: Actual Drop Stop (where passenger actually got off) */}
//                                                                         {passenger.actual_drop_stop_name && (
//                                                                             <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200">
//                                                                                 <span className="text-blue-600">🔽 Actual Drop: {passenger.actual_drop_stop_name}</span>
//                                                                                 {passenger.actual_dropped_at && (
//                                                                                     <span className="text-gray-400 text-xs">
//                                                                                         at {new Date(passenger.actual_dropped_at).toLocaleTimeString()}
//                                                                                     </span>
//                                                                                 )}
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="flex items-center gap-2">
//                                                                 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${passenger.status === "booked" ? "bg-emerald-100 text-emerald-700" :
//                                                                     passenger.status === "cancelled" ? "bg-red-100 text-red-700" :
//                                                                         passenger.status === "boarded" ? "bg-blue-100 text-blue-700" :
//                                                                             "bg-gray-100 text-gray-600"
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

//             {/* PREMATURE END MODAL */}
//             {showPrematureEndModal && selectedTrip && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPrematureEndModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
//                         <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
//                                     <ExclamationTriangleIcon className="h-5 w-5 text-white" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-lg font-bold text-white">End Trip Prematurely</h2>
//                                     <p className="text-orange-100 text-xs">{selectedTrip.route?.name}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-6">
//                             {prematureEndError && (
//                                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
//                                     <div className="flex items-start gap-2">
//                                         <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5" />
//                                         <p className="text-sm text-red-600">{prematureEndError}</p>
//                                     </div>
//                                 </div>
//                             )}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Reason for premature end <span className="text-red-500">*</span>
//                                 </label>
//                                 <textarea
//                                     className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
//                                     placeholder="Please provide a reason why this trip is ending prematurely..."
//                                     value={prematureEndReason}
//                                     onChange={(e) => {
//                                         setPrematureEndReason(e.target.value);
//                                         if (prematureEndError) setPrematureEndError("");
//                                     }}
//                                     rows="4"
//                                 />
//                             </div>
//                             <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
//                                 <div className="flex items-start gap-2">
//                                     <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
//                                     <p className="text-xs text-red-700">
//                                         <span className="font-semibold">Warning:</span> This action will end the trip immediately and cancel all active bookings.
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end gap-3">
//                             <button
//                                 onClick={() => {
//                                     setShowPrematureEndModal(false);
//                                     setPrematureEndReason("");
//                                     setPrematureEndError("");
//                                 }}
//                                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={prematureEndTrip}
//                                 disabled={endingTrip}
//                                 className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                             >
//                                 {endingTrip ? (
//                                     <>
//                                         <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                                         Ending Trip...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <ExclamationTriangleIcon className="h-4 w-4" />
//                                         End Trip Prematurely
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* MANUAL COMPLETION MODAL */}
//             {showCompleteModal && selectedTrip && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCompleteModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
//                         <div className={`px-6 py-4 ${completionError?.title?.includes("Passengers")
//                             ? "bg-amber-600"
//                             : "bg-gradient-to-r from-emerald-600 to-emerald-700"}`}>
//                             <div className="flex items-center gap-3">
//                                 <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
//                                     {completionError?.title?.includes("Passengers") ? (
//                                         <ExclamationTriangleIcon className="h-5 w-5 text-white" />
//                                     ) : (
//                                         <FlagIcon className="h-5 w-5 text-white" />
//                                     )}
//                                 </div>
//                                 <div>
//                                     <h2 className="text-lg font-bold text-white">
//                                         {completionError?.title?.includes("Passengers") ? "Cannot Complete Trip" : "Complete Trip"}
//                                     </h2>
//                                     <p className="text-emerald-100 text-xs">{selectedTrip.route?.name}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-6">
//                             {completionError && (
//                                 <div className={`mb-4 p-4 rounded-xl ${completionError.title?.includes("Passengers")
//                                     ? "bg-amber-50 border border-amber-200"
//                                     : "bg-red-50 border border-red-200"}`}>
//                                     <div className="flex items-start gap-3">
//                                         {completionError.title?.includes("Passengers") ? (
//                                             <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
//                                         ) : (
//                                             <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
//                                         )}
//                                         <div className="flex-1">
//                                             <p className={`text-sm font-semibold ${completionError.title?.includes("Passengers") ? "text-amber-800" : "text-red-800"}`}>
//                                                 {completionError.title || "Error"}
//                                             </p>
//                                             <p className={`text-sm mt-1 ${completionError.title?.includes("Passengers") ? "text-amber-700" : "text-red-600"}`}>
//                                                 {completionError.message}
//                                             </p>
//                                             {completionError.title?.includes("Passengers") && (
//                                                 <div className="mt-3">
//                                                     <button
//                                                         onClick={() => {
//                                                             setShowCompleteModal(false);
//                                                             setCompletionError(null);
//                                                             setCompletionNote("");
//                                                         }}
//                                                         className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
//                                                     >
//                                                         Close
//                                                     </button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                             {(!completionError || !completionError.title?.includes("Passengers")) ? (
//                                 <>
//                                     <div className="mb-4">
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Completion Note (Optional)
//                                         </label>
//                                         <textarea
//                                             className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
//                                             placeholder="Add a note about why this trip is being completed..."
//                                             value={completionNote}
//                                             onChange={(e) => setCompletionNote(e.target.value)}
//                                             rows="4"
//                                         />
//                                     </div>
//                                     <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
//                                         <div className="flex items-start gap-2">
//                                             <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
//                                             <p className="text-xs text-amber-700">
//                                                 <span className="font-semibold">Warning:</span> This action will mark the trip as completed.
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </>
//                             ) : null}
//                         </div>
//                         {(!completionError || !completionError.title?.includes("Passengers")) && (
//                             <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end gap-3">
//                                 <button
//                                     onClick={() => {
//                                         setShowCompleteModal(false);
//                                         setCompletionNote("");
//                                         setCompletionError(null);
//                                     }}
//                                     className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={completeTripManually}
//                                     disabled={completingTrip}
//                                     className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                 >
//                                     {completingTrip ? (
//                                         <>
//                                             <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                                             Completing...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <FlagIcon className="h-4 w-4" />
//                                             Complete Trip
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {/* PASSENGER DETAILS MODAL - UPDATED */}
//             {showPassengerModal && selectedPassenger && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPassengerModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
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
//                         <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
//                             {loadingPassenger ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-indigo-600"></div>
//                                     <p className="ml-3 text-gray-500">Loading passenger details...</p>
//                                 </div>
//                             ) : passengerDetails ? (
//                                 <div className="space-y-6">
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
//                                                                 fallback.innerHTML = `<span className="text-3xl font-bold text-white">${passengerDetails.profile?.full_name?.charAt(0) || "?"}</span>`;
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

//                                     {/* Booking History with Stops */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <h3 className="font-semibold text-gray-800">Booking History</h3>
//                                             <p className="text-xs text-gray-500 mt-1">All passenger bookings with stop details</p>
//                                         </div>
//                                         <div className="overflow-x-auto">
//                                             <table className="w-full text-sm">
//                                                 <thead className="bg-gray-50">
//                                                     <tr>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Stop</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff Stop</th>
//                                                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Drop</th>
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
//                                                                 <div className="flex items-center gap-1">
//                                                                     <span className="text-green-600">🚏</span>
//                                                                     <p className="text-sm text-gray-800">{booking.pickup_stop?.name || "N/A"}</p>
//                                                                 </div>
//                                                                 {booking.pickup_stop?.sequence && (
//                                                                     <p className="text-xs text-gray-400">Stop #{booking.pickup_stop.sequence}</p>
//                                                                 )}
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <div className="flex items-center gap-1">
//                                                                     <span className="text-red-600">📍</span>
//                                                                     <p className="text-sm text-gray-800">{booking.dropoff_stop?.name || "N/A"}</p>
//                                                                 </div>
//                                                                 {booking.dropoff_stop?.sequence && (
//                                                                     <p className="text-xs text-gray-400">Stop #{booking.dropoff_stop.sequence}</p>
//                                                                 )}
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 {booking.actual_drop_stop_name ? (
//                                                                     <div>
//                                                                         <p className="text-sm text-blue-600">{booking.actual_drop_stop_name}</p>
//                                                                         {booking.actual_dropped_at && (
//                                                                             <p className="text-xs text-gray-400">{new Date(booking.actual_dropped_at).toLocaleTimeString()}</p>
//                                                                         )}
//                                                                     </div>
//                                                                 ) : (
//                                                                     <span className="text-xs text-gray-400">Not dropped</span>
//                                                                 )}
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <p className="font-medium text-gray-900">₹{booking.fare?.toLocaleString() || 0}</p>
//                                                             </td>
//                                                             <td className="px-4 py-3">
//                                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "completed" ? "bg-emerald-100 text-emerald-700" :
//                                                                     booking.status === "cancelled" ? "bg-red-100 text-red-700" :
//                                                                         "bg-amber-100 text-amber-700"
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

//                                     {/* Stats Cards */}
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
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
//                                     <p className="text-gray-500">Unable to load passenger details</p>
//                                     <p className="text-sm text-gray-400 mt-2">The passenger ID could not be found or the API request failed</p>
//                                 </div>
//                             )}
//                         </div>
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
    FlagIcon,
    MapPinIcon,
    SignalIcon,
    ArrowRightIcon
} from "@heroicons/react/24/solid";
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [1, -34],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    shadowSize: [41, 41],
});

// Stop marker icon - different colors based on status
const getStopIcon = (isCurrent = false, isPassed = false) => {
    let color = "green";
    if (isCurrent) color = "blue";
    else if (isPassed) color = "gray";

    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        shadowSize: [41, 41],
    });
};

// Function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Function to find nearest stop and determine if driver has arrived
const findNearestStopWithArrival = (currentLat, currentLng, stops) => {
    if (!stops || stops.length === 0) return null;

    let nearestStop = null;
    let minDistance = Infinity;

    for (const stop of stops) {
        const stopLat = stop.latitude || stop.lat;
        const stopLng = stop.longitude || stop.lng;

        if (stopLat && stopLng) {
            const distance = calculateDistance(
                currentLat, currentLng,
                parseFloat(stopLat), parseFloat(stopLng)
            );
            if (distance < minDistance) {
                minDistance = distance;
                const distanceInMeters = distance * 1000;
                nearestStop = {
                    ...stop,
                    id: stop.id || stop.stop_id,
                    stop_name: stop.stop_name || stop.name,
                    sequence: stop.sequence || stop.stop_sequence || 0,
                    distance_km: distance,
                    distance_meters: distanceInMeters,
                    has_arrived: distanceInMeters <= 50,
                    is_approaching: distanceInMeters > 50 && distanceInMeters <= 200,
                    eta_minutes: Math.ceil(distanceInMeters / 200)
                };
            }
        }
    }

    return nearestStop;
};

// Function to get location name from coordinates using reverse geocoding
const getLocationName = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'ShuttleApp/1.0'
                }
            }
        );
        const data = await response.json();

        if (data && data.display_name) {
            const address = data.address;
            let locationName = "";

            if (address.road) locationName += address.road;
            if (address.suburb) locationName += locationName ? `, ${address.suburb}` : address.suburb;
            if (address.city) locationName += locationName ? `, ${address.city}` : address.city;

            return locationName || data.display_name.split(',')[0];
        }
        return null;
    } catch (error) {
        console.error("Error getting location name:", error);
        return null;
    }
};

// Helper function to group and sort bookings by date
const groupAndSortBookingsByDate = (bookings) => {
    if (!bookings || bookings.length === 0) return [];
    
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
        const bookingDate = new Date(booking.created_at);
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
    grouped.today.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    grouped.yesterday.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    grouped.older.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const result = [];
    
    if (grouped.today.length > 0) {
        result.push({ title: "Today", bookings: grouped.today });
    }
    if (grouped.yesterday.length > 0) {
        result.push({ title: "Yesterday", bookings: grouped.yesterday });
    }
    if (grouped.older.length > 0) {
        result.push({ title: "Previous Bookings", bookings: grouped.older });
    }
    
    return result;
};

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

    // Live tracking states
    const [liveTracking, setLiveTracking] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [currentStop, setCurrentStop] = useState(null);
    const [locationName, setLocationName] = useState(null);
    const [routeStops, setRouteStops] = useState([]);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [passedStopIds, setPassedStopIds] = useState([]);

    // Premature end states
    const [showPrematureEndModal, setShowPrematureEndModal] = useState(false);
    const [prematureEndReason, setPrematureEndReason] = useState("");
    const [endingTrip, setEndingTrip] = useState(false);
    const [prematureEndError, setPrematureEndError] = useState("");

    // Manual completion states
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completionNote, setCompletionNote] = useState("");
    const [completingTrip, setCompletingTrip] = useState(false);
    const [completionError, setCompletionError] = useState(null);

    // Passenger modal states
    const [selectedPassenger, setSelectedPassenger] = useState(null);
    const [showPassengerModal, setShowPassengerModal] = useState(false);
    const [loadingPassenger, setLoadingPassenger] = useState(false);
    const [passengerDetails, setPassengerDetails] = useState(null);

    // Fetch route stops
    const fetchRouteStops = async (routeId) => {
        if (!routeId) return [];
        try {
            const response = await axios.get(`${BASE_URL}/routes/${routeId}/stops`, axiosConfig);
            console.log("Route stops:", response.data);
            return response.data || [];
        } catch (err) {
            console.error("Error fetching route stops:", err);
            return [];
        }
    };

    // Fetch live tracking status
    const fetchLiveTracking = useCallback(async (tripId, showLoading = true) => {
        if (!tripId) return;

        if (showLoading) {
            setSyncing(true);
        }
        setTrackingError(null);

        try {
            const url = `${BASE_URL}/trip/${tripId}/status-only`;
            console.log("Fetching live tracking from:", url);
            const response = await axios.get(url, axiosConfig);
            console.log("Live tracking response:", response.data);
            setLiveTracking(response.data);
            setLastUpdated(new Date());

            if (response.data.last_known_location) {
                const name = await getLocationName(
                    response.data.last_known_location.lat,
                    response.data.last_known_location.lng
                );
                setLocationName(name);
            }

            if (routeStops.length > 0 && response.data.last_known_location) {
                const nearest = findNearestStopWithArrival(
                    response.data.last_known_location.lat,
                    response.data.last_known_location.lng,
                    routeStops
                );
                setCurrentStop(nearest);

                if (nearest && nearest.has_arrived) {
                    setPassedStopIds(prev => {
                        if (!prev.includes(nearest.id)) {
                            return [...prev, nearest.id];
                        }
                        return prev;
                    });
                }

                console.log("Current stop info:", nearest);
            }
        } catch (err) {
            console.error("Error fetching live tracking:", err);
            if (err.response?.status === 404) {
                setTrackingError("Trip not found or tracking not available");
            } else if (err.response?.status === 401) {
                setTrackingError("Authentication failed. Please login again.");
            } else {
                setTrackingError("Unable to fetch bus location");
            }
            setLiveTracking(null);
        } finally {
            if (showLoading) {
                setSyncing(false);
            }
        }
    }, [BASE_URL, axiosConfig, routeStops]);

    const fetchTrips = async () => {
        setLoadingTrips(true);
        setTripLoadError(null);
        try {
            console.log("Fetching trips from:", `${BASE_URL}/trips/monitor`);
            const res = await axios.get(`${BASE_URL}/trips/monitor`, axiosConfig);
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
            const response = await axios.get(url, axiosConfig);
            console.log("Trip details response:", response.data);
            setSelectedTrip(response.data);

            if (response.data.route?.id) {
                const stops = await fetchRouteStops(response.data.route.id);
                setRouteStops(stops);

                const coords = stops
                    .filter(stop => (stop.latitude || stop.lat) && (stop.longitude || stop.lng))
                    .map(stop => [parseFloat(stop.latitude || stop.lat), parseFloat(stop.longitude || stop.lng)]);
                setRouteCoordinates(coords);
            }

            setLiveTracking(null);
            setCurrentStop(null);
            setLocationName(null);
            setTrackingError(null);
            setPassedStopIds([]);
        } catch (err) {
            console.error("Error fetching trip details:", err);
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
    }, [axiosConfig]);

    const handleSyncLocation = async () => {
        if (selectedTrip?.trip_id && selectedTrip.status === "in_progress") {
            await fetchLiveTracking(selectedTrip.trip_id, true);
        } else if (selectedTrip?.status !== "in_progress") {
            setTrackingError("Trip is not in progress. Live tracking only available for active trips.");
            setTimeout(() => setTrackingError(null), 3000);
        }
    };

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
            const res = await axios.get(url, axiosConfig);
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
                axiosConfig
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
                if (statusCode === 401) {
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
            }, axiosConfig);

            console.log("Premature end response:", response.data);

            if (response.data?.status === "success") {
                alert(`✅ Trip ended prematurely!\nCancelled bookings: ${response.data.cancelled_bookings || 0}\nTrip status: ${response.data.trip_status}`);
                setShowPrematureEndModal(false);
                setPrematureEndReason("");
                await fetchTrips();
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
                if (statusCode === 401) {
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

    const completeTripManually = async () => {
        setCompletionError(null);

        try {
            setCompletingTrip(true);
            const requestBody = { note: completionNote || null };
            const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/complete-manually`;
            console.log("Completing trip:", url);

            const response = await axios.post(url, requestBody, axiosConfig);

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
            let errorTitle = "Cannot Complete Trip";

            if (err.response) {
                const statusCode = err.response.status;
                const errorData = err.response.data;

                if (errorData?.detail?.error === "passengers_still_on_board") {
                    errorTitle = "⚠️ Passengers Still On Board";
                    errorMessage = errorData.detail?.message || "Cannot complete the trip while passengers are still on board. Please ensure all passengers have disembarked before completing the trip.";
                } else if (errorData?.detail) {
                    errorMessage = errorData.detail;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }

                if (statusCode === 401) {
                    errorMessage = "❌ Unauthorized. Please login again.";
                    errorTitle = "Authentication Error";
                } else if (statusCode === 403) {
                    errorMessage = "❌ You don't have permission to complete this trip.";
                    errorTitle = "Permission Denied";
                } else if (statusCode === 404) {
                    errorMessage = "❌ Trip not found.";
                    errorTitle = "Not Found";
                }
            } else if (err.request) {
                errorMessage = "❌ Network error. Please check your connection.";
                errorTitle = "Network Error";
            }

            setCompletionError({ title: errorTitle, message: errorMessage });
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
        const startDelay = getDelayTag(selectedTrip?.timing?.planned_start, selectedTrip?.timing?.actual_start);
        const endDelay = getDelayTag(selectedTrip?.timing?.planned_end, selectedTrip?.timing?.actual_end);
        if (startDelay?.label?.includes("Critical") || endDelay?.label?.includes("Critical")) {
            return "⚠️ Trip is critically delayed";
        }
        return null;
    };

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

                                    {/* LIVE TRACKING SECTION */}
                                    {selectedTrip.status === "in_progress" && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <SignalIcon className="h-5 w-5 text-blue-600" />
                                                    <h3 className="font-semibold text-gray-800">Live Bus Tracking</h3>
                                                </div>
                                                <button
                                                    onClick={handleSyncLocation}
                                                    disabled={syncing}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                                                >
                                                    <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                                                    {syncing ? "Syncing..." : "Sync Location"}
                                                </button>
                                            </div>
                                            <div className="p-5">
                                                {!liveTracking && !trackingError && (
                                                    <div className="text-center py-8">
                                                        <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-gray-500">Click "Sync Location" to see current bus position</p>
                                                        <button
                                                            onClick={handleSyncLocation}
                                                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                                        >
                                                            Sync Now
                                                        </button>
                                                    </div>
                                                )}

                                                {trackingError && (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                                                        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                                        <p className="text-yellow-700 text-sm">{trackingError}</p>
                                                        <button
                                                            onClick={handleSyncLocation}
                                                            className="mt-3 px-4 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-all"
                                                        >
                                                            Try Again
                                                        </button>
                                                    </div>
                                                )}

                                                {liveTracking && (
                                                    <div className="space-y-4">
                                                        <div className={`rounded-xl p-5 border ${currentStop?.has_arrived
                                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                                            : currentStop?.is_approaching
                                                                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                                                                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                                                            }`}>
                                                            <div className="flex items-start gap-3">
                                                                <div className={`p-3 rounded-full ${currentStop?.has_arrived ? "bg-green-100" :
                                                                    currentStop?.is_approaching ? "bg-yellow-100" : "bg-blue-100"
                                                                    }`}>
                                                                    <MapPinIcon className={`h-6 w-6 ${currentStop?.has_arrived ? "text-green-600" :
                                                                        currentStop?.is_approaching ? "text-yellow-600" : "text-blue-600"
                                                                        }`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                                        {currentStop?.has_arrived ? "Current Stop (Arrived)" :
                                                                            currentStop?.is_approaching ? "Next Stop (Approaching)" :
                                                                                "Current Location"}
                                                                    </p>

                                                                    {currentStop ? (
                                                                        <>
                                                                            <p className="text-xl font-bold text-gray-800 mt-1">
                                                                                {currentStop.stop_name}
                                                                            </p>
                                                                            <div className="mt-2 space-y-1">
                                                                                {currentStop.has_arrived ? (
                                                                                    <div>
                                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                                                                            <CheckCircleIcon className="w-3 h-3" />
                                                                                            ✓ Driver has arrived at this stop
                                                                                        </span>
                                                                                        <p className="text-xs text-green-600 mt-1">
                                                                                            Stop #{currentStop.sequence} • Arrival confirmed
                                                                                        </p>
                                                                                    </div>
                                                                                ) : currentStop.is_approaching ? (
                                                                                    <div>
                                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                                                                            <ClockIcon className="w-3 h-3" />
                                                                                            Approaching stop
                                                                                        </span>
                                                                                        <p className="text-xs text-yellow-600 mt-1">
                                                                                            {currentStop.distance_meters.toFixed(0)}m away • ETA: ~{currentStop.eta_minutes} min
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div>
                                                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                                                                            <TruckIcon className="w-3 h-3" />
                                                                                            En route to next stop
                                                                                        </span>
                                                                                        <p className="text-xs text-blue-600 mt-1">
                                                                                            {currentStop.distance_meters.toFixed(0)}m to {currentStop.stop_name}
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                                                <span>Stop #{currentStop.sequence}</span>
                                                                                <span>•</span>
                                                                                <span>Distance: {currentStop.distance_meters.toFixed(0)}m</span>
                                                                            </div>
                                                                        </>
                                                                    ) : locationName ? (
                                                                        <>
                                                                            <p className="text-lg font-bold text-gray-800 mt-1">
                                                                                {locationName}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                📍 Bus is between stops
                                                                            </p>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-500 mt-1">
                                                                            Loading stop information...
                                                                        </p>
                                                                    )}
                                                                    {lastUpdated && (
                                                                        <p className="text-xs text-gray-400 mt-2">
                                                                            Last synced: {lastUpdated.toLocaleTimeString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                            <div className="bg-blue-50 rounded-lg p-3">
                                                                <p className="text-xs text-gray-500">Trip Status</p>
                                                                <p className="text-lg font-bold text-blue-600">
                                                                    {liveTracking.status?.replace("_", " ").toUpperCase()}
                                                                </p>
                                                            </div>
                                                            <div className="bg-green-50 rounded-lg p-3">
                                                                <p className="text-xs text-gray-500">Driver</p>
                                                                <p className="text-sm font-semibold text-gray-800">{liveTracking.driver_name}</p>
                                                            </div>
                                                            <div className="bg-purple-50 rounded-lg p-3">
                                                                <p className="text-xs text-gray-500">Route</p>
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{liveTracking.route_name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-xl overflow-hidden border border-gray-200">
                                                            <div className="bg-gray-50 px-4 py-2 border-b">
                                                                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                                    <MapPinIcon className="h-4 w-4 text-red-500" />
                                                                    Route Map with Bus Location
                                                                </p>
                                                            </div>
                                                            <div className="h-[400px] w-full">
                                                                <MapContainer
                                                                    center={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
                                                                    zoom={13}
                                                                    className="h-full w-full"
                                                                    style={{ background: "#f0f0f0" }}
                                                                >
                                                                    <TileLayer
                                                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                                                    />

                                                                    {routeCoordinates.length > 0 && (
                                                                        <Polyline
                                                                            positions={routeCoordinates}
                                                                            color="#3b82f6"
                                                                            weight={4}
                                                                            opacity={0.7}
                                                                        />
                                                                    )}

                                                                    {routeStops.map((stop, idx) => {
                                                                        const stopLat = stop.latitude || stop.lat;
                                                                        const stopLng = stop.longitude || stop.lng;
                                                                        if (stopLat && stopLng) {
                                                                            const isCurrentStop = currentStop && (currentStop.id === stop.id || currentStop.stop_name === stop.stop_name);
                                                                            const isPassed = passedStopIds.includes(stop.id);
                                                                            return (
                                                                                <Marker
                                                                                    key={idx}
                                                                                    position={[parseFloat(stopLat), parseFloat(stopLng)]}
                                                                                    icon={getStopIcon(isCurrentStop, isPassed)}
                                                                                >
                                                                                    <Popup>
                                                                                        <div className="text-center">
                                                                                            <p className="font-bold text-gray-800">{stop.stop_name || stop.name}</p>
                                                                                            <p className="text-xs text-gray-500">Stop #{stop.sequence || stop.stop_sequence}</p>
                                                                                            {isCurrentStop && currentStop?.has_arrived && (
                                                                                                <p className="text-xs text-green-600 font-semibold mt-1">📍 Current Location (Arrived)</p>
                                                                                            )}
                                                                                            {isCurrentStop && !currentStop?.has_arrived && (
                                                                                                <p className="text-xs text-blue-600 font-semibold mt-1">📍 Approaching</p>
                                                                                            )}
                                                                                            {isPassed && !isCurrentStop && (
                                                                                                <p className="text-xs text-gray-500 mt-1">✓ Passed</p>
                                                                                            )}
                                                                                        </div>
                                                                                    </Popup>
                                                                                </Marker>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })}

                                                                    <Marker
                                                                        position={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
                                                                        icon={busIcon}
                                                                    >
                                                                        <Popup>
                                                                            <div className="text-center">
                                                                                <p className="font-bold text-gray-800">{liveTracking.route_name}</p>
                                                                                <p className="text-sm text-gray-600">Driver: {liveTracking.driver_name}</p>
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Status: {liveTracking.status}
                                                                                </p>
                                                                                {currentStop && (
                                                                                    <p className="text-xs text-green-600 mt-1">
                                                                                        {currentStop.has_arrived ? `At: ${currentStop.stop_name}` : `Next: ${currentStop.stop_name}`}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </Popup>
                                                                    </Marker>

                                                                    <CircleMarker
                                                                        center={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
                                                                        radius={50}
                                                                        fillColor="#3b82f6"
                                                                        color="transparent"
                                                                        fillOpacity={0.1}
                                                                    />
                                                                </MapContainer>
                                                            </div>
                                                        </div>

                                                        {routeStops.length > 0 && currentStop && (
                                                            <div className="bg-gray-50 rounded-xl p-4">
                                                                <p className="text-sm font-medium text-gray-700 mb-3">Stop Progress</p>
                                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                                    {routeStops.map((stop, idx) => {
                                                                        const isPassed = currentStop.sequence > stop.sequence || passedStopIds.includes(stop.id);
                                                                        const isCurrent = currentStop.id === stop.id;
                                                                        const isCompleted = isPassed && !isCurrent;
                                                                        return (
                                                                            <div key={idx} className="flex items-center">
                                                                                <div className={`text-center ${isCompleted || isPassed ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent && currentStop?.has_arrived ? 'bg-green-500 text-white ring-4 ring-green-200' :
                                                                                        isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-200' :
                                                                                            isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                                                                        }`}>
                                                                                        {stop.sequence}
                                                                                    </div>
                                                                                    <p className="text-xs mt-1 max-w-[60px] truncate">{stop.stop_name?.split(' ')[0]}</p>
                                                                                    {isCurrent && currentStop?.has_arrived && (
                                                                                        <p className="text-xs text-green-600">Arrived ✓</p>
                                                                                    )}
                                                                                </div>
                                                                                {idx < routeStops.length - 1 && (
                                                                                    <ArrowRightIcon className={`w-4 h-4 mx-1 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`} />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="bg-gray-50 rounded-xl p-4">
                                                            <p className="text-sm font-medium text-gray-700 mb-3">Trip Timeline</p>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-500">Planned Start:</span>
                                                                    <span className="font-medium">{new Date(liveTracking.planned_times?.start).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-500">Actual Start:</span>
                                                                    <span className="font-medium text-green-600">
                                                                        {liveTracking.actual_times?.start ? new Date(liveTracking.actual_times.start).toLocaleString() : "Not started"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-500">Planned End:</span>
                                                                    <span className="font-medium">{new Date(liveTracking.planned_times?.end).toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-gray-500">Actual End:</span>
                                                                    <span className="font-medium text-orange-600">
                                                                        {liveTracking.actual_times?.end ? new Date(liveTracking.actual_times.end).toLocaleString() : "In progress"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STATS GRID */}
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

                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Start Status</p>
                                                    <p className={`text-lg font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).color}`}>
                                                        {getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).label}
                                                    </p>
                                                </div>
                                                <ClockIcon className="h-8 w-8 text-indigo-400" />
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">End Status</p>
                                                    <p className={`text-lg font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).color}`}>
                                                        {getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).label}
                                                    </p>
                                                </div>
                                                <ClockIcon className="h-8 w-8 text-indigo-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROUTE STOPS SUMMARY - NEW */}
                                    {/* ROUTE STOPS SUMMARY - UPDATED WITH ACTUAL DROP */}
                                    {selectedTrip.occupancy?.passengers?.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                                <div className="flex items-center gap-2">
                                                    <MapPinIcon className="w-5 h-5 text-gray-600" />
                                                    <h3 className="font-semibold text-gray-800">Passenger Pickup/Dropoff Summary</h3>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Stops for each passenger on this trip</p>
                                            </div>
                                            <div className="p-5">
                                                <div className="space-y-3">
                                                    {selectedTrip.occupancy.passengers.map((passenger, idx) => (
                                                        <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-xl">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-800">{passenger.name}</p>
                                                                    <div className="flex items-center gap-2 mt-1 text-sm">
                                                                        <span className="text-green-600">🚏 Pickup: {passenger.pickup_stop_name || 'N/A'}</span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="text-red-600">📍 Dropoff: {passenger.dropoff_stop_name || 'N/A'}</span>
                                                                    </div>
                                                                    {/* NEW: Actual Drop Stop */}
                                                                    {passenger.actual_drop_stop_name && (
                                                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                                                            <span className="text-blue-600">🔽 Actual Drop: {passenger.actual_drop_stop_name}</span>
                                                                            {passenger.actual_dropped_at && (
                                                                                <span className="text-gray-400 text-xs">
                                                                                    at {new Date(passenger.actual_dropped_at).toLocaleTimeString()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${passenger.status === "booked" ? "bg-emerald-100 text-emerald-700" :
                                                                    passenger.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                        passenger.status === "boarded" ? "bg-blue-100 text-blue-700" :
                                                                            "bg-gray-100 text-gray-600"
                                                                    }`}>
                                                                    {passenger.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

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

                                    {/* ACTION BUTTONS */}
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

                                    {/* CANCEL SECTION */}
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

                                    {/* PASSENGERS SECTION - UPDATED WITH PICKUP/DROPOFF */}
                                    {/* PASSENGERS SECTION - UPDATED WITH ACTUAL DROP STOP */}
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
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-all">
                                                                    <span className="text-indigo-600 font-semibold text-sm">
                                                                        {passenger.name?.charAt(0) || "?"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">{passenger.name}</p>
                                                                    <p className="text-xs text-gray-400">ID: {passenger.passenger_id?.slice(0, 13)}...</p>
                                                                    {/* Pickup and Dropoff Stops */}
                                                                    <div className="flex flex-col gap-1 mt-1 text-xs">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-green-600">🚏 Pickup: {passenger.pickup_stop_name || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-red-600">📍 Dropoff: {passenger.dropoff_stop_name || 'N/A'}</span>
                                                                        </div>
                                                                        {/* NEW: Actual Drop Stop (where passenger actually got off) */}
                                                                        {passenger.actual_drop_stop_name && (
                                                                            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200">
                                                                                <span className="text-blue-600">🔽 Actual Drop: {passenger.actual_drop_stop_name}</span>
                                                                                {passenger.actual_dropped_at && (
                                                                                    <span className="text-gray-400 text-xs">
                                                                                        at {new Date(passenger.actual_dropped_at).toLocaleTimeString()}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${passenger.status === "booked" ? "bg-emerald-100 text-emerald-700" :
                                                                    passenger.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                        passenger.status === "boarded" ? "bg-blue-100 text-blue-700" :
                                                                            "bg-gray-100 text-gray-600"
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
                                    placeholder="Please provide a reason why this trip is ending prematurely..."
                                    value={prematureEndReason}
                                    onChange={(e) => {
                                        setPrematureEndReason(e.target.value);
                                        if (prematureEndError) setPrematureEndError("");
                                    }}
                                    rows="4"
                                />
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <div className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700">
                                        <span className="font-semibold">Warning:</span> This action will end the trip immediately and cancel all active bookings.
                                    </p>
                                </div>
                            </div>
                        </div>
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
                        <div className={`px-6 py-4 ${completionError?.title?.includes("Passengers")
                            ? "bg-amber-600"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-700"}`}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                                    {completionError?.title?.includes("Passengers") ? (
                                        <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                                    ) : (
                                        <FlagIcon className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        {completionError?.title?.includes("Passengers") ? "Cannot Complete Trip" : "Complete Trip"}
                                    </h2>
                                    <p className="text-emerald-100 text-xs">{selectedTrip.route?.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {completionError && (
                                <div className={`mb-4 p-4 rounded-xl ${completionError.title?.includes("Passengers")
                                    ? "bg-amber-50 border border-amber-200"
                                    : "bg-red-50 border border-red-200"}`}>
                                    <div className="flex items-start gap-3">
                                        {completionError.title?.includes("Passengers") ? (
                                            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-semibold ${completionError.title?.includes("Passengers") ? "text-amber-800" : "text-red-800"}`}>
                                                {completionError.title || "Error"}
                                            </p>
                                            <p className={`text-sm mt-1 ${completionError.title?.includes("Passengers") ? "text-amber-700" : "text-red-600"}`}>
                                                {completionError.message}
                                            </p>
                                            {completionError.title?.includes("Passengers") && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={() => {
                                                            setShowCompleteModal(false);
                                                            setCompletionError(null);
                                                            setCompletionNote("");
                                                        }}
                                                        className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(!completionError || !completionError.title?.includes("Passengers")) ? (
                                <>
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
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                        <div className="flex items-start gap-2">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-amber-700">
                                                <span className="font-semibold">Warning:</span> This action will mark the trip as completed.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                        {(!completionError || !completionError.title?.includes("Passengers")) && (
                            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCompleteModal(false);
                                        setCompletionNote("");
                                        setCompletionError(null);
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
                        )}
                    </div>
                </div>
            )}

            {/* PASSENGER DETAILS MODAL - UPDATED WITH SORTED BOOKING HISTORY */}
            {showPassengerModal && selectedPassenger && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPassengerModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp" onClick={(e) => e.stopPropagation()}>
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
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                            {loadingPassenger ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-indigo-600"></div>
                                    <p className="ml-3 text-gray-500">Loading passenger details...</p>
                                </div>
                            ) : passengerDetails ? (
                                <div className="space-y-6">
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

                                    {/* Booking History with Stops - Sorted by Date (Today > Yesterday > Older) */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <h3 className="font-semibold text-gray-800">Booking History</h3>
                                            <p className="text-xs text-gray-500 mt-1">All passenger bookings with stop details (sorted by date)</p>
                                        </div>
                                        <div className="overflow-x-auto">
                                            {passengerDetails.booking_history?.bookings?.length > 0 ? (
                                                (() => {
                                                    const groupedBookings = groupAndSortBookingsByDate(passengerDetails.booking_history.bookings);
                                                    return groupedBookings.map((group, groupIndex) => (
                                                        <div key={groupIndex}>
                                                            <div className="bg-gray-100 px-4 py-2 sticky top-0">
                                                                <h4 className="text-sm font-semibold text-gray-700">{group.title}</h4>
                                                            </div>
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Stop</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dropoff Stop</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Drop</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fare</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {group.bookings.map((booking, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="px-4 py-3">
                                                                                <p className="text-xs font-mono text-gray-600">{booking.booking_id?.slice(0, 13)}...</p>
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-green-600">🚏</span>
                                                                                    <p className="text-sm text-gray-800">{booking.pickup_stop?.name || "N/A"}</p>
                                                                                </div>
                                                                                {booking.pickup_stop?.sequence && (
                                                                                    <p className="text-xs text-gray-400">Stop #{booking.pickup_stop.sequence}</p>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-red-600">📍</span>
                                                                                    <p className="text-sm text-gray-800">{booking.dropoff_stop?.name || "N/A"}</p>
                                                                                </div>
                                                                                {booking.dropoff_stop?.sequence && (
                                                                                    <p className="text-xs text-gray-400">Stop #{booking.dropoff_stop.sequence}</p>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                {booking.actual_drop_stop_name ? (
                                                                                    <div>
                                                                                        <p className="text-sm text-blue-600">{booking.actual_drop_stop_name}</p>
                                                                                        {booking.actual_dropped_at && (
                                                                                            <p className="text-xs text-gray-400">{new Date(booking.actual_dropped_at).toLocaleTimeString()}</p>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-xs text-gray-400">Not dropped</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                <p className="font-medium text-gray-900">₹{booking.fare?.toLocaleString() || 0}</p>
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                                                                    booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                                        "bg-amber-100 text-amber-700"
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
                                                    ));
                                                })()
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-400 text-sm">No booking history found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
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
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                                    <p className="text-gray-500">Unable to load passenger details</p>
                                    <p className="text-sm text-gray-400 mt-2">The passenger ID could not be found or the API request failed</p>
                                </div>
                            )}
                        </div>
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
