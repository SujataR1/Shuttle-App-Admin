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

//             // Extract pickup_stop and dropoff_stop with bus times from the response
//             const passengerData = res.data;

//             setPassengerDetails({
//                 profile: passengerData.profile,
//                 email: passengerData.email,
//                 is_active: passengerData.is_active,
//                 joined_at: passengerData.joined_at,
//                 user_id: passengerData.user_id,
//                 // Store the booking data which contains the stops with bus times
//                 current_booking: passengerData.current_booking || null,
//                 pickup_stop: passengerData.pickup_stop || null,
//                 dropoff_stop: passengerData.dropoff_stop || null
//             });

//             // Also update currentTripBooking with stop details if available
//             if (passengerData.pickup_stop || passengerData.dropoff_stop) {
//                 setCurrentTripBooking(prev => ({
//                     ...prev,
//                     pickup_stop_details: passengerData.pickup_stop,
//                     dropoff_stop_details: passengerData.dropoff_stop
//                 }));
//             }

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

//     const handlePassengerClick = async (passenger) => {
//         setSelectedPassenger(passenger);
//         setShowPassengerModal(true);
//         setPassengerDetails(null);
//         setCurrentTripBooking(null);

//         try {
//             setLoadingPassenger(true);

//             // Fetch the passenger's complete profile
//             const passengerUrl = `${BASE_URL}/passenger/${passenger.passenger_id}`;
//             const response = await axios.get(passengerUrl, axiosConfig);

//             const passengerData = response.data;

//             console.log("Full Passenger Data:", passengerData);

//             // Find the booking that matches the current trip
//             // The current trip ID is in selectedTrip.trip_id
//             let currentBooking = null;

//             if (passengerData.booking_history && passengerData.booking_history.bookings) {
//                 // Find the booking that matches the current trip's booking_id
//                 // You need to identify which booking is for the current trip
//                 // Usually you can match by trip_id or find the most recent booking
//                 currentBooking = passengerData.booking_history.bookings.find(
//                     booking => booking.booking_id === selectedTrip.trip_id ||
//                         booking.booking_id === passenger.booking_id
//                 );

//                 // If not found by ID, get the most recent booking that matches the trip date
//                 if (!currentBooking && selectedTrip.timing?.actual_start) {
//                     const tripDate = new Date(selectedTrip.timing.actual_start).toDateString();
//                     currentBooking = passengerData.booking_history.bookings.find(booking => {
//                         const bookingDate = new Date(booking.created_at).toDateString();
//                         return bookingDate === tripDate;
//                     });
//                 }
//             }

//             console.log("Current Booking Found:", currentBooking);

//             // Set passenger profile details
//             setPassengerDetails({
//                 email: passengerData.email,
//                 is_active: passengerData.is_active,
//                 joined_at: passengerData.joined_at,
//                 user_id: passengerData.user_id,
//                 profile: passengerData.profile
//             });

//             if (currentBooking) {
//                 // Set the current trip booking with stop details INCLUDING bus times
//                 setCurrentTripBooking({
//                     booking_id: currentBooking.booking_id,
//                     passenger_id: passenger.passenger_id,
//                     name: passenger.name,
//                     status: currentBooking.status,
//                     pickup_stop_name: currentBooking.pickup_stop?.name,
//                     dropoff_stop_name: currentBooking.dropoff_stop?.name,
//                     actual_drop_stop_name: currentBooking.actual_drop_stop_name,
//                     actual_dropped_at: currentBooking.actual_dropped_at,
//                     created_at: currentBooking.created_at,
//                     fare: currentBooking.fare,
//                     // Store the complete stop objects with bus times
//                     pickup_stop: currentBooking.pickup_stop || null,
//                     dropoff_stop: currentBooking.dropoff_stop || null
//                 });

//                 console.log("Pickup Stop with Times:", currentBooking.pickup_stop);
//                 console.log("Dropoff Stop with Times:", currentBooking.dropoff_stop);
//             } else {
//                 // Fallback - use the first booking or create basic structure
//                 const firstBooking = passengerData.booking_history?.bookings?.[0];
//                 if (firstBooking) {
//                     setCurrentTripBooking({
//                         booking_id: firstBooking.booking_id,
//                         passenger_id: passenger.passenger_id,
//                         name: passenger.name,
//                         status: firstBooking.status,
//                         pickup_stop_name: firstBooking.pickup_stop?.name,
//                         dropoff_stop_name: firstBooking.dropoff_stop?.name,
//                         actual_drop_stop_name: firstBooking.actual_drop_stop_name,
//                         actual_dropped_at: firstBooking.actual_dropped_at,
//                         created_at: firstBooking.created_at,
//                         fare: firstBooking.fare,
//                         pickup_stop: firstBooking.pickup_stop || null,
//                         dropoff_stop: firstBooking.dropoff_stop || null
//                     });
//                 } else {
//                     // Last resort fallback
//                     setCurrentTripBooking({
//                         booking_id: selectedTrip.trip_id,
//                         passenger_id: passenger.passenger_id,
//                         name: passenger.name,
//                         status: passenger.status,
//                         pickup_stop_name: passenger.pickup_stop_name,
//                         dropoff_stop_name: passenger.dropoff_stop_name,
//                         actual_drop_stop_name: passenger.actual_drop_stop_name,
//                         actual_dropped_at: passenger.actual_dropped_at,
//                         created_at: selectedTrip.timing?.actual_start || selectedTrip.timing?.planned_start,
//                         fare: null,
//                         pickup_stop: null,
//                         dropoff_stop: null
//                     });
//                 }
//             }

//         } catch (err) {
//             console.error("Error fetching passenger booking details:", err);
//             // Fallback to basic info without bus times
//             setCurrentTripBooking({
//                 booking_id: selectedTrip.trip_id,
//                 passenger_id: passenger.passenger_id,
//                 name: passenger.name,
//                 status: passenger.status,
//                 pickup_stop_name: passenger.pickup_stop_name,
//                 dropoff_stop_name: passenger.dropoff_stop_name,
//                 actual_drop_stop_name: passenger.actual_drop_stop_name,
//                 actual_dropped_at: passenger.actual_dropped_at,
//                 created_at: selectedTrip.timing?.actual_start || selectedTrip.timing?.planned_start,
//                 fare: null,
//                 pickup_stop: null,
//                 dropoff_stop: null
//             });

//             setPassengerDetails({
//                 email: passenger.email,
//                 is_active: true,
//                 user_id: passenger.passenger_id
//             });
//         } finally {
//             setLoadingPassenger(false);
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
//                                                 className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected
//                                                     ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-white shadow-lg"
//                                                     : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
//                                                     }`}
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

//                                     {/* RFID SECTION - ELEGANT REDESIGN */}
//                                     {selectedTrip.rfid && (
//                                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                                             {/* Header */}
//                                             <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
//                                                 <div className="flex items-center justify-between">
//                                                     <div>
//                                                         <h3 className="text-lg font-semibold text-gray-900">RFID Trip Details</h3>
//                                                         <p className="text-xs text-gray-500 mt-0.5">Seat reservations & ride information</p>
//                                                     </div>
//                                                     <div className="bg-indigo-100 rounded-xl p-2.5">
//                                                         <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                                                         </svg>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Stats Cards */}
//                                             <div className="grid grid-cols-3 gap-3 p-5 bg-gray-50/30">
//                                                 <div className="text-center">
//                                                     <p className="text-xs text-gray-500 mb-1">Reserved Seats</p>
//                                                     <p className="text-2xl font-bold text-indigo-600">{selectedTrip.rfid.reserved_seat_count || 0}</p>
//                                                 </div>
//                                                 <div className="text-center">
//                                                     <p className="text-xs text-gray-500 mb-1">Total RFID Rides</p>
//                                                     <p className="text-2xl font-bold text-indigo-600">{selectedTrip.rfid.total_rfid_rides || 0}</p>
//                                                 </div>
//                                                 <div className="text-center">
//                                                     <p className="text-xs text-gray-500 mb-1">RFID Passengers</p>
//                                                     <p className="text-2xl font-bold text-indigo-600">{selectedTrip.rfid.passengers?.length || 0}</p>
//                                                 </div>
//                                             </div>

//                                             {/* Passengers Section */}
//                                             {selectedTrip.rfid.passengers && selectedTrip.rfid.passengers.length > 0 && (
//                                                 <div className="p-5 pt-0">
//                                                     <div className="flex items-center justify-between mb-4">
//                                                         <div className="flex items-center gap-2">
//                                                             <div className="h-6 w-6 bg-indigo-100 rounded-lg flex items-center justify-center">
//                                                                 <svg className="h-3 w-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                                                                 </svg>
//                                                             </div>
//                                                             <span className="text-sm font-medium text-gray-700">Passengers</span>
//                                                             <span className="text-xs text-gray-400">{selectedTrip.rfid.passengers.length}</span>
//                                                         </div>
//                                                     </div>

//                                                     <div className="space-y-3">
//                                                         {selectedTrip.rfid.passengers.map((passenger, idx) => (
//                                                             <div key={idx} className="group">
//                                                                 {/* Main Passenger Card */}
//                                                                 <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
//                                                                     {/* Header */}
//                                                                     <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
//                                                                         <div className="flex items-center justify-between">
//                                                                             <div className="flex items-center gap-3">
//                                                                                 <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
//                                                                                     <span className="text-indigo-700 font-semibold text-sm">
//                                                                                         {passenger.passenger_name?.charAt(0) || "?"}
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 <div>
//                                                                                     <p className="font-medium text-gray-900 text-sm">{passenger.passenger_name || "N/A"}</p>
//                                                                                     <p className="text-xs text-gray-500">{passenger.passenger_email || "No email"}</p>
//                                                                                 </div>
//                                                                             </div>
//                                                                             <div className="flex items-center gap-2">
//                                                                                 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${passenger.transfer_status === 'completed' ? 'bg-green-100 text-green-700' :
//                                                                                     passenger.transfer_status === 'withheld' ? 'bg-orange-100 text-orange-700' :
//                                                                                         'bg-gray-100 text-gray-600'
//                                                                                     }`}>
//                                                                                     <span className={`w-1.5 h-1.5 rounded-full ${passenger.transfer_status === 'completed' ? 'bg-green-500' :
//                                                                                         passenger.transfer_status === 'withheld' ? 'bg-orange-500' :
//                                                                                             'bg-gray-400'
//                                                                                         }`}></span>
//                                                                                     {passenger.transfer_status || passenger.status || "Unknown"}
//                                                                                 </span>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>

//                                                                     {/* Body */}
//                                                                     <div className="p-4 space-y-3">
//                                                                         {/* Card & Ride Info */}
//                                                                         <div className="grid grid-cols-2 gap-3 text-xs">
//                                                                             <div className="flex items-center gap-1.5">
//                                                                                 <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                                                                                 </svg>
//                                                                                 <span className="text-gray-500">Card:</span>
//                                                                                 <span className="font-mono text-gray-700">{passenger.card_uid_masked || "N/A"}</span>
//                                                                             </div>
//                                                                             <div className="flex items-center gap-1.5">
//                                                                                 <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
//                                                                                 </svg>
//                                                                                 <span className="text-gray-500">Ride ID:</span>
//                                                                                 <span className="font-mono text-gray-700 text-xs">{passenger.rfid_ride_id?.slice(0, 12)}...</span>
//                                                                             </div>
//                                                                         </div>

//                                                                         {/* Stops */}
//                                                                         <div className="space-y-2">
//                                                                             <div className="flex items-start gap-2">
//                                                                                 <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
//                                                                                     <span className="text-green-600 text-xs">🚏</span>
//                                                                                 </div>
//                                                                                 <div className="flex-1">
//                                                                                     <p className="text-xs text-gray-500">Pickup Stop</p>
//                                                                                     <p className="text-sm font-medium text-gray-800">{passenger.pickup_stop?.name || "N/A"}</p>
//                                                                                     {passenger.pickup_stop?.sequence && (
//                                                                                         <p className="text-xs text-gray-400">Stop #{passenger.pickup_stop.sequence}</p>
//                                                                                     )}
//                                                                                 </div>
//                                                                             </div>
//                                                                             <div className="relative">
//                                                                                 <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
//                                                                                 <div className="flex items-start gap-2 ml-2">
//                                                                                     <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
//                                                                                         <span className="text-red-600 text-xs">📍</span>
//                                                                                     </div>
//                                                                                     <div className="flex-1">
//                                                                                         <p className="text-xs text-gray-500">Dropoff Stop</p>
//                                                                                         <p className="text-sm font-medium text-gray-800">{passenger.dropoff_stop?.name || "N/A"}</p>
//                                                                                         {passenger.dropoff_stop?.sequence && (
//                                                                                             <p className="text-xs text-gray-400">Stop #{passenger.dropoff_stop.sequence}</p>
//                                                                                         )}
//                                                                                     </div>
//                                                                                 </div>
//                                                                             </div>
//                                                                         </div>

//                                                                         {/* Financial Breakdown - Clean Grid */}
//                                                                         <div className="bg-gray-50 rounded-lg p-3 mt-2">
//                                                                             <p className="text-xs font-medium text-gray-700 mb-2">Financial Breakdown</p>
//                                                                             <div className="grid grid-cols-2 gap-3">
//                                                                                 <div>
//                                                                                     <p className="text-[10px] text-gray-500">Fare Net Amount</p>
//                                                                                     <p className="text-base font-bold text-gray-900">₹{passenger.fare_net_amount?.toFixed(2) || "0"}</p>
//                                                                                 </div>
//                                                                                 <div>
//                                                                                     <p className="text-[10px] text-gray-500">Commission</p>
//                                                                                     <p className="text-base font-bold text-purple-600">
//                                                                                         ₹{passenger.commission_amount?.toFixed(2) || "0"}
//                                                                                         <span className="text-[9px] text-gray-400 ml-1">({passenger.commission_percent_snapshot || 0}%)</span>
//                                                                                     </p>
//                                                                                 </div>
//                                                                                 <div>
//                                                                                     <p className="text-[10px] text-gray-500">Driver Payout (Net)</p>
//                                                                                     <p className="text-base font-bold text-emerald-600">₹{passenger.driver_payout_net_amount?.toFixed(2) || "0"}</p>
//                                                                                 </div>
//                                                                                 <div>
//                                                                                     <p className="text-[10px] text-gray-500">Platform Net</p>
//                                                                                     <p className="text-base font-bold text-blue-600">₹{passenger.platform_net_amount?.toFixed(2) || "0"}</p>
//                                                                                 </div>
//                                                                             </div>

//                                                                             {/* Additional Details - Collapsible section */}
//                                                                             <details className="mt-3">
//                                                                                 <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600">
//                                                                                     Show original amounts
//                                                                                 </summary>
//                                                                                 <div className="mt-2 pt-2 border-t border-gray-200">
//                                                                                     <div className="grid grid-cols-2 gap-2 text-xs">
//                                                                                         <div>
//                                                                                             <span className="text-gray-500">Fare Amount:</span>
//                                                                                             <span className="ml-1 text-gray-700">₹{passenger.fare_amount?.toFixed(2) || "0"}</span>
//                                                                                         </div>
//                                                                                         <div>
//                                                                                             <span className="text-gray-500">Fare Reversed:</span>
//                                                                                             <span className="ml-1 text-red-500">₹{passenger.fare_reversed_amount?.toFixed(2) || "0"}</span>
//                                                                                         </div>
//                                                                                         <div>
//                                                                                             <span className="text-gray-500">Driver Payout:</span>
//                                                                                             <span className="ml-1 text-emerald-600">₹{passenger.driver_payout_amount?.toFixed(2) || "0"}</span>
//                                                                                         </div>
//                                                                                         <div>
//                                                                                             <span className="text-gray-500">Platform Amount:</span>
//                                                                                             <span className="ml-1 text-gray-700">₹{passenger.platform_amount?.toFixed(2) || "0"}</span>
//                                                                                         </div>
//                                                                                         <div className="col-span-2">
//                                                                                             <span className="text-gray-500">Platform Reversed:</span>
//                                                                                             <span className="ml-1 text-red-500">₹{passenger.platform_amount_reversed?.toFixed(2) || "0"}</span>
//                                                                                         </div>
//                                                                                     </div>
//                                                                                 </div>
//                                                                             </details>
//                                                                         </div>

//                                                                         {/* Timestamps */}
//                                                                         {(passenger.boarded_at || passenger.dropped_at) && (
//                                                                             <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-1">
//                                                                                 {passenger.boarded_at && (
//                                                                                     <div className="flex items-center gap-1">
//                                                                                         <span>🚌</span>
//                                                                                         <span>Boarded: {new Date(passenger.boarded_at).toLocaleTimeString()}</span>
//                                                                                     </div>
//                                                                                 )}
//                                                                                 {passenger.dropped_at && (
//                                                                                     <div className="flex items-center gap-1">
//                                                                                         <span>🏁</span>
//                                                                                         <span>Dropped: {new Date(passenger.dropped_at).toLocaleTimeString()}</span>
//                                                                                     </div>
//                                                                                 )}
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             )}
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

// {/* PASSENGERS SECTION - SIMPLIFIED LIST VIEW */}
// <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//     <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//         <div className="flex items-center justify-between">
//             <div>
//                 <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Passengers</h3>
//                 <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Total: {selectedTrip.occupancy?.passengers?.length || 0} passengers</p>
//             </div>
//             <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
//         </div>
//     </div>
//     <div className="p-3 sm:p-5">
//         {selectedTrip.occupancy?.passengers?.length > 0 ? (
//             <div className="space-y-2 max-h-96 overflow-y-auto">
//                 {selectedTrip.occupancy.passengers.map((passenger, index) => (
//                     <div
//                         key={index}
//                         onClick={() => handlePassengerClick(passenger)}
//                         className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
//                     >
//                         <div className="flex items-center gap-3 flex-1">
//                             <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                 <span className="text-indigo-600 font-semibold text-sm">
//                                     {passenger.name?.charAt(0) || "?"}
//                                 </span>
//                             </div>
//                             <div className="flex-1 min-w-0">
//                                 <p className="text-sm font-medium text-gray-800 truncate">{passenger.name}</p>
//                                 <p className="text-xs text-gray-400">
//                                     {passenger.status === "completed" ? "✓ Completed" :
//                                      passenger.status === "missed" ? "❌ Missed" :
//                                      passenger.status === "cancelled" ? "✗ Cancelled" :
//                                      passenger.status === "boarded" ? "🚌 Boarded" :
//                                      passenger.status?.toUpperCase() || "Booked"}
//                                 </p>
//                             </div>
//                         </div>
//                         <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
//                     </div>
//                 ))}
//             </div>
//         ) : (
//             <div className="text-center py-8">
//                 <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
//                 <p className="text-gray-400 text-sm">No passengers found</p>
//             </div>
//         )}
//     </div>
// </div>

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

//             {/* PASSENGER DETAILS MODAL */}
//             {showPassengerModal && selectedPassenger && (
//                 <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowPassengerModal(false)}>
//                     <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
//                         {/* Header - Clean and minimal */}
//                         <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
//                             <div>
//                                 <h2 className="text-lg font-semibold text-gray-800">Trip Booking Details</h2>
//                                 <p className="text-xs text-gray-500 mt-0.5">{selectedPassenger.name}</p>
//                             </div>
//                             <button onClick={() => setShowPassengerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
//                                 <XMarkIcon className="h-5 w-5" />
//                             </button>
//                         </div>

//                         <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-5">
//                             {loadingPassenger ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-indigo-500"></div>
//                                     <p className="ml-2 text-gray-500 text-sm">Loading details...</p>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-5">
//                                     {/* Passenger Profile - Minimal */}
//                                     <div className="flex items-center gap-4">
//                                         <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
//                                             <span className="text-gray-600 font-semibold text-base">{selectedPassenger.name?.charAt(0) || "?"}</span>
//                                         </div>
//                                         <div>
//                                             <h3 className="font-medium text-gray-800">{selectedPassenger.name}</h3>
//                                             {passengerDetails?.email && (
//                                                 <p className="text-xs text-gray-500">{passengerDetails.email}</p>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Booking Details Card */}
//                                     <div className="border border-gray-100 rounded-xl overflow-hidden">
//                                         <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
//                                             <p className="text-xs font-medium text-gray-600">Booking for This Trip</p>
//                                             <p className="text-xs text-gray-400 mt-0.5">{selectedTrip?.route?.name} ({selectedTrip?.route?.code})</p>
//                                         </div>
//                                         <div className="p-4 space-y-4">
//                                             {/* Status Row - Two columns */}
//                                             <div className="grid grid-cols-2 gap-4">
//                                                 <div>
//                                                     <p className="text-[11px] text-gray-400 uppercase tracking-wide">Trip Status</p>
//                                                     <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text}`}>
//                                                         {getStatusBadge(selectedTrip.status).label}
//                                                     </span>
//                                                 </div>
//                                                 <div>
//                                                     <p className="text-[11px] text-gray-400 uppercase tracking-wide">Passenger Status</p>
//                                                     <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${currentTripBooking?.status === "completed" ? "bg-green-50 text-green-700" :
//                                                             currentTripBooking?.status === "missed" ? "bg-red-50 text-red-700" :
//                                                                 currentTripBooking?.status === "cancelled" ? "bg-gray-50 text-gray-600" :
//                                                                     currentTripBooking?.status === "boarded" ? "bg-blue-50 text-blue-700" :
//                                                                         "bg-gray-50 text-gray-600"
//                                                         }`}>
//                                                         {currentTripBooking?.status ? currentTripBooking.status.toUpperCase() : selectedPassenger.status?.toUpperCase() || 'N/A'}
//                                                     </span>
//                                                 </div>
//                                             </div>

//                                             {/* Pickup Stop - Clean design */}
//                                             <div className="pt-2">
//                                                 <div className="flex items-start gap-2">
//                                                     <div className="mt-0.5">
//                                                         <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
//                                                             <span className="text-gray-500 text-xs">🚏</span>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <p className="text-xs text-gray-400">PICKUP STOP</p>
//                                                         <p className="text-sm font-medium text-gray-700 mt-0.5">
//                                                             {currentTripBooking?.pickup_stop?.name || currentTripBooking?.pickup_stop_name || 'N/A'}
//                                                         </p>
//                                                         {currentTripBooking?.pickup_stop?.bus_arrived_at && (
//                                                             <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
//                                                                 <span className="text-gray-500">Arrived: <span className="font-mono text-gray-600">{new Date(currentTripBooking.pickup_stop.bus_arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
//                                                                 <span className="text-gray-500">Departed: <span className="font-mono text-gray-600">{new Date(currentTripBooking.pickup_stop.bus_departed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
//                                                                 {currentTripBooking.pickup_stop.bus_arrived_at && currentTripBooking.pickup_stop.bus_departed_at && (
//                                                                     <span className="text-gray-500">Waited: <span className="text-amber-600">{Math.round((new Date(currentTripBooking.pickup_stop.bus_departed_at) - new Date(currentTripBooking.pickup_stop.bus_arrived_at)) / 1000)} sec</span></span>
//                                                                 )}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Dropoff Stop - Clean design */}
//                                             <div>
//                                                 <div className="flex items-start gap-2">
//                                                     <div className="mt-0.5">
//                                                         <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
//                                                             <span className="text-gray-500 text-xs">📍</span>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <p className="text-xs text-gray-400">DROPOFF STOP</p>
//                                                         <p className="text-sm font-medium text-gray-700 mt-0.5">
//                                                             {currentTripBooking?.dropoff_stop?.name || currentTripBooking?.dropoff_stop_name || 'N/A'}
//                                                         </p>
//                                                         {currentTripBooking?.dropoff_stop?.bus_arrived_at && (
//                                                             <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
//                                                                 <span className="text-gray-500">Arrived: <span className="font-mono text-gray-600">{new Date(currentTripBooking.dropoff_stop.bus_arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
//                                                                 <span className="text-gray-500">Departed: <span className="font-mono text-gray-600">{new Date(currentTripBooking.dropoff_stop.bus_departed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Actual Dropoff - Only if different */}
//                                             {(currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name) &&
//                                                 (currentTripBooking?.actual_drop_stop_name !== currentTripBooking?.dropoff_stop?.name) && (
//                                                     <div className="pt-1">
//                                                         <div className="flex items-start gap-2">
//                                                             <div className="mt-0.5">
//                                                                 <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
//                                                                     <span className="text-blue-500 text-xs">⬇️</span>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="flex-1">
//                                                                 <p className="text-xs text-blue-500">ACTUAL DROPOFF</p>
//                                                                 <p className="text-sm font-medium text-blue-700 mt-0.5">
//                                                                     {currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name}
//                                                                 </p>
//                                                                 {(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at) && (
//                                                                     <p className="text-xs text-gray-500 mt-1">
//                                                                         Dropped at: {new Date(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at).toLocaleString()}
//                                                                     </p>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                             {/* Missed Bus Alert - Subtle warning */}
//                                             {(currentTripBooking?.status === "missed" || selectedPassenger.status === "missed") && (
//                                                 <div className="mt-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
//                                                     <div className="flex gap-2">
//                                                         <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
//                                                         <div>
//                                                             <p className="text-sm font-medium text-amber-700">Passenger Missed the Bus</p>
//                                                             <p className="text-xs text-amber-600 mt-0.5">
//                                                                 Bus was at "{currentTripBooking?.pickup_stop?.name}" from {new Date(currentTripBooking?.pickup_stop?.bus_arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(currentTripBooking?.pickup_stop?.bus_departed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )}

//                                             {/* Trip Date */}
//                                             <div className="pt-2 border-t border-gray-100">
//                                                 <p className="text-[11px] text-gray-400 uppercase tracking-wide">Trip Date</p>
//                                                 <p className="text-sm text-gray-600 mt-1">
//                                                     {currentTripBooking?.created_at ? new Date(currentTripBooking.created_at).toLocaleString() :
//                                                         selectedTrip.timing?.actual_start ? new Date(selectedTrip.timing.actual_start).toLocaleString() :
//                                                             selectedTrip.timing?.planned_start ? new Date(selectedTrip.timing.planned_start).toLocaleString() : 'N/A'}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Note - Minimal */}
//                                     <div className="bg-gray-50 rounded-lg px-4 py-2">
//                                         <p className="text-xs text-gray-500">
//                                             ℹ️ Booking information for this specific trip only
//                                             {passengerDetails?.user_id && (
//                                                 <span className="text-gray-400 ml-1">· ID: {passengerDetails.user_id?.slice(0, 13)}...</span>
//                                             )}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer */}
//                         <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/30 flex justify-end">
//                             <button onClick={() => setShowPassengerModal(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">
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
    const [currentTripBooking, setCurrentTripBooking] = useState(null);

    // RFID Passenger modal states
    const [selectedRFIDPassenger, setSelectedRFIDPassenger] = useState(null);
    const [showRFIDPassengerModal, setShowRFIDPassengerModal] = useState(false);

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

            const passengerData = res.data;

            setPassengerDetails({
                profile: passengerData.profile,
                email: passengerData.email,
                is_active: passengerData.is_active,
                joined_at: passengerData.joined_at,
                user_id: passengerData.user_id,
                current_booking: passengerData.current_booking || null,
                pickup_stop: passengerData.pickup_stop || null,
                dropoff_stop: passengerData.dropoff_stop || null
            });

            if (passengerData.pickup_stop || passengerData.dropoff_stop) {
                setCurrentTripBooking(prev => ({
                    ...prev,
                    pickup_stop_details: passengerData.pickup_stop,
                    dropoff_stop_details: passengerData.dropoff_stop
                }));
            }

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

    const handlePassengerClick = async (passenger) => {
        setSelectedPassenger(passenger);
        setShowPassengerModal(true);
        setPassengerDetails(null);
        setCurrentTripBooking(null);

        try {
            setLoadingPassenger(true);

            const passengerUrl = `${BASE_URL}/passenger/${passenger.passenger_id}`;
            const response = await axios.get(passengerUrl, axiosConfig);

            const passengerData = response.data;

            let currentBooking = null;

            if (passengerData.booking_history && passengerData.booking_history.bookings) {
                currentBooking = passengerData.booking_history.bookings.find(
                    booking => booking.booking_id === selectedTrip.trip_id ||
                        booking.booking_id === passenger.booking_id
                );

                if (!currentBooking && selectedTrip.timing?.actual_start) {
                    const tripDate = new Date(selectedTrip.timing.actual_start).toDateString();
                    currentBooking = passengerData.booking_history.bookings.find(booking => {
                        const bookingDate = new Date(booking.created_at).toDateString();
                        return bookingDate === tripDate;
                    });
                }
            }

            setPassengerDetails({
                email: passengerData.email,
                is_active: passengerData.is_active,
                joined_at: passengerData.joined_at,
                user_id: passengerData.user_id,
                profile: passengerData.profile
            });

            if (currentBooking) {
                setCurrentTripBooking({
                    booking_id: currentBooking.booking_id,
                    passenger_id: passenger.passenger_id,
                    name: passenger.name,
                    status: currentBooking.status,
                    pickup_stop_name: currentBooking.pickup_stop?.name,
                    dropoff_stop_name: currentBooking.dropoff_stop?.name,
                    actual_drop_stop_name: currentBooking.actual_drop_stop_name,
                    actual_dropped_at: currentBooking.actual_dropped_at,
                    created_at: currentBooking.created_at,
                    fare: currentBooking.fare,
                    pickup_stop: currentBooking.pickup_stop || null,
                    dropoff_stop: currentBooking.dropoff_stop || null
                });
            } else {
                const firstBooking = passengerData.booking_history?.bookings?.[0];
                if (firstBooking) {
                    setCurrentTripBooking({
                        booking_id: firstBooking.booking_id,
                        passenger_id: passenger.passenger_id,
                        name: passenger.name,
                        status: firstBooking.status,
                        pickup_stop_name: firstBooking.pickup_stop?.name,
                        dropoff_stop_name: firstBooking.dropoff_stop?.name,
                        actual_drop_stop_name: firstBooking.actual_drop_stop_name,
                        actual_dropped_at: firstBooking.actual_dropped_at,
                        created_at: firstBooking.created_at,
                        fare: firstBooking.fare,
                        pickup_stop: firstBooking.pickup_stop || null,
                        dropoff_stop: firstBooking.dropoff_stop || null
                    });
                } else {
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
                        fare: null,
                        pickup_stop: null,
                        dropoff_stop: null
                    });
                }
            }

        } catch (err) {
            console.error("Error fetching passenger booking details:", err);
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
                fare: null,
                pickup_stop: null,
                dropoff_stop: null
            });

            setPassengerDetails({
                email: passenger.email,
                is_active: true,
                user_id: passenger.passenger_id
            });
        } finally {
            setLoadingPassenger(false);
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

        if (statusFilter === "rfid") {
            const hasRFID = trip.rfid && trip.rfid.passengers && trip.rfid.passengers.length > 0;
            return matchesSearch && hasRFID;
        }

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
                                    <button
                                        onClick={() => setStatusFilter("rfid")}
                                        className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-lg capitalize transition-all flex items-center gap-1 ${statusFilter === "rfid"
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                                            }`}
                                    >
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        RFID Trips
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
                                {filteredTrips.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <TruckIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                                        <p className="text-gray-400 text-xs sm:text-sm">
                                            {statusFilter === "rfid" ? "No RFID trips found" : "No trips found"}
                                        </p>
                                    </div>
                                ) : (
                                    filteredTrips.map((trip) => {
                                        const statusStyle = getStatusBadge(trip.status);
                                        const isSelected = selectedTrip?.trip_id === trip.trip_id;
                                        const hasRFID = trip.rfid && trip.rfid.passengers && trip.rfid.passengers.length > 0;
                                        const rfidCount = hasRFID ? trip.rfid.passengers.length : 0;

                                        return (
                                            <div
                                                key={trip.trip_id}
                                                onClick={() => {
                                                    if (!isSelected) {
                                                        fetchTripDetails(trip.trip_id);
                                                    }
                                                }}
                                                className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${isSelected
                                                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-white shadow-lg"
                                                    : hasRFID
                                                        ? "border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50"
                                                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{trip.route_name}</p>
                                                            {hasRFID && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500 text-white text-[10px] sm:text-[11px] rounded-full font-medium shadow-sm">
                                                                    <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                    </svg>
                                                                    RFID ({rfidCount})
                                                                </span>
                                                            )}
                                                        </div>
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
                                                {hasRFID && (
                                                    <div className="mt-2 pt-1">
                                                        <div className="flex items-center justify-between text-[9px] text-indigo-600 mb-0.5">
                                                            <span>RFID Passengers</span>
                                                            <span>{rfidCount}</span>
                                                        </div>
                                                        <div className="w-full bg-indigo-100 rounded-full h-1">
                                                            <div
                                                                className="bg-indigo-500 h-1 rounded-full"
                                                                style={{ width: `${Math.min((rfidCount / 10) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
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

                                    {/* RFID SECTION - SIMPLIFIED */}
                                    {selectedTrip.rfid && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 overflow-hidden">
                                            <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-indigo-500 rounded-lg p-1.5">
                                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">RFID Trip Details</h3>
                                                            <p className="text-xs text-gray-500 mt-0.5">Passengers with RFID cards</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-indigo-100 rounded-full px-3 py-1">
                                                        <span className="text-indigo-700 text-xs font-medium">
                                                            {selectedTrip.rfid.passengers?.length || 0} RFID Passengers
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-3 gap-3 p-5 bg-gray-50/30">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Reserved Seats</p>
                                                    <p className="text-2xl font-bold text-indigo-600">{selectedTrip.rfid.reserved_seat_count || 0}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Total RFID Rides</p>
                                                    <p className="text-2xl font-bold text-indigo-600">{selectedTrip.rfid.total_rfid_rides || 0}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 mb-1">RFID Passengers</p>
                                                    <p className="text-2xl font-bold text-indigo-600">{selectedTrip.rfid.passengers?.length || 0}</p>
                                                </div>
                                            </div>

                                            {/* Passengers List - Simplified */}
                                            {selectedTrip.rfid.passengers && selectedTrip.rfid.passengers.length > 0 && (
                                                <div className="p-5 pt-0">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                                <svg className="h-3 w-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">Passengers</span>
                                                            <span className="text-xs text-gray-400">{selectedTrip.rfid.passengers.length}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {selectedTrip.rfid.passengers.map((passenger, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => {
                                                                    setSelectedRFIDPassenger(passenger);
                                                                    setShowRFIDPassengerModal(true);
                                                                }}
                                                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                        <span className="text-indigo-700 font-semibold text-sm">
                                                                            {passenger.passenger_name?.charAt(0) || "?"}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 text-sm">{passenger.passenger_name || "N/A"}</p>
                                                                        <p className="text-xs text-gray-500">{passenger.passenger_email || "No email"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${passenger.transfer_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                        passenger.transfer_status === 'withheld' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${passenger.transfer_status === 'completed' ? 'bg-green-500' :
                                                                            passenger.transfer_status === 'withheld' ? 'bg-orange-500' :
                                                                                'bg-gray-400'
                                                                            }`}></span>
                                                                        {passenger.transfer_status || passenger.status || "Unknown"}
                                                                    </span>
                                                                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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

                                    {/* PASSENGERS SECTION - SIMPLIFIED LIST VIEW */}
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
                                                    {selectedTrip.occupancy.passengers.map((passenger, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handlePassengerClick(passenger)}
                                                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-indigo-600 font-semibold text-sm">
                                                                        {passenger.name?.charAt(0) || "?"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{passenger.name}</p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {passenger.status === "completed" ? "✓ Completed" :
                                                                            passenger.status === "missed" ? "❌ Missed" :
                                                                                passenger.status === "cancelled" ? "✗ Cancelled" :
                                                                                    passenger.status === "boarded" ? "🚌 Boarded" :
                                                                                        passenger.status?.toUpperCase() || "Booked"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-400 text-sm">No passengers found</p>
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

            {/* PASSENGER DETAILS MODAL */}
            {showPassengerModal && selectedPassenger && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowPassengerModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Trip Booking Details</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{selectedPassenger.name}</p>
                            </div>
                            <button onClick={() => setShowPassengerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-5">
                            {loadingPassenger ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-indigo-500"></div>
                                    <p className="ml-2 text-gray-500 text-sm">Loading details...</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-600 font-semibold text-base">{selectedPassenger.name?.charAt(0) || "?"}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">{selectedPassenger.name}</h3>
                                            {passengerDetails?.email && (
                                                <p className="text-xs text-gray-500">{passengerDetails.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                                            <p className="text-xs font-medium text-gray-600">Booking for This Trip</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{selectedTrip?.route?.name} ({selectedTrip?.route?.code})</p>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">Trip Status</p>
                                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getStatusBadge(selectedTrip.status).bg} ${getStatusBadge(selectedTrip.status).text}`}>
                                                        {getStatusBadge(selectedTrip.status).label}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">Passenger Status</p>
                                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${currentTripBooking?.status === "completed" ? "bg-green-50 text-green-700" :
                                                        currentTripBooking?.status === "missed" ? "bg-red-50 text-red-700" :
                                                            currentTripBooking?.status === "cancelled" ? "bg-gray-50 text-gray-600" :
                                                                currentTripBooking?.status === "boarded" ? "bg-blue-50 text-blue-700" :
                                                                    "bg-gray-50 text-gray-600"
                                                        }`}>
                                                        {currentTripBooking?.status ? currentTripBooking.status.toUpperCase() : selectedPassenger.status?.toUpperCase() || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5">
                                                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xs">🚏</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">PICKUP STOP</p>
                                                        <p className="text-sm font-medium text-gray-700 mt-0.5">
                                                            {currentTripBooking?.pickup_stop?.name || currentTripBooking?.pickup_stop_name || 'N/A'}
                                                        </p>
                                                        {currentTripBooking?.pickup_stop?.bus_arrived_at && (
                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                                                <span className="text-gray-500">Arrived: <span className="font-mono text-gray-600">{new Date(currentTripBooking.pickup_stop.bus_arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
                                                                <span className="text-gray-500">Departed: <span className="font-mono text-gray-600">{new Date(currentTripBooking.pickup_stop.bus_departed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
                                                                {currentTripBooking.pickup_stop.bus_arrived_at && currentTripBooking.pickup_stop.bus_departed_at && (
                                                                    <span className="text-gray-500">Waited: <span className="text-amber-600">{Math.round((new Date(currentTripBooking.pickup_stop.bus_departed_at) - new Date(currentTripBooking.pickup_stop.bus_arrived_at)) / 1000)} sec</span></span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-start gap-2">
                                                    <div className="mt-0.5">
                                                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <span className="text-gray-500 text-xs">📍</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-400">DROPOFF STOP</p>
                                                        <p className="text-sm font-medium text-gray-700 mt-0.5">
                                                            {currentTripBooking?.dropoff_stop?.name || currentTripBooking?.dropoff_stop_name || 'N/A'}
                                                        </p>
                                                        {currentTripBooking?.dropoff_stop?.bus_arrived_at && (
                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                                                <span className="text-gray-500">Arrived: <span className="font-mono text-gray-600">{new Date(currentTripBooking.dropoff_stop.bus_arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
                                                                <span className="text-gray-500">Departed: <span className="font-mono text-gray-600">{new Date(currentTripBooking.dropoff_stop.bus_departed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {(currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name) &&
                                                (currentTripBooking?.actual_drop_stop_name !== currentTripBooking?.dropoff_stop?.name) && (
                                                    <div className="pt-1">
                                                        <div className="flex items-start gap-2">
                                                            <div className="mt-0.5">
                                                                <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center">
                                                                    <span className="text-blue-500 text-xs">⬇️</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs text-blue-500">ACTUAL DROPOFF</p>
                                                                <p className="text-sm font-medium text-blue-700 mt-0.5">
                                                                    {currentTripBooking?.actual_drop_stop_name || selectedPassenger.actual_drop_stop_name}
                                                                </p>
                                                                {(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at) && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Dropped at: {new Date(currentTripBooking?.actual_dropped_at || selectedPassenger.actual_dropped_at).toLocaleString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                            {(currentTripBooking?.status === "missed" || selectedPassenger.status === "missed") && (
                                                <div className="mt-2 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                                                    <div className="flex gap-2">
                                                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-700">Passenger Missed the Bus</p>
                                                            <p className="text-xs text-amber-600 mt-0.5">
                                                                Bus was at "{currentTripBooking?.pickup_stop?.name}" from {new Date(currentTripBooking?.pickup_stop?.bus_arrived_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {new Date(currentTripBooking?.pickup_stop?.bus_departed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-2 border-t border-gray-100">
                                                <p className="text-[11px] text-gray-400 uppercase tracking-wide">Trip Date</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {currentTripBooking?.created_at ? new Date(currentTripBooking.created_at).toLocaleString() :
                                                        selectedTrip.timing?.actual_start ? new Date(selectedTrip.timing.actual_start).toLocaleString() :
                                                            selectedTrip.timing?.planned_start ? new Date(selectedTrip.timing.planned_start).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                                        <p className="text-xs text-gray-500">
                                            ℹ️ Booking information for this specific trip only
                                            {passengerDetails?.user_id && (
                                                <span className="text-gray-400 ml-1">· ID: {passengerDetails.user_id?.slice(0, 13)}...</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/30 flex justify-end">
                            <button onClick={() => setShowPassengerModal(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RFID PASSENGER DETAILS MODAL */}
            {showRFIDPassengerModal && selectedRFIDPassenger && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowRFIDPassengerModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">RFID Passenger Details</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{selectedRFIDPassenger.passenger_name}</p>
                            </div>
                            <button onClick={() => setShowRFIDPassengerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-5">
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-indigo-600 font-semibold text-base">{selectedRFIDPassenger.passenger_name?.charAt(0) || "?"}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">{selectedRFIDPassenger.passenger_name}</h3>
                                        <p className="text-xs text-gray-500">{selectedRFIDPassenger.passenger_email || "No email"}</p>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                                        <p className="text-xs font-medium text-gray-600">Card & Ride Information</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Card Number:</span>
                                            <span className="font-mono text-sm text-gray-800">{selectedRFIDPassenger.card_uid_masked || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Ride ID:</span>
                                            <span className="font-mono text-sm text-gray-800">{selectedRFIDPassenger.rfid_ride_id || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Transfer Status:</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${selectedRFIDPassenger.transfer_status === 'completed' ? 'bg-green-100 text-green-700' :
                                                selectedRFIDPassenger.transfer_status === 'withheld' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${selectedRFIDPassenger.transfer_status === 'completed' ? 'bg-green-500' :
                                                    selectedRFIDPassenger.transfer_status === 'withheld' ? 'bg-orange-500' :
                                                        'bg-gray-400'
                                                    }`}></span>
                                                {selectedRFIDPassenger.transfer_status || selectedRFIDPassenger.status || "Unknown"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                                        <p className="text-xs font-medium text-gray-600">Journey Details</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-green-600 text-sm">🚏</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">PICKUP STOP</p>
                                                <p className="text-sm font-medium text-gray-800">{selectedRFIDPassenger.pickup_stop?.name || "N/A"}</p>
                                                {selectedRFIDPassenger.pickup_stop?.sequence && (
                                                    <p className="text-xs text-gray-400">Stop #{selectedRFIDPassenger.pickup_stop.sequence}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-red-600 text-sm">📍</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500">DROPOFF STOP</p>
                                                <p className="text-sm font-medium text-gray-800">{selectedRFIDPassenger.dropoff_stop?.name || "N/A"}</p>
                                                {selectedRFIDPassenger.dropoff_stop?.sequence && (
                                                    <p className="text-xs text-gray-400">Stop #{selectedRFIDPassenger.dropoff_stop.sequence}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                                        <p className="text-xs font-medium text-gray-600">Financial Breakdown</p>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Fare Net Amount</p>
                                                <p className="text-lg font-bold text-gray-900">₹{selectedRFIDPassenger.fare_net_amount?.toFixed(2) || "0"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Commission</p>
                                                <p className="text-lg font-bold text-purple-600">
                                                    ₹{selectedRFIDPassenger.commission_amount?.toFixed(2) || "0"}
                                                    <span className="text-xs text-gray-400 ml-1">({selectedRFIDPassenger.commission_percent_snapshot || 0}%)</span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Driver Payout (Net)</p>
                                                <p className="text-lg font-bold text-emerald-600">₹{selectedRFIDPassenger.driver_payout_net_amount?.toFixed(2) || "0"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Platform Net</p>
                                                <p className="text-lg font-bold text-blue-600">₹{selectedRFIDPassenger.platform_net_amount?.toFixed(2) || "0"}</p>
                                            </div>
                                        </div>

                                        <details className="mt-4">
                                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                                Show original amounts
                                            </summary>
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Fare Amount:</span>
                                                        <span className="ml-2 text-gray-700">₹{selectedRFIDPassenger.fare_amount?.toFixed(2) || "0"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Fare Reversed:</span>
                                                        <span className="ml-2 text-red-500">₹{selectedRFIDPassenger.fare_reversed_amount?.toFixed(2) || "0"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Driver Payout:</span>
                                                        <span className="ml-2 text-emerald-600">₹{selectedRFIDPassenger.driver_payout_amount?.toFixed(2) || "0"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Platform Amount:</span>
                                                        <span className="ml-2 text-gray-700">₹{selectedRFIDPassenger.platform_amount?.toFixed(2) || "0"}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500">Platform Reversed:</span>
                                                        <span className="ml-2 text-red-500">₹{selectedRFIDPassenger.platform_amount_reversed?.toFixed(2) || "0"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </details>
                                    </div>
                                </div>

                                {(selectedRFIDPassenger.boarded_at || selectedRFIDPassenger.dropped_at) && (
                                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                                            <p className="text-xs font-medium text-gray-600">Timestamps</p>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {selectedRFIDPassenger.boarded_at && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">🚌 Boarded:</span>
                                                    <span className="font-mono text-gray-700">{new Date(selectedRFIDPassenger.boarded_at).toLocaleTimeString()}</span>
                                                </div>
                                            )}
                                            {selectedRFIDPassenger.dropped_at && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">🏁 Dropped:</span>
                                                    <span className="font-mono text-gray-700">{new Date(selectedRFIDPassenger.dropped_at).toLocaleTimeString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/30 flex justify-end">
                            <button onClick={() => setShowRFIDPassengerModal(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">
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