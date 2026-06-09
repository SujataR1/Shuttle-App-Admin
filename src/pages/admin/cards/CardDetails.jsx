// import Sidebar from '../../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../../assets/components/navbar/TopNavbar';
// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { 
//   ArrowLeftIcon, 
//   CreditCardIcon, 
//   UserIcon, 
//   CurrencyRupeeIcon,
//   DocumentTextIcon,
//   ShieldCheckIcon,
//   XMarkIcon,
//   MagnifyingGlassIcon,
//   UserPlusIcon,
//   BriefcaseIcon,
//   CalendarIcon,
//   TicketIcon
// } from '@heroicons/react/24/outline';

// const CardDetails = () => {
//   const { cardId } = useParams();
//   const navigate = useNavigate();
//   const [cardData, setCardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("details");
//   const [ledger, setLedger] = useState([]);
//   const [recharges, setRecharges] = useState([]);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [showRechargeModal, setShowRechargeModal] = useState(false);
//   const [rechargeAmount, setRechargeAmount] = useState("");
//   const [rechargeNote, setRechargeNote] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(true);
  
//   // Passenger selection modal states
//   const [showPassengerModal, setShowPassengerModal] = useState(false);
//   const [passengers, setPassengers] = useState([]);
//   const [filteredPassengers, setFilteredPassengers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loadingPassengers, setLoadingPassengers] = useState(false);
//   const [selectedPassenger, setSelectedPassenger] = useState(null);
  
//   // Store passenger details for display
//   const [passengerDetails, setPassengerDetails] = useState({});

//   const API_BASE = "https://be.shuttleapp.transev.site";

//   // Fetch all passengers with enhanced data
//   const fetchAllPassengersForNames = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_BASE}/admin/view/all-passengers`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const passengersData = Array.isArray(response.data) ? response.data : [];
//       const detailsMap = {};
//       passengersData.forEach(p => {
//         detailsMap[p.user_id] = {
//           name: p.profile?.name || p.email,
//           email: p.email,
//           total_trips: p.total_trips_booked || 0,
//           traveller_profiles: p.traveller_profile_count || 0,
//           booking_sessions: p.booking_session_count || 0,
//           active_sessions: p.active_booking_session_count || 0,
//           is_active: p.is_active,
//           joined_at: p.joined_at
//         };
//       });
//       setPassengerDetails(detailsMap);
//     } catch (error) {
//       console.error("Failed to fetch passenger details:", error);
//     }
//   };

//   const fetchCardDetails = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_BASE}/admin/rfid/cards/${cardId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setCardData(response.data);
//     } catch (error) {
//       toast.error("Failed to fetch card details");
//       navigate("/admin/rfid/cards");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLedger = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_BASE}/admin/rfid/cards/${cardId}/ledger?page=1&page_size=50`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setLedger(response.data.items);
//     } catch (error) {
//       toast.error("Failed to fetch ledger");
//     }
//   };

//   const fetchRecharges = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_BASE}/admin/rfid/cards/${cardId}/recharges?page=1&page_size=50`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setRecharges(response.data.items);
//     } catch (error) {
//       toast.error("Failed to fetch recharges");
//     }
//   };

//   const fetchAllPassengers = async () => {
//     setLoadingPassengers(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_BASE}/admin/view/all-passengers`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const passengersData = Array.isArray(response.data) ? response.data : [];
//       setPassengers(passengersData);
//       setFilteredPassengers(passengersData);
      
//       // Update the details map with enhanced data
//       const detailsMap = { ...passengerDetails };
//       passengersData.forEach(p => {
//         detailsMap[p.user_id] = {
//           name: p.profile?.name || p.email,
//           email: p.email,
//           total_trips: p.total_trips_booked || 0,
//           traveller_profiles: p.traveller_profile_count || 0,
//           booking_sessions: p.booking_session_count || 0,
//           active_sessions: p.active_booking_session_count || 0,
//           is_active: p.is_active,
//           joined_at: p.joined_at
//         };
//       });
//       setPassengerDetails(detailsMap);
//     } catch (error) {
//       toast.error("Failed to fetch passengers");
//       console.error(error);
//     } finally {
//       setLoadingPassengers(false);
//     }
//   };

//   const openPassengerModal = () => {
//     setShowPassengerModal(true);
//     setSearchTerm("");
//     setSelectedPassenger(null);
//     fetchAllPassengers();
//   };

//   const handleAssignToPassenger = async () => {
//     if (!selectedPassenger) {
//       toast.error("Please select a passenger");
//       return;
//     }
    
//     setActionLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       await axios.post(
//         `${API_BASE}/admin/rfid/cards/${cardId}/assign`,
//         { 
//           passenger_user_id: selectedPassenger.user_id,
//           reason: "Assigned from admin panel"
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(`Card assigned to ${selectedPassenger.profile?.name || selectedPassenger.email}`);
//       setShowPassengerModal(false);
//       await fetchCardDetails();
//       await fetchAllPassengersForNames();
//     } catch (error) {
//       const message = error.response?.data?.detail?.message || "Failed to assign card";
//       toast.error(message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Get passenger display name with enhanced info
//   const getPassengerDisplayName = (userId) => {
//     if (!userId) return "Not assigned";
//     const details = passengerDetails[userId];
//     return details?.name || userId;
//   };

//   // Get passenger stats for tooltip/display
//   const getPassengerStats = (userId) => {
//     if (!userId) return null;
//     return passengerDetails[userId] || null;
//   };

//   useEffect(() => {
//     fetchCardDetails();
//     fetchAllPassengersForNames();
//   }, [cardId]);

//   useEffect(() => {
//     if (activeTab === "ledger") fetchLedger();
//     if (activeTab === "recharges") fetchRecharges();
//   }, [activeTab]);

//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setFilteredPassengers(passengers);
//     } else {
//       const filtered = passengers.filter(passenger => {
//         const name = (passenger.profile?.name || "").toLowerCase();
//         const email = (passenger.email || "").toLowerCase();
//         const search = searchTerm.toLowerCase();
//         return name.includes(search) || email.includes(search);
//       });
//       setFilteredPassengers(filtered);
//     }
//   }, [searchTerm, passengers]);

//   const handleAction = async (action, body = {}) => {
//     if (!window.confirm(`Are you sure you want to ${action} this card?`)) return;
//     setActionLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       await axios.post(
//         `${API_BASE}/admin/rfid/cards/${cardId}/${action}`,
//         body,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success(`Card ${action} successfully`);
//       await fetchCardDetails();
//       if (activeTab === "ledger") fetchLedger();
//       if (activeTab === "recharges") fetchRecharges();
//     } catch (error) {
//       const message = error.response?.data?.detail?.message || `Failed to ${action} card`;
//       toast.error(message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleManualRecharge = async () => {
//     if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
//       toast.error("Please enter a valid amount");
//       return;
//     }
//     setActionLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       await axios.post(
//         `${API_BASE}/admin/rfid/recharges/manual`,
//         {
//           card_id: cardId,
//           amount: rechargeAmount,
//           note: rechargeNote
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Recharge added successfully");
//       setShowRechargeModal(false);
//       setRechargeAmount("");
//       setRechargeNote("");
//       fetchCardDetails();
//       if (activeTab === "ledger") fetchLedger();
//       if (activeTab === "recharges") fetchRecharges();
//     } catch (error) {
//       const message = error.response?.data?.detail?.message || "Failed to add recharge";
//       toast.error(message);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//         <div className="lg:ml-64">
//           <TopNavbar sidebarOpen={sidebarOpen} />
//           <div className="flex items-center justify-center h-screen">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mb-3"></div>
//               <p className="text-gray-500 text-sm">Loading card details...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!cardData) return null;

//   const { card, account, current_assignment } = cardData;
//   const isAssigned = card.inventory_status === "assigned";
//   const isBlocked = card.authorization_status === "blocked";
//   const isDecommissioned = card.inventory_status === "decommissioned";
//   const availableBalance = account?.available_balance || "0.00";
  
//   const passengerStats = current_assignment ? getPassengerStats(current_assignment.passenger_user_id) : null;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar onClose={() => setSidebarOpen(false)} />
      
//       <div className="lg:ml-64">
//         <TopNavbar sidebarOpen={sidebarOpen} />
        
//         <main className="pt-20 p-6">
//           <div className="max-w-7xl mx-auto">
//             {/* Header */}
//             <div className="mb-6">
//               <button 
//                 onClick={() => navigate("/admin/rfid/cards")} 
//                 className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-4"
//               >
//                 <ArrowLeftIcon className="w-4 h-4" />
//                 <span className="text-sm">Back to Cards</span>
//               </button>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
//                   <CreditCardIcon className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl font-semibold text-gray-900">Card Details</h1>
//                   <p className="text-gray-500 text-sm mt-0.5">{card.card_uid_masked}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div className="bg-white rounded-lg border border-gray-200 p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-gray-500 text-xs uppercase tracking-wide">Card Status</h3>
//                   <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-500 text-sm">Inventory:</span>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                       card.inventory_status === "assigned" 
//                         ? "bg-green-100 text-green-700" 
//                         : "bg-blue-100 text-blue-700"
//                     }`}>
//                       {card.inventory_status}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-gray-500 text-sm">Authorization:</span>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                       card.authorization_status === "allowed" 
//                         ? "bg-green-100 text-green-700" 
//                         : "bg-red-100 text-red-700"
//                     }`}>
//                       {card.authorization_status}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg border border-gray-200 p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-gray-500 text-xs uppercase tracking-wide">Balance</h3>
//                   <CurrencyRupeeIcon className="w-4 h-4 text-gray-400" />
//                 </div>
//                 <p className="text-2xl font-semibold text-gray-900">₹{parseFloat(availableBalance).toFixed(2)}</p>
//                 <div className="mt-1 text-xs text-gray-500">
//                   Held: ₹{parseFloat(account?.held_balance || 0).toFixed(2)} | 
//                   Current: ₹{parseFloat(account?.current_balance || 0).toFixed(2)}
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg border border-gray-200 p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <h3 className="text-gray-500 text-xs uppercase tracking-wide">Assignment</h3>
//                   <UserIcon className="w-4 h-4 text-gray-400" />
//                 </div>
//                 {current_assignment ? (
//                   <>
//                     <p className="text-gray-900 text-sm font-medium">
//                       {getPassengerDisplayName(current_assignment.passenger_user_id)}
//                     </p>
//                     <p className="text-gray-400 text-xs mt-1">
//                       ID: {current_assignment.passenger_user_id?.slice(0, 12)}
//                     </p>
//                     {passengerStats && (
//                       <div className="mt-2 pt-2 border-t border-gray-100">
//                         <div className="flex items-center gap-3 text-xs">
//                           <span className="text-gray-500">{passengerStats.total_trips} trips</span>
//                           <span className="text-gray-300">•</span>
//                           <span className="text-gray-500">{passengerStats.booking_sessions} sessions</span>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <p className="text-gray-400 text-sm">Not assigned</p>
//                 )}
//               </div>
//             </div>

//             {/* Enhanced Passenger Stats Card - Shown when assigned */}
//             {current_assignment && passengerStats && (
//               <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
//                 <div className="flex items-center gap-2 mb-3">
//                   <BriefcaseIcon className="w-4 h-4 text-blue-600" />
//                   <h3 className="text-sm font-medium text-blue-900">Passenger Activity</h3>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   <div>
//                     <p className="text-xs text-blue-600">Total Trips</p>
//                     <p className="text-lg font-semibold text-blue-900">{passengerStats.total_trips}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-blue-600">Traveller Profiles</p>
//                     <p className="text-lg font-semibold text-blue-900">{passengerStats.traveller_profiles}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-blue-600">Booking Sessions</p>
//                     <p className="text-lg font-semibold text-blue-900">{passengerStats.booking_sessions}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-blue-600">Active Sessions</p>
//                     <p className="text-lg font-semibold text-blue-900">{passengerStats.active_sessions}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             {!isDecommissioned && (
//               <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
//                 <h2 className="text-gray-900 font-medium mb-3">Actions</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {!isAssigned ? (
//                     <button
//                       onClick={openPassengerModal}
//                       disabled={actionLoading}
//                       className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition disabled:opacity-50"
//                     >
//                       Assign to Passenger
//                     </button>
//                   ) : (
//                     <button 
//                       onClick={() => handleAction("unassign", { reason: "Manual unassignment" })} 
//                       disabled={actionLoading} 
//                       className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm hover:bg-yellow-100 transition disabled:opacity-50"
//                     >
//                       Unassign
//                     </button>
//                   )}
                  
//                   {!isBlocked ? (
//                     <button 
//                       onClick={() => handleAction("block", { reason: "Manual block" })} 
//                       disabled={actionLoading} 
//                       className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition disabled:opacity-50"
//                     >
//                       Block Card
//                     </button>
//                   ) : (
//                     <button 
//                       onClick={() => handleAction("unblock", { reason: "Manual unblock" })} 
//                       disabled={actionLoading} 
//                       className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition disabled:opacity-50"
//                     >
//                       Unblock Card
//                     </button>
//                   )}
                  
//                   <button 
//                     onClick={() => setShowRechargeModal(true)} 
//                     disabled={actionLoading} 
//                     className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition disabled:opacity-50"
//                   >
//                     Manual Recharge
//                   </button>
                  
//                   {isAssigned && (
//                     <button 
//                       onClick={() => handleAction("return", { sweep_remaining_balance: true, reason: "Card returned" })} 
//                       disabled={actionLoading} 
//                       className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition disabled:opacity-50"
//                     >
//                       Return Card
//                     </button>
//                   )}
                  
//                   <button 
//                     onClick={() => handleAction("decommission", { sweep_remaining_balance: true, reason: "Card decommissioned" })} 
//                     disabled={actionLoading} 
//                     className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition disabled:opacity-50"
//                   >
//                     Decommission
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Tabs */}
//             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//               <div className="border-b border-gray-200">
//                 <div className="flex space-x-6 px-4">
//                   <button 
//                     onClick={() => setActiveTab("details")} 
//                     className={`py-2 text-sm font-medium transition ${activeTab === "details" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
//                     Details
//                   </button>
//                   <button 
//                     onClick={() => setActiveTab("ledger")} 
//                     className={`py-2 text-sm font-medium transition ${activeTab === "ledger" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
//                     Ledger
//                   </button>
//                   <button 
//                     onClick={() => setActiveTab("recharges")} 
//                     className={`py-2 text-sm font-medium transition ${activeTab === "recharges" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
//                     Recharges
//                   </button>
//                 </div>
//               </div>

//               <div className="p-4">
//                 {activeTab === "details" && (
//                   <div className="space-y-3">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       <div>
//                         <label className="text-xs text-gray-500 uppercase">Card ID</label>
//                         <p className="text-gray-900 font-mono text-sm mt-1">{card.id}</p>
//                       </div>
//                       <div>
//                         <label className="text-xs text-gray-500 uppercase">Masked UID</label>
//                         <p className="text-gray-900 font-mono text-sm mt-1">{card.card_uid_masked}</p>
//                       </div>
//                       <div>
//                         <label className="text-xs text-gray-500 uppercase">Created At</label>
//                         <p className="text-gray-900 text-sm mt-1">{new Date(card.created_at).toLocaleDateString()}</p>
//                       </div>
//                       <div>
//                         <label className="text-xs text-gray-500 uppercase">Notes</label>
//                         <p className="text-gray-600 text-sm mt-1">{card.notes || "No notes"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "ledger" && (
//                   <div className="overflow-x-auto">
//                     {ledger.length === 0 ? (
//                       <div className="text-center py-8">
//                         <DocumentTextIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
//                         <p className="text-gray-500 text-sm">No ledger entries found</p>
//                       </div>
//                     ) : (
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b border-gray-100">
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Date</th>
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Type</th>
//                             <th className="px-3 py-2 text-right text-xs text-gray-500">Amount</th>
//                             <th className="px-3 py-2 text-right text-xs text-gray-500">Balance</th>
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Note</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {ledger.map(entry => (
//                             <tr key={entry.id} className="border-b border-gray-50">
//                               <td className="px-3 py-2 text-gray-600">{new Date(entry.created_at).toLocaleDateString()}</td>
//                               <td className="px-3 py-2">
//                                 <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{entry.entry_type}</span>
//                               </td>
//                               <td className={`px-3 py-2 text-right font-medium ${parseFloat(entry.amount_delta) > 0 ? "text-green-600" : "text-red-600"}`}>
//                                 {parseFloat(entry.amount_delta) > 0 ? "+" : ""}{entry.amount_delta}
//                               </td>
//                               <td className="px-3 py-2 text-right text-gray-700">₹{entry.balance_after}</td>
//                               <td className="px-3 py-2 text-gray-500">{entry.note || "—"}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 )}

//                 {activeTab === "recharges" && (
//                   <div className="overflow-x-auto">
//                     {recharges.length === 0 ? (
//                       <div className="text-center py-8">
//                         <CreditCardIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
//                         <p className="text-gray-500 text-sm">No recharges found</p>
//                       </div>
//                     ) : (
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b border-gray-100">
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Date</th>
//                             <th className="px-3 py-2 text-right text-xs text-gray-500">Amount</th>
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Source</th>
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Status</th>
//                             <th className="px-3 py-2 text-left text-xs text-gray-500">Note</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {recharges.map(recharge => (
//                             <tr key={recharge.id} className="border-b border-gray-50">
//                               <td className="px-3 py-2 text-gray-600">{new Date(recharge.created_at).toLocaleDateString()}</td>
//                               <td className="px-3 py-2 text-right text-green-600 font-medium">+₹{parseFloat(recharge.amount).toFixed(2)}</td>
//                               <td className="px-3 py-2">
//                                 <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{recharge.source_type}</span>
//                               </td>
//                               <td className="px-3 py-2">
//                                 <span className={`text-xs px-1.5 py-0.5 rounded-full ${recharge.status === "credited" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
//                                   {recharge.status}
//                                 </span>
//                               </td>
//                               <td className="px-3 py-2 text-gray-500">{recharge.note || "—"}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Passenger Selection Modal - Enhanced with passenger stats */}
//       {showPassengerModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
//             <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">Assign to Passenger</h2>
//                 <p className="text-sm text-gray-500 mt-0.5">Select a passenger to assign this card</p>
//               </div>
//               <button onClick={() => setShowPassengerModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
//                 ×
//               </button>
//             </div>

//             <div className="px-5 py-3 border-b border-gray-200">
//               <div className="relative">
//                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
//                 />
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-3">
//               {loadingPassengers ? (
//                 <div className="flex justify-center py-8">
//                   <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
//                 </div>
//               ) : filteredPassengers.length === 0 ? (
//                 <div className="text-center py-8">
//                   <UserIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
//                   <p className="text-gray-500 text-sm">No passengers found</p>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   {filteredPassengers.map((passenger) => (
//                     <button
//                       key={passenger.user_id}
//                       onClick={() => setSelectedPassenger(passenger)}
//                       className={`w-full text-left p-3 rounded-lg transition ${selectedPassenger?.user_id === passenger.user_id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
//                           {(passenger.profile?.name || "U").charAt(0).toUpperCase()}
//                         </div>
//                         <div className="flex-1">
//                           <p className="text-sm font-medium text-gray-900">{passenger.profile?.name || "N/A"}</p>
//                           <p className="text-xs text-gray-500">{passenger.email}</p>
//                           <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
//                             <span>{passenger.total_trips_booked || 0} trips</span>
//                             <span>•</span>
//                             <span>{passenger.traveller_profile_count || 0} profiles</span>
//                           </div>
//                         </div>
//                         {selectedPassenger?.user_id === passenger.user_id && (
//                           <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
//                             <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </div>
//                         )}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="px-5 py-3 border-t border-gray-200 flex gap-2">
//               <button onClick={handleAssignToPassenger} disabled={!selectedPassenger || actionLoading} className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
//                 {actionLoading ? "Assigning..." : "Assign Card"}
//               </button>
//               <button onClick={() => setShowPassengerModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Recharge Modal */}
//       {showRechargeModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-5 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Manual Recharge</h2>
//               <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
//                 ×
//               </button>
//             </div>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
//                 <input 
//                   type="number" 
//                   step="0.01" 
//                   value={rechargeAmount} 
//                   onChange={(e) => setRechargeAmount(e.target.value)} 
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" 
//                   placeholder="100.00" 
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
//                 <textarea 
//                   value={rechargeNote} 
//                   onChange={(e) => setRechargeNote(e.target.value)} 
//                   rows="2" 
//                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none" 
//                   placeholder="Cash received, etc." 
//                 />
//               </div>
//               <div className="flex gap-2 pt-2">
//                 <button onClick={handleManualRecharge} disabled={actionLoading} className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
//                   {actionLoading ? "Processing..." : "Add Recharge"}
//                 </button>
//                 <button onClick={() => setShowRechargeModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CardDetails;


import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  UserIcon, 
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  BriefcaseIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const CardDetails = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [ledger, setLedger] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Passenger selection modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  
  // Store passenger details for display
  const [passengerDetails, setPassengerDetails] = useState({});

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Check device type and get sidebar state from localStorage
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Get sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    
    const interval = setInterval(() => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    }, 100);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      clearInterval(interval);
    };
  }, []);

  // Calculate sidebar width based on state
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return sidebarOpen ? 288 : 96;
  };

  const sidebarWidth = getSidebarWidth();

  // Fetch all passengers with enhanced data
  const fetchAllPassengersForNames = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/view/all-passengers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const passengersData = Array.isArray(response.data) ? response.data : [];
      const detailsMap = {};
      passengersData.forEach(p => {
        detailsMap[p.user_id] = {
          name: p.profile?.name || p.email,
          email: p.email,
          total_trips: p.total_trips_booked || 0,
          traveller_profiles: p.traveller_profile_count || 0,
          booking_sessions: p.booking_session_count || 0,
          active_sessions: p.active_booking_session_count || 0,
          is_active: p.is_active,
          joined_at: p.joined_at
        };
      });
      setPassengerDetails(detailsMap);
    } catch (error) {
      console.error("Failed to fetch passenger details:", error);
    }
  };

  const fetchCardDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCardData(response.data);
    } catch (error) {
      toast.error("Failed to fetch card details");
      navigate("/admin/rfid/cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}/ledger?page=1&page_size=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLedger(response.data.items);
    } catch (error) {
      toast.error("Failed to fetch ledger");
    }
  };

  const fetchRecharges = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}/recharges?page=1&page_size=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecharges(response.data.items);
    } catch (error) {
      toast.error("Failed to fetch recharges");
    }
  };

  const fetchAllPassengers = async () => {
    setLoadingPassengers(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/view/all-passengers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const passengersData = Array.isArray(response.data) ? response.data : [];
      setPassengers(passengersData);
      setFilteredPassengers(passengersData);
      
      const detailsMap = { ...passengerDetails };
      passengersData.forEach(p => {
        detailsMap[p.user_id] = {
          name: p.profile?.name || p.email,
          email: p.email,
          total_trips: p.total_trips_booked || 0,
          traveller_profiles: p.traveller_profile_count || 0,
          booking_sessions: p.booking_session_count || 0,
          active_sessions: p.active_booking_session_count || 0,
          is_active: p.is_active,
          joined_at: p.joined_at
        };
      });
      setPassengerDetails(detailsMap);
    } catch (error) {
      toast.error("Failed to fetch passengers");
      console.error(error);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const openPassengerModal = () => {
    setShowPassengerModal(true);
    setSearchTerm("");
    setSelectedPassenger(null);
    fetchAllPassengers();
  };

  const handleAssignToPassenger = async () => {
    if (!selectedPassenger) {
      toast.error("Please select a passenger");
      return;
    }
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/cards/${cardId}/assign`,
        { 
          passenger_user_id: selectedPassenger.user_id,
          reason: "Assigned from admin panel"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Card assigned to ${selectedPassenger.profile?.name || selectedPassenger.email}`);
      setShowPassengerModal(false);
      await fetchCardDetails();
      await fetchAllPassengersForNames();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to assign card";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getPassengerDisplayName = (userId) => {
    if (!userId) return "Not assigned";
    const details = passengerDetails[userId];
    return details?.name || userId;
  };

  const getPassengerStats = (userId) => {
    if (!userId) return null;
    return passengerDetails[userId] || null;
  };

  useEffect(() => {
    fetchCardDetails();
    fetchAllPassengersForNames();
  }, [cardId]);

  useEffect(() => {
    if (activeTab === "ledger") fetchLedger();
    if (activeTab === "recharges") fetchRecharges();
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPassengers(passengers);
    } else {
      const filtered = passengers.filter(passenger => {
        const name = (passenger.profile?.name || "").toLowerCase();
        const email = (passenger.email || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
      });
      setFilteredPassengers(filtered);
    }
  }, [searchTerm, passengers]);

  const handleAction = async (action, body = {}) => {
    if (!window.confirm(`Are you sure you want to ${action} this card?`)) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/cards/${cardId}/${action}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Card ${action} successfully`);
      await fetchCardDetails();
      if (activeTab === "ledger") fetchLedger();
      if (activeTab === "recharges") fetchRecharges();
    } catch (error) {
      const message = error.response?.data?.detail?.message || `Failed to ${action} card`;
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/recharges/manual`,
        {
          card_id: cardId,
          amount: rechargeAmount,
          note: rechargeNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Recharge added successfully");
      setShowRechargeModal(false);
      setRechargeAmount("");
      setRechargeNote("");
      fetchCardDetails();
      if (activeTab === "ledger") fetchLedger();
      if (activeTab === "recharges") fetchRecharges();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to add recharge";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} isMobile={isMobile} />
        <div 
          className="transition-all duration-300 ease-out"
          style={{
            marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
            width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
          }}
        >
          <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen} />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mb-3"></div>
              <p className="text-gray-500 text-sm">Loading card details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cardData) return null;

  const { card, account, current_assignment } = cardData;
  const isAssigned = card.inventory_status === "assigned";
  const isBlocked = card.authorization_status === "blocked";
  const isDecommissioned = card.inventory_status === "decommissioned";
  const availableBalance = account?.available_balance || "0.00";
  
  const passengerStats = current_assignment ? getPassengerStats(current_assignment.passenger_user_id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} isMobile={isMobile} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen} />
        
        <main className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button 
                onClick={() => navigate("/admin/rfid/cards")} 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-4"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="text-sm">Back to Cards</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Card Details</h1>
                  <p className="text-gray-500 text-sm mt-0.5">{card.card_uid_masked}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500 text-xs uppercase tracking-wide">Card Status</h3>
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Inventory:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      card.inventory_status === "assigned" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {card.inventory_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Authorization:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      card.authorization_status === "allowed" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {card.authorization_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500 text-xs uppercase tracking-wide">Balance</h3>
                  <CurrencyRupeeIcon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-900">₹{parseFloat(availableBalance).toFixed(2)}</p>
                <div className="mt-1 text-xs text-gray-500">
                  Held: ₹{parseFloat(account?.held_balance || 0).toFixed(2)} | 
                  Current: ₹{parseFloat(account?.current_balance || 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-500 text-xs uppercase tracking-wide">Assignment</h3>
                  <UserIcon className="w-4 h-4 text-gray-400" />
                </div>
                {current_assignment ? (
                  <>
                    <p className="text-gray-900 text-sm font-medium">
                      {getPassengerDisplayName(current_assignment.passenger_user_id)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      ID: {current_assignment.passenger_user_id?.slice(0, 12)}
                    </p>
                    {passengerStats && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500">{passengerStats.total_trips} trips</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{passengerStats.booking_sessions} sessions</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Not assigned</p>
                )}
              </div>
            </div>

            {/* Enhanced Passenger Stats Card - Shown when assigned */}
            {current_assignment && passengerStats && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BriefcaseIcon className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-blue-900">Passenger Activity</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-blue-600">Total Trips</p>
                    <p className="text-lg font-semibold text-blue-900">{passengerStats.total_trips}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Traveller Profiles</p>
                    <p className="text-lg font-semibold text-blue-900">{passengerStats.traveller_profiles}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Booking Sessions</p>
                    <p className="text-lg font-semibold text-blue-900">{passengerStats.booking_sessions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600">Active Sessions</p>
                    <p className="text-lg font-semibold text-blue-900">{passengerStats.active_sessions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isDecommissioned && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h2 className="text-gray-900 font-medium mb-3">Actions</h2>
                <div className="flex flex-wrap gap-2">
                  {!isAssigned ? (
                    <button
                      onClick={openPassengerModal}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition disabled:opacity-50"
                    >
                      Assign to Passenger
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("unassign", { reason: "Manual unassignment" })} 
                      disabled={actionLoading} 
                      className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm hover:bg-yellow-100 transition disabled:opacity-50"
                    >
                      Unassign
                    </button>
                  )}
                  
                  {!isBlocked ? (
                    <button 
                      onClick={() => handleAction("block", { reason: "Manual block" })} 
                      disabled={actionLoading} 
                      className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Block Card
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("unblock", { reason: "Manual unblock" })} 
                      disabled={actionLoading} 
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition disabled:opacity-50"
                    >
                      Unblock Card
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowRechargeModal(true)} 
                    disabled={actionLoading} 
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Manual Recharge
                  </button>
                  
                  {isAssigned && (
                    <button 
                      onClick={() => handleAction("return", { sweep_remaining_balance: true, reason: "Card returned" })} 
                      disabled={actionLoading} 
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition disabled:opacity-50"
                    >
                      Return Card
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleAction("decommission", { sweep_remaining_balance: true, reason: "Card decommissioned" })} 
                    disabled={actionLoading} 
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition disabled:opacity-50"
                  >
                    Decommission
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex space-x-6 px-4">
                  <button 
                    onClick={() => setActiveTab("details")} 
                    className={`py-2 text-sm font-medium transition ${activeTab === "details" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                    Details
                  </button>
                  <button 
                    onClick={() => setActiveTab("ledger")} 
                    className={`py-2 text-sm font-medium transition ${activeTab === "ledger" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                    Ledger
                  </button>
                  <button 
                    onClick={() => setActiveTab("recharges")} 
                    className={`py-2 text-sm font-medium transition ${activeTab === "recharges" ? "border-b-2 border-gray-800 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                    Recharges
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === "details" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Card ID</label>
                        <p className="text-gray-900 font-mono text-sm mt-1">{card.id}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Masked UID</label>
                        <p className="text-gray-900 font-mono text-sm mt-1">{card.card_uid_masked}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Created At</label>
                        <p className="text-gray-900 text-sm mt-1">{new Date(card.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Notes</label>
                        <p className="text-gray-600 text-sm mt-1">{card.notes || "No notes"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ledger" && (
                  <div className="overflow-x-auto">
                    {ledger.length === 0 ? (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No ledger entries found</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Date</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Type</th>
                            <th className="px-3 py-2 text-right text-xs text-gray-500">Amount</th>
                            <th className="px-3 py-2 text-right text-xs text-gray-500">Balance</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Note</th>
                           </tr>
                        </thead>
                        <tbody>
                          {ledger.map(entry => (
                            <tr key={entry.id} className="border-b border-gray-50">
                              <td className="px-3 py-2 text-gray-600">{new Date(entry.created_at).toLocaleDateString()}</td>
                              <td className="px-3 py-2">
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{entry.entry_type}</span>
                              </td>
                              <td className={`px-3 py-2 text-right font-medium ${parseFloat(entry.amount_delta) > 0 ? "text-green-600" : "text-red-600"}`}>
                                {parseFloat(entry.amount_delta) > 0 ? "+" : ""}{entry.amount_delta}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-700">₹{entry.balance_after}</td>
                              <td className="px-3 py-2 text-gray-500">{entry.note || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "recharges" && (
                  <div className="overflow-x-auto">
                    {recharges.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCardIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No recharges found</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Date</th>
                            <th className="px-3 py-2 text-right text-xs text-gray-500">Amount</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Source</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Status</th>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Note</th>
                           </tr>
                        </thead>
                        <tbody>
                          {recharges.map(recharge => (
                            <tr key={recharge.id} className="border-b border-gray-50">
                              <td className="px-3 py-2 text-gray-600">{new Date(recharge.created_at).toLocaleDateString()}</td>
                              <td className="px-3 py-2 text-right text-green-600 font-medium">+₹{parseFloat(recharge.amount).toFixed(2)}</td>
                              <td className="px-3 py-2">
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{recharge.source_type}</span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${recharge.status === "credited" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                  {recharge.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-500">{recharge.note || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Passenger Selection Modal */}
      {showPassengerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Assign to Passenger</h2>
                <p className="text-sm text-gray-500 mt-0.5">Select a passenger to assign this card</p>
              </div>
              <button onClick={() => setShowPassengerModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>

            <div className="px-5 py-3 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {loadingPassengers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
                </div>
              ) : filteredPassengers.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No passengers found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredPassengers.map((passenger) => (
                    <button
                      key={passenger.user_id}
                      onClick={() => setSelectedPassenger(passenger)}
                      className={`w-full text-left p-3 rounded-lg transition ${selectedPassenger?.user_id === passenger.user_id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                          {(passenger.profile?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{passenger.profile?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{passenger.email}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{passenger.total_trips_booked || 0} trips</span>
                            <span>•</span>
                            <span>{passenger.traveller_profile_count || 0} profiles</span>
                          </div>
                        </div>
                        {selectedPassenger?.user_id === passenger.user_id && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-200 flex gap-2">
              <button onClick={handleAssignToPassenger} disabled={!selectedPassenger || actionLoading} className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {actionLoading ? "Assigning..." : "Assign Card"}
              </button>
              <button onClick={() => setShowPassengerModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Manual Recharge</h2>
              <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={rechargeAmount} 
                  onChange={(e) => setRechargeAmount(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" 
                  placeholder="100.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                <textarea 
                  value={rechargeNote} 
                  onChange={(e) => setRechargeNote(e.target.value)} 
                  rows="2" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none" 
                  placeholder="Cash received, etc." 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleManualRecharge} disabled={actionLoading} className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                  {actionLoading ? "Processing..." : "Add Recharge"}
                </button>
                <button onClick={() => setShowRechargeModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetails;