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
    ArrowRightIcon,
    ShoppingCartIcon,
    DocumentTextIcon
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


const formatLocalTime = (utcDateString) => {
    if (!utcDateString) return 'N/A';
    try {
        const date = new Date(utcDateString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch (e) {
        return utcDateString;
    }
};

const formatLocalDateTime = (utcDateString) => {
    if (!utcDateString) return 'N/A';
    try {
        const date = new Date(utcDateString);
        return date.toLocaleString([], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch (e) {
        return utcDateString;
    }
};

const calculateWaitTime = (arrivedAt, departedAt) => {
    if (!arrivedAt || !departedAt) return null;
    const arrived = new Date(arrivedAt);
    const departed = new Date(departedAt);
    const waitSeconds = Math.round((departed - arrived) / 1000);
    if (waitSeconds < 0) return null;
    return waitSeconds;
};

// Stop marker icon
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

// Calculate distance between coordinates
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

// Find nearest stop
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

// Get location name from coordinates
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
    const [passengerError, setPassengerError] = useState(null);

    // RFID Passenger modal states
    const [selectedRFIDPassenger, setSelectedRFIDPassenger] = useState(null);
    const [showRFIDPassengerModal, setShowRFIDPassengerModal] = useState(false);

    // Booking Sessions states
    const [allBookingSessions, setAllBookingSessions] = useState([]);
    const [loadingAllSessions, setLoadingAllSessions] = useState(false);
    const [showAllSessionsModal, setShowAllSessionsModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionSearchTerm, setSessionSearchTerm] = useState("");
    const [sessionStatusFilter, setSessionStatusFilter] = useState("all");

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

    // Fetch ALL booking sessions (for the Sessions view)
    const fetchAllBookingSessions = async () => {
        setLoadingAllSessions(true);
        try {
            const response = await axios.get(`${BASE_URL}/booking-sessions`, axiosConfig);
            setAllBookingSessions(response.data || []);
        } catch (err) {
            console.error("Error fetching all booking sessions:", err);
            toast?.error("Failed to load booking sessions");
        } finally {
            setLoadingAllSessions(false);
        }
    };

    // Fetch booking sessions for current trip
    const fetchTripBookingSessions = async (scheduledTripId) => {
        if (!scheduledTripId) return;

        try {
            const response = await axios.get(`${BASE_URL}/booking-sessions`, {
                params: { scheduled_trip_id: scheduledTripId },
                ...axiosConfig
            });
            // These are for the specific trip, but we'll keep them separate if needed
            return response.data || [];
        } catch (err) {
            console.error("Error fetching trip booking sessions:", err);
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

    const handleViewAllSessions = () => {
        fetchAllBookingSessions();
        setShowAllSessionsModal(true);
    };

    const handlePassengerClick = async (passenger) => {
        let bookingId = passenger.booking_id;

        if (!bookingId && selectedTrip?.bookings) {
            const matchingBooking = selectedTrip.bookings.find(
                booking => booking.traveller_name === passenger.name ||
                    booking.traveller_name === passenger.traveller_name
            );
            if (matchingBooking) {
                bookingId = matchingBooking.booking_id;
            }
        }

        if (!bookingId) {
            setPassengerError("No booking ID found for this passenger");
            setShowPassengerModal(true);
            return;
        }

        setSelectedPassenger(passenger);
        setShowPassengerModal(true);
        setPassengerDetails(null);
        setCurrentTripBooking(null);
        setPassengerError(null);
        setLoadingPassenger(true);

        try {
            const tripDetailUrl = `${BASE_URL}/bookings/${bookingId}/trip-detail`;
            const response = await axios.get(tripDetailUrl, axiosConfig);
            const data = response.data;

            console.log("Full API Response:", data);

            // IMPORTANT: Log each booking to see what's coming through
            data.bookings.forEach((booking, idx) => {
                console.log(`Booking ${idx}:`, {
                    traveller_name: booking.traveller_name,
                    passenger_name: booking.passenger_name,
                    full_booking: booking
                });
            });

            // Create the formatted booking object - MAKE SURE to keep ALL original fields
            const formattedBooking = {
                passenger: {
                    user_id: data.passenger?.user_id,
                    email: data.passenger?.email,
                    full_name: data.passenger?.full_name
                },
                trip: {
                    scheduled_trip_id: data.trip?.scheduled_trip_id,
                    status: data.trip?.status,
                    planned_start_at: data.trip?.planned_start_at,
                    planned_end_at: data.trip?.planned_end_at,
                    actual_start_at: data.trip?.actual_start_at,
                    actual_end_at: data.trip?.actual_end_at,
                    route: data.trip?.route,
                    vehicle: data.trip?.vehicle,
                    driver: data.trip?.driver
                },
                // This is critical - pass the bookings array AS IS from the API response
                bookings: data.bookings.map(booking => ({
                    booking_id: booking.booking_id,
                    booking_session_id: booking.booking_session_id,
                    passenger_user_id: booking.passenger_user_id,
                    passenger_name: booking.passenger_name,
                    passenger_email: booking.passenger_email,
                    traveller_profile_id: booking.traveller_profile_id,
                    traveller_name: booking.traveller_name,  // MAKE SURE this is included
                    traveller_phone: booking.traveller_phone,
                    traveller_email: booking.traveller_email,
                    traveller_relationship_label: booking.traveller_relationship_label,
                    seat_number: booking.seat_number,
                    status: booking.status,
                    booking_status: booking.booking_status,
                    fare: booking.fare,
                    fare_amount: booking.fare_amount,
                    created_at: booking.created_at,
                    boarded_at: booking.boarded_at,
                    completed_at: booking.completed_at,
                    cancelled_at: booking.cancelled_at,
                    updated_at: booking.updated_at,
                    actual_dropped_at: booking.actual_dropped_at,
                    actual_drop_stop_name: booking.actual_drop_stop_name,
                    pickup_stop: booking.pickup_stop,
                    dropoff_stop: booking.dropoff_stop
                })),
                seat_count: data.seat_count,
                seat_numbers: data.seat_numbers || [],
                booking_session_id: data.booking_session_id
            };

            console.log("Formatted Booking:", formattedBooking);
            setCurrentTripBooking(formattedBooking);
            setPassengerDetails({
                email: data.passenger?.email,
                full_name: data.passenger?.full_name,
                user_id: data.passenger?.user_id
            });

        } catch (err) {
            console.error("Error fetching trip details:", err);
            setPassengerError(err.response?.data?.message || "Failed to load booking details");
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

        if (selectedTrip?.status !== "in_progress") {
            setCompletionError({
                title: "Cannot Complete Trip",
                message: `Trip is currently "${selectedTrip?.status?.replace("_", " ") || "N/A"}". Manual trip completion is only allowed when the trip status is 'in_progress'.`
            });
            return;
        }

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

                if (errorData?.detail === "Manual trip completion is allowed only when the trip status is 'in_progress'.") {
                    errorTitle = "⚠️ Invalid Trip Status";
                    errorMessage = `Trip is currently "${selectedTrip?.status || 'unknown'}". Manual trip completion is only allowed when the trip status is 'in_progress'.`;
                } else if (errorData?.detail?.error === "passengers_still_on_board") {
                    errorTitle = "⚠️ Passengers Still On Board";
                    errorMessage = errorData.detail?.message || "Cannot complete the trip while passengers are still on board.";
                } else if (typeof errorData?.detail === "string") {
                    errorMessage = errorData.detail;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                }
            }
            setCompletionError({ title: errorTitle, message: errorMessage });
        } finally {
            setCompletingTrip(false);
        }
    };

    // Calculate booking sessions summary
    const getBookingSessionsSummary = () => {
        const totalSessions = allBookingSessions.length;
        const totalBookings = allBookingSessions.reduce((sum, session) => sum + (session.booking_count || 0), 0);
        const totalRevenue = allBookingSessions.reduce((sum, session) => sum + (session.total_fare_amount || 0), 0);
        const confirmedSessions = allBookingSessions.filter(s => s.status === "confirmed").length;

        return { totalSessions, totalBookings, totalRevenue, confirmedSessions };
    };

    // Filter sessions based on search and status
    const getFilteredSessions = () => {
        let filtered = allBookingSessions;

        if (sessionStatusFilter !== "all") {
            filtered = filtered.filter(session => session.status === sessionStatusFilter);
        }

        if (sessionSearchTerm) {
            filtered = filtered.filter(session =>
                session.booking_session_id.toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
                session.owner_user_id.toLowerCase().includes(sessionSearchTerm.toLowerCase()) ||
                session.scheduled_trip_id.toLowerCase().includes(sessionSearchTerm.toLowerCase())
            );
        }

        return filtered;
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

    const sessionSummary = getBookingSessionsSummary();
    const filteredSessions = getFilteredSessions();

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
                                    <button
                                        onClick={handleViewAllSessions}
                                        className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-lg capitalize transition-all flex items-center gap-1 bg-purple-600 text-white shadow-sm hover:bg-purple-700"
                                    >
                                        <ShoppingCartIcon className="h-3 w-3" />
                                        Sessions
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

                                    {/* RFID SECTION */}
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

                                    {/* PASSENGERS SECTION - Grouped by Booking Session (Main Passenger) */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Passengers & Travellers</h3>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                                        Total: {(() => {
                                                            // Group by booking_session_id or main passenger identifier
                                                            const uniqueSessions = new Map();
                                                            (selectedTrip.occupancy?.passengers || []).forEach(p => {
                                                                const sessionKey = p.booking_session_id || p.user_id || p.email;
                                                                if (!uniqueSessions.has(sessionKey)) {
                                                                    uniqueSessions.set(sessionKey, p);
                                                                }
                                                            });
                                                            return uniqueSessions.size;
                                                        })()} booking session(s)
                                                    </p>
                                                </div>
                                                <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="p-3 sm:p-5">
                                            {selectedTrip.occupancy?.passengers?.length > 0 ? (
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {(() => {
                                                        // Group passengers by booking_session_id
                                                        const sessionGroups = new Map();

                                                        selectedTrip.occupancy.passengers.forEach(passenger => {
                                                            // Use booking_session_id as the grouping key
                                                            const sessionKey = passenger.booking_session_id || passenger.user_id || passenger.email;

                                                            if (!sessionGroups.has(sessionKey)) {
                                                                sessionGroups.set(sessionKey, {
                                                                    mainPassenger: null,
                                                                    travellers: [],
                                                                    booking_count: 0,
                                                                    booking_session_id: passenger.booking_session_id,
                                                                    passenger_user_id: passenger.passenger_user_id || passenger.user_id
                                                                });
                                                            }

                                                            const group = sessionGroups.get(sessionKey);

                                                            // Determine if this is the main passenger (booking owner)
                                                            // Main passenger has the same user_id as passenger_user_id or has a user_id
                                                            const isMainPassenger = passenger.user_id &&
                                                                (passenger.user_id === passenger.passenger_user_id ||
                                                                    passenger.user_id === group.passenger_user_id);

                                                            if (isMainPassenger || (!passenger.traveller_name && passenger.name)) {
                                                                if (!group.mainPassenger || (passenger.user_id && passenger.user_id === passenger.passenger_user_id)) {
                                                                    group.mainPassenger = passenger;
                                                                }
                                                            }
                                                            group.travellers.push(passenger);
                                                            group.booking_count++;
                                                        });

                                                        // Convert to array and process each session
                                                        const sessions = Array.from(sessionGroups.values()).map(group => {
                                                            const mainPassenger = group.mainPassenger || group.travellers[0];
                                                            const totalBookings = group.booking_count;

                                                            // Count travellers (excluding main passenger)
                                                            const travellersList = group.travellers.filter(t =>
                                                                t !== mainPassenger &&
                                                                (t.traveller_name || (t.name && t.name !== mainPassenger?.name))
                                                            );

                                                            // Determine overall status for this session
                                                            const allCompleted = group.travellers.every(t => t.status === "completed");
                                                            const hasBoarded = group.travellers.some(t => t.status === "boarded");
                                                            const hasCancelled = group.travellers.some(t => t.status === "cancelled");
                                                            const hasMissed = group.travellers.some(t => t.status === "missed");
                                                            const hasCompleted = group.travellers.some(t => t.status === "completed");

                                                            let statusSummary = "";
                                                            let statusIcon = "";
                                                            let statusColor = "text-gray-500";

                                                            if (allCompleted && totalBookings > 0) {
                                                                statusSummary = "All Completed";
                                                                statusIcon = "✓";
                                                                statusColor = "text-green-600";
                                                            } else if (hasBoarded && !allCompleted) {
                                                                statusSummary = `${group.travellers.filter(t => t.status === "boarded").length} Boarded, ${group.travellers.filter(t => t.status === "completed").length} Completed`;
                                                                statusIcon = "🚌";
                                                                statusColor = "text-blue-600";
                                                            } else if (hasCancelled && hasCompleted) {
                                                                statusSummary = `${group.travellers.filter(t => t.status === "completed").length} Completed, ${group.travellers.filter(t => t.status === "cancelled").length} Cancelled`;
                                                                statusIcon = "⚠️";
                                                                statusColor = "text-amber-600";
                                                            } else if (hasCancelled) {
                                                                statusSummary = `${group.travellers.filter(t => t.status === "cancelled").length} Cancelled`;
                                                                statusIcon = "❌";
                                                                statusColor = "text-red-600";
                                                            } else if (hasMissed) {
                                                                statusSummary = "Missed";
                                                                statusIcon = "⚠️";
                                                                statusColor = "text-amber-600";
                                                            } else {
                                                                statusSummary = `${totalBookings} booking${totalBookings !== 1 ? 's' : ''}`;
                                                                statusIcon = "📖";
                                                                statusColor = "text-gray-500";
                                                            }

                                                            return {
                                                                ...mainPassenger,
                                                                mainPassengerName: mainPassenger.name || mainPassenger.traveller_name || mainPassenger.full_name,
                                                                mainPassengerEmail: mainPassenger.email || mainPassenger.traveller_email,
                                                                totalBookings,
                                                                travellersCount: travellersList.length,
                                                                travellersList,
                                                                statusSummary,
                                                                statusIcon,
                                                                statusColor,
                                                                travellers: group.travellers,
                                                                booking_session_id: group.booking_session_id
                                                            };
                                                        });

                                                        return sessions.map((session, index) => (
                                                            <div
                                                                key={session.booking_session_id || session.user_id || index}
                                                                onClick={() => handlePassengerClick(session)}
                                                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:shadow-md transition-all cursor-pointer group"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <span className="text-indigo-600 font-semibold text-sm">
                                                                            {session.mainPassengerName?.charAt(0) || "?"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="text-sm font-bold text-gray-800 truncate">
                                                                                {session.mainPassengerName || "Unknown"}
                                                                            </p>
                                                                            <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                                                                                Booking Owner
                                                                            </span>
                                                                            {session.totalBookings > 1 && (
                                                                                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                                                                                    {session.totalBookings} seats
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Show travellers info */}
                                                                        {session.travellersCount > 0 && (
                                                                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                                                                                <span className="text-[10px] text-gray-500">Travellers:</span>
                                                                                {session.travellersList.slice(0, 2).map((t, idx) => (
                                                                                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
                                                                                        {t.traveller_name || t.name || "?"}
                                                                                    </span>
                                                                                ))}
                                                                                {session.travellersCount > 2 && (
                                                                                    <span className="text-[10px] text-gray-400">+{session.travellersCount - 2} more</span>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <p className={`text-xs ${session.statusColor} flex items-center gap-1`}>
                                                                                <span>{session.statusIcon}</span> {session.statusSummary}
                                                                            </p>
                                                                            {session.mainPassengerEmail && (
                                                                                <p className="text-[10px] text-gray-400 truncate">
                                                                                    {session.mainPassengerEmail}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                                                            </div>
                                                        ));
                                                    })()}
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

            {/* ALL BOOKING SESSIONS MODAL */}
            {showAllSessionsModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowAllSessionsModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">All Booking Sessions</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Complete list of all booking sessions across the system</p>
                            </div>
                            <button onClick={() => setShowAllSessionsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-4 gap-3 p-4 bg-purple-50/30 border-b border-gray-100">
                            <div className="text-center">
                                <p className="text-xs text-purple-600 font-medium">Total Sessions</p>
                                <p className="text-xl font-bold text-purple-700">{sessionSummary.totalSessions}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-blue-600 font-medium">Total Bookings</p>
                                <p className="text-xl font-bold text-blue-700">{sessionSummary.totalBookings}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-green-600 font-medium">Total Revenue</p>
                                <p className="text-xl font-bold text-green-700">₹{sessionSummary.totalRevenue}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-emerald-600 font-medium">Confirmed</p>
                                <p className="text-xl font-bold text-emerald-700">{sessionSummary.confirmedSessions}</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by Session ID, Owner ID, or Trip ID..."
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        value={sessionSearchTerm}
                                        onChange={(e) => setSessionSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={sessionStatusFilter}
                                        onChange={(e) => setSessionStatusFilter(e.target.value)}
                                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-5">
                            {loadingAllSessions ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-purple-500"></div>
                                    <p className="ml-2 text-gray-500 text-sm">Loading sessions...</p>
                                </div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No booking sessions found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredSessions.map((session) => (
                                        <div key={session.booking_session_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${session.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                            session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                session.status === 'expired' ? 'bg-gray-100 text-gray-600' :
                                                                    'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {session.status}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            Created: {new Date(session.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Booking Count</p>
                                                            <p className="text-sm font-semibold text-gray-800">{session.booking_count} booking(s)</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Payment Count</p>
                                                            <p className="text-sm font-semibold text-gray-800">{session.payment_count} payment(s)</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">Total Fare</p>
                                                            <p className="text-lg font-bold text-green-600">₹{session.total_fare_amount}</p>
                                                        </div>
                                                        {session.confirmed_at && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Confirmed At</p>
                                                                <p className="text-xs text-gray-600">{new Date(session.confirmed_at).toLocaleString()}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-3 pt-2 border-t border-gray-100">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-gray-400 font-mono">
                                                            <p className="break-all">Session ID: {session.booking_session_id}</p>
                                                            <p className="break-all">Trip ID: {session.scheduled_trip_id}</p>
                                                            <p className="break-all">Owner ID: {session.owner_user_id}</p>
                                                            <p className="break-all">Route ID: {session.route_id}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/30 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                                Showing {filteredSessions.length} of {allBookingSessions.length} session(s)
                            </p>
                            <button onClick={() => setShowAllSessionsModal(false)} className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => {
                    setShowCompleteModal(false);
                    setCompletionError(null);
                    setCompletionNote("");
                }}>
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

                        {completionError && (
                            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-700">{completionError.title}</h4>
                                        <p className="text-xs text-red-600 mt-0.5">{completionError.message}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setCompletionError(null)}
                                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

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
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    setCompletionError(null);
                                    setCompletionNote("");
                                }}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={completeTripManually}
                                disabled={completingTrip}
                                className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs sm:text-sm hover:from-emerald-700 hover:to-emerald-800 transition disabled:opacity-50"
                            >
                                {completingTrip ? "Processing..." : "Complete Trip"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPassengerModal && selectedPassenger && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {
                    setShowPassengerModal(false);
                    setPassengerError(null);
                }}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header - Compact & Clean */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Booking ID: {currentTripBooking?.booking_session_id?.slice(0, 8)}...</p>
                            </div>
                            <button onClick={() => setShowPassengerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                            {loadingPassenger ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-200 border-t-indigo-600 mb-3"></div>
                                        <p className="text-gray-500">Loading booking details...</p>
                                    </div>
                                </div>
                            ) : passengerError ? (
                                <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                        <p className="text-sm text-red-700">{passengerError}</p>
                                    </div>
                                </div>
                            ) : currentTripBooking ? (
                                <div className="p-6 space-y-6">
                                    {/* Owner Profile Card - Compact */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                    <span className="text-white font-bold text-xl">
                                                        {currentTripBooking.passenger?.full_name?.charAt(0) || "?"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900 text-lg">{currentTripBooking.passenger?.full_name}</h3>
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Booking Owner</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">📧 {currentTripBooking.passenger?.email}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="text-xs font-mono text-gray-500">ID: {currentTripBooking.passenger?.user_id?.slice(0, 8)}...</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-indigo-600">{currentTripBooking.bookings?.length}</div>
                                                <div className="text-xs text-gray-500">Seat{currentTripBooking.bookings?.length !== 1 ? 's' : ''}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Summary Bar - Horizontal */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
                                                    <p className="font-semibold text-gray-900">{currentTripBooking.trip?.route?.name} <span className="text-gray-400 text-sm">({currentTripBooking.trip?.route?.code})</span></p>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                        {currentTripBooking.trip?.status?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Total Fare</p>
                                                    <p className="font-bold text-green-600">₹{currentTripBooking.bookings?.reduce((sum, b) => sum + (b.fare || b.fare_amount || 0), 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Travellers Section - Clean Grid Layout */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                                                <h4 className="font-semibold text-gray-900">Passengers & Travellers</h4>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{currentTripBooking.bookings?.length}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentTripBooking.bookings?.map((booking, index) => {
                                                const isSelf = booking.traveller_relationship_label === "Self";
                                                const statusColor = booking.status === 'cancelled' ? 'red' : booking.status === 'completed' ? 'green' : 'gray';

                                                // Determine if actual drop info exists and differs from planned
                                                const hasActualDrop = booking.actual_drop_stop_name && booking.actual_drop_stop_name !== booking.dropoff_stop?.name;
                                                const hasActualDropTime = booking.actual_dropped_at;

                                                return (
                                                    <div key={booking.booking_id} className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${isSelf ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-200'}`}>
                                                        {/* Header */}
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg ${isSelf ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                    {booking.traveller_name?.charAt(0).toUpperCase() || "?"}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-semibold text-gray-900">{booking.traveller_name}</p>
                                                                        {isSelf && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">Self</span>}
                                                                        {booking.traveller_relationship_label && !isSelf && (
                                                                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{booking.traveller_relationship_label}</span>
                                                                        )}
                                                                    </div>
                                                                    {booking.traveller_phone && (
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                            📞 {booking.traveller_phone}
                                                                        </p>
                                                                    )}
                                                                    {booking.traveller_email && booking.traveller_email !== booking.passenger_email && (
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                            ✉️ {booking.traveller_email}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-${statusColor}-50 text-${statusColor}-700`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full bg-${statusColor}-500`}></span>
                                                                {booking.status?.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        {/* Seat & Fare - Horizontal */}
                                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-3">
                                                            <div className="text-center">
                                                                <p className="text-xs text-gray-500">Seat</p>
                                                                <p className="text-xl font-bold text-indigo-600">#{booking.seat_number}</p>
                                                            </div>
                                                            <div className="w-px h-8 bg-gray-200"></div>
                                                            <div className="text-center">
                                                                <p className="text-xs text-gray-500">Fare</p>
                                                                <p className="text-xl font-bold text-green-600">₹{booking.fare || booking.fare_amount}</p>
                                                            </div>
                                                            {booking.status === "completed" && (
                                                                <>
                                                                    <div className="w-px h-8 bg-gray-200"></div>
                                                                    <div className="text-center">
                                                                        <p className="text-xs text-gray-500">Status</p>
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                                            <CheckCircleIcon className="h-3 w-3" />
                                                                            Completed
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Stops - Enhanced with Actual Drop Info */}
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-green-600 font-medium">🚏 Pickup</span>
                                                                <span className="text-gray-700">{booking.pickup_stop?.name}</span>
                                                                {booking.boarded_at && (
                                                                    <span className="text-xs text-gray-400 ml-auto">{formatLocalTime(booking.boarded_at)}</span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-red-600 font-medium">📍 Dropoff</span>
                                                                <span className="text-gray-700">{booking.dropoff_stop?.name}</span>
                                                            </div>

                                                            {/* Actual Drop Information - Shows when different from planned or when completed */}
                                                            {booking.status === "completed" && (
                                                                <>
                                                                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                                                                        <span className="text-xs text-blue-600 font-medium">🏁 Actual Drop</span>
                                                                        <span className="font-medium text-blue-700">
                                                                            {booking.actual_drop_stop_name || booking.dropoff_stop?.name || "N/A"}
                                                                        </span>
                                                                        {booking.actual_dropped_at && (
                                                                            <span className="text-xs text-blue-500 ml-auto">
                                                                                {formatLocalTime(booking.actual_dropped_at)}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Show indicator if actual drop is different from planned */}
                                                                    {hasActualDrop && (
                                                                        <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
                                                                            <ExclamationTriangleIcon className="h-3 w-3" />
                                                                            <span>Dropped at different location than planned</span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                            {booking.cancelled_at && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 border-t border-gray-100 mt-2">
                                                                    <span>❌ Cancelled</span>
                                                                    <span>{formatLocalDateTime(booking.cancelled_at)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Trip Schedule & Vehicle - Combined Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Schedule */}
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ClockIcon className="h-4 w-4 text-indigo-500" />
                                                <h4 className="font-semibold text-gray-900 text-sm">Trip Schedule</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Planned Start</span>
                                                    <span className="font-medium text-gray-900">{formatLocalDateTime(currentTripBooking.trip?.planned_start_at)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Planned End</span>
                                                    <span className="font-medium text-gray-900">{formatLocalDateTime(currentTripBooking.trip?.planned_end_at)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vehicle & Driver */}
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TruckIcon className="h-4 w-4 text-indigo-500" />
                                                <h4 className="font-semibold text-gray-900 text-sm">Vehicle & Driver</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Vehicle</span>
                                                    <span className="font-medium text-gray-900">{currentTripBooking.trip?.vehicle?.vehicle_name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Reg No.</span>
                                                    <span className="font-mono text-sm text-gray-700">{currentTripBooking.trip?.vehicle?.registration_number}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Driver</span>
                                                    <span className="font-medium text-gray-900">{currentTripBooking.trip?.driver?.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reference - Footer */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex flex-wrap gap-4 text-xs">
                                            <div>
                                                <span className="text-gray-500">Session ID:</span>
                                                <span className="ml-2 font-mono text-gray-700">{currentTripBooking.booking_session_id}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Trip ID:</span>
                                                <span className="ml-2 font-mono text-gray-700">{currentTripBooking.trip?.scheduled_trip_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No booking details available</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-end">
                            <button onClick={() => setShowPassengerModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">
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
