// import React, { useState, useEffect } from "react";
// import Sidebar from "../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../assets/components/navbar/TopNavbar";
// import {
//   DocumentTextIcon,
//   PlusIcon,
//   PencilIcon,
//   TrashIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ExclamationTriangleIcon,
//   ArrowPathIcon,
//   UserIcon,
//   TruckIcon,
//   CalendarIcon,
//   ClockIcon,
//   MagnifyingGlassIcon,
//   SparklesIcon,
//   ShieldCheckIcon,
//   CurrencyRupeeIcon,
//   EyeIcon
// } from "@heroicons/react/24/outline";

// const API_BASE_URL = "https://be.shuttleapp.transev.site/admin";

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access_token");
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
// };

// // ============= API CALLS =============

// // Commercial Rules API
// const getCommercialRules = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const url = params ? `${API_BASE_URL}/commercial-rules?${params}` : `${API_BASE_URL}/commercial-rules`;
//   const response = await fetch(url, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch commercial rules");
//   return response.json();
// };

// const createCommercialRule = async (ruleData) => {
//   const response = await fetch(`${API_BASE_URL}/commercial-rules`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(ruleData),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw errorData;
//   }
//   return response.json();
// };

// const updateCommercialRule = async (ruleId, ruleData) => {
//   const response = await fetch(`${API_BASE_URL}/commercial-rules/${ruleId}`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(ruleData),
//   });
//   if (!response.ok) throw new Error("Failed to update rule");
//   return response.json();
// };

// const updateRuleStatus = async (ruleId, isActive) => {
//   const response = await fetch(`${API_BASE_URL}/commercial-rules/${ruleId}/status`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ is_active: isActive }),
//   });
//   if (!response.ok) throw new Error("Failed to update rule status");
//   return response.json();
// };

// const deleteCommercialRule = async (ruleId) => {
//   const response = await fetch(`${API_BASE_URL}/commercial-rules/${ruleId}`, {
//     method: "DELETE",
//     headers: getAuthHeaders(),
//   });
//   if (!response.ok) throw new Error("Failed to delete rule");
//   return response.json();
// };

// // Driver APIs
// const getAllDrivers = async () => {
//   const response = await fetch(`${API_BASE_URL}/view/all-drivers`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch drivers");
//   const data = await response.json();
  
//   if (Array.isArray(data)) return data;
//   if (data.drivers && Array.isArray(data.drivers)) return data.drivers;
//   if (data.data && Array.isArray(data.data)) return data.data;
//   if (data.items && Array.isArray(data.items)) return data.items;
  
//   for (const key in data) {
//     if (Array.isArray(data[key]) && data[key].length > 0) return data[key];
//   }
//   return [];
// };

// // Get cancelled bookings for a driver
// const getDriverCancelledBookings = async (driverUserId) => {
//   const params = new URLSearchParams({ 
//     driver_user_id: driverUserId,
//     booking_status: "cancelled"
//   }).toString();
//   const response = await fetch(`${API_BASE_URL}/payouts/bookings?${params}`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch cancelled bookings");
//   return response.json();
// };

// // Get booking details with adjustments
// const getBookingDetails = async (bookingId) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch booking details");
//   return response.json();
// };

// // Create adjustment (fine) on a booking - creates PENDING adjustment
// const createAdjustment = async (bookingId, adjustmentData) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}/adjustments`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(adjustmentData),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw errorData;
//   }
//   return response.json();
// };

// // Get adjustments for a booking
// const getBookingAdjustments = async (bookingId) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}/adjustments`, { 
//     headers: getAuthHeaders() 
//   });
//   if (!response.ok) throw new Error("Failed to fetch booking adjustments");
//   return response.json();
// };

// // Get driver's open adjustments (INCLUDED + remaining > 0)
// const getDriverOpenAdjustments = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/drivers/${driverUserId}/open-adjustments`, { 
//     headers: getAuthHeaders() 
//   });
//   if (!response.ok) throw new Error("Failed to fetch open adjustments");
//   return response.json();
// };

// // Update adjustment decision (INCLUDED / EXCLUDED)
// const updateAdjustmentDecision = async (adjustmentId, decisionStatus, adminNote) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/adjustments/${adjustmentId}/decision`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ 
//       decision_status: decisionStatus, 
//       admin_note: adminNote 
//     }),
//   });
//   if (!response.ok) throw new Error("Failed to update adjustment decision");
//   return response.json();
// };

// // Trigger payout for a booking with adjustments
// const triggerPayout = async (bookingId, adjustmentsToApply) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}/trigger`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({
//       linked_account_id: null,
//       require_completed: true,
//       adjustments_to_apply: adjustmentsToApply,
//     }),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw errorData;
//   }
//   return response.json();
// };

// // ============= MAIN COMPONENT =============

// const CancellationFine = () => {
//   const [activeTab, setActiveTab] = useState("rules");
//   const [loading, setLoading] = useState(false);
//   const [updating, setUpdating] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
  
//   // Data State
//   const [rules, setRules] = useState([]);
//   const [drivers, setDrivers] = useState([]);
//   const [filteredDrivers, setFilteredDrivers] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [cancelledBookings, setCancelledBookings] = useState([]);
  
//   // Adjustment Review State
//   const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
//   const [bookingAdjustments, setBookingAdjustments] = useState([]);
//   const [openDriverAdjustments, setOpenDriverAdjustments] = useState([]);
  
//   // Modal State
//   const [showRuleModal, setShowRuleModal] = useState(false);
//   const [showFineModal, setShowFineModal] = useState(false);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [selectedRule, setSelectedRule] = useState(null);
//   const [ruleToDelete, setRuleToDelete] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  
//   // Filter State
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
  
//   // Fine Form State
//   const [fineForm, setFineForm] = useState({
//     amount: "",
//     reason_text: "",
//     admin_note: "",
//     booking_id: ""
//   });

//   // Rule Form State
//   const [ruleForm, setRuleForm] = useState({
//     rule_type: "driver_trip_cancel",
//     code: "cancel_within_24hrs_60_percent",
//     title: "Late Cancellation Penalty",
//     description: "Driver cancellation within 24 hours of trip start - 60% fare deduction",
//     priority: 100,
//     is_active: true,
//     config: {
//       min_minutes_before: 0,
//       max_minutes_before: 1440,
//       allowed: true,
//       fine_mode: "percent_of_fare",
//       fine_value: "60.00"
//     }
//   });

//   // Function to get active fine percentage from commercial rules
//   const getActiveFinePercentage = () => {
//     const activeRule = rules.find(rule => 
//       rule.rule_type === "driver_trip_cancel" && 
//       rule.is_active === true
//     );
    
//     if (activeRule && activeRule.config && activeRule.config.fine_value) {
//       return parseFloat(activeRule.config.fine_value);
//     }
    
//     return 60;
//   };

//   // Function to get fine mode (percentage or flat)
//   const getFineMode = () => {
//     const activeRule = rules.find(rule => 
//       rule.rule_type === "driver_trip_cancel" && 
//       rule.is_active === true
//     );
    
//     if (activeRule && activeRule.config && activeRule.config.fine_mode) {
//       return activeRule.config.fine_mode;
//     }
    
//     return "percent_of_fare";
//   };

//   useEffect(() => {
//     if (activeTab === "rules") {
//       fetchRules();
//     } else if (activeTab === "drivers") {
//       fetchDrivers();
//     }
//   }, [activeTab]);

//   useEffect(() => {
//     filterDriversList();
//   }, [searchTerm, statusFilter, drivers]);

//   const filterDriversList = () => {
//     let filtered = [...drivers];
    
//     if (searchTerm) {
//       filtered = filtered.filter(driver => {
//         const fullName = driver.profile?.full_name || driver.profile?.name || driver.name || "";
//         const email = driver.email || "";
//         const phone = driver.profile?.phone || driver.phone || "";
//         return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                phone.includes(searchTerm);
//       });
//     }
    
//     if (statusFilter !== "all") {
//       if (statusFilter === "active") {
//         filtered = filtered.filter(driver => driver.is_active === true);
//       } else if (statusFilter === "inactive") {
//         filtered = filtered.filter(driver => driver.is_active === false);
//       }
//     }
    
//     setFilteredDrivers(filtered);
//   };

//   const fetchRules = async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const data = await getCommercialRules();
//       setRules(data.items || []);
//     } catch (error) {
//       console.error("Error fetching rules:", error);
//       setErrorMessage("Failed to load commercial rules");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDrivers = async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const data = await getAllDrivers();
//       setDrivers(data || []);
//       setFilteredDrivers(data || []);
//     } catch (error) {
//       console.error("Error fetching drivers:", error);
//       setErrorMessage("Failed to load drivers: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch cancelled bookings for a driver
//   const fetchCancelledBookings = async (driver) => {
//     setLoading(true);
//     try {
//       const bookings = await getDriverCancelledBookings(driver.user_id);
//       const cancelledItems = bookings.items || [];
      
//       const finePercentage = getActiveFinePercentage();
//       const fineMode = getFineMode();
      
//       const enhancedBookings = await Promise.all(cancelledItems.map(async (booking) => {
//         // Check if booking already has adjustments
//         const adjustments = await getBookingAdjustments(booking.booking_id);
//         const hasAdjustments = adjustments.items && adjustments.items.length > 0;
//         const existingAdjustment = hasAdjustments ? adjustments.items[0] : null;
        
//         let recommendedFine = "0.00";
        
//         if (!hasAdjustments && booking.fare_amount) {
//           if (fineMode === "percent_of_fare") {
//             recommendedFine = ((parseFloat(booking.fare_amount) * finePercentage) / 100).toFixed(2);
//           } else {
//             recommendedFine = finePercentage.toFixed(2);
//           }
//         } else if (existingAdjustment) {
//           recommendedFine = existingAdjustment.amount;
//         }
        
//         return {
//           ...booking,
//           recommendedFine: recommendedFine,
//           finePercentage: finePercentage,
//           fineMode: fineMode,
//           hasAdjustments: hasAdjustments,
//           existingAdjustment: existingAdjustment,
//           fareAmount: booking.fare_amount || 0
//         };
//       }));
      
//       setCancelledBookings(enhancedBookings);
//       setSelectedDriver(driver);
//       setShowFineModal(true);
//     } catch (error) {
//       console.error("Error fetching cancelled bookings:", error);
//       setErrorMessage("Failed to fetch cancelled bookings");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create adjustment (PENDING state)
//   const handleCreateAdjustment = async () => {
//     if (!fineForm.booking_id) {
//       setErrorMessage("Please select a booking");
//       return;
//     }
//     if (!fineForm.amount || parseFloat(fineForm.amount) <= 0) {
//       setErrorMessage("Valid fine amount is required");
//       return;
//     }
//     if (!fineForm.reason_text.trim()) {
//       setErrorMessage("Reason text is required");
//       return;
//     }

//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       const result = await createAdjustment(fineForm.booking_id, {
//         adjustment_type: "fine",
//         amount: fineForm.amount,
//         reason_code: "driver_cancellation",
//         reason_text: fineForm.reason_text,
//         admin_note: fineForm.admin_note,
//       });
      
//       setSuccessMessage(`✨ Adjustment created successfully! Status: PENDING. Review and include before payout.`);
//       setShowFineModal(false);
//       resetFineForm();
      
//       // Refresh the cancelled bookings list
//       if (selectedDriver) {
//         await fetchCancelledBookings(selectedDriver);
//       }
      
//       setTimeout(() => setSuccessMessage(null), 5000);
//     } catch (error) {
//       console.error("Error creating adjustment:", error);
//       setErrorMessage(error.detail?.message || "Failed to create adjustment");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Open review modal to see and manage adjustments
//   const handleReviewAdjustments = async (booking) => {
//     setLoading(true);
//     try {
//       // Get booking details with adjustments
//       const bookingDetails = await getBookingDetails(booking.booking_id);
//       setBookingAdjustments(bookingDetails.originated_adjustments || []);
//       setOpenDriverAdjustments(bookingDetails.open_driver_adjustments?.items || []);
//       setSelectedBookingForReview(booking);
//       setShowReviewModal(true);
//     } catch (error) {
//       console.error("Error fetching adjustments:", error);
//       setErrorMessage("Failed to load adjustments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update adjustment decision (INCLUDED / EXCLUDED)
//   const handleUpdateDecision = async (adjustmentId, decisionStatus, adminNote = "") => {
//     setUpdating(true);
//     try {
//       await updateAdjustmentDecision(adjustmentId, decisionStatus, adminNote);
      
//       setSuccessMessage(`✅ Adjustment ${decisionStatus === 'included' ? 'included' : 'excluded'} successfully!`);
      
//       // Refresh the adjustments list
//       if (selectedBookingForReview) {
//         const bookingDetails = await getBookingDetails(selectedBookingForReview.booking_id);
//         setBookingAdjustments(bookingDetails.originated_adjustments || []);
//         setOpenDriverAdjustments(bookingDetails.open_driver_adjustments?.items || []);
//       }
      
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error updating decision:", error);
//       setErrorMessage("Failed to update adjustment decision");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Trigger payout with adjustments
//   const handleTriggerPayout = async (bookingId, adjustmentsToApply) => {
//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       const result = await triggerPayout(bookingId, adjustmentsToApply);
      
//       if (result.result?.booking_transfer_status === "withheld") {
//         setSuccessMessage(`⚠️ Payout fully absorbed by adjustments. No transfer created.`);
//       } else if (result.result?.transfer_row_status === "processed") {
//         setSuccessMessage(`✅ Payout processed! Net amount: ₹${parseFloat(result.result?.net_transfer_amount).toFixed(2)}`);
//       } else {
//         setSuccessMessage(`✅ Payout triggered successfully!`);
//       }
      
//       // Close review modal
//       setShowReviewModal(false);
//       setSelectedBookingForReview(null);
      
//       // Refresh data
//       if (selectedDriver) {
//         await fetchCancelledBookings(selectedDriver);
//       }
      
//       setTimeout(() => setSuccessMessage(null), 5000);
//     } catch (error) {
//       console.error("Error triggering payout:", error);
//       setErrorMessage(error.detail?.message || "Failed to trigger payout");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleCreateRule = async () => {
//     if (!ruleForm.code.trim()) {
//       setErrorMessage("Rule code is required");
//       return;
//     }
//     if (!ruleForm.title.trim()) {
//       setErrorMessage("Rule title is required");
//       return;
//     }
//     if (!ruleForm.config.fine_value || parseFloat(ruleForm.config.fine_value) <= 0) {
//       setErrorMessage("Valid fine value is required");
//       return;
//     }

//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       if (selectedRule) {
//         await updateCommercialRule(selectedRule.id, ruleForm);
//         setSuccessMessage("✨ Rule updated successfully!");
//       } else {
//         await createCommercialRule(ruleForm);
//         setSuccessMessage("✨ Rule created successfully!");
//       }
      
//       await fetchRules();
//       setShowRuleModal(false);
//       resetRuleForm();
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error saving rule:", error);
//       if (error.detail?.error === "duplicate_commercial_rule_code") {
//         setErrorMessage("Rule code already exists. Please use a different code.");
//       } else {
//         setErrorMessage(error.detail?.message || "Failed to save rule");
//       }
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleEditRule = (rule) => {
//     setSelectedRule(rule);
//     setRuleForm({
//       rule_type: rule.rule_type,
//       code: rule.code,
//       title: rule.title,
//       description: rule.description || "",
//       priority: rule.priority,
//       is_active: rule.is_active,
//       config: { ...rule.config }
//     });
//     setShowRuleModal(true);
//   };

//   const handleToggleRuleStatus = async (ruleId, currentStatus) => {
//     setUpdating(true);
//     try {
//       await updateRuleStatus(ruleId, !currentStatus);
//       await fetchRules();
//       setSuccessMessage(`✨ Rule ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error toggling rule status:", error);
//       setErrorMessage("Failed to update rule status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleDeleteRule = async () => {
//     if (!ruleToDelete) return;
    
//     setUpdating(true);
//     try {
//       await deleteCommercialRule(ruleToDelete.id);
//       await fetchRules();
//       setSuccessMessage("✨ Rule deleted successfully!");
//       setShowDeleteConfirm(false);
//       setRuleToDelete(null);
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error deleting rule:", error);
//       setErrorMessage("Failed to delete rule");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const resetRuleForm = () => {
//     setSelectedRule(null);
//     setRuleForm({
//       rule_type: "driver_trip_cancel",
//       code: "cancel_within_24hrs_60_percent",
//       title: "Late Cancellation Penalty",
//       description: "Driver cancellation within 24 hours of trip start - 60% fare deduction",
//       priority: 100,
//       is_active: true,
//       config: {
//         min_minutes_before: 0,
//         max_minutes_before: 1440,
//         allowed: true,
//         fine_mode: "percent_of_fare",
//         fine_value: "60.00"
//       }
//     });
//   };

//   const resetFineForm = () => {
//     setFineForm({
//       amount: "",
//       reason_text: "",
//       admin_note: "",
//       booking_id: ""
//     });
//     setSelectedBooking(null);
//   };

//   const getDriverDisplayName = (driver) => {
//     return driver.profile?.full_name || driver.profile?.name || driver.name || "Unknown Driver";
//   };

//   const getDriverEmail = (driver) => {
//     return driver.email || "No email";
//   };

//   const getDriverPhone = (driver) => {
//     return driver.profile?.phone || driver.phone || "No phone";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit"
//     });
//   };

//   const getDecisionBadge = (status) => {
//     switch (status) {
//       case 'included':
//         return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Included</span>;
//       case 'excluded':
//         return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Excluded</span>;
//       case 'pending':
//         return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
//       default:
//         return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
//     }
//   };

//   // Render Commercial Rules Tab
//   const renderRulesTab = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-800">Commercial Rules</h2>
//           <p className="text-gray-400 text-sm mt-1">Define fine policies and cancellation rules</p>
//         </div>
//         <button
//           onClick={() => {
//             resetRuleForm();
//             setShowRuleModal(true);
//           }}
//           className="group px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
//         >
//           <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
//           Create Rule
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//         {loading ? (
//           <div className="col-span-3 flex justify-center items-center h-64">
//             <div className="relative">
//               <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-800"></div>
//               <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//         ) : rules.length === 0 ? (
//           <div className="col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
//             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
//               <DocumentTextIcon className="w-10 h-10 text-gray-300" />
//             </div>
//             <p className="text-gray-400">No commercial rules found</p>
//             <button
//               onClick={() => {
//                 resetRuleForm();
//                 setShowRuleModal(true);
//               }}
//               className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
//             >
//               Create your first rule →
//             </button>
//           </div>
//         ) : (
//           rules.map((rule) => (
//             <div
//               key={rule.id}
//               className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
//             >
//               <div className="p-5">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
//                       <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
//                     </div>
//                     <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       {rule.rule_type === 'driver_trip_cancel' ? 'Driver Cancel' : 'Trip Latency'}
//                     </span>
//                   </div>
//                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <button
//                       onClick={() => handleEditRule(rule)}
//                       className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
//                     >
//                       <PencilIcon className="w-3.5 h-3.5" />
//                     </button>
//                     <button
//                       onClick={() => handleToggleRuleStatus(rule.id, rule.is_active)}
//                       className={`p-1.5 rounded-lg transition ${
//                         rule.is_active 
//                           ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" 
//                           : "text-gray-400 hover:text-green-600 hover:bg-gray-100"
//                       }`}
//                     >
//                       {rule.is_active ? <XCircleIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
//                     </button>
//                     <button
//                       onClick={() => {
//                         setRuleToDelete(rule);
//                         setShowDeleteConfirm(true);
//                       }}
//                       className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
//                     >
//                       <TrashIcon className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </div>
                
//                 <div>
//                   <div className="flex items-center gap-2 mb-2 flex-wrap">
//                     <code className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{rule.code}</code>
//                     {rule.is_active ? (
//                       <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Active</span>
//                     ) : (
//                       <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>
//                     )}
//                   </div>
//                   <h4 className="font-semibold text-gray-800 mb-1">{rule.title}</h4>
//                   <p className="text-xs text-gray-400 line-clamp-2">{rule.description}</p>
                  
//                   <div className="mt-4 pt-3 border-t border-gray-100">
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="text-gray-400">Fine</span>
//                       <span className="font-semibold text-gray-700">
//                         {rule.config.fine_mode === 'flat_per_booking' 
//                           ? `₹${rule.config.fine_value}` 
//                           : `${rule.config.fine_value}% of fare`}
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between text-sm mt-1">
//                       <span className="text-gray-400">Condition</span>
//                       <span className="text-xs text-gray-500">
//                         {rule.config.max_minutes_before >= 1440 
//                           ? 'Within 24h before start' 
//                           : `${rule.config.max_minutes_before} min before`}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );

//   // Render Drivers Tab
//   const renderDriversTab = () => (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-800">Drivers</h2>
//           <p className="text-gray-400 text-sm mt-1">Review cancelled bookings and apply fines</p>
//         </div>
//         <button
//           onClick={fetchDrivers}
//           disabled={loading}
//           className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2 shadow-sm"
//         >
//           <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* Search and Filter */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
//         <div className="flex flex-wrap gap-4">
//           <div className="flex-1 min-w-[250px]">
//             <div className="relative">
//               <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name, email, or phone..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm bg-white"
//               />
//             </div>
//           </div>
//           <div className="w-36">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm bg-white text-gray-600"
//             >
//               <option value="all">All Drivers</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//         {loading ? (
//           <div className="col-span-3 flex justify-center items-center h-64">
//             <div className="relative">
//               <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-800"></div>
//               <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//         ) : filteredDrivers.length === 0 ? (
//           <div className="col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
//             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
//               <UserIcon className="w-10 h-10 text-gray-300" />
//             </div>
//             <p className="text-gray-400">No drivers found</p>
//           </div>
//         ) : (
//           filteredDrivers.map((driver, index) => (
//             <div
//               key={driver.user_id || index}
//               className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
//             >
//               <div className="p-5">
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
//                       <UserIcon className="w-5 h-5 text-gray-500" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold text-gray-800">
//                         {getDriverDisplayName(driver)}
//                       </h3>
//                       <p className="text-xs text-gray-400">{getDriverEmail(driver)}</p>
//                       <p className="text-xs text-gray-400 mt-0.5">{getDriverPhone(driver)}</p>
//                     </div>
//                   </div>
//                   {driver.is_active ? (
//                     <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
//                   ) : (
//                     <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-400">Inactive</span>
//                   )}
//                 </div>
                
//                 {driver.vehicle && (
//                   <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
//                     <TruckIcon className="w-3 h-3" />
//                     <span>{driver.vehicle.reg_no || "No vehicle registered"}</span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex gap-2">
//                 <button
//                   onClick={() => fetchCancelledBookings(driver)}
//                   className="flex-1 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
//                 >
//                   Apply Fine
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );

//   // Fine Modal - Create adjustment (PENDING)
//   const renderFineModal = () => {
//     if (!showFineModal || !selectedDriver) return null;
    
//     const finePercentage = getActiveFinePercentage();
//     const fineMode = getFineMode();
//     const fineModeText = fineMode === "percent_of_fare" ? ` (${finePercentage}% of fare)` : " (Flat Rate)";
    
//     return (
//       <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300">
//           <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-800">Create Cancellation Fine</h3>
//                 <p className="text-sm text-gray-400 mt-1">
//                   Driver: <span className="font-medium text-gray-600">{getDriverDisplayName(selectedDriver)}</span>
//                 </p>
//               </div>
//               <button onClick={() => {
//                 setShowFineModal(false);
//                 resetFineForm();
//               }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
//                 ✕
//               </button>
//             </div>
//           </div>
          
//           <div className="p-6 overflow-auto flex-1">
//             {cancelledBookings.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <CheckCircleIcon className="w-8 h-8 text-green-400" />
//                 </div>
//                 <p className="text-gray-500">No cancelled bookings found for this driver</p>
//                 <p className="text-sm text-gray-400 mt-1">The driver has not cancelled any trips</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-500 mb-3">
//                   Found <span className="font-semibold text-gray-700">{cancelledBookings.length}</span> cancelled booking(s). Select one to create a fine:
//                 </p>
                
//                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
//                   {cancelledBookings.map((booking) => (
//                     <div
//                       key={booking.booking_id}
//                       onClick={() => {
//                         if (!booking.hasAdjustments) {
//                           setSelectedBooking(booking);
//                           setFineForm({
//                             booking_id: booking.booking_id,
//                             amount: booking.recommendedFine,
//                             reason_text: `Driver ${getDriverDisplayName(selectedDriver)} cancelled trip - Late cancellation penalty (${booking.finePercentage}% of fare)`,
//                             admin_note: `Booking ID: ${booking.booking_id}\nCancelled on: ${formatDate(booking.created_at)}`
//                           });
//                         }
//                       }}
//                       className={`border rounded-xl p-4 transition-all duration-200 ${
//                         booking.hasAdjustments 
//                           ? 'border-green-200 bg-green-50/30 cursor-default'
//                           : selectedBooking?.booking_id === booking.booking_id
//                             ? 'border-gray-400 bg-gray-50 shadow-md cursor-pointer'
//                             : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer'
//                       }`}
//                     >
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2 flex-wrap">
//                             <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
//                               {booking.booking_id?.slice(0, 13)}...
//                             </code>
//                             <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
//                               Cancelled
//                             </span>
//                             {booking.hasAdjustments && (
//                               <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
//                                 ✓ Fine Created
//                               </span>
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-600">
//                             Passenger: <span className="font-medium">{booking.passenger_name || 'N/A'}</span>
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             Fare: <span className="font-medium">₹{parseFloat(booking.fareAmount).toFixed(2)}</span>
//                           </p>
//                           <p className="text-xs text-gray-400 mt-1">
//                             Cancelled on: {formatDate(booking.created_at)}
//                           </p>
//                           {booking.hasAdjustments && booking.existingAdjustment && (
//                             <div className="mt-2">
//                               <p className="text-xs text-green-600">
//                                 Existing fine: ₹{booking.existingAdjustment.amount} 
//                                 ({getDecisionBadge(booking.existingAdjustment.decision_status)})
//                               </p>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleReviewAdjustments(booking);
//                                 }}
//                                 className="mt-1 text-xs text-blue-600 hover:text-blue-800"
//                               >
//                                 <EyeIcon className="w-3 h-3 inline mr-1" />
//                                 Review Adjustment
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                         <div className="text-right">
//                           <p className="text-xs text-gray-400">
//                             {booking.hasAdjustments ? "Fine Amount" : `Recommended Fine${fineModeText}`}
//                           </p>
//                           <p className="text-xl font-bold text-gray-800">
//                             ₹{booking.recommendedFine}
//                           </p>
//                           {!booking.hasAdjustments && booking.fareAmount > 0 && (
//                             <p className="text-xs text-gray-400 mt-1">
//                               ({booking.finePercentage}% of ₹{parseFloat(booking.fareAmount).toFixed(2)})
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {selectedBooking && !selectedBooking.hasAdjustments && (
//               <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
//                 <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
//                   <p className="text-sm text-blue-700 flex items-center gap-2">
//                     <ShieldCheckIcon className="w-4 h-4" />
//                     This will create a PENDING adjustment. After creation, review and mark as INCLUDED before payout.
//                   </p>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Fine Amount *</label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={fineForm.amount}
//                       onChange={(e) => setFineForm({ ...fineForm, amount: e.target.value })}
//                       className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">
//                     Recommended: {fineMode === "percent_of_fare" ? `${finePercentage}% of fare amount` : "Flat rate fine"} 
//                     (₹{selectedBooking.recommendedFine})
//                   </p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
//                   <textarea
//                     value={fineForm.reason_text}
//                     onChange={(e) => setFineForm({ ...fineForm, reason_text: e.target.value })}
//                     rows="2"
//                     className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note (Optional)</label>
//                   <textarea
//                     value={fineForm.admin_note}
//                     onChange={(e) => setFineForm({ ...fineForm, admin_note: e.target.value })}
//                     rows="2"
//                     className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none text-gray-500"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
//             <button
//               onClick={handleCreateAdjustment}
//               disabled={updating || !selectedBooking || selectedBooking.hasAdjustments}
//               className="flex-1 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//             >
//               {updating ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                   Creating...
//                 </span>
//               ) : (
//                 <span className="flex items-center justify-center gap-2">
//                   <CurrencyRupeeIcon className="w-4 h-4" />
//                   Create Adjustment (PENDING)
//                 </span>
//               )}
//             </button>
//             <button
//               onClick={() => {
//                 setShowFineModal(false);
//                 resetFineForm();
//               }}
//               className="flex-1 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Review Adjustments Modal - Review, Include/Exclude, Trigger Payout
//   const renderReviewModal = () => {
//     if (!showReviewModal || !selectedBookingForReview) return null;
    
//     const allAdjustments = [...bookingAdjustments, ...openDriverAdjustments];
//     const includedAdjustments = allAdjustments.filter(adj => adj.decision_status === 'included');
//     const canTriggerPayout = includedAdjustments.length > 0;
    
//     return (
//       <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300">
//           <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-800">Review Adjustments</h3>
//                 <p className="text-sm text-gray-400 mt-1">
//                   Booking: <span className="font-mono text-xs">{selectedBookingForReview.booking_id?.slice(0, 13)}...</span>
//                 </p>
//               </div>
//               <button onClick={() => {
//                 setShowReviewModal(false);
//                 setSelectedBookingForReview(null);
//               }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
//                 ✕
//               </button>
//             </div>
//           </div>
          
//           <div className="p-6 overflow-auto flex-1">
//             {/* Booking Info */}
//             <div className="bg-gray-50 rounded-xl p-4 mb-6">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Passenger</p>
//                   <p className="font-medium text-gray-800">{selectedBookingForReview.passenger_name || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Fare Amount</p>
//                   <p className="font-medium text-gray-800">₹{parseFloat(selectedBookingForReview.fareAmount || 0).toFixed(2)}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Cancelled On</p>
//                   <p className="text-sm text-gray-600">{formatDate(selectedBookingForReview.created_at)}</p>
//                 </div>
//               </div>
//             </div>
            
//             {/* Adjustments List */}
//             <div className="mb-6">
//               <h4 className="font-semibold text-gray-800 mb-3">Adjustments / Fines</h4>
//               {allAdjustments.length === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-xl">
//                   <p className="text-gray-500">No adjustments found for this booking</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {allAdjustments.map((adj) => (
//                     <div key={adj.id} className="border rounded-xl p-4 bg-white">
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-2 flex-wrap">
//                             <span className={`text-xs px-2 py-0.5 rounded-full ${
//                               adj.adjustment_type === 'fine' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
//                             }`}>
//                               {adj.adjustment_type}
//                             </span>
//                             {getDecisionBadge(adj.decision_status)}
//                           </div>
//                           <p className="text-sm text-gray-700 font-medium">₹{parseFloat(adj.amount).toFixed(2)}</p>
//                           <p className="text-sm text-gray-600 mt-1">{adj.reason_text}</p>
//                           {adj.admin_note && (
//                             <p className="text-xs text-gray-500 mt-1">Note: {adj.admin_note}</p>
//                           )}
//                           {adj.remaining_amount > 0 && adj.decision_status === 'included' && (
//                             <p className="text-xs text-green-600 mt-1">
//                               Remaining: ₹{parseFloat(adj.remaining_amount).toFixed(2)}
//                             </p>
//                           )}
//                         </div>
//                         {adj.decision_status === 'pending' && (
//                           <div className="flex gap-2 ml-4">
//                             <button
//                               onClick={() => handleUpdateDecision(adj.id, 'included', 'Approved by admin')}
//                               className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
//                             >
//                               Include
//                             </button>
//                             <button
//                               onClick={() => handleUpdateDecision(adj.id, 'excluded', 'Rejected by admin')}
//                               className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
//                             >
//                               Exclude
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             {/* Trigger Payout Section */}
//             {canTriggerPayout && (
//               <div className="border-t pt-4 mt-4">
//                 <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 mb-4">
//                   <p className="text-sm text-amber-700 flex items-center gap-2">
//                     <ExclamationTriangleIcon className="w-4 h-4" />
//                     {includedAdjustments.length} adjustment(s) are INCLUDED and ready to be applied.
//                   </p>
//                 </div>
                
//                 <button
//                   onClick={() => {
//                     const adjustmentsToApply = includedAdjustments.map(adj => ({
//                       adjustment_id: adj.id,
//                       applied_amount: adj.remaining_amount || adj.amount
//                     }));
//                     handleTriggerPayout(selectedBookingForReview.booking_id, adjustmentsToApply);
//                   }}
//                   disabled={updating}
//                   className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-medium"
//                 >
//                   {updating ? "Processing..." : "Trigger Payout with Included Adjustments"}
//                 </button>
//               </div>
//             )}
//           </div>
          
//           <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
//             <button
//               onClick={() => {
//                 setShowReviewModal(false);
//                 setSelectedBookingForReview(null);
//               }}
//               className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Rule Modal
//   const renderRuleModal = () => {
//     if (!showRuleModal) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-300">
//           <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
//             <div className="flex justify-between items-center">
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {selectedRule ? "Edit Rule" : "Create Rule"}
//               </h3>
//               <button onClick={() => {
//                 setShowRuleModal(false);
//                 resetRuleForm();
//               }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
//                 ✕
//               </button>
//             </div>
//           </div>
//           <div className="p-6 overflow-auto flex-1 space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
//                 <select
//                   value={ruleForm.rule_type}
//                   onChange={(e) => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//                 >
//                   <option value="driver_trip_cancel">Driver Trip Cancel</option>
//                   <option value="trip_latency">Trip Latency</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Rule Code</label>
//                 <input
//                   type="text"
//                   value={ruleForm.code}
//                   onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value })}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//                   placeholder="cancel_within_24hrs"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
//               <input
//                 type="text"
//                 value={ruleForm.title}
//                 onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
//                 className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//               <textarea
//                 value={ruleForm.description}
//                 onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
//                 rows="2"
//                 className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
//                 <input
//                   type="number"
//                   value={ruleForm.priority}
//                   onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) })}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Fine Mode</label>
//                 <select
//                   value={ruleForm.config.fine_mode}
//                   onChange={(e) => setRuleForm({
//                     ...ruleForm,
//                     config: { ...ruleForm.config, fine_mode: e.target.value }
//                   })}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//                 >
//                   <option value="flat_per_booking">Flat Rate</option>
//                   <option value="percent_of_fare">Percentage of Fare</option>
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Min Minutes Before
//                 </label>
//                 <input
//                   type="number"
//                   value={ruleForm.config.min_minutes_before}
//                   onChange={(e) => setRuleForm({
//                     ...ruleForm,
//                     config: { ...ruleForm.config, min_minutes_before: parseInt(e.target.value) || 0 }
//                   })}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Max Minutes Before <span className="text-xs text-gray-400">(1440 = 24 hrs)</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={ruleForm.config.max_minutes_before}
//                   onChange={(e) => setRuleForm({
//                     ...ruleForm,
//                     config: { ...ruleForm.config, max_minutes_before: parseInt(e.target.value) || 0 }
//                   })}
//                   className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Fine Value {ruleForm.config.fine_mode === 'percent_of_fare' && '(%)'}
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={ruleForm.config.fine_value}
//                 onChange={(e) => setRuleForm({
//                   ...ruleForm,
//                   config: { ...ruleForm.config, fine_value: e.target.value }
//                 })}
//                 className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
//               />
//             </div>

//             <div className="flex items-center gap-3 pt-2">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={ruleForm.is_active}
//                   onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
//                   className="w-4 h-4 rounded border-gray-300 text-gray-700 focus:ring-gray-400"
//                 />
//                 <span className="text-sm text-gray-700">Rule is active</span>
//               </label>
//             </div>
//           </div>
//           <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
//             <button
//               onClick={handleCreateRule}
//               disabled={updating}
//               className="flex-1 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 disabled:opacity-50 font-medium"
//             >
//               {updating ? "Saving..." : (selectedRule ? "Update Rule" : "Create Rule")}
//             </button>
//             <button
//               onClick={() => {
//                 setShowRuleModal(false);
//                 resetRuleForm();
//               }}
//               className="flex-1 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Delete Confirmation Modal
//   const renderDeleteConfirmModal = () => {
//     if (!showDeleteConfirm) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
//               <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-800">Delete Rule</h3>
//           </div>
//           <p className="text-gray-500 mb-6">
//             Are you sure you want to delete "<span className="font-medium text-gray-700">{ruleToDelete?.title}</span>"? This action cannot be undone.
//           </p>
//           <div className="flex gap-3">
//             <button
//               onClick={handleDeleteRule}
//               disabled={updating}
//               className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all duration-300 disabled:opacity-50"
//             >
//               {updating ? "Deleting..." : "Delete"}
//             </button>
//             <button
//               onClick={() => {
//                 setShowDeleteConfirm(false);
//                 setRuleToDelete(null);
//               }}
//               className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar />
//         <div className="p-8 overflow-auto">
//           {successMessage && (
//             <div className="mb-5 p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 rounded-xl animate-in slide-in-from-top-2">
//               <div className="flex items-center gap-2">
//                 <SparklesIcon className="w-4 h-4 text-emerald-600" />
//                 <p className="text-emerald-700 text-sm">{successMessage}</p>
//               </div>
//             </div>
//           )}
          
//           {errorMessage && (
//             <div className="mb-5 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-xl">
//               <p className="text-rose-700 text-sm">{errorMessage}</p>
//             </div>
//           )}
          
//           <div className="mb-8">
//             <h1 className="text-3xl font-semibold text-gray-800">Cancellation Fine Management</h1>
//             <p className="text-gray-400 text-sm mt-1">Manage commercial rules and apply cancellation fines to drivers</p>
//           </div>
          
//           <div className="flex gap-6 mb-6 border-b border-gray-100">
//             <button
//               onClick={() => setActiveTab("rules")}
//               className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
//                 activeTab === "rules" 
//                   ? "text-gray-800 border-b-2 border-gray-800" 
//                   : "text-gray-400 hover:text-gray-600"
//               }`}
//             >
//               Commercial Rules
//             </button>
//             <button
//               onClick={() => setActiveTab("drivers")}
//               className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
//                 activeTab === "drivers" 
//                   ? "text-gray-800 border-b-2 border-gray-800" 
//                   : "text-gray-400 hover:text-gray-600"
//               }`}
//             >
//               Drivers
//               {filteredDrivers.length > 0 && (
//                 <span className="ml-1.5 text-xs text-gray-400">({filteredDrivers.length})</span>
//               )}
//             </button>
//           </div>
          
//           {activeTab === "rules" && renderRulesTab()}
//           {activeTab === "drivers" && renderDriversTab()}
//         </div>
//       </div>
      
//       {renderRuleModal()}
//       {renderFineModal()}
//       {renderReviewModal()}
//       {renderDeleteConfirmModal()}
//     </div>
//   );
// };

// export default CancellationFine;
import React, { useState, useEffect } from "react";
import Sidebar from "../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../assets/components/navbar/TopNavbar";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
  TruckIcon,
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = "https://be.shuttleapp.transev.site/admin";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ============= API CALLS =============

// Commercial Rules API
const getCommercialRules = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/commercial-rules?${params}` : `${API_BASE_URL}/commercial-rules`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch commercial rules");
  return response.json();
};

const createCommercialRule = async (ruleData) => {
  const response = await fetch(`${API_BASE_URL}/commercial-rules`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(ruleData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

const updateCommercialRule = async (ruleId, ruleData) => {
  const response = await fetch(`${API_BASE_URL}/commercial-rules/${ruleId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(ruleData),
  });
  if (!response.ok) throw new Error("Failed to update rule");
  return response.json();
};

const updateRuleStatus = async (ruleId, isActive) => {
  const response = await fetch(`${API_BASE_URL}/commercial-rules/${ruleId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!response.ok) throw new Error("Failed to update rule status");
  return response.json();
};

const deleteCommercialRule = async (ruleId) => {
  const response = await fetch(`${API_BASE_URL}/commercial-rules/${ruleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete rule");
  return response.json();
};

// Driver APIs
const getAllDrivers = async () => {
  const response = await fetch(`${API_BASE_URL}/view/all-drivers`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch drivers");
  const data = await response.json();
  
  if (Array.isArray(data)) return data;
  if (data.drivers && Array.isArray(data.drivers)) return data.drivers;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.items && Array.isArray(data.items)) return data.items;
  
  for (const key in data) {
    if (Array.isArray(data[key]) && data[key].length > 0) return data[key];
  }
  return [];
};

// Get cancelled bookings for a driver
const getDriverCancelledBookings = async (driverUserId) => {
  const params = new URLSearchParams({ 
    driver_user_id: driverUserId,
    booking_status: "cancelled"
  }).toString();
  const response = await fetch(`${API_BASE_URL}/payouts/bookings?${params}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch cancelled bookings");
  return response.json();
};

// Get booking details with adjustments
const getBookingDetails = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch booking details");
  return response.json();
};

// Create adjustment (fine) on a booking - creates PENDING adjustment
const createAdjustment = async (bookingId, adjustmentData) => {
  const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}/adjustments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(adjustmentData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

// Get adjustments for a booking
const getBookingAdjustments = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}/adjustments`, { 
    headers: getAuthHeaders() 
  });
  if (!response.ok) throw new Error("Failed to fetch booking adjustments");
  return response.json();
};

// Get driver's open adjustments (INCLUDED + remaining > 0)
const getDriverOpenAdjustments = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/payouts/drivers/${driverUserId}/open-adjustments`, { 
    headers: getAuthHeaders() 
  });
  if (!response.ok) throw new Error("Failed to fetch open adjustments");
  return response.json();
};

// Update adjustment decision (INCLUDED / EXCLUDED)
const updateAdjustmentDecision = async (adjustmentId, decisionStatus, adminNote) => {
  const response = await fetch(`${API_BASE_URL}/payouts/adjustments/${adjustmentId}/decision`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      decision_status: decisionStatus, 
      admin_note: adminNote 
    }),
  });
  if (!response.ok) throw new Error("Failed to update adjustment decision");
  return response.json();
};

// Trigger payout for a booking with adjustments
const triggerPayout = async (bookingId, adjustmentsToApply) => {
  const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}/trigger`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      linked_account_id: null,
      require_completed: true,
      adjustments_to_apply: adjustmentsToApply,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

// ============= MAIN COMPONENT =============

const CancellationFine = () => {
  const [activeTab, setActiveTab] = useState("rules");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Data State
  const [rules, setRules] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  
  // Adjustment Review State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [bookingAdjustments, setBookingAdjustments] = useState([]);
  const [openDriverAdjustments, setOpenDriverAdjustments] = useState([]);
  
  // Modal State
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showFineModal, setShowFineModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fine Form State
  const [fineForm, setFineForm] = useState({
    amount: "",
    reason_text: "",
    admin_note: "",
    booking_id: ""
  });

  // Rule Form State
  const [ruleForm, setRuleForm] = useState({
    rule_type: "driver_trip_cancel",
    code: "cancel_within_24hrs_60_percent",
    title: "Late Cancellation Penalty",
    description: "Driver cancellation within 24 hours of trip start - 60% fare deduction",
    priority: 100,
    is_active: true,
    config: {
      min_minutes_before: 0,
      max_minutes_before: 1440,
      allowed: true,
      fine_mode: "percent_of_fare",
      fine_value: "60.00"
    }
  });

  // Function to get active fine percentage from commercial rules
  const getActiveFinePercentage = () => {
    const activeRule = rules.find(rule => 
      rule.rule_type === "driver_trip_cancel" && 
      rule.is_active === true
    );
    
    if (activeRule && activeRule.config && activeRule.config.fine_value) {
      return parseFloat(activeRule.config.fine_value);
    }
    
    return 60;
  };

  // Function to get fine mode (percentage or flat)
  const getFineMode = () => {
    const activeRule = rules.find(rule => 
      rule.rule_type === "driver_trip_cancel" && 
      rule.is_active === true
    );
    
    if (activeRule && activeRule.config && activeRule.config.fine_mode) {
      return activeRule.config.fine_mode;
    }
    
    return "percent_of_fare";
  };

  useEffect(() => {
    if (activeTab === "rules") {
      fetchRules();
    } else if (activeTab === "drivers") {
      fetchDrivers();
    }
  }, [activeTab]);

  useEffect(() => {
    filterDriversList();
  }, [searchTerm, statusFilter, drivers]);

  const filterDriversList = () => {
    let filtered = [...drivers];
    
    if (searchTerm) {
      filtered = filtered.filter(driver => {
        const fullName = driver.profile?.full_name || driver.profile?.name || driver.name || "";
        const email = driver.email || "";
        const phone = driver.profile?.phone || driver.phone || "";
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               phone.includes(searchTerm);
      });
    }
    
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(driver => driver.is_active === true);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(driver => driver.is_active === false);
      }
    }
    
    setFilteredDrivers(filtered);
  };

  const fetchRules = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getCommercialRules();
      setRules(data.items || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
      setErrorMessage("Failed to load commercial rules");
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAllDrivers();
      setDrivers(data || []);
      setFilteredDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setErrorMessage("Failed to load drivers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cancelled bookings for a driver
  const fetchCancelledBookings = async (driver) => {
    setLoading(true);
    try {
      const bookings = await getDriverCancelledBookings(driver.user_id);
      const cancelledItems = bookings.items || [];
      
      const finePercentage = getActiveFinePercentage();
      const fineMode = getFineMode();
      
      const enhancedBookings = await Promise.all(cancelledItems.map(async (booking) => {
        // Check if booking already has adjustments
        const adjustments = await getBookingAdjustments(booking.booking_id);
        const hasAdjustments = adjustments.items && adjustments.items.length > 0;
        const existingAdjustment = hasAdjustments ? adjustments.items[0] : null;
        
        let recommendedFine = "0.00";
        
        if (!hasAdjustments && booking.fare_amount) {
          if (fineMode === "percent_of_fare") {
            recommendedFine = ((parseFloat(booking.fare_amount) * finePercentage) / 100).toFixed(2);
          } else {
            recommendedFine = finePercentage.toFixed(2);
          }
        } else if (existingAdjustment) {
          recommendedFine = existingAdjustment.amount;
        }
        
        return {
          ...booking,
          recommendedFine: recommendedFine,
          finePercentage: finePercentage,
          fineMode: fineMode,
          hasAdjustments: hasAdjustments,
          existingAdjustment: existingAdjustment,
          fareAmount: booking.fare_amount || 0
        };
      }));
      
      setCancelledBookings(enhancedBookings);
      setSelectedDriver(driver);
      setShowFineModal(true);
    } catch (error) {
      console.error("Error fetching cancelled bookings:", error);
      setErrorMessage("Failed to fetch cancelled bookings");
    } finally {
      setLoading(false);
    }
  };

  // Create adjustment (PENDING state)
  const handleCreateAdjustment = async () => {
    if (!fineForm.booking_id) {
      setErrorMessage("Please select a booking");
      return;
    }
    if (!fineForm.amount || parseFloat(fineForm.amount) <= 0) {
      setErrorMessage("Valid fine amount is required");
      return;
    }
    if (!fineForm.reason_text.trim()) {
      setErrorMessage("Reason text is required");
      return;
    }

    setUpdating(true);
    setErrorMessage(null);
    try {
      const result = await createAdjustment(fineForm.booking_id, {
        adjustment_type: "fine",
        amount: fineForm.amount,
        reason_code: "driver_cancellation",
        reason_text: fineForm.reason_text,
        admin_note: fineForm.admin_note,
      });
      
      setSuccessMessage(`✨ Adjustment created successfully! Status: PENDING. Review and include before payout.`);
      setShowFineModal(false);
      resetFineForm();
      
      // Refresh the cancelled bookings list
      if (selectedDriver) {
        await fetchCancelledBookings(selectedDriver);
      }
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error creating adjustment:", error);
      setErrorMessage(error.detail?.message || "Failed to create adjustment");
    } finally {
      setUpdating(false);
    }
  };

  // Open review modal to see and manage adjustments
  const handleReviewAdjustments = async (booking) => {
    setLoading(true);
    try {
      // Get booking details with adjustments
      const bookingDetails = await getBookingDetails(booking.booking_id);
      setBookingAdjustments(bookingDetails.originated_adjustments || []);
      setOpenDriverAdjustments(bookingDetails.open_driver_adjustments?.items || []);
      setSelectedBookingForReview(booking);
      setShowReviewModal(true);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
      setErrorMessage("Failed to load adjustments");
    } finally {
      setLoading(false);
    }
  };

  // Update adjustment decision (INCLUDED / EXCLUDED)
  const handleUpdateDecision = async (adjustmentId, decisionStatus, adminNote = "") => {
    setUpdating(true);
    try {
      await updateAdjustmentDecision(adjustmentId, decisionStatus, adminNote);
      
      setSuccessMessage(`✅ Adjustment ${decisionStatus === 'included' ? 'included' : 'excluded'} successfully!`);
      
      // Refresh the adjustments list
      if (selectedBookingForReview) {
        const bookingDetails = await getBookingDetails(selectedBookingForReview.booking_id);
        setBookingAdjustments(bookingDetails.originated_adjustments || []);
        setOpenDriverAdjustments(bookingDetails.open_driver_adjustments?.items || []);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating decision:", error);
      setErrorMessage("Failed to update adjustment decision");
    } finally {
      setUpdating(false);
    }
  };

  // Trigger payout with adjustments
  const handleTriggerPayout = async (bookingId, adjustmentsToApply) => {
    setUpdating(true);
    setErrorMessage(null);
    try {
      const result = await triggerPayout(bookingId, adjustmentsToApply);
      
      if (result.result?.booking_transfer_status === "withheld") {
        setSuccessMessage(`⚠️ Payout fully absorbed by adjustments. No transfer created.`);
      } else if (result.result?.transfer_row_status === "processed") {
        setSuccessMessage(`✅ Payout processed! Net amount: ₹${parseFloat(result.result?.net_transfer_amount).toFixed(2)}`);
      } else {
        setSuccessMessage(`✅ Payout triggered successfully!`);
      }
      
      // Close review modal
      setShowReviewModal(false);
      setSelectedBookingForReview(null);
      
      // Refresh data
      if (selectedDriver) {
        await fetchCancelledBookings(selectedDriver);
      }
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error triggering payout:", error);
      setErrorMessage(error.detail?.message || "Failed to trigger payout");
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateRule = async () => {
    if (!ruleForm.code.trim()) {
      setErrorMessage("Rule code is required");
      return;
    }
    if (!ruleForm.title.trim()) {
      setErrorMessage("Rule title is required");
      return;
    }
    if (!ruleForm.config.fine_value || parseFloat(ruleForm.config.fine_value) <= 0) {
      setErrorMessage("Valid fine value is required");
      return;
    }

    setUpdating(true);
    setErrorMessage(null);
    try {
      if (selectedRule) {
        await updateCommercialRule(selectedRule.id, ruleForm);
        setSuccessMessage("✨ Rule updated successfully!");
      } else {
        await createCommercialRule(ruleForm);
        setSuccessMessage("✨ Rule created successfully!");
      }
      
      await fetchRules();
      setShowRuleModal(false);
      resetRuleForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving rule:", error);
      if (error.detail?.error === "duplicate_commercial_rule_code") {
        setErrorMessage("Rule code already exists. Please use a different code.");
      } else {
        setErrorMessage(error.detail?.message || "Failed to save rule");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setRuleForm({
      rule_type: rule.rule_type,
      code: rule.code,
      title: rule.title,
      description: rule.description || "",
      priority: rule.priority,
      is_active: rule.is_active,
      config: { ...rule.config }
    });
    setShowRuleModal(true);
  };

  const handleToggleRuleStatus = async (ruleId, currentStatus) => {
    setUpdating(true);
    try {
      await updateRuleStatus(ruleId, !currentStatus);
      await fetchRules();
      setSuccessMessage(`✨ Rule ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error toggling rule status:", error);
      setErrorMessage("Failed to update rule status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    
    setUpdating(true);
    try {
      await deleteCommercialRule(ruleToDelete.id);
      await fetchRules();
      setSuccessMessage("✨ Rule deleted successfully!");
      setShowDeleteConfirm(false);
      setRuleToDelete(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting rule:", error);
      setErrorMessage("Failed to delete rule");
    } finally {
      setUpdating(false);
    }
  };

  const resetRuleForm = () => {
    setSelectedRule(null);
    setRuleForm({
      rule_type: "driver_trip_cancel",
      code: "cancel_within_24hrs_60_percent",
      title: "Late Cancellation Penalty",
      description: "Driver cancellation within 24 hours of trip start - 60% fare deduction",
      priority: 100,
      is_active: true,
      config: {
        min_minutes_before: 0,
        max_minutes_before: 1440,
        allowed: true,
        fine_mode: "percent_of_fare",
        fine_value: "60.00"
      }
    });
  };

  const resetFineForm = () => {
    setFineForm({
      amount: "",
      reason_text: "",
      admin_note: "",
      booking_id: ""
    });
    setSelectedBooking(null);
  };

  const getDriverDisplayName = (driver) => {
    return driver.profile?.full_name || driver.profile?.name || driver.name || "Unknown Driver";
  };

  const getDriverEmail = (driver) => {
    return driver.email || "No email";
  };

  const getDriverPhone = (driver) => {
    return driver.profile?.phone || driver.phone || "No phone";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDecisionBadge = (status) => {
    switch (status) {
      case 'included':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Included</span>;
      case 'excluded':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Excluded</span>;
      case 'pending':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Render Commercial Rules Tab
  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Commercial Rules</h2>
          <p className="text-gray-400 text-sm mt-1">Define fine policies and cancellation rules</p>
        </div>
        <button
          onClick={() => {
            resetRuleForm();
            setShowRuleModal(true);
          }}
          className="group px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Create Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-800"></div>
              <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        ) : rules.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400">No commercial rules found</p>
            <button
              onClick={() => {
                resetRuleForm();
                setShowRuleModal(true);
              }}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Create your first rule →
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {rule.rule_type === 'driver_trip_cancel' ? 'Driver Cancel' : 'Trip Latency'}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleRuleStatus(rule.id, rule.is_active)}
                      className={`p-1.5 rounded-lg transition ${
                        rule.is_active 
                          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" 
                          : "text-gray-400 hover:text-green-600 hover:bg-gray-100"
                      }`}
                    >
                      {rule.is_active ? <XCircleIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setRuleToDelete(rule);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <code className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{rule.code}</code>
                    {rule.is_active ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{rule.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{rule.description}</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Fine</span>
                      <span className="font-semibold text-gray-700">
                        {rule.config.fine_mode === 'flat_per_booking' 
                          ? `₹${rule.config.fine_value}` 
                          : `${rule.config.fine_value}% of fare`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-400">Condition</span>
                      <span className="text-xs text-gray-500">
                        {rule.config.max_minutes_before >= 1440 
                          ? 'Within 24h before start' 
                          : `${rule.config.max_minutes_before} min before`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Drivers Tab
  const renderDriversTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Drivers</h2>
          <p className="text-gray-400 text-sm mt-1">Review cancelled bookings and apply fines</p>
        </div>
        <button
          onClick={fetchDrivers}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center gap-2 shadow-sm"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-sm bg-white"
              />
            </div>
          </div>
          <div className="w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm bg-white text-gray-600"
            >
              <option value="all">All Drivers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-800"></div>
              <SparklesIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-400">No drivers found</p>
          </div>
        ) : (
          filteredDrivers.map((driver, index) => (
            <div
              key={driver.user_id || index}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {getDriverDisplayName(driver)}
                      </h3>
                      <p className="text-xs text-gray-400">{getDriverEmail(driver)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{getDriverPhone(driver)}</p>
                    </div>
                  </div>
                  {driver.is_active ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-400">Inactive</span>
                  )}
                </div>
                
                {driver.vehicle && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                    <TruckIcon className="w-3 h-3" />
                    <span>{driver.vehicle.reg_no || "No vehicle registered"}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex gap-2">
                <button
                  onClick={() => fetchCancelledBookings(driver)}
                  className="flex-1 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  Apply Fine
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Fine Modal - Create adjustment (PENDING) - FIXED FOR SCROLLING
  const renderFineModal = () => {
    if (!showFineModal || !selectedDriver) return null;
    
    const finePercentage = getActiveFinePercentage();
    const fineMode = getFineMode();
    const fineModeText = fineMode === "percent_of_fare" ? ` (${finePercentage}% of fare)` : " (Flat Rate)";
    
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Create Cancellation Fine</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Driver: <span className="font-medium text-gray-600">{getDriverDisplayName(selectedDriver)}</span>
                </p>
              </div>
              <button onClick={() => {
                setShowFineModal(false);
                resetFineForm();
              }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                ✕
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {cancelledBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-500">No cancelled bookings found for this driver</p>
                <p className="text-sm text-gray-400 mt-1">The driver has not cancelled any trips</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-3">
                  Found <span className="font-semibold text-gray-700">{cancelledBookings.length}</span> cancelled booking(s). Select one to create a fine:
                </p>
                
                <div className="space-y-3">
                  {cancelledBookings.map((booking) => (
                    <div
                      key={booking.booking_id}
                      onClick={() => {
                        if (!booking.hasAdjustments) {
                          setSelectedBooking(booking);
                          setFineForm({
                            booking_id: booking.booking_id,
                            amount: booking.recommendedFine,
                            reason_text: `Driver ${getDriverDisplayName(selectedDriver)} cancelled trip - Late cancellation penalty (${booking.finePercentage}% of fare)`,
                            admin_note: `Booking ID: ${booking.booking_id}\nCancelled on: ${formatDate(booking.created_at)}`
                          });
                        }
                      }}
                      className={`border rounded-xl p-4 transition-all duration-200 ${
                        booking.hasAdjustments 
                          ? 'border-green-200 bg-green-50/30 cursor-default'
                          : selectedBooking?.booking_id === booking.booking_id
                            ? 'border-gray-400 bg-gray-50 shadow-md cursor-pointer'
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <code className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {booking.booking_id?.slice(0, 13)}...
                            </code>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                              Cancelled
                            </span>
                            {booking.hasAdjustments && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                ✓ Fine Created
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Passenger: <span className="font-medium">{booking.passenger_name || 'N/A'}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Fare: <span className="font-medium">₹{parseFloat(booking.fareAmount).toFixed(2)}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Cancelled on: {formatDate(booking.created_at)}
                          </p>
                          {booking.hasAdjustments && booking.existingAdjustment && (
                            <div className="mt-2">
                              <p className="text-xs text-green-600">
                                Existing fine: ₹{booking.existingAdjustment.amount} 
                                ({getDecisionBadge(booking.existingAdjustment.decision_status)})
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewAdjustments(booking);
                                }}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <EyeIcon className="w-3 h-3 inline mr-1" />
                                Review Adjustment
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            {booking.hasAdjustments ? "Fine Amount" : `Recommended Fine${fineModeText}`}
                          </p>
                          <p className="text-xl font-bold text-gray-800">
                            ₹{booking.recommendedFine}
                          </p>
                          {!booking.hasAdjustments && booking.fareAmount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              ({booking.finePercentage}% of ₹{parseFloat(booking.fareAmount).toFixed(2)})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedBooking && !selectedBooking.hasAdjustments && (
              <div className="mt-6 border-t border-gray-100 pt-5 space-y-4">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    This will create a PENDING adjustment. After creation, review and mark as INCLUDED before payout.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fine Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={fineForm.amount}
                      onChange={(e) => setFineForm({ ...fineForm, amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: {fineMode === "percent_of_fare" ? `${finePercentage}% of fare amount` : "Flat rate fine"} 
                    (₹{selectedBooking.recommendedFine})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <textarea
                    value={fineForm.reason_text}
                    onChange={(e) => setFineForm({ ...fineForm, reason_text: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note (Optional)</label>
                  <textarea
                    value={fineForm.admin_note}
                    onChange={(e) => setFineForm({ ...fineForm, admin_note: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none text-gray-500"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
            <button
              onClick={handleCreateAdjustment}
              disabled={updating || !selectedBooking || selectedBooking.hasAdjustments}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {updating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CurrencyRupeeIcon className="w-4 h-4" />
                  Create Adjustment (PENDING)
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setShowFineModal(false);
                resetFineForm();
              }}
              className="flex-1 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Review Adjustments Modal - FIXED FOR SCROLLING
  const renderReviewModal = () => {
    if (!showReviewModal || !selectedBookingForReview) return null;
    
    const allAdjustments = [...bookingAdjustments, ...openDriverAdjustments];
    const includedAdjustments = allAdjustments.filter(adj => adj.decision_status === 'included');
    const canTriggerPayout = includedAdjustments.length > 0;
    
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Review Adjustments</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Booking: <span className="font-mono text-xs">{selectedBookingForReview.booking_id?.slice(0, 13)}...</span>
                </p>
              </div>
              <button onClick={() => {
                setShowReviewModal(false);
                setSelectedBookingForReview(null);
              }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                ✕
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Booking Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Passenger</p>
                  <p className="font-medium text-gray-800">{selectedBookingForReview.passenger_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fare Amount</p>
                  <p className="font-medium text-gray-800">₹{parseFloat(selectedBookingForReview.fareAmount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cancelled On</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedBookingForReview.created_at)}</p>
                </div>
              </div>
            </div>
            
            {/* Adjustments List */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Adjustments / Fines</h4>
              {allAdjustments.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No adjustments found for this booking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allAdjustments.map((adj) => (
                    <div key={adj.id} className="border rounded-xl p-4 bg-white">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              adj.adjustment_type === 'fine' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {adj.adjustment_type}
                            </span>
                            {getDecisionBadge(adj.decision_status)}
                          </div>
                          <p className="text-sm text-gray-700 font-medium">₹{parseFloat(adj.amount).toFixed(2)}</p>
                          <p className="text-sm text-gray-600 mt-1">{adj.reason_text}</p>
                          {adj.admin_note && (
                            <p className="text-xs text-gray-500 mt-1">Note: {adj.admin_note}</p>
                          )}
                          {adj.remaining_amount > 0 && adj.decision_status === 'included' && (
                            <p className="text-xs text-green-600 mt-1">
                              Remaining: ₹{parseFloat(adj.remaining_amount).toFixed(2)}
                            </p>
                          )}
                        </div>
                        {adj.decision_status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateDecision(adj.id, 'included', 'Approved by admin')}
                              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Include
                            </button>
                            <button
                              onClick={() => handleUpdateDecision(adj.id, 'excluded', 'Rejected by admin')}
                              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Exclude
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Trigger Payout Section */}
            {canTriggerPayout && (
              <div className="border-t pt-4 mt-4">
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 mb-4">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {includedAdjustments.length} adjustment(s) are INCLUDED and ready to be applied.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    const adjustmentsToApply = includedAdjustments.map(adj => ({
                      adjustment_id: adj.id,
                      applied_amount: adj.remaining_amount || adj.amount
                    }));
                    handleTriggerPayout(selectedBookingForReview.booking_id, adjustmentsToApply);
                  }}
                  disabled={updating}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-medium"
                >
                  {updating ? "Processing..." : "Trigger Payout with Included Adjustments"}
                </button>
              </div>
            )}
          </div>
          
          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end flex-shrink-0">
            <button
              onClick={() => {
                setShowReviewModal(false);
                setSelectedBookingForReview(null);
              }}
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rule Modal - FIXED FOR SCROLLING
  const renderRuleModal = () => {
    if (!showRuleModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedRule ? "Edit Rule" : "Create Rule"}
              </h3>
              <button onClick={() => {
                setShowRuleModal(false);
                resetRuleForm();
              }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                ✕
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                <select
                  value={ruleForm.rule_type}
                  onChange={(e) => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="driver_trip_cancel">Driver Trip Cancel</option>
                  <option value="trip_latency">Trip Latency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rule Code</label>
                <input
                  type="text"
                  value={ruleForm.code}
                  onChange={(e) => setRuleForm({ ...ruleForm, code: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="cancel_within_24hrs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={ruleForm.title}
                onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={ruleForm.description}
                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                rows="2"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <input
                  type="number"
                  value={ruleForm.priority}
                  onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fine Mode</label>
                <select
                  value={ruleForm.config.fine_mode}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    config: { ...ruleForm.config, fine_mode: e.target.value }
                  })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="flat_per_booking">Flat Rate</option>
                  <option value="percent_of_fare">Percentage of Fare</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Minutes Before
                </label>
                <input
                  type="number"
                  value={ruleForm.config.min_minutes_before}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    config: { ...ruleForm.config, min_minutes_before: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Minutes Before <span className="text-xs text-gray-400">(1440 = 24 hrs)</span>
                </label>
                <input
                  type="number"
                  value={ruleForm.config.max_minutes_before}
                  onChange={(e) => setRuleForm({
                    ...ruleForm,
                    config: { ...ruleForm.config, max_minutes_before: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fine Value {ruleForm.config.fine_mode === 'percent_of_fare' && '(%)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={ruleForm.config.fine_value}
                onChange={(e) => setRuleForm({
                  ...ruleForm,
                  config: { ...ruleForm.config, fine_value: e.target.value }
                })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleForm.is_active}
                  onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-gray-700 focus:ring-gray-400"
                />
                <span className="text-sm text-gray-700">Rule is active</span>
              </label>
            </div>
          </div>
          
          {/* Footer - Fixed */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
            <button
              onClick={handleCreateRule}
              disabled={updating}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 disabled:opacity-50 font-medium"
            >
              {updating ? "Saving..." : (selectedRule ? "Update Rule" : "Create Rule")}
            </button>
            <button
              onClick={() => {
                setShowRuleModal(false);
                resetRuleForm();
              }}
              className="flex-1 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Delete Rule</h3>
          </div>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete "<span className="font-medium text-gray-700">{ruleToDelete?.title}</span>"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteRule}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all duration-300 disabled:opacity-50"
            >
              {updating ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setRuleToDelete(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <div className="flex-1 overflow-y-auto p-8">
          {successMessage && (
            <div className="mb-5 p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 rounded-xl animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-emerald-600" />
                <p className="text-emerald-700 text-sm">{successMessage}</p>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="mb-5 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-xl">
              <p className="text-rose-700 text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">Cancellation Fine Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage commercial rules and apply cancellation fines to drivers</p>
          </div>
          
          <div className="flex gap-6 mb-6 border-b border-gray-100 flex-wrap">
            <button
              onClick={() => setActiveTab("rules")}
              className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "rules" 
                  ? "text-gray-800 border-b-2 border-gray-800" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Commercial Rules
            </button>
            <button
              onClick={() => setActiveTab("drivers")}
              className={`pb-3 px-1 text-sm font-medium transition-all duration-200 ${
                activeTab === "drivers" 
                  ? "text-gray-800 border-b-2 border-gray-800" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Drivers
              {filteredDrivers.length > 0 && (
                <span className="ml-1.5 text-xs text-gray-400">({filteredDrivers.length})</span>
              )}
            </button>
          </div>
          
          {activeTab === "rules" && renderRulesTab()}
          {activeTab === "drivers" && renderDriversTab()}
        </div>
      </div>
      
      {renderRuleModal()}
      {renderFineModal()}
      {renderReviewModal()}
      {renderDeleteConfirmModal()}
    </div>
  );
};

export default CancellationFine;