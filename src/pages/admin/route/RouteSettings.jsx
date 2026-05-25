// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import { motion } from "framer-motion";
// import TopNavbar from "../../../assets/components/navbar/TopNavbar";
// import {
//     MapPinIcon,
//     PlusIcon,
//     DocumentDuplicateIcon,
//     ArrowPathIcon,
//     CheckCircleIcon,
//     MagnifyingGlassIcon,
//     TrashIcon,
//     EyeIcon,
//     CurrencyRupeeIcon,
//     RocketLaunchIcon,
//     ClipboardDocumentCheckIcon,
//     TruckIcon,
//     XMarkIcon
// } from '@heroicons/react/24/outline';

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
//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const [activeTab, setActiveTab] = useState("stops");
//     const [completedSteps, setCompletedSteps] = useState({
//         step1: false,
//         step2: false,
//         step3: false
//     });
//     const [editingFareId, setEditingFareId] = useState(null);
//     const [tempFareAmount, setTempFareAmount] = useState("");

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

//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 1024);
//         };
//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     useEffect(() => {
//         setCompletedSteps({
//             step1: stops.length > 0,
//             step2: routes.length > 0,
//             step3: selectedRouteId && multiStops.some(s => s.stop_id)
//         });
//     }, [stops, routes, selectedRouteId, multiStops]);

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

//     useEffect(() => {
//         if (showRoutesModal || showStopsModal || fareModal || showStopModal || showRouteModal) {
//             document.body.style.overflow = 'hidden';
//         } else {
//             document.body.style.overflow = 'unset';
//         }
//         return () => {
//             document.body.style.overflow = 'unset';
//         };
//     }, [showRoutesModal, showStopsModal, fareModal, showStopModal, showRouteModal]);

//     const searchAddress = async (query) => {
//         if (!query || query.length < 3) {
//             setAddressSuggestions([]);
//             return;
//         }

//         setIsGeocoding(true);
//         try {
//             const response = await fetch(
//                 `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10&countrycodes=in`,
//                 { headers: { 'User-Agent': 'ShuttleBusAdmin/1.0' } }
//             );
//             const data = await response.json();
//             setAddressSuggestions(data);
//         } catch (error) {
//             console.error("Geocoding error:", error);
//             setAddressSuggestions([]);
//         } finally {
//             setIsGeocoding(false);
//         }
//     };

//     const selectAddress = (suggestion) => {
//         setNewStop({
//             ...newStop,
//             name: suggestion.display_name.split(',')[0],
//             latitude: parseFloat(suggestion.lat),
//             longitude: parseFloat(suggestion.lon),
//         });
//         setAddressInput(suggestion.display_name);
//         setAddressSuggestions([]);
//     };

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (addressInput && addressInput.length >= 3) {
//                 searchAddress(addressInput);
//             }
//         }, 500);
//         return () => clearTimeout(timer);
//     }, [addressInput]);

//     if (initialLoad || loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//                 <Sidebar onClose={() => setSidebarOpen(false)} />
//                 <div className="lg:ml-64">
//                     <TopNavbar sidebarOpen={sidebarOpen} />
//                     <div className="flex items-center justify-center h-screen">
//                         <div className="text-center">
//                             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
//                             <p className="text-gray-500">Loading route settings...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const getRouteDetails = async (route_id) => {
//         try {
//             const res = await axios.get(`${BASE_URL}/routes/${route_id}`, axiosConfig);
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
//             }
//         } catch (err) {
//             console.error("Error opening route details:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

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
//             await axios.post(
//                 `${BASE_URL}/stops/add-single`,
//                 {
//                     name: newStop.name,
//                     latitude: parseFloat(newStop.latitude),
//                     longitude: parseFloat(newStop.longitude),
//                     radius_meters: parseInt(newStop.radius_meters),
//                 },
//                 axiosConfig
//             );
//             alert("Stop added successfully!");
//             setNewStop({ name: "", latitude: "", longitude: "", radius_meters: 150 });
//             setAddressInput("");
//             await getAllStops();
//         } catch (err) {
//             console.error(err);
//             alert(err.response?.data?.detail?.[0]?.msg || "Error adding stop");
//         }
//     };

//     const uploadBulkStops = async () => {
//         if (!bulkFile) return alert("Please select a file");

//         const formData = new FormData();
//         formData.append("file", bulkFile);

//         try {
//             setUploading(true);
//             const res = await axios.post(`${BASE_URL}/stops/bulk-upload`, formData, {
//                 headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" },
//             });
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

//             await axios.post(`${BASE_URL}/routes/${selectedRouteId}/stops`, { stops: cleanedStops }, axiosConfig);

//             alert("Stops Added Successfully!");
//             setShowStopModal(false);
//             setShowRoutesModal(true);
//             setMultiStops([{ stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }]);
//             await getAllRoutes();
//         } catch (err) {
//             console.error(err.response?.data || err);
//             alert(err.response?.data?.detail || "Error adding stops");
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const createRoute = async () => {
//         if (!newRoute.name || !newRoute.code) return alert("Enter route details");

//         try {
//             const res = await axios.post(`${BASE_URL}/routes/create`, {
//                 name: newRoute.name,
//                 code: newRoute.code,
//                 has_ac: newRoute.has_ac,
//             }, axiosConfig);

//             const routeId = res.data?.data?.route_id;
//             if (!routeId) return alert("Route created but ID missing");

//             setSelectedRouteId(routeId);
//             alert("Route Created! Now add stops.");
//             setShowStopModal(true);
//             setMultiStops([{ stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }]);
//             setNewRoute({ name: "", code: "", has_ac: false });
//             await getAllRoutes();
//         } catch (err) {
//             console.error(err.response?.data || err);
//             alert("Error creating route");
//         }
//     };

//     const toggleRoute = async (route_id, current) => {
//         try {
//             await axios.patch(`${BASE_URL}/routes/${route_id}/toggle`, { is_active: !current }, axiosConfig);
//             await getAllRoutes();
//         } catch {
//             alert("Toggle failed");
//         }
//     };

//     const getFaresForRoute = async (route_id) => {
//         try {
//             setFareRouteId(route_id);
//             setFareModal(true);
//             setFareData([]);
//             setEditingFareId(null);
//             setTempFareAmount("");

//             const routeDetailsRes = await axios.get(`${BASE_URL}/routes/${route_id}`, axiosConfig);
//             const routeStops = routeDetailsRes.data?.path || [];
//             const sortedStops = [...routeStops].sort((a, b) => a.sequence_no - b.sequence_no);

//             const faresRes = await axios.get(`${BASE_URL}/routes/${route_id}/fares`, axiosConfig);
//             const existingFares = faresRes.data || [];

//             if (sortedStops.length > 1) {
//                 let generatedFares = [];

//                 for (let i = 0; i < sortedStops.length; i++) {
//                     const pickupStop = sortedStops[i];
//                     for (let j = i + 1; j < sortedStops.length; j++) {
//                         const dropoffStop = sortedStops[j];
//                         const existingFare = existingFares.find(fare =>
//                             fare.pickup_stop_id === pickupStop.stop_id && fare.dropoff_stop_id === dropoffStop.stop_id
//                         );

//                         if (existingFare) {
//                             generatedFares.push({
//                                 id: `${pickupStop.stop_id}-${dropoffStop.stop_id}`,
//                                 pickup_stop_id: existingFare.pickup_stop_id,
//                                 dropoff_stop_id: existingFare.dropoff_stop_id,
//                                 from: pickupStop.stop_name,
//                                 to: dropoffStop.stop_name,
//                                 amount: existingFare.amount || 0,
//                                 is_active: existingFare.is_active !== undefined ? existingFare.is_active : true,
//                             });
//                         } else {
//                             generatedFares.push({
//                                 id: `${pickupStop.stop_id}-${dropoffStop.stop_id}`,
//                                 pickup_stop_id: pickupStop.stop_id,
//                                 dropoff_stop_id: dropoffStop.stop_id,
//                                 from: pickupStop.stop_name,
//                                 to: dropoffStop.stop_name,
//                                 amount: 0,
//                                 is_active: true,
//                             });
//                         }
//                     }
//                 }
//                 setFareData(generatedFares);
//             }
//         } catch (err) {
//             console.error("Error fetching fares:", err);
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
//                 amount: f.amount,
//             }));

//             await axios.post(`${BASE_URL}/routes/fares/bulk-set`, { route_id: fareRouteId, fares: payload }, axiosConfig);
//             alert("Fares updated successfully!");
//             setFareModal(false);
//             await getAllRoutes();
//         } catch (err) {
//             console.error(err);
//             alert("Failed to update fares");
//         }
//     };

//     const startEditingFare = (idx, currentAmount) => {
//         setEditingFareId(idx);
//         setTempFareAmount(currentAmount === 0 ? "" : currentAmount.toString());
//     };

//     const saveFareAmount = (idx) => {
//         const amount = parseInt(tempFareAmount, 10);
//         const finalAmount = isNaN(amount) ? 0 : amount;
//         const updated = [...fareData];
//         updated[idx].amount = finalAmount;
//         setFareData(updated);
//         setEditingFareId(null);
//         setTempFareAmount("");
//     };

//     const cancelEditing = () => {
//         setEditingFareId(null);
//         setTempFareAmount("");
//     };

//     const StepIndicator = ({ number, title, description, isCompleted, isActive, onClick }) => {
//         return (
//             <motion.div
//                 className={`flex-1 relative cursor-pointer ${isActive ? 'z-10' : ''}`}
//                 onClick={onClick}
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 400 }}
//             >
//                 <div className="flex flex-col items-center">
//                     <motion.div
//                         className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isCompleted
//                             ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
//                             : isActive
//                                 ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white ring-4 ring-gray-300'
//                                 : 'bg-white border-2 border-gray-200 text-gray-400'
//                             }`}
//                         animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
//                         transition={{ duration: 0.3 }}
//                     >
//                         {isCompleted ? <CheckCircleIcon className="w-7 h-7" /> : <span className="text-xl font-bold">{number}</span>}
//                     </motion.div>
//                     <p className={`text-sm font-bold mt-3 ${isActive ? 'text-gray-900' : isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>
//                         {title}
//                     </p>
//                     <p className="text-[10px] text-gray-400 mt-0.5 text-center max-w-[140px]">{description}</p>
//                     {isCompleted && (
//                         <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-medium text-emerald-500 mt-1">
//                             ✓ Complete
//                         </motion.p>
//                     )}
//                 </div>
//                 {number < 3 && (
//                     <div className="absolute top-7 left-full w-full h-0.5 bg-gray-200 -z-10">
//                         <motion.div
//                             className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
//                             initial={{ width: "0%" }}
//                             animate={{ width: isCompleted ? "100%" : "0%" }}
//                             transition={{ duration: 0.5 }}
//                         />
//                     </div>
//                 )}
//             </motion.div>
//         );
//     };

//     const Modal = ({ isOpen, onClose, title, children }) => {
//         if (!isOpen) return null;
//         return (
//             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     className="bg-white rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl"
//                     onClick={(e) => e.stopPropagation()}
//                 >
//                     <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
//                         <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
//                         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-all text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
//                     </div>
//                     <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
//                         {children}
//                     </div>
//                 </motion.div>
//             </div>
//         );
//     };

//     // Calculate stats for fare modal
//     const totalConfigured = fareData.filter(f => f.amount > 0).length;
//     const totalFares = fareData.length;

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//             <Sidebar onClose={() => setSidebarOpen(false)} />

//             <div className="lg:ml-64">
//                 <TopNavbar sidebarOpen={sidebarOpen} />

//                 <main className="pt-20 p-8">
//                     <div className="max-w-7xl mx-auto">
//                         {/* Header */}
//                         <div className="mb-8">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
//                                     <RocketLaunchIcon className="w-6 h-6 text-white" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-2xl font-semibold text-gray-900">Route & Stop Configuration</h1>
//                                     <p className="text-gray-500 text-sm mt-0.5">Set up your bus routes, stops, and fare rules in 3 simple steps</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Workflow Steps */}
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="flex items-center gap-2">
//                                     <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-600" />
//                                     <span className="text-sm font-medium text-gray-600">Setup Workflow</span>
//                                 </div>
//                                 {completedSteps.step1 && completedSteps.step2 && completedSteps.step3 && (
//                                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
//                                         <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
//                                         <span className="text-xs font-medium text-emerald-700">All steps completed!</span>
//                                     </motion.div>
//                                 )}
//                             </div>
//                             <div className="relative flex justify-between items-start">
//                                 <StepIndicator number={1} title="Create Stops" description="Add bus stops with location coordinates" isCompleted={completedSteps.step1} isActive={activeTab === "stops"} onClick={() => setActiveTab("stops")} />
//                                 <StepIndicator number={2} title="Create Route" description="Define route name and AC status" isCompleted={completedSteps.step2} isActive={activeTab === "routes"} onClick={() => setActiveTab("routes")} />
//                                 <StepIndicator number={3} title="Assign Stops & Fares" description="Map stops to route and set prices" isCompleted={completedSteps.step3} isActive={false} onClick={() => { if (routes.length > 0) setShowRoutesModal(true); else alert("Please create a route first"); }} />
//                             </div>
//                             <div className="mt-6 pt-4 border-t border-gray-100">
//                                 <div className="flex justify-between text-xs text-gray-500 mb-2">
//                                     <span>Step 1: Stops</span>
//                                     <span>Step 2: Route</span>
//                                     <span>Step 3: Assign & Fares</span>
//                                 </div>
//                                 <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
//                                     <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${(Object.values(completedSteps).filter(v => v === true).length / 3) * 100}%` }} transition={{ duration: 0.5 }} />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Stats Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
//                             <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
//                                 <div className="flex items-center justify-between">
//                                     <div><p className="text-gray-500 text-sm font-medium">Total Stops Created</p><p className="text-3xl font-bold text-gray-900 mt-1">{stops.length}</p></div>
//                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stops.length > 0 ? 'bg-emerald-50' : 'bg-gray-100'}`}>
//                                         <MapPinIcon className={`w-6 h-6 ${stops.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
//                                     </div>
//                                 </div>
//                                 {stops.length === 0 && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><span>⚠️</span> No stops added yet</p>}
//                             </motion.div>
//                             <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
//                                 <div className="flex items-center justify-between">
//                                     <div><p className="text-gray-500 text-sm font-medium">Total Routes Created</p><p className="text-3xl font-bold text-gray-900 mt-1">{routes.length}</p></div>
//                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${routes.length > 0 ? 'bg-emerald-50' : 'bg-gray-100'}`}>
//                                         <ArrowPathIcon className={`w-6 h-6 ${routes.length > 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
//                                     </div>
//                                 </div>
//                                 {routes.length === 0 && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><span>⚠️</span> Create a route to continue</p>}
//                             </motion.div>
//                             <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 shadow-md">
//                                 <div className="flex items-center justify-between">
//                                     <div><p className="text-gray-300 text-sm font-medium">Ready to Deploy</p><p className="text-3xl font-bold text-white mt-1">{completedSteps.step1 && completedSteps.step2 && completedSteps.step3 ? 'Yes' : 'No'}</p></div>
//                                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><TruckIcon className="w-6 h-6 text-white" /></div>
//                                 </div>
//                                 {completedSteps.step1 && completedSteps.step2 && completedSteps.step3 ? <p className="text-xs text-emerald-300 mt-2">✓ Ready to go live</p> : <p className="text-xs text-gray-400 mt-2">Complete all steps to deploy</p>}
//                             </motion.div>
//                         </div>

//                         {/* Tabs */}
//                         <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
//                             <div className="border-b border-gray-100">
//                                 <div className="flex space-x-6 px-6">
//                                     <button onClick={() => setActiveTab("stops")} className={`py-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === "stops" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
//                                         <MapPinIcon className="w-4 h-4" /> Step 1: 📍 Manage Stops {completedSteps.step1 && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
//                                     </button>
//                                     <button onClick={() => setActiveTab("routes")} className={`py-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === "routes" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
//                                         <ArrowPathIcon className="w-4 h-4" /> Step 2: 🛣️ Manage Routes {completedSteps.step2 && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="p-6">
//                                 {/* Stops Tab Content */}
//                                 {activeTab === "stops" && (
//                                     <div>
//                                         <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
//                                             <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><MagnifyingGlassIcon className="w-4 h-4 text-blue-600" /></div>
//                                             <div><p className="text-sm font-medium text-blue-800">How to add stops?</p><p className="text-xs text-blue-600 mt-0.5">Search for any location in India, or enter coordinates manually.</p></div>
//                                         </div>
//                                         <div className="mb-8">
//                                             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5 text-emerald-600" /> Add Single Stop</h3>
//                                             <div className="relative mb-3">
//                                                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                                                 <input placeholder="Search for a location..." value={addressInput} onChange={(e) => setAddressInput(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm" />
//                                                 {addressSuggestions.length > 0 && (
//                                                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
//                                                         {addressSuggestions.map((suggestion, idx) => (<div key={idx} onClick={() => selectAddress(suggestion)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"><p className="text-sm text-gray-800">{suggestion.display_name}</p></div>))}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                                                 <input placeholder="Stop Name" value={newStop.name} onChange={(e) => setNewStop({ ...newStop, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
//                                                 <input placeholder="Latitude" type="number" step="any" value={newStop.latitude} onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
//                                                 <input placeholder="Longitude" type="number" step="any" value={newStop.longitude} onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
//                                                 <input placeholder="Radius (meters)" type="number" value={newStop.radius_meters} onChange={(e) => setNewStop({ ...newStop, radius_meters: parseInt(e.target.value) || 0 })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
//                                                 <button onClick={addSingleStop} className="bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-700 transition shadow-sm">+ Add Stop</button>
//                                             </div>
//                                         </div>
//                                         <div className="mb-8">
//                                             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><DocumentDuplicateIcon className="w-5 h-5 text-blue-600" /> Bulk Upload Stops</h3>
//                                             <div className="flex gap-4 items-center">
//                                                 <input type="file" accept=".jsonl" onChange={(e) => setBulkFile(e.target.files[0])} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50" />
//                                                 <button onClick={uploadBulkStops} className="bg-emerald-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-emerald-700 transition shadow-sm">{uploading ? "Uploading..." : "Upload File"}</button>
//                                             </div>
//                                             <p className="text-xs text-gray-400 mt-2">JSONL format: name, latitude, longitude</p>
//                                         </div>
//                                         <div>
//                                             <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><EyeIcon className="w-5 h-5 text-purple-600" /> Your Stops ({stops.length})</h3>{stops.length > 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Step 1 Complete ✓</span>}</div>
//                                             <div className="overflow-x-auto">
//                                                 <table className="w-full text-sm">
//                                                     <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th></tr></thead>
//                                                     <tbody>
//                                                         {stops.slice(0, 5).map((s) => (<tr key={s.stop_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700">{s.name}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.latitude).toFixed(6)}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.longitude).toFixed(6)}</td><td className="px-4 py-3"><button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></td></tr>))}
//                                                     </tbody>
//                                                 </table>
//                                                 {stops.length > 5 && <div className="text-center mt-4"><button onClick={() => setShowStopsModal(true)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View all {stops.length} stops →</button></div>}
//                                             </div>
//                                             {stops.length === 0 && (<div className="text-center py-8 bg-gray-50 rounded-xl"><MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-500 text-sm">No stops added yet</p></div>)}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Routes Tab Content */}
//                                 {activeTab === "routes" && (
//                                     <div>
//                                         <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-start gap-3">
//                                             <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><ArrowPathIcon className="w-4 h-4 text-blue-600" /></div>
//                                             <div><p className="text-sm font-medium text-blue-800">How to create a route?</p><p className="text-xs text-blue-600 mt-0.5">Give your route a name and code. After creating, you can assign stops and set fares.</p></div>
//                                         </div>
//                                         <div className="mb-8">
//                                             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><PlusIcon className="w-5 h-5 text-emerald-600" /> Create New Route</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                                                 <input placeholder="Route Name" value={newRoute.name} onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
//                                                 <input placeholder="Route Code" value={newRoute.code} onChange={(e) => setNewRoute({ ...newRoute, code: e.target.value })} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
//                                                 <div className="flex items-center gap-3"><label className="text-sm font-medium text-gray-700">Has AC:</label><button onClick={() => setNewRoute({ ...newRoute, has_ac: !newRoute.has_ac })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${newRoute.has_ac ? 'bg-blue-600' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${newRoute.has_ac ? 'translate-x-6' : 'translate-x-1'}`}></span></button><span className={`text-sm font-medium ${newRoute.has_ac ? 'text-blue-600' : 'text-gray-500'}`}>{newRoute.has_ac ? 'Yes' : 'No'}</span></div>
//                                                 <button onClick={createRoute} className="bg-gray-800 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-700 transition shadow-sm">+ Create Route</button>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><EyeIcon className="w-5 h-5 text-purple-600" /> Your Routes ({routes.length})</h3>{routes.length > 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Step 2 Complete ✓</span>}</div>
//                                             <div className="overflow-x-auto">
//                                                 <table className="w-full text-sm">
//                                                     <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AC</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stops</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
//                                                     <tbody>
//                                                         {routes.slice(0, 5).map((r) => (<tr key={r.route_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700 font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td><td className="px-4 py-3 text-gray-600">{r.code}</td><td className="px-4 py-3">{r.has_ac ? '✓ Yes' : '✗ No'}</td><td className="px-4 py-3 text-gray-600">{r.total_stops}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setSelectedRouteId(r.route_id); setShowStopModal(true); }} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium">Add Stops</button><button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium">Toggle</button><button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Fares</button></div></td></tr>))}
//                                                     </tbody>
//                                                 </table>
//                                                 {routes.length > 5 && <div className="text-center mt-4"><button onClick={() => setShowRoutesModal(true)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View all {routes.length} routes →</button></div>}
//                                             </div>
//                                             {routes.length === 0 && (<div className="text-center py-8 bg-gray-50 rounded-xl"><ArrowPathIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-gray-500 text-sm">No routes created yet</p></div>)}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>

//             {/* Modals */}
//             <Modal isOpen={showRoutesModal} onClose={() => setShowRoutesModal(false)} title="All Routes">
//                 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AC</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stops</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead><tbody>{routes.map((r) => (<tr key={r.route_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700 font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td><td className="px-4 py-3 text-gray-600">{r.code}</td><td className="px-4 py-3">{r.has_ac ? '✓ Yes' : '✗ No'}</td><td className="px-4 py-3 text-gray-600">{r.total_stops}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => { setSelectedRouteId(r.route_id); setShowRoutesModal(false); setShowStopModal(true); }} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium">Add Stops</button><button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium">Toggle</button><button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Fares</button></div></td></tr>))}</tbody></table></div>
//             </Modal>

//             <Modal isOpen={showStopsModal} onClose={() => setShowStopsModal(false)} title="All Stops">
//                 <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b border-gray-200"><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th></tr></thead><tbody>{stops.map((s) => (<tr key={s.stop_id} className="border-b border-gray-100 hover:bg-gray-50 transition"><td className="px-4 py-3 text-gray-700">{s.name}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.latitude).toFixed(6)}</td><td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.longitude).toFixed(6)}</td><td className="px-4 py-3"><button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></td></tr>))}</tbody></table></div>
//             </Modal>

//             <Modal isOpen={showStopModal} onClose={() => setShowStopModal(false)} title="Add Stops to Route">
//                 <div className="space-y-4"><div className="bg-blue-50 rounded-lg p-3 mb-4"><p className="text-xs text-blue-700">Selected Route ID: <span className="font-mono">{selectedRouteId}</span></p></div>
//                     {multiStops.map((s, i) => (<div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30"><div className="flex items-center gap-2 mb-3"><div className="w-6 h-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold">{(i + 1).toString().padStart(2, '0')}</div><span className="text-sm font-medium text-gray-700">Stop {i + 1}</span></div><select value={s.stop_id} onChange={(e) => { const updated = [...multiStops]; updated[i].stop_id = e.target.value; setMultiStops(updated); }} className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm"><option value="">Select Stop</option>{stops.map((stop) => (<option key={stop.stop_id} value={stop.stop_id}>{stop.name}</option>))}</select><input placeholder="Time difference (minutes)" type="number" value={s.assume_time_diff_minutes} onChange={(e) => { const updated = [...multiStops]; updated[i].assume_time_diff_minutes = e.target.value; setMultiStops(updated); }} className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm" /><div className="flex gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.boarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].boarding_allowed = e.target.checked; setMultiStops(updated); }} /> Boarding</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.deboarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].deboarding_allowed = e.target.checked; setMultiStops(updated); }} /> Deboarding</label></div>{multiStops.length > 1 && (<button onClick={() => setMultiStops(multiStops.filter((_, idx) => idx !== i))} className="text-red-500 text-sm mt-2">Remove</button>)}</div>))}
//                     <button onClick={() => setMultiStops([...multiStops, { stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }])} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">+ Add Another Stop</button>
//                     <button onClick={createMultipleStops} disabled={isSubmitting} className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Stops"}</button>
//                 </div>
//             </Modal>

//             <Modal isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} title={routeDetails?.name || "Route Details"}>
//                 {routeDetails && (<div><div className="flex gap-4 mb-6 pb-4 border-b border-gray-100"><span className="text-sm text-gray-500">Code: <span className="font-mono text-gray-700">{routeDetails.code}</span></span><span className={`text-xs px-2 py-1 rounded-full ${routeDetails.has_ac ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{routeDetails.has_ac ? 'AC' : 'Non-AC'}</span><span className={`text-xs px-2 py-1 rounded-full ${routeDetails.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{routeDetails.is_active ? 'Active' : 'Inactive'}</span></div>
//                     {!routeDetails.path || routeDetails.path.length === 0 ? (<div className="text-center py-12"><MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No stops added yet.</p><button onClick={() => { setSelectedRouteId(routeDetails.route_id); setShowRouteModal(false); setShowStopModal(true); }} className="mt-3 text-emerald-600 text-sm font-medium">+ Add Stops</button></div>) : (<div className="space-y-3">{routeDetails.path.map((stop, idx) => (<div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-sm">{stop.sequence_no}</div><div><p className="font-medium text-gray-900">{stop.stop_name}</p><p className="text-xs text-gray-500">Lat: {stop.latitude?.toFixed(4)}</p></div><div className="flex gap-1"><span className={`text-xs px-2 py-0.5 rounded-full ${stop.boarding ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>Board</span><span className={`text-xs px-2 py-0.5 rounded-full ${stop.deboarding ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>Deboard</span></div></div>))}</div>)}</div>)}
//             </Modal>

//             {/* FARE MODAL */}
//             {fareModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setFareModal(false)}>
//                     <motion.div
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.95 }}
//                         className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
//                             <div>
//                                 <h3 className="text-xl font-semibold text-gray-900">Manage Fares</h3>
//                                 <p className="text-sm text-gray-500 mt-0.5">Set fares for different route segments</p>
//                             </div>
//                             <button onClick={() => setFareModal(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
//                                 <XMarkIcon className="w-5 h-5" />
//                             </button>
//                         </div>

//                         <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
//                             {fareData.length === 0 ? (
//                                 <div className="text-center py-16">
//                                     <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                         <CurrencyRupeeIcon className="w-10 h-10 text-gray-400" />
//                                     </div>
//                                     <p className="text-gray-500 font-medium">No stops configured for this route yet.</p>
//                                     <p className="text-sm text-gray-400 mt-1">Add stops to the route first to create fare rules.</p>
//                                 </div>
//                             ) : (
//                                 <>
//                                     {/* Stats Summary */}
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                                         <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Total Fare Segments</p><p className="text-2xl font-bold text-gray-900">{totalFares}</p></div>
//                                         <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Configured Fares</p><p className="text-2xl font-bold text-emerald-600">{totalConfigured}</p></div>
//                                         <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Pending Configuration</p><p className="text-2xl font-bold text-amber-600">{totalFares - totalConfigured}</p></div>
//                                     </div>

//                                     {/* Fares Table */}
//                                     <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
//                                         <table className="w-full text-sm">
//                                             <thead>
//                                                 <tr className="bg-gray-50 border-b border-gray-200">
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">From</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">To</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount (₹)</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="divide-y divide-gray-100">
//                                                 {fareData.map((f, idx) => (
//                                                     <tr key={idx} className="hover:bg-gray-50 transition group">
//                                                         <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
//                                                         <td className="px-4 py-3 font-medium text-gray-800">{f.from}</td>
//                                                         <td className="px-4 py-3 text-gray-600">{f.to}</td>
//                                                         <td className="px-4 py-3">
//                                                             {editingFareId === idx ? (
//                                                                 <div className="flex items-center gap-2">
//                                                                     <input type="text" value={tempFareAmount} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setTempFareAmount(val); }} className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus onKeyPress={(e) => { if (e.key === 'Enter') saveFareAmount(idx); if (e.key === 'Escape') cancelEditing(); }} />
//                                                                     <button onClick={() => saveFareAmount(idx)} className="text-emerald-600"><CheckCircleIcon className="w-5 h-5" /></button>
//                                                                     <button onClick={cancelEditing} className="text-gray-400"><XMarkIcon className="w-5 h-5" /></button>
//                                                                 </div>
//                                                             ) : (
//                                                                 <div onClick={() => startEditingFare(idx, f.amount)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer group-hover:bg-gray-100 ${f.amount === 0 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700'}`}>
//                                                                     <CurrencyRupeeIcon className="w-4 h-4" />
//                                                                     <span className="font-medium">{f.amount === 0 ? 'Set amount' : f.amount}</span>
//                                                                     {f.amount === 0 && <span className="text-xs text-red-500">(Required)</span>}
//                                                                 </div>
//                                                             )}
//                                                         </td>
//                                                         <td className="px-4 py-3">
//                                                             <label className="relative inline-flex items-center cursor-pointer">
//                                                                 <input type="checkbox" className="sr-only peer" checked={f.is_active} onChange={(e) => { const updated = [...fareData]; updated[idx].is_active = e.target.checked; setFareData(updated); }} />
//                                                                 <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
//                                                                 <span className={`ml-3 text-xs font-medium ${f.is_active ? 'text-emerald-600' : 'text-gray-500'}`}>{f.is_active ? 'Active' : 'Inactive'}</span>
//                                                             </label>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     {/* Action Buttons */}
//                                     <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//                                         <button onClick={() => setFareModal(false)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
//                                         <button onClick={handleManageFare} disabled={totalConfigured === 0} className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Save Fares</button>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     </motion.div>
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
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stops.slice(0, 5).map((s) => (
                                                            <tr key={s.stop_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                                <td className="px-4 py-3 text-gray-700">{s.name}</td>
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.latitude).toFixed(6)}</td>
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.longitude).toFixed(6)}</td>
                                                                <td className="px-4 py-3">
                                                                    <button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button>
                                                                </td>
                                                            </tr>
                                                        ))}
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
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200">
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AC</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stops</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {routes.slice(0, 5).map((r) => (
                                                            <tr key={r.route_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                                <td className="px-4 py-3 text-gray-700 font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td>
                                                                <td className="px-4 py-3 text-gray-600">{r.code}</td>
                                                                <td className="px-4 py-3">{r.has_ac ? '✓ Yes' : '✗ No'}</td>
                                                                <td className="px-4 py-3 text-gray-600">{r.total_stops}</td>
                                                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex gap-2">
                                                                        <button onClick={() => { setSelectedRouteId(r.route_id); setShowStopModal(true); }} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium">Add Stops</button>
                                                                        <button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium">Toggle</button>
                                                                        <button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Fares</button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
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

            {/* All Routes Modal */}
            <Modal isOpen={showRoutesModal} onClose={() => setShowRoutesModal(false)} title="All Routes">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AC</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stops</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.map((r) => (
                                <tr key={r.route_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-700 font-medium cursor-pointer text-blue-600 hover:underline" onClick={() => openRouteDetails(r.route_id)}>{r.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.code}</td>
                                    <td className="px-4 py-3">{r.has_ac ? '✓ Yes' : '✗ No'}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.total_stops}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedRouteId(r.route_id); setShowRoutesModal(false); setShowStopModal(true); }} className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-medium">Add Stops</button>
                                            <button onClick={() => toggleRoute(r.route_id, r.is_active)} className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs font-medium">Toggle</button>
                                            <button onClick={() => getFaresForRoute(r.route_id)} className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-xs font-medium">Fares</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* All Stops Modal */}
            <Modal isOpen={showStopsModal} onClose={() => setShowStopsModal(false)} title="All Stops">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Latitude</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Longitude</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stops.map((s) => (
                                <tr key={s.stop_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-700">{s.name}</td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.latitude).toFixed(6)}</td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{parseFloat(s.longitude).toFixed(6)}</td>
                                    <td className="px-4 py-3"><button onClick={() => deleteStop(s.stop_id)} className="text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* Add Stops to Route Modal */}
            <Modal isOpen={showStopModal} onClose={() => setShowStopModal(false)} title="Add Stops to Route">
                <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-3 mb-4"><p className="text-xs text-blue-700">Selected Route ID: <span className="font-mono">{selectedRouteId}</span></p></div>
                    {multiStops.map((s, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold">{(i + 1).toString().padStart(2, '0')}</div>
                                <span className="text-sm font-medium text-gray-700">Stop {i + 1}</span>
                            </div>
                            <select value={s.stop_id} onChange={(e) => { const updated = [...multiStops]; updated[i].stop_id = e.target.value; setMultiStops(updated); }} className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm">
                                <option value="">Select Stop</option>
                                {stops.map((stop) => (<option key={stop.stop_id} value={stop.stop_id}>{stop.name}</option>))}
                            </select>
                            <input placeholder="Time difference (minutes)" type="number" value={s.assume_time_diff_minutes} onChange={(e) => { const updated = [...multiStops]; updated[i].assume_time_diff_minutes = e.target.value; setMultiStops(updated); }} className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm" />
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.boarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].boarding_allowed = e.target.checked; setMultiStops(updated); }} /> Boarding</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.deboarding_allowed} onChange={(e) => { const updated = [...multiStops]; updated[i].deboarding_allowed = e.target.checked; setMultiStops(updated); }} /> Deboarding</label>
                            </div>
                            {multiStops.length > 1 && (<button onClick={() => setMultiStops(multiStops.filter((_, idx) => idx !== i))} className="text-red-500 text-sm mt-2">Remove</button>)}
                        </div>
                    ))}
                    <button onClick={() => setMultiStops([...multiStops, { stop_id: "", boarding_allowed: true, deboarding_allowed: true, assume_time_diff_minutes: 0 }])} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">+ Add Another Stop</button>
                    <button onClick={createMultipleStops} disabled={isSubmitting} className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Stops"}</button>
                </div>
            </Modal>

            {/* Route Details Modal */}
            <Modal isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} title={routeDetails?.name || "Route Details"}>
                {routeDetails && (
                    <div>
                        <div className="flex gap-4 mb-6 pb-4 border-b border-gray-100">
                            <span className="text-sm text-gray-500">Code: <span className="font-mono text-gray-700">{routeDetails.code}</span></span>
                            <span className={`text-xs px-2 py-1 rounded-full ${routeDetails.has_ac ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{routeDetails.has_ac ? 'AC' : 'Non-AC'}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${routeDetails.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{routeDetails.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        {!routeDetails.path || routeDetails.path.length === 0 ? (
                            <div className="text-center py-12">
                                <MapPinIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No stops added yet.</p>
                                <button onClick={() => { setSelectedRouteId(routeDetails.route_id); setShowRouteModal(false); setShowStopModal(true); }} className="mt-3 text-emerald-600 text-sm font-medium">+ Add Stops</button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {routeDetails.path.map((stop, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold text-sm">{stop.sequence_no}</div>
                                        <div>
                                            <p className="font-medium text-gray-900">{stop.stop_name}</p>
                                            <p className="text-xs text-gray-500">Lat: {stop.latitude?.toFixed(4)}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${stop.boarding ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>Board</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${stop.deboarding ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>Deboard</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Total Fare Segments</p><p className="text-2xl font-bold text-gray-900">{totalFares}</p></div>
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Configured Fares</p><p className="text-2xl font-bold text-emerald-600">{totalConfigured}</p></div>
                                        <div className="bg-gray-50 rounded-xl p-4"><p className="text-gray-500 text-sm">Pending Configuration</p><p className="text-2xl font-bold text-amber-600">{totalFares - totalConfigured}</p></div>
                                    </div>

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
                                                    <tr key={`${f.pickup_stop_id}-${f.dropoff_stop_id}`} className="hover:bg-gray-50 transition group">
                                                        <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-800">{f.from}</td>
                                                        <td className="px-4 py-3 text-gray-600">{f.to}</td>
                                                        <td className="px-4 py-3">
                                                            {editingFareId === idx ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="relative">
                                                                        <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                        <input
                                                                            type="text"
                                                                            value={tempFareAmount}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                if (val === '' || /^\d+$/.test(val)) {
                                                                                    setTempFareAmount(val);
                                                                                }
                                                                            }}
                                                                            className="w-32 pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                                            autoFocus
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') saveFareAmount(idx);
                                                                                if (e.key === 'Escape') cancelEditing();
                                                                            }}
                                                                            onBlur={() => {
                                                                                setTimeout(() => {
                                                                                    if (editingFareId === idx) cancelEditing();
                                                                                }, 200);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <button onClick={() => saveFareAmount(idx)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition" type="button">
                                                                        <CheckCircleIcon className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={cancelEditing} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition" type="button">
                                                                        <XMarkIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingFareId(idx);
                                                                        setTempFareAmount(f.amount === 0 ? "" : f.amount.toString());
                                                                    }}
                                                                    className={`inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 w-full group-hover:bg-gray-100 ${f.amount === 0
                                                                        ? 'bg-red-50 hover:bg-red-100 border border-red-200'
                                                                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                                                        }`}
                                                                    type="button"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <CurrencyRupeeIcon className={`w-4 h-4 ${f.amount === 0 ? 'text-red-400' : 'text-gray-500'}`} />
                                                                        <span className={`font-medium ${f.amount === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                                                            {f.amount === 0 ? 'Set amount' : f.amount}
                                                                        </span>
                                                                    </div>
                                                                    {f.amount === 0 && (
                                                                        <span className="text-xs text-red-400 bg-red-100 px-2 py-0.5 rounded-full">Required</span>
                                                                    )}
                                                                    {f.amount > 0 && (
                                                                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Configured</span>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only peer"
                                                                    checked={f.is_active}
                                                                    onChange={(e) => {
                                                                        const updated = [...fareData];
                                                                        updated[idx].is_active = e.target.checked;
                                                                        setFareData(updated);
                                                                    }}
                                                                />
                                                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                                                <span className={`ml-3 text-xs font-medium ${f.is_active ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                                    {f.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

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

