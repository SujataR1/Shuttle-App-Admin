// import React, { useState, useEffect } from 'react';
// import { 
//   TruckIcon, 
//   CheckCircleIcon, 
//   XCircleIcon,
//   ClockIcon,
//   CalendarIcon,
//   EyeIcon,
//   ExclamationTriangleIcon,
//   ArrowPathIcon,
//   UserIcon,
//   DocumentTextIcon,
//   BanknotesIcon
// } from '@heroicons/react/24/outline';
// import Sidebar from '../../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../../assets/components/navbar/TopNavbar';

// const DriverInspectionPage = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [inspectionRequests, setInspectionRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [inspectionStatus, setInspectionStatus] = useState('approved');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [processingInspection, setProcessingInspection] = useState(false);
//   const [filter, setFilter] = useState('all');
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Get auth token
//   const getAuthToken = () => {
//     return localStorage.getItem("access_token");
//   };

//   // Fetch vehicle details including inspection status
//   const fetchVehicleDetails = async (vehicleId) => {
//     if (!vehicleId) return null;
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`https://be.shuttleapp.transev.site/admin/vehicle/details/${vehicleId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const vehicleData = await response.json();
//         return vehicleData;
//       }
//       return null;
//     } catch (error) {
//       console.error(`Error fetching vehicle ${vehicleId}:`, error);
//       return null;
//     }
//   };

//   // Fetch individual driver details
//   const fetchDriverDetails = async (driverId) => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`https://be.shuttleapp.transev.site/admin/driver/${driverId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const driverData = await response.json();
//         return driverData;
//       }
//       return null;
//     } catch (error) {
//       console.error(`Error fetching driver ${driverId}:`, error);
//       return null;
//     }
//   };

//   // Calculate inspection status
//   const getInspectionStatus = (lastInspectionDate) => {
//     if (!lastInspectionDate) {
//       return {
//         status: 'pending',
//         label: 'First Inspection',
//         color: 'blue',
//         daysRemaining: 0,
//         isOverdue: false,
//         overdueDays: 0,
//         nextDueDate: null
//       };
//     }

//     const lastInspection = new Date(lastInspectionDate);
//     const nextDueDate = new Date(lastInspection);
//     nextDueDate.setDate(lastInspection.getDate() + 15);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const diffTime = nextDueDate.getTime() - today.getTime();
//     const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (daysRemaining < 0) {
//       return {
//         status: 'overdue',
//         label: 'Overdue',
//         color: 'red',
//         daysRemaining,
//         isOverdue: true,
//         overdueDays: Math.abs(daysRemaining),
//         nextDueDate
//       };
//     } else if (daysRemaining <= 3) {
//       return {
//         status: 'urgent',
//         label: 'Urgent',
//         color: 'red',
//         daysRemaining,
//         isOverdue: false,
//         overdueDays: 0,
//         nextDueDate
//       };
//     } else if (daysRemaining <= 7) {
//       return {
//         status: 'warning',
//         label: 'Due Soon',
//         color: 'orange',
//         daysRemaining,
//         isOverdue: false,
//         overdueDays: 0,
//         nextDueDate
//       };
//     } else {
//       return {
//         status: 'good',
//         label: 'On Track',
//         color: 'green',
//         daysRemaining,
//         isOverdue: false,
//         overdueDays: 0,
//         nextDueDate
//       };
//     }
//   };

//   const fetchAllDriversForInspection = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const token = getAuthToken();

//       if (!token) {
//         setError('No authentication token found. Please login again.');
//         setLoading(false);
//         return;
//       }

//       // First, get list of all drivers
//       const response = await fetch('https://be.shuttleapp.transev.site/admin/view/all-drivers', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch drivers: ${response.status}`);
//       }

//       const allDrivers = await response.json();
//       console.log('All drivers fetched:', allDrivers.length);

//       // Filter drivers that have vehicle status as 'verified'
//       const verifiedDrivers = allDrivers.filter(
//         (driver) => driver.bus_details && 
//                    driver.bus_details.status === 'verified'
//       );

//       console.log('Verified drivers:', verifiedDrivers.length);

//       if (verifiedDrivers.length === 0) {
//         setDrivers([]);
//         setInspectionRequests([]);
//         setLoading(false);
//         return;
//       }

//       // Fetch vehicle details and driver details for each
//       const driversWithInspectionStatus = await Promise.all(
//         verifiedDrivers.map(async (driver) => {
//           try {
//             const detailedDriver = await fetchDriverDetails(driver.user_id);

//             // Get last inspection date from vehicle details if available
//             let lastInspectionDate = null;
//             let vehicleDetails = null;

//             if (driver.bus_details?.vehicle_id) {
//               vehicleDetails = await fetchVehicleDetails(driver.bus_details.vehicle_id);
//               lastInspectionDate = vehicleDetails?.physical_inspection?.reviewed_at;
//             }

//             const inspectionInfo = getInspectionStatus(lastInspectionDate);

//             // Get driver name from various possible sources
//             let driverName = 'Unknown Driver';
//             if (detailedDriver?.profile?.full_name) {
//               driverName = detailedDriver.profile.full_name;
//             } else if (detailedDriver?.profile?.name) {
//               driverName = detailedDriver.profile.name;
//             } else if (driver.profile?.name) {
//               driverName = driver.profile.name;
//             } else if (driver.profile?.full_name) {
//               driverName = driver.profile.full_name;
//             }

//             // Only include vehicles that need inspection (not in good status)
//             const needsInspection = inspectionInfo.status !== 'good';

//             return {
//               driverId: driver.user_id,
//               driverName: driverName,
//               email: driver.email || 'N/A',
//               phone: detailedDriver?.profile?.phone || driver.profile?.phone || 'N/A',
//               vehicleId: driver.bus_details?.vehicle_id,
//               vehicleRegNo: driver.bus_details?.reg_no || 'N/A',
//               vehicleModel: driver.bus_details?.model || 'N/A',
//               vehicleCapacity: driver.bus_details?.capacity || 'N/A',
//               hasAC: driver.bus_details?.ac || false,
//               color: driver.bus_details?.color || 'N/A',
//               regValidTill: driver.bus_details?.reg_valid_till,
//               rcFilePath: driver.bus_details?.rc_file_path,
//               rearPhotoPath: driver.bus_details?.rear_photo_file_path,
//               frontPhotoPath: driver.bus_details?.front_photo_file_path,
//               interiorPhotoPath: driver.bus_details?.interior_photo_file_path,
//               leftSidePhotoPath: driver.bus_details?.left_side_file_path,
//               rightSidePhotoPath: driver.bus_details?.right_side_file_path,
//               lastInspectionDate: lastInspectionDate,
//               lastInspectionStatus: vehicleDetails?.physical_inspection?.status,
//               needsInspection: needsInspection,
//               ...inspectionInfo,
//               profile: detailedDriver?.profile,
//               documents: detailedDriver?.profile?.documents || {},
//               accountInfo: detailedDriver?.account_info || {}
//             };
//           } catch (err) {
//             console.error('Error processing driver:', driver.user_id, err);
//             return null;
//           }
//         })
//       );

//       // Filter out any failed entries and those that don't need inspection
//       const validDrivers = driversWithInspectionStatus.filter(d => d !== null && d.needsInspection === true);

//       // Sort by urgency
//       const sortedVehicles = validDrivers.sort((a, b) => {
//         const urgencyOrder = { overdue: 0, urgent: 1, warning: 2, pending: 3 };
//         return urgencyOrder[a.status] - urgencyOrder[b.status];
//       });

//       console.log('Vehicles needing inspection:', sortedVehicles.length);
//       setDrivers(sortedVehicles);
//       setInspectionRequests(sortedVehicles);
//     } catch (error) {
//       console.error('Error fetching drivers:', error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Manual refresh function
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAllDriversForInspection();
//   };

//   // Submit physical inspection
//   const submitInspection = async (vehicleId, status, reason = '') => {
//     if (!vehicleId) {
//       alert('Invalid vehicle ID');
//       return;
//     }

//     if (status === 'rejected' && !reason.trim()) {
//       alert('Please provide a reason for rejection');
//       return;
//     }

//     setProcessingInspection(true);
//     try {
//       const token = getAuthToken();
//       const requestBody = { status };
//       if (status === 'rejected' && reason) {
//         requestBody.reason = reason;
//       }

//       const response = await fetch(`https://be.shuttleapp.transev.site/admin/vehicle/inspect/${vehicleId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();

//       if (response.ok && data.status === 'success') {
//         const successMessage = status === 'approved' 
//           ? '✅ Vehicle inspection approved! The vehicle will reappear for next inspection in 15 days.'
//           : `❌ Vehicle inspection rejected. Reason: ${reason}`;

//         alert(successMessage);

//         setShowModal(false);
//         setSelectedDriver(null);
//         setInspectionStatus('approved');
//         setRejectionReason('');

//         // Refresh the list
//         await fetchAllDriversForInspection();
//       } else {
//         alert(`Failed to submit inspection: ${data.message || data.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Error submitting inspection:', error);
//       alert('Error connecting to server. Please try again.');
//     } finally {
//       setProcessingInspection(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       overdue: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Overdue' },
//       urgent: { color: 'bg-red-100 text-red-800', icon: ClockIcon, text: 'Urgent' },
//       warning: { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, text: 'Due Soon' },
//       pending: { color: 'bg-blue-100 text-blue-800', icon: CalendarIcon, text: 'First Time' },
//       good: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Good' }
//     };

//     const badge = badges[status] || badges.pending;
//     const Icon = badge.icon;

//     return (
//       <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
//         <Icon className="w-3 h-3" />
//         {badge.text}
//       </span>
//     );
//   };

//   const getActionButton = (request) => {
//     const buttonConfig = {
//       overdue: { text: '⚠️ Immediate Action Required', color: 'bg-red-600 hover:bg-red-700' },
//       urgent: { text: '🚨 Schedule Urgent Inspection', color: 'bg-red-600 hover:bg-red-700' },
//       warning: { text: 'Schedule Inspection', color: 'bg-orange-600 hover:bg-orange-700' },
//       pending: { text: 'Start First Inspection', color: 'bg-blue-600 hover:bg-blue-700' }
//     };

//     const config = buttonConfig[request.status] || buttonConfig.warning;

//     return (
//       <button
//         onClick={() => openInspectionModal(request)}
//         className={`px-4 py-2 ${config.color} text-white text-sm font-medium rounded-md transition-colors w-full`}
//       >
//         {config.text}
//       </button>
//     );
//   };

//   const filteredRequests = inspectionRequests.filter(req => {
//     if (filter === 'all') return true;
//     return req.status === filter;
//   });

//   const openInspectionModal = (request) => {
//     setSelectedDriver(request);
//     setShowModal(true);
//     setInspectionStatus('approved');
//     setRejectionReason('');
//   };

//   const toggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-GB', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   // Calculate statistics
//   const getStats = () => {
//     return {
//       overdue: inspectionRequests.filter(r => r.status === 'overdue').length,
//       urgent: inspectionRequests.filter(r => r.status === 'urgent').length,
//       warning: inspectionRequests.filter(r => r.status === 'warning').length,
//       pending: inspectionRequests.filter(r => r.status === 'pending').length,
//       total: inspectionRequests.length
//     };
//   };

//   const stats = getStats();

//   // Initial load
//   useEffect(() => {
//     fetchAllDriversForInspection();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gray-50">
//         <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <TopNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//               <p className="mt-4 text-gray-600">Loading inspection requests...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex h-screen bg-gray-50">
//         <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <TopNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="bg-red-100 rounded-full p-4 mx-auto mb-4">
//                 <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
//               </div>
//               <p className="text-red-600 text-lg font-medium">{error}</p>
//               <button
//                 onClick={fetchAllDriversForInspection}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <TopNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

//         <main className="flex-1 overflow-y-auto">
//           <div className="p-6 max-w-7xl mx-auto">
//             {/* Header */}
//             <div className="mb-8">
//               <div className="flex items-center justify-between flex-wrap gap-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <TruckIcon className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900">Vehicle Inspection</h1>
//                     <p className="text-gray-600 mt-1">Track and manage vehicle inspections (15-day cycle)</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <button
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
//                     title="Refresh data"
//                   >
//                     <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
//                   </button>

//                   <div className="flex space-x-2">
//                     <button
//                       onClick={() => setFilter('all')}
//                       className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                         filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       All ({stats.total})
//                     </button>
//                     <button
//                       onClick={() => setFilter('overdue')}
//                       className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                         filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       Overdue ({stats.overdue})
//                     </button>
//                     <button
//                       onClick={() => setFilter('urgent')}
//                       className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                         filter === 'urgent' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       Urgent ({stats.urgent})
//                     </button>
//                     <button
//                       onClick={() => setFilter('warning')}
//                       className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                         filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       Due Soon ({stats.warning})
//                     </button>
//                     <button
//                       onClick={() => setFilter('pending')}
//                       className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
//                         filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       First Time ({stats.pending})
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Statistics Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
//               <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
//                 <p className="text-sm text-gray-600">Overdue</p>
//                 <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
//                 <p className="text-xs text-gray-500">Past inspection date</p>
//               </div>
//               <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
//                 <p className="text-sm text-gray-600">Urgent</p>
//                 <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
//                 <p className="text-xs text-gray-500">0-3 days left</p>
//               </div>
//               <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
//                 <p className="text-sm text-gray-600">Due Soon</p>
//                 <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
//                 <p className="text-xs text-gray-500">4-7 days left</p>
//               </div>
//               <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
//                 <p className="text-sm text-gray-600">First Time</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
//                 <p className="text-xs text-gray-500">Never inspected</p>
//               </div>
//               <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
//                 <p className="text-sm text-gray-600">Total Due</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//                 <p className="text-xs text-gray-500">Need inspection now</p>
//               </div>
//             </div>

//             {/* Info Banner */}
//             <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="text-sm text-blue-800">
//                 <p className="font-medium mb-1">📋 How It Works:</p>
//                 <ul className="list-disc list-inside space-y-1 text-xs">
//                   <li>Vehicles appear here 15 days after last inspection</li>
//                   <li>After approval, vehicle disappears for 15 days</li>
//                   <li>Rejected vehicles are removed from active fleet</li>
//                 </ul>
//               </div>
//             </div>

//             {/* Inspection Table */}
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//                 <h2 className="text-lg font-semibold text-gray-900">Vehicles Requiring Inspection</h2>
//                 {inspectionRequests.length === 0 && (
//                   <p className="text-sm text-green-600 mt-1">All vehicles are up to date!</p>
//                 )}
//               </div>

//               {inspectionRequests.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Inspection</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredRequests.map((request) => (
//                         <tr key={request.driverId} className="hover:bg-gray-50 transition-colors">
//                           <td className="px-6 py-4">
//                             <div className="font-medium text-gray-900">{request.driverName}</div>
//                             <div className="text-sm text-gray-500">{request.phone}</div>
//                             <div className="text-xs text-gray-400">{request.email}</div>
//                            </td>
//                           <td className="px-6 py-4">
//                             <div className="font-medium text-gray-900">{request.vehicleRegNo}</div>
//                             <div className="text-sm text-gray-500">{request.vehicleModel} • {request.vehicleCapacity} seats</div>
//                             <div className="text-xs text-gray-400">{request.hasAC ? 'AC' : 'Non-AC'} • {request.color}</div>
//                            </td>
//                           <td className="px-6 py-4">
//                             {request.lastInspectionDate ? (
//                               <>
//                                 <div>{formatDate(request.lastInspectionDate)}</div>
//                                 <div className="text-xs text-gray-500 mt-1">
//                                   Result: {request.lastInspectionStatus || 'N/A'}
//                                 </div>
//                               </>
//                             ) : (
//                               <span className="text-blue-600">Never inspected</span>
//                             )}
//                            </td>
//                           <td className="px-6 py-4">
//                             {getStatusBadge(request.status)}
//                             {request.nextDueDate && request.status !== 'pending' && (
//                               <div className="text-xs text-gray-500 mt-1">
//                                 Due: {formatDate(request.nextDueDate)}
//                               </div>
//                             )}
//                            </td>
//                           <td className="px-6 py-4">
//                             {request.status === 'pending' ? (
//                               <span className="text-blue-600 font-medium">First Time</span>
//                             ) : request.isOverdue ? (
//                               <span className="text-red-600 font-bold">Overdue by {request.overdueDays}d</span>
//                             ) : (
//                               <span className={`font-bold ${
//                                 request.daysRemaining <= 3 ? 'text-red-600' : 
//                                 request.daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'
//                               }`}>
//                                 {request.daysRemaining} days
//                               </span>
//                             )}
//                            </td>
//                           <td className="px-6 py-4">
//                             {getActionButton(request)}
//                            </td>
//                          </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
//                   <p className="text-gray-500 text-lg">All inspections are up to date!</p>
//                   <p className="text-sm text-gray-400 mt-2">No vehicles require inspection at this time.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Inspection Modal */}
//       {showModal && selectedDriver && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-xl font-bold text-gray-900">Vehicle Inspection</h2>
//               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
//                 <XCircleIcon className="h-6 w-6" />
//               </button>
//             </div>

//             <div className="p-6">
//               {/* Warning Banner */}
//               {(selectedDriver.status === 'overdue' || selectedDriver.status === 'urgent') && (
//                 <div className={`mb-6 p-4 rounded-lg ${selectedDriver.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border`}>
//                   <div className="flex items-start space-x-3">
//                     <ExclamationTriangleIcon className={`h-6 w-6 ${selectedDriver.status === 'overdue' ? 'text-red-600' : 'text-orange-600'}`} />
//                     <div>
//                       <h4 className={`font-semibold ${selectedDriver.status === 'overdue' ? 'text-red-800' : 'text-orange-800'}`}>
//                         {selectedDriver.status === 'overdue' ? '⚠️ INSPECTION OVERDUE!' : '⚠️ URGENT: Inspection Due Soon!'}
//                       </h4>
//                       <p className="text-sm mt-1">
//                         {selectedDriver.status === 'overdue' 
//                           ? `This inspection is overdue by ${selectedDriver.overdueDays} days. Immediate action required!`
//                           : `Only ${selectedDriver.daysRemaining} days remaining for inspection.`
//                         }
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Driver & Vehicle Info */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div className="border rounded-lg p-4">
//                   <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                     <UserIcon className="w-5 h-5 text-gray-500" />
//                     Driver Information
//                   </h3>
//                   <div className="space-y-2 text-sm">
//                     <p><span className="text-gray-500">Name:</span> {selectedDriver.driverName}</p>
//                     <p><span className="text-gray-500">Phone:</span> {selectedDriver.phone}</p>
//                     <p><span className="text-gray-500">Email:</span> {selectedDriver.email}</p>
//                   </div>
//                 </div>

//                 <div className="border rounded-lg p-4">
//                   <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                     <TruckIcon className="w-5 h-5 text-gray-500" />
//                     Vehicle Information
//                   </h3>
//                   <div className="space-y-2 text-sm">
//                     <p><span className="text-gray-500">Registration:</span> {selectedDriver.vehicleRegNo}</p>
//                     <p><span className="text-gray-500">Model:</span> {selectedDriver.vehicleModel}</p>
//                     <p><span className="text-gray-500">Capacity:</span> {selectedDriver.vehicleCapacity} seats</p>
//                     <p><span className="text-gray-500">AC:</span> {selectedDriver.hasAC ? 'Yes' : 'No'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Inspection History */}
//               <div className="border rounded-lg p-4 mb-6">
//                 <h3 className="font-semibold text-gray-900 mb-3">Inspection History</h3>
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <p className="text-gray-500">Last Inspection Date</p>
//                     <p className="font-medium">{formatDateTime(selectedDriver.lastInspectionDate) || 'Never'}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Previous Result</p>
//                     <p className="font-medium capitalize">{selectedDriver.lastInspectionStatus || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Decision */}
//               <div className="border-t pt-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Decision</h3>
//                 <div className="space-y-4">
//                   <div className="flex space-x-6">
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         value="approved"
//                         checked={inspectionStatus === 'approved'}
//                         onChange={(e) => {
//                           setInspectionStatus(e.target.value);
//                           setRejectionReason('');
//                         }}
//                         className="mr-2 w-4 h-4 text-green-600"
//                       />
//                       <span className="text-green-700 font-medium">✓ Approve (Passes)</span>
//                     </label>
//                     <label className="flex items-center cursor-pointer">
//                       <input
//                         type="radio"
//                         value="rejected"
//                         checked={inspectionStatus === 'rejected'}
//                         onChange={(e) => setInspectionStatus(e.target.value)}
//                         className="mr-2 w-4 h-4 text-red-600"
//                       />
//                       <span className="text-red-700 font-medium">✗ Reject (Fails)</span>
//                     </label>
//                   </div>

//                   {inspectionStatus === 'rejected' && (
//                     <div className="mt-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Rejection Reason <span className="text-red-500">*</span>
//                       </label>
//                       <textarea
//                         value={rejectionReason}
//                         onChange={(e) => setRejectionReason(e.target.value)}
//                         rows="3"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
//                         placeholder="Provide detailed reason for rejection..."
//                       />
//                     </div>
//                   )}

//                   <div className="bg-gray-50 p-3 rounded-md text-sm">
//                     {inspectionStatus === 'approved' ? (
//                       <p className="text-green-800">✅ After approval, next inspection will be due in 15 days.</p>
//                     ) : (
//                       <p className="text-red-800">⚠️ Rejection will remove this vehicle from active fleet. A reason is required.</p>
//                     )}
//                   </div>

//                   <div className="flex space-x-3 pt-2">
//                     <button
//                       onClick={() => submitInspection(selectedDriver.vehicleId, inspectionStatus, rejectionReason)}
//                       disabled={processingInspection}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                     >
//                       {processingInspection ? 'Submitting...' : 'Submit Inspection Result'}
//                     </button>
//                     <button
//                       onClick={() => setShowModal(false)}
//                       className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverInspectionPage;


import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';

const DriverInspectionPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [completedInspections, setCompletedInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inspectionStatus, setInspectionStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingInspection, setProcessingInspection] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDriverDetails, setLoadingDriverDetails] = useState({});
  const [driverDetailsCache, setDriverDetailsCache] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0
  });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // Open image preview
  const openImagePreview = (imageUrl, title) => {
    if (!imageUrl) return;
    const fullUrl = `https://be.shuttleapp.transev.site/${imageUrl}`;
    setSelectedImageUrl(fullUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  // Fetch individual driver details
  const fetchDriverDetails = async (driverId) => {
    // Check cache first
    if (driverDetailsCache[driverId]) {
      console.log('Using cached driver details for:', driverId);
      return driverDetailsCache[driverId];
    }

    try {
      setLoadingDriverDetails(prev => ({ ...prev, [driverId]: true }));
      const token = getAuthToken();

      console.log(`Fetching driver details for: ${driverId}`);
      const response = await fetch(`https://be.shuttleapp.transev.site/admin/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const driverData = await response.json();
        console.log('Driver details received:', driverData);

        // Cache the result
        setDriverDetailsCache(prev => ({ ...prev, [driverId]: driverData }));
        return driverData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching driver ${driverId}:`, error);
      return null;
    } finally {
      setLoadingDriverDetails(prev => ({ ...prev, [driverId]: false }));
    }
  };

  // Calculate inspection urgency based on last inspection date
  const calculateUrgency = (reviewedAt) => {
    if (!reviewedAt) {
      return {
        status: 'pending',
        label: 'First Inspection',
        color: 'blue',
        daysRemaining: 0,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate: null,
        urgencyLevel: 'info'
      };
    }

    const lastInspection = new Date(reviewedAt);
    const nextDueDate = new Date(lastInspection);
    nextDueDate.setDate(lastInspection.getDate() + 15);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = nextDueDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        status: 'overdue',
        label: 'Overdue',
        color: 'red',
        daysRemaining,
        isOverdue: true,
        overdueDays: Math.abs(daysRemaining),
        nextDueDate,
        urgencyLevel: 'critical'
      };
    } else if (daysRemaining <= 3) {
      return {
        status: 'urgent',
        label: 'Urgent',
        color: 'red',
        daysRemaining,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate,
        urgencyLevel: 'high'
      };
    } else if (daysRemaining <= 7) {
      return {
        status: 'warning',
        label: 'Due Soon',
        color: 'orange',
        daysRemaining,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate,
        urgencyLevel: 'medium'
      };
    } else {
      return {
        status: 'good',
        label: 'On Track',
        color: 'green',
        daysRemaining,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate,
        urgencyLevel: 'low'
      };
    }
  };

  // Fetch vehicles inspection statuses from the new API
  const fetchVehiclesInspectionStatuses = async (page = 1, pageSize = 25) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();

      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://be.shuttleapp.transev.site/admin/vehicles/inspection-statuses?page=${page}&page_size=${pageSize}&is_active=true&vehicle_verification_status=verified`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.status}`);
      }

      const data = await response.json();

      const processedVehicles = data.items.map(vehicle => {
        const urgencyInfo = calculateUrgency(vehicle.physical_inspection?.reviewed_at);

        return {
          vehicleId: vehicle.vehicle_id,
          driverId: vehicle.driver?.user_id,
          driverName: vehicle.driver?.full_name || 'Unknown Driver',
          email: vehicle.driver?.email || 'N/A',
          phone: vehicle.driver?.phone || 'N/A',
          vehicleRegNo: vehicle.registration_number,
          vehicleModel: vehicle.vehicle_model,
          vehicleCapacity: vehicle.seat_count,
          hasAC: vehicle.has_ac,
          color: vehicle.color,
          regValidTill: vehicle.registration_valid_till,
          lastInspectionDate: vehicle.physical_inspection?.reviewed_at,
          lastInspectionStatus: vehicle.physical_inspection?.status,
          inspectionReason: vehicle.physical_inspection?.reason,
          isActive: vehicle.is_active,
          vehicleVerificationStatus: vehicle.vehicle_verification_status,
          needsInspection: urgencyInfo.status !== 'good',
          ...urgencyInfo
        };
      });

      const vehiclesNeedingInspection = processedVehicles.filter(v => v.needsInspection === true);
      const sortedVehicles = vehiclesNeedingInspection.sort((a, b) => {
        const urgencyOrder = { overdue: 0, urgent: 1, warning: 2, pending: 3 };
        return urgencyOrder[a.status] - urgencyOrder[b.status];
      });

      setAllVehicles(processedVehicles);
      setVehicles(sortedVehicles);

      setPagination({
        page: data.pagination.page,
        pageSize: data.pagination.page_size,
        total: data.pagination.total,
        totalPages: data.pagination.total_pages,
        hasNext: data.pagination.has_next,
        hasPrevious: data.pagination.has_previous
      });

    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch completed inspections (approved and rejected)
  const fetchCompletedInspections = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        console.error('No authentication token found');
        return [];
      }

      const [approvedResponse, rejectedResponse] = await Promise.all([
        fetch(`https://be.shuttleapp.transev.site/admin/vehicles/inspection-statuses?page=1&page_size=100&inspection_status=approved`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`https://be.shuttleapp.transev.site/admin/vehicles/inspection-statuses?page=1&page_size=100&inspection_status=rejected`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      let completedItems = [];

      if (approvedResponse.ok) {
        const approvedData = await approvedResponse.json();
        completedItems = [...completedItems, ...approvedData.items];
      }

      if (rejectedResponse.ok) {
        const rejectedData = await rejectedResponse.json();
        completedItems = [...completedItems, ...rejectedData.items];
      }

      const processedCompleted = completedItems.map(vehicle => ({
        vehicleId: vehicle.vehicle_id,
        driverId: vehicle.driver?.user_id,
        driverName: vehicle.driver?.full_name || 'Unknown Driver',
        email: vehicle.driver?.email || 'N/A',
        phone: vehicle.driver?.phone || 'N/A',
        vehicleRegNo: vehicle.registration_number,
        vehicleModel: vehicle.vehicle_model,
        vehicleCapacity: vehicle.seat_count,
        hasAC: vehicle.has_ac,
        lastInspectionDate: vehicle.physical_inspection?.reviewed_at,
        inspectionStatus: vehicle.physical_inspection?.status,
        inspectionReason: vehicle.physical_inspection?.reason,
        inspectedAt: vehicle.physical_inspection?.reviewed_at,
        inspectedAtFormatted: vehicle.physical_inspection?.reviewed_at ? new Date(vehicle.physical_inspection.reviewed_at).toLocaleString() : 'N/A',
        isActive: vehicle.is_active,
        status: 'done',
        label: 'Completed',
        statusColor: vehicle.physical_inspection?.status === 'approved' ? 'green' : 'red'
      }));

      processedCompleted.sort((a, b) => {
        return new Date(b.lastInspectionDate) - new Date(a.lastInspectionDate);
      });

      return processedCompleted;

    } catch (error) {
      console.error('Error fetching completed inspections:', error);
      return [];
    }
  };

  // Load all data
  const loadAllData = async () => {
    setRefreshing(true);
    await fetchVehiclesInspectionStatuses();
    const completed = await fetchCompletedInspections();
    setCompletedInspections(completed);
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    await loadAllData();
  };

  // Submit physical inspection
  const submitInspection = async (vehicleId, status, reason = '') => {
    if (!vehicleId) {
      alert('Invalid vehicle ID');
      return;
    }

    if (status === 'rejected' && !reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessingInspection(true);
    try {
      const token = getAuthToken();
      const requestBody = { status };
      if (status === 'rejected' && reason) {
        requestBody.reason = reason;
      }

      const response = await fetch(`https://be.shuttleapp.transev.site/admin/vehicle/inspect/${vehicleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        const successMessage = status === 'approved'
          ? '✅ Vehicle inspection approved! The vehicle will reappear for next inspection in 15 days.'
          : `❌ Vehicle inspection rejected. Reason: ${reason}`;

        alert(successMessage);

        setShowModal(false);
        setSelectedVehicle(null);
        setInspectionStatus('approved');
        setRejectionReason('');

        // Clear driver cache to refresh data
        setDriverDetailsCache({});
        await loadAllData();
      } else {
        alert(`Failed to submit inspection: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
      alert('Error connecting to server. Please try again.');
    } finally {
      setProcessingInspection(false);
    }
  };

  const getUrgencyBadge = (status) => {
    const badges = {
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: ExclamationTriangleIcon, label: 'Overdue', border: 'border-red-200' },
      urgent: { bg: 'bg-orange-100', text: 'text-orange-800', icon: ClockIcon, label: 'Urgent', border: 'border-orange-200' },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon, label: 'Due Soon', border: 'border-yellow-200' },
      pending: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CalendarIcon, label: 'First Time', border: 'border-blue-200' }
    };

    const badge = badges[status];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold">{badge.label}</span>
      </div>
    );
  };

  const getDaysLeftDisplay = (request) => {
    if (request.status === 'pending') {
      return { text: 'First Time', color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    if (request.isOverdue) {
      return { text: `Overdue by ${request.overdueDays} day${request.overdueDays > 1 ? 's' : ''}`, color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (request.daysRemaining <= 3) {
      return { text: `${request.daysRemaining} day${request.daysRemaining > 1 ? 's' : ''} left`, color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (request.daysRemaining <= 7) {
      return { text: `${request.daysRemaining} day${request.daysRemaining > 1 ? 's' : ''} left`, color: 'text-orange-600', bg: 'bg-orange-50' };
    }
    return { text: `${request.daysRemaining} day${request.daysRemaining > 1 ? 's' : ''} left`, color: 'text-green-600', bg: 'bg-green-50' };
  };

  const toggleRowExpand = async (vehicleId, driverId) => {
    const isExpanding = !expandedRows.has(vehicleId);

    if (isExpanding && driverId) {
      // Fetch driver details when expanding
      await fetchDriverDetails(driverId);
    }

    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedRows(newExpanded);
  };

  const getFilteredRequests = () => {
    let items = [];
    if (filter === 'done') {
      items = completedInspections;
    } else if (filter === 'all') {
      items = vehicles;
    } else {
      items = vehicles.filter(req => req.status === filter);
    }

    if (searchTerm) {
      return items.filter(item =>
        item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return items;
  };

  const openInspectionModal = (request) => {
    setSelectedVehicle(request);
    setShowModal(true);
    setInspectionStatus('approved');
    setRejectionReason('');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    return {
      overdue: vehicles.filter(r => r.status === 'overdue').length,
      urgent: vehicles.filter(r => r.status === 'urgent').length,
      warning: vehicles.filter(r => r.status === 'warning').length,
      pending: vehicles.filter(r => r.status === 'pending').length,
      completed: completedInspections.length,
      total: vehicles.length
    };
  };

  const stats = getStats();
  const filteredRequests = getFilteredRequests();

  useEffect(() => {
    loadAllData();
  }, []);

  // ESC key handler for image modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showImageModal]);

  const StatCard = ({ title, value, color, icon: Icon, subtitle }) => (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 border-${color}-500 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-50 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading inspection requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="bg-red-100 rounded-full p-4 mx-auto mb-4">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <button
                onClick={loadAllData}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicle Inspection Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Track and manage vehicle inspections (15-day cycle)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                    title="Refresh data"
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by driver or vehicle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <StatCard title="Overdue" value={stats.overdue} color="red" icon={ExclamationTriangleIcon} subtitle="Past inspection date" />
              <StatCard title="Urgent" value={stats.urgent} color="orange" icon={ClockIcon} subtitle="0-3 days left" />
              <StatCard title="Due Soon" value={stats.warning} color="yellow" icon={ClockIcon} subtitle="4-7 days left" />
              <StatCard title="First Time" value={stats.pending} color="blue" icon={CalendarIcon} subtitle="Never inspected" />
              <StatCard title="Total Due" value={stats.total} color="gray" icon={TruckIcon} subtitle="Need inspection now" />
              <StatCard title="Completed" value={stats.completed} color="green" icon={CheckCircleIcon} subtitle="Inspections done" />
            </div>

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">📋 How It Works:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-blue-800">
                    <li>Vehicles appear here 15 days after last inspection</li>
                    <li>After approval, vehicle disappears for 15 days</li>
                    <li>Rejected vehicles are removed from active fleet</li>
                    <li>Click on any card to view complete driver details</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === 'all'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  All Vehicles ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('overdue')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === 'overdue'
                      ? 'bg-red-600 text-white shadow-md shadow-red-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  ⚠️ Overdue ({stats.overdue})
                </button>
                <button
                  onClick={() => setFilter('urgent')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === 'urgent'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  🔴 Urgent ({stats.urgent})
                </button>
                <button
                  onClick={() => setFilter('warning')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === 'warning'
                      ? 'bg-yellow-600 text-white shadow-md shadow-yellow-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  🟡 Due Soon ({stats.warning})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === 'pending'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  🆕 First Time ({stats.pending})
                </button>
                <button
                  onClick={() => setFilter('done')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filter === 'done'
                      ? 'bg-green-600 text-white shadow-md shadow-green-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  ✅ Completed ({stats.completed})
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredRequests.length}</span> of{' '}
                <span className="font-semibold text-gray-900">
                  {filter === 'done' ? completedInspections.length : vehicles.length}
                </span>{' '}
                {filter === 'done' ? 'completed inspections' : 'vehicles'}
              </p>
            </div>

            {/* Inspection Cards */}
            <div className="space-y-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => {
                  const daysLeftInfo = request.status !== 'done' ? getDaysLeftDisplay(request) : null;
                  const isExpanded = expandedRows.has(request.vehicleId);
                  const driverDetails = driverDetailsCache[request.driverId];
                  const isLoadingDriver = loadingDriverDetails[request.driverId];

                  return (
                    <div key={request.vehicleId} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      {/* Main Row */}
                      <div className="p-5 cursor-pointer" onClick={() => toggleRowExpand(request.vehicleId, request.driverId)}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          {/* Driver & Vehicle Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{request.driverName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{request.phone}</span>
                                  <span>•</span>
                                  <span className="text-xs">{request.email}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-13">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-medium text-gray-900">{request.vehicleRegNo}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-sm text-gray-600">{request.vehicleModel}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{request.vehicleCapacity} seats</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{request.hasAC ? '❄️ AC' : '🌡️ Non-AC'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status & Action */}
                          <div className="flex items-center gap-4">
                            {filter !== 'done' ? (
                              <>
                                {getUrgencyBadge(request.status)}
                                <div className={`px-3 py-1.5 rounded-lg ${daysLeftInfo.bg}`}>
                                  <span className={`text-sm font-semibold ${daysLeftInfo.color}`}>
                                    {daysLeftInfo.text}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className={`px-3 py-1.5 rounded-lg ${request.inspectionStatus === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                                <span className={`text-sm font-semibold ${request.inspectionStatus === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                                  {request.inspectionStatus === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                </span>
                              </div>
                            )}

                            {filter !== 'done' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openInspectionModal(request);
                                }}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                              >
                                Start Inspection
                              </button>
                            )}

                            {filter === 'done' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Inspection Details:\n\nVehicle: ${request.vehicleRegNo}\nDriver: ${request.driverName}\nDate: ${formatDateTime(request.inspectedAt)}\nResult: ${request.inspectionStatus?.toUpperCase()}\n${request.inspectionReason ? `Reason: ${request.inspectionReason}` : ''}`);
                                }}
                                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                            )}

                            <button className="text-gray-400 hover:text-gray-600">
                              {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details with Driver Info */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 p-5 rounded-b-xl">
                          {isLoadingDriver ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="mt-2 text-sm text-gray-500">Loading driver details...</p>
                            </div>
                          ) : driverDetails ? (
                            <div className="space-y-4">
                              {/* Driver Complete Information */}
                              <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <UserIcon className="h-5 w-5 text-blue-600" />
                                  Driver Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Personal Details</p>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Full Name:</span>
                                        <span className="font-medium text-gray-900">{driverDetails.profile?.full_name || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium text-gray-900">{driverDetails.email || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-medium text-gray-900">{driverDetails.profile?.phone || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Verification Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${driverDetails.profile?.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                          {driverDetails.profile?.verification_status || 'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Account Status</p>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Account Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${driverDetails.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                          {driverDetails.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Account Number:</span>
                                        <span className="font-medium text-gray-900">{driverDetails.account_info?.account_number || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">IFSC Code:</span>
                                        <span className="font-medium text-gray-900">{driverDetails.account_info?.IFSC_code || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Documents Section */}
                              {driverDetails.profile?.documents && (
                                <div>
                                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                    Driver Documents
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {driverDetails.profile.documents.aadhaar_url && (
                                      <button
                                        onClick={() => openImagePreview(driverDetails.profile.documents.aadhaar_url, 'Aadhaar Card')}
                                        className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between group w-full text-left"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Aadhaar Card</p>
                                          <p className="text-xs text-gray-500">{driverDetails.profile.documents.aadhaar_number}</p>
                                        </div>
                                        <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                      </button>
                                    )}
                                    {driverDetails.profile.documents.pan_url && (
                                      <button
                                        onClick={() => openImagePreview(driverDetails.profile.documents.pan_url, 'PAN Card')}
                                        className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between group w-full text-left"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">PAN Card</p>
                                          <p className="text-xs text-gray-500">{driverDetails.profile.documents.pan_number}</p>
                                        </div>
                                        <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                      </button>
                                    )}
                                    {driverDetails.profile.documents.dl_url && (
                                      <button
                                        onClick={() => openImagePreview(driverDetails.profile.documents.dl_url, 'Driving License')}
                                        className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between group w-full text-left"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Driving License</p>
                                          <p className="text-xs text-gray-500">{driverDetails.profile.documents.driving_license_number}</p>
                                        </div>
                                        <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Vehicle Information */}
                              {driverDetails.vehicle && (
                                <div>
                                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <TruckIcon className="h-5 w-5 text-blue-600" />
                                    Vehicle Information
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Vehicle Details</p>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Registration No:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.reg_no}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Vehicle Name:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.vehical_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Model:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.model}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Color:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.color}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Capacity:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.capacity} seats</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">AC:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.has_ac ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Ownership Type:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.vehical_owner_ship_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Owner Name:</span>
                                          <span className="font-medium text-gray-900">{driverDetails.vehicle.owner_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500">Registration Valid Till:</span>
                                          <span className="font-medium text-gray-900">{formatDate(driverDetails.vehicle.reg_valid_till)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Vehicle Documents</p>
                                      <div className="space-y-2">
                                        {driverDetails.vehicle.rc_file_path && (
                                          <button
                                            onClick={() => openImagePreview(driverDetails.vehicle.rc_file_path, 'RC Certificate')}
                                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                                          >
                                            <span className="text-sm text-gray-700">RC Certificate</span>
                                            <EyeIcon className="h-4 w-4 text-gray-400" />
                                          </button>
                                        )}
                                        {driverDetails.vehicle.insurance_document && (
                                          <button
                                            onClick={() => openImagePreview(driverDetails.vehicle.insurance_document, 'Insurance Document')}
                                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                                          >
                                            <span className="text-sm text-gray-700">Insurance Document</span>
                                            <EyeIcon className="h-4 w-4 text-gray-400" />
                                          </button>
                                        )}
                                        {driverDetails.vehicle.pollution_document && (
                                          <button
                                            onClick={() => openImagePreview(driverDetails.vehicle.pollution_document, 'Pollution Certificate')}
                                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
                                          >
                                            <span className="text-sm text-gray-700">Pollution Certificate</span>
                                            <EyeIcon className="h-4 w-4 text-gray-400" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Vehicle Photos */}
                                  <div className="mt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Vehicle Photos</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                      {driverDetails.vehicle.front_photo_file_path && (
                                        <button
                                          onClick={() => openImagePreview(driverDetails.vehicle.front_photo_file_path, 'Front View')}
                                          className="bg-white rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                        >
                                          <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center">
                                            <TruckIcon className="h-8 w-8 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-gray-600">Front View</span>
                                        </button>
                                      )}
                                      {driverDetails.vehicle.rear_photo_file_path && (
                                        <button
                                          onClick={() => openImagePreview(driverDetails.vehicle.rear_photo_file_path, 'Rear View')}
                                          className="bg-white rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                        >
                                          <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center">
                                            <TruckIcon className="h-8 w-8 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-gray-600">Rear View</span>
                                        </button>
                                      )}
                                      {driverDetails.vehicle.left_side_file_path && (
                                        <button
                                          onClick={() => openImagePreview(driverDetails.vehicle.left_side_file_path, 'Left Side View')}
                                          className="bg-white rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                        >
                                          <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center">
                                            <TruckIcon className="h-8 w-8 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-gray-600">Left Side</span>
                                        </button>
                                      )}
                                      {driverDetails.vehicle.right_side_file_path && (
                                        <button
                                          onClick={() => openImagePreview(driverDetails.vehicle.right_side_file_path, 'Right Side View')}
                                          className="bg-white rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                        >
                                          <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center">
                                            <TruckIcon className="h-8 w-8 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-gray-600">Right Side</span>
                                        </button>
                                      )}
                                      {driverDetails.vehicle.interior_photo_file_path && (
                                        <button
                                          onClick={() => openImagePreview(driverDetails.vehicle.interior_photo_file_path, 'Interior View')}
                                          className="bg-white rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                                        >
                                          <div className="w-full h-20 bg-gray-100 rounded mb-1 flex items-center justify-center">
                                            <TruckIcon className="h-8 w-8 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-gray-600">Interior</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Bank Account Document */}
                              {driverDetails.account_info?.passbook_url && (
                                <div>
                                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <BanknotesIcon className="h-5 w-5 text-blue-600" />
                                    Bank Account Document
                                  </h4>
                                  <button
                                    onClick={() => openImagePreview(driverDetails.account_info.passbook_url, 'Passbook / Cancelled Cheque')}
                                    className="bg-white rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between group w-full text-left"
                                  >
                                    <span className="text-sm text-gray-700">Passbook / Cancelled Cheque</span>
                                    <EyeIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                  </button>
                                </div>
                              )}

                              {/* Physical Inspection Info */}
                              {driverDetails.vehical_physical_inspection && (
                                <div>
                                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                                    Physical Inspection Information
                                  </h4>
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-500">Inspection Status</p>
                                        <p className={`text-sm font-semibold mt-1 ${driverDetails.vehical_physical_inspection.inspection_status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                          {driverDetails.vehical_physical_inspection.inspection_status?.toUpperCase() || 'N/A'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Inspection Date</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                          {driverDetails.vehical_physical_inspection.inspection_reviewed_at ?
                                            formatDateTime(driverDetails.vehical_physical_inspection.inspection_reviewed_at) : 'N/A'}
                                        </p>
                                      </div>
                                      {driverDetails.vehical_physical_inspection.inspection_reason && (
                                        <div>
                                          <p className="text-xs text-gray-500">Rejection Reason</p>
                                          <p className="text-sm text-red-600 mt-1">{driverDetails.vehical_physical_inspection.inspection_reason}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500">Unable to load driver details</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
                  <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    {filter === 'done' ? 'No completed inspections found.' : 'All inspections are up to date!'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {filter === 'done' ? 'Completed inspections will appear here.' : 'No vehicles require inspection at this time.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">{selectedImageTitle}</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Image Container */}
            <div className="p-6 flex items-center justify-center bg-gray-50" style={{ minHeight: '400px' }}>
              <img
                src={selectedImageUrl}
                alt={selectedImageTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  e.target.alt = 'Image not available';
                }}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
              <p className="text-sm text-gray-500">Click outside or press ESC to close</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.open(selectedImageUrl, '_blank');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {showModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Vehicle Inspection</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Warning Banner */}
              {(selectedVehicle.status === 'overdue' || selectedVehicle.status === 'urgent') && (
                <div className={`mb-6 p-4 rounded-lg ${selectedVehicle.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border`}>
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className={`h-6 w-6 ${selectedVehicle.status === 'overdue' ? 'text-red-600' : 'text-orange-600'} flex-shrink-0`} />
                    <div>
                      <h4 className={`font-semibold ${selectedVehicle.status === 'overdue' ? 'text-red-800' : 'text-orange-800'}`}>
                        {selectedVehicle.status === 'overdue' ? '⚠️ INSPECTION OVERDUE!' : '⚠️ URGENT: Inspection Due Soon!'}
                      </h4>
                      <p className="text-sm mt-1">
                        {selectedVehicle.status === 'overdue'
                          ? `This inspection is overdue by ${selectedVehicle.overdueDays} days. Immediate action required!`
                          : `Only ${selectedVehicle.daysRemaining} days remaining for inspection.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver & Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                    Driver Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedVehicle.driverName}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedVehicle.phone}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedVehicle.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-gray-500" />
                    Vehicle Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Registration:</span> {selectedVehicle.vehicleRegNo}</p>
                    <p><span className="text-gray-500">Model:</span> {selectedVehicle.vehicleModel}</p>
                    <p><span className="text-gray-500">Capacity:</span> {selectedVehicle.vehicleCapacity} seats</p>
                    <p><span className="text-gray-500">AC:</span> {selectedVehicle.hasAC ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Inspection History */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Inspection History</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Last Inspection Date</p>
                    <p className="font-medium">{formatDateTime(selectedVehicle.lastInspectionDate) || 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Previous Result</p>
                    <p className="font-medium capitalize">{selectedVehicle.lastInspectionStatus || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Decision */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Decision</h3>
                <div className="space-y-4">
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="approved"
                        checked={inspectionStatus === 'approved'}
                        onChange={(e) => {
                          setInspectionStatus(e.target.value);
                          setRejectionReason('');
                        }}
                        className="mr-2 w-4 h-4 text-green-600"
                      />
                      <span className="text-green-700 font-medium">✓ Approve (Passes)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="rejected"
                        checked={inspectionStatus === 'rejected'}
                        onChange={(e) => setInspectionStatus(e.target.value)}
                        className="mr-2 w-4 h-4 text-red-600"
                      />
                      <span className="text-red-700 font-medium">✗ Reject (Fails)</span>
                    </label>
                  </div>

                  {inspectionStatus === 'rejected' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Provide detailed reason for rejection..."
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    {inspectionStatus === 'approved' ? (
                      <p className="text-blue-800">✅ After approval, next inspection will be due in 15 days.</p>
                    ) : (
                      <p className="text-red-800">⚠️ Rejection will remove this vehicle from active fleet. A reason is required.</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => submitInspection(selectedVehicle.vehicleId, inspectionStatus, rejectionReason)}
                      disabled={processingInspection}
                      className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      {processingInspection ? 'Submitting...' : 'Submit Inspection Result'}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverInspectionPage;