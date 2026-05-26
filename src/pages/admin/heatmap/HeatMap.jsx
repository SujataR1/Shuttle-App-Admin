// import React, { useEffect, useState, useCallback } from "react";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../../assets/components/navbar/TopNavbar";
// import axios from "axios";
// import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix Leaflet icon issue
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//     iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
// });

// // Custom marker icons with colors
// const createCustomIcon = (color) => {
//     const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
//     return L.icon({
//         iconUrl: iconUrl,
//         iconSize: [25, 41],
//         iconAnchor: [12, 41],
//         popupAnchor: [1, -34],
//         shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
//         shadowSize: [41, 41],
//     });
// };

// // Local coordinate database
// const LOCAL_COORDINATES_KEY = "stop_coordinates_database";

// const getCoordinateDatabase = () => {
//     const saved = localStorage.getItem(LOCAL_COORDINATES_KEY);
//     if (saved) {
//         return JSON.parse(saved);
//     }
//     return {
//         "Salt Lake": [22.5726, 88.3639],
//         "New Town": [22.5826, 88.4839],
//         "Rajarhat": [22.6126, 88.4639],
//         "Airport": [22.6547, 88.4467],
//         "City Center": [22.5726, 88.3639],
//         "Ecospace": [22.5426, 88.3539],
//         "DLF": [22.5826, 88.4539],
//         "Technopolis": [22.5626, 88.4239],
//         "Unitech": [22.5926, 88.4439],
//         "Webel": [22.6026, 88.4339],
//         "Eco space": [22.5426, 88.3539],
//         "Ranikuthi": [22.5026, 88.3439],
//         "Jadavpur": [22.4826, 88.3639],
//         "TATA": [22.5626, 88.3839],
//         "DLF 1": [22.5826, 88.4539],
//         "DLF 2": [22.5926, 88.4639],
//     };
// };

// const saveCoordinateToDatabase = (stopName, lat, lng) => {
//     const db = getCoordinateDatabase();
//     db[stopName] = [lat, lng];
//     localStorage.setItem(LOCAL_COORDINATES_KEY, JSON.stringify(db));
// };

// const getStopCoordinate = (stopName) => {
//     const db = getCoordinateDatabase();
//     if (db[stopName]) return db[stopName];
    
//     for (const [key, coords] of Object.entries(db)) {
//         if (stopName.toLowerCase().includes(key.toLowerCase()) || 
//             key.toLowerCase().includes(stopName.toLowerCase())) {
//             return coords;
//         }
//     }
    
//     const hash = stopName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     const latOffset = (hash % 100) / 1000;
//     const lngOffset = ((hash * 13) % 100) / 1000;
//     return [22.5726 + latOffset, 88.3639 + lngOffset];
// };

// const getMarkerColor = (bookingCount, maxCount) => {
//     const intensity = (bookingCount / maxCount) * 100;
//     if (intensity >= 80) return "red";
//     if (intensity >= 60) return "orange";
//     if (intensity >= 40) return "yellow";
//     if (intensity >= 20) return "blue";
//     return "green";
// };

// const HeatMap = () => {
//     const [topStops, setTopStops] = useState([]);
//     const [mostBookedRoutes, setMostBookedRoutes] = useState([]);
//     const [stopsWithCoords, setStopsWithCoords] = useState([]);
//     const [routesWithCoords, setRoutesWithCoords] = useState([]);
//     const [loadingStops, setLoadingStops] = useState(true);
//     const [loadingRoutes, setLoadingRoutes] = useState(true);
//     const [selectedStop, setSelectedStop] = useState(null);
//     const [selectedRoute, setSelectedRoute] = useState(null);
//     const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]);
//     const [mapZoom, setMapZoom] = useState(12);
//     const [error, setError] = useState(null);
//     const [showCoordinateModal, setShowCoordinateModal] = useState(false);
//     const [currentStopForCoordinate, setCurrentStopForCoordinate] = useState(null);
//     const [newLat, setNewLat] = useState("");
//     const [newLng, setNewLng] = useState("");
//     const [missingCoordinates, setMissingCoordinates] = useState([]);
//     const [isMobile, setIsMobile] = useState(false);
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [activeTab, setActiveTab] = useState("stops");

//     const token = localStorage.getItem("access_token");

//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 1024);
//         };
//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     const fetchTopBookedStops = async () => {
//         try {
//             setLoadingStops(true);
//             const response = await axios.get(
//                 "https://be.shuttleapp.transev.site/admin/analytics/top-pickup-stops",
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const stops = response.data || [];
//             setTopStops(stops);
//             setError(null);
//             processStopCoordinates(stops);
//         } catch (err) {
//             console.error("Error fetching top stops:", err);
//             setError("Failed to load top stops data");
//             setLoadingStops(false);
//         }
//     };

//     const processStopCoordinates = (stops) => {
//         const stopsWithCoordinates = [];
//         const missingCoords = [];
        
//         for (const stop of stops) {
//             const coords = getStopCoordinate(stop.stop_name);
//             stopsWithCoordinates.push({
//                 ...stop,
//                 coordinates: coords,
//                 hasExactCoordinate: !!getCoordinateDatabase()[stop.stop_name]
//             });
            
//             if (!getCoordinateDatabase()[stop.stop_name]) {
//                 missingCoords.push(stop.stop_name);
//             }
//         }
        
//         setStopsWithCoords(stopsWithCoordinates);
//         setMissingCoordinates(missingCoords);
//         setLoadingStops(false);
//     };

//     const fetchMostBookedRoutes = async () => {
//         try {
//             setLoadingRoutes(true);
//             const response = await axios.get(
//                 "https://be.shuttleapp.transev.site/admin/analytics/most-booked-routes",
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const routes = response.data || [];
//             setMostBookedRoutes(routes);
//             setError(null);
//             processRouteCoordinates(routes);
//         } catch (err) {
//             console.error("Error fetching most booked routes:", err);
//             setError("Failed to load routes data");
//             setLoadingRoutes(false);
//         }
//     };

//     const processRouteCoordinates = (routes) => {
//         const routesWithCoordinates = [];
        
//         for (const route of routes) {
//             const routeName = route.route_name;
//             let startPoint = [22.5726, 88.3639];
//             let endPoint = [22.5826, 88.4639];
            
//             if (routeName.toLowerCase().includes("eco") && routeName.toLowerCase().includes("dlf")) {
//                 startPoint = [22.5426, 88.3539];
//                 endPoint = [22.5826, 88.4539];
//             } else if (routeName.toLowerCase().includes("eco") && routeName.toLowerCase().includes("ranikuthi")) {
//                 startPoint = [22.5426, 88.3539];
//                 endPoint = [22.5026, 88.3439];
//             } else if (routeName.toLowerCase().includes("eco") && routeName.toLowerCase().includes("tata")) {
//                 startPoint = [22.5426, 88.3539];
//                 endPoint = [22.5626, 88.3839];
//             } else {
//                 const hash = routeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//                 startPoint = [
//                     22.5726 + ((hash % 100) / 1000),
//                     88.3639 + (((hash * 7) % 100) / 1000)
//                 ];
//                 endPoint = [
//                     22.5726 + (((hash * 13) % 100) / 1000),
//                     88.3639 + (((hash * 19) % 100) / 1000)
//                 ];
//             }
            
//             routesWithCoordinates.push({
//                 ...route,
//                 coordinates: [startPoint, endPoint]
//             });
//         }
        
//         setRoutesWithCoords(routesWithCoordinates);
//         setLoadingRoutes(false);
//     };

//     const handleSaveCoordinate = () => {
//         if (!currentStopForCoordinate || !newLat || !newLng) {
//             alert("Please enter both latitude and longitude");
//             return;
//         }
        
//         const lat = parseFloat(newLat);
//         const lng = parseFloat(newLng);
        
//         if (isNaN(lat) || isNaN(lng)) {
//             alert("Please enter valid numbers for latitude and longitude");
//             return;
//         }
        
//         saveCoordinateToDatabase(currentStopForCoordinate, lat, lng);
        
//         const updatedStops = stopsWithCoords.map(stop => {
//             if (stop.stop_name === currentStopForCoordinate) {
//                 return {
//                     ...stop,
//                     coordinates: [lat, lng],
//                     hasExactCoordinate: true
//                 };
//             }
//             return stop;
//         });
        
//         setStopsWithCoords(updatedStops);
//         setMissingCoordinates(missingCoordinates.filter(name => name !== currentStopForCoordinate));
//         setShowCoordinateModal(false);
//         setCurrentStopForCoordinate(null);
//         setNewLat("");
//         setNewLng("");
//         setMapCenter([lat, lng]);
//         setMapZoom(15);
//     };

//     const maxBookings = topStops[0]?.booking_count || 1;

//     const SkeletonLoader = () => (
//         <div className="space-y-3">
//             {[1, 2, 3, 4, 5].map((i) => (
//                 <div key={i} className="animate-pulse">
//                     <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
//                             <div className="space-y-2">
//                                 <div className="h-4 bg-gray-200 rounded w-32"></div>
//                                 <div className="h-3 bg-gray-200 rounded w-24"></div>
//                             </div>
//                         </div>
//                         <div className="h-8 bg-gray-200 rounded w-20"></div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );

//     useEffect(() => {
//         fetchTopBookedStops();
//         fetchMostBookedRoutes();
//     }, [token]);

//     return (
//         <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-sans overflow-hidden">
//             <Sidebar onClose={() => setSidebarOpen(false)} />
            
//             <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${!isMobile ? 'lg:ml-72' : ''}`}>
//                 <TopNavbar 
//                     onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//                     isMobile={isMobile}
//                     title="Route Analytics"
//                 />
                
//                 <div className="flex-1 overflow-y-auto custom-scrollbar">
//                     <div className="p-6 lg:p-8 xl:p-10">
//                         {/* Elegant Header */}
//                         <div className="mb-10">
//                             <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
//                                 <div className="space-y-2">
//                                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
//                                         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
//                                         <span className="text-xs font-medium text-indigo-600 tracking-wide">LIVE ANALYTICS</span>
//                                     </div>
//                                     <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight">
//                                         Route Intelligence
//                                     </h1>
//                                     <p className="text-gray-500 text-base max-w-2xl">
//                                         Deep insights into passenger movement patterns and route popularity
//                                     </p>
//                                 </div>
//                                 <div className="flex gap-3">
//                                     <div className="backdrop-blur-md bg-white/60 rounded-2xl px-5 py-3 shadow-sm border border-white/50">
//                                         <p className="text-xs text-gray-400 uppercase tracking-wider">Last Sync</p>
//                                         <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleTimeString()}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Stats Cards */}
//                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
//                             {/* Card 1 */}
//                             <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-indigo-100">
//                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                                     <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
//                                         <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 <div className="relative">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
//                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                     <p className="text-3xl font-bold text-gray-800 mb-1">{topStops.length}</p>
//                                     <p className="text-sm text-gray-500 font-medium">Active Stops</p>
//                                     <div className="mt-3 flex items-center gap-2">
//                                         <span className="text-xs text-green-600 font-semibold">+12.5%</span>
//                                         <span className="text-xs text-gray-400">vs last period</span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             {/* Card 2 */}
//                             <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-emerald-100">
//                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                                     <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
//                                         <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 <div className="relative">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
//                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                     <p className="text-3xl font-bold text-gray-800 mb-1">{mostBookedRoutes.length}</p>
//                                     <p className="text-sm text-gray-500 font-medium">Active Routes</p>
//                                     <div className="mt-3 flex items-center gap-2">
//                                         <span className="text-xs text-green-600 font-semibold">+8.2%</span>
//                                         <span className="text-xs text-gray-400">vs last period</span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             {/* Card 3 */}
//                             <div className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-blue-100">
//                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                                     <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
//                                         <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 <div className="relative">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
//                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                     <p className="text-3xl font-bold text-gray-800 mb-1">
//                                         {topStops.reduce((sum, stop) => sum + stop.booking_count, 0).toLocaleString()}
//                                     </p>
//                                     <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
//                                     <div className="mt-3 flex items-center gap-2">
//                                         <span className="text-xs text-green-600 font-semibold">+23.7%</span>
//                                         <span className="text-xs text-gray-400">vs last period</span>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             {/* Card 4 */}
//                             <div className="group relative bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500">
//                                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                                     <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                         </svg>
//                                     </div>
//                                 </div>
//                                 <div className="relative">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
//                                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                     <p className="text-3xl font-bold text-white mb-1">{missingCoordinates.length}</p>
//                                     <p className="text-sm text-white/90 font-medium">Missing Locations</p>
//                                     <button 
//                                         onClick={() => document.getElementById('missing-coords-section')?.scrollIntoView({ behavior: 'smooth' })}
//                                         className="mt-3 text-xs text-white/80 hover:text-white transition flex items-center gap-1 group-hover:gap-2"
//                                     >
//                                         Resolve now <span>→</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Missing Coordinates Warning */}
//                         {missingCoordinates.length > 0 && (
//                             <div id="missing-coords-section" className="mb-10 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-6">
//                                 <div className="flex flex-col lg:flex-row items-start gap-5">
//                                     <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
//                                         <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                         </svg>
//                                     </div>
//                                     <div className="flex-1">
//                                         <h3 className="text-lg font-semibold text-amber-800 mb-1">Missing Map Coordinates</h3>
//                                         <p className="text-sm text-gray-600 mb-4">Add exact coordinates to improve map accuracy and visualization</p>
//                                         <div className="flex flex-wrap gap-2">
//                                             {missingCoordinates.slice(0, 12).map(name => (
//                                                 <button
//                                                     key={name}
//                                                     onClick={() => {
//                                                         setCurrentStopForCoordinate(name);
//                                                         setShowCoordinateModal(true);
//                                                     }}
//                                                     className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-amber-700 text-sm rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 border border-amber-200"
//                                                 >
//                                                     <span className="text-lg">📍</span>
//                                                     <span>{name}</span>
//                                                 </button>
//                                             ))}
//                                             {missingCoordinates.length > 12 && (
//                                                 <span className="inline-flex items-center px-4 py-2 text-gray-500 text-sm">
//                                                     +{missingCoordinates.length - 12} more
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Tab Navigation */}
//                         <div className="mb-8">
//                             <div className="flex gap-1 bg-gray-100/50 backdrop-blur-sm p-1 rounded-2xl w-fit">
//                                 <button
//                                     onClick={() => setActiveTab("stops")}
//                                     className={`px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
//                                         activeTab === "stops"
//                                             ? "bg-white text-indigo-600 shadow-md"
//                                             : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
//                                     }`}
//                                 >
//                                     <span className="flex items-center gap-2">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                         </svg>
//                                         Top Stops
//                                     </span>
//                                 </button>
//                                 <button
//                                     onClick={() => setActiveTab("routes")}
//                                     className={`px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
//                                         activeTab === "routes"
//                                             ? "bg-white text-emerald-600 shadow-md"
//                                             : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
//                                     }`}
//                                 >
//                                     <span className="flex items-center gap-2">
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                                         </svg>
//                                         Popular Routes
//                                     </span>
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Map Section */}
//                         <div className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-10 overflow-hidden">
//                             <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
//                                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                                     <div className="space-y-1">
//                                         <h2 className="text-2xl font-bold text-gray-800">Route Heatmap</h2>
//                                         <p className="text-sm text-gray-500">Visual representation of route popularity and stop density</p>
//                                     </div>
//                                     <div className="flex flex-wrap gap-3">
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200"></div>
//                                             <span className="text-xs text-gray-600">Very High</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200"></div>
//                                             <span className="text-xs text-gray-600">High</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-200"></div>
//                                             <span className="text-xs text-gray-600">Medium</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
//                                             <span className="text-xs text-gray-600">Low</span>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-200"></div>
//                                             <span className="text-xs text-gray-600">Very Low</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="h-[500px] lg:h-[600px] w-full relative">
//                                 <MapContainer
//                                     key={mapCenter.toString()}
//                                     center={mapCenter}
//                                     zoom={mapZoom}
//                                     className="h-full w-full"
//                                     style={{ background: "#fafbfc" }}
//                                     zoomControl={true}
//                                     attributionControl={true}
//                                 >
//                                     <TileLayer
//                                         url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
//                                         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
//                                     />
                                    
//                                     {routesWithCoords.map((route, idx) => {
//                                         if (!route.coordinates || route.coordinates.length < 2) return null;
//                                         const opacity = selectedRoute === route.route_name ? 1 : 0.3;
//                                         const weight = selectedRoute === route.route_name ? 5 : 2.5;
//                                         return (
//                                             <Polyline
//                                                 key={route.route_id || idx}
//                                                 positions={route.coordinates}
//                                                 color={idx === 0 ? "#6366f1" : idx === 1 ? "#10b981" : "#8b5cf6"}
//                                                 opacity={opacity}
//                                                 weight={weight}
//                                                 dashArray={selectedRoute === route.route_name ? "0" : "10, 10"}
//                                                 eventHandlers={{
//                                                     click: () => setSelectedRoute(route.route_name),
//                                                     mouseover: (e) => e.target.setStyle({ weight: 7, opacity: 0.8 }),
//                                                     mouseout: (e) => e.target.setStyle({ weight: selectedRoute === route.route_name ? 5 : 2.5, opacity: selectedRoute === route.route_name ? 1 : 0.3 })
//                                                 }}
//                                             >
//                                                 <Popup>
//                                                     <div className="text-gray-800 p-2 min-w-[200px]">
//                                                         <p className="font-bold text-base mb-2">{route.route_name}</p>
//                                                         <div className="space-y-2">
//                                                             <div className="flex justify-between items-center">
//                                                                 <span className="text-sm text-gray-600">Total Bookings:</span>
//                                                                 <span className="font-semibold text-indigo-600">{route.total_bookings.toLocaleString()}</span>
//                                                             </div>
//                                                             <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//                                                                 <div 
//                                                                     className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
//                                                                     style={{ width: `${(route.total_bookings / mostBookedRoutes[0]?.total_bookings) * 100}%` }}
//                                                                 ></div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </Popup>
//                                             </Polyline>
//                                         );
//                                     })}
                                    
//                                     {stopsWithCoords.map((stop, idx) => {
//                                         if (!stop.coordinates) return null;
//                                         const intensity = (stop.booking_count / maxBookings) * 100;
//                                         const radius = 8 + (intensity / 100) * 12;
//                                         const markerColor = getMarkerColor(stop.booking_count, maxBookings);
                                        
//                                         return (
//                                             <React.Fragment key={stop.stop_id || idx}>
//                                                 <CircleMarker
//                                                     center={stop.coordinates}
//                                                     radius={radius}
//                                                     fillColor={markerColor === "red" ? "#ef4444" : markerColor === "orange" ? "#f97316" : markerColor === "yellow" ? "#eab308" : markerColor === "blue" ? "#3b82f6" : "#22c55e"}
//                                                     color="#ffffff"
//                                                     weight={2.5}
//                                                     opacity={0.9}
//                                                     fillOpacity={0.35}
//                                                     eventHandlers={{
//                                                         click: () => setSelectedStop(stop),
//                                                         mouseover: (e) => e.target.setStyle({ radius: radius + 4, fillOpacity: 0.6 }),
//                                                         mouseout: (e) => e.target.setStyle({ radius: radius, fillOpacity: 0.35 })
//                                                     }}
//                                                 >
//                                                     <Popup>
//                                                         <div className="text-gray-800 min-w-[240px] p-2">
//                                                             <p className="font-bold text-lg mb-3">{stop.stop_name}</p>
//                                                             <div className="space-y-2.5">
//                                                                 <div className="flex justify-between items-center">
//                                                                     <span className="text-sm text-gray-600">Total Bookings:</span>
//                                                                     <span className="font-bold text-indigo-600">{stop.booking_count.toLocaleString()}</span>
//                                                                 </div>
//                                                                 <div className="flex justify-between items-center">
//                                                                     <span className="text-sm text-gray-600">Popularity Rank:</span>
//                                                                     <span className="font-bold text-gray-800">#{idx + 1}</span>
//                                                                 </div>
//                                                                 <div className="mt-2">
//                                                                     <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//                                                                         <div 
//                                                                             className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
//                                                                             style={{ width: `${(stop.booking_count / maxBookings) * 100}%` }}
//                                                                         ></div>
//                                                                     </div>
//                                                                 </div>
//                                                                 {!stop.hasExactCoordinate && (
//                                                                     <button
//                                                                         onClick={(e) => {
//                                                                             e.stopPropagation();
//                                                                             setCurrentStopForCoordinate(stop.stop_name);
//                                                                             setShowCoordinateModal(true);
//                                                                         }}
//                                                                         className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
//                                                                     >
//                                                                         📍 Add Exact Coordinates
//                                                                     </button>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     </Popup>
//                                                     <Tooltip permanent={selectedStop?.stop_id === stop.stop_id}>
//                                                         <span className="font-bold text-sm bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg border border-gray-200">
//                                                             {stop.booking_count}
//                                                         </span>
//                                                     </Tooltip>
//                                                 </CircleMarker>
//                                             </React.Fragment>
//                                         );
//                                     })}
//                                 </MapContainer>
//                             </div>
//                             <div className="p-4 bg-gray-50/80 border-t border-gray-100 text-center">
//                                 <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
//                                     <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
//                                     Interactive Map • Click markers for details • Hover routes to highlight
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Analytics Content */}
//                         {activeTab === "stops" && (
//                             <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
//                                 <div className="p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-gray-100">
//                                     <div className="flex items-center justify-between">
//                                         <div className="space-y-1">
//                                             <h2 className="text-2xl font-bold text-gray-800">Top Performing Stops</h2>
//                                             <p className="text-sm text-gray-500">Ranked by booking volume and popularity</p>
//                                         </div>
//                                         <div className="hidden lg:block w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
//                                             <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {error && (
//                                     <div className="m-6 bg-red-50 border border-red-200 rounded-xl p-4">
//                                         <p className="text-red-600 text-sm">{error}</p>
//                                     </div>
//                                 )}

//                                 <div className="p-6">
//                                     {loadingStops ? (
//                                         <SkeletonLoader />
//                                     ) : topStops.length === 0 ? (
//                                         <div className="text-center py-16">
//                                             <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                                                 <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                                 </svg>
//                                             </div>
//                                             <p className="text-gray-500 font-medium">No stop data available</p>
//                                             <p className="text-sm text-gray-400 mt-1">Check back later for insights</p>
//                                         </div>
//                                     ) : (
//                                         <div className="space-y-3">
//                                             {topStops.map((stop, index) => {
//                                                 const percentage = (stop.booking_count / maxBookings) * 100;
//                                                 const stopWithCoords = stopsWithCoords.find(s => s.stop_id === stop.stop_id);
//                                                 const hasCoords = stopWithCoords?.hasExactCoordinate;
                                                
//                                                 return (
//                                                     <div
//                                                         key={stop.stop_id}
//                                                         onClick={() => {
//                                                             setSelectedStop(stop);
//                                                             const coords = getStopCoordinate(stop.stop_name);
//                                                             if (coords) {
//                                                                 setMapCenter(coords);
//                                                                 setMapZoom(14);
//                                                             }
//                                                         }}
//                                                         className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white border rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg hover:border-indigo-200"
//                                                     >
//                                                         <div 
//                                                             className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
//                                                             style={{ width: `${percentage}%` }}
//                                                         ></div>
//                                                         <div className="relative p-5">
//                                                             <div className="flex items-center justify-between">
//                                                                 <div className="flex items-center gap-4 flex-1">
//                                                                     <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
//                                                                         index === 0 ? "from-yellow-500 to-orange-500 shadow-lg" :
//                                                                         index === 1 ? "from-gray-400 to-gray-500 shadow-md" :
//                                                                         index === 2 ? "from-orange-600 to-orange-700 shadow-md" :
//                                                                         "from-indigo-500 to-purple-500"
//                                                                     } flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
//                                                                         {index + 1}
//                                                                     </div>
//                                                                     <div className="flex-1">
//                                                                         <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition text-lg">
//                                                                             {stop.stop_name}
//                                                                         </p>
//                                                                         <div className="flex items-center gap-3 mt-1">
//                                                                             <span className="text-sm text-gray-500">{stop.booking_count.toLocaleString()} total bookings</span>
//                                                                             <span className="text-xs text-green-600 font-semibold">+{(percentage / 10).toFixed(1)}% growth</span>
//                                                                         </div>
//                                                                         <div className="mt-2 w-full max-w-md">
//                                                                             <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
//                                                                                 <div 
//                                                                                     className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-700"
//                                                                                     style={{ width: `${percentage}%` }}
//                                                                                 ></div>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                     <div className="text-right">
//                                                                         <p className="text-2xl font-bold text-indigo-600">
//                                                                             {stop.booking_count.toLocaleString()}
//                                                                         </p>
//                                                                         <p className="text-xs text-gray-400">bookings</p>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                             {!hasCoords && (
//                                                                 <div className="mt-3 flex justify-end">
//                                                                     <button
//                                                                         onClick={(e) => {
//                                                                             e.stopPropagation();
//                                                                             setCurrentStopForCoordinate(stop.stop_name);
//                                                                             setShowCoordinateModal(true);
//                                                                         }}
//                                                                         className="px-3 py-1.5 bg-amber-50 text-amber-600 text-sm rounded-xl hover:bg-amber-100 transition-all duration-200 flex items-center gap-2"
//                                                                     >
//                                                                         <span>📍</span> Add Map Location
//                                                                     </button>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === "routes" && (
//                             <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
//                                 <div className="p-6 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border-b border-gray-100">
//                                     <div className="flex items-center justify-between">
//                                         <div className="space-y-1">
//                                             <h2 className="text-2xl font-bold text-gray-800">Most Popular Routes</h2>
//                                             <p className="text-sm text-gray-500">Top performing routes by booking frequency</p>
//                                         </div>
//                                         <div className="hidden lg:block w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
//                                             <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                                             </svg>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="p-6">
//                                     {loadingRoutes ? (
//                                         <SkeletonLoader />
//                                     ) : mostBookedRoutes.length === 0 ? (
//                                         <div className="text-center py-16">
//                                             <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                                                 <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                 </svg>
//                                             </div>
//                                             <p className="text-gray-500 font-medium">No route data available</p>
//                                             <p className="text-sm text-gray-400 mt-1">Check back later for insights</p>
//                                         </div>
//                                     ) : (
//                                         <div className="space-y-4">
//                                             {mostBookedRoutes.map((route, index) => {
//                                                 const maxBookingsForRoute = mostBookedRoutes[0]?.total_bookings || 1;
//                                                 const percentage = (route.total_bookings / maxBookingsForRoute) * 100;
//                                                 return (
//                                                     <div
//                                                         key={route.route_id}
//                                                         onClick={() => {
//                                                             setSelectedRoute(route.route_name);
//                                                             const routeData = routesWithCoords.find(r => r.route_id === route.route_id);
//                                                             if (routeData?.coordinates && routeData.coordinates[0]) {
//                                                                 setMapCenter(routeData.coordinates[0]);
//                                                                 setMapZoom(11);
//                                                             }
//                                                         }}
//                                                         className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white border rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-emerald-200"
//                                                     >
//                                                         <div 
//                                                             className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
//                                                             style={{ width: `${percentage}%` }}
//                                                         ></div>
//                                                         <div className="relative p-5">
//                                                             <div className="flex items-center justify-between">
//                                                                 <div className="flex items-center gap-4 flex-1">
//                                                                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
//                                                                         {index + 1}
//                                                                     </div>
//                                                                     <div className="flex-1">
//                                                                         <p className="font-semibold text-gray-800 group-hover:text-emerald-600 transition text-lg">
//                                                                             {route.route_name}
//                                                                         </p>
//                                                                         <div className="flex items-center gap-2 mt-1">
//                                                                             <span className="text-sm text-gray-500">Route ID: {route.route_id}</span>
//                                                                             <span className="text-xs text-green-600 font-semibold">+{(percentage / 10).toFixed(1)}% demand</span>
//                                                                         </div>
//                                                                         <div className="mt-2 w-full max-w-md">
//                                                                             <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
//                                                                                 <div 
//                                                                                     className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-700"
//                                                                                     style={{ width: `${percentage}%` }}
//                                                                                 ></div>
//                                                                             </div>
//                                                                         </div>
//                                                                     </div>
//                                                                     <div className="text-right">
//                                                                         <p className="text-2xl font-bold text-emerald-600">
//                                                                             {route.total_bookings.toLocaleString()}
//                                                                         </p>
//                                                                         <p className="text-xs text-gray-400">bookings</p>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Modal - Fixed z-index */}
//             {showCoordinateModal && currentStopForCoordinate && (
//                 <div 
//                     className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
//                     onClick={(e) => {
//                         if (e.target === e.currentTarget) {
//                             setShowCoordinateModal(false);
//                             setCurrentStopForCoordinate(null);
//                         }
//                     }}
//                 >
//                     <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slideUp">
//                         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                         </svg>
//                                     </div>
//                                     <div>
//                                         <h3 className="text-xl font-semibold text-white">Add Map Location</h3>
//                                         <p className="text-white/80 text-sm mt-0.5">Set exact coordinates for accuracy</p>
//                                     </div>
//                                 </div>
//                                 <button
//                                     onClick={() => {
//                                         setShowCoordinateModal(false);
//                                         setCurrentStopForCoordinate(null);
//                                     }}
//                                     className="text-white/80 hover:text-white transition-colors"
//                                 >
//                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>
                        
//                         <div className="p-6">
//                             <p className="text-gray-600 mb-4">
//                                 Enter exact coordinates for: <span className="font-semibold text-gray-800">{currentStopForCoordinate}</span>
//                             </p>
                            
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
//                                     <input
//                                         type="text"
//                                         value={newLat}
//                                         onChange={(e) => setNewLat(e.target.value)}
//                                         placeholder="e.g., 22.5726"
//                                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all"
//                                         autoFocus
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
//                                     <input
//                                         type="text"
//                                         value={newLng}
//                                         onChange={(e) => setNewLng(e.target.value)}
//                                         placeholder="e.g., 88.3639"
//                                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all"
//                                     />
//                                 </div>
                                
//                                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
//                                     <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
//                                         <span className="text-lg">💡</span> How to find coordinates:
//                                     </p>
//                                     <ol className="text-sm text-blue-700 space-y-1.5 list-decimal list-inside">
//                                         <li>Open Google Maps on your browser</li>
//                                         <li>Right-click on the exact location</li>
//                                         <li>Select "What's here?" from the menu</li>
//                                         <li>Copy the coordinates from the bottom panel</li>
//                                     </ol>
//                                 </div>
                                
//                                 <div className="flex gap-3 pt-4">
//                                     <button
//                                         onClick={handleSaveCoordinate}
//                                         className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
//                                     >
//                                         Save Location
//                                     </button>
//                                     <button
//                                         onClick={() => {
//                                             setShowCoordinateModal(false);
//                                             setCurrentStopForCoordinate(null);
//                                         }}
//                                         className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default HeatMap;
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
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

// Custom marker icons with colors
const createCustomIcon = (color) => {
    const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        shadowSize: [41, 41],
    });
};

// Local coordinate database
const LOCAL_COORDINATES_KEY = "stop_coordinates_database";

const getCoordinateDatabase = () => {
    const saved = localStorage.getItem(LOCAL_COORDINATES_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return {
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
        "Eco space": [22.5426, 88.3539],
        "Ranikuthi": [22.5026, 88.3439],
        "Jadavpur": [22.4826, 88.3639],
        "TATA": [22.5626, 88.3839],
        "DLF 1": [22.5826, 88.4539],
        "DLF 2": [22.5926, 88.4639],
    };
};

const saveCoordinateToDatabase = (stopName, lat, lng) => {
    const db = getCoordinateDatabase();
    db[stopName] = [lat, lng];
    localStorage.setItem(LOCAL_COORDINATES_KEY, JSON.stringify(db));
};

const getStopCoordinate = (stopName) => {
    const db = getCoordinateDatabase();
    if (db[stopName]) return db[stopName];
    
    for (const [key, coords] of Object.entries(db)) {
        if (stopName.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(stopName.toLowerCase())) {
            return coords;
        }
    }
    
    const hash = stopName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = (hash % 100) / 1000;
    const lngOffset = ((hash * 13) % 100) / 1000;
    return [22.5726 + latOffset, 88.3639 + lngOffset];
};

const getMarkerColor = (bookingCount, maxCount) => {
    const intensity = (bookingCount / maxCount) * 100;
    if (intensity >= 80) return "#ef4444";
    if (intensity >= 60) return "#f97316";
    if (intensity >= 40) return "#eab308";
    if (intensity >= 20) return "#3b82f6";
    return "#22c55e";
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
    const [mapZoom, setMapZoom] = useState(12);
    const [error, setError] = useState(null);
    const [showCoordinateModal, setShowCoordinateModal] = useState(false);
    const [currentStopForCoordinate, setCurrentStopForCoordinate] = useState(null);
    const [newLat, setNewLat] = useState("");
    const [newLng, setNewLng] = useState("");
    const [missingCoordinates, setMissingCoordinates] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("stops");
    const [hoveredStop, setHoveredStop] = useState(null);

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
            processStopCoordinates(stops);
        } catch (err) {
            console.error("Error fetching top stops:", err);
            setError("Failed to load top stops data");
            setLoadingStops(false);
        }
    };

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

    const processRouteCoordinates = (routes) => {
        const routesWithCoordinates = [];
        
        for (const route of routes) {
            const routeName = route.route_name;
            let startPoint = [22.5726, 88.3639];
            let endPoint = [22.5826, 88.4639];
            
            if (routeName.toLowerCase().includes("eco") && routeName.toLowerCase().includes("dlf")) {
                startPoint = [22.5426, 88.3539];
                endPoint = [22.5826, 88.4539];
            } else if (routeName.toLowerCase().includes("eco") && routeName.toLowerCase().includes("ranikuthi")) {
                startPoint = [22.5426, 88.3539];
                endPoint = [22.5026, 88.3439];
            } else if (routeName.toLowerCase().includes("eco") && routeName.toLowerCase().includes("tata")) {
                startPoint = [22.5426, 88.3539];
                endPoint = [22.5626, 88.3839];
            } else {
                const hash = routeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                startPoint = [
                    22.5726 + ((hash % 100) / 1000),
                    88.3639 + (((hash * 7) % 100) / 1000)
                ];
                endPoint = [
                    22.5726 + (((hash * 13) % 100) / 1000),
                    88.3639 + (((hash * 19) % 100) / 1000)
                ];
            }
            
            routesWithCoordinates.push({
                ...route,
                coordinates: [startPoint, endPoint]
            });
        }
        
        setRoutesWithCoords(routesWithCoordinates);
        setLoadingRoutes(false);
    };

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
        setMissingCoordinates(missingCoordinates.filter(name => name !== currentStopForCoordinate));
        setShowCoordinateModal(false);
        setCurrentStopForCoordinate(null);
        setNewLat("");
        setNewLng("");
        setMapCenter([lat, lng]);
        setMapZoom(15);
    };

    const maxBookings = topStops[0]?.booking_count || 1;

    const SkeletonLoader = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="w-20 h-8 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    useEffect(() => {
        fetchTopBookedStops();
        fetchMostBookedRoutes();
    }, [token]);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-sans overflow-hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${!isMobile ? 'lg:ml-72' : ''}`}>
                <TopNavbar 
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                    isMobile={isMobile}
                    title="Route Analytics"
                />
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 md:p-8 lg:p-10">
                        {/* Hero Section */}
                        <div className="mb-12">
                            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Analytics Dashboard</span>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Live</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                                        Route Intelligence
                                    </h1>
                                    <p className="text-gray-500 text-lg max-w-2xl">
                                        Deep insights into passenger movement patterns and route popularity
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{topStops.length}</p>
                                <p className="text-sm text-gray-500 font-medium">Active Stops</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+8.2%</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{mostBookedRoutes.length}</p>
                                <p className="text-sm text-gray-500 font-medium">Active Routes</p>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+23.7%</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {topStops.reduce((sum, stop) => sum + stop.booking_count, 0).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">{missingCoordinates.length}</p>
                                <p className="text-sm text-white/90 font-medium">Missing Locations</p>
                                <button 
                                    onClick={() => document.getElementById('missing-coords-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="mt-3 text-xs text-white/80 hover:text-white transition flex items-center gap-1 group-hover:gap-2"
                                >
                                    Resolve now <span>→</span>
                                </button>
                            </div>
                        </div>

                        {/* Missing Coordinates Warning */}
                        {missingCoordinates.length > 0 && (
                            <div id="missing-coords-section" className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                                <div className="flex flex-col lg:flex-row items-start gap-5">
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-amber-800 mb-1">Missing Map Coordinates</h3>
                                        <p className="text-sm text-gray-600 mb-4">Add exact coordinates to improve map accuracy and visualization</p>
                                        <div className="flex flex-wrap gap-2">
                                            {missingCoordinates.slice(0, 12).map(name => (
                                                <button
                                                    key={name}
                                                    onClick={() => {
                                                        setCurrentStopForCoordinate(name);
                                                        setShowCoordinateModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 text-sm rounded-lg hover:shadow-md transition-all duration-200 border border-amber-200"
                                                >
                                                    <span>📍</span>
                                                    <span>{name}</span>
                                                </button>
                                            ))}
                                            {missingCoordinates.length > 12 && (
                                                <span className="inline-flex items-center px-4 py-2 text-gray-500 text-sm">
                                                    +{missingCoordinates.length - 12} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="mb-8">
                            <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-fit">
                                <button
                                    onClick={() => setActiveTab("stops")}
                                    className={`px-6 md:px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                        activeTab === "stops"
                                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        Top Stops
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("routes")}
                                    className={`px-6 md:px-8 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                        activeTab === "routes"
                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        Popular Routes
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-12 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Route Heatmap</h2>
                                        <p className="text-sm text-gray-500 mt-1">Visual representation of route popularity and stop density</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-xs text-gray-600">Very High</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                            <span className="text-xs text-gray-600">High</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="text-xs text-gray-600">Medium</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-xs text-gray-600">Low</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-xs text-gray-600">Very Low</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[450px] md:h-[550px] w-full relative bg-gray-50">
                                <MapContainer
                                    key={mapCenter.toString()}
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    className="h-full w-full z-0"
                                    style={{ background: "#fafbfc" }}
                                    zoomControl={true}
                                    attributionControl={true}
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    
                                    {routesWithCoords.map((route, idx) => {
                                        if (!route.coordinates || route.coordinates.length < 2) return null;
                                        const isSelected = selectedRoute === route.route_name;
                                        const opacity = isSelected ? 1 : 0.4;
                                        const weight = isSelected ? 5 : 3;
                                        const routeColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                                        const routeColor = routeColors[idx % routeColors.length];
                                        
                                        return (
                                            <Polyline
                                                key={route.route_id || idx}
                                                positions={route.coordinates}
                                                color={routeColor}
                                                opacity={opacity}
                                                weight={weight}
                                                dashArray={isSelected ? "0" : "8, 8"}
                                                eventHandlers={{
                                                    click: () => setSelectedRoute(isSelected ? null : route.route_name),
                                                    mouseover: (e) => e.target.setStyle({ weight: 7, opacity: 0.9 }),
                                                    mouseout: (e) => e.target.setStyle({ weight: isSelected ? 5 : 3, opacity: isSelected ? 1 : 0.4 })
                                                }}
                                            >
                                                <Popup>
                                                    <div className="text-gray-800 p-2 min-w-[200px]">
                                                        <p className="font-bold text-base mb-2">{route.route_name}</p>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600">Total Bookings:</span>
                                                                <span className="font-semibold text-blue-600">{route.total_bookings.toLocaleString()}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${(route.total_bookings / mostBookedRoutes[0]?.total_bookings) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Polyline>
                                        );
                                    })}
                                    
                                    {stopsWithCoords.map((stop, idx) => {
                                        if (!stop.coordinates) return null;
                                        const intensity = (stop.booking_count / maxBookings) * 100;
                                        const radius = 8 + (intensity / 100) * 12;
                                        const markerColor = getMarkerColor(stop.booking_count, maxBookings);
                                        const isHovered = hoveredStop === stop.stop_id;
                                        
                                        return (
                                            <React.Fragment key={stop.stop_id || idx}>
                                                <CircleMarker
                                                    center={stop.coordinates}
                                                    radius={isHovered ? radius + 3 : radius}
                                                    fillColor={markerColor}
                                                    color="#ffffff"
                                                    weight={2.5}
                                                    opacity={0.9}
                                                    fillOpacity={0.4}
                                                    eventHandlers={{
                                                        click: () => setSelectedStop(stop),
                                                        mouseover: (e) => {
                                                            setHoveredStop(stop.stop_id);
                                                            e.target.setStyle({ radius: radius + 4, fillOpacity: 0.7 });
                                                        },
                                                        mouseout: (e) => {
                                                            setHoveredStop(null);
                                                            e.target.setStyle({ radius: radius, fillOpacity: 0.4 });
                                                        }
                                                    }}
                                                >
                                                    <Popup>
                                                        <div className="text-gray-800 min-w-[240px] p-2">
                                                            <p className="font-bold text-lg mb-3">{stop.stop_name}</p>
                                                            <div className="space-y-2.5">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-600">Total Bookings:</span>
                                                                    <span className="font-bold text-blue-600">{stop.booking_count.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-600">Popularity Rank:</span>
                                                                    <span className="font-bold text-gray-800">#{idx + 1}</span>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                        <div 
                                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                                            style={{ width: `${(stop.booking_count / maxBookings) * 100}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                {!stop.hasExactCoordinate && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCurrentStopForCoordinate(stop.stop_name);
                                                                            setShowCoordinateModal(true);
                                                                        }}
                                                                        className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                                                                    >
                                                                        📍 Add Exact Coordinates
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Popup>
                                                    {selectedStop?.stop_id === stop.stop_id && (
                                                        <Tooltip permanent>
                                                            <div className="font-bold text-sm bg-white shadow-lg px-3 py-1.5 rounded-lg border border-gray-200">
                                                                {stop.booking_count} bookings
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                </CircleMarker>
                                            </React.Fragment>
                                        );
                                    })}
                                </MapContainer>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                    Interactive Map • Click markers for details • Hover routes to highlight
                                </p>
                            </div>
                        </div>

                        {/* Analytics Content */}
                        {activeTab === "stops" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Top Performing Stops</h2>
                                            <p className="text-sm text-gray-500 mt-1">Ranked by booking volume and popularity</p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                <div className="p-6">
                                    {loadingStops ? (
                                        <SkeletonLoader />
                                    ) : topStops.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-medium">No stop data available</p>
                                            <p className="text-sm text-gray-400 mt-1">Check back later for insights</p>
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
                                                        className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md hover:border-blue-200"
                                                    >
                                                        <div 
                                                            className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                        <div className="relative p-5">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                                                                        index === 0 ? "from-yellow-500 to-orange-500" :
                                                                        index === 1 ? "from-gray-400 to-gray-500" :
                                                                        index === 2 ? "from-orange-600 to-orange-700" :
                                                                        "from-blue-500 to-purple-500"
                                                                    } flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition text-lg">
                                                                            {stop.stop_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-3 mt-1">
                                                                            <span className="text-sm text-gray-500">{stop.booking_count.toLocaleString()} total bookings</span>
                                                                            <span className="text-xs text-green-600 font-semibold">+{(percentage / 10).toFixed(1)}% growth</span>
                                                                        </div>
                                                                        <div className="mt-2 w-full max-w-md">
                                                                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                                                <div 
                                                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-700"
                                                                                    style={{ width: `${percentage}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-2xl font-bold text-blue-600">
                                                                            {stop.booking_count.toLocaleString()}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">bookings</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {!hasCoords && (
                                                                <div className="mt-3 flex justify-end">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCurrentStopForCoordinate(stop.stop_name);
                                                                            setShowCoordinateModal(true);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-amber-50 text-amber-600 text-sm rounded-lg hover:bg-amber-100 transition-all duration-200 flex items-center gap-2"
                                                                    >
                                                                        <span>📍</span> Add Map Location
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
                            </div>
                        )}

                        {activeTab === "routes" && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Most Popular Routes</h2>
                                            <p className="text-sm text-gray-500 mt-1">Top performing routes by booking frequency</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {loadingRoutes ? (
                                        <SkeletonLoader />
                                    ) : mostBookedRoutes.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 font-medium">No route data available</p>
                                            <p className="text-sm text-gray-400 mt-1">Check back later for insights</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {mostBookedRoutes.map((route, index) => {
                                                const maxBookingsForRoute = mostBookedRoutes[0]?.total_bookings || 1;
                                                const percentage = (route.total_bookings / maxBookingsForRoute) * 100;
                                                const routeColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                                                const borderColor = routeColors[index % routeColors.length];
                                                
                                                return (
                                                    <div
                                                        key={route.route_id}
                                                        onClick={() => {
                                                            setSelectedRoute(route.route_name);
                                                            const routeData = routesWithCoords.find(r => r.route_id === route.route_id);
                                                            if (routeData?.coordinates && routeData.coordinates[0]) {
                                                                setMapCenter(routeData.coordinates[0]);
                                                                setMapZoom(11);
                                                            }
                                                        }}
                                                        className="group relative overflow-hidden bg-white border rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md"
                                                        style={{ borderLeftColor: borderColor, borderLeftWidth: '4px' }}
                                                    >
                                                        <div className="relative p-5">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition text-lg">
                                                                            {route.route_name}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-sm text-gray-500">Route ID: {route.route_id}</span>
                                                                            <span className="text-xs text-green-600 font-semibold">+{(percentage / 10).toFixed(1)}% demand</span>
                                                                        </div>
                                                                        <div className="mt-2 w-full max-w-md">
                                                                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                                                <div 
                                                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-700"
                                                                                    style={{ width: `${percentage}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-2xl font-bold text-emerald-600">
                                                                            {route.total_bookings.toLocaleString()}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400">bookings</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showCoordinateModal && currentStopForCoordinate && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCoordinateModal(false);
                            setCurrentStopForCoordinate(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slideUp">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Add Map Location</h3>
                                        <p className="text-white/80 text-sm mt-0.5">Set exact coordinates for accuracy</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCoordinateModal(false);
                                        setCurrentStopForCoordinate(null);
                                    }}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Enter exact coordinates for: <span className="font-semibold text-gray-900">{currentStopForCoordinate}</span>
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                                    <input
                                        type="text"
                                        value={newLat}
                                        onChange={(e) => setNewLat(e.target.value)}
                                        placeholder="e.g., 22.5726"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                                    <input
                                        type="text"
                                        value={newLng}
                                        onChange={(e) => setNewLng(e.target.value)}
                                        placeholder="e.g., 88.3639"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                </div>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                        <span>💡</span> How to find coordinates:
                                    </p>
                                    <ol className="text-sm text-blue-700 space-y-1.5 list-decimal list-inside">
                                        <li>Open Google Maps on your browser</li>
                                        <li>Right-click on the exact location</li>
                                        <li>Select "What's here?" from the menu</li>
                                        <li>Copy the coordinates from the bottom panel</li>
                                    </ol>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveCoordinate}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                                    >
                                        Save Location
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCoordinateModal(false);
                                            setCurrentStopForCoordinate(null);
                                        }}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
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