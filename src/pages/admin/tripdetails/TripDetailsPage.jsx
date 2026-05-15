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
//     const [isMobile, setIsMobile] = useState(false);
//     const [sidebarOpen, setSidebarOpen] = useState(false);

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
//     // NEW: Store current trip's booking for the selected passenger
//     const [currentTripBooking, setCurrentTripBooking] = useState(null);

//     // Check if mobile/tablet view
//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 1024);
//         };

//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     // Fetch route stops
//     const fetchRouteStops = async (routeId) => {
//         if (!routeId) return [];
//         try {
//             const response = await axios.get(`${BASE_URL}/routes/${routeId}/stops`, axiosConfig);
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
//             const response = await axios.get(url, axiosConfig);
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
//             const res = await axios.get(`${BASE_URL}/trips/monitor`, axiosConfig);
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
//         setSelectedTrip(null);

//         try {
//             const url = `${BASE_URL}/trips/${trip_id}`;
//             const response = await axios.get(url, axiosConfig);
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

//             if (isMobile) {
//                 setTimeout(() => {
//                     const rightPanel = document.querySelector('.right-panel-content');
//                     if (rightPanel) {
//                         rightPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
//                     }
//                 }, 100);
//             }
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
//             setSelectedTrip(null);
//         } finally {
//             setLoading(false);
//         }
//     }, [axiosConfig, isMobile]);

//     const handleSyncLocation = async () => {
//         if (selectedTrip?.trip_id && selectedTrip.status === "in_progress") {
//             await fetchLiveTracking(selectedTrip.trip_id, true);
//         } else if (selectedTrip?.status !== "in_progress") {
//             setTrackingError("Trip is not in progress. Live tracking only available for active trips.");
//             setTimeout(() => setTrackingError(null), 3000);
//         }
//     };

//     // UPDATED: Fetch only the passenger's profile info, not full history
//     const fetchPassengerProfile = async (passengerId) => {
//         if (!passengerId || passengerId === 'undefined') {
//             console.error("Invalid passenger ID:", passengerId);
//             alert("Unable to fetch passenger details: Invalid passenger ID");
//             return;
//         }

//         setLoadingPassenger(true);
//         try {
//             const url = `${BASE_URL}/passenger/${passengerId}`;
//             const res = await axios.get(url, axiosConfig);
//             // Only store the profile info, not the booking history
//             setPassengerDetails({
//                 profile: res.data.profile,
//                 email: res.data.email,
//                 is_active: res.data.is_active,
//                 joined_at: res.data.joined_at,
//                 user_id: res.data.user_id
//             });
//         } catch (err) {
//             console.error("Error fetching passenger profile:", err);
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

//     // UPDATED: Handle passenger click - show only current trip's booking
//     const handlePassengerClick = async (passenger) => {
//         setSelectedPassenger(passenger);
//         setShowPassengerModal(true);
//         setPassengerDetails(null);

//         // Store the current trip's booking data for this passenger
//         // This is the booking info from the trip API response
//         setCurrentTripBooking({
//             booking_id: selectedTrip.trip_id,
//             passenger_id: passenger.passenger_id,
//             name: passenger.name,
//             status: passenger.status,
//             pickup_stop_name: passenger.pickup_stop_name,
//             dropoff_stop_name: passenger.dropoff_stop_name,
//             actual_drop_stop_name: passenger.actual_drop_stop_name,
//             actual_dropped_at: passenger.actual_dropped_at,
//             created_at: selectedTrip.timing?.actual_start || selectedTrip.timing?.planned_start,
//             fare: null // Fare might not be available in trip API, can be fetched separately if needed
//         });

//         // Fetch just the passenger's profile info (name, email, etc.)
//         if (passenger.passenger_id) {
//             await fetchPassengerProfile(passenger.passenger_id);
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
//             await axios.patch(url, { reason: cancelReason }, axiosConfig);
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
//             const response = await axios.post(url, { reason: prematureEndReason }, axiosConfig);

//             if (response.data?.status === "success") {
//                 alert(`✅ Trip ended prematurely!\nCancelled bookings: ${response.data.cancelled_bookings || 0}`);
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
//                 if (statusCode === 401) {
//                     errorMessage = "❌ Unauthorized. Please login again.";
//                 } else if (statusCode === 403) {
//                     errorMessage = "❌ You don't have permission to end this trip.";
//                 } else if (statusCode === 404) {
//                     errorMessage = "❌ Trip not found.";
//                 }
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
//             const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/complete-manually`;
//             await axios.post(url, { note: completionNote || null }, axiosConfig);
//             alert("✅ Trip completed successfully!");
//             setShowCompleteModal(false);
//             setCompletionNote("");
//             await fetchTrips();
//             if (selectedTrip) {
//                 await fetchTripDetails(selectedTrip.trip_id);
//             }
//         } catch (err) {
//             console.error("Error completing trip:", err);
//             let errorMessage = "Failed to complete trip";
//             let errorTitle = "Cannot Complete Trip";

//             if (err.response) {
//                 const errorData = err.response.data;
//                 if (errorData?.detail?.error === "passengers_still_on_board") {
//                     errorTitle = "⚠️ Passengers Still On Board";
//                     errorMessage = errorData.detail?.message || "Cannot complete the trip while passengers are still on board.";
//                 } else if (errorData?.detail) {
//                     errorMessage = errorData.detail;
//                 }
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

//     const filteredTrips = trips.filter(trip => {
//         const matchesSearch = trip.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             trip.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     if (initialLoad || loadingTrips) {
//         return (
//             <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//                 <Sidebar onClose={() => setSidebarOpen(false)} />
//                 <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//                     <TopNavbarUltra 
//                         onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//                         isMobile={isMobile} 
//                         title="Trip Intelligence" 
//                     />
//                     <div className="flex-1 flex items-center justify-center">
//                         <div className="text-center">
//                             <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-gray-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
//                             <p className="text-gray-500 font-medium text-sm sm:text-base">Loading trips...</p>
//                             <p className="text-xs text-gray-400 mt-1">Fetching real-time data</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//             <Sidebar onClose={() => setSidebarOpen(false)} />

//             <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//                 <TopNavbarUltra 
//                     onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//                     isMobile={isMobile} 
//                     title="Trip Intelligence" 
//                 />

//                 <div className="flex-1 overflow-hidden p-3 sm:p-4 md:p-6">
//                     <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 h-full">
//                         {/* LEFT PANEL */}
//                         <div className="w-full lg:w-[380px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-100">
//                             <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                 <h2 className="text-base sm:text-lg font-bold text-gray-800">Active Trips</h2>
//                                 <p className="text-xs text-gray-500 mt-1">{filteredTrips.length} trips available</p>
//                                 <div className="mt-3 sm:mt-4 relative">
//                                     <input
//                                         type="text"
//                                         placeholder="Search by route, driver, or vehicle..."
//                                         className="w-full pl-9 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                     />
//                                     <MagnifyingGlassIcon className="absolute left-3 top-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
//                                 </div>
//                                 <div className="flex gap-1.5 sm:gap-2 mt-3 flex-wrap">
//                                     {["all", "scheduled", "in_progress", "completed", "cancelled", "premature_end"].map((status) => (
//                                         <button
//                                             key={status}
//                                             onClick={() => setStatusFilter(status)}
//                                             className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-lg capitalize transition-all ${statusFilter === status
//                                                 ? "bg-indigo-600 text-white shadow-sm"
//                                                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                                                 }`}
//                                         >
//                                             {status.replace("_", " ")}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
//                                 {filteredTrips.length === 0 ? (
//                                     <div className="text-center py-8 sm:py-12">
//                                         <TruckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
//                                         <p className="text-gray-400 text-xs sm:text-sm">No trips found</p>
//                                     </div>
//                                 ) : (
//                                     filteredTrips.map((trip) => {
//                                         const statusStyle = getStatusBadge(trip.status);
//                                         const isSelected = selectedTrip?.trip_id === trip.trip_id;

//                                         return (
//                                             <div
//                                                 key={trip.trip_id}
//                                                 onClick={() => {
//                                                     if (!isSelected) {
//                                                         fetchTripDetails(trip.trip_id);
//                                                     }
//                                                 }}
//                                                 onTouchStart={(e) => {
//                                                     e.currentTarget.style.transform = 'scale(0.98)';
//                                                 }}
//                                                 onTouchEnd={(e) => {
//                                                     e.currentTarget.style.transform = '';
//                                                     if (!isSelected) {
//                                                         fetchTripDetails(trip.trip_id);
//                                                     }
//                                                 }}
//                                                 onTouchCancel={(e) => {
//                                                     e.currentTarget.style.transform = '';
//                                                 }}
//                                                 className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
//                                                     isSelected
//                                                         ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-white shadow-lg"
//                                                         : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
//                                                 }`}
//                                                 style={{ transform: 'scale(1)', transition: 'transform 0.1s ease' }}
//                                             >
//                                                 <div className="flex justify-between items-start mb-2">
//                                                     <div className="flex-1">
//                                                         <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{trip.route_name}</p>
//                                                         <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
//                                                             <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px]">{trip.driver}</span>
//                                                             <span className="text-[10px] sm:text-xs text-gray-400">•</span>
//                                                             <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px]">{trip.vehicle}</span>
//                                                         </div>
//                                                     </div>
//                                                     <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} ml-2 flex-shrink-0`}>
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
//                         <div className="flex-1 overflow-y-auto min-h-[500px] lg:min-h-0 right-panel-content">
//                             {!selectedTrip ? (
//                                 <div className="flex items-center justify-center h-full min-h-[400px]">
//                                     <div className="text-center p-6">
//                                         <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg inline-block">
//                                             <TruckIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
//                                             <p className="text-gray-500 font-medium text-sm sm:text-base">Select a trip to view details</p>
//                                             <p className="text-xs text-gray-400 mt-1">Click on any trip from the left panel</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : loading ? (
//                                 <div className="flex items-center justify-center h-full min-h-[400px]">
//                                     <div className="text-center p-6">
//                                         <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-gray-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
//                                         <p className="text-gray-500 text-sm">Loading trip details...</p>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-4 sm:space-y-5 pb-6">
//                                     {/* HEADER CARD */}
//                                     <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
//                                         <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
//                                             <div>
//                                                 <h2 className="text-xl sm:text-2xl font-bold mb-1">{selectedTrip.route?.name}</h2>
//                                                 <p className="text-indigo-100 text-xs sm:text-sm">{selectedTrip.route?.code}</p>
//                                             </div>
//                                             <div className="text-left sm:text-right">
//                                                 <span className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text} border ${getStatusBadge(selectedTrip.status).border}`}>
//                                                     {getStatusBadge(selectedTrip.status).label}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* LIVE TRACKING SECTION */}
//                                     {selectedTrip.status === "in_progress" && (
//                                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                             <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
//                                                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                                                     <div className="flex items-center gap-2">
//                                                         <SignalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
//                                                         <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Live Bus Tracking</h3>
//                                                     </div>
//                                                     <button
//                                                         onClick={handleSyncLocation}
//                                                         disabled={syncing}
//                                                         className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-xs sm:text-sm"
//                                                     >
//                                                         <ArrowPathIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${syncing ? 'animate-spin' : ''}`} />
//                                                         {syncing ? "Syncing..." : "Sync Location"}
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                             <div className="p-4 sm:p-5">
//                                                 {!liveTracking && !trackingError && (
//                                                     <div className="text-center py-6 sm:py-8">
//                                                         <TruckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
//                                                         <p className="text-gray-500 text-xs sm:text-sm">Click "Sync Location" to see current bus position</p>
//                                                         <button
//                                                             onClick={handleSyncLocation}
//                                                             className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs sm:text-sm"
//                                                         >
//                                                             Sync Now
//                                                         </button>
//                                                     </div>
//                                                 )}

//                                                 {trackingError && (
//                                                     <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 text-center">
//                                                         <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-2" />
//                                                         <p className="text-yellow-700 text-xs sm:text-sm">{trackingError}</p>
//                                                         <button
//                                                             onClick={handleSyncLocation}
//                                                             className="mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 bg-yellow-600 text-white text-[10px] sm:text-xs rounded-lg hover:bg-yellow-700 transition-all"
//                                                         >
//                                                             Try Again
//                                                         </button>
//                                                     </div>
//                                                 )}

//                                                 {liveTracking && (
//                                                     <div className="space-y-3 sm:space-y-4">
//                                                         <div className={`rounded-xl p-4 sm:p-5 border ${currentStop?.has_arrived
//                                                             ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
//                                                             : currentStop?.is_approaching
//                                                                 ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
//                                                                 : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
//                                                             }`}>
//                                                             <div className="flex items-start gap-2 sm:gap-3">
//                                                                 <div className={`p-2 sm:p-3 rounded-full ${currentStop?.has_arrived ? "bg-green-100" :
//                                                                     currentStop?.is_approaching ? "bg-yellow-100" : "bg-blue-100"
//                                                                     }`}>
//                                                                     <MapPinIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${currentStop?.has_arrived ? "text-green-600" :
//                                                                         currentStop?.is_approaching ? "text-yellow-600" : "text-blue-600"
//                                                                         }`} />
//                                                                 </div>
//                                                                 <div className="flex-1">
//                                                                     <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
//                                                                         {currentStop?.has_arrived ? "Current Stop (Arrived)" :
//                                                                             currentStop?.is_approaching ? "Next Stop (Approaching)" :
//                                                                                 "Current Location"}
//                                                                     </p>
//                                                                     {currentStop ? (
//                                                                         <>
//                                                                             <p className="text-base sm:text-xl font-bold text-gray-800 mt-1 break-words">
//                                                                                 {currentStop.stop_name}
//                                                                             </p>
//                                                                             <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-[10px] sm:text-xs text-gray-500">
//                                                                                 <span>Stop #{currentStop.sequence}</span>
//                                                                                 <span>•</span>
//                                                                                 <span>Distance: {currentStop.distance_meters.toFixed(0)}m</span>
//                                                                             </div>
//                                                                         </>
//                                                                     ) : locationName ? (
//                                                                         <p className="text-base sm:text-xl font-bold text-gray-800 mt-1 break-words">
//                                                                             {locationName}
//                                                                         </p>
//                                                                     ) : (
//                                                                         <p className="text-xs sm:text-sm text-gray-500 mt-1">Loading stop information...</p>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         </div>

//                                                         <div className="rounded-xl overflow-hidden border border-gray-200">
//                                                             <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b">
//                                                                 <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
//                                                                     <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
//                                                                     Route Map with Bus Location
//                                                                 </p>
//                                                             </div>
//                                                             <div className="h-[300px] sm:h-[400px] w-full">
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
//                                                                         <Polyline positions={routeCoordinates} color="#3b82f6" weight={4} opacity={0.7} />
//                                                                     )}
//                                                                     <Marker
//                                                                         position={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
//                                                                         icon={busIcon}
//                                                                     />
//                                                                 </MapContainer>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* STATS GRID */}
//                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
//                                         <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
//                                             <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
//                                             <p className="text-base sm:text-2xl font-bold text-gray-800 mt-1">{selectedTrip.occupancy?.total_bookings || 0}</p>
//                                         </div>
//                                         <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
//                                             <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Duration</p>
//                                             <p className="text-base sm:text-2xl font-bold text-gray-800 mt-1">
//                                                 {selectedTrip.timing?.actual_start && selectedTrip.timing?.actual_end
//                                                     ? `${Math.round((new Date(selectedTrip.timing.actual_end) - new Date(selectedTrip.timing.actual_start)) / 60000)}m`
//                                                     : "-"}
//                                             </p>
//                                         </div>
//                                         <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
//                                             <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Start Status</p>
//                                             <p className={`text-xs sm:text-sm font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).color}`}>
//                                                 {getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).label}
//                                             </p>
//                                         </div>
//                                         <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
//                                             <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">End Status</p>
//                                             <p className={`text-xs sm:text-sm font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).color}`}>
//                                                 {getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).label}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* PASSENGERS SECTION */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <div className="flex items-center justify-between">
//                                                 <div>
//                                                     <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Passengers</h3>
//                                                     <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total: {selectedTrip.occupancy?.passengers?.length || 0} passengers</p>
//                                                 </div>
//                                                 <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
//                                             </div>
//                                         </div>
//                                         <div className="p-3 sm:p-5">
//                                             {selectedTrip.occupancy?.passengers?.length > 0 ? (
//                                                 <div className="space-y-2 max-h-96 overflow-y-auto">
//                                                     {selectedTrip.occupancy.passengers.map((passenger, index) => {
//                                                         const hasActualDrop = passenger.actual_drop_stop_name && 
//                                                             passenger.actual_drop_stop_name !== passenger.dropoff_stop_name;

//                                                         return (
//                                                             <div
//                                                                 key={index}
//                                                                 onClick={() => handlePassengerClick(passenger)}
//                                                                 className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
//                                                             >
//                                                                 <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full">
//                                                                     <div className="h-7 w-7 sm:h-8 sm:w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                                                         <span className="text-indigo-600 font-semibold text-xs">{passenger.name?.charAt(0) || "?"}</span>
//                                                                     </div>
//                                                                     <div className="flex-1 min-w-0">
//                                                                         <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{passenger.name}</p>
//                                                                         <p className="text-[9px] sm:text-xs text-gray-400 truncate">ID: {passenger.passenger_id?.slice(0, 13)}...</p>
//                                                                         <div className="flex items-center gap-1 mt-1">
//                                                                             <span className="text-green-600 text-[8px] sm:text-[10px]">🚏</span>
//                                                                             <span className="text-[8px] sm:text-[10px] text-gray-600 truncate">Pickup: {passenger.pickup_stop_name || 'N/A'}</span>
//                                                                         </div>
//                                                                         <div className="flex items-center gap-1">
//                                                                             <span className="text-red-600 text-[8px] sm:text-[10px]">📍</span>
//                                                                             <span className="text-[8px] sm:text-[10px] text-gray-600 truncate">Dropoff: {passenger.dropoff_stop_name || 'N/A'}</span>
//                                                                         </div>
//                                                                         {passenger.actual_drop_stop_name && (
//                                                                             <div className="flex items-center gap-1 mt-0.5">
//                                                                                 <span className="text-blue-600 text-[8px] sm:text-[10px]">🔽</span>
//                                                                                 <span className="text-[8px] sm:text-[10px] font-semibold text-blue-600 truncate">
//                                                                                     Actual: {passenger.actual_drop_stop_name}
//                                                                                 </span>
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                                 <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
//                                                                     <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
//                                                                         passenger.status === "completed" ? "bg-emerald-100 text-emerald-700" :
//                                                                         passenger.status === "booked" ? "bg-amber-100 text-amber-700" :
//                                                                         passenger.status === "cancelled" ? "bg-red-100 text-red-700" :
//                                                                         passenger.status === "boarded" ? "bg-blue-100 text-blue-700" : 
//                                                                         "bg-gray-100 text-gray-600"
//                                                                     }`}>
//                                                                         {passenger.status}
//                                                                     </span>
//                                                                     <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" />
//                                                                 </div>
//                                                             </div>
//                                                         );
//                                                     })}
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-center py-6 sm:py-8">
//                                                     <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
//                                                     <p className="text-gray-400 text-xs sm:text-sm">No passengers found</p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* TRIP DETAILS */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Trip Details</h3>
//                                         </div>
//                                         <div className="p-4 sm:p-5">
//                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//                                                 <div className="space-y-3 sm:space-y-4">
//                                                     <div>
//                                                         <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Route Name</label>
//                                                         <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">{selectedTrip.route?.name || "N/A"}</p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Planned Start</label>
//                                                         <p className="text-gray-800 text-xs sm:text-sm mt-1">
//                                                             {selectedTrip.timing?.planned_start ? new Date(selectedTrip.timing.planned_start).toLocaleString("en-IN") : "-"}
//                                                         </p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Planned End</label>
//                                                         <p className="text-gray-800 text-xs sm:text-sm mt-1">
//                                                             {selectedTrip.timing?.planned_end ? new Date(selectedTrip.timing.planned_end).toLocaleString("en-IN") : "-"}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <div className="space-y-3 sm:space-y-4">
//                                                     <div>
//                                                         <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Route Code</label>
//                                                         <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">{selectedTrip.route?.code || "N/A"}</p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Actual Start</label>
//                                                         <p className="text-gray-800 text-xs sm:text-sm mt-1">
//                                                             {selectedTrip.timing?.actual_start ? new Date(selectedTrip.timing.actual_start).toLocaleString("en-IN") : "-"}
//                                                         </p>
//                                                     </div>
//                                                     <div>
//                                                         <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Actual End</label>
//                                                         <p className="text-gray-800 text-xs sm:text-sm mt-1">
//                                                             {selectedTrip.timing?.actual_end ? new Date(selectedTrip.timing.actual_end).toLocaleString("en-IN") : "-"}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="mt-4 pt-3 border-t border-gray-100">
//                                                 <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Trip ID</label>
//                                                 <p className="text-[10px] sm:text-xs font-mono text-gray-600 mt-1 break-all">{selectedTrip.trip_id}</p>
//                                             </div>
//                                             <div className="mt-3">
//                                                 <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Admin Note</label>
//                                                 <p className="text-gray-700 text-xs sm:text-sm mt-1 bg-gray-50 p-2 rounded-lg">{selectedTrip.admin_note || "No notes available"}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* ASSIGNMENT SECTION */}
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//                                         <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-100">
//                                             <div className="flex items-center gap-2 sm:gap-3">
//                                                 <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
//                                                     <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                                     </svg>
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Driver</p>
//                                                     <p className="text-sm sm:text-lg font-semibold text-gray-800">{selectedTrip.assignment?.driver || "N/A"}</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-100">
//                                             <div className="flex items-center gap-2 sm:gap-3">
//                                                 <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
//                                                     <TruckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Vehicle</p>
//                                                     <p className="text-sm sm:text-lg font-semibold text-gray-800">{selectedTrip.assignment?.vehicle || "N/A"}</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* ACTION BUTTONS */}
//                                     {selectedTrip.status === "in_progress" && (
//                                         <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//                                             <button
//                                                 onClick={() => setShowPrematureEndModal(true)}
//                                                 className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
//                                             >
//                                                 <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
//                                                 End Trip Prematurely
//                                             </button>
//                                             <button
//                                                 onClick={() => setShowCompleteModal(true)}
//                                                 className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
//                                             >
//                                                 <FlagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
//                                                 Complete Trip
//                                             </button>
//                                         </div>
//                                     )}

//                                     {/* CANCEL SECTION */}
//                                     {selectedTrip.status === "scheduled" && (
//                                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                             <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
//                                                 <h3 className="font-semibold text-red-700">Cancel Trip</h3>
//                                                 <p className="text-[10px] sm:text-xs text-gray-500 mt-1">This action cannot be undone</p>
//                                             </div>
//                                             <div className="p-4 sm:p-5">
//                                                 <textarea
//                                                     className="w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none border-gray-200"
//                                                     placeholder="Enter cancellation reason..."
//                                                     value={cancelReason}
//                                                     onChange={(e) => setCancelReason(e.target.value)}
//                                                     rows="3"
//                                                 />
//                                                 <button
//                                                     onClick={cancelTrip}
//                                                     className="mt-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all text-xs sm:text-sm"
//                                                 >
//                                                     Cancel Trip
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* PREMATURE END MODAL */}
//             {showPrematureEndModal && selectedTrip && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowPrematureEndModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
//                         <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 sm:px-6 py-3 sm:py-4">
//                             <div className="flex items-center gap-2 sm:gap-3">
//                                 <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full flex items-center justify-center">
//                                     <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-base sm:text-lg font-bold text-white">End Trip Prematurely</h2>
//                                     <p className="text-orange-100 text-[10px] sm:text-xs">{selectedTrip.route?.name}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-4 sm:p-6">
//                             <textarea
//                                 className="w-full border border-gray-200 rounded-xl p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
//                                 placeholder="Please provide a reason why this trip is ending prematurely..."
//                                 value={prematureEndReason}
//                                 onChange={(e) => setPrematureEndReason(e.target.value)}
//                                 rows="3"
//                             />
//                         </div>
//                         <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end gap-2 sm:gap-3">
//                             <button
//                                 onClick={() => setShowPrematureEndModal(false)}
//                                 className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={prematureEndTrip}
//                                 disabled={endingTrip}
//                                 className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs sm:text-sm"
//                             >
//                                 End Trip
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* COMPLETE TRIP MODAL */}
//             {showCompleteModal && selectedTrip && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowCompleteModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
//                         <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-6 py-3 sm:py-4">
//                             <div className="flex items-center gap-2 sm:gap-3">
//                                 <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full flex items-center justify-center">
//                                     <FlagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-base sm:text-lg font-bold text-white">Complete Trip</h2>
//                                     <p className="text-emerald-100 text-[10px] sm:text-xs">{selectedTrip.route?.name}</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-4 sm:p-6">
//                             <textarea
//                                 className="w-full border border-gray-200 rounded-xl p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                                 placeholder="Add a note about why this trip is being completed..."
//                                 value={completionNote}
//                                 onChange={(e) => setCompletionNote(e.target.value)}
//                                 rows="3"
//                             />
//                         </div>
//                         <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end gap-2 sm:gap-3">
//                             <button
//                                 onClick={() => setShowCompleteModal(false)}
//                                 className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={completeTripManually}
//                                 disabled={completingTrip}
//                                 className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs sm:text-sm"
//                             >
//                                 Complete Trip
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* PASSENGER DETAILS MODAL - SHOWS ONLY CURRENT TRIP BOOKING */}
//             {showPassengerModal && selectedPassenger && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowPassengerModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
//                         <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <div className="flex items-center gap-2 sm:gap-3">
//                                 <div className="h-8 w-8 sm:h-12 sm:w-12 bg-white/20 rounded-full flex items-center justify-center">
//                                     <UserGroupIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
//                                 </div>
//                                 <div>
//                                     <h2 className="text-base sm:text-xl font-bold text-white">Trip Booking Details</h2>
//                                     <p className="text-indigo-100 text-[10px] sm:text-sm">{selectedPassenger.name}</p>
//                                 </div>
//                             </div>
//                             <button onClick={() => setShowPassengerModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1 sm:p-2">
//                                 <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
//                             </button>
//                         </div>
//                         <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 sm:p-6">
//                             {loadingPassenger ? (
//                                 <div className="flex items-center justify-center py-8">
//                                     <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-gray-200 border-t-indigo-600"></div>
//                                     <p className="ml-2 text-gray-500 text-xs">Loading passenger details...</p>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-4 sm:space-y-6">
//                                     {/* Passenger Profile */}
//                                     <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-4 sm:p-6 border border-indigo-100">
//                                         <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
//                                             <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
//                                                 <span className="text-2xl sm:text-3xl font-bold text-white">{selectedPassenger.name?.charAt(0) || "?"}</span>
//                                             </div>
//                                             <div className="flex-1">
//                                                 <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{selectedPassenger.name}</h3>
//                                                 {passengerDetails?.email && (
//                                                     <div className="flex items-center gap-1 text-gray-600 mt-1">
//                                                         <EnvelopeIcon className="h-3 w-3" />
//                                                         <span className="text-[10px] sm:text-sm break-all">{passengerDetails.email}</span>
//                                                     </div>
//                                                 )}
//                                                 {passengerDetails?.is_active !== undefined && (
//                                                     <div className="mt-2">
//                                                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${passengerDetails.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
//                                                             {passengerDetails.is_active ? "Active" : "Inactive"}
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Current Trip Booking Details */}
//                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                         <div className="p-3 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//                                             <h3 className="font-semibold text-gray-800">Booking for This Trip</h3>
//                                             <p className="text-[10px] sm:text-xs text-gray-500">Trip: {selectedTrip?.route?.name} ({selectedTrip?.route?.code})</p>
//                                         </div>
//                                         <div className="p-4 sm:p-6 space-y-4">
//                                             {/* Trip Status */}
//                                             <div className="flex items-center justify-between pb-3 border-b border-gray-100">
//                                                 <span className="text-xs text-gray-500">Trip Status</span>
//                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text}`}>
//                                                     {getStatusBadge(selectedTrip.status).label}
//                                                 </span>
//                                             </div>

//                                             {/* Pickup Stop */}
//                                             <div>
//                                                 <label className="text-xs text-gray-500 uppercase tracking-wide">Pickup Stop</label>
//                                                 <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
//                                                     <span className="text-green-600">🚏</span>
//                                                     {currentTripBooking?.pickup_stop_name || selectedPassenger.pickup_stop_name || 'N/A'}
//                                                 </p>
//                                             </div>

//                                             {/* Planned Dropoff Stop */}
//                                             <div>
//                                                 <label className="text-xs text-gray-500 uppercase tracking-wide">Planned Dropoff Stop</label>
//                                                 <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
//                                                     <span className="text-red-600">📍</span>
//                                                     {currentTripBooking?.dropoff_stop_name || selectedPassenger.dropoff_stop_name || 'N/A'}
//                                                 </p>
//                                             </div>

//                                             {/* Actual Dropoff Stop */}
//                                             {(currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name) && (
//                                                 <div className="mt-4 pt-3 border-t border-blue-100">
//                                                     <label className="text-xs text-blue-600 uppercase tracking-wide font-semibold">🔽 Actual Dropoff Stop</label>
//                                                     <p className="text-sm font-bold text-blue-700 mt-1 flex items-center gap-2">
//                                                         <span className="text-blue-600">📍</span>
//                                                         {currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name}
//                                                     </p>
//                                                     {(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at) && (
//                                                         <p className="text-xs text-gray-500 mt-1">
//                                                             Dropped at: {new Date(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at).toLocaleString()}
//                                                         </p>
//                                                     )}
//                                                     {(currentTripBooking?.actual_drop_stop_name !== currentTripBooking?.dropoff_stop_name) && (
//                                                         <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
//                                                             <span>⚠️</span> Passenger was dropped at a different location than planned
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                             )}

//                                             {/* Date */}
//                                             <div>
//                                                 <label className="text-xs text-gray-500 uppercase tracking-wide">Trip Date</label>
//                                                 <p className="text-sm text-gray-700 mt-1">
//                                                     {currentTripBooking?.created_at ? new Date(currentTripBooking.created_at).toLocaleString() : 
//                                                      selectedTrip.timing?.actual_start ? new Date(selectedTrip.timing.actual_start).toLocaleString() : 
//                                                      selectedTrip.timing?.planned_start ? new Date(selectedTrip.timing.planned_start).toLocaleString() : 'N/A'}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Note */}
//                                     <div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-100">
//                                         <p className="text-xs text-amber-700 flex items-center gap-2">
//                                             <span>ℹ️</span>
//                                             This shows only the booking information for this specific trip.
//                                             {passengerDetails?.user_id && (
//                                                 <span className="text-amber-600"> Passenger ID: {passengerDetails.user_id?.slice(0, 13)}...</span>
//                                             )}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end">
//                             <button onClick={() => setShowPassengerModal(false)} className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm">Close</button>
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
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // NEW: Store current trip's booking for the selected passenger
    const [currentTripBooking, setCurrentTripBooking] = useState(null);

    // Check if mobile/tablet view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch route stops
    const fetchRouteStops = async (routeId) => {
        if (!routeId) return [];
        try {
            const response = await axios.get(`${BASE_URL}/routes/${routeId}/stops`, axiosConfig);
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
            const response = await axios.get(url, axiosConfig);
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
            const res = await axios.get(`${BASE_URL}/trips/monitor`, axiosConfig);
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
        setSelectedTrip(null);

        try {
            const url = `${BASE_URL}/trips/${trip_id}`;
            const response = await axios.get(url, axiosConfig);
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

            if (isMobile) {
                setTimeout(() => {
                    const rightPanel = document.querySelector('.right-panel-content');
                    if (rightPanel) {
                        rightPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
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
            setSelectedTrip(null);
        } finally {
            setLoading(false);
        }
    }, [axiosConfig, isMobile]);

    const handleSyncLocation = async () => {
        if (selectedTrip?.trip_id && selectedTrip.status === "in_progress") {
            await fetchLiveTracking(selectedTrip.trip_id, true);
        } else if (selectedTrip?.status !== "in_progress") {
            setTrackingError("Trip is not in progress. Live tracking only available for active trips.");
            setTimeout(() => setTrackingError(null), 3000);
        }
    };

    // UPDATED: Fetch only the passenger's profile info, not full history
    const fetchPassengerProfile = async (passengerId) => {
        if (!passengerId || passengerId === 'undefined') {
            console.error("Invalid passenger ID:", passengerId);
            alert("Unable to fetch passenger details: Invalid passenger ID");
            return;
        }

        setLoadingPassenger(true);
        try {
            const url = `${BASE_URL}/passenger/${passengerId}`;
            const res = await axios.get(url, axiosConfig);
            // Only store the profile info, not the booking history
            setPassengerDetails({
                profile: res.data.profile,
                email: res.data.email,
                is_active: res.data.is_active,
                joined_at: res.data.joined_at,
                user_id: res.data.user_id
            });
        } catch (err) {
            console.error("Error fetching passenger profile:", err);
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

    // UPDATED: Handle passenger click - show only current trip's booking
    const handlePassengerClick = async (passenger) => {
        setSelectedPassenger(passenger);
        setShowPassengerModal(true);
        setPassengerDetails(null);

        // Store the current trip's booking data for this passenger
        // This is the booking info from the trip API response
        setCurrentTripBooking({
            booking_id: selectedTrip.trip_id,
            passenger_id: passenger.passenger_id,
            name: passenger.name,
            status: passenger.status,
            pickup_stop_name: passenger.pickup_stop_name,
            dropoff_stop_name: passenger.dropoff_stop_name,
            actual_drop_stop_name: passenger.actual_drop_stop_name,
            actual_dropped_at: passenger.actual_dropped_at,
            created_at: selectedTrip.timing?.actual_start || selectedTrip.timing?.planned_start,
            fare: null // Fare might not be available in trip API, can be fetched separately if needed
        });

        // Fetch just the passenger's profile info (name, email, etc.)
        if (passenger.passenger_id) {
            await fetchPassengerProfile(passenger.passenger_id);
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
            await axios.patch(url, { reason: cancelReason }, axiosConfig);
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
            const response = await axios.post(url, { reason: prematureEndReason }, axiosConfig);

            if (response.data?.status === "success") {
                alert(`✅ Trip ended prematurely!\nCancelled bookings: ${response.data.cancelled_bookings || 0}`);
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
                if (statusCode === 401) {
                    errorMessage = "❌ Unauthorized. Please login again.";
                } else if (statusCode === 403) {
                    errorMessage = "❌ You don't have permission to end this trip.";
                } else if (statusCode === 404) {
                    errorMessage = "❌ Trip not found.";
                }
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
            const url = `${BASE_URL}/trips/${selectedTrip.trip_id}/complete-manually`;
            await axios.post(url, { note: completionNote || null }, axiosConfig);
            alert("✅ Trip completed successfully!");
            setShowCompleteModal(false);
            setCompletionNote("");
            await fetchTrips();
            if (selectedTrip) {
                await fetchTripDetails(selectedTrip.trip_id);
            }
        } catch (err) {
            console.error("Error completing trip:", err);
            let errorMessage = "Failed to complete trip";
            let errorTitle = "Cannot Complete Trip";

            if (err.response) {
                const errorData = err.response.data;
                if (errorData?.detail?.error === "passengers_still_on_board") {
                    errorTitle = "⚠️ Passengers Still On Board";
                    errorMessage = errorData.detail?.message || "Cannot complete the trip while passengers are still on board.";
                } else if (errorData?.detail) {
                    errorMessage = errorData.detail;
                }
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

    const filteredTrips = trips.filter(trip => {
        const matchesSearch = trip.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trip.vehicle?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (initialLoad || loadingTrips) {
        return (
            <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <Sidebar onClose={() => setSidebarOpen(false)} />
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                    <TopNavbarUltra
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                        isMobile={isMobile}
                        title="Trip Intelligence"
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-gray-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
                            <p className="text-gray-500 font-medium text-sm sm:text-base">Loading trips...</p>
                            <p className="text-xs text-gray-400 mt-1">Fetching real-time data</p>
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
                <TopNavbarUltra
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    isMobile={isMobile}
                    title="Trip Intelligence"
                />

                <div className="flex-1 overflow-hidden p-3 sm:p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 h-full">
                        {/* LEFT PANEL */}
                        <div className="w-full lg:w-[380px] bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden border border-gray-100">
                            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Active Trips</h2>
                                <p className="text-xs text-gray-500 mt-1">{filteredTrips.length} trips available</p>
                                <div className="mt-3 sm:mt-4 relative">
                                    <input
                                        type="text"
                                        placeholder="Search by route, driver, or vehicle..."
                                        className="w-full pl-9 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                                </div>
                                <div className="flex gap-1.5 sm:gap-2 mt-3 flex-wrap">
                                    {["all", "scheduled", "in_progress", "completed", "cancelled", "premature_end"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-lg capitalize transition-all ${statusFilter === status
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {status.replace("_", " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
                                {filteredTrips.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <TruckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                                        <p className="text-gray-400 text-xs sm:text-sm">No trips found</p>
                                    </div>
                                ) : (
                                    filteredTrips.map((trip) => {
                                        const statusStyle = getStatusBadge(trip.status);
                                        const isSelected = selectedTrip?.trip_id === trip.trip_id;

                                        return (
                                            <div
                                                key={trip.trip_id}
                                                onClick={() => {
                                                    if (!isSelected) {
                                                        fetchTripDetails(trip.trip_id);
                                                    }
                                                }}
                                                onTouchStart={(e) => {
                                                    e.currentTarget.style.transform = 'scale(0.98)';
                                                }}
                                                onTouchEnd={(e) => {
                                                    e.currentTarget.style.transform = '';
                                                    if (!isSelected) {
                                                        fetchTripDetails(trip.trip_id);
                                                    }
                                                }}
                                                onTouchCancel={(e) => {
                                                    e.currentTarget.style.transform = '';
                                                }}
                                                className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected
                                                        ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-white shadow-lg"
                                                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                style={{ transform: 'scale(1)', transition: 'transform 0.1s ease' }}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{trip.route_name}</p>
                                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                                            <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px]">{trip.driver}</span>
                                                            <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                                                            <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px]">{trip.vehicle}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} ml-2 flex-shrink-0`}>
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
                        <div className="flex-1 overflow-y-auto min-h-[500px] lg:min-h-0 right-panel-content">
                            {!selectedTrip ? (
                                <div className="flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center p-6">
                                        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg inline-block">
                                            <TruckIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                            <p className="text-gray-500 font-medium text-sm sm:text-base">Select a trip to view details</p>
                                            <p className="text-xs text-gray-400 mt-1">Click on any trip from the left panel</p>
                                        </div>
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="flex items-center justify-center h-full min-h-[400px]">
                                    <div className="text-center p-6">
                                        <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-gray-200 border-t-indigo-600 mb-3 sm:mb-4"></div>
                                        <p className="text-gray-500 text-sm">Loading trip details...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 sm:space-y-5 pb-6">
                                    {/* HEADER CARD */}
                                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-bold mb-1">{selectedTrip.route?.name}</h2>
                                                <p className="text-indigo-100 text-xs sm:text-sm">{selectedTrip.route?.code}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <span className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text} border ${getStatusBadge(selectedTrip.status).border}`}>
                                                    {getStatusBadge(selectedTrip.status).label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LIVE TRACKING SECTION */}
                                    {selectedTrip.status === "in_progress" && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <SignalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Live Bus Tracking</h3>
                                                    </div>
                                                    <button
                                                        onClick={handleSyncLocation}
                                                        disabled={syncing}
                                                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-xs sm:text-sm"
                                                    >
                                                        <ArrowPathIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${syncing ? 'animate-spin' : ''}`} />
                                                        {syncing ? "Syncing..." : "Sync Location"}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 sm:p-5">
                                                {!liveTracking && !trackingError && (
                                                    <div className="text-center py-6 sm:py-8">
                                                        <TruckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                                                        <p className="text-gray-500 text-xs sm:text-sm">Click "Sync Location" to see current bus position</p>
                                                        <button
                                                            onClick={handleSyncLocation}
                                                            className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs sm:text-sm"
                                                        >
                                                            Sync Now
                                                        </button>
                                                    </div>
                                                )}

                                                {trackingError && (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4 text-center">
                                                        <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-2" />
                                                        <p className="text-yellow-700 text-xs sm:text-sm">{trackingError}</p>
                                                        <button
                                                            onClick={handleSyncLocation}
                                                            className="mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 bg-yellow-600 text-white text-[10px] sm:text-xs rounded-lg hover:bg-yellow-700 transition-all"
                                                        >
                                                            Try Again
                                                        </button>
                                                    </div>
                                                )}

                                                {liveTracking && (
                                                    <div className="space-y-3 sm:space-y-4">
                                                        <div className={`rounded-xl p-4 sm:p-5 border ${currentStop?.has_arrived
                                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                                            : currentStop?.is_approaching
                                                                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                                                                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                                                            }`}>
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                <div className={`p-2 sm:p-3 rounded-full ${currentStop?.has_arrived ? "bg-green-100" :
                                                                    currentStop?.is_approaching ? "bg-yellow-100" : "bg-blue-100"
                                                                    }`}>
                                                                    <MapPinIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${currentStop?.has_arrived ? "text-green-600" :
                                                                        currentStop?.is_approaching ? "text-yellow-600" : "text-blue-600"
                                                                        }`} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                                                                        {currentStop?.has_arrived ? "Current Stop (Arrived)" :
                                                                            currentStop?.is_approaching ? "Next Stop (Approaching)" :
                                                                                "Current Location"}
                                                                    </p>
                                                                    {currentStop ? (
                                                                        <>
                                                                            <p className="text-base sm:text-xl font-bold text-gray-800 mt-1 break-words">
                                                                                {currentStop.stop_name}
                                                                            </p>
                                                                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-[10px] sm:text-xs text-gray-500">
                                                                                <span>Stop #{currentStop.sequence}</span>
                                                                                <span>•</span>
                                                                                <span>Distance: {currentStop.distance_meters.toFixed(0)}m</span>
                                                                            </div>
                                                                        </>
                                                                    ) : locationName ? (
                                                                        <p className="text-base sm:text-xl font-bold text-gray-800 mt-1 break-words">
                                                                            {locationName}
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Loading stop information...</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-xl overflow-hidden border border-gray-200">
                                                            <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b">
                                                                <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                                                                    <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                                                    Route Map with Bus Location
                                                                </p>
                                                            </div>
                                                            <div className="h-[300px] sm:h-[400px] w-full">
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
                                                                        <Polyline positions={routeCoordinates} color="#3b82f6" weight={4} opacity={0.7} />
                                                                    )}
                                                                    <Marker
                                                                        position={[liveTracking.last_known_location.lat, liveTracking.last_known_location.lng]}
                                                                        icon={busIcon}
                                                                    />
                                                                </MapContainer>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* RFID SECTION - NEW */}
                                    {selectedTrip.rfid && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">RFID Trip Details</h3>
                                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">RFID seat and ride information</p>
                                                    </div>
                                                    <div className="bg-indigo-100 rounded-full p-2">
                                                        <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 sm:p-5">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="bg-indigo-50/50 rounded-xl p-3 sm:p-4 border border-indigo-100">
                                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Reserved Seat Count</p>
                                                        <p className="text-xl sm:text-2xl font-bold text-indigo-700 mt-1">{selectedTrip.rfid.reserved_seat_count || 0}</p>
                                                    </div>
                                                    <div className="bg-indigo-50/50 rounded-xl p-3 sm:p-4 border border-indigo-100">
                                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total RFID Rides</p>
                                                        <p className="text-xl sm:text-2xl font-bold text-indigo-700 mt-1">{selectedTrip.rfid.total_rfid_rides || 0}</p>
                                                    </div>
                                                    <div className="bg-indigo-50/50 rounded-xl p-3 sm:p-4 border border-indigo-100">
                                                        <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">RFID Passengers</p>
                                                        <p className="text-xl sm:text-2xl font-bold text-indigo-700 mt-1">{selectedTrip.rfid.passengers?.length || 0}</p>
                                                    </div>
                                                </div>

                                                {/* RFID Passengers List (if any) */}
                                                {selectedTrip.rfid.passengers && selectedTrip.rfid.passengers.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                                        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                            <svg className="h-3 w-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            RFID Passengers ({selectedTrip.rfid.passengers.length})
                                                        </p>
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {selectedTrip.rfid.passengers.map((passenger, idx) => (
                                                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                            <span className="text-indigo-600 text-xs font-semibold">
                                                                                {passenger.name?.charAt(0) || "?"}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-sm text-gray-700">{passenger.name || "N/A"}</span>
                                                                    </div>
                                                                    {passenger.boarded && (
                                                                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Boarded</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STATS GRID */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Bookings</p>
                                            <p className="text-base sm:text-2xl font-bold text-gray-800 mt-1">{selectedTrip.occupancy?.total_bookings || 0}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                                            <p className="text-base sm:text-2xl font-bold text-gray-800 mt-1">
                                                {selectedTrip.timing?.actual_start && selectedTrip.timing?.actual_end
                                                    ? `${Math.round((new Date(selectedTrip.timing.actual_end) - new Date(selectedTrip.timing.actual_start)) / 60000)}m`
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Start Status</p>
                                            <p className={`text-xs sm:text-sm font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).color}`}>
                                                {getDelayTag(selectedTrip.timing?.planned_start, selectedTrip.timing?.actual_start).label}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">End Status</p>
                                            <p className={`text-xs sm:text-sm font-bold mt-1 ${getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).color}`}>
                                                {getDelayTag(selectedTrip.timing?.planned_end, selectedTrip.timing?.actual_end).label}
                                            </p>
                                        </div>
                                    </div>

                                    {/* PASSENGERS SECTION */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Passengers</h3>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total: {selectedTrip.occupancy?.passengers?.length || 0} passengers</p>
                                                </div>
                                                <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="p-3 sm:p-5">
                                            {selectedTrip.occupancy?.passengers?.length > 0 ? (
                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                    {selectedTrip.occupancy.passengers.map((passenger, index) => {
                                                        const hasActualDrop = passenger.actual_drop_stop_name &&
                                                            passenger.actual_drop_stop_name !== passenger.dropoff_stop_name;

                                                        return (
                                                            <div
                                                                key={index}
                                                                onClick={() => handlePassengerClick(passenger)}
                                                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
                                                            >
                                                                <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full">
                                                                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-indigo-600 font-semibold text-xs">{passenger.name?.charAt(0) || "?"}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{passenger.name}</p>
                                                                        <p className="text-[9px] sm:text-xs text-gray-400 truncate">ID: {passenger.passenger_id?.slice(0, 13)}...</p>
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <span className="text-green-600 text-[8px] sm:text-[10px]">🚏</span>
                                                                            <span className="text-[8px] sm:text-[10px] text-gray-600 truncate">Pickup: {passenger.pickup_stop_name || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-red-600 text-[8px] sm:text-[10px]">📍</span>
                                                                            <span className="text-[8px] sm:text-[10px] text-gray-600 truncate">Dropoff: {passenger.dropoff_stop_name || 'N/A'}</span>
                                                                        </div>
                                                                        {passenger.actual_drop_stop_name && (
                                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                                <span className="text-blue-600 text-[8px] sm:text-[10px]">🔽</span>
                                                                                <span className="text-[8px] sm:text-[10px] font-semibold text-blue-600 truncate">
                                                                                    Actual: {passenger.actual_drop_stop_name}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
                                                                    <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${passenger.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                                                            passenger.status === "booked" ? "bg-amber-100 text-amber-700" :
                                                                                passenger.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                                                    passenger.status === "boarded" ? "bg-blue-100 text-blue-700" :
                                                                                        "bg-gray-100 text-gray-600"
                                                                        }`}>
                                                                        {passenger.status}
                                                                    </span>
                                                                    <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 sm:py-8">
                                                    <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-400 text-xs sm:text-sm">No passengers found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* TRIP DETAILS */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Trip Details</h3>
                                        </div>
                                        <div className="p-4 sm:p-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-3 sm:space-y-4">
                                                    <div>
                                                        <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Route Name</label>
                                                        <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">{selectedTrip.route?.name || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Planned Start</label>
                                                        <p className="text-gray-800 text-xs sm:text-sm mt-1">
                                                            {selectedTrip.timing?.planned_start ? new Date(selectedTrip.timing.planned_start).toLocaleString("en-IN") : "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Planned End</label>
                                                        <p className="text-gray-800 text-xs sm:text-sm mt-1">
                                                            {selectedTrip.timing?.planned_end ? new Date(selectedTrip.timing.planned_end).toLocaleString("en-IN") : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 sm:space-y-4">
                                                    <div>
                                                        <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Route Code</label>
                                                        <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">{selectedTrip.route?.code || "N/A"}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Actual Start</label>
                                                        <p className="text-gray-800 text-xs sm:text-sm mt-1">
                                                            {selectedTrip.timing?.actual_start ? new Date(selectedTrip.timing.actual_start).toLocaleString("en-IN") : "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Actual End</label>
                                                        <p className="text-gray-800 text-xs sm:text-sm mt-1">
                                                            {selectedTrip.timing?.actual_end ? new Date(selectedTrip.timing.actual_end).toLocaleString("en-IN") : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Trip ID</label>
                                                <p className="text-[10px] sm:text-xs font-mono text-gray-600 mt-1 break-all">{selectedTrip.trip_id}</p>
                                            </div>
                                            <div className="mt-3">
                                                <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Admin Note</label>
                                                <p className="text-gray-700 text-xs sm:text-sm mt-1 bg-gray-50 p-2 rounded-lg">{selectedTrip.admin_note || "No notes available"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ASSIGNMENT SECTION */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-100">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                                                    <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Driver</p>
                                                    <p className="text-sm sm:text-lg font-semibold text-gray-800">{selectedTrip.assignment?.driver || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-100">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                                                    <TruckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase">Vehicle</p>
                                                    <p className="text-sm sm:text-lg font-semibold text-gray-800">{selectedTrip.assignment?.vehicle || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    {selectedTrip.status === "in_progress" && (
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                            <button
                                                onClick={() => setShowPrematureEndModal(true)}
                                                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
                                            >
                                                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                End Trip Prematurely
                                            </button>
                                            <button
                                                onClick={() => setShowCompleteModal(true)}
                                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
                                            >
                                                <FlagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                                Complete Trip
                                            </button>
                                        </div>
                                    )}

                                    {/* CANCEL SECTION */}
                                    {selectedTrip.status === "scheduled" && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
                                                <h3 className="font-semibold text-red-700">Cancel Trip</h3>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">This action cannot be undone</p>
                                            </div>
                                            <div className="p-4 sm:p-5">
                                                <textarea
                                                    className="w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none border-gray-200"
                                                    placeholder="Enter cancellation reason..."
                                                    value={cancelReason}
                                                    onChange={(e) => setCancelReason(e.target.value)}
                                                    rows="3"
                                                />
                                                <button
                                                    onClick={cancelTrip}
                                                    className="mt-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all text-xs sm:text-sm"
                                                >
                                                    Cancel Trip
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PREMATURE END MODAL */}
            {showPrematureEndModal && selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowPrematureEndModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white">End Trip Prematurely</h2>
                                    <p className="text-orange-100 text-[10px] sm:text-xs">{selectedTrip.route?.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <textarea
                                className="w-full border border-gray-200 rounded-xl p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                placeholder="Please provide a reason why this trip is ending prematurely..."
                                value={prematureEndReason}
                                onChange={(e) => setPrematureEndReason(e.target.value)}
                                rows="3"
                            />
                        </div>
                        <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowPrematureEndModal(false)}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={prematureEndTrip}
                                disabled={endingTrip}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-xs sm:text-sm"
                            >
                                End Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLETE TRIP MODAL */}
            {showCompleteModal && selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowCompleteModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <FlagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white">Complete Trip</h2>
                                    <p className="text-emerald-100 text-[10px] sm:text-xs">{selectedTrip.route?.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <textarea
                                className="w-full border border-gray-200 rounded-xl p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder="Add a note about why this trip is being completed..."
                                value={completionNote}
                                onChange={(e) => setCompletionNote(e.target.value)}
                                rows="3"
                            />
                        </div>
                        <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowCompleteModal(false)}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={completeTripManually}
                                disabled={completingTrip}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs sm:text-sm"
                            >
                                Complete Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PASSENGER DETAILS MODAL - SHOWS ONLY CURRENT TRIP BOOKING */}
            {showPassengerModal && selectedPassenger && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowPassengerModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="h-8 w-8 sm:h-12 sm:w-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <UserGroupIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-xl font-bold text-white">Trip Booking Details</h2>
                                    <p className="text-indigo-100 text-[10px] sm:text-sm">{selectedPassenger.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPassengerModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1 sm:p-2">
                                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 sm:p-6">
                            {loadingPassenger ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-gray-200 border-t-indigo-600"></div>
                                    <p className="ml-2 text-gray-500 text-xs">Loading passenger details...</p>
                                </div>
                            ) : (
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Passenger Profile */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-4 sm:p-6 border border-indigo-100">
                                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                                            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                                <span className="text-2xl sm:text-3xl font-bold text-white">{selectedPassenger.name?.charAt(0) || "?"}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{selectedPassenger.name}</h3>
                                                {passengerDetails?.email && (
                                                    <div className="flex items-center gap-1 text-gray-600 mt-1">
                                                        <EnvelopeIcon className="h-3 w-3" />
                                                        <span className="text-[10px] sm:text-sm break-all">{passengerDetails.email}</span>
                                                    </div>
                                                )}
                                                {passengerDetails?.is_active !== undefined && (
                                                    <div className="mt-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${passengerDetails.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                                            {passengerDetails.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Trip Booking Details */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-3 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <h3 className="font-semibold text-gray-800">Booking for This Trip</h3>
                                            <p className="text-[10px] sm:text-xs text-gray-500">Trip: {selectedTrip?.route?.name} ({selectedTrip?.route?.code})</p>
                                        </div>
                                        <div className="p-4 sm:p-6 space-y-4">
                                            {/* Trip Status */}
                                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                                <span className="text-xs text-gray-500">Trip Status</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text}`}>
                                                    {getStatusBadge(selectedTrip.status).label}
                                                </span>
                                            </div>

                                            {/* Pickup Stop */}
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wide">Pickup Stop</label>
                                                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                                    <span className="text-green-600">🚏</span>
                                                    {currentTripBooking?.pickup_stop_name || selectedPassenger.pickup_stop_name || 'N/A'}
                                                </p>
                                            </div>

                                            {/* Planned Dropoff Stop */}
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wide">Planned Dropoff Stop</label>
                                                <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                                                    <span className="text-red-600">📍</span>
                                                    {currentTripBooking?.dropoff_stop_name || selectedPassenger.dropoff_stop_name || 'N/A'}
                                                </p>
                                            </div>

                                            {/* Actual Dropoff Stop */}
                                            {(currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name) && (
                                                <div className="mt-4 pt-3 border-t border-blue-100">
                                                    <label className="text-xs text-blue-600 uppercase tracking-wide font-semibold">🔽 Actual Dropoff Stop</label>
                                                    <p className="text-sm font-bold text-blue-700 mt-1 flex items-center gap-2">
                                                        <span className="text-blue-600">📍</span>
                                                        {currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name}
                                                    </p>
                                                    {(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at) && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Dropped at: {new Date(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at).toLocaleString()}
                                                        </p>
                                                    )}
                                                    {(currentTripBooking?.actual_drop_stop_name !== currentTripBooking?.dropoff_stop_name) && (
                                                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                                            <span>⚠️</span> Passenger was dropped at a different location than planned
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Date */}
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase tracking-wide">Trip Date</label>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {currentTripBooking?.created_at ? new Date(currentTripBooking.created_at).toLocaleString() :
                                                        selectedTrip.timing?.actual_start ? new Date(selectedTrip.timing.actual_start).toLocaleString() :
                                                            selectedTrip.timing?.planned_start ? new Date(selectedTrip.timing.planned_start).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-100">
                                        <p className="text-xs text-amber-700 flex items-center gap-2">
                                            <span>ℹ️</span>
                                            This shows only the booking information for this specific trip.
                                            {passengerDetails?.user_id && (
                                                <span className="text-amber-600"> Passenger ID: {passengerDetails.user_id?.slice(0, 13)}...</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 flex justify-end">
                            <button onClick={() => setShowPassengerModal(false)} className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900 text-white rounded-lg text-xs sm:text-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TripDetailsPage;