// import React, { useState, useEffect } from "react";
// import Sidebar from "../../assets/components/sidebar/Sidebar";
// import TopNavbar from "../../assets/components/navbar/TopNavbar";
// import {
//   BanknotesIcon,
//   CalendarIcon,
//   UserIcon,
//   MapPinIcon,
//   EyeIcon,
//   ArrowPathIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   XMarkIcon,
//   TruckIcon,
//   CurrencyRupeeIcon,
//   DocumentTextIcon,
//   ClockIcon,
//   CreditCardIcon,
//   ChevronRightIcon,
//   MagnifyingGlassIcon,
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

// // Get all drivers with payout profiles
// const getDrivers = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const url = params ? `${API_BASE_URL}/payouts/drivers?${params}` : `${API_BASE_URL}/payouts/drivers`;
//   console.log("Fetching drivers from:", url);
//   const response = await fetch(url, { headers: getAuthHeaders() });
//   if (!response.ok) throw new Error("Failed to fetch drivers");
//   const data = await response.json();
//   console.log("Drivers API response:", data);
//   return data;
// };

// // Get payout bookings with filters
// const getPayoutBookings = async (filters = {}) => {
//   const params = new URLSearchParams(filters).toString();
//   const url = params ? `${API_BASE_URL}/payouts/bookings?${params}` : `${API_BASE_URL}/payouts/bookings`;
//   console.log("Fetching bookings from:", url);
//   const response = await fetch(url, { 
//     headers: getAuthHeaders(),
//     cache: 'no-cache'
//   });
//   if (!response.ok) throw new Error("Failed to fetch bookings");
//   const data = await response.json();
//   console.log("Bookings API response:", data);
//   return data;
// };

// // Get booking details
// const getBookingDetails = async (bookingId) => {
//   const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}`, {
//     headers: getAuthHeaders()
//   });
//   if (!response.ok) throw new Error("Failed to fetch booking details");
//   return response.json();
// };

// // Get trip passengers
// const getTripPassengers = async (tripId) => {
//   const response = await fetch(`${API_BASE_URL}/${tripId}/passengers`, {
//     headers: getAuthHeaders()
//   });
//   if (!response.ok) throw new Error("Failed to fetch trip passengers");
//   return response.json();
// };

// // Get route details by route ID
// const getRouteDetails = async (routeId) => {
//   const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
//     headers: getAuthHeaders()
//   });
//   if (!response.ok) throw new Error("Failed to fetch route details");
//   return response.json();
// };

// // ============= HELPER FUNCTIONS =============

// const getTransferStatusColor = (status) => {
//   switch (status?.toLowerCase()) {
//     case 'transferred':
//     case 'processed':
//       return 'bg-green-100 text-green-800';
//     case 'ready':
//       return 'bg-yellow-100 text-yellow-800';
//     case 'failed':
//       return 'bg-red-100 text-red-800';
//     case 'withheld':
//       return 'bg-orange-100 text-orange-800';
//     case 'reversed':
//       return 'bg-gray-100 text-gray-800';
//     default:
//       return 'bg-gray-100 text-gray-800';
//   }
// };

// const getTransferStatusText = (status) => {
//   switch (status?.toLowerCase()) {
//     case 'transferred':
//     case 'processed':
//       return 'Paid';
//     case 'ready':
//       return 'Ready';
//     case 'failed':
//       return 'Failed';
//     case 'withheld':
//       return 'Withheld';
//     case 'reversed':
//       return 'Reversed';
//     default:
//       return status || 'Pending';
//   }
// };

// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// const formatCurrency = (amount) => {
//   if (!amount) return '₹0';
//   return `₹${parseFloat(amount).toFixed(2)}`;
// };

// // ============= MAIN COMPONENT =============

// const DriverPayments = () => {
//   // State
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
  
//   // Data State
//   const [drivers, setDrivers] = useState([]);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [driverBookings, setDriverBookings] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
  
//   // Driver Summary Data
//   const [driverSummaries, setDriverSummaries] = useState([]);
  
//   // Filter State for Driver Details
//   const [detailFilters, setDetailFilters] = useState({
//     dateRange: 'all',
//     customMonth: new Date().getMonth() + 1,
//     customYear: new Date().getFullYear(),
//     startDate: '',
//     endDate: ''
//   });
  
//   // Modal State
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [tripPassengers, setTripPassengers] = useState(null);
//   const [routeDetails, setRouteDetails] = useState(null);
  
//   // Search State
//   const [searchTerm, setSearchTerm] = useState('');

//   // Fetch all data
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       // Fetch drivers
//       const driversData = await getDrivers();
//       let driversList = [];
      
//       if (driversData.items && Array.isArray(driversData.items)) {
//         driversList = driversData.items;
//       } else if (Array.isArray(driversData)) {
//         driversList = driversData;
//       } else if (driversData.drivers && Array.isArray(driversData.drivers)) {
//         driversList = driversData.drivers;
//       }
      
//       console.log("Drivers list:", driversList);
//       setDrivers(driversList);
      
//       // Fetch bookings
//       const bookingsData = await getPayoutBookings();
//       let bookingsList = [];
      
//       if (bookingsData.items && Array.isArray(bookingsData.items)) {
//         bookingsList = bookingsData.items;
//       } else if (Array.isArray(bookingsData)) {
//         bookingsList = bookingsData;
//       }
      
//       console.log("Bookings list:", bookingsList);
//       setAllBookings(bookingsList);
      
//       // Calculate summaries
//       const summaries = calculateDriverSummaries(bookingsList, driversList);
//       console.log("Driver summaries:", summaries);
//       setDriverSummaries(summaries);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setErrorMessage(`Failed to load data: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setLoading(true);
//     setErrorMessage(null);
//     try {
//       const driversData = await getDrivers();
//       let driversList = [];
      
//       if (driversData.items && Array.isArray(driversData.items)) {
//         driversList = driversData.items;
//       } else if (Array.isArray(driversData)) {
//         driversList = driversData;
//       } else if (driversData.drivers && Array.isArray(driversData.drivers)) {
//         driversList = driversData.drivers;
//       }
      
//       setDrivers(driversList);
      
//       const bookingsData = await getPayoutBookings();
//       let bookingsList = [];
      
//       if (bookingsData.items && Array.isArray(bookingsData.items)) {
//         bookingsList = bookingsData.items;
//       } else if (Array.isArray(bookingsData)) {
//         bookingsList = bookingsData;
//       }
      
//       setAllBookings(bookingsList);
      
//       const summaries = calculateDriverSummaries(bookingsList, driversList);
//       setDriverSummaries(summaries);
      
//       setSuccessMessage("Data refreshed successfully!");
//       setTimeout(() => setSuccessMessage(null), 3000);
//     } catch (error) {
//       console.error("Error refreshing data:", error);
//       setErrorMessage(`Failed to refresh data: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateDriverSummaries = (bookings, driversList) => {
//     const driverMap = new Map();
    
//     // Initialize with all drivers
//     driversList.forEach(driver => {
//       const driverId = driver.user_id || driver.id;
//       if (!driverId) return;
      
//       driverMap.set(driverId, {
//         driver_id: driverId,
//         driver_name: driver.profile?.full_name || driver.profile?.name || driver.name || 'Unknown Driver',
//         driver_email: driver.email || 'N/A',
//         driver_phone: driver.profile?.phone || '',
//         vehicle_number: driver.vehicle?.registration_number || driver.vehicle?.reg_no || 'N/A',
//         total_bookings: 0,
//         total_gross_amount: 0,
//         total_commission: 0,
//         total_driver_payout: 0,
//         total_deductions: 0,
//         total_net_payout: 0,
//         completed_count: 0,
//         pending_count: 0,
//         failed_count: 0,
//         bookings: []
//       });
//     });
    
//     // Aggregate bookings
//     bookings.forEach(booking => {
//       const driverId = booking.driver_user_id;
//       if (driverMap.has(driverId)) {
//         const summary = driverMap.get(driverId);
//         summary.total_bookings++;
//         summary.total_gross_amount += parseFloat(booking.fare_amount || 0);
//         summary.total_commission += parseFloat(booking.commission_amount || 0);
//         summary.total_driver_payout += parseFloat(booking.driver_payout_amount || 0);
//         summary.total_deductions += parseFloat(booking.applied_adjustment_amount || 0);
//         summary.total_net_payout += parseFloat(booking.net_payout_amount || 0);
        
//         const status = (booking.transfer_status || '').toLowerCase();
//         if (status === 'processed' || status === 'transferred') {
//           summary.completed_count++;
//         } else if (status === 'failed') {
//           summary.failed_count++;
//         } else {
//           summary.pending_count++;
//         }
        
//         summary.bookings.push(booking);
//       } else {
//         console.warn(`Booking with driver_id ${driverId} not found in drivers list`);
//       }
//     });
    
//     // Filter out drivers with zero bookings if you want
//     const result = Array.from(driverMap.values());
//     console.log(`Total drivers: ${result.length}, Drivers with bookings: ${result.filter(d => d.total_bookings > 0).length}`);
//     return result;
//   };

//   const handleDriverClick = (driver) => {
//     setSelectedDriver(driver);
//     const driverBookingsList = allBookings.filter(b => b.driver_user_id === driver.driver_id);
//     setDriverBookings(driverBookingsList);
//     setShowDetailsModal(true);
//   };

//   const getFilteredDriverBookings = () => {
//     let filtered = [...driverBookings];
    
//     switch (detailFilters.dateRange) {
//       case 'today':
//         const today = new Date().toDateString();
//         filtered = filtered.filter(b => {
//           if (!b.completed_at) return false;
//           return new Date(b.completed_at).toDateString() === today;
//         });
//         break;
//       case 'week':
//         const weekAgo = new Date();
//         weekAgo.setDate(weekAgo.getDate() - 7);
//         filtered = filtered.filter(b => {
//           if (!b.completed_at) return false;
//           return new Date(b.completed_at) >= weekAgo;
//         });
//         break;
//       case 'month':
//         const monthAgo = new Date();
//         monthAgo.setMonth(monthAgo.getMonth() - 1);
//         filtered = filtered.filter(b => {
//           if (!b.completed_at) return false;
//           return new Date(b.completed_at) >= monthAgo;
//         });
//         break;
//       case 'year':
//         const yearAgo = new Date();
//         yearAgo.setFullYear(yearAgo.getFullYear() - 1);
//         filtered = filtered.filter(b => {
//           if (!b.completed_at) return false;
//           return new Date(b.completed_at) >= yearAgo;
//         });
//         break;
//       case 'custom':
//         if (detailFilters.customMonth && detailFilters.customYear) {
//           filtered = filtered.filter(b => {
//             if (!b.completed_at) return false;
//             const date = new Date(b.completed_at);
//             return date.getMonth() + 1 === detailFilters.customMonth && 
//                    date.getFullYear() === detailFilters.customYear;
//           });
//         }
//         break;
//       default:
//         break;
//     }
    
//     return filtered;
//   };

//   const handleViewBookingDetails = async (booking) => {
//     setLoading(true);
//     setSelectedBooking(booking);
//     try {
//       const details = await getBookingDetails(booking.booking_id);
//       setBookingDetails(details);
      
//       if (booking.scheduled_trip_id) {
//         try {
//           const passengers = await getTripPassengers(booking.scheduled_trip_id);
//           setTripPassengers(passengers);
//         } catch (err) {
//           console.error("Error fetching trip passengers:", err);
//         }
//       }
      
//       if (booking.route_id) {
//         try {
//           const route = await getRouteDetails(booking.route_id);
//           setRouteDetails(route);
//         } catch (err) {
//           console.error("Error fetching route details:", err);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching booking details:", error);
//       setErrorMessage("Failed to load booking details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFilteredDrivers = () => {
//     if (!searchTerm) return driverSummaries;
//     return driverSummaries.filter(driver => 
//       driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       driver.driver_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       driver.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   };

//   const renderDriverCards = () => {
//     const filteredDrivers = getFilteredDrivers();
    
//     if (filteredDrivers.length === 0 && !loading) {
//       return (
//         <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
//           <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500">No drivers found</p>
//           <p className="text-sm text-gray-400 mt-2">Try refreshing or check your connection</p>
//           <button
//             onClick={handleRefresh}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Refresh Data
//           </button>
//         </div>
//       );
//     }
    
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredDrivers.map((driver, index) => (
//           <div
//             key={driver.driver_id || index}
//             onClick={() => handleDriverClick(driver)}
//             className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
//           >
//             <div className="p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                     {driver.driver_name?.charAt(0)?.toUpperCase() || 'D'}
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                       {driver.driver_name}
//                     </h3>
//                     <p className="text-xs text-gray-500">{driver.driver_email}</p>
//                   </div>
//                 </div>
//                 <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
//               </div>
              
//               <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <TruckIcon className="w-4 h-4" />
//                   <span>{driver.vehicle_number}</span>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <div className="text-center p-2 bg-blue-50 rounded-lg">
//                   <p className="text-xs text-gray-500 mb-1">Total Trips</p>
//                   <p className="text-xl font-bold text-blue-600">{driver.total_bookings}</p>
//                 </div>
//                 <div className="text-center p-2 bg-green-50 rounded-lg">
//                   <p className="text-xs text-gray-500 mb-1">Total Earned</p>
//                   <p className="text-xl font-bold text-green-600">{formatCurrency(driver.total_net_payout)}</p>
//                 </div>
//               </div>
              
//               <div className="flex gap-2 flex-wrap">
//                 {driver.completed_count > 0 && (
//                   <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
//                     {driver.completed_count} Paid
//                   </span>
//                 )}
//                 {driver.pending_count > 0 && (
//                   <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
//                     {driver.pending_count} Pending
//                   </span>
//                 )}
//                 {driver.failed_count > 0 && (
//                   <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
//                     {driver.failed_count} Failed
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderDriverDetailsModal = () => {
//     if (!showDetailsModal || !selectedDriver) return null;
    
//     const filteredBookings = getFilteredDriverBookings();
//     const driverStats = {
//       totalGross: filteredBookings.reduce((sum, b) => sum + parseFloat(b.fare_amount || 0), 0),
//       totalCommission: filteredBookings.reduce((sum, b) => sum + parseFloat(b.commission_amount || 0), 0),
//       totalDeductions: filteredBookings.reduce((sum, b) => sum + parseFloat(b.applied_adjustment_amount || 0), 0),
//       totalNet: filteredBookings.reduce((sum, b) => sum + parseFloat(b.net_payout_amount || 0), 0)
//     };
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//           <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-gray-50 to-white sticky top-0 bg-white z-10">
//             <div>
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                   {selectedDriver.driver_name?.charAt(0)?.toUpperCase() || 'D'}
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">{selectedDriver.driver_name}</h3>
//                   <p className="text-sm text-gray-500">{selectedDriver.driver_email}</p>
//                   <p className="text-xs text-gray-400 mt-1">Vehicle: {selectedDriver.vehicle_number}</p>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 setShowDetailsModal(false);
//                 setSelectedDriver(null);
//                 setDriverBookings([]);
//                 setDetailFilters({
//                   dateRange: 'all',
//                   customMonth: new Date().getMonth() + 1,
//                   customYear: new Date().getFullYear(),
//                   startDate: '',
//                   endDate: ''
//                 });
//               }}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <XMarkIcon className="w-6 h-6" />
//             </button>
//           </div>
          
//           <div className="flex-1 overflow-auto p-6">
//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <div className="flex flex-wrap gap-4 items-end">
//                 <div className="flex-1 min-w-[150px]">
//                   <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
//                   <select
//                     value={detailFilters.dateRange}
//                     onChange={(e) => setDetailFilters({ ...detailFilters, dateRange: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
//                   >
//                     <option value="all">All Time</option>
//                     <option value="today">Today</option>
//                     <option value="week">Last 7 Days</option>
//                     <option value="month">Last 30 Days</option>
//                     <option value="year">Last Year</option>
//                     <option value="custom">Custom Month/Year</option>
//                   </select>
//                 </div>
                
//                 {detailFilters.dateRange === 'custom' && (
//                   <>
//                     <div className="w-32">
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
//                       <select
//                         value={detailFilters.customMonth}
//                         onChange={(e) => setDetailFilters({ ...detailFilters, customMonth: parseInt(e.target.value) })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
//                       >
//                         {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
//                           <option key={m} value={m}>
//                             {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="w-24">
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
//                       <select
//                         value={detailFilters.customYear}
//                         onChange={(e) => setDetailFilters({ ...detailFilters, customYear: parseInt(e.target.value) })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
//                       >
//                         {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
//                           <option key={y} value={y}>{y}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </>
//                 )}
                
//                 <div>
//                   <button
//                     onClick={() => setDetailFilters({
//                       dateRange: 'all',
//                       customMonth: new Date().getMonth() + 1,
//                       customYear: new Date().getFullYear(),
//                       startDate: '',
//                       endDate: ''
//                     })}
//                     className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//               <div className="bg-blue-50 rounded-lg p-4 text-center">
//                 <p className="text-xs text-gray-500 mb-1">Total Trips</p>
//                 <p className="text-2xl font-bold text-blue-600">{filteredBookings.length}</p>
//               </div>
//               <div className="bg-green-50 rounded-lg p-4 text-center">
//                 <p className="text-xs text-gray-500 mb-1">Gross Amount</p>
//                 <p className="text-lg font-bold text-green-600">{formatCurrency(driverStats.totalGross)}</p>
//               </div>
//               <div className="bg-orange-50 rounded-lg p-4 text-center">
//                 <p className="text-xs text-gray-500 mb-1">Commission</p>
//                 <p className="text-lg font-bold text-orange-600">{formatCurrency(driverStats.totalCommission)}</p>
//               </div>
//               <div className="bg-purple-50 rounded-lg p-4 text-center">
//                 <p className="text-xs text-gray-500 mb-1">Net Payout</p>
//                 <p className="text-2xl font-bold text-purple-600">{formatCurrency(driverStats.totalNet)}</p>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Details</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route & Stops</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amounts</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredBookings.length === 0 ? (
//                       <tr>
//                         <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
//                           No bookings found for this period
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredBookings.map((booking) => (
//                         <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
//                           <td className="px-6 py-4">
//                             <div className="text-sm font-medium text-gray-900">
//                               {booking.passenger_name || 'N/A'}
//                             </div>
//                             <div className="text-xs text-gray-500 font-mono mt-1">
//                               ID: {booking.booking_id?.substring(0, 8)}...
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="text-sm text-gray-900">
//                               {booking.route_name || 'Route info not available'}
//                             </div>
//                             {booking.pickup_stop_name && booking.dropoff_stop_name && (
//                               <div className="text-xs text-gray-500 mt-1">
//                                 {booking.pickup_stop_name} → {booking.dropoff_stop_name}
//                               </div>
//                             )}
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="space-y-1">
//                               <div className="text-xs text-gray-500">Gross: {formatCurrency(booking.fare_amount)}</div>
//                               <div className="text-xs text-orange-500">Commission: {formatCurrency(booking.commission_amount)}</div>
//                               <div className="text-xs text-red-500">Deductions: {formatCurrency(booking.applied_adjustment_amount)}</div>
//                               <div className="text-sm font-bold text-green-600">Net: {formatCurrency(booking.net_payout_amount)}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <span className={`px-2 py-1 text-xs rounded-full ${getTransferStatusColor(booking.transfer_status)}`}>
//                               {getTransferStatusText(booking.transfer_status)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">
//                             {formatDate(booking.completed_at)}
//                           </td>
//                           <td className="px-6 py-4">
//                             <button
//                               onClick={() => handleViewBookingDetails(booking)}
//                               className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
//                             >
//                               <EyeIcon className="w-4 h-4" />
//                               View
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
          
//           <div className="p-4 border-t bg-gray-50 flex justify-end">
//             <button
//               onClick={() => {
//                 setShowDetailsModal(false);
//                 setSelectedDriver(null);
//                 setDriverBookings([]);
//               }}
//               className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderBookingDetailsModal = () => {
//     if (!selectedBooking) return null;
    
//     const adjustments = bookingDetails?.originated_adjustments || [];
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//           <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-gray-50 to-white">
//             <div>
//               <h3 className="text-xl font-bold text-gray-900">Booking Payment Details</h3>
//               <p className="text-sm text-gray-500 mt-1 font-mono">Booking ID: {selectedBooking.booking_id}</p>
//             </div>
//             <button
//               onClick={() => {
//                 setSelectedBooking(null);
//                 setBookingDetails(null);
//                 setTripPassengers(null);
//                 setRouteDetails(null);
//               }}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <XMarkIcon className="w-6 h-6" />
//             </button>
//           </div>
          
//           <div className="flex-1 overflow-auto p-6">
//             {routeDetails && (
//               <div className="bg-purple-50 rounded-lg p-4 mb-6">
//                 <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
//                   <MapPinIcon className="w-5 h-5 text-purple-600" />
//                   Route Information
//                 </h4>
//                 <p className="text-sm text-gray-700"><span className="font-medium">Route:</span> {routeDetails.name}</p>
//                 <p className="text-sm text-gray-700"><span className="font-medium">Code:</span> {routeDetails.code}</p>
//               </div>
//             )}
            
//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <h4 className="font-semibold text-gray-900 mb-3">Financial Breakdown</h4>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Gross Fare Amount</span>
//                   <span className="text-sm font-medium">{formatCurrency(selectedBooking.fare_amount)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Commission ({selectedBooking.commission_percent_snapshot || 0}%)</span>
//                   <span className="text-sm text-orange-600">-{formatCurrency(selectedBooking.commission_amount)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Driver Gross Payout</span>
//                   <span className="text-sm font-medium">{formatCurrency(selectedBooking.driver_payout_amount)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-sm text-gray-600">Deductions Applied</span>
//                   <span className="text-sm text-red-600">-{formatCurrency(selectedBooking.applied_adjustment_amount)}</span>
//                 </div>
//                 <div className="border-t pt-2 mt-2">
//                   <div className="flex justify-between">
//                     <span className="text-base font-semibold">Net Payout to Driver</span>
//                     <span className="text-lg font-bold text-green-600">{formatCurrency(selectedBooking.net_payout_amount)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {adjustments.length > 0 && (
//               <div className="mb-6">
//                 <h4 className="font-semibold text-gray-900 mb-3">Adjustments / Fines</h4>
//                 <div className="space-y-2">
//                   {adjustments.map((adj, idx) => (
//                     <div key={idx} className="bg-red-50 rounded-lg p-3">
//                       <div className="flex justify-between">
//                         <div>
//                           <span className={`px-2 py-0.5 text-xs rounded-full ${adj.adjustment_type === 'fine' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
//                             {adj.adjustment_type}
//                           </span>
//                           <p className="text-sm mt-1">{adj.reason_text}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-semibold text-red-600">{formatCurrency(adj.amount)}</p>
//                           <p className="text-xs text-gray-500">Status: {adj.decision_status}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {tripPassengers && tripPassengers.passengers && (
//               <div className="mb-6">
//                 <h4 className="font-semibold text-gray-900 mb-3">Trip Passengers</h4>
//                 <div className="bg-gray-50 rounded-lg overflow-hidden">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Passenger</th>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking ID</th>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {tripPassengers.passengers.map((passenger, idx) => (
//                         <tr key={idx} className="hover:bg-gray-100">
//                           <td className="px-4 py-2 text-sm">{passenger.passenger_name}</td>
//                           <td className="px-4 py-2 text-xs font-mono">{passenger.booking_id}</td>
//                           <td className="px-4 py-2">
//                             <span className={`px-2 py-0.5 text-xs rounded-full ${passenger.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                               {passenger.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="p-4 border-t bg-gray-50 flex justify-end">
//             <button
//               onClick={() => {
//                 setSelectedBooking(null);
//                 setBookingDetails(null);
//                 setTripPassengers(null);
//                 setRouteDetails(null);
//               }}
//               className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Show loading state
//   if (loading && driverSummaries.length === 0) {
//     return (
//       <div className="flex h-screen bg-gray-100">
//         <Sidebar />
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <TopNavbar />
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//               <p className="mt-4 text-gray-600">Loading driver data...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar />
//         <div className="flex-1 overflow-auto">
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
//                   <BanknotesIcon className="w-8 h-8 text-green-600" />
//                   Driver Payments
//                 </h1>
//                 <p className="text-gray-500 mt-1">View and manage driver earnings</p>
//               </div>
//               <button
//                 onClick={handleRefresh}
//                 disabled={loading}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//             </div>
            
//             {successMessage && (
//               <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <CheckCircleIcon className="w-5 h-5 text-green-600" />
//                   <p className="text-green-700">{successMessage}</p>
//                 </div>
//               </div>
//             )}
            
//             {errorMessage && (
//               <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
//                   <p className="text-red-700">{errorMessage}</p>
//                 </div>
//               </div>
//             )}
            
//             {/* Search Bar */}
//             <div className="mb-6">
//               <div className="relative max-w-md">
//                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by driver name, email, or vehicle number..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 />
//               </div>
//             </div>
            
//             {renderDriverCards()}
//           </div>
//         </div>
//       </div>
      
//       {renderDriverDetailsModal()}
//       {renderBookingDetailsModal()}
//     </div>
//   );
// };

// export default DriverPayments;


import React, { useState, useEffect } from "react";
import Sidebar from "../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../assets/components/navbar/TopNavbar";
import {
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  TruckIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ClockIcon,
  CreditCardIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon
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

// Get all drivers with payout profiles
const getDrivers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/payouts/drivers?${params}` : `${API_BASE_URL}/payouts/drivers`;
  console.log("Fetching drivers from:", url);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error("Failed to fetch drivers");
  const data = await response.json();
  console.log("Drivers API response:", data);
  return data;
};

// Get payout bookings with filters
const getPayoutBookings = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params ? `${API_BASE_URL}/payouts/bookings?${params}` : `${API_BASE_URL}/payouts/bookings`;
  console.log("Fetching bookings from:", url);
  const response = await fetch(url, { 
    headers: getAuthHeaders(),
    cache: 'no-cache'
  });
  if (!response.ok) throw new Error("Failed to fetch bookings");
  const data = await response.json();
  console.log("Bookings API response:", data);
  return data;
};

// Get booking details
const getBookingDetails = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/payouts/bookings/${bookingId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch booking details");
  return response.json();
};

// Get trip passengers
const getTripPassengers = async (tripId) => {
  const response = await fetch(`${API_BASE_URL}/${tripId}/passengers`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch trip passengers");
  return response.json();
};

// Get route details by route ID
const getRouteDetails = async (routeId) => {
  const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch route details");
  return response.json();
};

// Get passenger details (for route & stops info)
const getPassengerDetails = async (passengerId) => {
  const response = await fetch(`${API_BASE_URL}/passenger/${passengerId}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to fetch passenger details");
  return response.json();
};

// ============= HELPER FUNCTIONS =============

const getTransferStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'transferred':
    case 'processed':
      return 'bg-green-100 text-green-800';
    case 'ready':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'withheld':
      return 'bg-orange-100 text-orange-800';
    case 'reversed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTransferStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'transferred':
    case 'processed':
      return 'Paid';
    case 'ready':
      return 'Ready';
    case 'failed':
      return 'Failed';
    case 'withheld':
      return 'Withheld';
    case 'reversed':
      return 'Reversed';
    default:
      return status || 'Pending';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${parseFloat(amount).toFixed(2)}`;
};

// ============= MAIN COMPONENT =============

const DriverPayments = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Data State
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverBookings, setDriverBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  
  // Driver Summary Data
  const [driverSummaries, setDriverSummaries] = useState([]);
  
  // Filter State for Driver Details
  const [detailFilters, setDetailFilters] = useState({
    dateRange: 'all',
    customMonth: new Date().getMonth() + 1,
    customYear: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  });
  
  // Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [tripPassengers, setTripPassengers] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [passengerBookingHistory, setPassengerBookingHistory] = useState(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Fetch drivers
      const driversData = await getDrivers();
      let driversList = [];
      
      if (driversData.items && Array.isArray(driversData.items)) {
        driversList = driversData.items;
      } else if (Array.isArray(driversData)) {
        driversList = driversData;
      } else if (driversData.drivers && Array.isArray(driversData.drivers)) {
        driversList = driversData.drivers;
      }
      
      console.log("Drivers list:", driversList);
      setDrivers(driversList);
      
      // Fetch bookings
      const bookingsData = await getPayoutBookings();
      let bookingsList = [];
      
      if (bookingsData.items && Array.isArray(bookingsData.items)) {
        bookingsList = bookingsData.items;
      } else if (Array.isArray(bookingsData)) {
        bookingsList = bookingsData;
      }
      
      console.log("Bookings list:", bookingsList);
      setAllBookings(bookingsList);
      
      // Calculate summaries
      const summaries = calculateDriverSummaries(bookingsList, driversList);
      console.log("Driver summaries:", summaries);
      setDriverSummaries(summaries);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const driversData = await getDrivers();
      let driversList = [];
      
      if (driversData.items && Array.isArray(driversData.items)) {
        driversList = driversData.items;
      } else if (Array.isArray(driversData)) {
        driversList = driversData;
      } else if (driversData.drivers && Array.isArray(driversData.drivers)) {
        driversList = driversData.drivers;
      }
      
      setDrivers(driversList);
      
      const bookingsData = await getPayoutBookings();
      let bookingsList = [];
      
      if (bookingsData.items && Array.isArray(bookingsData.items)) {
        bookingsList = bookingsData.items;
      } else if (Array.isArray(bookingsData)) {
        bookingsList = bookingsData;
      }
      
      setAllBookings(bookingsList);
      
      const summaries = calculateDriverSummaries(bookingsList, driversList);
      setDriverSummaries(summaries);
      
      setSuccessMessage("Data refreshed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error refreshing data:", error);
      setErrorMessage(`Failed to refresh data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateDriverSummaries = (bookings, driversList) => {
    const driverMap = new Map();
    
    // Initialize with all drivers
    driversList.forEach(driver => {
      const driverId = driver.user_id || driver.id;
      if (!driverId) return;
      
      driverMap.set(driverId, {
        driver_id: driverId,
        driver_name: driver.profile?.full_name || driver.profile?.name || driver.name || 'Unknown Driver',
        driver_email: driver.email || 'N/A',
        driver_phone: driver.profile?.phone || '',
        vehicle_number: driver.vehicle?.registration_number || driver.vehicle?.reg_no || 'N/A',
        total_bookings: 0,
        total_gross_amount: 0,
        total_commission: 0,
        total_driver_payout: 0,
        total_deductions: 0,
        total_net_payout: 0,
        completed_count: 0,
        pending_count: 0,
        failed_count: 0,
        bookings: []
      });
    });
    
    // Aggregate bookings
    bookings.forEach(booking => {
      const driverId = booking.driver_user_id;
      if (driverMap.has(driverId)) {
        const summary = driverMap.get(driverId);
        summary.total_bookings++;
        summary.total_gross_amount += parseFloat(booking.fare_amount || 0);
        summary.total_commission += parseFloat(booking.commission_amount || 0);
        summary.total_driver_payout += parseFloat(booking.driver_payout_amount || 0);
        summary.total_deductions += parseFloat(booking.applied_adjustment_amount || 0);
        summary.total_net_payout += parseFloat(booking.net_payout_amount || 0);
        
        const status = (booking.transfer_status || '').toLowerCase();
        if (status === 'processed' || status === 'transferred') {
          summary.completed_count++;
        } else if (status === 'failed') {
          summary.failed_count++;
        } else {
          summary.pending_count++;
        }
        
        summary.bookings.push(booking);
      } else {
        console.warn(`Booking with driver_id ${driverId} not found in drivers list`);
      }
    });
    
    const result = Array.from(driverMap.values());
    return result;
  };

  const handleDriverClick = (driver) => {
    setSelectedDriver(driver);
    const driverBookingsList = allBookings.filter(b => b.driver_user_id === driver.driver_id);
    setDriverBookings(driverBookingsList);
    setShowDetailsModal(true);
  };

  const getFilteredDriverBookings = () => {
    let filtered = [...driverBookings];
    
    switch (detailFilters.dateRange) {
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(b => {
          if (!b.completed_at) return false;
          return new Date(b.completed_at).toDateString() === today;
        });
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(b => {
          if (!b.completed_at) return false;
          return new Date(b.completed_at) >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(b => {
          if (!b.completed_at) return false;
          return new Date(b.completed_at) >= monthAgo;
        });
        break;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(b => {
          if (!b.completed_at) return false;
          return new Date(b.completed_at) >= yearAgo;
        });
        break;
      case 'custom':
        if (detailFilters.customMonth && detailFilters.customYear) {
          filtered = filtered.filter(b => {
            if (!b.completed_at) return false;
            const date = new Date(b.completed_at);
            return date.getMonth() + 1 === detailFilters.customMonth && 
                   date.getFullYear() === detailFilters.customYear;
          });
        }
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const handleViewBookingDetails = async (booking) => {
    setLoading(true);
    setSelectedBooking(booking);
    try {
      const details = await getBookingDetails(booking.booking_id);
      setBookingDetails(details);
      
      if (booking.scheduled_trip_id) {
        try {
          const passengers = await getTripPassengers(booking.scheduled_trip_id);
          setTripPassengers(passengers);
        } catch (err) {
          console.error("Error fetching trip passengers:", err);
        }
      }
      
      if (booking.route_id) {
        try {
          const route = await getRouteDetails(booking.route_id);
          setRouteDetails(route);
        } catch (err) {
          console.error("Error fetching route details:", err);
        }
      }
      
      // Fetch passenger booking history for route & stops info
      if (booking.passenger_user_id) {
        try {
          const passengerData = await getPassengerDetails(booking.passenger_user_id);
          setPassengerBookingHistory(passengerData);
        } catch (err) {
          console.error("Error fetching passenger details:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setErrorMessage("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDrivers = () => {
    if (!searchTerm) return driverSummaries;
    return driverSummaries.filter(driver => 
      driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driver_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDriverCards = () => {
    const filteredDrivers = getFilteredDrivers();
    
    if (filteredDrivers.length === 0 && !loading) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No drivers found</p>
          <p className="text-sm text-gray-400 mt-2">Try refreshing or check your connection</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver, index) => (
          <div
            key={driver.driver_id || index}
            onClick={() => handleDriverClick(driver)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {driver.driver_name?.charAt(0)?.toUpperCase() || 'D'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {driver.driver_name}
                    </h3>
                    <p className="text-xs text-gray-500">{driver.driver_email}</p>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TruckIcon className="w-4 h-4" />
                  <span>{driver.vehicle_number}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Trips</p>
                  <p className="text-xl font-bold text-blue-600">{driver.total_bookings}</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(driver.total_net_payout)}</p>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {driver.completed_count > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    {driver.completed_count} Paid
                  </span>
                )}
                {driver.pending_count > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    {driver.pending_count} Pending
                  </span>
                )}
                {driver.failed_count > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                    {driver.failed_count} Failed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDriverDetailsModal = () => {
    if (!showDetailsModal || !selectedDriver) return null;
    
    const filteredBookings = getFilteredDriverBookings();
    const driverStats = {
      totalGross: filteredBookings.reduce((sum, b) => sum + parseFloat(b.fare_amount || 0), 0),
      totalCommission: filteredBookings.reduce((sum, b) => sum + parseFloat(b.commission_amount || 0), 0),
      totalDeductions: filteredBookings.reduce((sum, b) => sum + parseFloat(b.applied_adjustment_amount || 0), 0),
      totalNet: filteredBookings.reduce((sum, b) => sum + parseFloat(b.net_payout_amount || 0), 0)
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-gray-50 to-white sticky top-0 bg-white z-10 flex-shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedDriver.driver_name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDriver.driver_name}</h3>
                  <p className="text-sm text-gray-500">{selectedDriver.driver_email}</p>
                  <p className="text-xs text-gray-400 mt-1">Vehicle: {selectedDriver.vehicle_number}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedDriver(null);
                setDriverBookings([]);
                setDetailFilters({
                  dateRange: 'all',
                  customMonth: new Date().getMonth() + 1,
                  customYear: new Date().getFullYear(),
                  startDate: '',
                  endDate: ''
                });
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={detailFilters.dateRange}
                    onChange={(e) => setDetailFilters({ ...detailFilters, dateRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                    <option value="custom">Custom Month/Year</option>
                  </select>
                </div>
                
                {detailFilters.dateRange === 'custom' && (
                  <>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                      <select
                        value={detailFilters.customMonth}
                        onChange={(e) => setDetailFilters({ ...detailFilters, customMonth: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>
                            {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                      <select
                        value={detailFilters.customYear}
                        onChange={(e) => setDetailFilters({ ...detailFilters, customYear: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                <div>
                  <button
                    onClick={() => setDetailFilters({
                      dateRange: 'all',
                      customMonth: new Date().getMonth() + 1,
                      customYear: new Date().getFullYear(),
                      startDate: '',
                      endDate: ''
                    })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Trips</p>
                <p className="text-2xl font-bold text-blue-600">{filteredBookings.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Gross Amount</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(driverStats.totalGross)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Commission</p>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(driverStats.totalCommission)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Net Payout</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(driverStats.totalNet)}</p>
              </div>
            </div>
            
            {/* TABLE WITHOUT Route & Stops and Status columns */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Trip Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Amounts</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                          No bookings found for this period
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                          {/* Trip Details */}
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.passenger_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              ID: {booking.booking_id?.substring(0, 8)}...
                            </div>
                            {/* Status badge shown inline */}
                            <div className="mt-2">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTransferStatusColor(booking.transfer_status)}`}>
                                {getTransferStatusText(booking.transfer_status)}
                              </span>
                            </div>
                          </td>
                          
                          {/* Amounts */}
                          <td className="px-4 py-4">
                            <div className="space-y-0.5">
                              <div className="text-xs text-gray-500">Gross: {formatCurrency(booking.fare_amount)}</div>
                              <div className="text-xs text-orange-500">Commission: {formatCurrency(booking.commission_amount)}</div>

                              
                              <div className="text-xs text-red-500">Deductions: {formatCurrency(booking.applied_adjustment_amount)}</div>
                              <div className="text-sm font-bold text-green-600 mt-1">Net: {formatCurrency(booking.net_payout_amount)}</div>
                            </div>
                          </td>
                          
                          {/* Date */}
                          <td className="px-4 py-4">
                            <div className="text-xs text-gray-500">
                              {formatDate(booking.completed_at || booking.created_at)}
                            </div>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => handleViewBookingDetails(booking)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-end flex-shrink-0">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedDriver(null);
                setDriverBookings([]);
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingDetailsModal = () => {
    if (!selectedBooking) return null;
    
    const adjustments = bookingDetails?.originated_adjustments || [];
    
    const matchingBooking = passengerBookingHistory?.booking_history?.bookings?.find(
      b => b.booking_id === selectedBooking.booking_id
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Booking Payment Details</h3>
              <p className="text-sm text-gray-500 mt-1 font-mono">Booking ID: {selectedBooking.booking_id}</p>
            </div>
            <button
              onClick={() => {
                setSelectedBooking(null);
                setBookingDetails(null);
                setTripPassengers(null);
                setRouteDetails(null);
                setPassengerBookingHistory(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            {/* Passenger Information */}
            {passengerBookingHistory && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-purple-600" />
                  Passenger Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{passengerBookingHistory.profile?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-700">{passengerBookingHistory.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Route & Stops Information */}
            {matchingBooking && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  Route & Stops Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">🚏</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Pickup Stop</p>
                      <p className="text-sm font-medium text-gray-900">{matchingBooking.pickup_stop?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Stop #{matchingBooking.pickup_stop?.sequence || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-sm">📍</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Dropoff Stop</p>
                      <p className="text-sm font-medium text-gray-900">{matchingBooking.dropoff_stop?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">Stop #{matchingBooking.dropoff_stop?.sequence || 'N/A'}</p>
                    </div>
                  </div>
                  {matchingBooking.actual_drop_stop_name && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm">🔽</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Actual Dropoff Stop</p>
                        <p className="text-sm font-medium text-blue-600">{matchingBooking.actual_drop_stop_name}</p>
                        {matchingBooking.actual_dropped_at && (
                          <p className="text-xs text-gray-400">at {formatDate(matchingBooking.actual_dropped_at)}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Route Information */}
            {routeDetails && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-purple-600" />
                  Route Information
                </h4>
                <p className="text-sm text-gray-700"><span className="font-medium">Route:</span> {routeDetails.name}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Code:</span> {routeDetails.code}</p>
              </div>
            )}
            
            {/* Booking Status */}
            {matchingBooking && (
              <div className="mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Booking Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getBookingStatusColor(matchingBooking.status)}`}>
                    {matchingBooking.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Financial Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Financial Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Fare Amount</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedBooking.fare_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commission ({selectedBooking.commission_percent_snapshot || 0}%)</span>
                  <span className="text-sm text-orange-600">-{formatCurrency(selectedBooking.commission_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Driver Gross Payout</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedBooking.driver_payout_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deductions Applied</span>
                  <span className="text-sm text-red-600">-{formatCurrency(selectedBooking.applied_adjustment_amount)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold">Net Payout to Driver</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(selectedBooking.net_payout_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adjustments / Fines */}
            {adjustments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Adjustments / Fines</h4>
                <div className="space-y-2">
                  {adjustments.map((adj, idx) => (
                    <div key={idx} className="bg-red-50 rounded-lg p-3">
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${adj.adjustment_type === 'fine' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                            {adj.adjustment_type}
                          </span>
                          <p className="text-sm mt-1">{adj.reason_text}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-600">{formatCurrency(adj.amount)}</p>
                          <p className="text-xs text-gray-500">Status: {adj.decision_status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trip Passengers */}
            {tripPassengers && tripPassengers.passengers && tripPassengers.passengers.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Trip Passengers</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Passenger</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripPassengers.passengers.map((passenger, idx) => (
                          <tr key={idx} className="hover:bg-gray-100">
                            <td className="px-4 py-2 text-sm">{passenger.passenger_name}</td>
                            <td className="px-4 py-2 text-xs font-mono">{passenger.booking_id?.substring(0, 13)}...</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${passenger.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {passenger.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50 flex justify-end flex-shrink-0">
            <button
              onClick={() => {
                setSelectedBooking(null);
                setBookingDetails(null);
                setTripPassengers(null);
                setRouteDetails(null);
                setPassengerBookingHistory(null);
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && driverSummaries.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading driver data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <BanknotesIcon className="w-8 h-8 text-green-600" />
                  Driver Payments
                </h1>
                <p className="text-gray-500 mt-1">View and manage driver earnings</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">{successMessage}</p>
                </div>
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by driver name, email, or vehicle number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
            
            {renderDriverCards()}
          </div>
        </div>
      </div>
      
      {renderDriverDetailsModal()}
      {renderBookingDetailsModal()}
    </div>
  );
};

export default DriverPayments;