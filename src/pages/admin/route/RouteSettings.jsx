// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import { motion } from "framer-motion";
// import TopNavbar from "../../../assets/components/navbar/TopNavbar";

// const RouteSettings = () => {
//     const BASE_URL = "https://be.shuttleapp.transev.site/admin";
//     const token = localStorage.getItem("access_token");

//     const axiosConfig = {
//         headers: { Authorization: `Bearer ${token}` },
//     };

//     // ================= STATES =================
//     const [stops, setStops] = useState([]);
//     const [routes, setRoutes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [initialLoad, setInitialLoad] = useState(true);
//     const [showStopModal, setShowStopModal] = useState(false);
//     const [selectedRouteId, setSelectedRouteId] = useState(null);
//     const [bulkFile, setBulkFile] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showRoutesModal, setShowRoutesModal] = useState(false);
//     const [showStopsModal, setShowStopsModal] = useState(false);
//     const [fareModal, setFareModal] = useState(false);
//     const [fareRouteId, setFareRouteId] = useState(null);
//     const [fareData, setFareData] = useState([]);
//     const [isMobile, setIsMobile] = useState(false);
//     const [sidebarOpen, setSidebarOpen] = useState(false);

//     // Address autocomplete states
//     const [addressInput, setAddressInput] = useState("");
//     const [isGeocoding, setIsGeocoding] = useState(false);
//     const [addressSuggestions, setAddressSuggestions] = useState([]);

//     const [newStop, setNewStop] = useState({
//         name: "",
//         latitude: "",
//         longitude: "",
//         radius_meters: 150,
//     });
//     const [mode, setMode] = useState("");

//     const [multiStops, setMultiStops] = useState([
//         {
//             stop_id: "",
//             boarding_allowed: true,
//             deboarding_allowed: true,
//             assume_time_diff_minutes: 0,
//         },
//     ]);

//     const [newRoute, setNewRoute] = useState({
//         name: "",
//         code: "",
//         has_ac: false,
//     });

//     const [uploading, setUploading] = useState(false);
//     const [routeDetails, setRouteDetails] = useState(null);
//     const [showRouteModal, setShowRouteModal] = useState(false);

//     // Check if mobile/tablet view
//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 1024);
//         };

//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     // ================= FETCH =================
//     const getAllStops = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}/stops/all`, axiosConfig);
//             setStops(res.data);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const getAllRoutes = async () => {
//         try {
//             const res = await axios.get(`${BASE_URL}/routes/all`, axiosConfig);
//             setRoutes(res.data);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const fetchInitialData = async () => {
//         setLoading(true);
//         try {
//             await Promise.all([getAllStops(), getAllRoutes()]);
//         } catch (err) {
//             console.error("Error fetching initial data:", err);
//         } finally {
//             setLoading(false);
//             setInitialLoad(false);
//         }
//     };

//     useEffect(() => {
//         fetchInitialData();
//     }, []);

//     // ================= NEW: Popular West Bengal Locations Database =================
//     const popularWestBengalLocations = [
//         { name: "Kolkata - Howrah Bridge", lat: 22.5853, lon: 88.3469 },
//         { name: "Kolkata - Park Street", lat: 22.5525, lon: 88.3509 },
//         { name: "Kolkata - Salt Lake City Center", lat: 22.5802, lon: 88.4337 },
//         { name: "Kolkata - New Town Eco Space", lat: 22.5822, lon: 88.4856 },
//         { name: "Kolkata - Rajarhat", lat: 22.6126, lon: 88.4639 },
//         { name: "Howrah Station", lat: 22.5800, lon: 88.3427 },
//         { name: "Durgapur - City Center", lat: 23.5500, lon: 87.3200 },
//         { name: "Asansol - Station Road", lat: 23.6833, lon: 86.9833 },
//         { name: "Siliguri - Sevoke Road", lat: 26.7271, lon: 88.3952 },
//         { name: "Darjeeling - Mall Road", lat: 27.0417, lon: 88.2663 },
//         { name: "Kharagpur - IIT Campus", lat: 22.3192, lon: 87.3236 },
//         { name: "Haldia - City Center", lat: 22.0604, lon: 88.0895 },
//         { name: "Bardhaman - Station", lat: 23.2325, lon: 87.8553 },
//         { name: "Malda - English Bazar", lat: 25.0111, lon: 88.1435 },
//         { name: "Bankura - College Road", lat: 23.2324, lon: 87.0700 },
//         { name: "Purulia - Town Hall", lat: 23.3333, lon: 86.3667 },
//         { name: "Cooch Behar - Palace", lat: 26.3242, lon: 89.4486 },
//         { name: "Jalpaiguri - Main Road", lat: 26.5167, lon: 88.7333 },
//         { name: "Alipurduar - Bus Stand", lat: 26.4833, lon: 89.5667 },
//         { name: "Raiganj - College Road", lat: 25.6167, lon: 88.1167 },
//         { name: "Balurghat - Main Road", lat: 25.2167, lon: 88.7667 },
//         { name: "Kalyani - Central Park", lat: 22.9756, lon: 88.4344 },
//         { name: "Barasat - Bus Stand", lat: 22.7200, lon: 88.4800 },
//         { name: "Madhyamgram - Station", lat: 22.7000, lon: 88.4500 },
//         { name: "Barrackpore - Cantonment", lat: 22.7600, lon: 88.3700 },
//         { name: "Serampore - Station", lat: 22.7500, lon: 88.3422 },
//         { name: "Chandannagar - Strand", lat: 22.8667, lon: 88.3833 },
//         { name: "Bally - Station Road", lat: 22.6500, lon: 88.3400 },
//         { name: "Uluberia - Town", lat: 22.4700, lon: 88.1100 },
//         { name: "Tamluk - District Center", lat: 22.3000, lon: 87.9200 },
//         { name: "Contai - Main Road", lat: 21.7800, lon: 87.7500 },
//         { name: "Medinipur - Town", lat: 22.4300, lon: 87.3200 },
//     ];

//     // ================= NEW: Search local database function =================
//     const searchLocalLocations = (query) => {
//         if (!query || query.length < 2) return [];

//         const lowerQuery = query.toLowerCase();
//         return popularWestBengalLocations.filter(loc => 
//             loc.name.toLowerCase().includes(lowerQuery)
//         );
//     };

//     // ================= UPDATED: Address search function for West Bengal =================
//     const searchAddress = async (query) => {
//         if (!query || query.length < 3) {
//             setAddressSuggestions([]);
//             return;
//         }

//         setIsGeocoding(true);
//         try {
//             const response = await fetch(
//                 `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=15&addressdetails=1&countrycodes=in&bounded=1&viewbox=85.75,27.22,89.88,21.25`,
//                 {
//                     headers: {
//                         'User-Agent': 'ShuttleBusAdmin/1.0'
//                     }
//                 }
//             );
//             const data = await response.json();

//             // Filter results to only include West Bengal locations
//             const westBengalData = data.filter(location => {
//                 const displayName = location.display_name.toLowerCase();
//                 const address = location.address || {};
//                 const state = address.state?.toLowerCase() || "";
//                 const city = address.city?.toLowerCase() || "";
//                 const town = address.town?.toLowerCase() || "";
//                 const village = address.village?.toLowerCase() || "";

//                 return state.includes("west bengal") || 
//                        state.includes("westbengal") ||
//                        displayName.includes("west bengal") ||
//                        displayName.includes("kolkata") ||
//                        displayName.includes("calcutta") ||
//                        city.includes("kolkata") ||
//                        city.includes("howrah") ||
//                        city.includes("durgapur") ||
//                        city.includes("asansol") ||
//                        city.includes("siliguri") ||
//                        city.includes("darjeeling") ||
//                        city.includes("malda") ||
//                        city.includes("bardhaman") ||
//                        city.includes("kharagpur") ||
//                        city.includes("haldia") ||
//                        city.includes("bankura") ||
//                        city.includes("purulia") ||
//                        city.includes("cooch behar") ||
//                        city.includes("jalpaiguri") ||
//                        city.includes("alipurduar") ||
//                        city.includes("raiganj") ||
//                        city.includes("balurghat") ||
//                        city.includes("kalyani") ||
//                        city.includes("barasat") ||
//                        city.includes("madhyamgram") ||
//                        city.includes("barrackpore") ||
//                        city.includes("north 24 parganas") ||
//                        city.includes("south 24 parganas") ||
//                        city.includes("nadia") ||
//                        city.includes("murshidabad") ||
//                        city.includes("birbhum") ||
//                        city.includes("hooghly");
//             });

//             if (westBengalData.length === 0 && data.length > 0) {
//                 const limitedData = data.slice(0, 5);
//                 setAddressSuggestions(limitedData);
//             } else {
//                 setAddressSuggestions(westBengalData);
//             }
//         } catch (error) {
//             console.error("Geocoding error:", error);
//             setAddressSuggestions([]);
//         } finally {
//             setIsGeocoding(false);
//         }
//     };

//     // ================= UPDATED: Select address with local support =================
//     const selectAddress = (suggestion, isLocal = false) => {
//         if (isLocal) {
//             setNewStop({
//                 ...newStop,
//                 name: suggestion.name,
//                 latitude: suggestion.lat,
//                 longitude: suggestion.lon,
//             });
//             setAddressInput(suggestion.name);
//         } else {
//             setNewStop({
//                 ...newStop,
//                 name: suggestion.display_name.split(',')[0],
//                 latitude: parseFloat(suggestion.lat),
//                 longitude: parseFloat(suggestion.lon),
//             });
//             setAddressInput(suggestion.display_name);
//         }
//         setAddressSuggestions([]);
//     };

//     useEffect(() => {
//         if (!addressInput.trim()) {
//             setAddressSuggestions([]);
//         }
//     }, [addressInput]);

//     // ================= UPDATED: Search local database first, then online =================
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (addressInput && addressInput.length >= 2) {
//                 const localResults = searchLocalLocations(addressInput);
//                 if (localResults.length > 0) {
//                     setAddressSuggestions(localResults.map(loc => ({ ...loc, isLocal: true })));
//                 } else {
//                     searchAddress(addressInput);
//                 }
//             }
//         }, 500);
//         return () => clearTimeout(timer);
//     }, [addressInput]);

//     if (initialLoad || loading) {
//         return (
//             <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//                 <Sidebar onClose={() => setSidebarOpen(false)} />
//                 <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//                     <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Route Settings" />
//                     <div className="flex-1 flex items-center justify-center">
//                         <div className="text-center">
//                             <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-gray-800 mb-3"></div>
//                             <p className="text-gray-600 font-medium text-sm sm:text-base">Loading route settings...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const getRouteDetails = async (route_id) => {
//         try {
//             const res = await axios.get(
//                 `${BASE_URL}/routes/${route_id}`,
//                 axiosConfig
//             );
//             return res.data;
//         } catch (err) {
//             console.error(err);
//             return null;
//         }
//     };

//     const openRouteDetails = async (route_id) => {
//         setLoading(true);
//         try {
//             const data = await getRouteDetails(route_id);
//             if (data) {
//                 setRouteDetails(data);
//                 setShowRouteModal(true);
//             } else {
//                 alert("Failed to load route details");
//             }
//         } catch (err) {
//             console.error("Error opening route details:", err);
//             alert("Failed to load route details");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ================= STOP APIs =================
//     const addSingleStop = async () => {
//         if (!newStop.name.trim()) {
//             alert("Please enter a stop name");
//             return;
//         }
//         if (!newStop.latitude || isNaN(parseFloat(newStop.latitude))) {
//             alert("Please enter a valid latitude");
//             return;
//         }
//         if (!newStop.longitude || isNaN(parseFloat(newStop.longitude))) {
//             alert("Please enter a valid longitude");
//             return;
//         }

//         try {
//             const res = await axios.post(
//                 `${BASE_URL}/stops/add-single`,
//                 {
//                     name: newStop.name,
//                     latitude: parseFloat(newStop.latitude),
//                     longitude: parseFloat(newStop.longitude),
//                     radius_meters: parseInt(newStop.radius_meters),
//                 },
//                 axiosConfig
//             );
//             alert(res.data.message);
//             setNewStop({ name: "", latitude: "", longitude: "", radius_meters: 150 });
//             setAddressInput("");
//             await getAllStops();
//         } catch (err) {
//             console.error(err);
//             alert(err.response?.data?.detail?.[0]?.msg || "Error adding stop");
//         }
//     };

//     const uploadBulkStops = async () => {
//         if (!bulkFile) {
//             return alert("Please select a file");
//         }

//         const formData = new FormData();
//         formData.append("file", bulkFile);

//         try {
//             setUploading(true);
//             const res = await axios.post(
//                 `${BASE_URL}/stops/bulk-upload`,
//                 formData,
//                 {
//                     headers: {
//                         ...axiosConfig.headers,
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );
//             alert(`Uploaded ${res.data.imported} stops`);
//             setBulkFile(null);
//             await getAllStops();
//         } catch (err) {
//             console.error(err);
//             alert("Bulk upload failed");
//         } finally {
//             setUploading(false);
//         }
//     };

//     const deleteStop = async (stop_id) => {
//         if (!window.confirm("Delete this stop?")) return;
//         try {
//             await axios.delete(`${BASE_URL}/stops/${stop_id}`, axiosConfig);
//             await getAllStops();
//         } catch {
//             alert("Error deleting stop");
//         }
//     };

//     const createMultipleStops = async () => {
//         if (isSubmitting) return;
//         setIsSubmitting(true);

//         try {
//             const cleanedStops = multiStops
//                 .filter((s) => s.stop_id)
//                 .map((s, index) => ({
//                     stop_id: s.stop_id,
//                     boarding_allowed: s.boarding_allowed,
//                     deboarding_allowed: s.deboarding_allowed,
//                     assume_time_diff_minutes: index === 0 ? 0 : parseInt(s.assume_time_diff_minutes) || 0,
//                     sequence_no: index + 1,
//                 }));

//             await axios.post(
//                 `${BASE_URL}/routes/${selectedRouteId}/stops`,
//                 { stops: cleanedStops },
//                 axiosConfig
//             );

//             alert("Stops Added Successfully!");
//             setShowStopModal(false);
//             setShowRoutesModal(true);
//             setMultiStops([
//                 {
//                     stop_id: "",
//                     boarding_allowed: true,
//                     deboarding_allowed: true,
//                     assume_time_diff_minutes: 0,
//                 },
//             ]);
//             await getAllRoutes();
//         } catch (err) {
//             console.error(err.response?.data || err);
//             alert(err.response?.data?.detail || "Error adding stops");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // ================= ROUTE APIs =================
//     const createRoute = async () => {
//         if (!newRoute.name || !newRoute.code) {
//             return alert("Enter route details");
//         }

//         try {
//             const res = await axios.post(
//                 `${BASE_URL}/routes/create`,
//                 {
//                     name: newRoute.name,
//                     code: newRoute.code,
//                     has_ac: newRoute.has_ac,
//                 },
//                 axiosConfig
//             );

//             const routeId = res.data?.data?.route_id;
//             if (!routeId) {
//                 return alert("Route created but ID missing");
//             }

//             setSelectedRouteId(routeId);
//             alert("Route Created! Now add stops.");
//             setShowStopModal(true);
//             setMode("multiple");
//             setNewRoute({ name: "", code: "", has_ac: false });
//             await getAllRoutes();
//         } catch (err) {
//             console.error(err.response?.data || err);
//             alert("Error creating route");
//         }
//     };

//     const toggleRoute = async (route_id, current) => {
//         try {
//             await axios.patch(
//                 `${BASE_URL}/routes/${route_id}/toggle`,
//                 { is_active: !current },
//                 axiosConfig
//             );
//             await getAllRoutes();
//         } catch {
//             alert("Toggle failed");
//         }
//     };

//     // ================= FARE APIs =================
//     const getFaresForRoute = async (route_id) => {
//         try {
//             setFareRouteId(route_id);
//             setFareModal(true);
//             setFareData([]);

//             const routeDetailsRes = await axios.get(`${BASE_URL}/routes/${route_id}`, axiosConfig);
//             const routeStops = routeDetailsRes.data?.path || [];
//             const sortedStops = [...routeStops].sort((a, b) => a.sequence_no - b.sequence_no);
//             const validStopIds = new Set(sortedStops.map(stop => stop.stop_id));

//             setRouteDetails(routeDetailsRes.data);

//             const faresRes = await axios.get(`${BASE_URL}/routes/${route_id}/fares`, axiosConfig);
//             const existingFares = faresRes.data || [];

//             const validExistingFares = existingFares.filter(fare =>
//                 validStopIds.has(fare.pickup_stop_id) && validStopIds.has(fare.dropoff_stop_id)
//             );

//             if (sortedStops.length > 1) {
//                 let generatedFares = [];

//                 const calculateTimeDiff = (fromSeq, toSeq, stopsArray) => {
//                     let totalTime = 0;
//                     for (let i = fromSeq + 1; i <= toSeq; i++) {
//                         const currentStop = stopsArray.find(s => s.sequence_no === i);
//                         if (currentStop && currentStop.time_diff_min) {
//                             totalTime += currentStop.time_diff_min;
//                         }
//                     }
//                     return totalTime;
//                 };

//                 for (let i = 0; i < sortedStops.length; i++) {
//                     const pickupStop = sortedStops[i];

//                     for (let j = i + 1; j < sortedStops.length; j++) {
//                         const dropoffStop = sortedStops[j];

//                         const timeDiff = calculateTimeDiff(pickupStop.sequence_no, dropoffStop.sequence_no, sortedStops);

//                         const existingFare = validExistingFares.find(fare =>
//                             fare.pickup_stop_id === pickupStop.stop_id &&
//                             fare.dropoff_stop_id === dropoffStop.stop_id
//                         );

//                         const isConsecutive = (j === i + 1);
//                         const isFullRoute = (i === 0 && j === sortedStops.length - 1);

//                         if (existingFare) {
//                             generatedFares.push({
//                                 pickup_stop_id: existingFare.pickup_stop_id,
//                                 dropoff_stop_id: existingFare.dropoff_stop_id,
//                                 from: pickupStop.stop_name,
//                                 to: dropoffStop.stop_name,
//                                 amount: existingFare.amount || 0,
//                                 is_active: existingFare.is_active !== undefined ? existingFare.is_active : true,
//                                 time_diff_min: timeDiff,
//                                 from_sequence: pickupStop.sequence_no,
//                                 to_sequence: dropoffStop.sequence_no,
//                                 is_consecutive: isConsecutive,
//                                 is_full_route: isFullRoute,
//                             });
//                         } else {
//                             generatedFares.push({
//                                 pickup_stop_id: pickupStop.stop_id,
//                                 dropoff_stop_id: dropoffStop.stop_id,
//                                 from: pickupStop.stop_name,
//                                 to: dropoffStop.stop_name,
//                                 amount: 0,
//                                 is_active: true,
//                                 time_diff_min: timeDiff,
//                                 from_sequence: pickupStop.sequence_no,
//                                 to_sequence: dropoffStop.sequence_no,
//                                 is_consecutive: isConsecutive,
//                                 is_full_route: isFullRoute,
//                             });
//                         }
//                     }
//                 }

//                 setFareData(generatedFares);
//             } else {
//                 setFareData([]);
//             }
//         } catch (err) {
//             console.error("Error fetching fares:", err.response?.data || err);
//             setFareData([]);
//             alert("Could not fetch fares. You can still add new fares below.");
//         }
//     };

//     const handleManageFare = async () => {
//         if (!fareRouteId) return alert("No route selected");

//         const validFares = fareData.filter(f => f.amount > 0);
//         if (validFares.length === 0) {
//             alert("Please add at least one fare amount greater than 0");
//             return;
//         }

//         try {
//             const payload = validFares.map(f => ({
//                 pickup_stop_id: f.pickup_stop_id,
//                 dropoff_stop_id: f.dropoff_stop_id,
//                 amount: Number(f.amount),
//             }));

//             const res = await axios.post(
//                 `${BASE_URL}/routes/fares/bulk-set`,
//                 { route_id: fareRouteId, fares: payload },
//                 axiosConfig
//             );

//             if (res.data.status === "success") {
//                 alert(`Success! Updated: ${res.data.updated_rules || 0}, New: ${res.data.newrules || 0}`);
//                 setFareModal(false);
//                 await getAllRoutes();
//             } else {
//                 alert("Failed to update fares");
//             }
//         } catch (err) {
//             console.error(err.response?.data || err);
//             alert(err.response?.data?.detail || err.response?.data?.message || "Failed to update fares");
//         }
//     };

//     // ================= UI =================
//     return (
//         <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
//             <Sidebar onClose={() => setSidebarOpen(false)} />

//             <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//                 <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Route Settings" />

//                 <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
//                     <div className="mb-4 sm:mb-6 md:mb-8">
//                         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent mb-1 sm:mb-2">Route & Stop Settings</h2>
//                         <p className="text-xs sm:text-sm text-gray-500">Configure routes, manage stops, and set fare rules</p>

//                         {/* Progress Steps - Responsive */}
//                         <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-4 sm:p-6 md:p-8 mt-4 sm:mt-6 shadow-lg border border-gray-100/50 backdrop-blur-sm overflow-x-auto">
//                             <div className="relative mb-6 sm:mb-8 md:mb-10 min-w-[600px] sm:min-w-0">
//                                 <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
//                                     <motion.div
//                                         className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
//                                         initial={{ width: "0%" }}
//                                         animate={{
//                                             width: `${(stops.length > 0 ? 33 : 0) +
//                                                 (routes.length > 0 ? 33 : 0) +
//                                                 (selectedRouteId && multiStops.some(s => s.stop_id) ? 34 : 0)
//                                                 }%`
//                                         }}
//                                         transition={{ duration: 0.5, ease: "easeInOut" }}
//                                     />
//                                 </div>

//                                 <div className="relative flex justify-between">
//                                     {/* Step 1 */}
//                                     <motion.div
//                                         className="flex flex-col items-center group cursor-pointer"
//                                         whileHover={{ scale: 1.05 }}
//                                         transition={{ type: "spring", stiffness: 300 }}
//                                         onClick={() => document.getElementById('stops-section')?.scrollIntoView({ behavior: 'smooth' })}
//                                     >
//                                         <motion.div
//                                             className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${stops.length > 0
//                                                 ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
//                                                 : 'bg-white border-2 border-gray-200 text-gray-400 shadow-md'
//                                                 }`}
//                                             animate={{
//                                                 scale: stops.length > 0 ? [1, 1.05, 1] : 1,
//                                             }}
//                                             transition={{ duration: 0.3 }}
//                                         >
//                                             {stops.length > 0 ? (
//                                                 <motion.svg
//                                                     initial={{ scale: 0 }}
//                                                     animate={{ scale: 1 }}
//                                                     className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//                                                 </motion.svg>
//                                             ) : (
//                                                 <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
//                                                 </svg>
//                                             )}
//                                         </motion.div>

//                                         <div className="text-center mt-2 sm:mt-3">
//                                             <p className={`text-xs sm:text-sm font-bold ${stops.length > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
//                                                 Add Stops
//                                             </p>
//                                             <p className="hidden sm:block text-[10px] sm:text-xs text-gray-400 mt-0.5">Manual or JSON upload</p>
//                                             {stops.length > 0 && (
//                                                 <motion.p
//                                                     initial={{ opacity: 0, y: -10 }}
//                                                     animate={{ opacity: 1, y: 0 }}
//                                                     className="text-[10px] sm:text-xs font-medium text-emerald-500 mt-1"
//                                                 >
//                                                     ✓ {stops.length} stop{stops.length !== 1 ? 's' : ''} added
//                                                 </motion.p>
//                                             )}
//                                         </div>
//                                     </motion.div>

//                                     {/* Animated Connecting Line */}
//                                     <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
//                                         <div className="relative w-full">
//                                             <div className="absolute inset-0 flex items-center">
//                                                 <div className="w-full border-t-2 border-dashed border-gray-200"></div>
//                                             </div>
//                                             <div className="absolute inset-0 flex items-center justify-between px-2">
//                                                 {[...Array(4)].map((_, i) => (
//                                                     <motion.div
//                                                         key={i}
//                                                         className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${stops.length > 0 ? 'bg-emerald-400' : 'bg-gray-300'}`}
//                                                         animate={{
//                                                             scale: stops.length > 0 ? [1, 1.5, 1] : 1,
//                                                         }}
//                                                         transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
//                                                     />
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Step 2 */}
//                                     <motion.div
//                                         className="flex flex-col items-center group cursor-pointer"
//                                         whileHover={{ scale: 1.05 }}
//                                         transition={{ type: "spring", stiffness: 300 }}
//                                         onClick={() => document.getElementById('create-route-section')?.scrollIntoView({ behavior: 'smooth' })}
//                                     >
//                                         <motion.div
//                                             className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${routes.length > 0
//                                                 ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
//                                                 : 'bg-white border-2 border-gray-200 text-gray-400 shadow-md'
//                                                 }`}
//                                             animate={{
//                                                 scale: routes.length > 0 ? [1, 1.05, 1] : 1,
//                                             }}
//                                             transition={{ duration: 0.3 }}
//                                         >
//                                             {routes.length > 0 ? (
//                                                 <motion.svg
//                                                     initial={{ scale: 0 }}
//                                                     animate={{ scale: 1 }}
//                                                     className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//                                                 </motion.svg>
//                                             ) : (
//                                                 <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                                                 </svg>
//                                             )}
//                                         </motion.div>

//                                         <div className="text-center mt-2 sm:mt-3">
//                                             <p className={`text-xs sm:text-sm font-bold ${routes.length > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
//                                                 Create Route
//                                             </p>
//                                             <p className="hidden sm:block text-[10px] sm:text-xs text-gray-400 mt-0.5">Name & code</p>
//                                             {routes.length > 0 && (
//                                                 <motion.p
//                                                     initial={{ opacity: 0, y: -10 }}
//                                                     animate={{ opacity: 1, y: 0 }}
//                                                     className="text-[10px] sm:text-xs font-medium text-emerald-500 mt-1"
//                                                 >
//                                                     ✓ {routes.length} route{routes.length !== 1 ? 's' : ''} created
//                                                 </motion.p>
//                                             )}
//                                         </div>
//                                     </motion.div>

//                                     {/* Animated Connecting Line */}
//                                     <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
//                                         <div className="relative w-full">
//                                             <div className="absolute inset-0 flex items-center">
//                                                 <div className="w-full border-t-2 border-dashed border-gray-200"></div>
//                                             </div>
//                                             <div className="absolute inset-0 flex items-center justify-between px-2">
//                                                 {[...Array(4)].map((_, i) => (
//                                                     <motion.div
//                                                         key={i}
//                                                         className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${routes.length > 0 && selectedRouteId ? 'bg-emerald-400' : 'bg-gray-300'}`}
//                                                         animate={{
//                                                             scale: routes.length > 0 && selectedRouteId ? [1, 1.5, 1] : 1,
//                                                         }}
//                                                         transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
//                                                     />
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Step 3 */}
//                                     <motion.div
//                                         className="flex flex-col items-center group cursor-pointer"
//                                         whileHover={{ scale: 1.05 }}
//                                         transition={{ type: "spring", stiffness: 300 }}
//                                         onClick={() => document.getElementById('assign-stops-section')?.scrollIntoView({ behavior: 'smooth' })}
//                                     >
//                                         <motion.div
//                                             className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${selectedRouteId && multiStops.some(s => s.stop_id)
//                                                 ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
//                                                 : 'bg-white border-2 border-gray-200 text-gray-400 shadow-md'
//                                                 }`}
//                                             animate={{
//                                                 scale: selectedRouteId && multiStops.some(s => s.stop_id) ? [1, 1.05, 1] : 1,
//                                             }}
//                                             transition={{ duration: 0.3 }}
//                                         >
//                                             {selectedRouteId && multiStops.some(s => s.stop_id) ? (
//                                                 <motion.svg
//                                                     initial={{ scale: 0 }}
//                                                     animate={{ scale: 1 }}
//                                                     className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//                                                 </motion.svg>
//                                             ) : (
//                                                 <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                                                 </svg>
//                                             )}
//                                         </motion.div>

//                                         <div className="text-center mt-2 sm:mt-3">
//                                             <p className={`text-xs sm:text-sm font-bold ${selectedRouteId && multiStops.some(s => s.stop_id) ? 'text-emerald-600' : 'text-gray-600'}`}>
//                                                 Assign Stops
//                                             </p>
//                                             <p className="hidden sm:block text-[10px] sm:text-xs text-gray-400 mt-0.5">Map stops to route</p>
//                                             {selectedRouteId && multiStops.some(s => s.stop_id) && (
//                                                 <motion.p
//                                                     initial={{ opacity: 0, y: -10 }}
//                                                     animate={{ opacity: 1, y: 0 }}
//                                                     className="text-[10px] sm:text-xs font-medium text-emerald-500 mt-1"
//                                                 >
//                                                     ✓ Stops assigned
//                                                 </motion.p>
//                                             )}
//                                         </div>
//                                     </motion.div>
//                                 </div>
//                             </div>

//                             {/* Completion Celebration Message */}
//                             {stops.length > 0 && routes.length > 0 && selectedRouteId && multiStops.some(s => s.stop_id) && (
//                                 <motion.div
//                                     initial={{ opacity: 0, y: 20, scale: 0.9 }}
//                                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                                     className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 text-center"
//                                 >
//                                     <div className="flex items-center justify-center gap-2 sm:gap-3">
//                                         <motion.div
//                                             animate={{ rotate: 360 }}
//                                             transition={{ duration: 0.5 }}
//                                             className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
//                                         >
//                                             <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//                                             </svg>
//                                         </motion.div>
//                                         <div>
//                                             <p className="text-xs sm:text-sm font-semibold text-emerald-800">🎉 All steps completed!</p>
//                                             <p className="text-[10px] sm:text-xs text-emerald-600">Your route is ready to go live</p>
//                                         </div>
//                                     </div>
//                                 </motion.div>
//                             )}
//                         </div>
//                     </div>

//                     {/* ================= CREATE STOPS ================= */}
//                     <div id="stops-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6 hover:shadow-md transition-shadow duration-300">
//                         <div className="mb-4 sm:mb-6">
//                             <h3 className="text-lg sm:text-xl font-semibold text-gray-700">📍 Stops Setup</h3>
//                             <p className="text-xs sm:text-sm text-gray-500 mt-1">Add stops manually or upload them in bulk</p>
//                         </div>

//                         <div className="mb-6 sm:mb-8">
//                             <p className="text-sm font-medium text-gray-700 mb-3">Add Single Stop</p>

//                             {/* Address Search Input */}
//                             <div className="relative mb-3">
//                                 <input
//                                     placeholder="🔍 Search for a location in West Bengal (e.g., Kolkata, Howrah, Durgapur, Siliguri, Darjeeling)..."
//                                     value={addressInput}
//                                     onChange={(e) => {
//                                         const value = e.target.value;
//                                         setAddressInput(value);
//                                         if (!value.trim()) {
//                                             setAddressSuggestions([]);
//                                         }
//                                     }}
//                                     className="w-full border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                                 />
//                                 {isGeocoding && (
//                                     <div className="absolute right-3 top-2 sm:top-3">
//                                         <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-gray-600"></div>
//                                     </div>
//                                 )}

//                                 {/* Suggestions Dropdown */}
//                                 {addressSuggestions.length > 0 && (
//                                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
//                                         {addressSuggestions.map((suggestion, idx) => (
//                                             <div
//                                                 key={idx}
//                                                 onClick={() => selectAddress(suggestion, suggestion.isLocal)}
//                                                 className="px-3 sm:px-4 py-2 hover:bg-gray-50 cursor-pointer transition border-b border-gray-100 last:border-0"
//                                             >
//                                                 <p className="text-xs sm:text-sm text-gray-800">
//                                                     {suggestion.isLocal ? suggestion.name : suggestion.display_name.split(',')[0]}
//                                                 </p>
//                                                 <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
//                                                     📍 Lat: {parseFloat(suggestion.isLocal ? suggestion.lat : suggestion.lat).toFixed(4)}, 
//                                                     Lng: {parseFloat(suggestion.isLocal ? suggestion.lon : suggestion.lon).toFixed(4)}
//                                                     {!suggestion.isLocal && suggestion.address?.state && ` • ${suggestion.address.state}`}
//                                                 </p>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>

//                             <p className="text-[10px] sm:text-xs text-gray-400 mb-3">— OR enter manually below —</p>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
//                                 <input
//                                     placeholder="Stop Name"
//                                     value={newStop.name}
//                                     onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
//                                     className="border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                                 />
//                                 <input
//                                     placeholder="Latitude"
//                                     type="number"
//                                     step="any"
//                                     value={newStop.latitude}
//                                     onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })}
//                                     className="border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                                 />
//                                 <input
//                                     placeholder="Longitude"
//                                     type="number"
//                                     step="any"
//                                     value={newStop.longitude}
//                                     onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })}
//                                     className="border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                                 />
//                                 <input
//                                     placeholder="Radius (meters)"
//                                     type="number"
//                                     value={newStop.radius_meters}
//                                     onChange={(e) => setNewStop({ ...newStop, radius_meters: parseInt(e.target.value) || 0 })}
//                                     className="border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                                 />
//                                 <button
//                                     onClick={addSingleStop}
//                                     className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 transition-all text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg"
//                                 >
//                                     + Add Stop
//                                 </button>
//                             </div>

//                             <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
//                                 💡 Tip: Start typing any location name in West Bengal (Kolkata, Howrah, Durgapur, Siliguri, Darjeeling, etc.) to auto-fill coordinates
//                             </p>

//                             {/* Quick Add Popular Locations */}
//                             <div className="mt-4">
//                                 <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Quick add popular locations:</p>
//                                 <div className="flex flex-wrap gap-1.5 sm:gap-2">
//                                     {["Kolkata - Park Street", "Kolkata - Howrah Station", "Kolkata - New Town Eco Space", "Kolkata - Salt Lake", "Durgapur - City Center", "Siliguri - Sevoke Road", "Darjeeling - Mall Road"].map((loc) => {
//                                         const found = popularWestBengalLocations.find(l => l.name.includes(loc));
//                                         if (found) {
//                                             return (
//                                                 <button
//                                                     key={loc}
//                                                     onClick={() => {
//                                                         setNewStop({
//                                                             ...newStop,
//                                                             name: found.name,
//                                                             latitude: found.lat,
//                                                             longitude: found.lon,
//                                                         });
//                                                         setAddressInput(found.name);
//                                                     }}
//                                                     className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
//                                                 >
//                                                     {loc}
//                                                 </button>
//                                             );
//                                         }
//                                         return null;
//                                     })}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex items-center my-4 sm:my-6">
//                             <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//                             <span className="mx-2 sm:mx-4 text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">Or upload in bulk</span>
//                             <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
//                         </div>

//                         <div>
//                             <p className="text-sm font-medium text-gray-700 mb-3">Bulk Upload (JSONL)</p>
//                             <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
//                                 <input
//                                     type="file"
//                                     accept=".jsonl"
//                                     onChange={(e) => setBulkFile(e.target.files[0])}
//                                     className="border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50/50 file:mr-3 file:px-2 sm:file:px-3 file:py-1 sm:file:py-1.5 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-gray-600 file:text-white hover:file:bg-gray-700"
//                                 />
//                                 <button
//                                     onClick={uploadBulkStops}
//                                     className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg"
//                                 >
//                                     {uploading ? "Uploading..." : "Upload File"}
//                                 </button>
//                             </div>
//                             <p className="text-[10px] sm:text-xs text-gray-400 mt-3">JSONL format: name, latitude, longitude</p>
//                         </div>
//                     </div>

//                     {/* ================= CREATE ROUTE ================= */}
//                     <div id="create-route-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6 hover:shadow-md transition-shadow duration-300">
//                         <div className="mb-3 sm:mb-4">
//                             <h3 className="text-lg sm:text-xl font-semibold text-gray-700">🛣️ Create Route</h3>
//                             <p className="text-xs sm:text-sm text-gray-500 mt-1">Enter route name and code</p>
//                         </div>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
//                             <input
//                                 type="text"
//                                 placeholder="Route Name"
//                                 value={newRoute.name}
//                                 onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
//                                 className="border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                             />
//                             <input
//                                 type="text"
//                                 placeholder="Route Code"
//                                 value={newRoute.code}
//                                 onChange={(e) => setNewRoute({ ...newRoute, code: e.target.value })}
//                                 className="border border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 placeholder-gray-400 transition-all bg-gray-50/50"
//                             />
//                             <div className="flex items-center gap-3">
//                                 <label className="text-xs sm:text-sm font-medium text-gray-700">Has AC:</label>
//                                 <button
//                                     type="button"
//                                     onClick={() => setNewRoute({ ...newRoute, has_ac: !newRoute.has_ac })}
//                                     className={`relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${newRoute.has_ac ? 'bg-blue-600' : 'bg-gray-300'}`}
//                                 >
//                                     <span
//                                         className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-all duration-300 ${newRoute.has_ac ? 'translate-x-6' : 'translate-x-1'}`}
//                                     />
//                                 </button>
//                                 <span className={`text-xs sm:text-sm font-medium ${newRoute.has_ac ? 'text-blue-600' : 'text-gray-500'}`}>
//                                     {newRoute.has_ac ? 'Yes (AC)' : 'No (Non-AC)'}
//                                 </span>
//                             </div>
//                             <button
//                                 onClick={createRoute}
//                                 className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 transition-all text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg"
//                             >
//                                 + Create Route
//                             </button>
//                         </div>
//                     </div>

//                     {/* Buttons */}
//                     <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
//                         <button
//                             onClick={() => setShowRoutesModal(true)}
//                             className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-600 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-md"
//                         >
//                             All Routes
//                         </button>
//                         <button
//                             onClick={() => setShowStopsModal(true)}
//                             className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-600 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-md"
//                         >
//                             All Stops
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* ================= ALL ROUTES MODAL ================= */}
//             {showRoutesModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
//                     <div className="bg-white rounded-2xl w-[95%] sm:w-[90%] max-w-6xl max-h-[85vh] overflow-y-auto shadow-2xl">
//                         <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <div>
//                                 <h3 className="text-lg sm:text-xl font-bold text-gray-800">All Routes</h3>
//                                 <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Manage and control all routes</p>
//                             </div>
//                             <button onClick={() => setShowRoutesModal(false)} className="text-gray-400 hover:text-gray-600 transition-all text-xl sm:text-2xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
//                         </div>
//                         <div className="p-4 sm:p-6">
//                             <div className="overflow-x-auto">
//                                 <table className="min-w-[800px] lg:min-w-full w-full text-xs sm:text-sm">
//                                     <thead>
//                                         <tr className="text-left text-gray-500 border-b border-gray-100">
//                                             <th className="py-2 sm:py-3 font-semibold">Name</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Code</th>
//                                             <th className="py-2 sm:py-3 font-semibold">AC</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Stops</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Status</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Add Stops</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Action</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Fares</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {routes.map((r) => (
//                                             <tr key={r.route_id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
//                                                 <td className="py-2 sm:py-3 text-gray-700 font-medium cursor-pointer hover:text-gray-900 transition-colors text-xs sm:text-sm" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td>
//                                                 <td className="py-2 sm:py-3 text-gray-600 text-xs sm:text-sm">{r.code}</td>
//                                                 <td className="py-2 sm:py-3">
//                                                     <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${r.has_ac ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
//                                                         {r.has_ac ? '✓ Yes' : '✗ No'}
//                                                     </span>
//                                                 </td>
//                                                 <td className="py-2 sm:py-3 text-gray-600 text-xs sm:text-sm">{r.total_stops}</td>
//                                                 <td className="py-2 sm:py-3">
//                                                     <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${r.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
//                                                         {r.is_active ? "Active" : "Inactive"}
//                                                     </span>
//                                                 </td>
//                                                 <td className="py-2 sm:py-3">
//                                                     <button onClick={() => { setSelectedRouteId(r.route_id); setShowStopModal(true); setMode("multiple"); }} className="text-emerald-600 hover:text-emerald-700 font-medium text-[10px] sm:text-xs bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all hover:shadow-sm">+ Add</button>
//                                                 </td>
//                                                 <td className="py-2 sm:py-3">
//                                                     <button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 hover:text-indigo-700 font-medium text-[10px] sm:text-xs bg-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all hover:shadow-sm">Toggle</button>
//                                                 </td>
//                                                 <td className="py-2 sm:py-3">
//                                                     <button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 hover:text-amber-700 font-medium text-[10px] sm:text-xs bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all hover:shadow-sm">Manage Fares</button>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ================= ROUTE DETAILS MODAL ================= */}
//             {showRouteModal && routeDetails && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
//                     <div className="bg-white rounded-2xl w-[95%] max-w-[1200px] max-h-[85vh] overflow-y-auto shadow-2xl">
//                         <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <div>
//                                 <h3 className="text-lg sm:text-2xl font-bold text-gray-800">{routeDetails.name}</h3>
//                                 <div className="flex gap-2 sm:gap-4 mt-1 flex-wrap">
//                                     <span className="text-[10px] sm:text-xs text-gray-500">Code: {routeDetails.code}</span>
//                                     <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${routeDetails.has_ac ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
//                                         {routeDetails.has_ac ? '❄️ AC Available' : '🌡️ Non-AC'}
//                                     </span>
//                                     <span className={`text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full ${routeDetails.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
//                                         {routeDetails.is_active ? "Active" : "Inactive"}
//                                     </span>
//                                 </div>
//                             </div>
//                             <button onClick={() => setShowRouteModal(false)} className="text-gray-400 hover:text-gray-600 transition-all text-xl sm:text-2xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
//                         </div>
//                         <div className="p-4 sm:p-6">
//                             <h4 className="font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">🗺️ Route Map</h4>
//                             {/* Rest of route details content - keeping original but with responsive adjustments */}
//                             {!routeDetails.path || routeDetails.path.length === 0 ? (
//                                 <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">No stops added to this route yet.</p>
//                             ) : (
//                                 <>
//                                     <div className="relative flex items-center overflow-x-auto py-4 sm:py-6 space-x-6 sm:space-x-12 border-b border-gray-100 mb-4 sm:mb-6">
//                                         {routeDetails.path.map((stop, index) => (
//                                             <div key={index} className="relative flex flex-col items-center group min-w-[100px] sm:min-w-[120px]">
//                                                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold shadow-md z-10 text-sm">
//                                                     {stop.sequence_no}
//                                                 </div>
//                                                 {index !== routeDetails.path.length - 1 && (
//                                                     <svg className="absolute top-4 left-full w-10 sm:w-16 h-6 sm:h-8" viewBox="0 0 64 32" fill="none">
//                                                         <path d="M0,16 C16,0 48,0 64,16" stroke="#D1D5DB" strokeWidth="2" />
//                                                         <polygon points="64,16 60,12 60,20" fill="#9CA3AF" />
//                                                     </svg>
//                                                 )}
//                                                 <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 bg-gray-800 text-white shadow-xl rounded-lg p-2 text-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
//                                                     <p className="font-semibold truncate">{stop.stop_name || "Unknown Stop"}</p>
//                                                     <p className="text-gray-300 text-[8px] mt-1">Lat: {stop.latitude || "N/A"}, Lng: {stop.longitude || "N/A"}</p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     <h4 className="font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">📋 Stops Timeline</h4>
//                                     <div className="relative ml-3 sm:ml-4 space-y-3 sm:space-y-4 border-l-2 border-gray-200 mb-4 sm:mb-6">
//                                         {routeDetails.path.map((stop, index) => (
//                                             <div key={index} className="relative pl-5 sm:pl-6">
//                                                 <span className="absolute -left-[7px] sm:-left-[9px] top-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 ring-4 ring-white shadow-sm"></span>
//                                                 <div className="bg-gray-50 p-3 sm:p-4 rounded-xl hover:shadow-md transition-all duration-200">
//                                                     <p className="font-semibold text-gray-800 text-sm">#{stop.sequence_no} - {stop.stop_name || "Unknown Stop"}</p>
//                                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
//                                                         <p className="text-gray-500">Stop ID: <span className="text-gray-700 font-mono text-[10px]">{stop.stop_id || "N/A"}</span></p>
//                                                         <p className="text-gray-500">Lat: {stop.latitude || "N/A"}, Lng: {stop.longitude || "N/A"}</p>
//                                                         <p className="text-gray-500">Boarding: <span className="font-medium text-gray-700">{stop.boarding ? "Yes" : "No"}</span></p>
//                                                         <p className="text-gray-500">Deboarding: <span className="font-medium text-gray-700">{stop.deboarding ? "Yes" : "No"}</span></p>
//                                                         <p className="text-gray-500">Time Diff: <span className="font-medium text-gray-700">{stop.time_diff_min ?? 0} min</span></p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                         <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
//                             <button onClick={() => setShowRouteModal(false)} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm">Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ================= ALL STOPS MODAL ================= */}
//             {showStopsModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
//                     <div className="bg-white rounded-2xl w-[95%] sm:w-[90%] max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl">
//                         <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <div>
//                                 <h3 className="text-lg sm:text-xl font-bold text-gray-800">All Stops</h3>
//                                 <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">View and manage stop locations</p>
//                             </div>
//                             <button onClick={() => setShowStopsModal(false)} className="text-gray-400 hover:text-gray-600 transition-all text-xl sm:text-2xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
//                         </div>
//                         <div className="p-4 sm:p-6">
//                             <div className="overflow-x-auto">
//                                 <table className="min-w-[500px] lg:min-w-full w-full text-xs sm:text-sm">
//                                     <thead>
//                                         <tr className="text-left text-gray-500 border-b border-gray-100">
//                                             <th className="py-2 sm:py-3 font-semibold">Name</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Latitude</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Longitude</th>
//                                             <th className="py-2 sm:py-3 font-semibold">Action</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {stops.map((s) => (
//                                             <tr key={s.stop_id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
//                                                 <td className="py-2 sm:py-3 text-gray-700 font-medium text-xs sm:text-sm">{s.name}</td>
//                                                 <td className="py-2 sm:py-3 text-gray-500 text-[10px] sm:text-xs font-mono">{parseFloat(s.latitude).toFixed(6)}</td>
//                                                 <td className="py-2 sm:py-3 text-gray-500 text-[10px] sm:text-xs font-mono">{parseFloat(s.longitude).toFixed(6)}</td>
//                                                 <td className="py-2 sm:py-3">
//                                                     <button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-[10px] sm:text-xs font-medium bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all hover:shadow-sm">Delete</button>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ================= ADD STOP MODAL ================= */}
//             {showStopModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
//                     <div className="bg-white rounded-2xl w-[95%] max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
//                         <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-800">Add Stops to Route</h3>
//                             <button onClick={() => setShowStopModal(false)} className="text-gray-400 hover:text-gray-600 transition-all text-xl sm:text-2xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
//                         </div>
//                         <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
//                             {multiStops.map((s, i) => (
//                                 <div key={i} className="relative border border-gray-100 rounded-xl p-3 sm:p-4 bg-gray-50/30 hover:shadow-md transition-all">
//                                     <div className="absolute -left-2 top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-md">{i + 1}</div>
//                                     <div className="pl-6 sm:pl-8 space-y-2 sm:space-y-3">
//                                         <div className="flex flex-col">
//                                             <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Select Stop</label>
//                                             <select
//                                                 value={s.stop_id}
//                                                 onChange={(e) => { const updated = [...multiStops]; updated[i].stop_id = e.target.value; setMultiStops(updated); }}
//                                                 className="border border-gray-200 p-2 rounded-xl w-full focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all bg-white text-gray-700 text-xs sm:text-sm"
//                                             >
//                                                 <option value="">Select Stop</option>
//                                                 {stops.map((stop) => (<option key={stop.stop_id} value={stop.stop_id}>{stop.name}</option>))}
//                                             </select>
//                                         </div>
//                                         <div className="flex flex-col">
//                                             <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-1">Time Difference (minutes)</label>
//                                             <input
//                                                 placeholder="Enter time difference"
//                                                 type="number"
//                                                 value={s.assume_time_diff_minutes}
//                                                 onChange={(e) => { const updated = [...multiStops]; updated[i].assume_time_diff_minutes = e.target.value; setMultiStops(updated); }}
//                                                 className="border border-gray-200 p-2 rounded-xl w-full focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all bg-white text-gray-700 text-xs sm:text-sm"
//                                             />
//                                         </div>
//                                         <div className="flex flex-wrap gap-3 sm:gap-6">
//                                             <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
//                                                 <input type="checkbox" checked={s.boarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].boarding_allowed = e.target.checked; setMultiStops(updated); }} className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500" /> Boarding Allowed
//                                             </label>
//                                             <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 cursor-pointer">
//                                                 <input type="checkbox" checked={s.deboarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].deboarding_allowed = e.target.checked; setMultiStops(updated); }} className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500" /> Deboarding Allowed
//                                             </label>
//                                         </div>
//                                         {multiStops.length > 1 && (
//                                             <button onClick={() => { const updated = multiStops.filter((_, idx) => idx !== i); setMultiStops(updated); }} className="text-red-500 text-xs sm:text-sm hover:text-red-600 transition-colors">Remove Stop</button>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between gap-3">
//                             <button onClick={() => setMultiStops([...multiStops, { stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }])} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium text-xs sm:text-sm">+ Add Another Stop</button>
//                             <button onClick={createMultipleStops} disabled={isSubmitting} className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl hover:from-gray-900 hover:to-gray-800 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 text-xs sm:text-sm">{isSubmitting ? "Saving..." : "Save Stops"}</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ================= FARE MODAL ================= */}
//             {fareModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
//                     <div className="bg-white rounded-2xl w-[95%] max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl">
//                         <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-800">Manage Fares</h3>
//                             <button onClick={() => setFareModal(false)} className="text-gray-400 hover:text-gray-600 transition-all text-xl sm:text-2xl w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
//                         </div>
//                         <div className="p-4 sm:p-6">
//                             {fareData.length === 0 ? (
//                                 <div className="text-center py-8 sm:py-12">
//                                     <p className="text-gray-500 mb-2 text-sm">No stops configured for this route yet.</p>
//                                     <p className="text-xs text-gray-400">Add stops to the route first to create fare rules.</p>
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
//                                         <p className="text-[10px] sm:text-xs text-blue-700">
//                                             <strong>Note:</strong> Fares marked with amount 0 need to be configured.
//                                         </p>
//                                     </div>
//                                     <div className="overflow-x-auto">
//                                         <table className="min-w-[600px] lg:min-w-full w-full text-xs sm:text-sm">
//                                             <thead>
//                                                 <tr className="text-left text-gray-500 border-b border-gray-100">
//                                                     <th className="py-2 sm:py-3 px-2 sm:px-3 font-semibold">From</th>
//                                                     <th className="py-2 sm:py-3 px-2 sm:px-3 font-semibold">To</th>
//                                                     <th className="py-2 sm:py-3 px-2 sm:px-3 font-semibold">Distance</th>
//                                                     <th className="py-2 sm:py-3 px-2 sm:px-3 font-semibold">Amount (₹)</th>
//                                                     <th className="py-2 sm:py-3 px-2 sm:px-3 font-semibold">Status</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {fareData.map((f, idx) => {
//                                                     let timeDisplay = "";
//                                                     const totalMinutes = f.time_diff_min || 0;

//                                                     if (totalMinutes > 0) {
//                                                         const hours = Math.floor(totalMinutes / 60);
//                                                         const minutes = totalMinutes % 60;
//                                                         if (hours > 0) {
//                                                             timeDisplay = `${hours}h ${minutes}m`;
//                                                         } else {
//                                                             timeDisplay = `${minutes} min`;
//                                                         }
//                                                     } else {
//                                                         timeDisplay = "0 min";
//                                                     }

//                                                     return (
//                                                         <tr key={idx} className={`border-b border-gray-50 hover:bg-gray-50 transition-all ${f.is_full_route ? 'bg-purple-50/30' : f.is_consecutive ? 'bg-blue-50/30' : 'bg-white'}`}>
//                                                             <td className="py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm">
//                                                                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
//                                                                     <span className="text-gray-700 font-medium">{f.from}</span>
//                                                                     {f.is_full_route && (
//                                                                         <span className="text-[8px] sm:text-xs bg-purple-100 text-purple-700 px-1 sm:px-2 py-0.5 rounded-full font-medium">Full Route</span>
//                                                                     )}
//                                                                 </div>
//                                                             </td>
//                                                             <td className="py-2 sm:py-3 px-2 sm:px-3 text-gray-700 text-xs sm:text-sm">{f.to}</td>
//                                                             <td className="py-2 sm:py-3 px-2 sm:px-3">
//                                                                 <span className={`inline-flex items-center px-1 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-xs font-medium ${totalMinutes > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
//                                                                     {timeDisplay}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="py-2 sm:py-3 px-2 sm:px-3">
//                                                                 <input
//                                                                     type="number"
//                                                                     value={f.amount}
//                                                                     onChange={(e) => {
//                                                                         const updated = [...fareData];
//                                                                         updated[idx].amount = parseFloat(e.target.value);
//                                                                         setFareData(updated);
//                                                                     }}
//                                                                     className={`border px-2 sm:px-3 py-1 rounded-xl w-24 sm:w-28 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none text-xs sm:text-sm ${f.amount === 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
//                                                                     min="0"
//                                                                     step="0.01"
//                                                                 />
//                                                                 {f.amount === 0 && (
//                                                                     <p className="text-[8px] sm:text-xs text-red-500 mt-1">Required</p>
//                                                                 )}
//                                                             </td>
//                                                             <td className="py-2 sm:py-3 px-2 sm:px-3">
//                                                                 <div className="flex items-center gap-1 sm:gap-2">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         checked={f.is_active}
//                                                                         onChange={(e) => {
//                                                                             const updated = [...fareData];
//                                                                             updated[idx].is_active = e.target.checked;
//                                                                             setFareData(updated);
//                                                                         }}
//                                                                         className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-gray-800 focus:ring-gray-500"
//                                                                     />
//                                                                     <span className="text-[10px] sm:text-xs text-gray-500">
//                                                                         {f.is_active ? 'Active' : 'Inactive'}
//                                                                     </span>
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     );
//                                                 })}
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
//                                         <div className="flex justify-between text-[10px] sm:text-sm">
//                                             <span className="text-gray-600">Total fare rules:</span>
//                                             <span className="font-semibold text-gray-800">{fareData.length}</span>
//                                         </div>
//                                         <div className="flex justify-between text-[10px] sm:text-sm mt-1">
//                                             <span className="text-gray-600">Configured fares:</span>
//                                             <span className="font-semibold text-green-600">{fareData.filter(f => f.amount > 0).length}</span>
//                                         </div>
//                                         <div className="flex justify-between text-[10px] sm:text-sm mt-1">
//                                             <span className="text-gray-600">Missing fares:</span>
//                                             <span className="font-semibold text-red-600">{fareData.filter(f => f.amount === 0).length}</span>
//                                         </div>
//                                     </div>

//                                     <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
//                                         <button onClick={() => setFareModal(false)} className="px-3 sm:px-5 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-xs sm:text-sm">Cancel</button>
//                                         <button onClick={handleManageFare} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all font-medium shadow-md hover:shadow-lg text-xs sm:text-sm">Save Fares</button>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default RouteSettings;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import { motion } from "framer-motion";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import {
    MapPinIcon,
    PlusIcon,
    DocumentDuplicateIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    EyeIcon,
    CurrencyRupeeIcon,
    RocketLaunchIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const RouteSettings = () => {
    const BASE_URL = "https://be.shuttleapp.transev.site/admin";
    const token = localStorage.getItem("access_token");

    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` },
    };

    // ================= STATES =================
    const [stops, setStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [showStopModal, setShowStopModal] = useState(false);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [bulkFile, setBulkFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRoutesModal, setShowRoutesModal] = useState(false);
    const [showStopsModal, setShowStopsModal] = useState(false);
    const [fareModal, setFareModal] = useState(false);
    const [fareRouteId, setFareRouteId] = useState(null);
    const [fareData, setFareData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("stops");
    const [completedSteps, setCompletedSteps] = useState({
        step1: false,
        step2: false,
        step3: false
    });
    const [editingFareId, setEditingFareId] = useState(null);
    const [tempFareAmount, setTempFareAmount] = useState("");

    // Address autocomplete states
    const [addressInput, setAddressInput] = useState("");
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);

    const [newStop, setNewStop] = useState({
        name: "",
        latitude: "",
        longitude: "",
        radius_meters: 150,
    });

    const [multiStops, setMultiStops] = useState([
        {
            stop_id: "",
            boarding_allowed: true,
            deboarding_allowed: true,
            assume_time_diff_minutes: 0,
        },
    ]);

    const [newRoute, setNewRoute] = useState({
        name: "",
        code: "",
        has_ac: false,
    });

    const [uploading, setUploading] = useState(false);
    const [routeDetails, setRouteDetails] = useState(null);
    const [showRouteModal, setShowRouteModal] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setCompletedSteps({
            step1: stops.length > 0,
            step2: routes.length > 0,
            step3: selectedRouteId && multiStops.some(s => s.stop_id)
        });
    }, [stops, routes, selectedRouteId, multiStops]);

    const getAllStops = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/stops/all`, axiosConfig);
            setStops(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getAllRoutes = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/routes/all`, axiosConfig);
            setRoutes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([getAllStops(), getAllRoutes()]);
        } catch (err) {
            console.error("Error fetching initial data:", err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (showRoutesModal || showStopsModal || fareModal || showStopModal || showRouteModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showRoutesModal, showStopsModal, fareModal, showStopModal, showRouteModal]);

    const searchAddress = async (query) => {
        if (!query || query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        setIsGeocoding(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&countrycodes=in`,
                { headers: { 'User-Agent': 'ShuttleBusAdmin/1.0' } }
            );
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (error) {
            console.error("Geocoding error:", error);
            setAddressSuggestions([]);
        } finally {
            setIsGeocoding(false);
        }
    };

    const selectAddress = (suggestion) => {
        setNewStop({
            ...newStop,
            name: suggestion.display_name.split(',')[0],
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon),
        });
        setAddressInput(suggestion.display_name);
        setAddressSuggestions([]);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (addressInput && addressInput.length >= 3) {
                searchAddress(addressInput);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [addressInput]);

    if (initialLoad || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Sidebar onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64">
                    <TopNavbar sidebarOpen={sidebarOpen} />
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
                            <p className="text-gray-500">Loading route settings...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getRouteDetails = async (route_id) => {
        try {
            const res = await axios.get(`${BASE_URL}/routes/${route_id}`, axiosConfig);
            return res.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const openRouteDetails = async (route_id) => {
        setLoading(true);
        try {
            const data = await getRouteDetails(route_id);
            if (data) {
                setRouteDetails(data);
                setShowRouteModal(true);
            }
        } catch (err) {
            console.error("Error opening route details:", err);
        } finally {
            setLoading(false);
        }
    };

    const addSingleStop = async () => {
        if (!newStop.name.trim()) {
            alert("Please enter a stop name");
            return;
        }
        if (!newStop.latitude || isNaN(parseFloat(newStop.latitude))) {
            alert("Please enter a valid latitude");
            return;
        }
        if (!newStop.longitude || isNaN(parseFloat(newStop.longitude))) {
            alert("Please enter a valid longitude");
            return;
        }

        try {
            await axios.post(
                `${BASE_URL}/stops/add-single`,
                {
                    name: newStop.name,
                    latitude: parseFloat(newStop.latitude),
                    longitude: parseFloat(newStop.longitude),
                    radius_meters: parseInt(newStop.radius_meters),
                },
                axiosConfig
            );
            alert("Stop added successfully!");
            setNewStop({ name: "", latitude: "", longitude: "", radius_meters: 150 });
            setAddressInput("");
            await getAllStops();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail?.[0]?.msg || "Error adding stop");
        }
    };

    const uploadBulkStops = async () => {
        if (!bulkFile) return alert("Please select a file");

        const formData = new FormData();
        formData.append("file", bulkFile);

        try {
            setUploading(true);
            const res = await axios.post(`${BASE_URL}/stops/bulk-upload`, formData, {
                headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" },
            });
            alert(`Uploaded ${res.data.imported} stops`);
            setBulkFile(null);
            await getAllStops();
        } catch (err) {
            console.error(err);
            alert("Bulk upload failed");
        } finally {
            setUploading(false);
        }
    };

    const deleteStop = async (stop_id) => {
        if (!window.confirm("Delete this stop?")) return;
        try {
            await axios.delete(`${BASE_URL}/stops/${stop_id}`, axiosConfig);
            await getAllStops();
        } catch {
            alert("Error deleting stop");
        }
    };

    const createMultipleStops = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const cleanedStops = multiStops
                .filter((s) => s.stop_id)
                .map((s, index) => ({
                    stop_id: s.stop_id,
                    boarding_allowed: s.boarding_allowed,
                    deboarding_allowed: s.deboarding_allowed,
                    assume_time_diff_minutes: index === 0 ? 0 : parseInt(s.assume_time_diff_minutes) || 0,
                    sequence_no: index + 1,
                }));

            await axios.post(`${BASE_URL}/routes/${selectedRouteId}/stops`, { stops: cleanedStops }, axiosConfig);

            alert("Stops Added Successfully!");
            setShowStopModal(false);
            setShowRoutesModal(true);
            setMultiStops([{ stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }]);
            await getAllRoutes();
        } catch (err) {
            console.error(err.response?.data || err);
            alert(err.response?.data?.detail || "Error adding stops");
        } finally {
            setIsSubmitting(false);
        }
    };

    const createRoute = async () => {
        if (!newRoute.name || !newRoute.code) return alert("Enter route details");

        try {
            const res = await axios.post(`${BASE_URL}/routes/create`, {
                name: newRoute.name,
                code: newRoute.code,
                has_ac: newRoute.has_ac,
            }, axiosConfig);

            const routeId = res.data?.data?.route_id;
            if (!routeId) return alert("Route created but ID missing");

            setSelectedRouteId(routeId);
            alert("Route Created! Now add stops.");
            setShowStopModal(true);
            setMultiStops([{ stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }]);
            setNewRoute({ name: "", code: "", has_ac: false });
            await getAllRoutes();
        } catch (err) {
            console.error(err.response?.data || err);
            alert("Error creating route");
        }
    };

    const toggleRoute = async (route_id, current) => {
        try {
            await axios.patch(`${BASE_URL}/routes/${route_id}/toggle`, { is_active: !current }, axiosConfig);
            await getAllRoutes();
        } catch {
            alert("Toggle failed");
        }
    };

    const getFaresForRoute = async (route_id) => {
        try {
            setFareRouteId(route_id);
            setFareModal(true);
            setFareData([]);
            setEditingFareId(null);
            setTempFareAmount("");

            const routeDetailsRes = await axios.get(`${BASE_URL}/routes/${route_id}`, axiosConfig);
            const routeStops = routeDetailsRes.data?.path || [];
            const sortedStops = [...routeStops].sort((a, b) => a.sequence_no - b.sequence_no);

            const faresRes = await axios.get(`${BASE_URL}/routes/${route_id}/fares`, axiosConfig);
            const existingFares = faresRes.data || [];

            if (sortedStops.length > 1) {
                let generatedFares = [];

                for (let i = 0; i < sortedStops.length; i++) {
                    const pickupStop = sortedStops[i];
                    for (let j = i + 1; j < sortedStops.length; j++) {
                        const dropoffStop = sortedStops[j];
                        const existingFare = existingFares.find(fare =>
                            fare.pickup_stop_id === pickupStop.stop_id && fare.dropoff_stop_id === dropoffStop.stop_id
                        );

                        if (existingFare) {
                            generatedFares.push({
                                id: `${pickupStop.stop_id}-${dropoffStop.stop_id}`,
                                pickup_stop_id: existingFare.pickup_stop_id,
                                dropoff_stop_id: existingFare.dropoff_stop_id,
                                from: pickupStop.stop_name,
                                to: dropoffStop.stop_name,
                                amount: existingFare.amount || 0,
                                is_active: existingFare.is_active !== undefined ? existingFare.is_active : true,
                            });
                        } else {
                            generatedFares.push({
                                id: `${pickupStop.stop_id}-${dropoffStop.stop_id}`,
                                pickup_stop_id: pickupStop.stop_id,
                                dropoff_stop_id: dropoffStop.stop_id,
                                from: pickupStop.stop_name,
                                to: dropoffStop.stop_name,
                                amount: 0,
                                is_active: true,
                            });
                        }
                    }
                }
                setFareData(generatedFares);
            }
        } catch (err) {
            console.error("Error fetching fares:", err);
        }
    };

    const handleManageFare = async () => {
        if (!fareRouteId) return alert("No route selected");

        const validFares = fareData.filter(f => f.amount > 0);
        if (validFares.length === 0) {
            alert("Please add at least one fare amount greater than 0");
            return;
        }

        try {
            const payload = validFares.map(f => ({
                pickup_stop_id: f.pickup_stop_id,
                dropoff_stop_id: f.dropoff_stop_id,
                amount: f.amount,
            }));

            await axios.post(`${BASE_URL}/routes/fares/bulk-set`, { route_id: fareRouteId, fares: payload }, axiosConfig);
            alert("Fares updated successfully!");
            setFareModal(false);
            await getAllRoutes();
        } catch (err) {
            console.error(err);
            alert("Failed to update fares");
        }
    };

    const startEditingFare = (idx, currentAmount) => {
        setEditingFareId(idx);
        setTempFareAmount(currentAmount === 0 ? "" : currentAmount.toString());
    };

    const saveFareAmount = (idx) => {
        const amount = parseInt(tempFareAmount, 10);
        const finalAmount = isNaN(amount) ? 0 : amount;
        const updated = [...fareData];
        updated[idx].amount = finalAmount;
        setFareData(updated);
        setEditingFareId(null);
        setTempFareAmount("");
    };

    const cancelEditing = () => {
        setEditingFareId(null);
        setTempFareAmount("");
    };

    const StepIndicator = ({ number, title, description, isCompleted, isActive, onClick }) => {
        return (
            <motion.div
                className={`flex-1 relative cursor-pointer ${isActive ? 'z-10' : ''}`}
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
            >
                <div className="flex flex-col items-center">
                    <motion.div
                        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isCompleted
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                            : isActive
                                ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white ring-4 ring-gray-300'
                                : 'bg-white border-2 border-gray-200 text-gray-400'
                            }`}
                        animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isCompleted ? <CheckCircleIcon className="w-7 h-7" /> : <span className="text-xl font-bold">{number}</span>}
                    </motion.div>
                    <p className={`text-sm font-bold mt-3 ${isActive ? 'text-gray-900' : isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 text-center max-w-[140px]">{description}</p>
                    {isCompleted && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-medium text-emerald-500 mt-1">
                            ✓ Complete
                        </motion.p>
                    )}
                </div>
                {number < 3 && (
                    <div className="absolute top-7 left-full w-full h-0.5 bg-gray-200 -z-10">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            initial={{ width: "0%" }}
                            animate={{ width: isCompleted ? "100%" : "0%" }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                )}
            </motion.div>
        );
    };

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                        {children}
                    </div>
                </motion.div>
            </div>
        );
    };

    // Calculate stats for fare modal
    const totalConfigured = fareData.filter(f => f.amount > 0).length;
    const totalFares = fareData.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Sidebar onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64">
                <TopNavbar sidebarOpen={sidebarOpen} />

                <main className="pt-20 p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                                    <RocketLaunchIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900">Route & Stop Configuration</h1>
                                    <p className="text-gray-500 text-sm mt-0.5">Set up your bus routes, stops, and fare rules in 3 simple steps</p>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Steps */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-gray-600">Setup Workflow</span>
                                </div>
                                {completedSteps.step1 && completedSteps.step2 && completedSteps.step3 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-medium text-emerald-700">All steps completed!</span>
                                    </motion.div>
                                )}
                            </div>
                            <div className="relative flex justify-between items-start">
                                <StepIndicator number={1} title="Create Stops" description="Add bus stops with location coordinates" isCompleted={completedSteps.step1} isActive={activeTab === "stops"} onClick={() => setActiveTab("stops")} />
                                <StepIndicator number={2} title="Create Route" description="Define route name and AC status" isCompleted={completedSteps.step2} isActive={activeTab === "routes"} onClick={() => setActiveTab("routes")} />
                                <StepIndicator number={3} title="Assign Stops & Fares" description="Map stops to route and set prices" isCompleted={completedSteps.step3} isActive={false} onClick={() => { if (routes.length > 0) setShowRoutesModal(true); else alert("Please create a route first"); }} />
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-xs text-gray-500 mb-2">
                                    <span>Step 1: Stops</span>
                                    <span>Step 2: Route</span>
                                    <span>Step 3: Assign & Fares</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${(Object.values(completedSteps).filter(v => v === true).length / 3) * 100}%` }} transition={{ duration: 0.5 }} />
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-gray-500 text-sm font-medium">Total Stops Created</p><p className="text-3xl font-bold text-gray-900 mt-1">{stops.length}</p></div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stops.length > 0 ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                        <MapPinIcon className={`w-6 h-6 ${stops.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                                {stops.length === 0 && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><span>⚠️</span> No stops added yet</p>}
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-gray-500 text-sm font-medium">Total Routes Created</p><p className="text-3xl font-bold text-gray-900 mt-1">{routes.length}</p></div>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${routes.length > 0 ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                                        <ArrowPathIcon className={`w-6 h-6 ${routes.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                                {routes.length === 0 && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><span>⚠️</span> Create a route to continue</p>}
                            </motion.div>
                            <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-gray-300 text-sm font-medium">Ready to Deploy</p><p className="text-3xl font-bold text-white mt-1">{completedSteps.step1 && completedSteps.step2 && completedSteps.step3 ? 'Yes' : 'No'}</p></div>
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><TruckIcon className="w-6 h-6 text-white" /></div>
                                </div>
                                {completedSteps.step1 && completedSteps.step2 && completedSteps.step3 ? <p className="text-xs text-emerald-300 mt-2">✓ Ready to go live</p> : <p className="text-xs text-gray-400 mt-2">Complete all steps to deploy</p>}
                            </motion.div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
                            <div className="border-b border-gray-100">
                                <div className="flex space-x-6 px-6">
                                    <button onClick={() => setActiveTab("stops")} className={`py-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === "stops" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                                        <MapPinIcon className="w-4 h-4" /> Step 1: 📍 Manage Stops {completedSteps.step1 && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                                    </button>
                                    <button onClick={() => setActiveTab("routes")} className={`py-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === "routes" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                                        <ArrowPathIcon className="w-4 h-4" /> Step 2: 🛣️ Manage Routes {completedSteps.step2 && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Stops Tab Content */}
                                {activeTab === "stops" && (
                                    <div>
                                        <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><MagnifyingGlassIcon className="w-4 h-4 text-blue-600" /></div>
                                            <div><p className="text-sm font-medium text-blue-800">How to add stops?</p><p className="text-xs text-blue-600 mt-0.5">Search for any location in India, or enter coordinates manually.</p></div>
                                        </div>
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5 text-emerald-600" /> Add Single Stop</h3>
                                            <div className="relative mb-3">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input placeholder="Search for a location..." value={addressInput} onChange={(e) => setAddressInput(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm" />
                                                {addressSuggestions.length > 0 && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                                        {addressSuggestions.map((suggestion, idx) => (<div key={idx} onClick={() => selectAddress(suggestion)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"><p className="text-sm text-gray-800">{suggestion.display_name}</p></div>))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                <input placeholder="Stop Name" value={newStop.name} onChange={(e) => setNewStop({ ...newStop, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                                                <input placeholder="Latitude" type="number" step="any" value={newStop.latitude} onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                                                <input placeholder="Longitude" type="number" step="any" value={newStop.longitude} onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                                                <input placeholder="Radius (meters)" type="number" value={newStop.radius_meters} onChange={(e) => setNewStop({ ...newStop, radius_meters: parseInt(e.target.value) || 0 })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                                                <button onClick={addSingleStop} className="bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-700 transition shadow-sm">+ Add Stop</button>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><DocumentDuplicateIcon className="w-5 h-5 text-blue-600" /> Bulk Upload Stops</h3>
                                            <div className="flex gap-4 items-center">
                                                <input type="file" accept=".jsonl" onChange={(e) => setBulkFile(e.target.files[0])} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
                                                <button onClick={uploadBulkStops} className="bg-emerald-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-emerald-700 transition shadow-sm">{uploading ? "Uploading..." : "Upload File"}</button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">JSONL format: name, latitude, longitude</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><EyeIcon className="w-5 h-5 text-purple-600" /> Your Stops ({stops.length})</h3>{stops.length > 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Step 1 Complete ✓</span>}</div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th></tr></thead>
                                                    <tbody>
                                                        {stops.slice(0, 5).map((s) => (<tr key={s.stop_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700">{s.name}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.latitude).toFixed(6)}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.longitude).toFixed(6)}</td><td className="px-4 py-3"><button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></td></tr>))}
                                                    </tbody>
                                                </table>
                                                {stops.length > 5 && <div className="text-center mt-4"><button onClick={() => setShowStopsModal(true)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View all {stops.length} stops →</button></div>}
                                            </div>
                                            {stops.length === 0 && (<div className="text-center py-8 bg-gray-50 rounded-xl"><MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-500 text-sm">No stops added yet</p></div>)}
                                        </div>
                                    </div>
                                )}

                                {/* Routes Tab Content */}
                                {activeTab === "routes" && (
                                    <div>
                                        <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><ArrowPathIcon className="w-4 h-4 text-blue-600" /></div>
                                            <div><p className="text-sm font-medium text-blue-800">How to create a route?</p><p className="text-xs text-blue-600 mt-0.5">Give your route a name and code. After creating, you can assign stops and set fares.</p></div>
                                        </div>
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5 text-emerald-600" /> Create New Route</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <input placeholder="Route Name" value={newRoute.name} onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                                                <input placeholder="Route Code" value={newRoute.code} onChange={(e) => setNewRoute({ ...newRoute, code: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                                                <div className="flex items-center gap-3"><label className="text-sm font-medium text-gray-700">Has AC:</label><button onClick={() => setNewRoute({ ...newRoute, has_ac: !newRoute.has_ac })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${newRoute.has_ac ? 'bg-blue-600' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${newRoute.has_ac ? 'translate-x-6' : 'translate-x-1'}`}></span></button><span className={`text-sm font-medium ${newRoute.has_ac ? 'text-blue-600' : 'text-gray-500'}`}>{newRoute.has_ac ? 'Yes' : 'No'}</span></div>
                                                <button onClick={createRoute} className="bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-700 transition shadow-sm">+ Create Route</button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><EyeIcon className="w-5 h-5 text-purple-600" /> Your Routes ({routes.length})</h3>{routes.length > 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Step 2 Complete ✓</span>}</div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AC</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stops</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
                                                    <tbody>
                                                        {routes.slice(0, 5).map((r) => (<tr key={r.route_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700 font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td><td className="px-4 py-3 text-gray-600">{r.code}</td><td className="px-4 py-3">{r.has_ac ? '✓ Yes' : '✗ No'}</td><td className="px-4 py-3 text-gray-600">{r.total_stops}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setSelectedRouteId(r.route_id); setShowStopModal(true); }} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium">Add Stops</button><button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium">Toggle</button><button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Fares</button></div></td></tr>))}
                                                    </tbody>
                                                </table>
                                                {routes.length > 5 && <div className="text-center mt-4"><button onClick={() => setShowRoutesModal(true)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View all {routes.length} routes →</button></div>}
                                            </div>
                                            {routes.length === 0 && (<div className="text-center py-8 bg-gray-50 rounded-xl"><ArrowPathIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-500 text-sm">No routes created yet</p></div>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <Modal isOpen={showRoutesModal} onClose={() => setShowRoutesModal(false)} title="All Routes">
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AC</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stops</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead><tbody>{routes.map((r) => (<tr key={r.route_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700 font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td><td className="px-4 py-3 text-gray-600">{r.code}</td><td className="px-4 py-3">{r.has_ac ? '✓ Yes' : '✗ No'}</td><td className="px-4 py-3 text-gray-600">{r.total_stops}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setSelectedRouteId(r.route_id); setShowRoutesModal(false); setShowStopModal(true); }} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium">Add Stops</button><button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium">Toggle</button><button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Fares</button></div></td></tr>))}</tbody></table></div>
            </Modal>

            <Modal isOpen={showStopsModal} onClose={() => setShowStopsModal(false)} title="All Stops">
                <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th></tr></thead><tbody>{stops.map((s) => (<tr key={s.stop_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700">{s.name}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.latitude).toFixed(6)}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.longitude).toFixed(6)}</td><td className="px-4 py-3"><button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></td></tr>))}</tbody></table></div>
            </Modal>

            <Modal isOpen={showStopModal} onClose={() => setShowStopModal(false)} title="Add Stops to Route">
                <div className="space-y-4"><div className="bg-blue-50 rounded-lg p-3 mb-4"><p className="text-xs text-blue-700">Selected Route ID: <span className="font-mono">{selectedRouteId}</span></p></div>
                    {multiStops.map((s, i) => (<div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30"><div className="flex items-center gap-2 mb-3"><div className="w-6 h-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold">{(i + 1).toString().padStart(2, '0')}</div><span className="text-sm font-medium text-gray-700">Stop {i + 1}</span></div><select value={s.stop_id} onChange={(e) => { const updated = [...multiStops]; updated[i].stop_id = e.target.value; setMultiStops(updated); }} className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm"><option value="">Select Stop</option>{stops.map((stop) => (<option key={stop.stop_id} value={stop.stop_id}>{stop.name}</option>))}</select><input placeholder="Time difference (minutes)" type="number" value={s.assume_time_diff_minutes} onChange={(e) => { const updated = [...multiStops]; updated[i].assume_time_diff_minutes = e.target.value; setMultiStops(updated); }} className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm" /><div className="flex gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.boarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].boarding_allowed = e.target.checked; setMultiStops(updated); }} /> Boarding</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.deboarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].deboarding_allowed = e.target.checked; setMultiStops(updated); }} /> Deboarding</label></div>{multiStops.length > 1 && (<button onClick={() => setMultiStops(multiStops.filter((_, idx) => idx !== i))} className="text-red-500 text-sm mt-2">Remove</button>)}</div>))}
                    <button onClick={() => setMultiStops([...multiStops, { stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }])} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">+ Add Another Stop</button>
                    <button onClick={createMultipleStops} disabled={isSubmitting} className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Stops"}</button>
                </div>
            </Modal>

            <Modal isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} title={routeDetails?.name || "Route Details"}>
                {routeDetails && (<div><div className="flex gap-4 mb-6 pb-4 border-b border-gray-100"><span className="text-sm text-gray-500">Code: <span className="font-mono text-gray-700">{routeDetails.code}</span></span><span className={`text-xs px-2 py-1 rounded-full ${routeDetails.has_ac ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{routeDetails.has_ac ? 'AC' : 'Non-AC'}</span><span className={`text-xs px-2 py-1 rounded-full ${routeDetails.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{routeDetails.is_active ? 'Active' : 'Inactive'}</span></div>
                    {!routeDetails.path || routeDetails.path.length === 0 ? (<div className="text-center py-12"><MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No stops added yet.</p><button onClick={() => { setSelectedRouteId(routeDetails.route_id); setShowRouteModal(false); setShowStopModal(true); }} className="mt-3 text-emerald-600 text-sm font-medium">+ Add Stops</button></div>) : (<div className="space-y-3">{routeDetails.path.map((stop, idx) => (<div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-sm">{stop.sequence_no}</div><div><p className="font-medium text-gray-900">{stop.stop_name}</p><p className="text-xs text-gray-500">Lat: {stop.latitude?.toFixed(4)}</p></div><div className="flex gap-1"><span className={`text-xs px-2 py-0.5 rounded-full ${stop.boarding ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>Board</span><span className={`text-xs px-2 py-0.5 rounded-full ${stop.deboarding ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>Deboard</span></div></div>))}</div>)}</div>)}
            </Modal>

            {/* FARE MODAL */}
            {fareModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setFareModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Manage Fares</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Set fares for different route segments</p>
                            </div>
                            <button onClick={() => setFareModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {fareData.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CurrencyRupeeIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No stops configured for this route yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Add stops to the route first to create fare rules.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Stats Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Total Fare Segments</p><p className="text-2xl font-bold text-gray-900">{totalFares}</p></div>
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Configured Fares</p><p className="text-2xl font-bold text-emerald-600">{totalConfigured}</p></div>
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Pending Configuration</p><p className="text-2xl font-bold text-amber-600">{totalFares - totalConfigured}</p></div>
                                    </div>

                                    {/* Fares Table */}
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">From</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">To</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount (₹)</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {fareData.map((f, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition group">
                                                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{f.from}</td>
                                                        <td className="px-4 py-3 text-gray-600">{f.to}</td>
                                                        <td className="px-4 py-3">
                                                            {editingFareId === idx ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input type="text" value={tempFareAmount} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setTempFareAmount(val); }} className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus onKeyPress={(e) => { if (e.key === 'Enter') saveFareAmount(idx); if (e.key === 'Escape') cancelEditing(); }} />
                                                                    <button onClick={() => saveFareAmount(idx)} className="text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></button>
                                                                    <button onClick={cancelEditing} className="text-gray-400"><XMarkIcon className="w-5 h-5" /></button>
                                                                </div>
                                                            ) : (
                                                                <div onClick={() => startEditingFare(idx, f.amount)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer group-hover:bg-gray-100 ${f.amount === 0 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700'}`}>
                                                                    <CurrencyRupeeIcon className="w-4 h-4" />
                                                                    <span className="font-medium">{f.amount === 0 ? 'Set amount' : f.amount}</span>
                                                                    {f.amount === 0 && <span className="text-xs text-red-500">(Required)</span>}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input type="checkbox" className="sr-only peer" checked={f.is_active} onChange={(e) => { const updated = [...fareData]; updated[idx].is_active = e.target.checked; setFareData(updated); }} />
                                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                                                <span className={`ml-3 text-xs font-medium ${f.is_active ? 'text-emerald-600' : 'text-gray-500'}`}>{f.is_active ? 'Active' : 'Inactive'}</span>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button onClick={() => setFareModal(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                                        <button onClick={handleManageFare} disabled={totalConfigured === 0} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Save Fares</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default RouteSettings;