// import React, { useState, useEffect } from 'react';
// import { 
//   TruckIcon, 
//   CheckCircleIcon, 
//   XCircleIcon as XMarkIcon,
//   ClockIcon,
//   CalendarIcon,
//   EyeIcon,
//   ExclamationTriangleIcon,
//   ArrowPathIcon
// } from '@heroicons/react/24/outline';
// import Sidebar from '../../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../../assets/components/navbar/TopNavbar';

// const DriverInspectionPage = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [inspectionRequests, setInspectionRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [inspectionStatus, setInspectionStatus] = useState('approved');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [processingInspection, setProcessingInspection] = useState(false);
//   const [filter, setFilter] = useState('all');
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [lastAOIStatus, setLastAOIStatus] = useState(null);
//   const [showAOIStatus, setShowAOIStatus] = useState(false);

//   // Get auth token
//   const getAuthToken = () => {
//     return localStorage.getItem("access_token");
//   };

//   // Fetch vehicle details including inspection status
//   const fetchVehicleDetails = async (vehicleId) => {
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

//   // Fetch all drivers that need inspection
//   useEffect(() => {
//     fetchAllDriversForInspection();
//   }, []);

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

//   // Check if vehicle needs inspection based on last inspection date
//   const needsInspection = (lastInspectionDate) => {
//     if (!lastInspectionDate) return true; // Never inspected, needs inspection
    
//     const lastInspection = new Date(lastInspectionDate);
//     const nextDueDate = new Date(lastInspection);
//     nextDueDate.setDate(lastInspection.getDate() + 15);
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     // Return true if today is on or after next due date
//     return today >= nextDueDate;
//   };

//   // Calculate days until next inspection is due
//   const calculateDaysUntilDue = (lastInspectionDate) => {
//     if (!lastInspectionDate) return { daysRemaining: 0, nextDueDate: null, status: 'pending' };
    
//     const lastInspection = new Date(lastInspectionDate);
//     const nextDueDate = new Date(lastInspection);
//     nextDueDate.setDate(lastInspection.getDate() + 15);
    
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const diffTime = nextDueDate.getTime() - today.getTime();
//     const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     let status = 'pending';
//     if (daysRemaining < 0) {
//       status = 'overdue';
//     } else if (daysRemaining <= 3) {
//       status = 'urgent';
//     } else if (daysRemaining <= 7) {
//       status = 'warning';
//     }
    
//     return { 
//       daysRemaining, 
//       nextDueDate, 
//       status,
//       isOverdue: daysRemaining < 0,
//       overdueDays: daysRemaining < 0 ? Math.abs(daysRemaining) : 0
//     };
//   };

//   const fetchAllDriversForInspection = async () => {
//     setLoading(true);
//     try {
//       const token = getAuthToken();
      
//       // First, get list of all drivers
//       const response = await fetch('https://be.shuttleapp.transev.site/admin/view/all-drivers', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const allDrivers = await response.json();
        
//         // Filter drivers that have vehicle status as 'verified' and have vehicle_id
//         const verifiedDrivers = allDrivers.filter(
//           (driver) => driver.bus_details && 
//                      driver.bus_details.status === 'verified' &&
//                      driver.bus_details.vehicle_id
//         );
        
//         // Fetch vehicle details and driver details for each
//         const driversWithInspectionStatus = await Promise.all(
//           verifiedDrivers.map(async (driver) => {
//             const [vehicleDetails, detailedDriver] = await Promise.all([
//               fetchVehicleDetails(driver.bus_details.vehicle_id),
//               fetchDriverDetails(driver.user_id)
//             ]);
            
//             // Get the last inspection date from vehicle details
//             const lastInspectionDate = vehicleDetails?.physical_inspection?.reviewed_at;
//             const inspectionStatus_value = vehicleDetails?.physical_inspection?.status;
            
//             // Check if vehicle needs inspection
//             const needsInspectionNow = needsInspection(lastInspectionDate);
//             const dueInfo = calculateDaysUntilDue(lastInspectionDate);
            
//             return {
//               ...driver,
//               ...detailedDriver,
//               vehicleId: driver.bus_details?.vehicle_id,
//               vehicleRegNo: driver.bus_details?.reg_no || 'N/A',
//               vehicleModel: driver.bus_details?.model || 'N/A',
//               vehicleCapacity: driver.bus_details?.capacity || 'N/A',
//               hasAC: driver.bus_details?.ac || false,
//               regValidTill: driver.bus_details?.reg_valid_till,
//               rcFilePath: driver.bus_details?.rc_file_path,
//               rearPhotoPath: driver.bus_details?.rear_photo_file_path,
//               vehicleStatus: driver.bus_details?.status || 'verified',
//               lastInspectionDate: lastInspectionDate,
//               lastInspectionStatus: inspectionStatus_value,
//               needsInspection: needsInspectionNow,
//               daysRemaining: dueInfo.daysRemaining,
//               nextDueDate: dueInfo.nextDueDate,
//               isOverdue: dueInfo.isOverdue,
//               overdueDays: dueInfo.overdueDays,
//               inspectionStatus: dueInfo.status
//             };
//           })
//         );
        
//         // Filter to only show vehicles that need inspection (either never inspected or overdue)
//         const vehiclesNeedingInspection = driversWithInspectionStatus.filter(
//           driver => driver.needsInspection === true
//         );
        
//         setDrivers(vehiclesNeedingInspection);
//         processInspectionRequests(vehiclesNeedingInspection);
//       } else {
//         console.error('Failed to fetch drivers:', response.status);
//         alert('Failed to fetch drivers. Please check your authentication.');
//       }
//     } catch (error) {
//       console.error('Error fetching drivers:', error);
//       alert('Failed to fetch drivers. Please check your connection.');
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

//   // Process drivers to create inspection requests
//   const processInspectionRequests = (driverList) => {
//     const requests = driverList.map(driver => ({
//       driverId: driver.user_id,
//       driverName: driver.profile?.name || 'N/A',
//       email: driver.email,
//       phone: driver.profile?.phone || 'N/A',
//       lastReviewedDate: driver.lastInspectionDate,
//       lastInspectionStatus: driver.lastInspectionStatus,
//       nextDueDate: driver.nextDueDate,
//       daysRemaining: driver.daysRemaining,
//       inspectionStatus: driver.inspectionStatus,
//       isOverdue: driver.isOverdue,
//       overdueDays: driver.overdueDays,
//       vehicleId: driver.vehicleId,
//       vehicleRegNo: driver.vehicleRegNo,
//       vehicleModel: driver.vehicleModel,
//       vehicleCapacity: driver.vehicleCapacity,
//       hasAC: driver.hasAC,
//       regValidTill: driver.regValidTill,
//       rcFilePath: driver.rcFilePath,
//       rearPhotoPath: driver.rearPhotoPath,
//       vehicleStatus: driver.vehicleStatus,
//       profileVerification: driver.profile?.verification || 'N/A',
//       documents: driver.profile?.documents || {},
//       accountInfo: driver.account_info || {}
//     }));

//     requests.sort((a, b) => {
//       if (a.isOverdue && !b.isOverdue) return -1;
//       if (!a.isOverdue && b.isOverdue) return 1;
//       return a.daysRemaining - b.daysRemaining;
//     });
    
//     setInspectionRequests(requests);
//   };

//   // Function to fetch AOI (Vehicle Details) status for a vehicle
//   const fetchAOIStatus = async (vehicleId) => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`https://be.shuttleapp.transev.site/admin/vehicle/details/${vehicleId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         return {
//           success: true,
//           data: {
//             vehicle_id: data.vehicle_id,
//             inspection_status: data.physical_inspection?.status,
//             reviewed_at: data.physical_inspection?.reviewed_at,
//             reason: data.physical_inspection?.reason,
//             is_active: data.is_active,
//             last_updated: new Date().toISOString()
//           }
//         };
//       } else {
//         return {
//           success: false,
//           error: `Failed to fetch AOI status: ${response.status}`
//         };
//       }
//     } catch (error) {
//       console.error('Error fetching AOI status:', error);
//       return {
//         success: false,
//         error: error.message
//       };
//     }
//   };

//   // Submit physical inspection using the POST API
//   const submitInspection = async (vehicleId, status, reason = '') => {
//     if (!vehicleId) {
//       alert('Invalid vehicle ID');
//       return;
//     }

//     // Validate reason if status is rejected
//     if (status === 'rejected' && !reason.trim()) {
//       alert('Please provide a reason for rejection');
//       return;
//     }

//     setProcessingInspection(true);
//     try {
//       const token = getAuthToken();
      
//       // Construct the payload according to the POST API format
//       const requestBody = { status };
//       if (status === 'rejected' && reason) {
//         requestBody.reason = reason;
//       }
      
//       console.log('Submitting inspection to POST API:', {
//         url: `https://be.shuttleapp.transev.site/admin/vehicle/inspect/${vehicleId}`,
//         body: requestBody
//       });
      
//       // Make the POST API call to submit inspection
//       const response = await fetch(`https://be.shuttleapp.transev.site/admin/vehicle/inspect/${vehicleId}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();
      
//       // Check response status
//       if (response.ok && data.status === 'success') {
//         // After successful submission, fetch the latest AOI status from GET API
//         const aoiStatus = await fetchAOIStatus(vehicleId);
        
//         if (aoiStatus.success) {
//           // Store AOI status in state
//           setLastAOIStatus(aoiStatus.data);
//           setShowAOIStatus(true);
          
//           // Auto-hide AOI status after 10 seconds
//           setTimeout(() => {
//             setShowAOIStatus(false);
//           }, 10000);
          
//           // Calculate next inspection date
//           const nextInspectionDate = new Date();
//           nextInspectionDate.setDate(nextInspectionDate.getDate() + 15);
          
//           // Display comprehensive AOI status
//           const statusMessage = `
// ✅ Inspection ${status === 'approved' ? 'Approved' : 'Rejected'} Successfully!

// 📋 Vehicle Details (AOI Status):
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚗 Vehicle ID: ${aoiStatus.data.vehicle_id?.substring(0, 8)}...
// 📊 Inspection Status: ${aoiStatus.data.inspection_status?.toUpperCase() || 'PENDING'}
// 🕐 Reviewed At: ${aoiStatus.data.reviewed_at ? new Date(aoiStatus.data.reviewed_at).toLocaleString() : 'Just now'}
// ${aoiStatus.data.reason ? `📝 Reason: ${aoiStatus.data.reason}` : ''}
// 🔘 Active Status: ${aoiStatus.data.is_active ? '✅ Active' : '❌ Inactive'}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ${status === 'approved' 
//   ? `✨ Next inspection will be due on: ${nextInspectionDate.toLocaleDateString()} (15 days from now)\n✨ This vehicle will not appear for inspection until then.` 
//   : '⚠️ The vehicle has been marked as rejected and requires attention.'}
//           `;
          
//           alert(statusMessage);
//         } else {
//           alert(`✅ Inspection ${status} but failed to fetch vehicle details: ${aoiStatus.error}`);
//         }
        
//         setShowModal(false);
//         setSelectedDriver(null);
//         setInspectionStatus('approved');
//         setRejectionReason('');
        
//         // Refresh the entire list to get updated data from backend
//         // This will automatically remove the vehicle from inspection list if it was approved
//         await fetchAllDriversForInspection();
//       } else {
//         // Handle error response
//         const errorMessage = data.message || data.error || 'Failed to submit inspection';
//         alert(`❌ Submission Failed\n\n${errorMessage}\n\nPlease try again or contact support.`);
        
//         // Log error data
//         console.error('Inspection Submission Error:', {
//           status: response.status,
//           error: errorMessage,
//           full_response: data
//         });
//       }
//     } catch (error) {
//       console.error('Error submitting inspection:', error);
//       alert('Error connecting to server. Please check your network connection and try again.');
//     } finally {
//       setProcessingInspection(false);
//     }
//   };

//   const getInspectionUrgencyInfo = (daysRemaining, isOverdue, overdueDays) => {
//     if (isOverdue) {
//       return { 
//         color: 'text-red-600', 
//         bg: 'bg-red-100', 
//         label: `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`,
//         badgeColor: 'bg-red-100 text-red-800'
//       };
//     } else if (daysRemaining <= 3) {
//       return { 
//         color: 'text-red-600', 
//         bg: 'bg-red-100', 
//         label: `Urgent - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
//         badgeColor: 'bg-red-100 text-red-800'
//       };
//     } else if (daysRemaining <= 7) {
//       return { 
//         color: 'text-orange-600', 
//         bg: 'bg-orange-100', 
//         label: `${daysRemaining} days left`,
//         badgeColor: 'bg-orange-100 text-orange-800'
//       };
//     } else {
//       return { 
//         color: 'text-green-600', 
//         bg: 'bg-green-100', 
//         label: `${daysRemaining} days left`,
//         badgeColor: 'bg-green-100 text-green-800'
//       };
//     }
//   };

//   const getActionButton = (request) => {
//     // If vehicle has been inspected within the last 15 days, show "Not Due" button
//     if (!request.needsInspection && request.lastReviewedDate) {
//       const nextDate = new Date(request.nextDueDate);
//       return (
//         <div className="space-y-1">
//           <button
//             disabled
//             className="px-3 py-1 bg-gray-400 text-white text-sm font-medium rounded-md cursor-not-allowed w-full"
//           >
//             ✓ Inspection Complete
//           </button>
//           <p className="text-xs text-green-600 text-center">
//             Next due: {nextDate.toLocaleDateString()}
//           </p>
//         </div>
//       );
//     }
    
//     if (request.isOverdue) {
//       return (
//         <div className="space-y-2">
//           <button
//             onClick={() => openInspectionModal(request)}
//             className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors w-full"
//           >
//             ⚠️ Immediate Action Required
//           </button>
//           <p className="text-xs text-red-600">Overdue by {request.overdueDays} days</p>
//         </div>
//       );
//     } else if (request.daysRemaining <= 3) {
//       return (
//         <div className="space-y-2">
//           <button
//             onClick={() => openInspectionModal(request)}
//             className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors w-full"
//           >
//             Schedule Urgent Inspection
//           </button>
//           <p className="text-xs text-red-600">Only {request.daysRemaining} days remaining!</p>
//         </div>
//       );
//     } else {
//       return (
//         <button
//           onClick={() => openInspectionModal(request)}
//           className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors w-full"
//         >
//           Schedule Inspection
//         </button>
//       );
//     }
//   };

//   const filteredRequests = inspectionRequests.filter(req => {
//     if (filter === 'all') return true;
//     if (filter === 'pending') return !req.isOverdue && req.daysRemaining > 7;
//     if (filter === 'urgent') return !req.isOverdue && req.daysRemaining <= 7 && req.daysRemaining > 0;
//     if (filter === 'overdue') return req.isOverdue;
//     return true;
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
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   // Calculate statistics
//   const getStats = () => {
//     return {
//       pending: inspectionRequests.filter(r => !r.isOverdue && r.daysRemaining > 7).length,
//       urgent: inspectionRequests.filter(r => !r.isOverdue && r.daysRemaining <= 7 && r.daysRemaining > 0).length,
//       overdue: inspectionRequests.filter(r => r.isOverdue).length,
//       total: inspectionRequests.length
//     };
//   };

//   const stats = getStats();

//   // AOI Status Display Component
//   const AOIStatusDisplay = () => {
//     if (!showAOIStatus || !lastAOIStatus) return null;
    
//     return (
//       <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-l-4 border-blue-500 max-w-sm z-50 animate-slide-up">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <div className="flex items-center mb-2">
//               <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
//               <h4 className="font-semibold text-sm text-gray-900">Vehicle Status (AOI)</h4>
//             </div>
//             <div className="space-y-1 text-xs">
//               <p>
//                 <span className="text-gray-500">Vehicle ID:</span>{' '}
//                 <span className="font-mono">{lastAOIStatus.vehicle_id?.substring(0, 12)}...</span>
//               </p>
//               <p>
//                 <span className="text-gray-500">Inspection Status:</span>{' '}
//                 <span className={`ml-1 font-medium ${
//                   lastAOIStatus.inspection_status === 'approved' 
//                     ? 'text-green-600' 
//                     : lastAOIStatus.inspection_status === 'rejected'
//                     ? 'text-red-600'
//                     : 'text-yellow-600'
//                 }`}>
//                   {lastAOIStatus.inspection_status?.toUpperCase() || 'PENDING'}
//                 </span>
//               </p>
//               {lastAOIStatus.reviewed_at && (
//                 <p>
//                   <span className="text-gray-500">Reviewed:</span>{' '}
//                   <span>{new Date(lastAOIStatus.reviewed_at).toLocaleString()}</span>
//                 </p>
//               )}
//               {lastAOIStatus.reason && (
//                 <p>
//                   <span className="text-gray-500">Reason:</span>{' '}
//                   <span className="text-red-600">{lastAOIStatus.reason}</span>
//                 </p>
//               )}
//               <p>
//                 <span className="text-gray-500">Active:</span>{' '}
//                 <span>{lastAOIStatus.is_active ? '✅ Yes' : '❌ No'}</span>
//               </p>
//             </div>
//           </div>
//           <button 
//             onClick={() => setShowAOIStatus(false)}
//             className="text-gray-400 hover:text-gray-600 ml-3"
//           >
//             <XMarkIcon className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//     );
//   };

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
//               <p className="text-sm text-gray-400 mt-2">Fetching driver and vehicle details...</p>
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
//                     <h1 className="text-2xl font-bold text-gray-900">Vehicle Inspection Tracker</h1>
//                     <p className="text-gray-600 mt-1">Track upcoming vehicle inspections (15-day cycle)</p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center space-x-4">
//                   {/* Refresh Button */}
//                   <button
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
//                     title="Refresh data"
//                   >
//                     <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
//                   </button>
                  
//                   {/* Filter Tabs */}
//                   <div className="flex space-x-2">
//                     {['all', 'pending', 'urgent', 'overdue'].map((tab) => (
//                       <button
//                         key={tab}
//                         onClick={() => setFilter(tab)}
//                         className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
//                           filter === tab
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                         }`}
//                       >
//                         {tab}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Statistics Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">On Track</p>
//                     <p className="text-2xl font-bold">{stats.pending}</p>
//                     <p className="text-xs text-gray-500">More than 7 days remaining</p>
//                   </div>
//                   <CheckCircleIcon className="h-8 w-8 text-green-500" />
//                 </div>
//               </div>
              
//               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Urgent</p>
//                     <p className="text-2xl font-bold">{stats.urgent}</p>
//                     <p className="text-xs text-orange-600">7 days or less remaining</p>
//                   </div>
//                   <ClockIcon className="h-8 w-8 text-orange-500" />
//                 </div>
//               </div>
              
//               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Overdue</p>
//                     <p className="text-2xl font-bold">{stats.overdue}</p>
//                     <p className="text-xs text-red-600">Past inspection deadline</p>
//                   </div>
//                   <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
//                 </div>
//               </div>
              
//               <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Total Due Now</p>
//                     <p className="text-2xl font-bold">{stats.total}</p>
//                     <p className="text-xs text-gray-500">Requiring immediate inspection</p>
//                   </div>
//                   <CalendarIcon className="h-8 w-8 text-blue-500" />
//                 </div>
//               </div>
//             </div>

//             {/* Info Banner */}
//             <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start space-x-3">
//                 <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
//                 <div className="text-sm text-blue-800">
//                   <p className="font-medium mb-1">How Inspection Cycle Works:</p>
//                   <ul className="list-disc list-inside space-y-1">
//                     <li>Vehicles appear here only when inspection is due (15 days after last inspection)</li>
//                     <li>After you approve an inspection, the vehicle will disappear from this list</li>
//                     <li>The vehicle will automatically reappear after 15 days for the next inspection</li>
//                     <li>Rejected vehicles are removed from active fleet and won't appear for inspection</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             {/* Last Updated Info */}
//             <div className="mb-4 text-right">
//               <p className="text-xs text-gray-400">
//                 Last updated: {new Date().toLocaleString()}
//               </p>
//             </div>

//             {/* Inspection Requests Table */}
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-900">Vehicles Requiring Inspection</h2>
//                 <p className="text-sm text-gray-600">Vehicles are shown only when inspection is due (15 days after last inspection)</p>
//               </div>
              
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Inspection</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Due Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Status</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredRequests.map((request) => {
//                       const urgency = getInspectionUrgencyInfo(request.daysRemaining, request.isOverdue, request.overdueDays);
                      
//                       return (
//                         <tr key={request.vehicleId || request.driverId} className="hover:bg-gray-50 transition-colors">
//                           <td className="px-6 py-4">
//                             <div>
//                               <div className="font-medium text-gray-900">{request.driverName}</div>
//                               <div className="text-sm text-gray-500">{request.email}</div>
//                               <div className="text-sm text-gray-500">{request.phone}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div>
//                               <div className="font-medium text-gray-900">{request.vehicleRegNo}</div>
//                               <div className="text-sm text-gray-500">Model: {request.vehicleModel}</div>
//                               <div className="text-sm text-gray-500">Capacity: {request.vehicleCapacity} seats</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="text-sm">
//                               {request.lastReviewedDate ? (
//                                 <>
//                                   <div>{formatDateTime(request.lastReviewedDate)}</div>
//                                   <div className="text-xs text-gray-500 mt-1">
//                                     Status: {request.lastInspectionStatus || 'N/A'}
//                                   </div>
//                                 </>
//                               ) : (
//                                 <span className="text-yellow-600">Never inspected</span>
//                               )}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${urgency.bg} ${urgency.color}`}>
//                               {urgency.label}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div>
//                               <div className="font-medium">{formatDate(request.nextDueDate)}</div>
//                               <div className="text-xs text-gray-500">
//                                 {request.nextDueDate ? new Date(request.nextDueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
//                               </div>
//                             </div>
//                            </td>
//                           <td className="px-6 py-4">
//                             <div>
//                               <span className={`text-lg font-bold ${urgency.color}`}>
//                                 {request.isOverdue ? `-${request.overdueDays}` : request.daysRemaining}
//                               </span>
//                               <span className="text-sm text-gray-600 ml-1">days</span>
//                               {request.isOverdue && (
//                                 <div className="text-xs text-red-600 mt-1">
//                                   Overdue since {formatDate(request.nextDueDate)}
//                                 </div>
//                               )}
//                             </div>
//                            </td>
//                           <td className="px-6 py-4">
//                             {getActionButton(request)}
//                            </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
              
//               {filteredRequests.length === 0 && (
//                 <div className="text-center py-12">
//                   <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
//                   <p className="text-gray-500 text-lg">All inspections are up to date!</p>
//                   <p className="text-sm text-gray-400 mt-2">No vehicles require inspection at this time.</p>
//                   <p className="text-xs text-gray-400 mt-1">Vehicles will appear here when their next inspection is due (15 days after last inspection).</p>
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
//               <h2 className="text-xl font-bold text-gray-900">
//                 Vehicle Inspection
//               </h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <XMarkIcon className="h-6 w-6" />
//               </button>
//             </div>
            
//             <div className="p-6">
//               {/* Warning for urgent/overdue inspections */}
//               {(selectedDriver.isOverdue || selectedDriver.daysRemaining <= 7) && (
//                 <div className={`mb-6 p-4 rounded-lg ${selectedDriver.isOverdue ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border`}>
//                   <div className="flex items-start space-x-3">
//                     <ExclamationTriangleIcon className={`h-6 w-6 ${selectedDriver.isOverdue ? 'text-red-600' : 'text-orange-600'} flex-shrink-0 mt-0.5`} />
//                     <div>
//                       <h4 className={`font-semibold ${selectedDriver.isOverdue ? 'text-red-800' : 'text-orange-800'}`}>
//                         {selectedDriver.isOverdue ? '⚠️ Inspection Overdue!' : '⚠️ Urgent: Inspection Due Soon!'}
//                       </h4>
//                       <p className={`text-sm ${selectedDriver.isOverdue ? 'text-red-600' : 'text-orange-600'} mt-1`}>
//                         {selectedDriver.isOverdue 
//                           ? `This vehicle's inspection is overdue by ${selectedDriver.overdueDays} days. Immediate action required!`
//                           : `Only ${selectedDriver.daysRemaining} days remaining for inspection. Please schedule immediately.`
//                         }
//                       </p>
//                       <p className="text-sm text-gray-600 mt-2">
//                         Last inspected: {formatDateTime(selectedDriver.lastReviewedDate) || 'Never'}<br />
//                         Inspection due by: {formatDate(selectedDriver.nextDueDate)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Info for first-time inspection */}
//               {!selectedDriver.lastReviewedDate && (
//                 <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
//                   <div className="flex items-start space-x-3">
//                     <InfoIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h4 className="font-semibold text-blue-800">ℹ️ First Time Inspection</h4>
//                       <p className="text-sm text-blue-600 mt-1">
//                         This vehicle has never been inspected. After approval, the next inspection will be due in 15 days.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Driver Information */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Driver Information</h3>
//                 <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-500">Full Name</p>
//                     <p className="font-medium">{selectedDriver.driverName}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Phone</p>
//                     <p className="font-medium">{selectedDriver.phone}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Email</p>
//                     <p className="font-medium">{selectedDriver.email}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Profile Status</p>
//                     <p className="font-medium capitalize">{selectedDriver.profileVerification}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Vehicle Information */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h3>
//                 <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-500">Registration Number</p>
//                     <p className="font-medium">{selectedDriver.vehicleRegNo}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Last Inspection Date</p>
//                     <p className="font-medium">{formatDateTime(selectedDriver.lastReviewedDate) || 'Never inspected'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Next Inspection Due</p>
//                     <p className="font-medium text-orange-600">{formatDate(selectedDriver.nextDueDate) || '15 days from approval'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Days Status</p>
//                     <p className={`font-bold ${selectedDriver.isOverdue ? 'text-red-600' : selectedDriver.daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
//                       {selectedDriver.isOverdue ? `Overdue by ${selectedDriver.overdueDays} days` : selectedDriver.daysRemaining > 0 ? `${selectedDriver.daysRemaining} days remaining` : 'Due now'}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Registration Valid Till</p>
//                     <p className="font-medium">{formatDate(selectedDriver.regValidTill)}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Model</p>
//                     <p className="font-medium">{selectedDriver.vehicleModel}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">Capacity</p>
//                     <p className="font-medium">{selectedDriver.vehicleCapacity} seats</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">AC Available</p>
//                     <p className="font-medium">{selectedDriver.hasAC ? 'Yes' : 'No'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Documents Section */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Driver Documents</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="border rounded-lg p-3">
//                     <p className="text-sm font-medium mb-2">Aadhaar Card</p>
//                     <p className="text-xs text-gray-500 mb-2">{selectedDriver.documents?.aadhaar_number || 'N/A'}</p>
//                     {selectedDriver.documents?.aadhaar_url && (
//                       <button 
//                         onClick={() => window.open(`https://be.shuttleapp.transev.site/${selectedDriver.documents.aadhaar_url.replace(/\\/g, '/')}`, '_blank')}
//                         className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
//                       >
//                         <EyeIcon className="h-4 w-4 mr-1" />
//                         View Document
//                       </button>
//                     )}
//                   </div>
//                   <div className="border rounded-lg p-3">
//                     <p className="text-sm font-medium mb-2">PAN Card</p>
//                     <p className="text-xs text-gray-500 mb-2">{selectedDriver.documents?.pan_number || 'N/A'}</p>
//                     {selectedDriver.documents?.pan_url && (
//                       <button 
//                         onClick={() => window.open(`https://be.shuttleapp.transev.site/${selectedDriver.documents.pan_url.replace(/\\/g, '/')}`, '_blank')}
//                         className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
//                       >
//                         <EyeIcon className="h-4 w-4 mr-1" />
//                         View Document
//                       </button>
//                     )}
//                   </div>
//                   <div className="border rounded-lg p-3">
//                     <p className="text-sm font-medium mb-2">Driving License</p>
//                     <p className="text-xs text-gray-500 mb-2">{selectedDriver.documents?.driving_license_number || 'N/A'}</p>
//                     {selectedDriver.documents?.dl_url && (
//                       <button 
//                         onClick={() => window.open(`https://be.shuttleapp.transev.site/${selectedDriver.documents.dl_url.replace(/\\/g, '/')}`, '_blank')}
//                         className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
//                       >
//                         <EyeIcon className="h-4 w-4 mr-1" />
//                         View Document
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Vehicle Photos */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Documents</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="border rounded-lg p-3">
//                     <p className="text-sm font-medium mb-2">RC Document</p>
//                     {selectedDriver.rcFilePath && selectedDriver.rcFilePath !== 'NA' && (
//                       <button 
//                         onClick={() => window.open(`https://be.shuttleapp.transev.site/${selectedDriver.rcFilePath.replace(/\\/g, '/')}`, '_blank')}
//                         className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
//                       >
//                         <EyeIcon className="h-4 w-4 mr-1" />
//                         View RC Document
//                       </button>
//                     )}
//                     {(!selectedDriver.rcFilePath || selectedDriver.rcFilePath === 'NA') && (
//                       <p className="text-gray-500 text-sm">No document available</p>
//                     )}
//                   </div>
//                   <div className="border rounded-lg p-3">
//                     <p className="text-sm font-medium mb-2">Rear Photo</p>
//                     {selectedDriver.rearPhotoPath && selectedDriver.rearPhotoPath !== 'NA' && (
//                       <button 
//                         onClick={() => window.open(`https://be.shuttleapp.transev.site/${selectedDriver.rearPhotoPath.replace(/\\/g, '/')}`, '_blank')}
//                         className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
//                       >
//                         <EyeIcon className="h-4 w-4 mr-1" />
//                         View Rear Photo
//                       </button>
//                     )}
//                     {(!selectedDriver.rearPhotoPath || selectedDriver.rearPhotoPath === 'NA') && (
//                       <p className="text-gray-500 text-sm">No photo available</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Bank Account Info */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Bank Account Information</h3>
//                 <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
//                   <div>
//                     <p className="text-sm text-gray-500">Account Number</p>
//                     <p className="font-medium">{selectedDriver.accountInfo?.account_number || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500">IFSC Code</p>
//                     <p className="font-medium">{selectedDriver.accountInfo?.IFSC_code || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Inspection Decision */}
//               <div className="border-t pt-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Decision</h3>
//                 <div className="space-y-4">
//                   <div className="flex space-x-4">
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         value="approved"
//                         checked={inspectionStatus === 'approved'}
//                         onChange={(e) => {
//                           setInspectionStatus(e.target.value);
//                           setRejectionReason('');
//                         }}
//                         className="mr-2"
//                       />
//                       <span className="text-green-700 font-medium">Approve - Vehicle Passes Inspection</span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         value="rejected"
//                         checked={inspectionStatus === 'rejected'}
//                         onChange={(e) => {
//                           setInspectionStatus(e.target.value);
//                         }}
//                         className="mr-2"
//                       />
//                       <span className="text-red-700 font-medium">Reject - Vehicle Fails Inspection</span>
//                     </label>
//                   </div>
                  
//                   {/* Reason input - only show when rejected */}
//                   {inspectionStatus === 'rejected' && (
//                     <div className="mt-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Reason for Rejection <span className="text-red-500">*</span>
//                       </label>
//                       <textarea
//                         value={rejectionReason}
//                         onChange={(e) => setRejectionReason(e.target.value)}
//                         rows="3"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                         placeholder="Please provide detailed reason for rejecting this vehicle inspection..."
//                       />
//                       <p className="text-xs text-gray-500 mt-1">
//                         This reason will be recorded and shared with the driver.
//                       </p>
//                     </div>
//                   )}
                  
//                   <div className="bg-yellow-50 p-3 rounded-md">
//                     <p className="text-sm text-yellow-800">
//                       ℹ️ After approval, the next inspection will be scheduled 15 days from today.
//                     </p>
//                     <p className="text-sm text-yellow-800 mt-1">
//                       ✅ The vehicle will disappear from this list and reappear automatically after 15 days.
//                     </p>
//                     {inspectionStatus === 'rejected' && (
//                       <p className="text-sm text-red-600 mt-1">
//                         ⚠️ Rejection will remove this vehicle from the active fleet. A reason must be provided.
//                       </p>
//                     )}
//                   </div>
                  
//                   <div className="flex space-x-3">
//                     <button
//                       onClick={() => submitInspection(selectedDriver.vehicleId, inspectionStatus, rejectionReason)}
//                       disabled={processingInspection}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                     >
//                       {processingInspection ? 'Submitting...' : 'Submit Inspection Result'}
//                     </button>
//                     <button
//                       onClick={() => setShowModal(false)}
//                       className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
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

//       {/* AOI Status Display */}
//       <AOIStatusDisplay />
//     </div>
//   );
// };

// // Info Icon Component
// const InfoIcon = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

// // Add this CSS to your global styles or component
// const styles = `
//   @keyframes slideUp {
//     from {
//       transform: translateY(100%);
//       opacity: 0;
//     }
//     to {
//       transform: translateY(0);
//       opacity: 1;
//     }
//   }
  
//   .animate-slide-up {
//     animation: slideUp 0.3s ease-out;
//   }
// `;

// // Inject styles
// if (typeof document !== 'undefined') {
//   const styleSheet = document.createElement("style");
//   styleSheet.textContent = styles;
//   document.head.appendChild(styleSheet);
// }

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
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';

const DriverInspectionPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [inspectionRequests, setInspectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inspectionStatus, setInspectionStatus] = useState('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingInspection, setProcessingInspection] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("access_token");
  };

  // Fetch vehicle details including inspection status
  const fetchVehicleDetails = async (vehicleId) => {
    if (!vehicleId) return null;
    try {
      const token = getAuthToken();
      const response = await fetch(`https://be.shuttleapp.transev.site/admin/vehicle/details/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const vehicleData = await response.json();
        return vehicleData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching vehicle ${vehicleId}:`, error);
      return null;
    }
  };

  // Fetch individual driver details
  const fetchDriverDetails = async (driverId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`https://be.shuttleapp.transev.site/admin/driver/${driverId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const driverData = await response.json();
        return driverData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching driver ${driverId}:`, error);
      return null;
    }
  };

  // Calculate inspection status
  const getInspectionStatus = (lastInspectionDate) => {
    if (!lastInspectionDate) {
      return {
        status: 'pending',
        label: 'First Inspection',
        color: 'blue',
        daysRemaining: 0,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate: null
      };
    }
    
    const lastInspection = new Date(lastInspectionDate);
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
        nextDueDate
      };
    } else if (daysRemaining <= 3) {
      return {
        status: 'urgent',
        label: 'Urgent',
        color: 'red',
        daysRemaining,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate
      };
    } else if (daysRemaining <= 7) {
      return {
        status: 'warning',
        label: 'Due Soon',
        color: 'orange',
        daysRemaining,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate
      };
    } else {
      return {
        status: 'good',
        label: 'On Track',
        color: 'green',
        daysRemaining,
        isOverdue: false,
        overdueDays: 0,
        nextDueDate
      };
    }
  };

  const fetchAllDriversForInspection = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }
      
      // First, get list of all drivers
      const response = await fetch('https://be.shuttleapp.transev.site/admin/view/all-drivers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch drivers: ${response.status}`);
      }
      
      const allDrivers = await response.json();
      console.log('All drivers fetched:', allDrivers.length);
      
      // Filter drivers that have vehicle status as 'verified'
      const verifiedDrivers = allDrivers.filter(
        (driver) => driver.bus_details && 
                   driver.bus_details.status === 'verified'
      );
      
      console.log('Verified drivers:', verifiedDrivers.length);
      
      if (verifiedDrivers.length === 0) {
        setDrivers([]);
        setInspectionRequests([]);
        setLoading(false);
        return;
      }
      
      // Fetch vehicle details and driver details for each
      const driversWithInspectionStatus = await Promise.all(
        verifiedDrivers.map(async (driver) => {
          try {
            const detailedDriver = await fetchDriverDetails(driver.user_id);
            
            // Get last inspection date from vehicle details if available
            let lastInspectionDate = null;
            let vehicleDetails = null;
            
            if (driver.bus_details?.vehicle_id) {
              vehicleDetails = await fetchVehicleDetails(driver.bus_details.vehicle_id);
              lastInspectionDate = vehicleDetails?.physical_inspection?.reviewed_at;
            }
            
            const inspectionInfo = getInspectionStatus(lastInspectionDate);
            
            // Get driver name from various possible sources
            let driverName = 'Unknown Driver';
            if (detailedDriver?.profile?.full_name) {
              driverName = detailedDriver.profile.full_name;
            } else if (detailedDriver?.profile?.name) {
              driverName = detailedDriver.profile.name;
            } else if (driver.profile?.name) {
              driverName = driver.profile.name;
            } else if (driver.profile?.full_name) {
              driverName = driver.profile.full_name;
            }
            
            // Only include vehicles that need inspection (not in good status)
            const needsInspection = inspectionInfo.status !== 'good';
            
            return {
              driverId: driver.user_id,
              driverName: driverName,
              email: driver.email || 'N/A',
              phone: detailedDriver?.profile?.phone || driver.profile?.phone || 'N/A',
              vehicleId: driver.bus_details?.vehicle_id,
              vehicleRegNo: driver.bus_details?.reg_no || 'N/A',
              vehicleModel: driver.bus_details?.model || 'N/A',
              vehicleCapacity: driver.bus_details?.capacity || 'N/A',
              hasAC: driver.bus_details?.ac || false,
              color: driver.bus_details?.color || 'N/A',
              regValidTill: driver.bus_details?.reg_valid_till,
              rcFilePath: driver.bus_details?.rc_file_path,
              rearPhotoPath: driver.bus_details?.rear_photo_file_path,
              frontPhotoPath: driver.bus_details?.front_photo_file_path,
              interiorPhotoPath: driver.bus_details?.interior_photo_file_path,
              leftSidePhotoPath: driver.bus_details?.left_side_file_path,
              rightSidePhotoPath: driver.bus_details?.right_side_file_path,
              lastInspectionDate: lastInspectionDate,
              lastInspectionStatus: vehicleDetails?.physical_inspection?.status,
              needsInspection: needsInspection,
              ...inspectionInfo,
              profile: detailedDriver?.profile,
              documents: detailedDriver?.profile?.documents || {},
              accountInfo: detailedDriver?.account_info || {}
            };
          } catch (err) {
            console.error('Error processing driver:', driver.user_id, err);
            return null;
          }
        })
      );
      
      // Filter out any failed entries and those that don't need inspection
      const validDrivers = driversWithInspectionStatus.filter(d => d !== null && d.needsInspection === true);
      
      // Sort by urgency
      const sortedVehicles = validDrivers.sort((a, b) => {
        const urgencyOrder = { overdue: 0, urgent: 1, warning: 2, pending: 3 };
        return urgencyOrder[a.status] - urgencyOrder[b.status];
      });
      
      console.log('Vehicles needing inspection:', sortedVehicles.length);
      setDrivers(sortedVehicles);
      setInspectionRequests(sortedVehicles);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllDriversForInspection();
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
        setSelectedDriver(null);
        setInspectionStatus('approved');
        setRejectionReason('');
        
        // Refresh the list
        await fetchAllDriversForInspection();
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

  const getStatusBadge = (status) => {
    const badges = {
      overdue: { color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon, text: 'Overdue' },
      urgent: { color: 'bg-red-100 text-red-800', icon: ClockIcon, text: 'Urgent' },
      warning: { color: 'bg-orange-100 text-orange-800', icon: ClockIcon, text: 'Due Soon' },
      pending: { color: 'bg-blue-100 text-blue-800', icon: CalendarIcon, text: 'First Time' },
      good: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Good' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getActionButton = (request) => {
    const buttonConfig = {
      overdue: { text: '⚠️ Immediate Action Required', color: 'bg-red-600 hover:bg-red-700' },
      urgent: { text: '🚨 Schedule Urgent Inspection', color: 'bg-red-600 hover:bg-red-700' },
      warning: { text: 'Schedule Inspection', color: 'bg-orange-600 hover:bg-orange-700' },
      pending: { text: 'Start First Inspection', color: 'bg-blue-600 hover:bg-blue-700' }
    };
    
    const config = buttonConfig[request.status] || buttonConfig.warning;
    
    return (
      <button
        onClick={() => openInspectionModal(request)}
        className={`px-4 py-2 ${config.color} text-white text-sm font-medium rounded-md transition-colors w-full`}
      >
        {config.text}
      </button>
    );
  };

  const filteredRequests = inspectionRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const openInspectionModal = (request) => {
    setSelectedDriver(request);
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
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics
  const getStats = () => {
    return {
      overdue: inspectionRequests.filter(r => r.status === 'overdue').length,
      urgent: inspectionRequests.filter(r => r.status === 'urgent').length,
      warning: inspectionRequests.filter(r => r.status === 'warning').length,
      pending: inspectionRequests.filter(r => r.status === 'pending').length,
      total: inspectionRequests.length
    };
  };

  const stats = getStats();

  // Initial load
  useEffect(() => {
    fetchAllDriversForInspection();
  }, []);

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
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 mx-auto mb-4">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-red-600 text-lg font-medium">{error}</p>
              <button
                onClick={fetchAllDriversForInspection}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TruckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicle Inspection</h1>
                    <p className="text-gray-600 mt-1">Track and manage vehicle inspections (15-day cycle)</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Refresh data"
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All ({stats.total})
                    </button>
                    <button
                      onClick={() => setFilter('overdue')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Overdue ({stats.overdue})
                    </button>
                    <button
                      onClick={() => setFilter('urgent')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'urgent' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Urgent ({stats.urgent})
                    </button>
                    <button
                      onClick={() => setFilter('warning')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Due Soon ({stats.warning})
                    </button>
                    <button
                      onClick={() => setFilter('pending')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      First Time ({stats.pending})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-gray-500">Past inspection date</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
                <p className="text-xs text-gray-500">0-3 days left</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                <p className="text-xs text-gray-500">4-7 days left</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">First Time</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Never inspected</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
                <p className="text-sm text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Need inspection now</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">📋 How It Works:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Vehicles appear here 15 days after last inspection</li>
                  <li>After approval, vehicle disappears for 15 days</li>
                  <li>Rejected vehicles are removed from active fleet</li>
                </ul>
              </div>
            </div>

            {/* Inspection Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Vehicles Requiring Inspection</h2>
                {inspectionRequests.length === 0 && (
                  <p className="text-sm text-green-600 mt-1">All vehicles are up to date!</p>
                )}
              </div>
              
              {inspectionRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Inspection</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((request) => (
                        <tr key={request.driverId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{request.driverName}</div>
                            <div className="text-sm text-gray-500">{request.phone}</div>
                            <div className="text-xs text-gray-400">{request.email}</div>
                           </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{request.vehicleRegNo}</div>
                            <div className="text-sm text-gray-500">{request.vehicleModel} • {request.vehicleCapacity} seats</div>
                            <div className="text-xs text-gray-400">{request.hasAC ? 'AC' : 'Non-AC'} • {request.color}</div>
                           </td>
                          <td className="px-6 py-4">
                            {request.lastInspectionDate ? (
                              <>
                                <div>{formatDate(request.lastInspectionDate)}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Result: {request.lastInspectionStatus || 'N/A'}
                                </div>
                              </>
                            ) : (
                              <span className="text-blue-600">Never inspected</span>
                            )}
                           </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(request.status)}
                            {request.nextDueDate && request.status !== 'pending' && (
                              <div className="text-xs text-gray-500 mt-1">
                                Due: {formatDate(request.nextDueDate)}
                              </div>
                            )}
                           </td>
                          <td className="px-6 py-4">
                            {request.status === 'pending' ? (
                              <span className="text-blue-600 font-medium">First Time</span>
                            ) : request.isOverdue ? (
                              <span className="text-red-600 font-bold">Overdue by {request.overdueDays}d</span>
                            ) : (
                              <span className={`font-bold ${
                                request.daysRemaining <= 3 ? 'text-red-600' : 
                                request.daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'
                              }`}>
                                {request.daysRemaining} days
                              </span>
                            )}
                           </td>
                          <td className="px-6 py-4">
                            {getActionButton(request)}
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">All inspections are up to date!</p>
                  <p className="text-sm text-gray-400 mt-2">No vehicles require inspection at this time.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Inspection Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Vehicle Inspection</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Warning Banner */}
              {(selectedDriver.status === 'overdue' || selectedDriver.status === 'urgent') && (
                <div className={`mb-6 p-4 rounded-lg ${selectedDriver.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border`}>
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className={`h-6 w-6 ${selectedDriver.status === 'overdue' ? 'text-red-600' : 'text-orange-600'}`} />
                    <div>
                      <h4 className={`font-semibold ${selectedDriver.status === 'overdue' ? 'text-red-800' : 'text-orange-800'}`}>
                        {selectedDriver.status === 'overdue' ? '⚠️ INSPECTION OVERDUE!' : '⚠️ URGENT: Inspection Due Soon!'}
                      </h4>
                      <p className="text-sm mt-1">
                        {selectedDriver.status === 'overdue' 
                          ? `This inspection is overdue by ${selectedDriver.overdueDays} days. Immediate action required!`
                          : `Only ${selectedDriver.daysRemaining} days remaining for inspection.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Driver & Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                    Driver Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {selectedDriver.driverName}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedDriver.phone}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedDriver.email}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-gray-500" />
                    Vehicle Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Registration:</span> {selectedDriver.vehicleRegNo}</p>
                    <p><span className="text-gray-500">Model:</span> {selectedDriver.vehicleModel}</p>
                    <p><span className="text-gray-500">Capacity:</span> {selectedDriver.vehicleCapacity} seats</p>
                    <p><span className="text-gray-500">AC:</span> {selectedDriver.hasAC ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Inspection History */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Inspection History</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Last Inspection Date</p>
                    <p className="font-medium">{formatDateTime(selectedDriver.lastInspectionDate) || 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Previous Result</p>
                    <p className="font-medium capitalize">{selectedDriver.lastInspectionStatus || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Decision */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Decision</h3>
                <div className="space-y-4">
                  <div className="flex space-x-6">
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
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Provide detailed reason for rejection..."
                      />
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    {inspectionStatus === 'approved' ? (
                      <p className="text-green-800">✅ After approval, next inspection will be due in 15 days.</p>
                    ) : (
                      <p className="text-red-800">⚠️ Rejection will remove this vehicle from active fleet. A reason is required.</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => submitInspection(selectedDriver.vehicleId, inspectionStatus, rejectionReason)}
                      disabled={processingInspection}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {processingInspection ? 'Submitting...' : 'Submit Inspection Result'}
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
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