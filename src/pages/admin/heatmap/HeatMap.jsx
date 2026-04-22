import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Local coordinate database that can be updated dynamically
const LOCAL_COORDINATES_KEY = "stop_coordinates_database";

// Initialize coordinate database
const getCoordinateDatabase = () => {
    const saved = localStorage.getItem(LOCAL_COORDINATES_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    // Default coordinates for common Kolkata areas
    return {
        // Default center points for different areas
        "Salt Lake": [22.5726, 88.3639],
        "New Town": [22.5826, 88.4839],
        "Rajarhat": [22.6126, 88.4639],
        "Airport": [22.6547, 88.4467],
        "City Center": [22.5726, 88.3639],
        "Ecospace": [22.5426, 88.3539],
        "DLF": [22.5826, 88.4539],
        "Technopolis": [22.5626, 88.4239],
        "Unitech": [22.5926, 88.4439],
        "Webel": [22.6026, 88.4339],
    };
};

// Save coordinate to database
const saveCoordinateToDatabase = (stopName, lat, lng) => {
    const db = getCoordinateDatabase();
    db[stopName] = [lat, lng];
    localStorage.setItem(LOCAL_COORDINATES_KEY, JSON.stringify(db));
};

// Get coordinate for a stop
const getStopCoordinate = (stopName) => {
    const db = getCoordinateDatabase();
    
    // Exact match
    if (db[stopName]) {
        return db[stopName];
    }
    
    // Try partial match
    for (const [key, coords] of Object.entries(db)) {
        if (stopName.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(stopName.toLowerCase())) {
            return coords;
        }
    }
    
    // Generate a pseudo-random but consistent coordinate based on stop name hash
    // This ensures the same stop always appears in the same relative location
    const hash = stopName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = (hash % 100) / 1000; // -0.05 to 0.05
    const lngOffset = ((hash * 13) % 100) / 1000;
    
    return [22.5726 + latOffset, 88.3639 + lngOffset];
};

// Custom icons for different booking intensities
const getMarkerIcon = (bookingCount, maxCount) => {
    const intensity = (bookingCount / maxCount) * 100;
    let color;
    if (intensity >= 80) color = "#ef4444";
    else if (intensity >= 60) color = "#f97316";
    else if (intensity >= 40) color = "#eab308";
    else if (intensity >= 20) color = "#3b82f6";
    else color = "#22c55e";
    
    try {
        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color.substring(1)}.png`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            shadowSize: [41, 41],
        });
    } catch (error) {
        return new L.Icon.Default();
    }
};

const HeatMap = () => {
    const [topStops, setTopStops] = useState([]);
    const [mostBookedRoutes, setMostBookedRoutes] = useState([]);
    const [stopsWithCoords, setStopsWithCoords] = useState([]);
    const [routesWithCoords, setRoutesWithCoords] = useState([]);
    const [loadingStops, setLoadingStops] = useState(true);
    const [loadingRoutes, setLoadingRoutes] = useState(true);
    const [selectedStop, setSelectedStop] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]);
    const [mapZoom, setMapZoom] = useState(11);
    const [error, setError] = useState(null);
    const [showCoordinateModal, setShowCoordinateModal] = useState(false);
    const [currentStopForCoordinate, setCurrentStopForCoordinate] = useState(null);
    const [newLat, setNewLat] = useState("");
    const [newLng, setNewLng] = useState("");
    const [missingCoordinates, setMissingCoordinates] = useState([]);

    const token = localStorage.getItem("access_token");

    // Fetch top booked stops
    const fetchTopBookedStops = async () => {
        try {
            setLoadingStops(true);
            const response = await axios.get(
                "https://be.shuttleapp.transev.site/admin/analytics/top-pickup-stops",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const stops = response.data || [];
            setTopStops(stops);
            setError(null);
            
            // Get coordinates for stops
            processStopCoordinates(stops);
        } catch (err) {
            console.error("Error fetching top stops:", err);
            setError("Failed to load top stops data");
            setLoadingStops(false);
        }
    };

    // Process stop coordinates
    const processStopCoordinates = (stops) => {
        const stopsWithCoordinates = [];
        const missingCoords = [];
        
        for (const stop of stops) {
            const coords = getStopCoordinate(stop.stop_name);
            stopsWithCoordinates.push({
                ...stop,
                coordinates: coords,
                hasExactCoordinate: !!getCoordinateDatabase()[stop.stop_name]
            });
            
            if (!getCoordinateDatabase()[stop.stop_name]) {
                missingCoords.push(stop.stop_name);
            }
        }
        
        setStopsWithCoords(stopsWithCoordinates);
        setMissingCoordinates(missingCoords);
        setLoadingStops(false);
    };

    // Fetch most booked routes
    const fetchMostBookedRoutes = async () => {
        try {
            setLoadingRoutes(true);
            const response = await axios.get(
                "https://be.shuttleapp.transev.site/admin/analytics/most-booked-routes",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const routes = response.data || [];
            setMostBookedRoutes(routes);
            setError(null);
            
            processRouteCoordinates(routes);
        } catch (err) {
            console.error("Error fetching most booked routes:", err);
            setError("Failed to load routes data");
            setLoadingRoutes(false);
        }
    };

    // Process route coordinates
    const processRouteCoordinates = (routes) => {
        const routesWithCoordinates = [];
        
        for (const route of routes) {
            // For routes, create a path between two points based on the route name
            const routeHash = route.route_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const startPoint = [
                22.5726 + ((routeHash % 100) / 1000),
                88.3639 + (((routeHash * 7) % 100) / 1000)
            ];
            const endPoint = [
                22.5726 + (((routeHash * 13) % 100) / 1000),
                88.3639 + (((routeHash * 19) % 100) / 1000)
            ];
            
            routesWithCoordinates.push({
                ...route,
                coordinates: [startPoint, endPoint]
            });
        }
        
        setRoutesWithCoords(routesWithCoordinates);
        setLoadingRoutes(false);
    };

    // Save custom coordinate for a stop
    const handleSaveCoordinate = () => {
        if (!currentStopForCoordinate || !newLat || !newLng) {
            alert("Please enter both latitude and longitude");
            return;
        }
        
        const lat = parseFloat(newLat);
        const lng = parseFloat(newLng);
        
        if (isNaN(lat) || isNaN(lng)) {
            alert("Please enter valid numbers for latitude and longitude");
            return;
        }
        
        saveCoordinateToDatabase(currentStopForCoordinate, lat, lng);
        
        // Update the stopsWithCoords
        const updatedStops = stopsWithCoords.map(stop => {
            if (stop.stop_name === currentStopForCoordinate) {
                return {
                    ...stop,
                    coordinates: [lat, lng],
                    hasExactCoordinate: true
                };
            }
            return stop;
        });
        
        setStopsWithCoords(updatedStops);
        
        // Update missing coordinates list
        setMissingCoordinates(missingCoordinates.filter(name => name !== currentStopForCoordinate));
        
        // Close modal
        setShowCoordinateModal(false);
        setCurrentStopForCoordinate(null);
        setNewLat("");
        setNewLng("");
        
        // Center map on new coordinate
        setMapCenter([lat, lng]);
        setMapZoom(15);
        
        alert(`Coordinates saved for ${currentStopForCoordinate}`);
    };

    const maxBookings = topStops[0]?.booking_count || 1;

    // Skeleton loader
    const SkeletonLoader = () => (
        <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex-1">
                        <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-zinc-700 rounded w-16"></div>
                </div>
            ))}
        </div>
    );

    useEffect(() => {
        fetchTopBookedStops();
        fetchMostBookedRoutes();
    }, [token]);

    return (
        <div className="flex bg-gradient-to-br from-black via-zinc-900 to-black min-h-screen">
            <Sidebar />
            <div className="flex-1">
                <TopNavbarUltra />
                
                <div className="p-6">
                    {/* Header with Stats */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                            Route Analytics Dashboard
                        </h1>
                        <p className="text-zinc-400">Real-time insights on popular stops and routes</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Total Stops</p>
                                    <p className="text-2xl font-bold text-white">{topStops.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Total Routes</p>
                                    <p className="text-2xl font-bold text-white">{mostBookedRoutes.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Total Bookings</p>
                                    <p className="text-2xl font-bold text-white">
                                        {topStops.reduce((sum, stop) => sum + stop.booking_count, 0)}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">Missing Coordinates</p>
                                    <p className="text-2xl font-bold text-orange-400">{missingCoordinates.length}</p>
                                </div>
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Missing Coordinates Warning */}
                    {missingCoordinates.length > 0 && (
                        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-yellow-400 font-semibold mb-1">Missing Map Coordinates</h3>
                                    <p className="text-sm text-zinc-400 mb-2">
                                        The following stops don't have exact map coordinates. They are currently shown at approximate locations.
                                        You can click the "Add Coordinates" button to set exact locations.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {missingCoordinates.map(name => (
                                            <button
                                                key={name}
                                                onClick={() => {
                                                    setCurrentStopForCoordinate(name);
                                                    setShowCoordinateModal(true);
                                                }}
                                                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-500/30 transition-colors"
                                            >
                                                {name} 📍
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Map Section */}
                    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-2xl mb-8 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-zinc-800">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Interactive Route Map</h2>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        {stopsWithCoords.length} stops loaded • {stopsWithCoords.filter(s => s.hasExactCoordinate).length} with exact coordinates
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-xs text-zinc-400">High Demand</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-xs text-zinc-400">Medium Demand</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-xs text-zinc-400">Low Demand</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-[600px] w-full">
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                className="h-full w-full"
                                style={{ background: "#1a1a1a" }}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                
                                {/* Route Lines */}
                                {routesWithCoords.map((route, idx) => {
                                    if (!route.coordinates || route.coordinates.length < 2) return null;
                                    const opacity = selectedRoute === route.route_name ? 1 : 0.4;
                                    const weight = selectedRoute === route.route_name ? 5 : 3;
                                    return (
                                        <Polyline
                                            key={route.route_id || idx}
                                            positions={route.coordinates}
                                            color={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : "#f59e0b"}
                                            opacity={opacity}
                                            weight={weight}
                                            dashArray={selectedRoute === route.route_name ? "0" : "5, 10"}
                                            eventHandlers={{
                                                click: () => setSelectedRoute(route.route_name),
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-black">
                                                    <p className="font-bold">{route.route_name}</p>
                                                    <p className="text-sm">{route.total_bookings} total bookings</p>
                                                </div>
                                            </Popup>
                                        </Polyline>
                                    );
                                })}
                                
                                {/* Stop Markers */}
                                {stopsWithCoords.map((stop, idx) => {
                                    if (!stop.coordinates) return null;
                                    const intensity = (stop.booking_count / maxBookings) * 100;
                                    const radius = 15 + (intensity / 100) * 25;
                                    return (
                                        <React.Fragment key={stop.stop_id || idx}>
                                            <CircleMarker
                                                center={stop.coordinates}
                                                radius={radius}
                                                fillColor={intensity >= 80 ? "#ef4444" : intensity >= 60 ? "#f97316" : intensity >= 40 ? "#eab308" : intensity >= 20 ? "#3b82f6" : "#22c55e"}
                                                color="white"
                                                weight={2}
                                                opacity={0.8}
                                                fillOpacity={0.3}
                                                eventHandlers={{
                                                    click: () => setSelectedStop(stop),
                                                }}
                                            />
                                            <Marker
                                                position={stop.coordinates}
                                                icon={getMarkerIcon(stop.booking_count, maxBookings)}
                                                eventHandlers={{
                                                    click: () => setSelectedStop(stop),
                                                }}
                                            >
                                                <Popup>
                                                    <div className="text-black min-w-[220px]">
                                                        <p className="font-bold text-lg">{stop.stop_name}</p>
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-sm">📊 <span className="font-semibold">{stop.booking_count}</span> total bookings</p>
                                                            <p className="text-sm">📈 Rank: #{idx + 1} in popularity</p>
                                                            {!stop.hasExactCoordinate && (
                                                                <p className="text-xs text-orange-500 mt-1">
                                                                    ⚠️ Approximate location. Click "Add Coordinates" to set exact location.
                                                                </p>
                                                            )}
                                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                                <div 
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${(stop.booking_count / maxBookings) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            {!stop.hasExactCoordinate && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCurrentStopForCoordinate(stop.stop_name);
                                                                        setShowCoordinateModal(true);
                                                                    }}
                                                                    className="mt-2 w-full px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
                                                                >
                                                                    Add Exact Coordinates 📍
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Popup>
                                                <Tooltip permanent={selectedStop?.stop_id === stop.stop_id}>
                                                    <span className="font-bold">{stop.booking_count}</span>
                                                </Tooltip>
                                            </Marker>
                                        </React.Fragment>
                                    );
                                })}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Analytics Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Top Booked Stops */}
                        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Top Booked Stops</h2>
                                    <p className="text-sm text-zinc-400 mt-1">Most popular pickup locations</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {loadingStops ? (
                                <SkeletonLoader />
                            ) : topStops.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-zinc-400">No stop data available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topStops.map((stop, index) => {
                                        const percentage = (stop.booking_count / maxBookings) * 100;
                                        const stopWithCoords = stopsWithCoords.find(s => s.stop_id === stop.stop_id);
                                        const hasCoords = stopWithCoords?.hasExactCoordinate;
                                        
                                        return (
                                            <div
                                                key={stop.stop_id}
                                                onClick={() => {
                                                    setSelectedStop(stop);
                                                    const coords = getStopCoordinate(stop.stop_name);
                                                    if (coords) {
                                                        setMapCenter(coords);
                                                        setMapZoom(14);
                                                    }
                                                }}
                                                className={`group relative overflow-hidden bg-zinc-800/30 border rounded-xl transition-all duration-300 cursor-pointer ${
                                                    hasCoords ? 'border-zinc-700 hover:border-zinc-600' : 'border-yellow-500/30'
                                                }`}
                                            >
                                                <div 
                                                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                                <div className="relative p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                                                                index === 0 ? "from-yellow-500 to-orange-500" :
                                                                index === 1 ? "from-gray-400 to-gray-500" :
                                                                index === 2 ? "from-orange-600 to-orange-700" :
                                                                "from-blue-500 to-purple-500"
                                                            } flex items-center justify-center text-white font-bold shadow-lg`}>
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white group-hover:text-blue-400 transition">
                                                                    {stop.stop_name}
                                                                </p>
                                                                <p className="text-xs text-zinc-400 mt-1">
                                                                    {stop.booking_count} total bookings
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-blue-400">
                                                                {stop.booking_count}
                                                            </p>
                                                            <p className="text-xs text-zinc-500">bookings</p>
                                                        </div>
                                                    </div>
                                                    {!hasCoords && (
                                                        <div className="mt-2 flex justify-end">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentStopForCoordinate(stop.stop_name);
                                                                    setShowCoordinateModal(true);
                                                                }}
                                                                className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg hover:bg-yellow-500/30 transition-colors"
                                                            >
                                                                Add Map Location 📍
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Most Booked Routes */}
                        <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Most Booked Routes</h2>
                                    <p className="text-sm text-zinc-400 mt-1">Popular journey patterns</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                            </div>

                            {loadingRoutes ? (
                                <SkeletonLoader />
                            ) : mostBookedRoutes.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-zinc-400">No route data available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {mostBookedRoutes.map((route, index) => {
                                        const maxBookingsForRoute = mostBookedRoutes[0]?.total_bookings || 1;
                                        const percentage = (route.total_bookings / maxBookingsForRoute) * 100;
                                        return (
                                            <div
                                                key={route.route_id}
                                                onClick={() => {
                                                    setSelectedRoute(route.route_name);
                                                    const routeData = routesWithCoords.find(r => r.route_id === route.route_id);
                                                    if (routeData?.coordinates && routeData.coordinates[0]) {
                                                        setMapCenter(routeData.coordinates[0]);
                                                        setMapZoom(10);
                                                    }
                                                }}
                                                className="group relative overflow-hidden bg-zinc-800/30 border border-zinc-700 rounded-xl hover:border-zinc-600 transition-all duration-300 cursor-pointer"
                                            >
                                                <div 
                                                    className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                                <div className="relative p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                                {index + 1}
                                                            </div>
                                                            <p className="font-medium text-white group-hover:text-green-400 transition">
                                                                {route.route_name}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-green-400">
                                                                {route.total_bookings}
                                                            </p>
                                                            <p className="text-xs text-zinc-500">bookings</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-zinc-700 rounded-full h-2">
                                                        <div 
                                                            className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-700"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Coordinate Entry Modal */}
            {showCoordinateModal && currentStopForCoordinate && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl max-w-md w-full border border-zinc-700 shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white">Add Map Location</h3>
                                <button
                                    onClick={() => {
                                        setShowCoordinateModal(false);
                                        setCurrentStopForCoordinate(null);
                                    }}
                                    className="text-zinc-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <p className="text-zinc-400 text-sm mb-4">
                                Enter exact coordinates for: <span className="text-white font-semibold">{currentStopForCoordinate}</span>
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={newLat}
                                        onChange={(e) => setNewLat(e.target.value)}
                                        placeholder="e.g., 22.5726"
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={newLng}
                                        onChange={(e) => setNewLng(e.target.value)}
                                        placeholder="e.g., 88.3639"
                                        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                    <p className="text-xs text-blue-400 mb-2">💡 Tips for finding coordinates:</p>
                                    <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                                        <li>Open Google Maps</li>
                                        <li>Right-click on the exact location</li>
                                        <li>Select "What's here?"</li>
                                        <li>Copy the coordinates from the bottom</li>
                                    </ul>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveCoordinate}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Save Location
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCoordinateModal(false);
                                            setCurrentStopForCoordinate(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeatMap;