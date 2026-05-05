// import React, { useState, useEffect } from "react";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../../assets/components/navbar/TopNavbar";
// import {
//   Cog6ToothIcon,
//   UserGroupIcon,
//   CreditCardIcon,
//   BanknotesIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   ArrowPathIcon,
//   EyeIcon,
//   PlusIcon,
//   XMarkIcon,
//   DocumentTextIcon,
//   CalendarIcon,
//   ShieldCheckIcon,
//   MapPinIcon,
//   ClockIcon,
//   UserIcon,
//   TruckIcon,
//   CalculatorIcon,
//   CurrencyRupeeIcon
// } from "@heroicons/react/24/outline";

// const API_BASE_URL = "https://be.shuttleapp.transev.site/admin/payouts";
// const ADMIN_API_BASE_URL = "https://be.shuttleapp.transev.site/admin";

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access_token");
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
// };

// // ============= API CALLS =============

// // Payout Settings
// const getPayoutSettings = async () => {
//   const response = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch settings");
//   return response.json();
// };

// const updatePayoutSettings = async (commission_percent) => {
//   const response = await fetch(`${API_BASE_URL}/settings`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ commission_percent }),
//   });
//   if (!response.ok) throw new Error("Failed to update settings");
//   return response.json();
// };

// // Driver Management
// const getDrivers = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const url = params ? `${API_BASE_URL}/drivers?${params}` : `${API_BASE_URL}/drivers`;
//   const response = await fetch(url, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch drivers");
//   const data = await response.json();
//   console.log("Drivers API response:", data);
//   return data;
// };

// const getDriverDetails = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch driver details");
//   return response.json();
// };

// const updateDriverPayoutDetails = async (driverUserId, details) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/details`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(details),
//   });
//   if (!response.ok) throw new Error("Failed to update driver details");
//   return response.json();
// };

// const updateDriverEligibility = async (driverUserId, isPayoutEligible) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/eligibility`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ is_payout_eligible: isPayoutEligible }),
//   });
//   if (!response.ok) throw new Error("Failed to update eligibility");
//   return response.json();
// };

// const updateLinkedAccountStatus = async (driverUserId, razorpay_linked_account_id, linked_account_status) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/linked-account`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ razorpay_linked_account_id, linked_account_status }),
//   });
//   if (!response.ok) throw new Error("Failed to update linked account status");
//   return response.json();
// };

// const createLinkedAccount = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/create-linked-account`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw errorData;
//   }
//   return response.json();
// };

// const syncLinkedAccount = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/sync-linked-account`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//   });
//   if (!response.ok) throw new Error("Failed to sync linked account");
//   return response.json();
// };

// const getProviderLinkedAccount = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/linked-account/provider`, {
//     headers: getAuthHeaders(),
//   });
//   if (!response.ok) throw new Error("Failed to fetch provider account");
//   return response.json();
// };

// // Payout Bookings
// const getPayoutBookings = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const url = params ? `${API_BASE_URL}/bookings?${params}` : `${API_BASE_URL}/bookings`;
//   const response = await fetch(url, { 
//     headers: getAuthHeaders(),
//     cache: 'no-cache'
//   });
//   if (!response.ok) throw new Error("Failed to fetch bookings");
//   const data = await response.json();
//   console.log("Payout bookings response:", data);
//   return data;
// };

// const getBookingDetail = async (bookingId) => {
//   const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch booking detail");
//   return response.json();
// };

// // Get booking details from main booking API
// const getBookingDetailsByBookingId = async (bookingId) => {
//   const response = await fetch(`${ADMIN_API_BASE_URL}/booking/${bookingId}`, {
//     headers: getAuthHeaders()
//   });
//   if (!response.ok) throw new Error("Failed to fetch booking details");
//   return response.json();
// };

// // Get trip passengers by trip ID
// const getTripPassengers = async (tripId) => {
//   const response = await fetch(`${ADMIN_API_BASE_URL}/${tripId}/passengers`, {
//     headers: getAuthHeaders()
//   });
//   if (!response.ok) throw new Error("Failed to fetch trip passengers");
//   return response.json();
// };

// // Check if booking exists in payout system
// const checkBookingInPayoutSystem = async (bookingId) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, { 
//       headers: getAuthHeaders() 
//     });
//     if (response.status === 404) {
//       return { exists: false };
//     }
//     if (!response.ok) throw new Error("Failed to check booking");
//     const data = await response.json();
//     return { exists: true, data };
//   } catch (error) {
//     return { exists: false, error: error.message };
//   }
// };

// // Create adjustment for a specific booking
// const createAdjustment = async (bookingId, adjustmentData) => {
//   const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/adjustments`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(adjustmentData),
//   });

//   if (response.status === 404) {
//     throw new Error("BOOKING_NOT_IN_PAYOUT_SYSTEM");
//   }

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || "Failed to create adjustment");
//   }

//   return response.json();
// };

// const updateAdjustmentDecision = async (adjustmentId, decision_status, admin_note) => {
//   const response = await fetch(`${API_BASE_URL}/adjustments/${adjustmentId}/decision`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ decision_status, admin_note }),
//   });
//   if (!response.ok) throw new Error("Failed to update adjustment decision");
//   return response.json();
// };

// const getOpenAdjustmentsForDriver = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/open-adjustments`, {
//     headers: getAuthHeaders(),
//   });
//   if (!response.ok) throw new Error("Failed to fetch open adjustments");
//   return response.json();
// };

// // Payout Triggers
// const triggerSinglePayout = async (bookingId, adjustments_to_apply = []) => {
//   const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/trigger`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({
//       require_completed: true,
//       adjustments_to_apply,
//     }),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw errorData;
//   }
//   return response.json();
// };

// // Transfers
// const getTransfers = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const url = params ? `${API_BASE_URL}/transfers?${params}` : `${API_BASE_URL}/transfers`;
//   const response = await fetch(url, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch transfers");
//   return response.json();
// };

// const getTransferDetail = async (transferId) => {
//   const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch transfer detail");
//   return response.json();
// };

// // Refunds
// const getRefundQueue = async () => {
//   const response = await fetch(`${API_BASE_URL}/refunds`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch refund queue");
//   return response.json();
// };

// const reconcileRefund = async (bookingId) => {
//   const response = await fetch(`${API_BASE_URL}/refunds/${bookingId}/reconcile`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//   });
//   if (!response.ok) throw new Error("Failed to reconcile refund");
//   return response.json();
// };

// // Dashboard
// const getDashboard = async () => {
//   const response = await fetch(`${API_BASE_URL}/dashboard`, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch dashboard");
//   return response.json();
// };

// // ============= HELPER FUNCTIONS =============

// // Helper function to get display status with proper mapping
// const getDisplayStatus = (booking) => {
//   // Map transfer_status to user-friendly display text
//   switch (booking.transfer_status) {
//     case 'ready':
//       return { text: 'Ready for Payout', color: 'bg-yellow-100 text-yellow-800' };
//     case 'transferred':
//       return { text: 'Transferred', color: 'bg-blue-100 text-blue-800' };
//     case 'processed':
//       return { text: 'Completed', color: 'bg-green-100 text-green-800' };
//     case 'withheld':
//       return { text: 'Withheld', color: 'bg-red-100 text-red-800' };
//     case 'failed':
//       return { text: 'Failed', color: 'bg-red-100 text-red-800' };
//     default:
//       return { text: booking.transfer_status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
//   }
// };

// const getTransferStatusColor = (status) => {
//   switch (status) {
//     case 'ready': return 'bg-yellow-100 text-yellow-800';
//     case 'transferred': return 'bg-green-100 text-green-800';
//     case 'processed': return 'bg-green-100 text-green-800';
//     case 'withheld': return 'bg-red-100 text-red-800';
//     case 'failed': return 'bg-red-100 text-red-800';
//     case 'reversed': return 'bg-gray-100 text-gray-800';
//     default: return 'bg-gray-100 text-gray-800';
//   }
// };

// const getLinkedAccountStatusColor = (status) => {
//   switch (status) {
//     case 'active': return 'text-green-600 bg-green-50';
//     case 'blocked': return 'text-red-600 bg-red-50';
//     case 'deleted': return 'text-gray-600 bg-gray-50';
//     default: return 'text-yellow-600 bg-yellow-50';
//   }
// };

// const getBookingStatusColor = (status) => {
//   switch (status) {
//     case 'completed': return 'bg-green-100 text-green-800';
//     case 'confirmed': return 'bg-blue-100 text-blue-800';
//     case 'cancelled': return 'bg-red-100 text-red-800';
//     case 'pending': return 'bg-yellow-100 text-yellow-800';
//     default: return 'bg-gray-100 text-gray-800';
//   }
// };

// // ============= MAIN COMPONENT =============

// const PayoutService = () => {
//   // Navigation State
//   const [activeTab, setActiveTab] = useState("dashboard");

//   // UI State
//   const [loading, setLoading] = useState(false);
//   const [updating, setUpdating] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [showPayoutConfirmation, setShowPayoutConfirmation] = useState(false);
//   const [pendingPayoutBooking, setPendingPayoutBooking] = useState(null);

//   // Data State
//   const [dashboard, setDashboard] = useState(null);
//   const [settings, setSettings] = useState(null);
//   const [drivers, setDrivers] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [driverDetails, setDriverDetails] = useState(null);
//   const [payoutBookings, setPayoutBookings] = useState([]);
//   const [selectedBookingForAdjustment, setSelectedBookingForAdjustment] = useState(null);
//   const [bookingDetail, setBookingDetail] = useState(null);
//   const [openAdjustments, setOpenAdjustments] = useState([]);
//   const [selectedAdjustments, setSelectedAdjustments] = useState({});
//   const [transfers, setTransfers] = useState([]);
//   const [refundQueue, setRefundQueue] = useState([]);

//   // Monthly Summary State
//   const [showMonthlySummary, setShowMonthlySummary] = useState(false);
//   const [monthlySummary, setMonthlySummary] = useState({
//     totalBookings: 0,
//     totalGrossAmount: 0,
//     totalDeductions: 0,
//     totalNetAmount: 0,
//     bookings: []
//   });

//   // Enhanced Booking Details State
//   const [showFullBookingModal, setShowFullBookingModal] = useState(false);
//   const [fullBookingDetails, setFullBookingDetails] = useState(null);
//   const [tripPassengers, setTripPassengers] = useState(null);
//   const [showTripPassengersModal, setShowTripPassengersModal] = useState(false);

//   // Modal State
//   const [showBankModal, setShowBankModal] = useState(false);
//   const [showSettingsModal, setShowSettingsModal] = useState(false);
//   const [showProviderModal, setShowProviderModal] = useState(false);
//   const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
//   const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);
//   const [showMonthlyPayoutModal, setShowMonthlyPayoutModal] = useState(false);
//   const [showBulkPayoutModal, setShowBulkPayoutModal] = useState(false);
//   const [providerAccount, setProviderAccount] = useState(null);

//   // Form State
//   const [commissionPercent, setCommissionPercent] = useState("");
//   const [bankDetails, setBankDetails] = useState({
//     account_holder_name: "",
//     bank_account_number: "",
//     ifsc_code: "",
//     phone_number: "",
//   });
//   const [adjustmentForm, setAdjustmentForm] = useState({
//     adjustment_type: "fine",
//     amount: "",
//     reason_code: "",
//     reason_text: "",
//     admin_note: "",
//   });
//   const [monthlyPayoutConfig, setMonthlyPayoutConfig] = useState({
//     month: new Date().getMonth() + 1,
//     year: new Date().getFullYear(),
//   });
//   const [bulkPayoutBookings, setBulkPayoutBookings] = useState([]);
//   const [processingBooking, setProcessingBooking] = useState(null);
//   const [batchResults, setBatchResults] = useState(null);

//   // Filters
//   const [driverFilter, setDriverFilter] = useState("");
//   const [transferStatusFilter, setTransferStatusFilter] = useState("");

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const [dashboardData, settingsData, driversData] = await Promise.all([
//         getDashboard(),
//         getPayoutSettings(),
//         getDrivers(),
//       ]);
//       setDashboard(dashboardData);
//       setSettings(settingsData);
//       setCommissionPercent(settingsData.commission_percent?.toString() || "0");

//       // Extract drivers array from response
//       let driversList = [];
//       if (driversData.items && Array.isArray(driversData.items)) {
//         driversList = driversData.items;
//       } else if (Array.isArray(driversData)) {
//         driversList = driversData;
//       } else if (driversData.drivers && Array.isArray(driversData.drivers)) {
//         driversList = driversData.drivers;
//       }
//       setDrivers(driversList);
//       console.log("Loaded drivers:", driversList);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setErrorMessage("Failed to load initial data. Please refresh the page.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDriverDetails = async (driver) => {
//     setSelectedDriver(driver);
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const details = await getDriverDetails(driver.user_id);
//       console.log("Driver details:", details);
//       setDriverDetails(details);

//       // Set bank details from response
//       const payoutDetails = details.payout_details || {};
//       setBankDetails({
//         account_holder_name: payoutDetails.account_holder_name || "",
//         bank_account_number: payoutDetails.bank_account_number || "",
//         ifsc_code: payoutDetails.ifsc_code || "",
//         phone_number: payoutDetails.phone_number || "",
//       });

//       const adjustments = await getOpenAdjustmentsForDriver(driver.user_id);
//       setOpenAdjustments(adjustments.items || []);

//       const bookings = await getPayoutBookings({ driver_user_id: driver.user_id });
//       console.log("Fetched payout bookings:", bookings);
//       setPayoutBookings(bookings.items || []);
//     } catch (error) {
//       console.error("Error fetching driver details:", error);
//       setErrorMessage("Failed to load driver details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sync booking status with main system
//   const syncBookingStatus = async (bookingId, tripId) => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       // Fetch latest booking status from main system
//       const bookingDetails = await getBookingDetailsByBookingId(bookingId);
//       console.log("Latest booking status from main system:", bookingDetails);

//       // Fetch latest trip passengers
//       if (tripId) {
//         const passengers = await getTripPassengers(tripId);
//         console.log("Trip passengers status:", passengers);

//         // Check if this booking is completed in the trip
//         const bookingInTrip = passengers.passengers?.find(p => p.booking_id === bookingId);
//         if (bookingInTrip && bookingInTrip.status === 'completed') {
//           setSuccessMessage(`✅ Booking ${bookingId.substring(0, 8)}... is COMPLETED in the main system! The payout system will update shortly.`);

//           // Refresh the driver's bookings to get latest status
//           if (selectedDriver) {
//             const refreshedBookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
//             setPayoutBookings(refreshedBookings.items || []);
//             console.log("Refreshed bookings after sync:", refreshedBookings);
//           }
//         } else {
//           setErrorMessage(`Booking status in main system: ${bookingInTrip?.status || 'not found'}`);
//         }
//       }

//       setTimeout(() => setSuccessMessage(null), 5000);
//     } catch (error) {
//       console.error("Error syncing booking status:", error);
//       setErrorMessage("Failed to sync booking status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Force refresh payout bookings
//   const refreshPayoutBookings = async () => {
//     if (!selectedDriver) return;

//     setLoading(true);
//     try {
//       const refreshedBookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
//       setPayoutBookings(refreshedBookings.items || []);
//       setSuccessMessage("✅ Bookings refreshed successfully!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error refreshing bookings:", error);
//       setErrorMessage("Failed to refresh bookings");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate monthly summary with proper amounts
//   const calculateMonthlySummary = async () => {
//     if (!selectedDriver) return;

//     setLoading(true);
//     try {
//       const response = await getPayoutBookings({ 
//         driver_user_id: selectedDriver.user_id,
//         month: monthlyPayoutConfig.month,
//         year: monthlyPayoutConfig.year
//       });

//       const bookings = response.items || [];
//       console.log("Monthly bookings:", bookings);

//       const eligibleBookings = bookings.filter(b => b.transfer_status === 'ready');

//       const summary = {
//         totalBookings: eligibleBookings.length,
//         totalGrossAmount: 0,
//         totalDeductions: 0,
//         totalNetAmount: 0,
//         bookings: eligibleBookings
//       };

//       eligibleBookings.forEach(booking => {
//         const gross = parseFloat(booking.driver_payout_amount) || 0;
//         const deductions = parseFloat(booking.applied_adjustment_amount) || 0;
//         summary.totalGrossAmount += gross;
//         summary.totalDeductions += deductions;
//         summary.totalNetAmount += (gross - deductions);
//       });

//       console.log("Monthly summary:", summary);
//       setMonthlySummary(summary);
//       setShowMonthlySummary(true);
//     } catch (error) {
//       console.error("Error calculating monthly summary:", error);
//       setErrorMessage("Failed to calculate monthly summary");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBookingDetail = async (bookingId) => {
//     setLoading(true);
//     try {
//       const detail = await getBookingDetail(bookingId);
//       setBookingDetail(detail);
//       setShowBookingDetailModal(true);
//     } catch (error) {
//       console.error("Error fetching booking detail:", error);
//       setErrorMessage("Failed to fetch booking details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewFullBookingDetails = async (bookingId) => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const enhancedData = await getBookingDetailsByBookingId(bookingId);
//       setFullBookingDetails(enhancedData);
//       setShowFullBookingModal(true);

//       if (enhancedData.trip_id) {
//         const passengers = await getTripPassengers(enhancedData.trip_id);
//         setTripPassengers(passengers);
//       } else {
//         setTripPassengers(null);
//       }
//     } catch (error) {
//       console.error("Error fetching enhanced booking details:", error);
//       setErrorMessage("Failed to fetch booking details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewTripPassengers = async (tripId) => {
//     setLoading(true);
//     try {
//       const passengers = await getTripPassengers(tripId);
//       setTripPassengers(passengers);
//       setShowTripPassengersModal(true);

//       // After viewing passengers, refresh the driver's bookings
//       if (selectedDriver) {
//         const refreshedBookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
//         setPayoutBookings(refreshedBookings.items || []);
//         console.log("Refreshed bookings after viewing trip:", refreshedBookings);
//       }
//     } catch (error) {
//       console.error("Error fetching trip passengers:", error);
//       setErrorMessage("Failed to fetch trip passengers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTransfers = async () => {
//     setLoading(true);
//     try {
//       const filters = {};
//       if (driverFilter) filters.driver_user_id = driverFilter;
//       if (transferStatusFilter) filters.status = transferStatusFilter;
//       const data = await getTransfers(filters);
//       setTransfers(data.items || []);
//     } catch (error) {
//       console.error("Error fetching transfers:", error);
//       setErrorMessage("Failed to fetch transfers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRefundQueue = async () => {
//     setLoading(true);
//     try {
//       const data = await getRefundQueue();
//       setRefundQueue(data.items || []);
//     } catch (error) {
//       console.error("Error fetching refund queue:", error);
//       setErrorMessage("Failed to fetch refund queue");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveBankDetails = async () => {
//     if (!bankDetails.account_holder_name.trim()) {
//       setErrorMessage("Account holder name is required");
//       return;
//     }
//     if (!bankDetails.bank_account_number.trim()) {
//       setErrorMessage("Bank account number is required");
//       return;
//     }
//     if (!bankDetails.ifsc_code.trim()) {
//       setErrorMessage("IFSC code is required");
//       return;
//     }
//     if (!bankDetails.phone_number.trim() || bankDetails.phone_number.length !== 10) {
//       setErrorMessage("Valid 10-digit phone number is required");
//       return;
//     }

//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       await updateDriverPayoutDetails(selectedDriver.user_id, bankDetails);
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);
//       setShowBankModal(false);
//       setSuccessMessage("✅ Bank details saved successfully!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error saving bank details:", error);
//       setErrorMessage("Failed to save bank details. Please check all fields.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Complete flow: Create linked account and activate it
//   const handleCreateAndActivateLinkedAccount = async () => {
//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       // Step 1: Create linked account
//       const createResult = await createLinkedAccount(selectedDriver.user_id);
//       console.log("Linked account created:", createResult);

//       // Step 2: Get the linked account ID
//       const linkedAccountId = createResult.driver?.payout_details?.razorpay_linked_account_id;

//       if (linkedAccountId) {
//         // Step 3: Update linked account status to active
//         await updateLinkedAccountStatus(selectedDriver.user_id, linkedAccountId, "active");

//         // Step 4: Mark driver as payout eligible
//         await updateDriverEligibility(selectedDriver.user_id, true);

//         setSuccessMessage("✅ Linked account created, activated, and driver marked as payout eligible!");
//       } else {
//         setSuccessMessage("✅ Linked account created successfully!");
//       }

//       // Refresh driver details
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);

//       setTimeout(() => setSuccessMessage(null), 5000);
//     } catch (error) {
//       console.error("Error in linked account flow:", error);
//       if (error.detail?.error === "driver_payout_details_required") {
//         setErrorMessage("Please save bank details first before creating linked account.");
//       } else if (error.detail?.error === "razorpay_route_request_failed") {
//         setErrorMessage(
//           "Razorpay account creation failed. Please verify:\n" +
//           "• Account holder name matches bank records\n" +
//           "• Bank account number is valid\n" +
//           "• IFSC code is correct\n" +
//           "• Phone number is registered with the bank"
//         );
//       } else {
//         setErrorMessage(error.detail?.message || "Failed to create linked account.");
//       }
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleSyncLinkedAccount = async () => {
//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       await syncLinkedAccount(selectedDriver.user_id);
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);
//       setSuccessMessage("✅ Linked account synced successfully!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error syncing linked account:", error);
//       setErrorMessage("Failed to sync linked account.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleViewProviderAccount = async () => {
//     setLoading(true);
//     try {
//       const data = await getProviderLinkedAccount(selectedDriver.user_id);
//       setProviderAccount(data);
//       setShowProviderModal(true);
//     } catch (error) {
//       console.error("Error fetching provider account:", error);
//       setErrorMessage("Failed to fetch provider account details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEnablePayout = async () => {
//     setUpdating(true);
//     setErrorMessage(null);
//     try {
//       await updateDriverEligibility(selectedDriver.user_id, true);
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);
//       setSuccessMessage("✅ Payout eligibility enabled!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error enabling payout:", error);
//       setErrorMessage("Failed to enable payout eligibility.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleCreateAdjustment = async () => {
//     if (!selectedBookingForAdjustment) {
//       setErrorMessage("Please select a booking first to create an adjustment");
//       return;
//     }

//     if (!adjustmentForm.reason_text.trim()) {
//       setErrorMessage("Reason text is required");
//       return;
//     }
//     if (!adjustmentForm.amount || parseFloat(adjustmentForm.amount) <= 0) {
//       setErrorMessage("Valid amount is required");
//       return;
//     }

//     setUpdating(true);
//     setErrorMessage(null);

//     try {
//       await createAdjustment(selectedBookingForAdjustment.booking_id, {
//         adjustment_type: adjustmentForm.adjustment_type,
//         amount: adjustmentForm.amount,
//         reason_code: adjustmentForm.reason_code,
//         reason_text: adjustmentForm.reason_text,
//         admin_note: adjustmentForm.admin_note,
//       });

//       if (selectedDriver) {
//         const adjustments = await getOpenAdjustmentsForDriver(selectedDriver.user_id);
//         setOpenAdjustments(adjustments.items || []);

//         const bookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
//         setPayoutBookings(bookings.items || []);
//       }

//       setShowAdjustmentModal(false);
//       setSelectedBookingForAdjustment(null);
//       setAdjustmentForm({
//         adjustment_type: "fine",
//         amount: "",
//         reason_code: "",
//         reason_text: "",
//         admin_note: "",
//       });
//       setSuccessMessage("✅ Adjustment created successfully!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error creating adjustment:", error);

//       if (error.message === "BOOKING_NOT_IN_PAYOUT_SYSTEM") {
//         setErrorMessage(
//           "This booking is not registered in the payout system yet. " +
//           "Please ensure the booking is completed and has been synced to the payout system."
//         );
//       } else {
//         setErrorMessage(`Failed to create adjustment: ${error.message}`);
//       }
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleIncludeExcludeAdjustment = async (adjustmentId, decision_status) => {
//     setUpdating(true);
//     try {
//       await updateAdjustmentDecision(adjustmentId, decision_status, `Admin ${decision_status} this adjustment`);

//       if (selectedDriver) {
//         const adjustments = await getOpenAdjustmentsForDriver(selectedDriver.user_id);
//         setOpenAdjustments(adjustments.items || []);
//       }

//       setSuccessMessage(`✅ Adjustment ${decision_status} successfully!`);
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error updating adjustment:", error);
//       setErrorMessage("Failed to update adjustment");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleToggleAdjustmentSelection = (adjustmentId, adjustment) => {
//     setSelectedAdjustments(prev => {
//       const current = prev[adjustmentId];
//       if (current) {
//         const newPrev = { ...prev };
//         delete newPrev[adjustmentId];
//         return newPrev;
//       } else {
//         return {
//           ...prev,
//           [adjustmentId]: {
//             adjustment_id: adjustmentId,
//             applied_amount: adjustment.remaining_amount || adjustment.amount,
//           }
//         };
//       }
//     });
//   };

//   const handleProcessPayout = async (bookingId) => {
//     setProcessingBooking(bookingId);
//     setErrorMessage(null);

//     const adjustments_to_apply = Object.values(selectedAdjustments);

//     // Find the booking to check its net amount
//     const booking = payoutBookings.find(b => b.booking_id === bookingId);
//     const netPayoutAmount = parseFloat(booking?.net_payout_amount || 0);

//     // Check if net payout amount is valid
//     if (netPayoutAmount <= 0) {
//       setErrorMessage(`Cannot process payout: Net amount (₹${netPayoutAmount.toFixed(2)}) is zero or negative after deductions.`);
//       setProcessingBooking(null);
//       return;
//     }

//     // Optional: Add a warning if amount is very small
//     if (netPayoutAmount < 1) {
//       setErrorMessage(`Net payout amount (₹${netPayoutAmount.toFixed(2)}) is too small to transfer. Minimum transfer amount is ₹1.`);
//       setProcessingBooking(null);
//       return;
//     }

//     try {
//       const result = await triggerSinglePayout(bookingId, adjustments_to_apply);
//       console.log("Payout result:", result);

//       if (result.booking_transfer_status === "withheld") {
//         setSuccessMessage("⚠️ Payout fully absorbed by deductions. No transfer created.");
//       } else if (result.transfer_row_status === "processed") {
//         setSuccessMessage(`✅ Payout processed successfully! Net amount: ₹${parseFloat(result.net_transfer_amount).toFixed(2)}`);
//       } else if (result.transfer_row_status === "failed") {
//         setErrorMessage(`Payout failed: ${result.failure_reason || "Provider transfer failed"}`);
//       } else {
//         setSuccessMessage("Payout processed successfully!");
//       }

//       setSelectedAdjustments({});

//       const bookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
//       setPayoutBookings(bookings.items || []);

//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error processing payout:", error);
//       const errorMsg = error.detail?.error || error.detail?.message || "Failed to process payout";

//       if (error.detail?.error === "booking_not_completed") {
//         setErrorMessage("Booking is not completed yet. Cannot process payout.");
//       } else if (error.detail?.error === "driver_not_payout_eligible") {
//         setErrorMessage("Driver is not payout eligible. Please enable eligibility first.");
//       } else if (error.detail?.error === "linked_account_not_active") {
//         setErrorMessage("Linked account is not active. Please check the account status.");
//       } else if (error.detail?.error === "payout_details_not_found") {
//         setErrorMessage("Payout details not found. Please save bank details first.");
//       } else if (error.detail?.error === "linked_account_not_available") {
//         setErrorMessage("Linked account not available. Please create a linked account first.");
//       } else if (error.detail?.error === "adjustment_amount_exceeds_gross") {
//         setErrorMessage("Selected deduction amount exceeds gross payout amount.");
//       } else if (error.detail?.provider_response?.error?.description) {
//         // Handle Razorpay specific error
//         const razorpayError = error.detail.provider_response.error.description;
//         if (razorpayError.includes("Transfer amount exceeds amount available")) {
//           setErrorMessage(
//             `⚠️ Insufficient Razorpay balance.\n\n` +
//             `Net payout amount: ₹${netPayoutAmount.toFixed(2)}\n` +
//             `Available balance in Razorpay is lower than this amount.\n\n` +
//             `Please add funds to Razorpay account or contact finance team.`
//           );
//         } else {
//           setErrorMessage(razorpayError);
//         }
//       } else {
//         setErrorMessage(errorMsg);
//       }
//     } finally {
//       setProcessingBooking(null);
//     }
//   };

//   const handleProcessSelectedPayouts = async () => {
//     if (monthlySummary.bookings.length === 0) {
//       setErrorMessage("No ready bookings to process");
//       return;
//     }

//     setUpdating(true);
//     setErrorMessage(null);

//     let successCount = 0;
//     let failureCount = 0;
//     const results = [];

//     for (const booking of monthlySummary.bookings) {
//       try {
//         const result = await triggerSinglePayout(booking.booking_id, []);
//         results.push({
//           booking_id: booking.booking_id,
//           status: 'success',
//           amount: result.net_transfer_amount
//         });
//         successCount++;
//       } catch (error) {
//         console.error(`Error processing booking ${booking.booking_id}:`, error);
//         results.push({
//           booking_id: booking.booking_id,
//           status: 'failed',
//           error: error.detail?.message || error.message
//         });
//         failureCount++;
//       }
//     }

//     setBatchResults({
//       total_selected: monthlySummary.bookings.length,
//       success_count: successCount,
//       failure_count: failureCount,
//       results: results
//     });

//     setSuccessMessage(`Processed ${successCount} successful, ${failureCount} failed out of ${monthlySummary.bookings.length} bookings`);

//     // Refresh data
//     const bookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
//     setPayoutBookings(bookings.items || []);
//     setShowMonthlySummary(false);

//     setTimeout(() => setSuccessMessage(null), 5000);
//     setUpdating(false);
//   };

//   const handleReconcileRefund = async (bookingId) => {
//     setUpdating(true);
//     try {
//       const result = await reconcileRefund(bookingId);
//       setSuccessMessage(`Refund reconciled successfully! Outcome: ${result.outcome}`);

//       await fetchRefundQueue();

//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error reconciling refund:", error);
//       setErrorMessage("Failed to reconcile refund");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleUpdateSettings = async () => {
//     setUpdating(true);
//     try {
//       await updatePayoutSettings(parseFloat(commissionPercent));
//       const updated = await getPayoutSettings();
//       setSettings(updated);
//       setShowSettingsModal(false);
//       setSuccessMessage("✅ Commission settings updated!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error updating settings:", error);
//       setErrorMessage("Failed to update settings");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // Dashboard Tab
//   const renderDashboard = () => (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Ready for Payout</p>
//               <p className="text-2xl font-bold text-gray-900">{dashboard?.ready_booking_count || 0}</p>
//               <p className="text-sm text-green-600 mt-1">₹{parseFloat(dashboard?.ready_total_amount || 0).toFixed(2)}</p>
//             </div>
//             <BanknotesIcon className="w-12 h-12 text-green-500 opacity-50" />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Transferred</p>
//               <p className="text-2xl font-bold text-gray-900">{dashboard?.transferred_booking_count || 0}</p>
//               <p className="text-sm text-blue-600 mt-1">₹{parseFloat(dashboard?.transferred_total_amount || 0).toFixed(2)}</p>
//             </div>
//             <CheckCircleIcon className="w-12 h-12 text-blue-500 opacity-50" />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Withheld / Failed</p>
//               <p className="text-2xl font-bold text-gray-900">{(dashboard?.withheld_booking_count || 0) + (dashboard?.failed_booking_count || 0)}</p>
//               <p className="text-sm text-red-600 mt-1">₹{parseFloat((dashboard?.withheld_total_amount || 0) + (dashboard?.failed_total_amount || 0)).toFixed(2)}</p>
//             </div>
//             <ExclamationTriangleIcon className="w-12 h-12 text-red-500 opacity-50" />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-500">Refund Queue</p>
//               <p className="text-2xl font-bold text-gray-900">{dashboard?.refund_queue_count || 0}</p>
//               <p className="text-sm text-purple-600 mt-1">₹{parseFloat(dashboard?.refund_queue_total_amount || 0).toFixed(2)}</p>
//             </div>
//             <ArrowPathIcon className="w-12 h-12 text-purple-500 opacity-50" />
//           </div>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h3 className="font-semibold text-gray-900 mb-4">Alerts</h3>
//         <div className="space-y-2">
//           {(dashboard?.drivers_missing_linked_account_count > 0) && (
//             <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
//               <ExclamationTriangleIcon className="w-5 h-5" />
//               <span>{dashboard.drivers_missing_linked_account_count} drivers missing linked account</span>
//             </div>
//           )}
//           {(dashboard?.drivers_not_eligible_count > 0) && (
//             <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-3 rounded-lg">
//               <ExclamationTriangleIcon className="w-5 h-5" />
//               <span>{dashboard.drivers_not_eligible_count} drivers not payout eligible</span>
//             </div>
//           )}
//           {(dashboard?.refund_queue_count > 0) && (
//             <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-3 rounded-lg">
//               <ArrowPathIcon className="w-5 h-5" />
//               <span>{dashboard.refund_queue_count} bookings pending refund reconciliation</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   // Drivers Tab
//   const renderDrivers = () => (
//     <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//       <div className="p-4 bg-gray-50 border-b">
//         <h3 className="font-semibold text-gray-900">Drivers List</h3>
//         <p className="text-sm text-gray-500 mt-1">Manage driver payout profiles and eligibility</p>
//       </div>
//       <div className="divide-y">
//         {drivers.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">No drivers found</div>
//         ) : (
//           drivers.map((driver) => (
//             <div key={driver.user_id} className="p-4 hover:bg-gray-50 transition">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <p className="font-medium text-gray-900">
//                       {driver.profile?.full_name || driver.name || "Unknown Driver"}
//                     </p>
//                     {driver.payout_details?.is_payout_eligible && (
//                       <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Eligible</span>
//                     )}
//                   </div>
//                   <p className="text-sm text-gray-500">{driver.email}</p>
//                   {driver.vehicle && (
//                     <p className="text-xs text-gray-400">{driver.vehicle.registration_number || driver.vehicle.reg_no}</p>
//                   )}

//                   <div className="mt-2 flex flex-wrap gap-4 text-xs">
//                     <span className="text-yellow-600">Ready: {driver.aggregates?.ready_booking_count || 0}</span>
//                     <span className="text-green-600">Transferred: {driver.aggregates?.transferred_booking_count || 0}</span>
//                     <span className="text-red-600">Withheld: {driver.aggregates?.withheld_booking_count || 0}</span>
//                     <span className="text-purple-600">Refund Queue: {driver.aggregates?.refund_queue_count || 0}</span>
//                   </div>

//                   {driver.payout_details?.linked_account_status && (
//                     <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${getLinkedAccountStatusColor(driver.payout_details.linked_account_status)}`}>
//                       {driver.payout_details.linked_account_status}
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => {
//                     fetchDriverDetails(driver);
//                     setActiveTab("driverDetail");
//                   }}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Manage →
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );

//   // Monthly Summary Modal
//   const renderMonthlySummaryModal = () => {
//     if (!showMonthlySummary) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
//           <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-white">
//             <h3 className="text-xl font-bold text-gray-900">Monthly Payout Summary</h3>
//             <button onClick={() => setShowMonthlySummary(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//           </div>
//           <div className="p-6 overflow-auto flex-1">
//             <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="bg-blue-50 p-4 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Total Bookings</p>
//                 <p className="text-2xl font-bold text-blue-600">{monthlySummary.totalBookings}</p>
//               </div>
//               <div className="bg-green-50 p-4 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Gross Amount</p>
//                 <p className="text-2xl font-bold text-green-600">₹{monthlySummary.totalGrossAmount.toFixed(2)}</p>
//               </div>
//               <div className="bg-red-50 p-4 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Total Deductions</p>
//                 <p className="text-2xl font-bold text-red-600">-₹{monthlySummary.totalDeductions.toFixed(2)}</p>
//               </div>
//               <div className="bg-purple-50 p-4 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Net Payout</p>
//                 <p className="text-2xl font-bold text-purple-600">₹{monthlySummary.totalNetAmount.toFixed(2)}</p>
//               </div>
//             </div>

//             <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
//             <div className="space-y-3 max-h-96 overflow-auto">
//               {monthlySummary.bookings.map((booking) => (
//                 <div key={booking.booking_id} className="border rounded-lg p-4 hover:bg-gray-50">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <p className="font-mono text-sm text-gray-600">{booking.booking_id}</p>
//                       <p className="text-sm text-gray-500">Passenger: {booking.passenger_name || "N/A"}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm text-gray-600">Gross: ₹{parseFloat(booking.driver_payout_amount || 0).toFixed(2)}</p>
//                       <p className="text-sm text-red-600">Deductions: -₹{parseFloat(booking.applied_adjustment_amount || 0).toFixed(2)}</p>
//                       <p className="text-lg font-bold text-green-600">Net: ₹{parseFloat(booking.net_payout_amount || 0).toFixed(2)}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="p-4 border-t bg-gray-50 flex gap-3">
//             <button
//               onClick={handleProcessSelectedPayouts}
//               disabled={updating || monthlySummary.bookings.length === 0}
//               className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//             >
//               {updating ? "Processing..." : `Process ${monthlySummary.bookings.length} Bookings`}
//             </button>
//             <button
//               onClick={() => setShowMonthlySummary(false)}
//               className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Driver Detail Tab
//   const renderDriverDetail = () => {
//     if (!selectedDriver) return null;

//     const payoutDetails = driverDetails?.payout_details || {};
//     const isFullySetup = payoutDetails.razorpay_linked_account_id && 
//                          payoutDetails.linked_account_status === 'active' && 
//                          payoutDetails.is_payout_eligible;

//     return (
//       <div className="space-y-4">
//         {/* Driver Header */}
//         <div className="bg-white rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-start">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {selectedDriver.profile?.full_name || selectedDriver.name || "Driver"}
//               </h2>
//               <p className="text-gray-500">{selectedDriver.email}</p>
//               <div className="mt-2 flex gap-2 flex-wrap">
//                 <span className={`px-2 py-1 text-xs rounded-full ${payoutDetails.is_payout_eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                   {payoutDetails.is_payout_eligible ? 'Payout Eligible' : 'Payout Not Eligible'}
//                 </span>
//                 {payoutDetails.linked_account_status && (
//                   <span className={`px-2 py-1 text-xs rounded-full ${getLinkedAccountStatusColor(payoutDetails.linked_account_status)}`}>
//                     {payoutDetails.linked_account_status}
//                   </span>
//                 )}
//                 {isFullySetup && (
//                   <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
//                     Ready for Payout
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={refreshPayoutBookings}
//                 disabled={loading}
//                 className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 <ArrowPathIcon className="w-4 h-4 inline mr-1" />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => {
//                   setSelectedDriver(null);
//                   setDriverDetails(null);
//                   setActiveTab("drivers");
//                 }}
//                 className="px-3 py-1 text-gray-600 hover:text-gray-900"
//               >
//                 ← Back to Drivers
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Setup Status Card */}
//         <div className={`rounded-xl shadow-md p-4 ${isFullySetup ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
//           <div className="flex items-center gap-3">
//             {isFullySetup ? (
//               <CheckCircleIcon className="w-8 h-8 text-green-600" />
//             ) : (
//               <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
//             )}
//             <div>
//               <p className="font-semibold">
//                 {isFullySetup ? "Driver Fully Setup for Payouts" : "Driver Setup Incomplete"}
//               </p>
//               <p className="text-sm">
//                 {isFullySetup 
//                   ? "This driver can receive payouts. All requirements are met."
//                   : "Complete the steps below to enable payouts for this driver."}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Bank Details Section */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
//             <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
//             <button
//               onClick={() => setShowBankModal(true)}
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               {payoutDetails.bank_account_number ? 'Edit' : 'Add'}
//             </button>
//           </div>
//           <div className="p-4">
//             {payoutDetails.bank_account_number ? (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <div className="flex items-center gap-2 text-green-700 mb-2">
//                   <CheckCircleIcon className="w-5 h-5" />
//                   <span className="font-medium">Bank details saved</span>
//                 </div>
//                 <p className="text-sm text-green-600">
//                   Account Holder: {payoutDetails.account_holder_name}<br />
//                   Account: ****{payoutDetails.bank_account_number?.slice(-4)}<br />
//                   IFSC: {payoutDetails.ifsc_code}<br />
//                   Phone: {payoutDetails.phone_number}
//                 </p>
//               </div>
//             ) : (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
//                 <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
//                 <p className="text-yellow-700">No bank details added yet</p>
//                 <button
//                   onClick={() => setShowBankModal(true)}
//                   className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
//                 >
//                   Add Bank Details
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Razorpay Linked Account Section */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
//             <h3 className="font-semibold text-gray-900">Razorpay Linked Account</h3>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleCreateAndActivateLinkedAccount}
//                 disabled={!payoutDetails.bank_account_number || updating}
//                 className={`px-3 py-1 text-sm rounded ${payoutDetails.bank_account_number ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
//               >
//                 Create & Activate
//               </button>
//               {payoutDetails.razorpay_linked_account_id && (
//                 <>
//                   <button
//                     onClick={handleSyncLinkedAccount}
//                     disabled={updating}
//                     className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
//                   >
//                     <ArrowPathIcon className="w-4 h-4 inline mr-1" />
//                     Sync
//                   </button>
//                   <button
//                     onClick={handleViewProviderAccount}
//                     className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
//                   >
//                     <EyeIcon className="w-4 h-4 inline mr-1" />
//                     View
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//           <div className="p-4">
//             {payoutDetails.razorpay_linked_account_id ? (
//               <div className={`rounded-lg p-4 border ${getLinkedAccountStatusColor(payoutDetails.linked_account_status)}`}>
//                 <p className="text-sm font-mono break-all">
//                   ID: {payoutDetails.razorpay_linked_account_id}
//                 </p>
//                 <p className="text-sm mt-1">
//                   Status: {payoutDetails.linked_account_status}
//                 </p>
//                 {payoutDetails.linked_account_status !== 'active' && (
//                   <button
//                     onClick={() => updateLinkedAccountStatus(selectedDriver.user_id, payoutDetails.razorpay_linked_account_id, "active")}
//                     className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
//                   >
//                     Set as Active
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
//                 No linked account created. Click "Create & Activate" to set up.
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Payout Eligibility */}
//         {payoutDetails.razorpay_linked_account_id && payoutDetails.linked_account_status === 'active' && !payoutDetails.is_payout_eligible && (
//           <div className="bg-white rounded-xl shadow-md overflow-hidden">
//             <div className="p-4 border-b bg-gray-50">
//               <h3 className="font-semibold text-gray-900">Enable Payouts</h3>
//             </div>
//             <div className="p-4 text-center">
//               <button
//                 onClick={handleEnablePayout}
//                 disabled={updating}
//                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//               >
//                 {updating ? "Enabling..." : "Enable Payout Eligibility"}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Open Adjustments Section */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
//             <h3 className="font-semibold text-gray-900">Open Adjustments (Fines/Deductions)</h3>
//           </div>
//           <div className="divide-y">
//             {openAdjustments.length === 0 ? (
//               <div className="p-8 text-center text-gray-500">
//                 No open adjustments for this driver
//               </div>
//             ) : (
//               openAdjustments.map((adj) => (
//                 <div key={adj.id} className="p-4 hover:bg-gray-50">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className={`px-2 py-0.5 text-xs rounded-full ${adj.adjustment_type === 'fine' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
//                           {adj.adjustment_type}
//                         </span>
//                         <span className="text-sm font-medium text-gray-900">₹{parseFloat(adj.amount).toFixed(2)}</span>
//                         <span className="text-xs text-gray-500">Remaining: ₹{parseFloat(adj.remaining_amount).toFixed(2)}</span>
//                       </div>
//                       <p className="text-sm text-gray-600">{adj.reason_text}</p>
//                       {adj.admin_note && (
//                         <p className="text-xs text-gray-400 mt-1">Note: {adj.admin_note}</p>
//                       )}
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleIncludeExcludeAdjustment(adj.id, 'included')}
//                         className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
//                       >
//                         Include
//                       </button>
//                       <button
//                         onClick={() => handleIncludeExcludeAdjustment(adj.id, 'excluded')}
//                         className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
//                       >
//                         Exclude
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Payout Bookings Section */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
//             <h3 className="font-semibold text-gray-900">Driver's Payout Bookings</h3>
//             <div className="flex gap-2">
//               {isFullySetup && (
//                 <button
//                   onClick={() => setShowMonthlyPayoutModal(true)}
//                   className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//                 >
//                   <CalendarIcon className="w-4 h-4 inline mr-1" />
//                   Monthly Payout
//                 </button>
//               )}
//               <button
//                 onClick={refreshPayoutBookings}
//                 disabled={loading}
//                 className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 <ArrowPathIcon className="w-4 h-4 inline mr-1" />
//                 Refresh Bookings
//               </button>
//             </div>
//           </div>

//           {payoutBookings.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               No payout bookings found for this driver
//             </div>
//           ) : (
//             <div className="divide-y">
//               {payoutBookings.map((booking) => {
//                 const displayStatus = getDisplayStatus(booking);
//                 const netPayoutAmount = parseFloat(booking.net_payout_amount || 0);

//                 return (
//                   <div key={booking.booking_id} className="p-4 hover:bg-gray-50">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2 flex-wrap">
//                           <span className={`px-2 py-0.5 text-xs rounded-full ${displayStatus.color}`}>
//                             {displayStatus.text}
//                           </span>
//                           <span className="text-xs text-gray-500 font-mono">
//                             {booking.booking_id}
//                           </span>
//                           <button
//                             onClick={() => handleViewFullBookingDetails(booking.booking_id)}
//                             className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
//                           >
//                             <EyeIcon className="w-3 h-3" />
//                             View Details
//                           </button>
//                           {booking.trip_id && (
//                             <button
//                               onClick={() => handleViewTripPassengers(booking.trip_id)}
//                               className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
//                             >
//                               <UserGroupIcon className="w-3 h-3" />
//                               Trip Passengers
//                             </button>
//                           )}
//                           <button
//                             onClick={() => {
//                               setSelectedBookingForAdjustment(booking);
//                               setShowAdjustmentModal(true);
//                             }}
//                             className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
//                           >
//                             <PlusIcon className="w-3 h-3" />
//                             Add Adjustment
//                           </button>
//                           <button
//                             onClick={() => syncBookingStatus(booking.booking_id, booking.trip_id)}
//                             className="text-orange-600 hover:text-orange-800 text-xs flex items-center gap-1"
//                           >
//                             <ArrowPathIcon className="w-3 h-3" />
//                             Sync Status
//                           </button>
//                         </div>

//                         <p className="text-sm text-gray-600">
//                           Passenger: {booking.passenger_name || "N/A"}
//                         </p>

//                         <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
//                           <div>
//                             <p className="text-xs text-gray-400">Gross Payout</p>
//                             <p className="font-medium text-gray-900">₹{parseFloat(booking.driver_payout_amount || 0).toFixed(2)}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-400">Deductions & Fines</p>
//                             <p className="font-medium text-red-600">-₹{parseFloat(booking.applied_adjustment_amount || 0).toFixed(2)}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-400">Net Payout (Will Transfer)</p>
//                             <p className={`font-bold text-lg ${netPayoutAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                               ₹{netPayoutAmount.toFixed(2)}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-gray-400">Commission ({booking.commission_percent_snapshot || 0}%)</p>
//                             <p className="text-gray-600">-₹{parseFloat(booking.commission_amount || 0).toFixed(2)}</p>
//                           </div>
//                         </div>

//                         {/* Add warning if net amount is zero or negative */}
//                         {netPayoutAmount <= 0 && (
//                           <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
//                             ⚠️ Net payout is zero or negative. Cannot process payout.
//                           </div>
//                         )}
//                       </div>

//                       {booking.transfer_status === 'ready' && isFullySetup && netPayoutAmount > 0 && (
//                         <div className="ml-4">
//                           {openAdjustments.length > 0 && (
//                             <div className="mb-2 text-right">
//                               <details className="text-sm">
//                                 <summary className="cursor-pointer text-blue-600">Apply deductions</summary>
//                                 <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10 p-2">
//                                   {openAdjustments.map(adj => (
//                                     <label key={adj.id} className="flex items-center gap-2 p-1 text-sm">
//                                       <input
//                                         type="checkbox"
//                                         checked={!!selectedAdjustments[adj.id]}
//                                         onChange={() => handleToggleAdjustmentSelection(adj.id, adj)}
//                                         className="rounded"
//                                       />
//                                       <span>{adj.reason_text}</span>
//                                       <span className="ml-auto font-medium">₹{parseFloat(adj.remaining_amount).toFixed(2)}</span>
//                                     </label>
//                                   ))}
//                                 </div>
//                               </details>
//                             </div>
//                           )}

//                           <button
//                             onClick={() => handleProcessPayout(booking.booking_id)}
//                             disabled={processingBooking === booking.booking_id}
//                             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
//                           >
//                             {processingBooking === booking.booking_id ? (
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                             ) : (
//                               'Process Payout'
//                             )}
//                           </button>
//                         </div>
//                       )}

//                       {booking.transfer_status === 'withheld' && (
//                         <div className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
//                           Fully Absorbed
//                         </div>
//                       )}

//                       {booking.transfer_status === 'failed' && (
//                         <div className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
//                           Failed - Check Details
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Transfers Tab
//   const renderTransfers = () => (
//     <div className="space-y-4">
//       <div className="bg-white rounded-xl shadow-md p-4 flex gap-4">
//         <select
//           value={driverFilter}
//           onChange={(e) => setDriverFilter(e.target.value)}
//           className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Drivers</option>
//           {drivers.map(d => (
//             <option key={d.user_id} value={d.user_id}>{d.profile?.full_name || d.name}</option>
//           ))}
//         </select>

//         <select
//           value={transferStatusFilter}
//           onChange={(e) => setTransferStatusFilter(e.target.value)}
//           className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Status</option>
//           <option value="processed">Processed</option>
//           <option value="failed">Failed</option>
//           <option value="reversed">Reversed</option>
//         </select>

//         <button
//           onClick={fetchTransfers}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Apply Filters
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="p-4 bg-gray-50 border-b">
//           <h3 className="font-semibold text-gray-900">Transfer History</h3>
//         </div>
//         <div className="divide-y">
//           {transfers.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               No transfers found
//             </div>
//           ) : (
//             transfers.map((transfer) => (
//               <div key={transfer.transfer_id} className="p-4 hover:bg-gray-50">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className={`px-2 py-0.5 text-xs rounded-full ${getTransferStatusColor(transfer.status)}`}>
//                         {transfer.status}
//                       </span>
//                       <span className="text-xs text-gray-500 font-mono">
//                         {transfer.transfer_id}
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-600">
//                       Booking: {transfer.booking_id}
//                     </p>
//                     <p className="text-sm font-medium text-green-600">
//                       Amount: ₹{parseFloat(transfer.amount || 0).toFixed(2)}
//                     </p>
//                     {transfer.applied_adjustment_amount > 0 && (
//                       <p className="text-xs text-red-600">
//                         Deductions applied: ₹{parseFloat(transfer.applied_adjustment_amount).toFixed(2)}
//                       </p>
//                     )}
//                     {transfer.failure_reason && (
//                       <p className="text-xs text-red-500 mt-1">
//                         Failed: {transfer.failure_reason}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-400 mt-1">
//                       Processed: {transfer.processed_at ? new Date(transfer.processed_at).toLocaleString() : 'N/A'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={async () => {
//                       const detail = await getTransferDetail(transfer.transfer_id);
//                       console.log("Transfer detail:", detail);
//                     }}
//                     className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
//                   >
//                     <EyeIcon className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   // Refunds Tab
//   const renderRefunds = () => (
//     <div className="bg-white rounded-xl shadow-md overflow-hidden">
//       <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
//         <h3 className="font-semibold text-gray-900">Refund Queue</h3>
//         <button
//           onClick={fetchRefundQueue}
//           className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           <ArrowPathIcon className="w-4 h-4 inline mr-1" />
//           Refresh
//         </button>
//       </div>
//       <div className="divide-y">
//         {refundQueue.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             No pending refunds
//           </div>
//         ) : (
//           refundQueue.map((item) => (
//             <div key={item.booking_id} className="p-4 hover:bg-gray-50">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="font-medium text-gray-900">Booking: {item.booking_id}</p>
//                   <p className="text-sm text-gray-600">
//                     Driver: {item.driver_user_id}
//                   </p>
//                   <p className="text-sm font-medium">Fare: ₹{parseFloat(item.fare_amount || 0).toFixed(2)}</p>
//                   <p className="text-xs text-gray-400">
//                     Cancelled: {item.cancelled_at ? new Date(item.cancelled_at).toLocaleString() : 'N/A'}
//                   </p>
//                   {item.refund_retry_after && (
//                     <p className="text-xs text-yellow-600">
//                       Retry after: {new Date(item.refund_retry_after).toLocaleString()}
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => handleReconcileRefund(item.booking_id)}
//                   disabled={updating}
//                   className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
//                 >
//                   {updating ? "Processing..." : "Reconcile Refund"}
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );

//   // Full Booking Details Modal
//   const renderFullBookingModal = () => {
//     if (!showFullBookingModal || !fullBookingDetails) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
//           <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-white">
//             <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
//             <button onClick={() => setShowFullBookingModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//           </div>
//           <div className="p-6 overflow-auto flex-1 space-y-6">
//             <div className="bg-blue-50 p-4 rounded-lg">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Booking ID</p>
//                   <p className="font-mono text-sm">{fullBookingDetails.booking_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Trip ID</p>
//                   <p className="font-mono text-sm">{fullBookingDetails.trip_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Status</p>
//                   <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusColor(fullBookingDetails.booking_status)}`}>
//                     {fullBookingDetails.booking_status}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="border rounded-lg p-4">
//               <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                 <UserIcon className="w-5 h-5" />
//                 Passenger Information
//               </h4>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-500">Name</p>
//                   <p className="font-medium">{fullBookingDetails.passenger?.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Email</p>
//                   <p className="text-sm">{fullBookingDetails.passenger?.email}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="border rounded-lg p-4">
//               <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                 <MapPinIcon className="w-5 h-5" />
//                 Route Information
//               </h4>
//               <p className="font-medium">{fullBookingDetails.route?.name}</p>
//               <p className="text-sm text-gray-500">Code: {fullBookingDetails.route?.code}</p>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="border rounded-lg p-4">
//                 <h4 className="font-semibold text-gray-900 mb-3">Pickup Location</h4>
//                 <p className="font-medium">{fullBookingDetails.pickup_location?.booked_stop_name}</p>
//               </div>
//               <div className="border rounded-lg p-4">
//                 <h4 className="font-semibold text-gray-900 mb-3">Dropoff Location</h4>
//                 <p className="font-medium">{fullBookingDetails.dropoff_location?.booked_stop_name}</p>
//               </div>
//             </div>
//           </div>
//           <div className="p-4 border-t bg-gray-50">
//             <button
//               onClick={() => setShowFullBookingModal(false)}
//               className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Trip Passengers Modal
//   const renderTripPassengersModal = () => {
//     if (!showTripPassengersModal || !tripPassengers) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
//           <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-white">
//             <h3 className="text-xl font-bold text-gray-900">Trip Passengers</h3>
//             <button onClick={() => setShowTripPassengersModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//           </div>
//           <div className="p-6 overflow-auto flex-1">
//             <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//               <p className="text-sm text-gray-600">Trip ID</p>
//               <p className="font-mono text-sm">{tripPassengers.trip_id}</p>
//               <p className="text-sm text-gray-600 mt-2">Total Bookings: {tripPassengers.total_bookings}</p>
//             </div>

//             <div className="space-y-3">
//               <h4 className="font-semibold text-gray-900">Passengers List</h4>
//               {tripPassengers.passengers?.map((passenger, idx) => (
//                 <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-medium text-gray-900">{passenger.passenger_name}</p>
//                       <p className="text-xs text-gray-500 font-mono mt-1">Booking ID: {passenger.booking_id}</p>
//                     </div>
//                     <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusColor(passenger.status)}`}>
//                       {passenger.status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="p-4 border-t bg-gray-50">
//             <button
//               onClick={() => setShowTripPassengersModal(false)}
//               className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Batch Results Modal
//   const renderBatchResultsModal = () => {
//     if (!batchResults) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
//           <div className="flex justify-between items-center p-4 border-b bg-gray-50">
//             <h3 className="text-xl font-bold text-gray-900">Batch Payout Results</h3>
//             <button onClick={() => setBatchResults(null)} className="text-gray-400 hover:text-gray-600">✕</button>
//           </div>
//           <div className="p-4 overflow-auto flex-1">
//             <div className="mb-4 grid grid-cols-3 gap-4">
//               <div className="bg-blue-50 p-3 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Total Selected</p>
//                 <p className="text-2xl font-bold text-blue-600">{batchResults.total_selected}</p>
//               </div>
//               <div className="bg-green-50 p-3 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Successful</p>
//                 <p className="text-2xl font-bold text-green-600">{batchResults.success_count}</p>
//               </div>
//               <div className="bg-red-50 p-3 rounded-lg text-center">
//                 <p className="text-sm text-gray-600">Failed</p>
//                 <p className="text-2xl font-bold text-red-600">{batchResults.failure_count}</p>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <p className="font-medium">Details:</p>
//               {batchResults.results?.map((result, idx) => (
//                 <div key={idx} className={`p-2 rounded ${result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
//                   <p className="text-sm">
//                     <strong>{result.booking_id}</strong>: {result.status}
//                     {result.error && <span className="text-red-600"> - {result.error}</span>}
//                     {result.amount && <span className="text-green-600 ml-2">₹{parseFloat(result.amount).toFixed(2)}</span>}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="p-4 border-t bg-gray-50">
//             <button
//               onClick={() => setBatchResults(null)}
//               className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar />
//         <div className="p-6 overflow-auto">
//           {/* Success/Error Messages */}
//           {successMessage && (
//             <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//               <div className="flex items-start gap-3">
//                 <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
//                 <p className="text-green-700 whitespace-pre-line">{successMessage}</p>
//               </div>
//             </div>
//           )}

//           {errorMessage && (
//             <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-start gap-3">
//                 <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
//                 <div className="flex-1">
//                   <p className="text-red-800 font-medium">Error</p>
//                   <p className="text-red-700 text-sm whitespace-pre-line">{errorMessage}</p>
//                 </div>
//                 <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-800">✕</button>
//               </div>
//             </div>
//           )}

//           {/* Header */}
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
//                 <BanknotesIcon className="w-8 h-8 text-green-600" />
//                 Payout Management
//               </h1>
//               <p className="text-gray-500 mt-1">Manage driver payouts, adjustments, and transfers</p>
//             </div>
//             <button
//               onClick={() => setShowSettingsModal(true)}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
//             >
//               <Cog6ToothIcon className="w-5 h-5" />
//               Commission: {settings?.commission_percent || 0}%
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className="flex gap-2 mb-6 border-b">
//             <button
//               onClick={() => setActiveTab("dashboard")}
//               className={`px-4 py-2 font-medium transition ${activeTab === "dashboard" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
//             >
//               Dashboard
//             </button>
//             <button
//               onClick={() => {
//                 setActiveTab("drivers");
//                 fetchInitialData();
//               }}
//               className={`px-4 py-2 font-medium transition ${activeTab === "drivers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
//             >
//               Drivers
//             </button>
//             <button
//               onClick={() => {
//                 setActiveTab("transfers");
//                 fetchTransfers();
//               }}
//               className={`px-4 py-2 font-medium transition ${activeTab === "transfers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
//             >
//               Transfers
//             </button>
//             <button
//               onClick={() => {
//                 setActiveTab("refunds");
//                 fetchRefundQueue();
//               }}
//               className={`px-4 py-2 font-medium transition ${activeTab === "refunds" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
//             >
//               Refunds
//             </button>
//           </div>

//           {/* Tab Content */}
//           {loading && activeTab !== "driverDetail" ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//           ) : (
//             <>
//               {activeTab === "dashboard" && renderDashboard()}
//               {activeTab === "drivers" && renderDrivers()}
//               {activeTab === "driverDetail" && renderDriverDetail()}
//               {activeTab === "transfers" && renderTransfers()}
//               {activeTab === "refunds" && renderRefunds()}
//             </>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       {showBankModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Add Bank Details</h3>
//               <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
//                 <input
//                   type="text"
//                   value={bankDetails.account_holder_name}
//                   onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
//                 <input
//                   type="text"
//                   value={bankDetails.bank_account_number}
//                   onChange={(e) => setBankDetails({ ...bankDetails, bank_account_number: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
//                 <input
//                   type="text"
//                   value={bankDetails.ifsc_code}
//                   onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
//                 <input
//                   type="tel"
//                   value={bankDetails.phone_number}
//                   onChange={(e) => setBankDetails({ ...bankDetails, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex gap-3 pt-4">
//                 <button onClick={handleSaveBankDetails} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                   {updating ? "Saving..." : "Save Details"}
//                 </button>
//                 <button onClick={() => setShowBankModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Settings Modal */}
//       {showSettingsModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Commission Settings</h3>
//               <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Commission Percentage (%)</label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 max="100"
//                 value={commissionPercent}
//                 onChange={(e) => setCommissionPercent(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div className="flex gap-3 pt-4">
//               <button onClick={handleUpdateSettings} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                 {updating ? "Saving..." : "Save Changes"}
//               </button>
//               <button onClick={() => setShowSettingsModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Provider Account Modal */}
//       {showProviderModal && providerAccount && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
//             <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-white">
//               <h3 className="text-xl font-bold text-gray-900">Razorpay Account Details</h3>
//               <button onClick={() => setShowProviderModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="p-6 overflow-auto flex-1">
//               <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded border">
//                 {JSON.stringify(providerAccount.provider_account, null, 2)}
//               </pre>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Adjustment Modal */}
//       {showAdjustmentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">
//                 Create Adjustment for Booking
//                 {selectedBookingForAdjustment && (
//                   <span className="text-sm font-mono text-gray-500 block mt-1">
//                     {selectedBookingForAdjustment.booking_id}
//                   </span>
//                 )}
//               </h3>
//               <button onClick={() => {
//                 setShowAdjustmentModal(false);
//                 setSelectedBookingForAdjustment(null);
//               }} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
//                 <select
//                   value={adjustmentForm.adjustment_type}
//                   onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustment_type: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                 >
//                   <option value="fine">Fine</option>
//                   <option value="deduction">Deduction</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   value={adjustmentForm.amount}
//                   onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Reason Code</label>
//                 <input
//                   type="text"
//                   value={adjustmentForm.reason_code}
//                   onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason_code: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                   placeholder="e.g., late_start, damage, etc."
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Reason Text *</label>
//                 <textarea
//                   value={adjustmentForm.reason_text}
//                   onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason_text: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                   rows="2"
//                   placeholder="Detailed reason for this adjustment"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
//                 <textarea
//                   value={adjustmentForm.admin_note}
//                   onChange={(e) => setAdjustmentForm({ ...adjustmentForm, admin_note: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                   rows="2"
//                   placeholder="Internal notes (optional)"
//                 />
//               </div>
//               <div className="flex gap-3 pt-4">
//                 <button onClick={handleCreateAdjustment} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                   {updating ? "Creating..." : "Create Adjustment"}
//                 </button>
//                 <button onClick={() => {
//                   setShowAdjustmentModal(false);
//                   setSelectedBookingForAdjustment(null);
//                 }} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Monthly Payout Modal */}
//       {showMonthlyPayoutModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Monthly Payout</h3>
//               <button onClick={() => setShowMonthlyPayoutModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
//                 <select
//                   value={monthlyPayoutConfig.month}
//                   onChange={(e) => setMonthlyPayoutConfig({ ...monthlyPayoutConfig, month: parseInt(e.target.value) })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                 >
//                   {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
//                     <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
//                 <input
//                   type="number"
//                   value={monthlyPayoutConfig.year}
//                   onChange={(e) => setMonthlyPayoutConfig({ ...monthlyPayoutConfig, year: parseInt(e.target.value) })}
//                   className="w-full px-3 py-2 border rounded-lg"
//                 />
//               </div>
//               <p className="text-sm text-gray-500">
//                 This will show a summary of all eligible completed bookings for {selectedDriver?.profile?.full_name || selectedDriver?.name} in {monthlyPayoutConfig.month}/{monthlyPayoutConfig.year}
//               </p>
//               <div className="flex gap-3 pt-4">
//                 <button onClick={calculateMonthlySummary} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                   {loading ? "Loading..." : "Show Summary"}
//                 </button>
//                 <button onClick={() => setShowMonthlyPayoutModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Payout Modal - Simplified since bulk trigger is not reliable */}
//       {showBulkPayoutModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Bulk Payout</h3>
//               <button onClick={() => setShowBulkPayoutModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="space-y-4">
//               <p>Selected {bulkPayoutBookings.length} bookings for payout</p>
//               <p className="text-sm text-gray-500">This will process each booking individually</p>
//               <div className="flex gap-3 pt-4">
//                 <button onClick={async () => {
//                   // Process each booking individually
//                   setUpdating(true);
//                   let successCount = 0;
//                   for (const bookingId of bulkPayoutBookings) {
//                     try {
//                       await triggerSinglePayout(bookingId, []);
//                       successCount++;
//                     } catch (error) {
//                       console.error(`Failed to process ${bookingId}:`, error);
//                     }
//                   }
//                   setSuccessMessage(`Processed ${successCount} out of ${bulkPayoutBookings.length} bookings`);
//                   setShowBulkPayoutModal(false);
//                   setUpdating(false);

//                   // Refresh data
//                   const bookings = await getPayoutBookings({ driver_user_id: selectedDriver?.user_id });
//                   setPayoutBookings(bookings.items || []);
//                 }} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                   {updating ? "Processing..." : "Process Bulk Payout"}
//                 </button>
//                 <button onClick={() => setShowBulkPayoutModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Booking Detail Modal */}
//       {showBookingDetailModal && bookingDetail && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-xl font-bold text-gray-900">Booking Payout Details</h3>
//               <button onClick={() => setShowBookingDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="p-6 overflow-auto flex-1">
//               <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded border">
//                 {JSON.stringify(bookingDetail, null, 2)}
//               </pre>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Full Booking Details Modal */}
//       {renderFullBookingModal()}

//       {/* Trip Passengers Modal */}
//       {renderTripPassengersModal()}

//       {/* Monthly Summary Modal */}
//       {renderMonthlySummaryModal()}

//       {/* Batch Results Modal */}
//       {batchResults && renderBatchResultsModal()}
//     </div>
//   );
// };

// export default PayoutService;

import React, { useState, useEffect } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import {
  Cog6ToothIcon,
  UserGroupIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  CalculatorIcon,
  CurrencyRupeeIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = "https://be.shuttleapp.transev.site/admin/payouts";
const ADMIN_API_BASE_URL = "https://be.shuttleapp.transev.site/admin";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ============= API CALLS =============

// Payout Settings
const getPayoutSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch settings");
  return response.json();
};

const updatePayoutSettings = async (commission_percent) => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ commission_percent }),
  });
  if (!response.ok) throw new Error("Failed to update settings");
  return response.json();
};

// Driver Management
const getDrivers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/drivers?${params}` : `${API_BASE_URL}/drivers`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch drivers");
  const data = await response.json();
  console.log("Drivers API response:", data);
  return data;
};

const getDriverDetails = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch driver details");
  return response.json();
};

const updateDriverPayoutDetails = async (driverUserId, details) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/details`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(details),
  });
  if (!response.ok) throw new Error("Failed to update driver details");
  return response.json();
};

const updateDriverEligibility = async (driverUserId, isPayoutEligible) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/eligibility`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_payout_eligible: isPayoutEligible }),
  });
  if (!response.ok) throw new Error("Failed to update eligibility");
  return response.json();
};

const updateLinkedAccountStatus = async (driverUserId, razorpay_linked_account_id, linked_account_status) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/linked-account`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ razorpay_linked_account_id, linked_account_status }),
  });
  if (!response.ok) throw new Error("Failed to update linked account status");
  return response.json();
};

const createLinkedAccount = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/create-linked-account`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

const syncLinkedAccount = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/sync-linked-account`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to sync linked account");
  return response.json();
};

const getProviderLinkedAccount = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/linked-account/provider`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch provider account");
  return response.json();
};

// ============= NEW API CALLS (ADDED) =============

// Get booking with full adjustments context
const getBookingWithAdjustments = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch booking with adjustments");
  return response.json();
};

// Get booking-origin adjustments
const getBookingOriginAdjustments = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/adjustments`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch booking adjustments");
  return response.json();
};

// Trigger monthly payout for driver
const triggerMonthlyPayout = async (driverUserId, month, year, bookingItems = []) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/trigger-monthly`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      month,
      year,
      linked_account_id: null,
      booking_items: bookingItems,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

// Bulk trigger payouts
const triggerBulkPayout = async (options) => {
  const response = await fetch(`${API_BASE_URL}/bulk-trigger`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(options),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

// Manual linked account override
const manualUpdateLinkedAccount = async (driverUserId, linkedAccountId, status) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/linked-account`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      razorpay_linked_account_id: linkedAccountId,
      linked_account_status: status
    }),
  });
  if (!response.ok) throw new Error("Failed to update linked account");
  return response.json();
};

// ============= END NEW API CALLS =============

// Payout Bookings
const getPayoutBookings = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/bookings?${params}` : `${API_BASE_URL}/bookings`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    cache: 'no-cache'
  });
  if (!response.ok) throw new Error("Failed to fetch bookings");
  const data = await response.json();
  console.log("Payout bookings response:", data);
  return data;
};

const getBookingDetail = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch booking detail");
  return response.json();
};

// Get booking details from main booking API
const getBookingDetailsByBookingId = async (bookingId) => {
  const response = await fetch(`${ADMIN_API_BASE_URL}/booking/${bookingId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch booking details");
  return response.json();
};

// Get trip passengers by trip ID
const getTripPassengers = async (tripId) => {
  const response = await fetch(`${ADMIN_API_BASE_URL}/${tripId}/passengers`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch trip passengers");
  return response.json();
};

// Check if booking exists in payout system
const checkBookingInPayoutSystem = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: getAuthHeaders()
    });
    if (response.status === 404) {
      return { exists: false };
    }
    if (!response.ok) throw new Error("Failed to check booking");
    const data = await response.json();
    return { exists: true, data };
  } catch (error) {
    return { exists: false, error: error.message };
  }
};

// Create adjustment for a specific booking
const createAdjustment = async (bookingId, adjustmentData) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/adjustments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(adjustmentData),
  });

  if (response.status === 404) {
    throw new Error("BOOKING_NOT_IN_PAYOUT_SYSTEM");
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create adjustment");
  }

  return response.json();
};

const updateAdjustmentDecision = async (adjustmentId, decision_status, admin_note) => {
  const response = await fetch(`${API_BASE_URL}/adjustments/${adjustmentId}/decision`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ decision_status, admin_note }),
  });
  if (!response.ok) throw new Error("Failed to update adjustment decision");
  return response.json();
};

const getOpenAdjustmentsForDriver = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/open-adjustments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch open adjustments");
  return response.json();
};

// Payout Triggers
const triggerSinglePayout = async (bookingId, adjustments_to_apply = []) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/trigger`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      require_completed: true,
      adjustments_to_apply,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

// Transfers
const getTransfers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/transfers?${params}` : `${API_BASE_URL}/transfers`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch transfers");
  return response.json();
};

const getTransferDetail = async (transferId) => {
  const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch transfer detail");
  return response.json();
};

// Refunds
const getRefundQueue = async () => {
  const response = await fetch(`${API_BASE_URL}/refunds`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch refund queue");
  return response.json();
};

const reconcileRefund = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/refunds/${bookingId}/reconcile`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to reconcile refund");
  return response.json();
};

// Dashboard
const getDashboard = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch dashboard");
  return response.json();
};

// ============= HELPER FUNCTIONS =============

// Helper function to get display status with proper mapping
const getDisplayStatus = (booking) => {
  switch (booking.transfer_status) {
    case 'ready':
      return { text: 'Ready for Payout', color: 'bg-yellow-100 text-yellow-800' };
    case 'transferred':
      return { text: 'Transferred', color: 'bg-blue-100 text-blue-800' };
    case 'processed':
      return { text: 'Completed', color: 'bg-green-100 text-green-800' };
    case 'withheld':
      return { text: 'Withheld', color: 'bg-red-100 text-red-800' };
    case 'failed':
      return { text: 'Failed', color: 'bg-red-100 text-red-800' };
    default:
      return { text: booking.transfer_status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }
};

const getTransferStatusColor = (status) => {
  switch (status) {
    case 'ready': return 'bg-yellow-100 text-yellow-800';
    case 'transferred': return 'bg-green-100 text-green-800';
    case 'processed': return 'bg-green-100 text-green-800';
    case 'withheld': return 'bg-red-100 text-red-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'reversed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getLinkedAccountStatusColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-50';
    case 'blocked': return 'text-red-600 bg-red-50';
    case 'deleted': return 'text-gray-600 bg-gray-50';
    default: return 'text-yellow-600 bg-yellow-50';
  }
};

const getBookingStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// ============= MAIN COMPONENT =============

const PayoutService = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // UI State
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPayoutConfirmation, setShowPayoutConfirmation] = useState(false);
  const [pendingPayoutBooking, setPendingPayoutBooking] = useState(null);

  // Data State
  const [dashboard, setDashboard] = useState(null);
  const [settings, setSettings] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [payoutBookings, setPayoutBookings] = useState([]);
  const [selectedBookingForAdjustment, setSelectedBookingForAdjustment] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [openAdjustments, setOpenAdjustments] = useState([]);
  const [selectedAdjustments, setSelectedAdjustments] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [refundQueue, setRefundQueue] = useState([]);

  // Monthly Summary State
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState({
    totalBookings: 0,
    totalGrossAmount: 0,
    totalDeductions: 0,
    totalNetAmount: 0,
    bookings: []
  });

  // Enhanced Booking Details State
  const [showFullBookingModal, setShowFullBookingModal] = useState(false);
  const [fullBookingDetails, setFullBookingDetails] = useState(null);
  const [tripPassengers, setTripPassengers] = useState(null);
  const [showTripPassengersModal, setShowTripPassengersModal] = useState(false);

  // NEW: Additional State for missing APIs
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [bookingAdjustments, setBookingAdjustments] = useState([]);
  const [showBookingAdjustmentsModal, setShowBookingAdjustmentsModal] = useState(false);
  const [monthlyBatchResults, setMonthlyBatchResults] = useState(null);
  const [showMonthlyBatchModal, setShowMonthlyBatchModal] = useState(false);
  const [bulkBatchResults, setBulkBatchResults] = useState(null);
  const [showBulkBatchModal, setShowBulkBatchModal] = useState(false);

  // Modal State
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);
  const [showMonthlyPayoutModal, setShowMonthlyPayoutModal] = useState(false);
  const [showBulkPayoutModal, setShowBulkPayoutModal] = useState(false);
  const [providerAccount, setProviderAccount] = useState(null);

  // Form State
  const [commissionPercent, setCommissionPercent] = useState("");
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: "",
    bank_account_number: "",
    ifsc_code: "",
    phone_number: "",
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustment_type: "fine",
    amount: "",
    reason_code: "",
    reason_text: "",
    admin_note: "",
  });
  const [monthlyPayoutConfig, setMonthlyPayoutConfig] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [bulkPayoutBookings, setBulkPayoutBookings] = useState([]);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [batchResults, setBatchResults] = useState(null);

  // Filters
  const [driverFilter, setDriverFilter] = useState("");
  const [transferStatusFilter, setTransferStatusFilter] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [dashboardData, settingsData, driversData] = await Promise.all([
        getDashboard(),
        getPayoutSettings(),
        getDrivers(),
      ]);
      setDashboard(dashboardData);
      setSettings(settingsData);
      setCommissionPercent(settingsData.commission_percent?.toString() || "0");

      let driversList = [];
      if (driversData.items && Array.isArray(driversData.items)) {
        driversList = driversData.items;
      } else if (Array.isArray(driversData)) {
        driversList = driversData;
      } else if (driversData.drivers && Array.isArray(driversData.drivers)) {
        driversList = driversData.drivers;
      }
      setDrivers(driversList);
      console.log("Loaded drivers:", driversList);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to load initial data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverDetails = async (driver) => {
    setSelectedDriver(driver);
    setLoading(true);
    setErrorMessage(null);
    try {
      const details = await getDriverDetails(driver.user_id);
      console.log("Driver details:", details);
      setDriverDetails(details);

      const payoutDetails = details.payout_details || {};
      setBankDetails({
        account_holder_name: payoutDetails.account_holder_name || "",
        bank_account_number: payoutDetails.bank_account_number || "",
        ifsc_code: payoutDetails.ifsc_code || "",
        phone_number: payoutDetails.phone_number || "",
      });

      const adjustments = await getOpenAdjustmentsForDriver(driver.user_id);
      setOpenAdjustments(adjustments.items || []);

      const bookings = await getPayoutBookings({ driver_user_id: driver.user_id });
      console.log("Fetched payout bookings:", bookings);
      setPayoutBookings(bookings.items || []);
    } catch (error) {
      console.error("Error fetching driver details:", error);
      setErrorMessage("Failed to load driver details");
    } finally {
      setLoading(false);
    }
  };

  // Sync booking status with main system
  const syncBookingStatus = async (bookingId, tripId) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const bookingDetails = await getBookingDetailsByBookingId(bookingId);
      console.log("Latest booking status from main system:", bookingDetails);

      if (tripId) {
        const passengers = await getTripPassengers(tripId);
        console.log("Trip passengers status:", passengers);

        const bookingInTrip = passengers.passengers?.find(p => p.booking_id === bookingId);
        if (bookingInTrip && bookingInTrip.status === 'completed') {
          setSuccessMessage(`✅ Booking ${bookingId.substring(0, 8)}... is COMPLETED in the main system! The payout system will update shortly.`);

          if (selectedDriver) {
            const refreshedBookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
            setPayoutBookings(refreshedBookings.items || []);
            console.log("Refreshed bookings after sync:", refreshedBookings);
          }
        } else {
          setErrorMessage(`Booking status in main system: ${bookingInTrip?.status || 'not found'}`);
        }
      }

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error syncing booking status:", error);
      setErrorMessage("Failed to sync booking status");
    } finally {
      setLoading(false);
    }
  };

  // Force refresh payout bookings
  const refreshPayoutBookings = async () => {
    if (!selectedDriver) return;

    setLoading(true);
    try {
      const refreshedBookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
      setPayoutBookings(refreshedBookings.items || []);
      setSuccessMessage("✅ Bookings refreshed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error refreshing bookings:", error);
      setErrorMessage("Failed to refresh bookings");
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly summary with proper amounts
  const calculateMonthlySummary = async () => {
    if (!selectedDriver) return;

    setLoading(true);
    try {
      const response = await getPayoutBookings({
        driver_user_id: selectedDriver.user_id,
        month: monthlyPayoutConfig.month,
        year: monthlyPayoutConfig.year
      });

      const bookings = response.items || [];
      console.log("Monthly bookings:", bookings);

      const eligibleBookings = bookings.filter(b => b.transfer_status === 'ready');

      const summary = {
        totalBookings: eligibleBookings.length,
        totalGrossAmount: 0,
        totalDeductions: 0,
        totalNetAmount: 0,
        bookings: eligibleBookings
      };

      eligibleBookings.forEach(booking => {
        const gross = parseFloat(booking.driver_payout_amount) || 0;
        const deductions = parseFloat(booking.applied_adjustment_amount) || 0;
        summary.totalGrossAmount += gross;
        summary.totalDeductions += deductions;
        summary.totalNetAmount += (gross - deductions);
      });

      console.log("Monthly summary:", summary);
      setMonthlySummary(summary);
      setShowMonthlySummary(true);
    } catch (error) {
      console.error("Error calculating monthly summary:", error);
      setErrorMessage("Failed to calculate monthly summary");
    } finally {
      setLoading(false);
    }
  };

  // ============= NEW FUNCTIONS FOR MISSING APIS =============

  // Fetch booking with full adjustments context
  const fetchBookingWithAdjustments = async (bookingId) => {
    setLoading(true);
    try {
      const data = await getBookingWithAdjustments(bookingId);
      setSelectedBookingDetail(data);
      setBookingAdjustments(data.originated_adjustments || []);
      setShowBookingAdjustmentsModal(true);
    } catch (error) {
      console.error("Error fetching booking adjustments:", error);
      setErrorMessage("Failed to load booking adjustments");
    } finally {
      setLoading(false);
    }
  };

  // Handle monthly payout trigger
  const handleMonthlyPayout = async () => {
    if (!selectedDriver) {
      setErrorMessage("Please select a driver first");
      return;
    }

    setLoading(true);
    try {
      const result = await triggerMonthlyPayout(
        selectedDriver.user_id,
        monthlyPayoutConfig.month,
        monthlyPayoutConfig.year,
        []
      );

      setMonthlyBatchResults(result);
      setShowMonthlyBatchModal(true);
      setSuccessMessage(`Monthly payout completed: ${result.success_count} successful, ${result.failure_count} failed`);

      await refreshPayoutBookings();
    } catch (error) {
      console.error("Error triggering monthly payout:", error);
      setErrorMessage(error.detail?.message || "Failed to trigger monthly payout");
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk payout trigger
  const handleBulkPayout = async () => {
    setLoading(true);
    try {
      const result = await triggerBulkPayout({
        booking_ids: bulkPayoutBookings,
        driver_user_id: selectedDriver?.user_id || null,
        month: monthlyPayoutConfig.month,
        year: monthlyPayoutConfig.year,
        linked_account_id: null,
        require_completed: true,
        only_ready: false,
        limit: 100,
        booking_items: [],
      });

      setBulkBatchResults(result);
      setShowBulkBatchModal(true);
      setSuccessMessage(`Bulk payout completed: ${result.success_count} successful, ${result.failure_count} failed`);

      await refreshPayoutBookings();
    } catch (error) {
      console.error("Error triggering bulk payout:", error);
      setErrorMessage(error.detail?.message || "Failed to trigger bulk payout");
    } finally {
      setLoading(false);
    }
  };

  // Check driver trigger readiness
  const isDriverTriggerReady = (driver) => {
    const payoutDetails = driver?.payout_details || {};
    return !!(payoutDetails.razorpay_linked_account_id &&
      payoutDetails.linked_account_status === 'active' &&
      payoutDetails.route_product_status === 'activated' &&
      payoutDetails.is_payout_eligible);
  };

  // ============= END NEW FUNCTIONS =============

  const fetchBookingDetail = async (bookingId) => {
    setLoading(true);
    try {
      const detail = await getBookingDetail(bookingId);
      setBookingDetail(detail);
      setShowBookingDetailModal(true);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      setErrorMessage("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullBookingDetails = async (bookingId) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const enhancedData = await getBookingDetailsByBookingId(bookingId);
      setFullBookingDetails(enhancedData);
      setShowFullBookingModal(true);

      if (enhancedData.trip_id) {
        const passengers = await getTripPassengers(enhancedData.trip_id);
        setTripPassengers(passengers);
      } else {
        setTripPassengers(null);
      }
    } catch (error) {
      console.error("Error fetching enhanced booking details:", error);
      setErrorMessage("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTripPassengers = async (tripId) => {
    setLoading(true);
    try {
      const passengers = await getTripPassengers(tripId);
      setTripPassengers(passengers);
      setShowTripPassengersModal(true);

      if (selectedDriver) {
        const refreshedBookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
        setPayoutBookings(refreshedBookings.items || []);
        console.log("Refreshed bookings after viewing trip:", refreshedBookings);
      }
    } catch (error) {
      console.error("Error fetching trip passengers:", error);
      setErrorMessage("Failed to fetch trip passengers");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (driverFilter) filters.driver_user_id = driverFilter;
      if (transferStatusFilter) filters.status = transferStatusFilter;
      const data = await getTransfers(filters);
      setTransfers(data.items || []);
    } catch (error) {
      console.error("Error fetching transfers:", error);
      setErrorMessage("Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundQueue = async () => {
    setLoading(true);
    try {
      const data = await getRefundQueue();
      setRefundQueue(data.items || []);
    } catch (error) {
      console.error("Error fetching refund queue:", error);
      setErrorMessage("Failed to fetch refund queue");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    if (!bankDetails.account_holder_name.trim()) {
      setErrorMessage("Account holder name is required");
      return;
    }
    if (!bankDetails.bank_account_number.trim()) {
      setErrorMessage("Bank account number is required");
      return;
    }
    if (!bankDetails.ifsc_code.trim()) {
      setErrorMessage("IFSC code is required");
      return;
    }
    if (!bankDetails.phone_number.trim() || bankDetails.phone_number.length !== 10) {
      setErrorMessage("Valid 10-digit phone number is required");
      return;
    }

    setUpdating(true);
    setErrorMessage(null);
    try {
      await updateDriverPayoutDetails(selectedDriver.user_id, bankDetails);
      const updated = await getDriverDetails(selectedDriver.user_id);
      setDriverDetails(updated);
      setShowBankModal(false);
      setSuccessMessage("✅ Bank details saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving bank details:", error);
      setErrorMessage("Failed to save bank details. Please check all fields.");
    } finally {
      setUpdating(false);
    }
  };

  // UPDATED: handleCreateAndActivateLinkedAccount function
  const handleCreateAndActivateLinkedAccount = async () => {
    setUpdating(true);
    setErrorMessage(null);
    try {
      const createResult = await createLinkedAccount(selectedDriver.user_id);
      console.log("Linked account creation result:", createResult);

      const linkedAccountId = createResult.driver?.payout_details?.razorpay_linked_account_id;
      const stakeholderId = createResult.driver?.payout_details?.razorpay_stakeholder_id;
      const routeStatus = createResult.driver?.payout_details?.route_product_status;

      if (linkedAccountId) {
        await updateLinkedAccountStatus(selectedDriver.user_id, linkedAccountId, "active");

        if (stakeholderId) {
          setSuccessMessage(`✅ Linked account created! Stakeholder ID: ${stakeholderId.substring(0, 8)}...`);
        } else {
          setSuccessMessage("⚠️ Linked account created but stakeholder missing. Running sync to fix...");
          await syncLinkedAccount(selectedDriver.user_id);
        }

        if (routeStatus === 'activated') {
          await updateDriverEligibility(selectedDriver.user_id, true);
          setSuccessMessage(prev => prev + ` Route product activated! Driver is now payout eligible.`);
        } else if (routeStatus === 'requested') {
          setSuccessMessage(prev => prev + ` Route product requested. Please wait 2-3 minutes and click Sync.`);
        } else {
          setSuccessMessage(prev => prev + ` Route product status: ${routeStatus || 'pending'}. Please run Sync after a few minutes.`);
        }
      } else {
        setSuccessMessage("✅ Linked account created successfully!");
      }

      const updated = await getDriverDetails(selectedDriver.user_id);
      setDriverDetails(updated);

      setTimeout(() => setSuccessMessage(null), 8000);
    } catch (error) {
      console.error("Error in linked account flow:", error);
      if (error.detail?.error === "driver_payout_details_required") {
        setErrorMessage("❌ Please save bank details first before creating linked account.");
      } else if (error.detail?.error === "razorpay_route_request_failed") {
        setErrorMessage("❌ Razorpay onboarding failed. Please verify bank details are correct.");
      } else if (error.detail?.error === "stakeholder_creation_failed") {
        setErrorMessage("❌ Stakeholder creation failed. Please ensure driver has completed KYC verification.");
      } else {
        setErrorMessage(error.detail?.message || "Failed to create linked account.");
      }
    } finally {
      setUpdating(false);
    }
  };

  // UPDATED: handleSyncLinkedAccount function (single version, no duplicate)
  const handleSyncLinkedAccount = async () => {
    setUpdating(true);
    setErrorMessage(null);
    try {
      const syncResult = await syncLinkedAccount(selectedDriver.user_id);
      console.log("Sync result:", syncResult);

      const updated = await getDriverDetails(selectedDriver.user_id);
      setDriverDetails(updated);

      const payoutDetails = updated.payout_details || {};
      const stakeholderId = payoutDetails.razorpay_stakeholder_id;
      const routeStatus = payoutDetails.route_product_status;
      const linkedStatus = payoutDetails.linked_account_status;

      let statusMessage = "";

      if (linkedStatus === 'active') {
        statusMessage += "✅ Linked account: ACTIVE\n";
      } else {
        statusMessage += `⚠️ Linked account status: ${linkedStatus}\n`;
      }

      if (stakeholderId) {
        statusMessage += `✅ Stakeholder: ${stakeholderId.substring(0, 8)}...\n`;
      } else {
        statusMessage += "❌ Stakeholder: MISSING - Please run sync again\n";
      }

      if (routeStatus === 'activated') {
        statusMessage += "✅ Route Product: ACTIVATED\n";
        if (!payoutDetails.is_payout_eligible) {
          await updateDriverEligibility(selectedDriver.user_id, true);
          statusMessage += "✅ Payout eligibility: ENABLED\n";
        }
      } else if (routeStatus === 'requested') {
        statusMessage += "⏳ Route Product: REQUESTED (wait 2-3 minutes, then sync again)\n";
      } else {
        statusMessage += `⚠️ Route Product status: ${routeStatus || 'NOT STARTED'}\n`;
      }

      setSuccessMessage(statusMessage);

      setTimeout(async () => {
        const refreshed = await getDriverDetails(selectedDriver.user_id);
        setDriverDetails(refreshed);
      }, 5000);

      setTimeout(() => setSuccessMessage(null), 10000);
    } catch (error) {
      console.error("Error syncing linked account:", error);
      if (error.detail?.error === "stakeholder_required") {
        setErrorMessage("❌ Stakeholder/KYC documents required. Please complete driver KYC verification first.");
      } else {
        setErrorMessage(error.detail?.message || "Failed to sync linked account.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleViewProviderAccount = async () => {
    setLoading(true);
    try {
      const data = await getProviderLinkedAccount(selectedDriver.user_id);
      setProviderAccount(data);
      setShowProviderModal(true);
    } catch (error) {
      console.error("Error fetching provider account:", error);
      setErrorMessage("Failed to fetch provider account details.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePayout = async () => {
    setUpdating(true);
    setErrorMessage(null);
    try {
      await updateDriverEligibility(selectedDriver.user_id, true);
      const updated = await getDriverDetails(selectedDriver.user_id);
      setDriverDetails(updated);
      setSuccessMessage("✅ Payout eligibility enabled!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error enabling payout:", error);
      setErrorMessage("Failed to enable payout eligibility.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateAdjustment = async () => {
    if (!selectedBookingForAdjustment) {
      setErrorMessage("Please select a booking first to create an adjustment");
      return;
    }

    if (!adjustmentForm.reason_text.trim()) {
      setErrorMessage("Reason text is required");
      return;
    }
    if (!adjustmentForm.amount || parseFloat(adjustmentForm.amount) <= 0) {
      setErrorMessage("Valid amount is required");
      return;
    }

    setUpdating(true);
    setErrorMessage(null);

    try {
      await createAdjustment(selectedBookingForAdjustment.booking_id, {
        adjustment_type: adjustmentForm.adjustment_type,
        amount: adjustmentForm.amount,
        reason_code: adjustmentForm.reason_code,
        reason_text: adjustmentForm.reason_text,
        admin_note: adjustmentForm.admin_note,
      });

      if (selectedDriver) {
        const adjustments = await getOpenAdjustmentsForDriver(selectedDriver.user_id);
        setOpenAdjustments(adjustments.items || []);

        const bookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
        setPayoutBookings(bookings.items || []);
      }

      setShowAdjustmentModal(false);
      setSelectedBookingForAdjustment(null);
      setAdjustmentForm({
        adjustment_type: "fine",
        amount: "",
        reason_code: "",
        reason_text: "",
        admin_note: "",
      });
      setSuccessMessage("✅ Adjustment created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error creating adjustment:", error);

      if (error.message === "BOOKING_NOT_IN_PAYOUT_SYSTEM") {
        setErrorMessage(
          "This booking is not registered in the payout system yet. " +
          "Please ensure the booking is completed and has been synced to the payout system."
        );
      } else {
        setErrorMessage(`Failed to create adjustment: ${error.message}`);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleIncludeExcludeAdjustment = async (adjustmentId, decision_status) => {
    setUpdating(true);
    try {
      await updateAdjustmentDecision(adjustmentId, decision_status, `Admin ${decision_status} this adjustment`);

      if (selectedDriver) {
        const adjustments = await getOpenAdjustmentsForDriver(selectedDriver.user_id);
        setOpenAdjustments(adjustments.items || []);
      }

      setSuccessMessage(`✅ Adjustment ${decision_status} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating adjustment:", error);
      setErrorMessage("Failed to update adjustment");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAdjustmentSelection = (adjustmentId, adjustment) => {
    setSelectedAdjustments(prev => {
      const current = prev[adjustmentId];
      if (current) {
        const newPrev = { ...prev };
        delete newPrev[adjustmentId];
        return newPrev;
      } else {
        return {
          ...prev,
          [adjustmentId]: {
            adjustment_id: adjustmentId,
            applied_amount: adjustment.remaining_amount || adjustment.amount,
          }
        };
      }
    });
  };

  const handleProcessPayout = async (bookingId) => {
    setProcessingBooking(bookingId);
    setErrorMessage(null);

    const adjustments_to_apply = Object.values(selectedAdjustments);

    const booking = payoutBookings.find(b => b.booking_id === bookingId);
    const netPayoutAmount = parseFloat(booking?.net_payout_amount || 0);

    if (netPayoutAmount <= 0) {
      setErrorMessage(`Cannot process payout: Net amount (₹${netPayoutAmount.toFixed(2)}) is zero or negative after deductions.`);
      setProcessingBooking(null);
      return;
    }

    if (netPayoutAmount < 1) {
      setErrorMessage(`Net payout amount (₹${netPayoutAmount.toFixed(2)}) is too small to transfer. Minimum transfer amount is ₹1.`);
      setProcessingBooking(null);
      return;
    }

    try {
      const result = await triggerSinglePayout(bookingId, adjustments_to_apply);
      console.log("Payout result:", result);

      if (result.booking_transfer_status === "withheld") {
        setSuccessMessage("⚠️ Payout fully absorbed by deductions. No transfer created.");
      } else if (result.transfer_row_status === "processed") {
        setSuccessMessage(`✅ Payout processed successfully! Net amount: ₹${parseFloat(result.net_transfer_amount).toFixed(2)}`);
      } else if (result.transfer_row_status === "failed") {
        setErrorMessage(`Payout failed: ${result.failure_reason || "Provider transfer failed"}`);
      } else {
        setSuccessMessage("Payout processed successfully!");
      }

      setSelectedAdjustments({});

      const bookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
      setPayoutBookings(bookings.items || []);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error processing payout:", error);
      const errorMsg = error.detail?.error || error.detail?.message || "Failed to process payout";

      if (error.detail?.error === "booking_not_completed") {
        setErrorMessage("Booking is not completed yet. Cannot process payout.");
      } else if (error.detail?.error === "driver_not_payout_eligible") {
        setErrorMessage("Driver is not payout eligible. Please enable eligibility first.");
      } else if (error.detail?.error === "linked_account_not_active") {
        setErrorMessage("Linked account is not active. Please check the account status.");
      } else if (error.detail?.error === "payout_details_not_found") {
        setErrorMessage("Payout details not found. Please save bank details first.");
      } else if (error.detail?.error === "linked_account_not_available") {
        setErrorMessage("Linked account not available. Please create a linked account first.");
      } else if (error.detail?.error === "adjustment_amount_exceeds_gross") {
        setErrorMessage("Selected deduction amount exceeds gross payout amount.");
      } else if (error.detail?.provider_response?.error?.description) {
        const razorpayError = error.detail.provider_response.error.description;
        if (razorpayError.includes("Transfer amount exceeds amount available")) {
          setErrorMessage(
            `⚠️ Insufficient Razorpay balance.\n\n` +
            `Net payout amount: ₹${netPayoutAmount.toFixed(2)}\n` +
            `Available balance in Razorpay is lower than this amount.\n\n` +
            `Please add funds to Razorpay account or contact finance team.`
          );
        } else {
          setErrorMessage(razorpayError);
        }
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleProcessSelectedPayouts = async () => {
    if (monthlySummary.bookings.length === 0) {
      setErrorMessage("No ready bookings to process");
      return;
    }

    setUpdating(true);
    setErrorMessage(null);

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const booking of monthlySummary.bookings) {
      try {
        const result = await triggerSinglePayout(booking.booking_id, []);
        results.push({
          booking_id: booking.booking_id,
          status: 'success',
          amount: result.net_transfer_amount
        });
        successCount++;
      } catch (error) {
        console.error(`Error processing booking ${booking.booking_id}:`, error);
        results.push({
          booking_id: booking.booking_id,
          status: 'failed',
          error: error.detail?.message || error.message
        });
        failureCount++;
      }
    }

    setBatchResults({
      total_selected: monthlySummary.bookings.length,
      success_count: successCount,
      failure_count: failureCount,
      results: results
    });

    setSuccessMessage(`Processed ${successCount} successful, ${failureCount} failed out of ${monthlySummary.bookings.length} bookings`);

    const bookings = await getPayoutBookings({ driver_user_id: selectedDriver.user_id });
    setPayoutBookings(bookings.items || []);
    setShowMonthlySummary(false);

    setTimeout(() => setSuccessMessage(null), 5000);
    setUpdating(false);
  };

  const handleReconcileRefund = async (bookingId) => {
    setUpdating(true);
    try {
      const result = await reconcileRefund(bookingId);
      setSuccessMessage(`Refund reconciled successfully! Outcome: ${result.outcome}`);

      await fetchRefundQueue();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error reconciling refund:", error);
      setErrorMessage("Failed to reconcile refund");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateSettings = async () => {
    setUpdating(true);
    try {
      await updatePayoutSettings(parseFloat(commissionPercent));
      const updated = await getPayoutSettings();
      setSettings(updated);
      setShowSettingsModal(false);
      setSuccessMessage("✅ Commission settings updated!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating settings:", error);
      setErrorMessage("Failed to update settings");
    } finally {
      setUpdating(false);
    }
  };

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ready for Payout</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.ready_booking_count || 0}</p>
              <p className="text-sm text-green-600 mt-1">₹{parseFloat(dashboard?.ready_total_amount || 0).toFixed(2)}</p>
            </div>
            <BanknotesIcon className="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transferred</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.transferred_booking_count || 0}</p>
              <p className="text-sm text-blue-600 mt-1">₹{parseFloat(dashboard?.transferred_total_amount || 0).toFixed(2)}</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Withheld / Failed</p>
              <p className="text-2xl font-bold text-gray-900">{(dashboard?.withheld_booking_count || 0) + (dashboard?.failed_booking_count || 0)}</p>
              <p className="text-sm text-red-600 mt-1">₹{parseFloat((dashboard?.withheld_total_amount || 0) + (dashboard?.failed_total_amount || 0)).toFixed(2)}</p>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Refund Queue</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard?.refund_queue_count || 0}</p>
              <p className="text-sm text-purple-600 mt-1">₹{parseFloat(dashboard?.refund_queue_total_amount || 0).toFixed(2)}</p>
            </div>
            <ArrowPathIcon className="w-12 h-12 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Alerts</h3>
        <div className="space-y-2">
          {(dashboard?.drivers_missing_linked_account_count > 0) && (
            <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{dashboard.drivers_missing_linked_account_count} drivers missing linked account</span>
            </div>
          )}
          {(dashboard?.drivers_not_eligible_count > 0) && (
            <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-3 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{dashboard.drivers_not_eligible_count} drivers not payout eligible</span>
            </div>
          )}
          {(dashboard?.refund_queue_count > 0) && (
            <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-3 rounded-lg">
              <ArrowPathIcon className="w-5 h-5" />
              <span>{dashboard.refund_queue_count} bookings pending refund reconciliation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Drivers Tab
  const renderDrivers = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="font-semibold text-gray-900">Drivers List</h3>
        <p className="text-sm text-gray-500 mt-1">Manage driver payout profiles and eligibility</p>
      </div>
      <div className="divide-y">
        {drivers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No drivers found</div>
        ) : (
          drivers.map((driver) => (
            <div key={driver.user_id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">
                      {driver.profile?.full_name || driver.name || "Unknown Driver"}
                    </p>
                    {driver.payout_details?.is_payout_eligible && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Eligible</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                  {driver.vehicle && (
                    <p className="text-xs text-gray-400">{driver.vehicle.registration_number || driver.vehicle.reg_no}</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-4 text-xs">
                    <span className="text-yellow-600">Ready: {driver.aggregates?.ready_booking_count || 0}</span>
                    <span className="text-green-600">Transferred: {driver.aggregates?.transferred_booking_count || 0}</span>
                    <span className="text-red-600">Withheld: {driver.aggregates?.withheld_booking_count || 0}</span>
                    <span className="text-purple-600">Refund Queue: {driver.aggregates?.refund_queue_count || 0}</span>
                  </div>

                  {driver.payout_details?.linked_account_status && (
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${getLinkedAccountStatusColor(driver.payout_details.linked_account_status)}`}>
                      {driver.payout_details.linked_account_status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    fetchDriverDetails(driver);
                    setActiveTab("driverDetail");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Manage →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Monthly Summary Modal
  const renderMonthlySummaryModal = () => {
    if (!showMonthlySummary) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">Monthly Payout Summary</h3>
            <button onClick={() => setShowMonthlySummary(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-6 overflow-auto flex-1">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-600">{monthlySummary.totalBookings}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Gross Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{monthlySummary.totalGrossAmount.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">-₹{monthlySummary.totalDeductions.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Net Payout</p>
                <p className="text-2xl font-bold text-purple-600">₹{monthlySummary.totalNetAmount.toFixed(2)}</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
            <div className="space-y-3 max-h-96 overflow-auto">
              {monthlySummary.bookings.map((booking) => (
                <div key={booking.booking_id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-600">{booking.booking_id}</p>
                      <p className="text-sm text-gray-500">Passenger: {booking.passenger_name || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Gross: ₹{parseFloat(booking.driver_payout_amount || 0).toFixed(2)}</p>
                      <p className="text-sm text-red-600">Deductions: -₹{parseFloat(booking.applied_adjustment_amount || 0).toFixed(2)}</p>
                      <p className="text-lg font-bold text-green-600">Net: ₹{parseFloat(booking.net_payout_amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50 flex gap-3">
            <button
              onClick={handleProcessSelectedPayouts}
              disabled={updating || monthlySummary.bookings.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? "Processing..." : `Process ${monthlySummary.bookings.length} Bookings`}
            </button>
            <button
              onClick={() => setShowMonthlySummary(false)}
              className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Monthly Batch Results Modal (NEW)
  const renderMonthlyBatchModal = () => {
    if (!showMonthlyBatchModal || !monthlyBatchResults) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Monthly Payout Results</h3>
            <button onClick={() => setShowMonthlyBatchModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-4 overflow-auto flex-1">
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Selected</p>
                <p className="text-2xl font-bold text-blue-600">{monthlyBatchResults.total_selected}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{monthlyBatchResults.success_count}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{monthlyBatchResults.failure_count}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Results:</p>
              {monthlyBatchResults.results?.map((result, idx) => (
                <div key={idx} className={`p-2 rounded ${result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm">
                    <strong>{result.booking_id}</strong>: {result.status}
                    {result.error && <span className="text-red-600 ml-2">{result.error}</span>}
                    {result.result?.net_transfer_amount && (
                      <span className="text-green-600 ml-2">₹{parseFloat(result.result.net_transfer_amount).toFixed(2)}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button onClick={() => setShowMonthlyBatchModal(false)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Bulk Batch Results Modal (NEW)
  const renderBulkBatchModal = () => {
    if (!showBulkBatchModal || !bulkBatchResults) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Bulk Payout Results</h3>
            <button onClick={() => setShowBulkBatchModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-4 overflow-auto flex-1">
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Selected</p>
                <p className="text-2xl font-bold text-blue-600">{bulkBatchResults.total_selected}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{bulkBatchResults.success_count}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{bulkBatchResults.failure_count}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Results:</p>
              {bulkBatchResults.results?.map((result, idx) => (
                <div key={idx} className={`p-2 rounded ${result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm">
                    <strong>{result.booking_id}</strong>: {result.status}
                    {result.error && <span className="text-red-600 ml-2">{result.error}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button onClick={() => setShowBulkBatchModal(false)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Booking Adjustments Modal (NEW)
  const renderBookingAdjustmentsModal = () => {
    if (!showBookingAdjustmentsModal || !selectedBookingDetail) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Booking Adjustments</h3>
              <p className="text-sm text-gray-500 mt-1 font-mono">Booking ID: {selectedBookingDetail.booking?.booking_id}</p>
            </div>
            <button onClick={() => setShowBookingAdjustmentsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-6 overflow-auto flex-1">
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Fare Amount</p>
                  <p className="text-lg font-bold">₹{parseFloat(selectedBookingDetail.booking?.fare_amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Commission</p>
                  <p className="text-lg font-bold text-orange-600">₹{parseFloat(selectedBookingDetail.booking?.commission_amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Driver Payout</p>
                  <p className="text-lg font-bold">₹{parseFloat(selectedBookingDetail.booking?.driver_payout_amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTransferStatusColor(selectedBookingDetail.booking?.transfer_status)}`}>
                    {selectedBookingDetail.booking?.transfer_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Originated Adjustments */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Originated Adjustments</h4>
              {selectedBookingDetail.originated_adjustments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No originated adjustments</p>
              ) : (
                <div className="space-y-3">
                  {selectedBookingDetail.originated_adjustments?.map((adj) => (
                    <div key={adj.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${adj.adjustment_type === 'fine' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                              {adj.adjustment_type}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${adj.decision_status === 'included' ? 'bg-green-100 text-green-700' :
                              adj.decision_status === 'excluded' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {adj.decision_status}
                            </span>
                          </div>
                          <p className="text-sm font-medium">₹{parseFloat(adj.amount).toFixed(2)}</p>
                          <p className="text-sm text-gray-600 mt-1">{adj.reason_text}</p>
                          {adj.admin_note && <p className="text-xs text-gray-500 mt-1">Note: {adj.admin_note}</p>}
                          <p className="text-xs text-gray-400 mt-1">Remaining: ₹{parseFloat(adj.remaining_amount).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Applied Adjustments */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Applied Adjustments</h4>
              {selectedBookingDetail.applied_adjustments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No applied adjustments</p>
              ) : (
                <div className="space-y-3">
                  {selectedBookingDetail.applied_adjustments?.map((adj, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-green-700">₹{parseFloat(adj.applied_amount).toFixed(2)}</p>
                          <p className="text-xs text-gray-600">Applied on: {new Date(adj.applied_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open Driver Adjustments */}
            {selectedBookingDetail.open_driver_adjustments?.items?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Open Driver Adjustments</h4>
                <div className="space-y-3">
                  {selectedBookingDetail.open_driver_adjustments.items.map((adj) => (
                    <div key={adj.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">₹{parseFloat(adj.amount).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{adj.reason_text}</p>
                          <p className="text-xs text-gray-500">Remaining: ₹{parseFloat(adj.remaining_amount).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => setShowBookingAdjustmentsModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Driver Detail Tab
  const renderDriverDetail = () => {
    if (!selectedDriver) return null;

    const payoutDetails = driverDetails?.payout_details || {};
    const isFullySetup = payoutDetails.razorpay_linked_account_id &&
      payoutDetails.linked_account_status === 'active' &&
      payoutDetails.route_product_status === 'activated' &&
      payoutDetails.is_payout_eligible;

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDriver.profile?.full_name || selectedDriver.name || "Driver"}
              </h2>
              <p className="text-gray-500">{selectedDriver.email}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <span className={`px-2 py-1 text-xs rounded-full ${payoutDetails.is_payout_eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {payoutDetails.is_payout_eligible ? 'Payout Eligible' : 'Payout Not Eligible'}
                </span>
                {payoutDetails.linked_account_status && (
                  <span className={`px-2 py-1 text-xs rounded-full ${getLinkedAccountStatusColor(payoutDetails.linked_account_status)}`}>
                    {payoutDetails.linked_account_status}
                  </span>
                )}
                {payoutDetails.route_product_status && (
                  <span className={`px-2 py-1 text-xs rounded-full ${payoutDetails.route_product_status === 'activated'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    Route: {payoutDetails.route_product_status}
                  </span>
                )}
                {isFullySetup && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    Ready for Payout
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshPayoutBookings}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                Refresh
              </button>
              <button
                onClick={() => {
                  setSelectedDriver(null);
                  setDriverDetails(null);
                  setActiveTab("drivers");
                }}
                className="px-3 py-1 text-gray-600 hover:text-gray-900"
              >
                ← Back to Drivers
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-md p-4 ${isFullySetup ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            {isFullySetup ? (
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            )}
            <div>
              <p className="font-semibold">
                {isFullySetup ? "Driver Fully Setup for Payouts" : "Driver Setup Incomplete"}
              </p>
              <p className="text-sm">
                {isFullySetup
                  ? "This driver can receive payouts. All requirements are met."
                  : "Complete the steps below to enable payouts for this driver."}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Account Details Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Bank Account Details</h3>
            <button
              onClick={() => setShowBankModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {payoutDetails.bank_account_number ? 'Edit' : 'Add'}
            </button>
          </div>
          <div className="p-4">
            {payoutDetails.bank_account_number ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Bank details saved</span>
                </div>
                <p className="text-sm text-green-600">
                  Account Holder: {payoutDetails.account_holder_name}<br />
                  Account: ****{payoutDetails.bank_account_number?.slice(-4)}<br />
                  IFSC: {payoutDetails.ifsc_code}<br />
                  Phone: {payoutDetails.phone_number}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-yellow-700">No bank details added yet</p>
                <button
                  onClick={() => setShowBankModal(true)}
                  className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Add Bank Details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Razorpay Linked Account Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Razorpay Linked Account</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCreateAndActivateLinkedAccount}
                disabled={!payoutDetails.bank_account_number || updating}
                className={`px-3 py-1 text-sm rounded ${payoutDetails.bank_account_number ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Create & Activate
              </button>
              {payoutDetails.razorpay_linked_account_id && (
                <>
                  <button
                    onClick={handleSyncLinkedAccount}
                    disabled={updating}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                    Sync
                  </button>
                  <button
                    onClick={handleViewProviderAccount}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <EyeIcon className="w-4 h-4 inline mr-1" />
                    View
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="p-4">
            {payoutDetails.razorpay_linked_account_id ? (
              <div className={`rounded-lg p-4 border ${getLinkedAccountStatusColor(payoutDetails.linked_account_status)}`}>
                <p className="text-sm font-mono break-all">
                  ID: {payoutDetails.razorpay_linked_account_id}
                </p>
                <p className="text-sm mt-1">
                  Status: {payoutDetails.linked_account_status}
                </p>
                {payoutDetails.route_product_status && (
                  <p className="text-sm mt-1">
                    Route Product: {payoutDetails.route_product_status}
                  </p>
                )}
                {payoutDetails.linked_account_status !== 'active' && (
                  <button
                    onClick={() => updateLinkedAccountStatus(selectedDriver.user_id, payoutDetails.razorpay_linked_account_id, "active")}
                    className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Set as Active
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                No linked account created. Click "Create & Activate" to set up.
              </div>
            )}
          </div>
        </div>

        {/* NEW: Onboarding Status Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-4">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Onboarding Status</h3>
            <p className="text-xs text-gray-500 mt-1">Check each step for payout readiness</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {/* Bank Details Status */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${payoutDetails.bank_account_number ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">1. Bank Details</span>
                </div>
                <span className={`text-xs ${payoutDetails.bank_account_number ? 'text-green-600' : 'text-red-600'}`}>
                  {payoutDetails.bank_account_number ? '✓ Completed' : '✗ Required'}
                </span>
              </div>

              {/* Linked Account Status */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${payoutDetails.razorpay_linked_account_id ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">2. Linked Account</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${payoutDetails.razorpay_linked_account_id ? 'text-green-600' : 'text-red-600'}`}>
                    {payoutDetails.razorpay_linked_account_id ? payoutDetails.linked_account_status || 'Active' : 'Not Created'}
                  </span>
                  {!payoutDetails.razorpay_linked_account_id && (
                    <button
                      onClick={handleCreateAndActivateLinkedAccount}
                      disabled={!payoutDetails.bank_account_number || updating}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Create
                    </button>
                  )}
                </div>
              </div>

              {/* Stakeholder Status */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${payoutDetails.razorpay_stakeholder_id ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-gray-700">3. Stakeholder (KYC)</span>
                </div>
                <span className={`text-xs ${payoutDetails.razorpay_stakeholder_id ? 'text-green-600' : 'text-yellow-600'}`}>
                  {payoutDetails.razorpay_stakeholder_id ? '✓ Created' : 'Pending - Run Sync'}
                </span>
              </div>

              {/* Route Product Status */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${payoutDetails.route_product_status === 'activated' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-gray-700">4. Route Product</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${payoutDetails.route_product_status === 'activated' ? 'text-green-600' :
                    payoutDetails.route_product_status === 'requested' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                    {payoutDetails.route_product_status || 'Not Created'}
                  </span>
                  {payoutDetails.razorpay_linked_account_id && payoutDetails.route_product_status !== 'activated' && (
                    <button
                      onClick={handleSyncLinkedAccount}
                      disabled={updating}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Sync
                    </button>
                  )}
                </div>
              </div>

              {/* Payout Eligibility */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${payoutDetails.is_payout_eligible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-700">5. Payout Eligibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${payoutDetails.is_payout_eligible ? 'text-green-600' : 'text-red-600'}`}>
                    {payoutDetails.is_payout_eligible ? 'Enabled' : 'Disabled'}
                  </span>
                  {payoutDetails.route_product_status === 'activated' && !payoutDetails.is_payout_eligible && (
                    <button
                      onClick={handleEnablePayout}
                      disabled={updating}
                      className="text-xs px-2 py-1 bg-purple-600 text-white rounded"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleSyncLinkedAccount}
                disabled={updating || !payoutDetails.razorpay_linked_account_id}
                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 inline mr-1 ${updating ? 'animate-spin' : ''}`} />
                Sync Status
              </button>
              <button
                onClick={handleViewProviderAccount}
                className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <EyeIcon className="w-4 h-4 inline mr-1" />
                View Provider
              </button>
            </div>
          </div>
        </div>

        {/* Open Adjustments Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Open Adjustments (Fines/Deductions)</h3>
          </div>
          <div className="divide-y">
            {openAdjustments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No open adjustments for this driver
              </div>
            ) : (
              openAdjustments.map((adj) => (
                <div key={adj.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${adj.adjustment_type === 'fine' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {adj.adjustment_type}
                        </span>
                        <span className="text-sm font-medium text-gray-900">₹{parseFloat(adj.amount).toFixed(2)}</span>
                        <span className="text-xs text-gray-500">Remaining: ₹{parseFloat(adj.remaining_amount).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{adj.reason_text}</p>
                      {adj.admin_note && (
                        <p className="text-xs text-gray-400 mt-1">Note: {adj.admin_note}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleIncludeExcludeAdjustment(adj.id, 'included')}
                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Include
                      </button>
                      <button
                        onClick={() => handleIncludeExcludeAdjustment(adj.id, 'excluded')}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Exclude
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Driver's Payout Bookings Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Driver's Payout Bookings</h3>
            <div className="flex gap-2">
              {isFullySetup && (
                <button
                  onClick={() => setShowMonthlyPayoutModal(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Monthly Payout
                </button>
              )}
              <button
                onClick={refreshPayoutBookings}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                Refresh Bookings
              </button>
            </div>
          </div>

          {payoutBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No payout bookings found for this driver
            </div>
          ) : (
            <div className="divide-y">
              {payoutBookings.map((booking) => {
                const displayStatus = getDisplayStatus(booking);
                const netPayoutAmount = parseFloat(booking.net_payout_amount || 0);

                return (
                  <div key={booking.booking_id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${displayStatus.color}`}>
                            {displayStatus.text}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {booking.booking_id}
                          </span>
                          <button
                            onClick={() => handleViewFullBookingDetails(booking.booking_id)}
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            <EyeIcon className="w-3 h-3" />
                            View Details
                          </button>
                          <button
                            onClick={() => fetchBookingWithAdjustments(booking.booking_id)}
                            className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                          >
                            <DocumentTextIcon className="w-3 h-3" />
                            View Adjustments
                          </button>
                          {booking.trip_id && (
                            <button
                              onClick={() => handleViewTripPassengers(booking.trip_id)}
                              className="text-green-600 hover:text-green-800 text-xs flex items-center gap-1"
                            >
                              <UserGroupIcon className="w-3 h-3" />
                              Trip Passengers
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedBookingForAdjustment(booking);
                              setShowAdjustmentModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-800 text-xs flex items-center gap-1"
                          >
                            <PlusIcon className="w-3 h-3" />
                            Add Adjustment
                          </button>
                          <button
                            onClick={() => syncBookingStatus(booking.booking_id, booking.trip_id)}
                            className="text-orange-600 hover:text-orange-800 text-xs flex items-center gap-1"
                          >
                            <ArrowPathIcon className="w-3 h-3" />
                            Sync Status
                          </button>
                        </div>

                        <p className="text-sm text-gray-600">
                          Passenger: {booking.passenger_name || "N/A"}
                        </p>

                        <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Gross Payout</p>
                            <p className="font-medium text-gray-900">₹{parseFloat(booking.driver_payout_amount || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Deductions & Fines</p>
                            <p className="font-medium text-red-600">-₹{parseFloat(booking.applied_adjustment_amount || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Net Payout (Will Transfer)</p>
                            <p className={`font-bold text-lg ${netPayoutAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{netPayoutAmount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Commission ({booking.commission_percent_snapshot || 0}%)</p>
                            <p className="text-gray-600">-₹{parseFloat(booking.commission_amount || 0).toFixed(2)}</p>
                          </div>
                        </div>

                        {netPayoutAmount <= 0 && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                            ⚠️ Net payout is zero or negative. Cannot process payout.
                          </div>
                        )}
                      </div>

                      {booking.transfer_status === 'ready' && isFullySetup && netPayoutAmount > 0 && (
                        <div className="ml-4">
                          {openAdjustments.length > 0 && (
                            <div className="mb-2 text-right">
                              <details className="text-sm">
                                <summary className="cursor-pointer text-blue-600">Apply deductions</summary>
                                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10 p-2">
                                  {openAdjustments.map(adj => (
                                    <label key={adj.id} className="flex items-center gap-2 p-1 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={!!selectedAdjustments[adj.id]}
                                        onChange={() => handleToggleAdjustmentSelection(adj.id, adj)}
                                        className="rounded"
                                      />
                                      <span>{adj.reason_text}</span>
                                      <span className="ml-auto font-medium">₹{parseFloat(adj.remaining_amount).toFixed(2)}</span>
                                    </label>
                                  ))}
                                </div>
                              </details>
                            </div>
                          )}

                          <button
                            onClick={() => handleProcessPayout(booking.booking_id)}
                            disabled={processingBooking === booking.booking_id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {processingBooking === booking.booking_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              'Process Payout'
                            )}
                          </button>
                        </div>
                      )}

                      {booking.transfer_status === 'withheld' && (
                        <div className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                          Fully Absorbed
                        </div>
                      )}

                      {booking.transfer_status === 'failed' && (
                        <div className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                          Failed - Check Details
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
    );
  };

  // Transfers Tab
  const renderTransfers = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-4 flex gap-4">
        <select
          value={driverFilter}
          onChange={(e) => setDriverFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Drivers</option>
          {drivers.map(d => (
            <option key={d.user_id} value={d.user_id}>{d.profile?.full_name || d.name}</option>
          ))}
        </select>

        <select
          value={transferStatusFilter}
          onChange={(e) => setTransferStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="processed">Processed</option>
          <option value="failed">Failed</option>
          <option value="reversed">Reversed</option>
        </select>

        <button
          onClick={fetchTransfers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900">Transfer History</h3>
        </div>
        <div className="divide-y">
          {transfers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transfers found
            </div>
          ) : (
            transfers.map((transfer) => (
              <div key={transfer.transfer_id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTransferStatusColor(transfer.status)}`}>
                        {transfer.status}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {transfer.transfer_id}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Booking: {transfer.booking_id}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      Amount: ₹{parseFloat(transfer.amount || 0).toFixed(2)}
                    </p>
                    {transfer.applied_adjustment_amount > 0 && (
                      <p className="text-xs text-red-600">
                        Deductions applied: ₹{parseFloat(transfer.applied_adjustment_amount).toFixed(2)}
                      </p>
                    )}
                    {transfer.failure_reason && (
                      <p className="text-xs text-red-500 mt-1">
                        Failed: {transfer.failure_reason}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Processed: {transfer.processed_at ? new Date(transfer.processed_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const detail = await getTransferDetail(transfer.transfer_id);
                      console.log("Transfer detail:", detail);
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Refunds Tab
  const renderRefunds = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Refund Queue</h3>
        <button
          onClick={fetchRefundQueue}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <ArrowPathIcon className="w-4 h-4 inline mr-1" />
          Refresh
        </button>
      </div>
      <div className="divide-y">
        {refundQueue.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending refunds
          </div>
        ) : (
          refundQueue.map((item) => (
            <div key={item.booking_id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Booking: {item.booking_id}</p>
                  <p className="text-sm text-gray-600">
                    Driver: {item.driver_user_id}
                  </p>
                  <p className="text-sm font-medium">Fare: ₹{parseFloat(item.fare_amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    Cancelled: {item.cancelled_at ? new Date(item.cancelled_at).toLocaleString() : 'N/A'}
                  </p>
                  {item.refund_retry_after && (
                    <p className="text-xs text-yellow-600">
                      Retry after: {new Date(item.refund_retry_after).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleReconcileRefund(item.booking_id)}
                  disabled={updating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Reconcile Refund"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Full Booking Details Modal
  const renderFullBookingModal = () => {
    if (!showFullBookingModal || !fullBookingDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
            <button onClick={() => setShowFullBookingModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-6 overflow-auto flex-1 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-mono text-sm">{fullBookingDetails.booking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trip ID</p>
                  <p className="font-mono text-sm">{fullBookingDetails.trip_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusColor(fullBookingDetails.booking_status)}`}>
                    {fullBookingDetails.booking_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Passenger Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{fullBookingDetails.passenger?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm">{fullBookingDetails.passenger?.email}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                Route Information
              </h4>
              <p className="font-medium">{fullBookingDetails.route?.name}</p>
              <p className="text-sm text-gray-500">Code: {fullBookingDetails.route?.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Pickup Location</h4>
                <p className="font-medium">{fullBookingDetails.pickup_location?.booked_stop_name}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Dropoff Location</h4>
                <p className="font-medium">{fullBookingDetails.dropoff_location?.booked_stop_name}</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => setShowFullBookingModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Trip Passengers Modal
  const renderTripPassengersModal = () => {
    if (!showTripPassengersModal || !tripPassengers) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">Trip Passengers</h3>
            <button onClick={() => setShowTripPassengersModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-6 overflow-auto flex-1">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Trip ID</p>
              <p className="font-mono text-sm">{tripPassengers.trip_id}</p>
              <p className="text-sm text-gray-600 mt-2">Total Bookings: {tripPassengers.total_bookings}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Passengers List</h4>
              {tripPassengers.passengers?.map((passenger, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{passenger.passenger_name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">Booking ID: {passenger.booking_id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusColor(passenger.status)}`}>
                      {passenger.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => setShowTripPassengersModal(false)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Batch Results Modal
  const renderBatchResultsModal = () => {
    if (!batchResults) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Batch Payout Results</h3>
            <button onClick={() => setBatchResults(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-4 overflow-auto flex-1">
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Selected</p>
                <p className="text-2xl font-bold text-blue-600">{batchResults.total_selected}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{batchResults.success_count}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{batchResults.failure_count}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Details:</p>
              {batchResults.results?.map((result, idx) => (
                <div key={idx} className={`p-2 rounded ${result.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm">
                    <strong>{result.booking_id}</strong>: {result.status}
                    {result.error && <span className="text-red-600"> - {result.error}</span>}
                    {result.amount && <span className="text-green-600 ml-2">₹{parseFloat(result.amount).toFixed(2)}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => setBatchResults(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <div className="p-6 overflow-auto">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-green-700 whitespace-pre-line">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm whitespace-pre-line">{errorMessage}</p>
                </div>
                <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-800">✕</button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BanknotesIcon className="w-8 h-8 text-green-600" />
                Payout Management
              </h1>
              <p className="text-gray-500 mt-1">Manage driver payouts, adjustments, and transfers</p>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Commission: {settings?.commission_percent || 0}%
            </button>
          </div>

          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 font-medium transition ${activeTab === "dashboard" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("drivers");
                fetchInitialData();
              }}
              className={`px-4 py-2 font-medium transition ${activeTab === "drivers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Drivers
            </button>
            <button
              onClick={() => {
                setActiveTab("transfers");
                fetchTransfers();
              }}
              className={`px-4 py-2 font-medium transition ${activeTab === "transfers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Transfers
            </button>
            <button
              onClick={() => {
                setActiveTab("refunds");
                fetchRefundQueue();
              }}
              className={`px-4 py-2 font-medium transition ${activeTab === "refunds" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Refunds
            </button>
          </div>

          {loading && activeTab !== "driverDetail" ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "drivers" && renderDrivers()}
              {activeTab === "driverDetail" && renderDriverDetail()}
              {activeTab === "transfers" && renderTransfers()}
              {activeTab === "refunds" && renderRefunds()}
            </>
          )}
        </div>
      </div>

      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Bank Details</h3>
              <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={bankDetails.account_holder_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
                <input
                  type="text"
                  value={bankDetails.bank_account_number}
                  onChange={(e) => setBankDetails({ ...bankDetails, bank_account_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  value={bankDetails.ifsc_code}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={bankDetails.phone_number}
                  onChange={(e) => setBankDetails({ ...bankDetails, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSaveBankDetails} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {updating ? "Saving..." : "Save Details"}
                </button>
                <button onClick={() => setShowBankModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Commission Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={handleUpdateSettings} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showProviderModal && providerAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-xl font-bold text-gray-900">Razorpay Account Details</h3>
              <button onClick={() => setShowProviderModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded border">
                {JSON.stringify(providerAccount.provider_account, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Create Adjustment for Booking
                {selectedBookingForAdjustment && (
                  <span className="text-sm font-mono text-gray-500 block mt-1">
                    {selectedBookingForAdjustment.booking_id}
                  </span>
                )}
              </h3>
              <button onClick={() => {
                setShowAdjustmentModal(false);
                setSelectedBookingForAdjustment(null);
              }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={adjustmentForm.adjustment_type}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustment_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="fine">Fine</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={adjustmentForm.amount}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason Code</label>
                <input
                  type="text"
                  value={adjustmentForm.reason_code}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason_code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., late_start, damage, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason Text *</label>
                <textarea
                  value={adjustmentForm.reason_text}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  placeholder="Detailed reason for this adjustment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
                <textarea
                  value={adjustmentForm.admin_note}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, admin_note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  placeholder="Internal notes (optional)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleCreateAdjustment} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {updating ? "Creating..." : "Create Adjustment"}
                </button>
                <button onClick={() => {
                  setShowAdjustmentModal(false);
                  setSelectedBookingForAdjustment(null);
                }} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updated Monthly Payout Modal with Trigger Button */}
      {showMonthlyPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Monthly Payout</h3>
              <button onClick={() => setShowMonthlyPayoutModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={monthlyPayoutConfig.month}
                  onChange={(e) => setMonthlyPayoutConfig({ ...monthlyPayoutConfig, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={monthlyPayoutConfig.year}
                  onChange={(e) => setMonthlyPayoutConfig({ ...monthlyPayoutConfig, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-500">
                This will trigger payouts for all eligible completed bookings for {selectedDriver?.profile?.full_name || selectedDriver?.name} in {monthlyPayoutConfig.month}/{monthlyPayoutConfig.year}
              </p>
              <div className="flex gap-3 pt-4">
                <button onClick={handleMonthlyPayout} disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {loading ? "Processing..." : "Trigger Monthly Payout"}
                </button>
                <button onClick={() => setShowMonthlyPayoutModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Bulk Payout</h3>
              <button onClick={() => setShowBulkPayoutModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <p>Selected {bulkPayoutBookings.length} bookings for payout</p>
              <p className="text-sm text-gray-500">This will process each booking individually</p>
              <div className="flex gap-3 pt-4">
                <button onClick={handleBulkPayout} disabled={updating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {updating ? "Processing..." : "Process Bulk Payout"}
                </button>
                <button onClick={() => setShowBulkPayoutModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBookingDetailModal && bookingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Booking Payout Details</h3>
              <button onClick={() => setShowBookingDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded border">
                {JSON.stringify(bookingDetail, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {renderFullBookingModal()}
      {renderTripPassengersModal()}
      {renderMonthlySummaryModal()}
      {renderMonthlyBatchModal()}
      {renderBulkBatchModal()}
      {renderBookingAdjustmentsModal()}
      {batchResults && renderBatchResultsModal()}
    </div>
  );
};

export default PayoutService;