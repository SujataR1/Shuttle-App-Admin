// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
// import { 
//   ArrowLeftIcon, 
//   CheckCircleIcon, 
//   XCircleIcon, 
//   EyeIcon,
//   ClipboardIcon,
//   TruckIcon,
//   UserIcon,
//   EnvelopeIcon,
//   PhoneIcon,
//   CreditCardIcon,
//   DocumentTextIcon,
//   BanknotesIcon,
//   XMarkIcon
// } from "@heroicons/react/24/outline";

// const VerifyDriver = () => {
//   const { state } = useLocation();
//   const params = useParams();
//   const navigate = useNavigate();

//   const userId = state?.userId || params.userId;

//   const [drivers, setDrivers] = useState([]);
//   const [driver, setDriver] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [initialLoad, setInitialLoad] = useState(true);

//   const [showRejectBox, setShowRejectBox] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [updating, setUpdating] = useState(false);

//   const [modalImage, setModalImage] = useState(null);
  
//   const [imageLoading, setImageLoading] = useState({});
//   const [hoveredPhoto, setHoveredPhoto] = useState(null);
  
//   const [wsConnected, setWsConnected] = useState(false);
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);

//   const token = localStorage.getItem("access_token");

//   const handleImageLoad = (photoKey) => {
//     setImageLoading(prev => ({ ...prev, [photoKey]: false }));
//   };

//   const refreshCurrentDriver = useCallback(async () => {
//     if (userId) {
//       try {
//         const response = await axios.get(
//           `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setDriver(response.data);
//       } catch (error) {
//         console.error("Error refreshing driver:", error);
//       }
//     }
//   }, [userId, token]);

//   const refreshDriversList = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         "https://be.shuttleapp.transev.site/admin/view/all-drivers",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       const driversWithVehicleStatus = await Promise.all(
//         response.data.map(async (driver) => {
//           try {
//             const detailRes = await axios.get(
//               `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );
//             return {
//               ...driver,
//               vehicle_verification: detailRes.data.vehicle?.verification || "N/A"
//             };
//           } catch (err) {
//             return { ...driver, vehicle_verification: "N/A" };
//           }
//         })
//       );
      
//       setDrivers(driversWithVehicleStatus);
//     } catch (error) {
//       console.error("Error refreshing drivers list:", error);
//     }
//   }, [token]);

//   const handleWebSocketMessage = useCallback((event) => {
//     try {
//       const payload = JSON.parse(event.data);
      
//       if (payload?.type === "ping") {
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ type: "pong" }));
//         }
//         return;
//       }
      
//       if (payload?.message === "WebSocket authenticated successfully.") {
//         setWsConnected(true);
//         return;
//       }
      
//       if (payload?.id && payload?.title && payload?.message) {
//         const isVehicleVerification = 
//           payload.title?.toLowerCase().includes("vehicle") ||
//           payload.title?.toLowerCase().includes("verification") ||
//           payload.message?.toLowerCase().includes("vehicle");
        
//         if (isVehicleVerification) {
//           if (userId) {
//             refreshCurrentDriver();
//           } else {
//             refreshDriversList();
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error parsing WebSocket message:", error);
//     }
//   }, [userId, refreshCurrentDriver, refreshDriversList]);

//   const connectWebSocket = useCallback(() => {
//     if (!token) return;
    
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.close();
//     }
    
//     const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(token)}`;
//     const websocket = new WebSocket(wsUrl);
    
//     websocket.onopen = () => {};
//     websocket.onmessage = handleWebSocketMessage;
//     websocket.onerror = () => setWsConnected(false);
//     websocket.onclose = () => {
//       setWsConnected(false);
//       if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 5000);
//     };
    
//     wsRef.current = websocket;
//   }, [token, handleWebSocketMessage]);

//   useEffect(() => {
//     if (token) {
//       connectWebSocket();
//     }
    
//     return () => {
//       if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
//       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         wsRef.current.close();
//       }
//     };
//   }, [token, connectWebSocket]);

//   const fetchAllDrivers = async () => {
//     try {
//       const response = await axios.get(
//         "https://be.shuttleapp.transev.site/admin/view/all-drivers",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       const driversWithVehicleStatus = await Promise.all(
//         response.data.map(async (driver) => {
//           try {
//             const detailRes = await axios.get(
//               `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );
//             return {
//               ...driver,
//               vehicle_verification: detailRes.data.vehicle?.verification || "N/A"
//             };
//           } catch (err) {
//             return { ...driver, vehicle_verification: "N/A" };
//           }
//         })
//       );
      
//       setDrivers(driversWithVehicleStatus);
//     } catch (error) {
//       console.error("Error fetching drivers:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchDriverOrList = async () => {
//       setLoading(true);
//       try {
//         if (userId) {
//           const response = await axios.get(
//             `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           setDriver(response.data);
//         } else {
//           await fetchAllDrivers();
//         }
//       } catch (error) {
//         console.error("Error fetching driver(s):", error);
//       } finally {
//         setLoading(false);
//         setInitialLoad(false);
//       }
//     };

//     fetchDriverOrList();
//   }, [userId, token]);

//   if (initialLoad || loading) {
//     return (
//       <div className="flex min-h-screen bg-white">
//         <Sidebar />
//         <div className="flex-1 flex flex-col">
//           <TopNavbarUltra />
//           <div className="flex items-center justify-center h-full p-6">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
//               <p className="text-gray-500">Loading...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const buildFileUrl = (path) => {
//     if (!path || path === "NA") return null;
//     const fixedPath = path.replace(/\\/g, "/");
//     return `https://be.shuttleapp.transev.site/${fixedPath}`;
//   };

//   const handleVerification = async (status) => {
//     if (status === "rejected" && !rejectionReason.trim()) {
//       return alert("Please provide a rejection reason");
//     }

//     try {
//       setUpdating(true);

//       const payload = {
//         status,
//         ...(status === "rejected" ? { rejection_reason: rejectionReason } : {}),
//       };

//       await axios.post(
//         `https://be.shuttleapp.transev.site/admin/vehicle/verify/${driver.user_id}`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const updatedDriver = await axios.get(
//         `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setDriver(updatedDriver.data);
//       localStorage.setItem("refreshDriversList", "true");

//       setShowRejectBox(false);
//       setRejectionReason("");
//       alert(status === "verified" ? "Vehicle verified successfully!" : "Vehicle rejected successfully!");
//     } catch (error) {
//       console.error("Verification error:", error);
//       alert("Failed to update verification status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const copyToClipboard = (text, label) => {
//     navigator.clipboard.writeText(text);
//     alert(`${label} copied to clipboard!`);
//   };

//   const getStatusBadge = (status) => {
//     const statusLower = status?.toLowerCase();
//     if (statusLower === "verified") {
//       return <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700">Verified</span>;
//     }
//     if (statusLower === "rejected") {
//       return <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700">Rejected</span>;
//     }
//     if (statusLower === "pending") {
//       return <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-50 text-yellow-700">Pending</span>;
//     }
//     return <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-600">Not Started</span>;
//   };

//   const renderSingleDriver = (d) => {
//     const verificationStatus = d.vehicle?.verification?.toLowerCase();

//     return (
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header with Back Button */}
//         <div className="flex items-center justify-between">
//           <button
//             onClick={() => {
//               setDriver(null);
//               setInitialLoad(true);
//               fetchAllDrivers().finally(() => setInitialLoad(false));
//             }}
//             className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors"
//           >
//             <ArrowLeftIcon className="w-4 h-4" />
//             <span className="text-sm font-medium">Back to Dashboard</span>
//           </button>
          
//           <div className="flex items-center gap-3">
//             <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
//             <span className="text-xs text-gray-500">{wsConnected ? 'Live' : 'Reconnecting...'}</span>
//           </div>
//         </div>

//         {/* Driver Header Card */}
//         <div className="bg-white border border-gray-200 rounded-2xl p-6">
//           <div className="flex items-start gap-5">
//             <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
//               <UserIcon className="w-8 h-8 text-white" />
//             </div>
//             <div className="flex-1">
//               <h1 className="text-2xl font-bold text-gray-900 mb-1">{d.profile?.full_name || d.profile?.name || "N/A"}</h1>
//               <div className="flex flex-wrap gap-3 text-sm text-gray-500">
//                 <span className="font-mono text-xs">ID: {d.user_id?.slice(0, 8)}...</span>
//                 <span>{d.email}</span>
//                 <span>{d.profile?.phone}</span>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-xs text-gray-400 mb-1">Verification Status</div>
//               {getStatusBadge(d.vehicle?.verification)}
//             </div>
//           </div>
//         </div>

//         {/* Two Column Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Personal Information */}
//           <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <div className="flex items-center gap-2">
//                 <UserIcon className="w-4 h-4 text-gray-400" />
//                 <h2 className="font-semibold text-gray-900">Personal Information</h2>
//               </div>
//             </div>
//             <div className="p-5 space-y-4">
//               <div>
//                 <label className="text-xs text-gray-400 uppercase tracking-wide">Full Name</label>
//                 <p className="text-gray-900 font-medium mt-1">{d.profile?.full_name || d.profile?.name || "N/A"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 uppercase tracking-wide">Email Address</label>
//                 <p className="text-gray-900 mt-1 break-all">{d.email || "N/A"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 uppercase tracking-wide">Phone Number</label>
//                 <p className="text-gray-900 mt-1">{d.profile?.phone || "N/A"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 uppercase tracking-wide">KYC Status</label>
//                 <div className="mt-1">{getStatusBadge(d.profile?.verification_status)}</div>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-400 uppercase tracking-wide">Driving License Number</label>
//                 <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded-lg">
//                   <span className="text-sm font-mono text-gray-900">{d.profile?.documents?.driving_license_number || "N/A"}</span>
//                   {d.profile?.documents?.driving_license_number && (
//                     <button onClick={() => copyToClipboard(d.profile.documents.driving_license_number, "License number")} className="text-gray-400 hover:text-gray-600">
//                       <ClipboardIcon className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//                 {buildFileUrl(d.profile?.documents?.dl_url) && (
//                   <button
//                     onClick={() => setModalImage(buildFileUrl(d.profile.documents.dl_url))}
//                     className="mt-2 text-xs text-gray-600 hover:text-black flex items-center gap-1"
//                   >
//                     <EyeIcon className="w-3 h-3" />
//                     View License Document
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Vehicle Details */}
//           <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <div className="flex items-center gap-2">
//                 <TruckIcon className="w-4 h-4 text-gray-400" />
//                 <h2 className="font-semibold text-gray-900">Vehicle Details</h2>
//               </div>
//             </div>
//             <div className="p-5 space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Registration No</label>
//                   <p className="text-gray-900 font-mono text-sm mt-1">{d.vehicle?.reg_no || "N/A"}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Valid Till</label>
//                   <p className="text-gray-900 text-sm mt-1">
//                     {d.vehicle?.reg_valid_till ? new Date(d.vehicle.reg_valid_till).toLocaleDateString() : "N/A"}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Model</label>
//                   <p className="text-gray-900 text-sm mt-1">{d.vehicle?.model || "N/A"}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Capacity</label>
//                   <p className="text-gray-900 text-sm mt-1">{d.vehicle?.capacity || 0} seats</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">AC</label>
//                   <p className="text-gray-900 text-sm mt-1">{d.vehicle?.has_ac ? "Yes" : "No"}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Ownership Type</label>
//                   <p className="text-gray-900 text-sm mt-1">{d.vehicle?.vehical_owner_ship_type || "N/A"}</p>
//                 </div>
//               </div>
              
//               {/* Vehicle Photos */}
//               <div className="pt-2">
//                 <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Vehicle Documents</label>
//                 <div className="grid grid-cols-2 gap-3">
//                   {buildFileUrl(d.vehicle?.rc_file_path) ? (
//                     <div 
//                       className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200"
//                       onClick={() => setModalImage(buildFileUrl(d.vehicle.rc_file_path))}
//                     >
//                       <img
//                         src={buildFileUrl(d.vehicle.rc_file_path)}
//                         alt="RC Certificate"
//                         className="w-full h-32 object-cover"
//                         onLoad={() => handleImageLoad('rc')}
//                       />
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                         <EyeIcon className="w-5 h-5 text-white" />
//                       </div>
//                       <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
//                         <p className="text-white text-xs">RC Certificate</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="h-32 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
//                       <p className="text-xs text-gray-400">No RC photo</p>
//                     </div>
//                   )}
                  
//                   {buildFileUrl(d.vehicle?.rear_photo_file_path) ? (
//                     <div 
//                       className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200"
//                       onClick={() => setModalImage(buildFileUrl(d.vehicle.rear_photo_file_path))}
//                     >
//                       <img
//                         src={buildFileUrl(d.vehicle.rear_photo_file_path)}
//                         alt="Rear View"
//                         className="w-full h-32 object-cover"
//                         onLoad={() => handleImageLoad('rear')}
//                       />
//                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                         <EyeIcon className="w-5 h-5 text-white" />
//                       </div>
//                       <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
//                         <p className="text-white text-xs">Rear View</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="h-32 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
//                       <p className="text-xs text-gray-400">No rear photo</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bank Information - Full Width */}
//           <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
//             <div className="px-5 py-4 border-b border-gray-100">
//               <div className="flex items-center gap-2">
//                 <BanknotesIcon className="w-4 h-4 text-gray-400" />
//                 <h2 className="font-semibold text-gray-900">Bank Account Information</h2>
//               </div>
//             </div>
//             <div className="p-5">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Account Number</label>
//                   <div className="flex items-center gap-2 mt-1">
//                     <p className="text-gray-900 font-mono text-sm">{d.account_info?.account_number || "N/A"}</p>
//                     {d.account_info?.account_number && (
//                       <button onClick={() => copyToClipboard(d.account_info.account_number, "Account number")} className="text-gray-400 hover:text-gray-600">
//                         <ClipboardIcon className="w-3.5 h-3.5" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">IFSC Code</label>
//                   <p className="text-gray-900 font-mono text-sm mt-1">{d.account_info?.IFSC_code || "N/A"}</p>
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 uppercase tracking-wide">Passbook</label>
//                   {buildFileUrl(d.account_info?.passbook_url) ? (
//                     <button
//                       onClick={() => setModalImage(buildFileUrl(d.account_info.passbook_url))}
//                       className="mt-1 text-sm text-gray-600 hover:text-black flex items-center gap-1"
//                     >
//                       <EyeIcon className="w-3.5 h-3.5" />
//                       View Document
//                     </button>
//                   ) : (
//                     <p className="text-gray-400 text-sm mt-1">Not uploaded</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="bg-white border border-gray-200 rounded-2xl p-6">
//           {verificationStatus !== "verified" && verificationStatus !== "rejected" ? (
//             <div className="flex gap-4">
//               <button
//                 onClick={() => handleVerification("verified")}
//                 disabled={updating}
//                 className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
//               >
//                 {updating ? "Processing..." : "Approve Vehicle"}
//               </button>
//               <button
//                 onClick={() => setShowRejectBox(!showRejectBox)}
//                 disabled={updating}
//                 className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
//               >
//                 Reject Vehicle
//               </button>
//             </div>
//           ) : (
//             <div className="text-center py-2">
//               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${verificationStatus === "verified" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
//                 {verificationStatus === "verified" ? (
//                   <CheckCircleIcon className="w-5 h-5" />
//                 ) : (
//                   <XCircleIcon className="w-5 h-5" />
//                 )}
//                 <span className="font-medium">Vehicle {verificationStatus === "verified" ? "Verified" : "Rejected"}</span>
//               </div>
//             </div>
//           )}

//           {/* Rejection Reason Box */}
//           {showRejectBox && (
//             <div className="mt-5 pt-5 border-t border-gray-100">
//               <label className="text-sm font-medium text-gray-700 block mb-2">Rejection Reason</label>
//               <textarea
//                 placeholder="Please provide a detailed reason for rejection..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
//                 rows="3"
//               />
//               <div className="flex justify-end gap-3 mt-3">
//                 <button
//                   onClick={() => {
//                     setShowRejectBox(false);
//                     setRejectionReason("");
//                   }}
//                   className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleVerification("rejected")}
//                   disabled={updating || !rejectionReason.trim()}
//                   className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
//                 >
//                   Submit Rejection
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const renderDriversList = () => (
//     <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-100">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Status</th>
//               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 bg-white">
//             {drivers.map((d) => {
//               const vehicleStatus = d.vehicle_verification?.toLowerCase();
//               const isVerified = vehicleStatus === "verified";
//               const isRejected = vehicleStatus === "rejected";
//               const isPending = vehicleStatus === "pending" || vehicleStatus === "draft";

//               return (
//                 <tr
//                   key={d.user_id}
//                   className="hover:bg-gray-50 transition-colors cursor-pointer"
//                   onClick={() => {
//                     setInitialLoad(true);
//                     navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
//                   }}
//                 >
//                   <td className="px-6 py-4">
//                     <div className="font-medium text-gray-900">{d.profile?.name || d.profile?.full_name || "N/A"}</div>
//                     <div className="text-sm text-gray-500">{d.email || "N/A"}</div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">{d.profile?.phone || "N/A"}</td>
//                   <td className="px-6 py-4">
//                     {isVerified ? (
//                       <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
//                         <CheckCircleIcon className="w-3 h-3" />
//                         Verified
//                       </span>
//                     ) : isRejected ? (
//                       <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
//                         <XCircleIcon className="w-3 h-3" />
//                         Rejected
//                       </span>
//                     ) : isPending ? (
//                       <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
//                         Pending
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
//                         Not Started
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
//                     {!isVerified && !isRejected && (
//                       <button
//                         className="px-3 py-1.5 bg-black text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
//                         onClick={() => {
//                           setInitialLoad(true);
//                           navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
//                         }}
//                       >
//                         Verify Now
//                       </button>
//                     )}
//                     {isVerified && <span className="text-xs text-green-600">Verified</span>}
//                     {isRejected && <span className="text-xs text-red-600">Rejected</span>}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//         {drivers.length === 0 && (
//           <div className="text-center py-12">
//             <p className="text-gray-500">No drivers found</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <TopNavbarUltra />
//         <div className="p-8 flex-1 overflow-auto">
//           <h1 className="text-2xl font-bold text-gray-900 mb-6">
//             {driver ? "Vehicle Verification" : "Verification Requests"}
//           </h1>
//           {driver ? renderSingleDriver(driver) : renderDriversList()}
//         </div>
//       </div>

//       {/* Image Modal */}
//       {modalImage && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
//           <div className="relative max-w-4xl max-h-[90vh]">
//             <img src={modalImage} alt="Full View" className="max-h-full max-w-full rounded-lg" />
//             <button
//               className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
//               onClick={() => setModalImage(null)}
//             >
//               <XMarkIcon className="w-5 h-5 text-gray-800" />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VerifyDriver;
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ClipboardIcon,
  TruckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BanknotesIcon,
  XMarkIcon,
  CameraIcon,
  PhotoIcon,
  IdentificationIcon,
  CalendarIcon,
  MapPinIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";

const VerifyDriver = () => {
  const { state } = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const userId = state?.userId || params.userId;

  const [drivers, setDrivers] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const [modalImage, setModalImage] = useState(null);
  
  const [imageLoading, setImageLoading] = useState({});
  const [hoveredPhoto, setHoveredPhoto] = useState(null);
  
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const token = localStorage.getItem("access_token");

  const handleImageLoad = (photoKey) => {
    setImageLoading(prev => ({ ...prev, [photoKey]: false }));
  };

  const refreshCurrentDriver = useCallback(async () => {
    if (userId) {
      try {
        const response = await axios.get(
          `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDriver(response.data);
      } catch (error) {
        console.error("Error refreshing driver:", error);
      }
    }
  }, [userId, token]);

  const refreshDriversList = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/admin/view/all-drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const driversWithVehicleStatus = await Promise.all(
        response.data.map(async (driver) => {
          try {
            const detailRes = await axios.get(
              `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...driver,
              vehicle_verification: detailRes.data.vehicle?.verification || "N/A",
              vehicle: detailRes.data.vehicle,
              profile: detailRes.data.profile,
              account_info: detailRes.data.account_info,
              vehical_physical_inspection: detailRes.data.vehical_physical_inspection
            };
          } catch (err) {
            return { ...driver, vehicle_verification: "N/A" };
          }
        })
      );
      
      setDrivers(driversWithVehicleStatus);
    } catch (error) {
      console.error("Error refreshing drivers list:", error);
    }
  }, [token]);

  const handleWebSocketMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.data);
      
      if (payload?.type === "ping") {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "pong" }));
        }
        return;
      }
      
      if (payload?.message === "WebSocket authenticated successfully.") {
        setWsConnected(true);
        return;
      }
      
      if (payload?.id && payload?.title && payload?.message) {
        const isVehicleVerification = 
          payload.title?.toLowerCase().includes("vehicle") ||
          payload.title?.toLowerCase().includes("verification") ||
          payload.message?.toLowerCase().includes("vehicle");
        
        if (isVehicleVerification) {
          if (userId) {
            refreshCurrentDriver();
          } else {
            refreshDriversList();
          }
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, [userId, refreshCurrentDriver, refreshDriversList]);

  const connectWebSocket = useCallback(() => {
    if (!token) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(token)}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {};
    websocket.onmessage = handleWebSocketMessage;
    websocket.onerror = () => setWsConnected(false);
    websocket.onclose = () => {
      setWsConnected(false);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 5000);
    };
    
    wsRef.current = websocket;
  }, [token, handleWebSocketMessage]);

  useEffect(() => {
    if (token) {
      connectWebSocket();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [token, connectWebSocket]);

  const fetchAllDrivers = async () => {
    try {
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/admin/view/all-drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const driversWithVehicleStatus = await Promise.all(
        response.data.map(async (driver) => {
          try {
            const detailRes = await axios.get(
              `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...driver,
              vehicle_verification: detailRes.data.vehicle?.verification || "N/A",
              vehicle: detailRes.data.vehicle,
              profile: detailRes.data.profile,
              account_info: detailRes.data.account_info,
              vehical_physical_inspection: detailRes.data.vehical_physical_inspection
            };
          } catch (err) {
            return { ...driver, vehicle_verification: "N/A" };
          }
        })
      );
      
      setDrivers(driversWithVehicleStatus);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  useEffect(() => {
    const fetchDriverOrList = async () => {
      setLoading(true);
      try {
        if (userId) {
          const response = await axios.get(
            `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setDriver(response.data);
        } else {
          await fetchAllDrivers();
        }
      } catch (error) {
        console.error("Error fetching driver(s):", error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchDriverOrList();
  }, [userId, token]);

  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbarUltra />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const buildFileUrl = (path) => {
    if (!path || path === "NA") return null;
    const fixedPath = path.replace(/\\/g, "/");
    return `https://be.shuttleapp.transev.site/${fixedPath}`;
  };

  const handleVerification = async (status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      return alert("Please provide a rejection reason");
    }

    try {
      setUpdating(true);

      const payload = {
        status,
        ...(status === "rejected" ? { rejection_reason: rejectionReason } : {}),
      };

      await axios.post(
        `https://be.shuttleapp.transev.site/admin/vehicle/verify/${driver.user_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedDriver = await axios.get(
        `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDriver(updatedDriver.data);
      localStorage.setItem("refreshDriversList", "true");

      setShowRejectBox(false);
      setRejectionReason("");
      alert(status === "verified" ? "Vehicle verified successfully!" : "Vehicle rejected successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to update verification status");
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "verified") {
      return <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700">Verified</span>;
    }
    if (statusLower === "rejected") {
      return <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700">Rejected</span>;
    }
    if (statusLower === "pending") {
      return <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-50 text-yellow-700">Pending</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-600">Not Started</span>;
  };

  const renderSingleDriver = (d) => {
    const verificationStatus = d.vehicle?.verification?.toLowerCase();

    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setDriver(null);
              setInitialLoad(true);
              fetchAllDrivers().finally(() => setInitialLoad(false));
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">{wsConnected ? 'Live' : 'Reconnecting...'}</span>
          </div>
        </div>

        {/* Driver Header Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{d.profile?.full_name || d.profile?.name || "N/A"}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="font-mono text-xs">ID: {d.user_id?.slice(0, 8)}...</span>
                <span>{d.email}</span>
                <span>{d.profile?.phone}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Verification Status</div>
              {getStatusBadge(d.vehicle?.verification)}
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Personal Information</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Full Name</label>
                <p className="text-gray-900 font-medium mt-1">{d.profile?.full_name || d.profile?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Email Address</label>
                <p className="text-gray-900 mt-1 break-all">{d.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Phone Number</label>
                <p className="text-gray-900 mt-1">{d.profile?.phone || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">KYC Status</label>
                <div className="mt-1">{getStatusBadge(d.profile?.verification_status)}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Driving License Number</label>
                <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono text-gray-900">{d.profile?.documents?.driving_license_number || "N/A"}</span>
                  {d.profile?.documents?.driving_license_number && (
                    <button onClick={() => copyToClipboard(d.profile.documents.driving_license_number, "License number")} className="text-gray-400 hover:text-gray-600">
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {buildFileUrl(d.profile?.documents?.dl_url) && (
                  <button
                    onClick={() => setModalImage(buildFileUrl(d.profile.documents.dl_url))}
                    className="mt-2 text-xs text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    <EyeIcon className="w-3 h-3" />
                    View License Document
                  </button>
                )}
              </div>
              {/* Aadhaar Card */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Aadhaar Number</label>
                <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono text-gray-900">{d.profile?.documents?.aadhaar_number || "N/A"}</span>
                  {d.profile?.documents?.aadhaar_number && (
                    <button onClick={() => copyToClipboard(d.profile.documents.aadhaar_number, "Aadhaar number")} className="text-gray-400 hover:text-gray-600">
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {buildFileUrl(d.profile?.documents?.aadhaar_url) && (
                  <button
                    onClick={() => setModalImage(buildFileUrl(d.profile.documents.aadhaar_url))}
                    className="mt-2 text-xs text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    <EyeIcon className="w-3 h-3" />
                    View Aadhaar Document
                  </button>
                )}
              </div>
              {/* PAN Card */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">PAN Number</label>
                <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono text-gray-900">{d.profile?.documents?.pan_number || "N/A"}</span>
                  {d.profile?.documents?.pan_number && (
                    <button onClick={() => copyToClipboard(d.profile.documents.pan_number, "PAN number")} className="text-gray-400 hover:text-gray-600">
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {buildFileUrl(d.profile?.documents?.pan_url) && (
                  <button
                    onClick={() => setModalImage(buildFileUrl(d.profile.documents.pan_url))}
                    className="mt-2 text-xs text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    <EyeIcon className="w-3 h-3" />
                    View PAN Document
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Vehicle Details</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Registration No</label>
                  <p className="text-gray-900 font-mono text-sm mt-1">{d.vehicle?.reg_no || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Valid Till</label>
                  <p className="text-gray-900 text-sm mt-1">
                    {d.vehicle?.reg_valid_till ? new Date(d.vehicle.reg_valid_till).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Vehicle Name</label>
                  <p className="text-gray-900 text-sm mt-1">{d.vehicle?.vehical_name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Model</label>
                  <p className="text-gray-900 text-sm mt-1">{d.vehicle?.model || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Color</label>
                  <p className="text-gray-900 text-sm mt-1">{d.vehicle?.color || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Capacity</label>
                  <p className="text-gray-900 text-sm mt-1">{d.vehicle?.capacity || 0} seats</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">AC</label>
                  <p className="text-gray-900 text-sm mt-1">{d.vehicle?.has_ac ? "Yes" : "No"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Ownership Type</label>
                  <p className="text-gray-900 text-sm mt-1">{d.vehicle?.vehical_owner_ship_type || "N/A"}</p>
                </div>
                {d.vehicle?.owner_name && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Owner Name</label>
                    <p className="text-gray-900 text-sm mt-1">{d.vehicle.owner_name}</p>
                  </div>
                )}
              </div>
              
              {/* Verification Dates */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Verification Timeline</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400">Request Date</label>
                    <p className="text-gray-900 text-sm mt-1">
                      {d.vehicle?.vechical_verification_req_date ? 
                        new Date(d.vehicle.vechical_verification_req_date).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Reviewed At</label>
                    <p className="text-gray-900 text-sm mt-1">
                      {d.vehicle?.vehical_reviewed_at ? 
                        new Date(d.vehicle.vehical_reviewed_at).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Photos - All Vehicle Documents */}
              <div className="pt-2">
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Vehicle Documents & Photos</label>
                <div className="grid grid-cols-2 gap-3">
                  {buildFileUrl(d.vehicle?.rc_file_path) ? (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-video"
                      onClick={() => setModalImage(buildFileUrl(d.vehicle.rc_file_path))}
                    >
                      <img
                        src={buildFileUrl(d.vehicle.rc_file_path)}
                        alt="RC Certificate"
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad('rc')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-white text-xs">RC Certificate</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center">No RC photo</p>
                    </div>
                  )}
                  
                  {buildFileUrl(d.vehicle?.rear_photo_file_path) ? (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-video"
                      onClick={() => setModalImage(buildFileUrl(d.vehicle.rear_photo_file_path))}
                    >
                      <img
                        src={buildFileUrl(d.vehicle.rear_photo_file_path)}
                        alt="Rear View"
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad('rear')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-white text-xs">Rear View</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center">No rear photo</p>
                    </div>
                  )}

                  {buildFileUrl(d.vehicle?.front_photo_file_path) ? (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-video"
                      onClick={() => setModalImage(buildFileUrl(d.vehicle.front_photo_file_path))}
                    >
                      <img
                        src={buildFileUrl(d.vehicle.front_photo_file_path)}
                        alt="Front View"
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad('front')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-white text-xs">Front View</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center">No front photo</p>
                    </div>
                  )}

                  {buildFileUrl(d.vehicle?.interior_photo_file_path) ? (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-video"
                      onClick={() => setModalImage(buildFileUrl(d.vehicle.interior_photo_file_path))}
                    >
                      <img
                        src={buildFileUrl(d.vehicle.interior_photo_file_path)}
                        alt="Interior View"
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad('interior')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-white text-xs">Interior View</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center">No interior photo</p>
                    </div>
                  )}

                  {buildFileUrl(d.vehicle?.left_side_file_path) ? (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-video"
                      onClick={() => setModalImage(buildFileUrl(d.vehicle.left_side_file_path))}
                    >
                      <img
                        src={buildFileUrl(d.vehicle.left_side_file_path)}
                        alt="Left Side View"
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad('left')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-white text-xs">Left Side View</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center">No left side photo</p>
                    </div>
                  )}

                  {buildFileUrl(d.vehicle?.right_side_file_path) ? (
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-video"
                      onClick={() => setModalImage(buildFileUrl(d.vehicle.right_side_file_path))}
                    >
                      <img
                        src={buildFileUrl(d.vehicle.right_side_file_path)}
                        alt="Right Side View"
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad('right')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-white text-xs">Right Side View</p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center">No right side photo</p>
                    </div>
                  )}
                </div>

                {/* Additional Documents */}
                {(buildFileUrl(d.vehicle?.vechical_auth_file_path) || 
                  buildFileUrl(d.vehicle?.insurance_document) || 
                  buildFileUrl(d.vehicle?.pollution_document) || 
                  buildFileUrl(d.vehicle?.owner_aadhaar_card)) && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Additional Documents</label>
                    <div className="flex flex-wrap gap-2">
                      {buildFileUrl(d.vehicle?.vechical_auth_file_path) && (
                        <button
                          onClick={() => setModalImage(buildFileUrl(d.vehicle.vechical_auth_file_path))}
                          className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Vehicle Authorization
                        </button>
                      )}
                      {buildFileUrl(d.vehicle?.insurance_document) && (
                        <button
                          onClick={() => setModalImage(buildFileUrl(d.vehicle.insurance_document))}
                          className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Insurance Document
                        </button>
                      )}
                      {buildFileUrl(d.vehicle?.pollution_document) && (
                        <button
                          onClick={() => setModalImage(buildFileUrl(d.vehicle.pollution_document))}
                          className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Pollution Certificate
                        </button>
                      )}
                      {buildFileUrl(d.vehicle?.owner_aadhaar_card) && (
                        <button
                          onClick={() => setModalImage(buildFileUrl(d.vehicle.owner_aadhaar_card))}
                          className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Owner Aadhaar Card
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Physical Inspection Section */}
          {d.vehical_physical_inspection && (
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Physical Inspection</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Inspection Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium
                        ${d.vehical_physical_inspection.inspection_status === "approved" ? "bg-green-50 text-green-700" :
                          d.vehical_physical_inspection.inspection_status === "rejected" ? "bg-red-50 text-red-700" :
                          "bg-yellow-50 text-yellow-700"}`}>
                        {d.vehical_physical_inspection.inspection_status || "N/A"}
                      </span>
                    </div>
                  </div>
                  {d.vehical_physical_inspection.inspection_reason && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Reason</label>
                      <p className="text-gray-900 mt-1">{d.vehical_physical_inspection.inspection_reason}</p>
                    </div>
                  )}
                  {d.vehical_physical_inspection.inspection_reviewed_at && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wide">Reviewed At</label>
                      <p className="text-gray-900 mt-1">{new Date(d.vehical_physical_inspection.inspection_reviewed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Information - Full Width */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Bank Account Information</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Account Number</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-900 font-mono text-sm">{d.account_info?.account_number || "N/A"}</p>
                    {d.account_info?.account_number && (
                      <button onClick={() => copyToClipboard(d.account_info.account_number, "Account number")} className="text-gray-400 hover:text-gray-600">
                        <ClipboardIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">IFSC Code</label>
                  <p className="text-gray-900 font-mono text-sm mt-1">{d.account_info?.IFSC_code || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Passbook</label>
                  {buildFileUrl(d.account_info?.passbook_url) ? (
                    <button
                      onClick={() => setModalImage(buildFileUrl(d.account_info.passbook_url))}
                      className="mt-1 text-sm text-gray-600 hover:text-black flex items-center gap-1"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      View Document
                    </button>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">Not uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {verificationStatus !== "verified" && verificationStatus !== "rejected" ? (
            <div className="flex gap-4">
              <button
                onClick={() => handleVerification("verified")}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {updating ? "Processing..." : "Approve Vehicle"}
              </button>
              <button
                onClick={() => setShowRejectBox(!showRejectBox)}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Reject Vehicle
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${verificationStatus === "verified" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {verificationStatus === "verified" ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <XCircleIcon className="w-5 h-5" />
                )}
                <span className="font-medium">Vehicle {verificationStatus === "verified" ? "Verified" : "Rejected"}</span>
              </div>
            </div>
          )}

          {/* Rejection Reason Box */}
          {showRejectBox && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700 block mb-2">Rejection Reason</label>
              <textarea
                placeholder="Please provide a detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => {
                    setShowRejectBox(false);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerification("rejected")}
                  disabled={updating || !rejectionReason.trim()}
                  className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDriversList = () => (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {drivers.map((d) => {
              const vehicleStatus = d.vehicle_verification?.toLowerCase();
              const isVerified = vehicleStatus === "verified";
              const isRejected = vehicleStatus === "rejected";
              const isPending = vehicleStatus === "pending" || vehicleStatus === "draft";

              return (
                <tr
                  key={d.user_id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setInitialLoad(true);
                    navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{d.profile?.name || d.profile?.full_name || "N/A"}</div>
                    <div className="text-sm text-gray-500">{d.email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.profile?.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                        <CheckCircleIcon className="w-3 h-3" />
                        Verified
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
                        <XCircleIcon className="w-3 h-3" />
                        Rejected
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600">
                        Not Started
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {!isVerified && !isRejected && (
                      <button
                        className="px-3 py-1.5 bg-black text-white text-xs rounded-lg hover:bg-gray-800 transition-colors"
                        onClick={() => {
                          setInitialLoad(true);
                          navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
                        }}
                      >
                        Verify Now
                      </button>
                    )}
                    {isVerified && <span className="text-xs text-green-600">Verified</span>}
                    {isRejected && <span className="text-xs text-red-600">Rejected</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {drivers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No drivers found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbarUltra />
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {driver ? "Vehicle Verification" : "Verification Requests"}
            </h1>
            {driver ? renderSingleDriver(driver) : renderDriversList()}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={modalImage} alt="Full View" className="max-h-full max-w-full rounded-lg" />
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              onClick={() => setModalImage(null)}
            >
              <XMarkIcon className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDriver;