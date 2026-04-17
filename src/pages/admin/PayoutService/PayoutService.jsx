// import React, { useState, useEffect } from "react";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../../assets/components/navbar/TopNavbar";
// import { 
//   Cog6ToothIcon, 
//   UserGroupIcon, 
//   CreditCardIcon, 
//   BanknotesIcon,
//   ArrowPathIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   ClockIcon
// } from "@heroicons/react/24/outline";

// const API_BASE_URL = "https://be.shuttleapp.transev.site/admin/payouts";

// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access_token");
//   return {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };
// };

// // API Calls
// const getPayoutDashboard = async () => {
//   const response = await fetch(`${API_BASE_URL}/dashboard`, { headers: getAuthHeaders() });
//   return response.json();
// };

// const getPayoutSettings = async () => {
//   const response = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() });
//   return response.json();
// };

// const updatePayoutSettings = async (commission_percent) => {
//   const response = await fetch(`${API_BASE_URL}/settings`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ commission_percent }),
//   });
//   return response.json();
// };

// const getDrivers = async () => {
//   const response = await fetch(`${API_BASE_URL}/drivers`, { headers: getAuthHeaders() });
//   return response.json();
// };

// const getDriverDetails = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}`, { headers: getAuthHeaders() });
//   return response.json();
// };

// const updateDriverPayoutDetails = async (driverUserId, details) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/details`, {
//     method: "PUT",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(details),
//   });
//   return response.json();
// };

// const createLinkedAccount = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/create-linked-account`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//   });
//   return response.json();
// };

// const updateDriverEligibility = async (driverUserId, isPayoutEligible) => {
//   const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/eligibility`, {
//     method: "PATCH",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ is_payout_eligible: isPayoutEligible }),
//   });
//   return response.json();
// };

// const getPayoutBookings = async (driverUserId) => {
//   const response = await fetch(`${API_BASE_URL}/bookings?driver_user_id=${driverUserId}&transfer_status=ready`, {
//     headers: getAuthHeaders(),
//   });
//   return response.json();
// };

// const triggerSinglePayout = async (bookingId) => {
//   const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/trigger`, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify({ require_completed: true }),
//   });
//   return response.json();
// };

// const PayoutService = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [settings, setSettings] = useState(null);
//   const [drivers, setDrivers] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [driverDetails, setDriverDetails] = useState(null);
//   const [showBankModal, setShowBankModal] = useState(false);
//   const [showSettingsModal, setShowSettingsModal] = useState(false);
//   const [commissionPercent, setCommissionPercent] = useState("");
//   const [bankDetails, setBankDetails] = useState({
//     account_holder_name: "",
//     bank_account_number: "",
//     ifsc_code: "",
//     phone_number: "",
//   });
//   const [readyBookings, setReadyBookings] = useState([]);
//   const [processingBooking, setProcessingBooking] = useState(null);
//   const [updating, setUpdating] = useState(false);

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     setLoading(true);
//     try {
//       const [settingsData, driversData] = await Promise.all([
//         getPayoutSettings(),
//         getDrivers(),
//       ]);
//       setSettings(settingsData);
//       setCommissionPercent(settingsData.commission_percent?.toString() || "0");
//       setDrivers(driversData.items || []);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectDriver = async (driver) => {
//     setSelectedDriver(driver);
//     setCurrentStep(2);
//     setLoading(true);
//     try {
//       const details = await getDriverDetails(driver.user_id);
//       setDriverDetails(details);
//       setBankDetails({
//         account_holder_name: details.payout_details?.account_holder_name || "",
//         bank_account_number: details.payout_details?.bank_account_number || "",
//         ifsc_code: details.payout_details?.ifsc_code || "",
//         phone_number: details.payout_details?.phone_number || "",
//       });
//     } catch (error) {
//       console.error("Error fetching driver details:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveBankDetails = async () => {
//     setUpdating(true);
//     try {
//       await updateDriverPayoutDetails(selectedDriver.user_id, bankDetails);
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);
//       setShowBankModal(false);
//       alert("✅ Bank details saved successfully!");
//     } catch (error) {
//       console.error("Error saving bank details:", error);
//       alert("❌ Failed to save bank details");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleCreateLinkedAccount = async () => {
//     setUpdating(true);
//     try {
//       await createLinkedAccount(selectedDriver.user_id);
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);
//       alert("✅ Linked account created successfully!");
//     } catch (error) {
//       console.error("Error creating linked account:", error);
//       alert("❌ Failed to create linked account. Please ensure bank details are saved first.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleEnablePayout = async () => {
//     setUpdating(true);
//     try {
//       await updateDriverEligibility(selectedDriver.user_id, true);
//       const updated = await getDriverDetails(selectedDriver.user_id);
//       setDriverDetails(updated);
//       alert("✅ Payout eligibility enabled!");
//       setCurrentStep(3);
//       fetchReadyBookings();
//     } catch (error) {
//       console.error("Error enabling payout:", error);
//       alert("❌ Failed to enable payout");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const fetchReadyBookings = async () => {
//     setLoading(true);
//     try {
//       const data = await getPayoutBookings(selectedDriver.user_id);
//       setReadyBookings(data.items || []);
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProcessPayout = async (bookingId) => {
//     setProcessingBooking(bookingId);
//     try {
//       await triggerSinglePayout(bookingId);
//       alert("✅ Payout processed successfully!");
//       fetchReadyBookings();
//     } catch (error) {
//       console.error("Error processing payout:", error);
//       alert("❌ Failed to process payout");
//     } finally {
//       setProcessingBooking(null);
//     }
//   };

//   const handleUpdateSettings = async () => {
//     setUpdating(true);
//     try {
//       await updatePayoutSettings(parseFloat(commissionPercent));
//       const updated = await getPayoutSettings();
//       setSettings(updated);
//       setShowSettingsModal(false);
//       alert("✅ Commission settings updated!");
//     } catch (error) {
//       console.error("Error updating settings:", error);
//       alert("❌ Failed to update settings");
//     } finally {
//       setUpdating(false);
//     }
//   };
// useEffect(() => {
//   const handleRefresh = () => {
//     console.log("Refreshing driver payouts...");
//     fetchDriverPayouts(); // Your existing fetch function
//   };

//   window.addEventListener("refresh_driver_payouts", handleRefresh);

//   return () => {
//     window.removeEventListener("refresh_driver_payouts", handleRefresh);
//   };
// }, []);
//   const StepIndicator = ({ number, title, status, current }) => (
//     <div className="flex items-center">
//       <div className={`flex flex-col items-center ${current === number ? "opacity-100" : "opacity-50"}`}>
//         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
//           status === "completed" ? "bg-green-500 text-white" :
//           current === number ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
//         }`}>
//           {status === "completed" ? "✓" : number}
//         </div>
//         <p className="text-xs mt-2 text-center font-medium">{title}</p>
//       </div>
//       {number < 4 && <div className="w-16 h-0.5 bg-gray-300 mx-2" />}
//     </div>
//   );

//   const StepCard = ({ step, title, description, icon: Icon, isActive, onClick }) => (
//     <div
//       onClick={onClick}
//       className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
//         isActive
//           ? "border-blue-500 bg-blue-50 shadow-lg"
//           : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
//       }`}
//     >
//       <div className="flex items-start gap-4">
//         <div className={`p-3 rounded-lg ${isActive ? "bg-blue-500" : "bg-gray-100"}`}>
//           <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-600"}`} />
//         </div>
//         <div className="flex-1">
//           <h3 className="font-semibold text-gray-900">Step {step}: {title}</h3>
//           <p className="text-sm text-gray-500 mt-1">{description}</p>
//           {isActive && (
//             <div className="mt-3">
//               <div className="text-xs text-blue-600 font-medium">✓ Current Step</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar />
//         <div className="p-6 overflow-auto">
//           {/* Header */}
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
//                 <BanknotesIcon className="w-8 h-8 text-green-600" />
//                 Driver Payout Management
//               </h1>
//               <p className="text-gray-500 mt-1">Follow the steps below to process driver payouts</p>
//             </div>
//             <button
//               onClick={() => setShowSettingsModal(true)}
//               className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
//             >
//               <Cog6ToothIcon className="w-5 h-5" />
//               Commission: {settings?.commission_percent || 0}%
//             </button>
//           </div>

//           {/* Step Progress Indicator */}
//           <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
//             <div className="flex justify-between items-center max-w-2xl mx-auto">
//               <StepIndicator number={1} title="Select Driver" status={currentStep > 1 ? "completed" : "pending"} current={currentStep} />
//               <StepIndicator number={2} title="Setup Account" status={currentStep > 2 ? "completed" : "pending"} current={currentStep} />
//               <StepIndicator number={3} title="Enable Payout" status={currentStep > 3 ? "completed" : "pending"} current={currentStep} />
//               <StepIndicator number={4} title="Process Payment" status={currentStep > 4 ? "completed" : "pending"} current={currentStep} />
//             </div>
//           </div>

//           {/* Step 1: Select Driver */}
//           {currentStep === 1 && (
//             <div className="space-y-4">
//               <StepCard
//                 step={1}
//                 title="Select a Driver"
//                 description="Choose a driver from the list to start the payout setup process"
//                 icon={UserGroupIcon}
//                 isActive={true}
//               />
//               <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//                 <div className="p-4 bg-gray-50 border-b">
//                   <h3 className="font-semibold text-gray-900">Available Drivers</h3>
//                 </div>
//                 <div className="divide-y">
//                   {drivers.map((driver) => (
//                     <div key={driver.user_id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
//                       <div>
//                         <p className="font-medium text-gray-900">{driver.profile?.full_name || "Unknown"}</p>
//                         <p className="text-sm text-gray-500">{driver.email}</p>
//                         {driver.vehicle && (
//                           <p className="text-xs text-gray-400">{driver.vehicle.registration_number}</p>
//                         )}
//                       </div>
//                       <button
//                         onClick={() => handleSelectDriver(driver)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                       >
//                         Select Driver →
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Setup Account */}
//           {currentStep === 2 && selectedDriver && (
//             <div className="space-y-4">
//               <StepCard
//                 step={2}
//                 title="Setup Bank Account"
//                 description="Add driver's bank details and create a linked account for payouts"
//                 icon={CreditCardIcon}
//                 isActive={true}
//               />

//               {/* Driver Info */}
//               <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                 <p className="text-sm text-blue-800">
//                   <strong>Selected Driver:</strong> {selectedDriver.profile?.full_name} ({selectedDriver.email})
//                 </p>
//               </div>

//               {/* Bank Details Status */}
//               <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//                 <div className="p-4 border-b bg-gray-50">
//                   <h3 className="font-semibold text-gray-900">Step 2.1: Bank Account Details</h3>
//                 </div>
//                 <div className="p-4">
//                   {driverDetails?.payout_details?.bank_account_number ? (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                       <div className="flex items-center gap-2 text-green-700 mb-2">
//                         <CheckCircleIcon className="w-5 h-5" />
//                         <span className="font-medium">Bank details saved</span>
//                       </div>
//                       <p className="text-sm text-green-600">
//                         Account: {driverDetails.payout_details.account_holder_name}<br />
//                         Bank: ****{driverDetails.payout_details.bank_account_number?.slice(-4)}
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                       <div className="flex items-center gap-2 text-yellow-700 mb-2">
//                         <ExclamationTriangleIcon className="w-5 h-5" />
//                         <span className="font-medium">Bank details missing</span>
//                       </div>
//                       <p className="text-sm text-yellow-600 mb-3">Please add driver's bank account information</p>
//                       <button
//                         onClick={() => setShowBankModal(true)}
//                         className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
//                       >
//                         Add Bank Details
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Linked Account Status */}
//               <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//                 <div className="p-4 border-b bg-gray-50">
//                   <h3 className="font-semibold text-gray-900">Step 2.2: Create Linked Account</h3>
//                 </div>
//                 <div className="p-4">
//                   {driverDetails?.payout_details?.razorpay_linked_account_id ? (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                       <div className="flex items-center gap-2 text-green-700 mb-2">
//                         <CheckCircleIcon className="w-5 h-5" />
//                         <span className="font-medium">Linked account created</span>
//                       </div>
//                       <p className="text-sm text-green-600 font-mono">
//                         ID: {driverDetails.payout_details.razorpay_linked_account_id}
//                       </p>
//                     </div>
//                   ) : (
//                     <div>
//                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                         <div className="flex items-center gap-2 text-yellow-700">
//                           <ExclamationTriangleIcon className="w-5 h-5" />
//                           <span className="font-medium">Linked account not created</span>
//                         </div>
//                       </div>
//                       <button
//                         onClick={handleCreateLinkedAccount}
//                         disabled={!driverDetails?.payout_details?.bank_account_number || updating}
//                         className={`px-4 py-2 rounded-lg transition ${
//                           driverDetails?.payout_details?.bank_account_number
//                             ? "bg-blue-600 text-white hover:bg-blue-700"
//                             : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                         }`}
//                       >
//                         {updating ? "Creating..." : "Create Linked Account"}
//                       </button>
//                       {!driverDetails?.payout_details?.bank_account_number && (
//                         <p className="text-xs text-gray-500 mt-2">⚠️ Add bank details first</p>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Navigation Buttons */}
//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setCurrentStep(1)}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//                 >
//                   ← Back
//                 </button>
//                 {driverDetails?.payout_details?.razorpay_linked_account_id && (
//                   <button
//                     onClick={() => setCurrentStep(3)}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                   >
//                     Continue to Step 3 →
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Step 3: Enable Payout */}
//           {currentStep === 3 && selectedDriver && (
//             <div className="space-y-4">
//               <StepCard
//                 step={3}
//                 title="Enable Payout Eligibility"
//                 description="Enable the driver to receive payouts"
//                 icon={CheckCircleIcon}
//                 isActive={true}
//               />

//               <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
//                 {driverDetails?.payout_details?.is_payout_eligible ? (
//                   <div className="text-center">
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
//                       <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
//                       <h3 className="text-xl font-bold text-green-700">Payout Already Enabled</h3>
//                       <p className="text-green-600 mt-2">This driver is eligible to receive payouts</p>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setCurrentStep(4);
//                         fetchReadyBookings();
//                       }}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                       Continue to Step 4 →
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-center">
//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
//                       <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
//                       <h3 className="text-xl font-bold text-yellow-700">Payout Not Enabled</h3>
//                       <p className="text-yellow-600 mt-2">Enable payout eligibility for this driver</p>
//                     </div>
//                     <button
//                       onClick={handleEnablePayout}
//                       disabled={updating}
//                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                     >
//                       {updating ? "Enabling..." : "Enable Payout Eligibility"}
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setCurrentStep(2)}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//                 >
//                   ← Back
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 4: Process Payment */}
//           {currentStep === 4 && selectedDriver && (
//             <div className="space-y-4">
//               <StepCard
//                 step={4}
//                 title="Process Payout"
//                 description="Review and process ready payouts for the driver"
//                 icon={BanknotesIcon}
//                 isActive={true}
//               />

//               <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
//                 <div className="p-4 bg-gray-50 border-b">
//                   <h3 className="font-semibold text-gray-900">Ready Payouts for {selectedDriver.profile?.full_name}</h3>
//                 </div>
//                 {loading ? (
//                   <div className="p-8 text-center">
//                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     <p className="text-gray-500 mt-2">Loading bookings...</p>
//                   </div>
//                 ) : readyBookings.length === 0 ? (
//                   <div className="p-8 text-center">
//                     <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-500">No pending payouts for this driver</p>
//                     <p className="text-sm text-gray-400 mt-1">All payouts have been processed</p>
//                     <button
//                       onClick={() => setCurrentStep(1)}
//                       className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                       Start Over with Another Driver
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="divide-y">
//                     {readyBookings.map((booking) => (
//                       <div key={booking.booking_id} className="p-4 hover:bg-gray-50 transition">
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-2">
//                               <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
//                                 Ready for Payout
//                               </span>
//                               <span className="text-xs text-gray-500 font-mono">
//                                 {booking.booking_id.substring(0, 13)}...
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-600">
//                               Passenger: {booking.passenger_name || "N/A"}
//                             </p>
//                             <div className="mt-2 flex gap-4">
//                               <div>
//                                 <p className="text-xs text-gray-400">Fare Amount</p>
//                                 <p className="font-medium text-gray-900">₹{booking.fare_amount?.toFixed(2)}</p>
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-400">Commission ({booking.commission_percent_snapshot}%)</p>
//                                 <p className="font-medium text-red-600">-₹{booking.commission_amount?.toFixed(2)}</p>
//                               </div>
//                               <div>
//                                 <p className="text-xs text-gray-400">Driver Payout</p>
//                                 <p className="font-bold text-green-600 text-lg">₹{booking.driver_payout_amount?.toFixed(2)}</p>
//                               </div>
//                             </div>
//                           </div>
//                           <button
//                             onClick={() => handleProcessPayout(booking.booking_id)}
//                             disabled={processingBooking === booking.booking_id}
//                             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
//                           >
//                             {processingBooking === booking.booking_id ? (
//                               <>
//                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                 Processing...
//                               </>
//                             ) : (
//                               <>
//                                 <BanknotesIcon className="w-4 h-4" />
//                                 Pay Now
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => setCurrentStep(3)}
//                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//                 >
//                   ← Back
//                 </button>
//                 <button
//                   onClick={() => {
//                     setCurrentStep(1);
//                     setSelectedDriver(null);
//                     setDriverDetails(null);
//                     setReadyBookings([]);
//                   }}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Process Another Driver →
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Bank Details Modal */}
//       {showBankModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Add Bank Details</h3>
//               <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
//                 <input
//                   type="text"
//                   placeholder="Enter full name"
//                   value={bankDetails.account_holder_name}
//                   onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
//                 <input
//                   type="text"
//                   placeholder="Enter account number"
//                   value={bankDetails.bank_account_number}
//                   onChange={(e) => setBankDetails({ ...bankDetails, bank_account_number: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
//                 <input
//                   type="text"
//                   placeholder="Enter IFSC code (e.g., SBIN0001234)"
//                   value={bankDetails.ifsc_code}
//                   onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                 <input
//                   type="tel"
//                   placeholder="Enter 10-digit mobile number"
//                   value={bankDetails.phone_number}
//                   onChange={(e) => setBankDetails({ ...bankDetails, phone_number: e.target.value })}
//                   className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="flex gap-3 pt-4">
//                 <button
//                   onClick={handleSaveBankDetails}
//                   disabled={updating}
//                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   {updating ? "Saving..." : "Save Details"}
//                 </button>
//                 <button
//                   onClick={() => setShowBankModal(false)}
//                   className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//                 >
//                   Cancel
//                 </button>
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
//               <p className="text-xs text-gray-500 mt-1">Current commission: {settings?.commission_percent || 0}%</p>
//             </div>
//             <div className="flex gap-3 pt-4">
//               <button
//                 onClick={handleUpdateSettings}
//                 disabled={updating}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 {updating ? "Saving..." : "Save Changes"}
//               </button>
//               <button
//                 onClick={() => setShowSettingsModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
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
  EyeIcon
} from "@heroicons/react/24/outline";

const API_BASE_URL = "https://be.shuttleapp.transev.site/admin/payouts";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// API Calls
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

const getDrivers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/drivers?${params}` : `${API_BASE_URL}/drivers`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch drivers");
  return response.json();
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

const updateDriverEligibility = async (driverUserId, isPayoutEligible) => {
  const response = await fetch(`${API_BASE_URL}/drivers/${driverUserId}/eligibility`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_payout_eligible: isPayoutEligible }),
  });
  if (!response.ok) throw new Error("Failed to update eligibility");
  return response.json();
};

const getPayoutBookings = async (driverUserId) => {
  const response = await fetch(`${API_BASE_URL}/bookings?driver_user_id=${driverUserId}&transfer_status=ready`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch bookings");
  return response.json();
};

const triggerSinglePayout = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/trigger`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ require_completed: true }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  return response.json();
};

const PayoutService = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerAccount, setProviderAccount] = useState(null);
  const [commissionPercent, setCommissionPercent] = useState("");
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: "",
    bank_account_number: "",
    ifsc_code: "",
    phone_number: "",
  });
  const [readyBookings, setReadyBookings] = useState([]);
  const [processingBooking, setProcessingBooking] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [settingsData, driversData] = await Promise.all([
        getPayoutSettings(),
        getDrivers(),
      ]);
      setSettings(settingsData);
      setCommissionPercent(settingsData.commission_percent?.toString() || "0");
      setDrivers(driversData.items || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to load initial data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = async (driver) => {
    setSelectedDriver(driver);
    setCurrentStep(2);
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const details = await getDriverDetails(driver.user_id);
      setDriverDetails(details);
      setBankDetails({
        account_holder_name: details.payout_details?.account_holder_name || "",
        bank_account_number: details.payout_details?.bank_account_number || "",
        ifsc_code: details.payout_details?.ifsc_code || "",
        phone_number: details.payout_details?.phone_number || "",
      });
    } catch (error) {
      console.error("Error fetching driver details:", error);
      setErrorMessage("Failed to load driver details");
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

  const handleCreateLinkedAccount = async () => {
    setUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await createLinkedAccount(selectedDriver.user_id);
      const updated = await getDriverDetails(selectedDriver.user_id);
      setDriverDetails(updated);
      setSuccessMessage("✅ Linked account created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error creating linked account:", error);

      if (error.detail?.error === "driver_payout_details_required") {
        setErrorMessage("Please save bank details first before creating linked account.");
      } else if (error.detail?.error === "razorpay_route_request_failed") {
        setErrorMessage(
          "Razorpay account creation failed. Please verify:\n" +
          "• Account holder name matches bank records\n" +
          "• Bank account number is valid\n" +
          "• IFSC code is correct\n" +
          "• Phone number is registered with the bank"
        );
      } else {
        setErrorMessage(error.detail?.message || "Failed to create linked account. Please verify bank details.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSyncLinkedAccount = async () => {
    setUpdating(true);
    setErrorMessage(null);
    try {
      const result = await syncLinkedAccount(selectedDriver.user_id);
      const updated = await getDriverDetails(selectedDriver.user_id);
      setDriverDetails(updated);
      setSuccessMessage("✅ Linked account synced successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error syncing linked account:", error);
      setErrorMessage("Failed to sync linked account. Please try again.");
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
      setCurrentStep(3);
      fetchReadyBookings();
    } catch (error) {
      console.error("Error enabling payout:", error);
      setErrorMessage("Failed to enable payout eligibility.");
    } finally {
      setUpdating(false);
    }
  };

  const fetchReadyBookings = async () => {
    setLoading(true);
    try {
      const data = await getPayoutBookings(selectedDriver.user_id);
      setReadyBookings(data.items || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (bookingId) => {
    setProcessingBooking(bookingId);
    setErrorMessage(null);
    try {
      const result = await triggerSinglePayout(bookingId);
      if (result.result?.booking_transfer_status === "transferred") {
        setSuccessMessage("✅ Payout processed successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      fetchReadyBookings();
    } catch (error) {
      console.error("Error processing payout:", error);
      const errorMsg = error.detail?.error || error.detail?.message || "Failed to process payout";

      if (error.detail?.error === "booking_not_completed") {
        setErrorMessage("Booking is not completed yet. Cannot process payout.");
      } else if (error.detail?.error === "driver_not_payout_eligible") {
        setErrorMessage("Driver is not payout eligible. Please enable eligibility first.");
      } else if (error.detail?.error === "linked_account_not_active") {
        setErrorMessage("Linked account is not active. Please check the account status.");
      } else {
        setErrorMessage(errorMsg);
      }
    } finally {
      setProcessingBooking(null);
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

  const getLinkedAccountStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      case 'deleted': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const StepIndicator = ({ number, title, status, current }) => (
    <div className="flex items-center">
      <div className={`flex flex-col items-center ${current === number ? "opacity-100" : "opacity-50"}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${status === "completed" ? "bg-green-500 text-white" :
            current === number ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
          }`}>
          {status === "completed" ? "✓" : number}
        </div>
        <p className="text-xs mt-2 text-center font-medium">{title}</p>
      </div>
      {number < 4 && <div className="w-16 h-0.5 bg-gray-300 mx-2" />}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <div className="p-6 overflow-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm whitespace-pre-line">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BanknotesIcon className="w-8 h-8 text-green-600" />
                Driver Payout Management
              </h1>
              <p className="text-gray-500 mt-1">Follow the steps below to process driver payouts</p>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Commission: {settings?.commission_percent || 0}%
            </button>
          </div>

          {/* Step Progress Indicator */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              <StepIndicator number={1} title="Select Driver" status={currentStep > 1 ? "completed" : "pending"} current={currentStep} />
              <StepIndicator number={2} title="Setup Account" status={currentStep > 2 ? "completed" : "pending"} current={currentStep} />
              <StepIndicator number={3} title="Enable Payout" status={currentStep > 3 ? "completed" : "pending"} current={currentStep} />
              <StepIndicator number={4} title="Process Payment" status={currentStep > 4 ? "completed" : "pending"} current={currentStep} />
            </div>
          </div>

          {/* Rest of your component remains the same... */}
          {/* Step 1: Select Driver */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Select a Driver</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a driver from the list to start the payout setup process</p>
              </div>
              <div className="divide-y">
                {drivers.map((driver) => (
                  <div key={driver.user_id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{driver.profile?.full_name || "Unknown"}</p>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                      {driver.vehicle && (
                        <p className="text-xs text-gray-400">{driver.vehicle.registration_number}</p>
                      )}
                      {driver.payout_details?.linked_account_status && (
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getLinkedAccountStatusColor(driver.payout_details.linked_account_status)}`}>
                          {driver.payout_details.linked_account_status}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelectDriver(driver)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Select Driver →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Setup Account */}
          {currentStep === 2 && selectedDriver && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Selected Driver:</strong> {selectedDriver.profile?.full_name} ({selectedDriver.email})
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Step 2.1: Bank Account Details</h3>
                  <p className="text-xs text-gray-500 mt-1">Required for Razorpay account creation</p>
                </div>
                <div className="p-4">
                  {driverDetails?.payout_details?.bank_account_number ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-medium">Bank details saved</span>
                          </div>
                          <p className="text-sm text-green-600">
                            Account: {driverDetails.payout_details.account_holder_name}<br />
                            Bank: ****{driverDetails.payout_details.bank_account_number?.slice(-4)}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowBankModal(true)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-yellow-700 mb-2">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        <span className="font-medium">Bank details missing</span>
                      </div>
                      <p className="text-sm text-yellow-600 mb-3">Please add driver's bank account information</p>
                      <button
                        onClick={() => setShowBankModal(true)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        Add Bank Details
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Step 2.2: Razorpay Linked Account</h3>
                  <p className="text-xs text-gray-500 mt-1">Creates a Razorpay account for automatic payouts</p>
                </div>
                <div className="p-4">
                  {driverDetails?.payout_details?.razorpay_linked_account_id ? (
                    <div>
                      <div className={`rounded-lg p-4 mb-4 border ${getLinkedAccountStatusColor(driverDetails.payout_details.linked_account_status)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircleIcon className="w-5 h-5" />
                              <span className="font-medium">Linked Account Created</span>
                            </div>
                            <p className="text-sm font-mono">
                              ID: {driverDetails.payout_details.razorpay_linked_account_id}
                            </p>
                            <p className="text-xs mt-1">
                              Status: {driverDetails.payout_details.linked_account_status}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSyncLinkedAccount}
                              disabled={updating}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              <ArrowPathIcon className="w-4 h-4 inline mr-1" />
                              Sync
                            </button>
                            <button
                              onClick={handleViewProviderAccount}
                              className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              <EyeIcon className="w-4 h-4 inline mr-1" />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <ExclamationTriangleIcon className="w-5 h-5" />
                          <span className="font-medium">Linked account not created</span>
                        </div>
                      </div>
                      <button
                        onClick={handleCreateLinkedAccount}
                        disabled={!driverDetails?.payout_details?.bank_account_number || updating}
                        className={`px-4 py-2 rounded-lg transition ${driverDetails?.payout_details?.bank_account_number
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {updating ? "Creating..." : "Create Linked Account"}
                      </button>
                      {!driverDetails?.payout_details?.bank_account_number && (
                        <p className="text-xs text-red-500 mt-2">⚠️ Add bank details first</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ← Back
                </button>
                {driverDetails?.payout_details?.razorpay_linked_account_id && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Continue to Step 3 →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Enable Payout */}
          {currentStep === 3 && selectedDriver && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                {driverDetails?.payout_details?.is_payout_eligible ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-700">Payout Already Enabled</h3>
                      <p className="text-green-600 mt-2">This driver is eligible to receive payouts</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentStep(4);
                        fetchReadyBookings();
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Continue to Step 4 →
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                      <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-yellow-700">Payout Not Enabled</h3>
                      <p className="text-yellow-600 mt-2">Enable payout eligibility for this driver</p>
                    </div>
                    <button
                      onClick={handleEnablePayout}
                      disabled={updating}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {updating ? "Enabling..." : "Enable Payout Eligibility"}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Process Payment */}
          {currentStep === 4 && selectedDriver && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-semibold text-gray-900">Ready Payouts for {selectedDriver.profile?.full_name}</h3>
                </div>
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 mt-2">Loading bookings...</p>
                  </div>
                ) : readyBookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No pending payouts for this driver</p>
                    <p className="text-sm text-gray-400 mt-1">All payouts have been processed</p>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Over with Another Driver
                    </button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {readyBookings.map((booking) => (
                      <div key={booking.booking_id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Ready for Payout
                              </span>
                              <span className="text-xs text-gray-500 font-mono">
                                {booking.booking_id.substring(0, 13)}...
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Passenger: {booking.passenger_name || "N/A"}
                            </p>
                            <div className="mt-2 flex gap-4">
                              <div>
                                <p className="text-xs text-gray-400">Fare Amount</p>
                                <p className="font-medium text-gray-900">₹{booking.fare_amount?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Commission ({booking.commission_percent_snapshot}%)</p>
                                <p className="font-medium text-red-600">-₹{booking.commission_amount?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Driver Payout</p>
                                <p className="font-bold text-green-600 text-lg">₹{booking.driver_payout_amount?.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleProcessPayout(booking.booking_id)}
                            disabled={processingBooking === booking.booking_id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                          >
                            {processingBooking === booking.booking_id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <BanknotesIcon className="w-4 h-4" />
                                Pay Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedDriver(null);
                    setDriverDetails(null);
                    setReadyBookings([]);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Process Another Driver →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details Modal */}
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
                  placeholder="Enter full name as per bank records"
                  value={bankDetails.account_holder_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number *</label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={bankDetails.bank_account_number}
                  onChange={(e) => setBankDetails({ ...bankDetails, bank_account_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  placeholder="Enter IFSC code (e.g., SBIN0001234)"
                  value={bankDetails.ifsc_code}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={bankDetails.phone_number}
                  onChange={(e) => setBankDetails({ ...bankDetails, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveBankDetails}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {updating ? "Saving..." : "Save Details"}
                </button>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
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
              <p className="text-xs text-gray-500 mt-1">Current commission: {settings?.commission_percent || 0}%</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUpdateSettings}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Account Modal */}
      {showProviderModal && providerAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-0 max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                  Razorpay Account Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">Driver payout account information</p>
              </div>
              <button
                onClick={() => setShowProviderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-auto flex-1">
              {(() => {
                const account = providerAccount.provider_account;

                // Status badge component
                const StatusBadge = ({ status }) => {
                  const statusConfig = {
                    'created': { color: 'bg-blue-100 text-blue-800', label: 'Created' },
                    'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
                    'blocked': { color: 'bg-red-100 text-red-800', label: 'Blocked' },
                    'deleted': { color: 'bg-gray-100 text-gray-800', label: 'Deleted' },
                    'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
                    'verified': { color: 'bg-green-100 text-green-800', label: 'Verified' }
                  };
                  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  );
                };

                return (
                  <div className="space-y-6">
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Account Status</p>
                        <div className="mt-1">
                          <StatusBadge status={account?.status} />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Account Type</p>
                        <p className="text-lg font-bold text-purple-900 mt-1 capitalize">{account?.type || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Driver Information</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-gray-400">Driver User ID</p>
                          <p className="text-sm font-mono text-gray-700 break-all bg-gray-50 p-2 rounded mt-1">
                            {providerAccount.driver_user_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Linked Account ID</p>
                          <p className="text-sm font-mono text-gray-700 break-all bg-gray-50 p-2 rounded mt-1">
                            {providerAccount.razorpay_linked_account_id}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Details</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Legal Business Name</p>
                            <p className="font-medium text-gray-900 mt-1">{account?.legal_business_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Business Type</p>
                            <p className="font-medium text-gray-900 mt-1 capitalize">
                              {account?.business_type?.replace(/_/g, ' ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Customer Facing Name</p>
                          <p className="font-medium text-gray-900 mt-1">{account?.customer_facing_business_name || 'N/A'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Category</p>
                            <p className="text-gray-900 mt-1 capitalize">{account?.profile?.category || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Subcategory</p>
                            <p className="text-gray-900 mt-1 capitalize">{account?.profile?.subcategory || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Information</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-gray-400">Contact Person</p>
                          <p className="font-medium text-gray-900 mt-1">{account?.contact_name || 'N/A'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Email Address</p>
                            <p className="text-sm text-gray-700 break-all mt-1">{account?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Phone Number</p>
                            <p className="text-sm text-gray-700 mt-1">{account?.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registered Address */}
                    {account?.profile?.addresses?.registered && (
                      <div className="border rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registered Address</p>
                        </div>
                        <div className="p-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                              {account.profile.addresses.registered.street1}
                              {account.profile.addresses.registered.street2 && `, ${account.profile.addresses.registered.street2}`}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {account.profile.addresses.registered.city}, {account.profile.addresses.registered.state}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              PIN: {account.profile.addresses.registered.postal_code}
                            </p>
                            <p className="text-sm text-gray-700 mt-1 capitalize">
                              Country: {account.profile.addresses.registered.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Creation Info */}
                    {account?.created_at && (
                      <div className="border rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Creation</p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm text-gray-700">
                              Created on {new Date(account.created_at * 1000).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })} at {new Date(account.created_at * 1000).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Raw Data Toggle */}
                    <details className="border rounded-xl overflow-hidden">
                      <summary className="bg-gray-50 px-4 py-2 cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-wide hover:bg-gray-100 transition-colors">
                        Technical Details (Raw Response)
                      </summary>
                      <div className="p-4 bg-gray-50">
                        <pre className="text-xs overflow-auto bg-white p-3 rounded border max-h-64">
                          {JSON.stringify(account, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowProviderModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutService;