// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

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
  
//   // WebSocket states
//   const [wsConnected, setWsConnected] = useState(false);
//   const wsRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);

//   const token = localStorage.getItem("access_token");

//   // Function to refresh current driver data
//   const refreshCurrentDriver = useCallback(async () => {
//     if (userId) {
//       try {
//         const response = await axios.get(
//           `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setDriver(response.data);
//         console.log("Driver data refreshed");
//       } catch (error) {
//         console.error("Error refreshing driver:", error);
//       }
//     }
//   }, [userId, token]);

//   // Function to refresh drivers list
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
//             console.error("Error fetching driver details:", driver.user_id, err);
//             return {
//               ...driver,
//               vehicle_verification: "N/A"
//             };
//           }
//         })
//       );
      
//       setDrivers(driversWithVehicleStatus);
//       console.log("Drivers list refreshed");
//     } catch (error) {
//       console.error("Error refreshing drivers list:", error);
//     }
//   }, [token]);

//   // Handle WebSocket messages
//   const handleWebSocketMessage = useCallback((event) => {
//     try {
//       const payload = JSON.parse(event.data);
      
//       // Handle ping message - reply with pong immediately
//       if (payload?.type === "ping") {
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//           wsRef.current.send(JSON.stringify({ type: "pong" }));
//           console.log("Pong sent");
//         }
//         return;
//       }
      
//       // Handle authentication success
//       if (payload?.message === "WebSocket authenticated successfully.") {
//         console.log("WebSocket authenticated:", payload.user_id);
//         setWsConnected(true);
//         return;
//       }
      
//       // Handle live notification
//       if (payload?.id && payload?.title && payload?.message) {
//         console.log("Received notification:", payload);
        
//         // Check if this notification is related to vehicle verification
//         const isVehicleVerification = 
//           payload.title?.toLowerCase().includes("vehicle") ||
//           payload.title?.toLowerCase().includes("verification") ||
//           payload.message?.toLowerCase().includes("vehicle") ||
//           payload.message?.toLowerCase().includes("verification") ||
//           (payload.data?.refresh && (
//             payload.data.refresh.includes("driver_trips") ||
//             payload.data.refresh.includes("driver_payouts")
//           ));
        
//         if (isVehicleVerification) {
//           // Refresh data based on current view
//           if (userId) {
//             refreshCurrentDriver();
//           } else {
//             refreshDriversList();
//           }
//         }
        
//         // You can also show a toast notification here
//         console.log(`New notification: ${payload.title} - ${payload.message}`);
//       }
//     } catch (error) {
//       console.error("Error parsing WebSocket message:", error);
//     }
//   }, [userId, refreshCurrentDriver, refreshDriversList]);

//   // Connect to WebSocket
//   const connectWebSocket = useCallback(() => {
//     if (!token) {
//       console.error("No token available for WebSocket connection");
//       return;
//     }
    
//     // Close existing connection if any
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.close();
//     }
    
//     const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(token)}`;
//     const websocket = new WebSocket(wsUrl);
    
//     websocket.onopen = () => {
//       console.log("WebSocket connected");
//       // Don't set connected here - wait for auth message
//     };
    
//     websocket.onmessage = handleWebSocketMessage;
    
//     websocket.onerror = (error) => {
//       console.error("WebSocket error:", error);
//       setWsConnected(false);
//     };
    
//     websocket.onclose = () => {
//       console.log("WebSocket disconnected");
//       setWsConnected(false);
      
//       // Attempt to reconnect after 5 seconds
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       reconnectTimeoutRef.current = setTimeout(() => {
//         console.log("Attempting to reconnect WebSocket...");
//         connectWebSocket();
//       }, 5000);
//     };
    
//     wsRef.current = websocket;
//   }, [token, handleWebSocketMessage]);

//   // Sync notifications on app load and WebSocket reconnect
//   const syncNotifications = useCallback(async () => {
//     try {
//       // Fetch unread count
//       const unreadCountRes = await axios.get(
//         "https://be.shuttleapp.transev.site/notifications/unread-count",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log(`Unread notifications: ${unreadCountRes.data.unread_count}`);
      
//       // Fetch recent notifications
//       const notificationsRes = await axios.get(
//         "https://be.shuttleapp.transev.site/notifications?limit=20&offset=0&unread_only=false",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log(`Fetched ${notificationsRes.data.items?.length || 0} notifications`);
      
//       // Check for any vehicle verification notifications
//       const vehicleNotifications = notificationsRes.data.items?.filter(
//         n => n.title?.toLowerCase().includes("vehicle") || 
//              n.message?.toLowerCase().includes("vehicle")
//       );
      
//       if (vehicleNotifications?.length > 0) {
//         console.log("Found vehicle verification notifications:", vehicleNotifications.length);
//         // Refresh data if there are vehicle-related notifications
//         if (userId) {
//           await refreshCurrentDriver();
//         } else {
//           await refreshDriversList();
//         }
//       }
//     } catch (error) {
//       console.error("Error syncing notifications:", error);
//     }
//   }, [token, userId, refreshCurrentDriver, refreshDriversList]);

//   // Initialize WebSocket and sync on component mount
//   useEffect(() => {
//     if (token) {
//       connectWebSocket();
//       syncNotifications();
//     }
    
//     return () => {
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         wsRef.current.close();
//       }
//     };
//   }, [token, connectWebSocket, syncNotifications]);

//   // Fetch all drivers with their vehicle verification status
//   const fetchAllDrivers = async () => {
//     try {
//       const response = await axios.get(
//         "https://be.shuttleapp.transev.site/admin/view/all-drivers",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       // Fetch detailed info for each driver to get vehicle verification
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
//             console.error("Error fetching driver details:", driver.user_id, err);
//             return {
//               ...driver,
//               vehicle_verification: "N/A"
//             };
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

//   // Show loading spinner for initial load
//   if (initialLoad || loading) {
//     return (
//       <div className="flex min-h-screen bg-gray-100">
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

//       const response = await axios.post(
//         `https://be.shuttleapp.transev.site/admin/vehicle/verify/${driver.user_id}`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert(response.data.message);

//       // Re-fetch driver to get updated vehicle verification
//       const updatedDriver = await axios.get(
//         `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setDriver(updatedDriver.data);

//       // Notify DriverList to refresh
//       localStorage.setItem("refreshDriversList", "true");

//       setShowRejectBox(false);
//       setRejectionReason("");
//     } catch (error) {
//       console.error("Verification error:", error);
//       alert("Failed to update verification status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Helper function to get vehicle verification status badge
//   const getVehicleVerificationBadge = (verificationStatus, userIdParam = null) => {
//     const status = verificationStatus?.toLowerCase();

//     switch (status) {
//       case "verified":
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">Verified</span>;
//       case "rejected":
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">Rejected</span>;
//       case "pending":
//         return (
//           <button
//             onClick={() => navigate(`/admin/verify-drivers/${userIdParam}`, { state: { userId: userIdParam } })}
//             className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition cursor-pointer"
//           >
//             Pending
//           </button>
//         );
//       case "draft":
//         return (
//           <button
//             onClick={() => navigate(`/admin/verify-drivers/${userIdParam}`, { state: { userId: userIdParam } })}
//             className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition cursor-pointer"
//           >
//             Draft
//           </button>
//         );
//       default:
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">Not Started</span>;
//     }
//   };

//   const renderSingleDriver = (d) => {
//     const verificationStatus = d.vehicle?.verification?.toLowerCase();

//     return (
//       <div className="space-y-6 animate-fadeIn">
//         <div className="flex justify-between items-center mb-4">
//           <button
//             onClick={() => {
//               setDriver(null);
//               setInitialLoad(true);
//               fetchAllDrivers().finally(() => setInitialLoad(false));
//             }}
//             className="text-sm text-gray-600 hover:underline flex items-center gap-2"
//           >
//             ← Back to list
//           </button>
          
//           {/* WebSocket connection status indicator */}
//           <div className="flex items-center gap-2">
//             <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
//             <span className="text-xs text-gray-500">
//               {wsConnected ? 'Live updates active' : 'Reconnecting...'}
//             </span>
//           </div>
//         </div>

//         {/* Personal Info */}
//         <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
//           <h2 className="text-xl font-bold text-black mb-4">Personal Info</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
//             <div><strong>Name:</strong> {d.profile?.full_name || d.profile?.name || "N/A"}</div>
//             <div><strong>Email:</strong> {d.email || "N/A"}</div>
//             <div><strong>Phone:</strong> {d.profile?.phone || "N/A"}</div>
//             <div><strong>KYC Status:</strong> {getVehicleVerificationBadge(d.profile?.verification_status, d.user_id)}</div>
//             <div><strong>DL No:</strong> {d.profile?.documents?.driving_license_number || "N/A"}</div>
//             <div>
//               <strong>DL Document:</strong>{" "}
//               {buildFileUrl(d.profile?.documents?.dl_url) ? (
//                 <button
//                   onClick={() => setModalImage(buildFileUrl(d.profile.documents.dl_url))}
//                   className="text-blue-600 underline hover:text-blue-800"
//                 >
//                   View Document
//                 </button>
//               ) : "N/A"}
//             </div>
//           </div>
//         </div>

//         {/* Bus Details */}
//         <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
//           <h2 className="text-xl font-bold text-black mb-4">Bus Details</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
//             <div><strong>Reg No:</strong> {d.vehicle?.reg_no || "N/A"}</div>
//             <div>
//               <strong>Reg Valid Till:</strong> {
//                 d.vehicle?.reg_valid_till
//                   ? new Date(d.vehicle.reg_valid_till).toLocaleDateString('en-CA')
//                   : "N/A"
//               }
//             </div>
//             <div><strong>Model:</strong> {d.vehicle?.model || "N/A"}</div>
//             <div><strong>Capacity:</strong> {d.vehicle?.capacity || 0}</div>
//             <div><strong>AC:</strong> {d.vehicle?.has_ac ? "Yes" : "No"}</div>
//             <div><strong>Vehicle Verification:</strong> {getVehicleVerificationBadge(d.vehicle?.verification, d.user_id)}</div>
//             <div>
//               <strong>RC Photo:</strong>{" "}
//               {buildFileUrl(d.vehicle?.rc_file_path) ? (
//                 <img
//                   src={buildFileUrl(d.vehicle.rc_file_path)}
//                   alt="RC"
//                   className="w-48 h-32 object-cover rounded border cursor-pointer"
//                   onClick={() => setModalImage(buildFileUrl(d.vehicle.rc_file_path))}
//                 />
//               ) : "N/A"}
//             </div>
//             <div>
//               <strong>Rear Photo:</strong>{" "}
//               {buildFileUrl(d.vehicle?.rear_photo_file_path) ? (
//                 <img
//                   src={buildFileUrl(d.vehicle.rear_photo_file_path)}
//                   alt="Rear"
//                   className="w-48 h-32 object-cover rounded border cursor-pointer"
//                   onClick={() => setModalImage(buildFileUrl(d.vehicle.rear_photo_file_path))}
//                 />
//               ) : "N/A"}
//             </div>
//           </div>
//         </div>

//         {/* Account Info */}
//         <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
//           <h2 className="text-xl font-bold text-black mb-4">Account Info</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
//             <div><strong>Account Number:</strong> {d.account_info?.account_number || "N/A"}</div>
//             <div><strong>IFSC Code:</strong> {d.account_info?.IFSC_code || "N/A"}</div>
//             <div>
//               <strong>Passbook:</strong>{" "}
//               {buildFileUrl(d.account_info?.passbook_url) ? (
//                 <button
//                   onClick={() => setModalImage(buildFileUrl(d.account_info.passbook_url))}
//                   className="text-blue-600 underline hover:text-blue-800"
//                 >
//                   View Document
//                 </button>
//               ) : "N/A"}
//             </div>
//           </div>
//         </div>

//         {/* Verification Buttons */}
//         <div className="flex flex-col space-y-2 mt-4">
//           {verificationStatus !== "verified" && verificationStatus !== "rejected" ? (
//             <div className="flex space-x-4">
//               <button
//                 className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//                 onClick={() => handleVerification("verified")}
//                 disabled={updating}
//               >
//                 {updating ? "Verifying..." : "Verify Vehicle"}
//               </button>
//               <button
//                 className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
//                 onClick={() => setShowRejectBox(!showRejectBox)}
//                 disabled={updating}
//               >
//                 Reject Vehicle
//               </button>
//             </div>
//           ) : (
//             <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full w-fit ${verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//               }`}>
//               {verificationStatus === "verified" ? "✓ Vehicle Verified" : "✗ Vehicle Rejected"}
//             </span>
//           )}

//           {/* Rejection Reason Box */}
//           {showRejectBox && (
//             <div className="mt-2 flex flex-col space-y-2">
//               <textarea
//                 placeholder="Enter rejection reason..."
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 className="border p-2 rounded-md w-full"
//                 rows="3"
//               />
//               <button
//                 className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
//                 onClick={() => handleVerification("rejected")}
//                 disabled={updating}
//               >
//                 Submit Rejection
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const renderDriversList = () => (
//     <div className="overflow-x-auto bg-white rounded-2xl shadow p-6 border border-gray-200 animate-fadeIn">
//       {/* WebSocket connection status for list view */}
//       <div className="flex justify-end mb-4">
//         <div className="flex items-center gap-2">
//           <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
//           <span className="text-xs text-gray-500">
//             {wsConnected ? 'Live updates active' : 'Reconnecting...'}
//           </span>
//         </div>
//       </div>
      
//       <table className="min-w-full divide-y divide-gray-200 text-sm">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-4 py-3 text-left font-medium text-black">Name</th>
//             <th className="px-4 py-3 text-left font-medium text-black">Email</th>
//             <th className="px-4 py-3 text-left font-medium text-black">Phone</th>
//             <th className="px-4 py-3 text-left font-medium text-black">Vehicle Status</th>
//             <th className="px-4 py-3 text-left font-medium text-black">Action</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200">
//           {drivers.map((d) => {
//             const vehicleStatus = d.vehicle_verification?.toLowerCase();
//             const isVerified = vehicleStatus === "verified";
//             const isRejected = vehicleStatus === "rejected";
//             const isPending = vehicleStatus === "pending" || vehicleStatus === "draft";

//             return (
//               <tr
//                 key={d.user_id}
//                 className="hover:bg-gray-50 transition-all cursor-pointer"
//                 onClick={() => {
//                   setInitialLoad(true);
//                   navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
//                 }}
//               >
//                 <td className="px-4 py-3 font-medium text-black">{d.profile?.name || d.profile?.full_name || "N/A"}</td>
//                 <td className="px-4 py-3 text-gray-600">{d.email || "N/A"}</td>
//                 <td className="px-4 py-3 text-gray-600">{d.profile?.phone || "N/A"}</td>
//                 <td className="px-4 py-3">
//                   {isVerified ? (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">
//                       Verified
//                     </span>
//                   ) : isRejected ? (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">
//                       Rejected
//                     </span>
//                   ) : isPending ? (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
//                       {vehicleStatus === "pending" ? "Pending" : "Draft"}
//                     </span>
//                   ) : (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">
//                       Not Started
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
//                   {isVerified ? (
//                     <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">
//                       Verified
//                     </span>
//                   ) : isRejected ? (
//                     <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">
//                       Rejected
//                     </span>
//                   ) : (
//                     <button
//                       className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition"
//                       onClick={() => {
//                         setInitialLoad(true);
//                         navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
//                       }}
//                     >
//                       Verify Bus
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//       {drivers.length === 0 && (
//         <p className="text-center mt-10 text-gray-500">No drivers found</p>
//       )}
//     </div>
//   );

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <TopNavbarUltra />
//         <div className="p-6 flex-1 overflow-auto">
//           <h1 className="text-3xl font-bold text-black mb-6">
//             {driver ? "Driver & Vehicle Verification" : "Vehicle Verification Requests"}
//           </h1>
//           {driver ? renderSingleDriver(driver) : renderDriversList()}
//         </div>
//       </div>

//       {/* Image Modal */}
//       {modalImage && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn"
//           onClick={() => setModalImage(null)}
//         >
//           <div className="relative max-w-4xl max-h-[90vh]">
//             <img src={modalImage} alt="Full View" className="max-h-full max-w-full rounded" />
//             <button
//               className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-200 transition"
//               onClick={() => setModalImage(null)}
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VerifyDriver;

// src/pages/admin/drivers/VerifyDriver.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

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
  
  // ADDED: State for image loading and hover effects (moved from renderSingleDriver)
  const [imageLoading, setImageLoading] = useState({});
  const [hoveredPhoto, setHoveredPhoto] = useState(null);
  
  // WebSocket states
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const token = localStorage.getItem("access_token");

  // ADDED: Helper function for image load (moved from renderSingleDriver)
  const handleImageLoad = (photoKey) => {
    setImageLoading(prev => ({ ...prev, [photoKey]: false }));
  };

  // Function to refresh current driver data
  const refreshCurrentDriver = useCallback(async () => {
    if (userId) {
      try {
        const response = await axios.get(
          `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDriver(response.data);
        console.log("Driver data refreshed");
      } catch (error) {
        console.error("Error refreshing driver:", error);
      }
    }
  }, [userId, token]);

  // Function to refresh drivers list
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
              vehicle_verification: detailRes.data.vehicle?.verification || "N/A"
            };
          } catch (err) {
            console.error("Error fetching driver details:", driver.user_id, err);
            return {
              ...driver,
              vehicle_verification: "N/A"
            };
          }
        })
      );
      
      setDrivers(driversWithVehicleStatus);
      console.log("Drivers list refreshed");
    } catch (error) {
      console.error("Error refreshing drivers list:", error);
    }
  }, [token]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((event) => {
    try {
      const payload = JSON.parse(event.data);
      
      // Handle ping message - reply with pong immediately
      if (payload?.type === "ping") {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "pong" }));
          console.log("Pong sent");
        }
        return;
      }
      
      // Handle authentication success
      if (payload?.message === "WebSocket authenticated successfully.") {
        console.log("WebSocket authenticated:", payload.user_id);
        setWsConnected(true);
        return;
      }
      
      // Handle live notification
      if (payload?.id && payload?.title && payload?.message) {
        console.log("Received notification:", payload);
        
        // Check if this notification is related to vehicle verification
        const isVehicleVerification = 
          payload.title?.toLowerCase().includes("vehicle") ||
          payload.title?.toLowerCase().includes("verification") ||
          payload.message?.toLowerCase().includes("vehicle") ||
          payload.message?.toLowerCase().includes("verification") ||
          (payload.data?.refresh && (
            payload.data.refresh.includes("driver_trips") ||
            payload.data.refresh.includes("driver_payouts")
          ));
        
        if (isVehicleVerification) {
          // Refresh data based on current view
          if (userId) {
            refreshCurrentDriver();
          } else {
            refreshDriversList();
          }
        }
        
        // You can also show a toast notification here
        console.log(`New notification: ${payload.title} - ${payload.message}`);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, [userId, refreshCurrentDriver, refreshDriversList]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!token) {
      console.error("No token available for WebSocket connection");
      return;
    }
    
    // Close existing connection if any
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    const wsUrl = `wss://be.shuttleapp.transev.site/notifications/ws?token=${encodeURIComponent(token)}`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log("WebSocket connected");
      // Don't set connected here - wait for auth message
    };
    
    websocket.onmessage = handleWebSocketMessage;
    
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };
    
    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        connectWebSocket();
      }, 5000);
    };
    
    wsRef.current = websocket;
  }, [token, handleWebSocketMessage]);

  // Sync notifications on app load and WebSocket reconnect
  const syncNotifications = useCallback(async () => {
    try {
      // Fetch unread count
      const unreadCountRes = await axios.get(
        "https://be.shuttleapp.transev.site/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Unread notifications: ${unreadCountRes.data.unread_count}`);
      
      // Fetch recent notifications
      const notificationsRes = await axios.get(
        "https://be.shuttleapp.transev.site/notifications?limit=20&offset=0&unread_only=false",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Fetched ${notificationsRes.data.items?.length || 0} notifications`);
      
      // Check for any vehicle verification notifications
      const vehicleNotifications = notificationsRes.data.items?.filter(
        n => n.title?.toLowerCase().includes("vehicle") || 
             n.message?.toLowerCase().includes("vehicle")
      );
      
      if (vehicleNotifications?.length > 0) {
        console.log("Found vehicle verification notifications:", vehicleNotifications.length);
        // Refresh data if there are vehicle-related notifications
        if (userId) {
          await refreshCurrentDriver();
        } else {
          await refreshDriversList();
        }
      }
    } catch (error) {
      console.error("Error syncing notifications:", error);
    }
  }, [token, userId, refreshCurrentDriver, refreshDriversList]);

  // Initialize WebSocket and sync on component mount
  useEffect(() => {
    if (token) {
      connectWebSocket();
      syncNotifications();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [token, connectWebSocket, syncNotifications]);

  // Fetch all drivers with their vehicle verification status
  const fetchAllDrivers = async () => {
    try {
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/admin/view/all-drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Fetch detailed info for each driver to get vehicle verification
      const driversWithVehicleStatus = await Promise.all(
        response.data.map(async (driver) => {
          try {
            const detailRes = await axios.get(
              `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...driver,
              vehicle_verification: detailRes.data.vehicle?.verification || "N/A"
            };
          } catch (err) {
            console.error("Error fetching driver details:", driver.user_id, err);
            return {
              ...driver,
              vehicle_verification: "N/A"
            };
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

  // Show loading spinner for initial load
  if (initialLoad || loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNavbarUltra />
          <div className="flex items-center justify-center h-full p-6">
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

      const response = await axios.post(
        `https://be.shuttleapp.transev.site/admin/vehicle/verify/${driver.user_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);

      // Re-fetch driver to get updated vehicle verification
      const updatedDriver = await axios.get(
        `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDriver(updatedDriver.data);

      // Notify DriverList to refresh
      localStorage.setItem("refreshDriversList", "true");

      setShowRejectBox(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to update verification status");
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to get vehicle verification status badge
  const getVehicleVerificationBadge = (verificationStatus, userIdParam = null) => {
    const status = verificationStatus?.toLowerCase();

    switch (status) {
      case "verified":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">Verified</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">Rejected</span>;
      case "pending":
        return (
          <button
            onClick={() => navigate(`/admin/verify-drivers/${userIdParam}`, { state: { userId: userIdParam } })}
            className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition cursor-pointer"
          >
            Pending
          </button>
        );
      case "draft":
        return (
          <button
            onClick={() => navigate(`/admin/verify-drivers/${userIdParam}`, { state: { userId: userIdParam } })}
            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition cursor-pointer"
          >
            Draft
          </button>
        );
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">Not Started</span>;
    }
  };

  const renderSingleDriver = (d) => {
    const verificationStatus = d.vehicle?.verification?.toLowerCase();
    
    // REMOVED: const [imageLoading, setImageLoading] = useState({});
    // REMOVED: const [hoveredPhoto, setHoveredPhoto] = useState(null);
    // REMOVED: const handleImageLoad = (photoKey) => { ... };
    // Now using state from parent component

    return (
      <div className="space-y-8 animate-fadeIn">
        
        {/* Premium Header with Glassmorphism */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setDriver(null);
                setInitialLoad(true);
                fetchAllDrivers().finally(() => setInitialLoad(false));
              }}
              className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Back to Dashboard</span>
            </button>
            
            {/* Premium Status Card */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  {wsConnected && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-pulse"></div>
                    </>
                  )}
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  {wsConnected ? 'LIVE SYNC ACTIVE' : 'RECONNECTING...'}
                </span>
              </div>
              
              {/* Premium Badge */}
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-blue-700">VERIFICATION PORTAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Profile Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative">
            {/* Abstract Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative px-8 py-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{d.profile?.full_name || d.profile?.name || "N/A"}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90 font-mono">
                      ID: {d.user_id?.slice(0, 8)}...
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90">
                      {d.email}
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs text-white/90">
                      {d.profile?.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid with Masonry Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Personal Information Card - Premium */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Driver identity & credentials</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group/item">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover/item:text-blue-600 transition">Full Name</p>
                      <p className="text-base font-semibold text-gray-900">{d.profile?.full_name || d.profile?.name || "N/A"}</p>
                    </div>
                    <div className="group/item">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover/item:text-blue-600 transition">Email Address</p>
                      <p className="text-sm text-gray-700 break-all">{d.email || "N/A"}</p>
                    </div>
                    <div className="group/item">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover/item:text-blue-600 transition">Phone Number</p>
                      <p className="text-sm text-gray-700 font-mono">{d.profile?.phone || "N/A"}</p>
                    </div>
                    <div className="group/item">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover/item:text-blue-600 transition">KYC Status</p>
                      <div className="transform hover:scale-105 transition">{getVehicleVerificationBadge(d.profile?.verification_status, d.user_id)}</div>
                    </div>
                    <div className="group/item col-span-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-hover/item:text-blue-600 transition">Driving License Number</p>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span className="text-sm font-mono font-semibold text-gray-900">{d.profile?.documents?.driving_license_number || "N/A"}</span>
                        {buildFileUrl(d.profile?.documents?.dl_url) && (
                          <button
                            onClick={() => setModalImage(buildFileUrl(d.profile.documents.dl_url))}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition shadow-sm"
                          >
                            View Document
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Details Card - Premium */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-purple-50 via-white to-purple-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Vehicle Details</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Bus information & documentation</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Registration Number</p>
                      <p className="text-base font-mono font-bold text-gray-900 bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg">{d.vehicle?.reg_no || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Valid Till</p>
                      <p className="text-sm font-semibold text-gray-900 p-2">
                        {d.vehicle?.reg_valid_till
                          ? new Date(d.vehicle.reg_valid_till).toLocaleDateString('en-CA')
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Model</p>
                      <p className="text-sm font-semibold text-gray-900">{d.vehicle?.model || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Capacity</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{d.vehicle?.capacity || 0}</p>
                        <span className="text-xs text-gray-500">seats</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Air Conditioning</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${d.vehicle?.has_ac ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {d.vehicle?.has_ac ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="text-sm font-semibold">{d.vehicle?.has_ac ? "Yes" : "No"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verification Status</p>
                      <div className="transform hover:scale-105 transition">{getVehicleVerificationBadge(d.vehicle?.verification, d.user_id)}</div>
                    </div>
                  </div>
                  
                  {/* Premium Photo Gallery */}
                  <div className="pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Vehicle Documentation</p>
                    <div className="grid grid-cols-2 gap-4">
                      {buildFileUrl(d.vehicle?.rc_file_path) ? (
                        <div 
                          className="relative group/photo cursor-pointer overflow-hidden rounded-xl shadow-lg"
                          onMouseEnter={() => setHoveredPhoto('rc')}
                          onMouseLeave={() => setHoveredPhoto(null)}
                          onClick={() => setModalImage(buildFileUrl(d.vehicle.rc_file_path))}
                        >
                          {imageLoading.rc !== false && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                          )}
                          <img
                            src={buildFileUrl(d.vehicle.rc_file_path)}
                            alt="RC Photo"
                            className="w-full h-40 object-cover transition duration-500 group-hover/photo:scale-110"
                            onLoad={() => handleImageLoad('rc')}
                            style={{ display: imageLoading.rc === false ? 'block' : 'none' }}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${hoveredPhoto === 'rc' ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-white font-semibold text-sm">RC Certificate</p>
                              <p className="text-white/80 text-xs">Click to enlarge</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-500">No RC photo</p>
                        </div>
                      )}
                      
                      {buildFileUrl(d.vehicle?.rear_photo_file_path) ? (
                        <div 
                          className="relative group/photo cursor-pointer overflow-hidden rounded-xl shadow-lg"
                          onMouseEnter={() => setHoveredPhoto('rear')}
                          onMouseLeave={() => setHoveredPhoto(null)}
                          onClick={() => setModalImage(buildFileUrl(d.vehicle.rear_photo_file_path))}
                        >
                          {imageLoading.rear !== false && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                          )}
                          <img
                            src={buildFileUrl(d.vehicle.rear_photo_file_path)}
                            alt="Rear Photo"
                            className="w-full h-40 object-cover transition duration-500 group-hover/photo:scale-110"
                            onLoad={() => handleImageLoad('rear')}
                            style={{ display: imageLoading.rear === false ? 'block' : 'none' }}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${hoveredPhoto === 'rear' ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-white font-semibold text-sm">Rear View</p>
                              <p className="text-white/80 text-xs">Click to enlarge</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                          <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-500">No rear photo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Account Information - Premium Full Width */}
          <div className="lg:col-span-2 group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-green-50 via-white to-green-50 border-b border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Financial Information</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Bank account & payout details</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Number</p>
<div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Number</p>
  <div className="flex items-center gap-2">
    <p className="text-base font-mono font-bold text-gray-900">
      {d.account_info?.account_number || "N/A"}
    </p>
    {d.account_info?.account_number && (
      <button 
        className="text-gray-400 hover:text-gray-600 transition" 
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(d.account_info.account_number);
          alert('Account number copied to clipboard!');
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    )}
  </div>
</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">IFSC Code</p>
                    <p className="text-base font-mono font-bold text-gray-900">{d.account_info?.IFSC_code || "N/A"}</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Passbook Document</p>
                    {buildFileUrl(d.account_info?.passbook_url) ? (
                      <button
                        onClick={() => setModalImage(buildFileUrl(d.account_info.passbook_url))}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Document
                      </button>
                    ) : <p className="text-sm text-gray-500">Not uploaded</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Action Section with Neumorphism */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
            
            <div className="p-8">
              {verificationStatus !== "verified" && verificationStatus !== "rejected" ? (
                <div className="flex flex-col sm:flex-row gap-5">
                  <button
                    className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => handleVerification("verified")}
                    disabled={updating}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                      {updating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="font-semibold">Processing Verification...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-semibold">Approve & Verify Vehicle</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button
                    className="group relative flex-1 overflow-hidden rounded-xl bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                    onClick={() => setShowRejectBox(!showRejectBox)}
                    disabled={updating}
                  >
                    <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                      <svg className="w-5 h-5 group-hover:rotate-90 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="font-semibold">Reject Vehicle</span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg ${verificationStatus === "verified" ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'}`}>
                    {verificationStatus === "verified" ? (
                      <>
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Verification Status</p>
                          <p className="text-lg font-bold">Vehicle Verified ✓</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Verification Status</p>
                          <p className="text-lg font-bold">Vehicle Rejected ✗</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Premium Rejection Modal */}
              {showRejectBox && (
                <div className="mt-6 animate-slideDown">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200 shadow-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-800">Rejection Required</h3>
                        <p className="text-sm text-red-600 mt-1">Please provide a detailed reason for rejecting this vehicle verification</p>
                      </div>
                    </div>
                    
                    <textarea
                      placeholder="Example: The RC document is expired, Vehicle photos are unclear, Registration number mismatch, etc."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white resize-none"
                      rows="4"
                    />
                    
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        onClick={() => {
                          setShowRejectBox(false);
                          setRejectionReason("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleVerification("rejected")}
                        disabled={updating || !rejectionReason.trim()}
                      >
                        {updating ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          "Submit Rejection"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDriversList = () => (
    <div className="overflow-x-auto bg-white rounded-2xl shadow p-6 border border-gray-200 animate-fadeIn">
      {/* WebSocket connection status for list view */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {wsConnected ? 'Live updates active' : 'Reconnecting...'}
          </span>
        </div>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-black">Name</th>
            <th className="px-4 py-3 text-left font-medium text-black">Email</th>
            <th className="px-4 py-3 text-left font-medium text-black">Phone</th>
            <th className="px-4 py-3 text-left font-medium text-black">Vehicle Status</th>
            <th className="px-4 py-3 text-left font-medium text-black">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {drivers.map((d) => {
            const vehicleStatus = d.vehicle_verification?.toLowerCase();
            const isVerified = vehicleStatus === "verified";
            const isRejected = vehicleStatus === "rejected";
            const isPending = vehicleStatus === "pending" || vehicleStatus === "draft";

            return (
              <tr
                key={d.user_id}
                className="hover:bg-gray-50 transition-all cursor-pointer"
                onClick={() => {
                  setInitialLoad(true);
                  navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
                }}
              >
                <td className="px-4 py-3 font-medium text-black">{d.profile?.name || d.profile?.full_name || "N/A"}</td>
                <td className="px-4 py-3 text-gray-600">{d.email || "N/A"}</td>
                <td className="px-4 py-3 text-gray-600">{d.profile?.phone || "N/A"}</td>
                <td className="px-4 py-3">
                  {isVerified ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">
                      Verified
                    </span>
                  ) : isRejected ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">
                      Rejected
                    </span>
                  ) : isPending ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                      {vehicleStatus === "pending" ? "Pending" : "Draft"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">
                      Not Started
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {isVerified ? (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">
                      Verified
                    </span>
                  ) : isRejected ? (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">
                      Rejected
                    </span>
                  ) : (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition"
                      onClick={() => {
                        setInitialLoad(true);
                        navigate(`/admin/verify-drivers/${d.user_id}`, { state: { userId: d.user_id } });
                      }}
                    >
                      Verify Bus
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {drivers.length === 0 && (
        <p className="text-center mt-10 text-gray-500">No drivers found</p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbarUltra />
        <div className="p-6 flex-1 overflow-auto">
          <h1 className="text-3xl font-bold text-black mb-6">
            {driver ? "Driver & Vehicle Verification" : "Vehicle Verification Requests"}
          </h1>
          {driver ? renderSingleDriver(driver) : renderDriversList()}
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={modalImage} alt="Full View" className="max-h-full max-w-full rounded" />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-200 transition"
              onClick={() => setModalImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyDriver;