// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
// import {
//   XMarkIcon,
//   UserIcon,
//   EnvelopeIcon,
//   PhoneIcon,
//   TruckIcon,
//   CreditCardIcon,
//   DocumentTextIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ExclamationTriangleIcon,
//   EyeIcon,
//   ShieldCheckIcon,
//   BanknotesIcon,
//   IdentificationIcon,
//   DocumentDuplicateIcon,
//   CalendarIcon,
//   UsersIcon,
//   MagnifyingGlassIcon,
//   BuildingOfficeIcon,
//   KeyIcon,
//   MapPinIcon,
//   ClipboardDocumentListIcon,
//   ArrowDownTrayIcon,
//   CameraIcon,
//   PhotoIcon
// } from "@heroicons/react/24/outline";

// const DriverList = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [driverDetails, setDriverDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [selectedImageTitle, setSelectedImageTitle] = useState("");
//   const [isMobile, setIsMobile] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const hasFetched = useRef(false);
//   const navigate = useNavigate();

//   // Check if mobile/tablet view
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Fetch detailed driver information
//   const fetchDriverDetails = async (userId, driverName) => {
//     console.log("Fetching driver details for userId:", userId, "Name:", driverName);
//     setDetailsLoading(true);
//     setShowModal(true); // Show modal immediately with loading state
    
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         console.error("No access token found");
//         alert("Authentication token not found. Please login again.");
//         setShowModal(false);
//         return;
//       }

//       const response = await axios.get(
//         `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       console.log("Driver details response:", response.data);
//       setDriverDetails(response.data);
//     } catch (error) {
//       console.error("Error fetching driver details:", error);
//       const errorMessage = error.response?.data?.message || error.message || "Failed to fetch driver details. Please try again.";
//       alert(errorMessage);
//       setShowModal(false);
//       setDriverDetails(null);
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   // Close modal
//   const closeModal = () => {
//     setShowModal(false);
//     setDriverDetails(null);
//   };

//   // Open image preview
//   const openImagePreview = (imageUrl, title) => {
//     const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://be.shuttleapp.transev.site/${imageUrl}`;
//     setSelectedImage(fullUrl);
//     setSelectedImageTitle(title);
//     setShowImageModal(true);
//   };

//   // Close image preview
//   const closeImagePreview = () => {
//     setShowImageModal(false);
//     setSelectedImage(null);
//     setSelectedImageTitle("");
//   };

//   // Download image
//   const downloadImage = async () => {
//     try {
//       const response = await fetch(selectedImage);
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = selectedImageTitle.replace(/\s/g, '_') + '.jpg';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error downloading image:", error);
//     }
//   };

//   // Render KYC Verification Status
//   const renderKycVerification = (driver) => {
//     const status = driver.profile?.verification?.toLowerCase();

//     switch (status) {
//       case "verified":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
//             <CheckCircleIcon className="w-3 h-3" />
//             Verified
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
//             <XCircleIcon className="w-3 h-3" />
//             Rejected
//           </span>
//         );
//       case "pending":
//         return (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/admin/providers/${driver.user_id}`);
//             }}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition whitespace-nowrap"
//           >
//             <ExclamationTriangleIcon className="w-3 h-3" />
//             Pending - Verify
//           </button>
//         );
//       case "draft":
//         return (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/admin/providers/${driver.user_id}`);
//             }}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition whitespace-nowrap"
//           >
//             <DocumentTextIcon className="w-3 h-3" />
//             Draft - Verify
//           </button>
//         );
//       default:
//         return (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate(`/admin/providers/${driver.user_id}`);
//             }}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition whitespace-nowrap"
//           >
//             <UserIcon className="w-3 h-3" />
//             Not Started
//           </button>
//         );
//     }
//   };

//   // Render Bus Status
//   const renderBusStatus = (driver) => {
//     const status = driver.vehicle?.verification?.toLowerCase();

//     switch (status) {
//       case "verified":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
//             <CheckCircleIcon className="w-3 h-3" />
//             Verified
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
//             <XCircleIcon className="w-3 h-3" />
//             Rejected
//           </span>
//         );
//       case "pending":
//         return (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate("/admin/verify-drivers", { state: { userId: driver.user_id } });
//             }}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition whitespace-nowrap"
//           >
//             <ExclamationTriangleIcon className="w-3 h-3" />
//             Pending - Verify Bus
//           </button>
//         );
//       case "draft":
//         return (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               navigate("/admin/verify-drivers", { state: { userId: driver.user_id } });
//             }}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition whitespace-nowrap"
//           >
//             <DocumentTextIcon className="w-3 h-3" />
//             Draft - Verify Bus
//           </button>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 whitespace-nowrap">
//             <ExclamationTriangleIcon className="w-3 h-3" />
//             Not Started
//           </span>
//         );
//     }
//   };

//   // Fetch drivers from API
//   const fetchDrivers = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");

//       if (!token) {
//         console.error("No access token found");
//         setLoading(false);
//         setInitialLoad(false);
//         return;
//       }

//       const response = await axios.get(
//         "https://be.shuttleapp.transev.site/admin/view/all-drivers",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const driversWithDetails = await Promise.all(
//         response.data.map(async (driver) => {
//           try {
//             const res = await axios.get(
//               `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             return {
//               ...driver,
//               profile: {
//                 ...driver.profile,
//                 verification: res.data.profile?.verification || "draft",
//                 full_name: res.data.profile?.full_name || driver.profile?.name,
//                 phone: res.data.profile?.phone || driver.profile?.phone,
//                 documents: {
//                   ...driver.profile?.documents,
//                   aadhaar_url: res.data.profile?.documents?.aadhaar_url,
//                   pan_url: res.data.profile?.documents?.pan_url,
//                   dl_url: res.data.profile?.documents?.dl_url,
//                 }
//               },
//               vehicle: {
//                 ...driver.bus_details,
//                 verification: res.data.vehicle?.verification || "N/A",
//                 vehical_name: res.data.vehicle?.vehical_name || driver.bus_details?.vehical_name,
//                 color: res.data.vehicle?.color || driver.bus_details?.color,
//                 model: res.data.vehicle?.model || driver.bus_details?.model,
//                 capacity: res.data.vehicle?.capacity || driver.bus_details?.capacity,
//                 has_ac: res.data.vehicle?.has_ac || driver.bus_details?.ac,
//                 reg_no: res.data.vehicle?.reg_no || driver.bus_details?.reg_no,
//                 reg_valid_till: res.data.vehicle?.reg_valid_till || driver.bus_details?.reg_valid_till,
//                 rc_file_path: res.data.vehicle?.rc_file_path,
//                 rear_photo_file_path: res.data.vehicle?.rear_photo_file_path,
//                 front_photo_file_path: res.data.vehicle?.front_photo_file_path,
//                 interior_photo_file_path: res.data.vehicle?.interior_photo_file_path,
//                 left_side_file_path: res.data.vehicle?.left_side_file_path,
//                 right_side_file_path: res.data.vehicle?.right_side_file_path,
//                 vechical_auth_file_path: res.data.vehicle?.vechical_auth_file_path,
//                 insurance_document: res.data.vehicle?.insurance_document,
//                 pollution_document: res.data.vehicle?.pollution_document,
//                 owner_aadhaar_card: res.data.vehicle?.owner_aadhaar_card,
//                 owner_name: res.data.vehicle?.owner_name,
//                 vechical_verification_req_date: res.data.vehicle?.vechical_verification_req_date,
//                 vehical_reviewed_at: res.data.vehicle?.vehical_reviewed_at,
//                 vehical_owner_ship_type: res.data.vehicle?.vehical_owner_ship_type || driver.bus_details?.vehical_owner_ship_type,
//               },
//               account_info: res.data.account_info || driver.account_info,
//               vehical_physical_inspection: res.data.vehical_physical_inspection,
//             };
//           } catch (err) {
//             console.error("Error fetching driver details:", driver.user_id, err);
//             return {
//               ...driver,
//               profile: {
//                 ...driver.profile,
//                 verification: "draft",
//               },
//               vehicle: {
//                 ...driver.bus_details,
//                 verification: "N/A",
//               },
//             };
//           }
//         })
//       );

//       setDrivers(driversWithDetails);
//     } catch (error) {
//       console.error("Error fetching drivers:", error);
//       alert("Failed to load drivers. Please check your connection and try again.");
//     } finally {
//       setLoading(false);
//       setInitialLoad(false);
//     }
//   };

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;
//     fetchDrivers();
//   }, []);

//   useEffect(() => {
//     const handleFocus = () => {
//       const refresh = localStorage.getItem("refreshDriversList");
//       if (refresh === "true") {
//         fetchDrivers().finally(() => {
//           localStorage.removeItem("refreshDriversList");
//         });
//       }
//     };

//     window.addEventListener("focus", handleFocus);
//     return () => window.removeEventListener("focus", handleFocus);
//   }, []);

//   const filteredDrivers = drivers.filter((driver) =>
//     driver.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     driver.profile?.phone?.includes(searchTerm)
//   );

//   if (initialLoad || loading) {
//     return (
//       <div className="flex h-screen bg-gray-50 overflow-hidden">
//         <Sidebar onClose={() => setSidebarOpen(false)} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//           <TopNavbarUltra 
//             onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//             isMobile={isMobile}
//             title="Drivers List"
//           />
//           <div className="flex-1 flex items-center justify-center p-4">
//             <div className="text-center">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
//               <p className="text-gray-500">Loading drivers...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       <Sidebar onClose={() => setSidebarOpen(false)} />
      
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
//         <TopNavbarUltra 
//           onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
//           isMobile={isMobile}
//           title="Drivers List"
//         />

//         <div className="flex-1 overflow-y-auto">
//           <div className="p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto">
//               {/* Header */}
//               <div className="mb-6 sm:mb-8">
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Drivers</h1>
//                 <p className="text-sm text-gray-500 mt-1">Manage and view all driver information</p>
//               </div>

//               {/* Search */}
//               <div className="mb-4 sm:mb-6">
//                 <div className="relative max-w-md">
//                   <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, email, or phone..."
//                     className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* Table */}
//               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//                 <div className="overflow-x-auto">
//                   <table className="min-w-[1000px] lg:min-w-full w-full divide-y divide-gray-100">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
//                         <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Status</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100 bg-white">
//                       {filteredDrivers.length > 0 ? (
//                         filteredDrivers.map((driver) => (
//                           <tr 
//                             key={driver.user_id} 
//                             className="hover:bg-gray-50 transition-colors cursor-pointer"
//                             onClick={() => fetchDriverDetails(driver.user_id, driver.profile?.name)}
//                           >
//                             <td className="px-3 sm:px-6 py-3 sm:py-4">
//                               <div className="text-left">
//                                 <div className="font-medium text-gray-900 hover:underline text-sm sm:text-base">
//                                   {driver.profile?.name || "N/A"}
//                                 </div>
//                                 <div className="text-xs sm:text-sm text-gray-500 mt-0.5 break-all">{driver.email || "N/A"}</div>
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-6 py-3 sm:py-4">
//                               <div className="text-sm text-gray-900">{driver.profile?.phone || "N/A"}</div>
//                               <div className="text-xs text-gray-500 mt-0.5">
//                                 {driver.is_active ? "Active" : "Inactive"}
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
//                               {renderKycVerification(driver)}
//                             </td>
//                             <td className="px-3 sm:px-6 py-3 sm:py-4">
//                               <div className="space-y-1 text-xs sm:text-sm">
//                                 <div className="text-gray-600 break-all">Aadhaar: {driver.profile?.documents?.aadhaar_number || "N/A"}</div>
//                                 <div className="text-gray-600 break-all">PAN: {driver.profile?.documents?.pan_number || "N/A"}</div>
//                                 <div className="text-gray-600 break-all">DL: {driver.profile?.documents?.driving_license_number || "N/A"}</div>
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-6 py-3 sm:py-4">
//                               <div className="space-y-1 text-xs sm:text-sm">
//                                 <div className="text-gray-600 break-all">ACC: {driver.account_info?.account_number || "N/A"}</div>
//                                 <div className="text-gray-600 break-all">IFSC: {driver.account_info?.IFSC_code || "N/A"}</div>
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-6 py-3 sm:py-4">
//                               <div className="space-y-1 text-xs sm:text-sm">
//                                 <div className="text-gray-600 break-all">{driver.vehicle?.reg_no || "N/A"}</div>
//                                 <div className="text-gray-600">{driver.vehicle?.vehical_name || driver.vehicle?.model || "N/A"} • {driver.vehicle?.capacity || "N/A"} seats</div>
//                                 <div className="text-gray-600">{driver.vehicle?.has_ac ? "AC" : "Non-AC"}</div>
//                                 <div className="text-xs text-gray-400">Ownership: {driver.vehicle?.vehical_owner_ship_type || "N/A"}</div>
//                               </div>
//                             </td>
//                             <td className="px-3 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
//                               {renderBusStatus(driver)}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="7" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500">
//                             No drivers found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Driver Details Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-3 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={closeModal} />

//             <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl sm:rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full mx-3 sm:mx-0">
//               {detailsLoading ? (
//                 <div className="flex items-center justify-center p-8 sm:p-12">
//                   <div className="text-center">
//                     <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-black mb-3"></div>
//                     <p className="text-gray-500 text-sm sm:text-base">Loading driver details...</p>
//                   </div>
//                 </div>
//               ) : driverDetails ? (
//                 <>
//                   {/* Header */}
//                   <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-black rounded-xl">
//                         <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Driver Profile</h3>
//                         <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{driverDetails.profile?.full_name || "Driver Information"}</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={closeModal}
//                       className="p-2 hover:bg-gray-100 rounded-xl transition-colors self-end sm:self-auto"
//                     >
//                       <XMarkIcon className="w-5 h-5 text-gray-500" />
//                     </button>
//                   </div>

//                   {/* Content */}
//                   <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
//                     {/* Basic Information */}
//                     <div className="mb-6">
//                       <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
//                         <UserIcon className="w-4 h-4" /> Basic Information
//                       </h4>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <p className="text-xs text-gray-500">Full Name</p>
//                           <p className="text-sm font-medium text-gray-900">{driverDetails.profile?.full_name || "N/A"}</p>
//                         </div>
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <p className="text-xs text-gray-500">Email</p>
//                           <p className="text-sm text-gray-900 break-all">{driverDetails.email || "N/A"}</p>
//                         </div>
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <p className="text-xs text-gray-500">Phone</p>
//                           <p className="text-sm text-gray-900">{driverDetails.profile?.phone || "N/A"}</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status */}
//                     <div className="mb-6">
//                       <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
//                         <ShieldCheckIcon className="w-4 h-4" /> Status
//                       </h4>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <p className="text-xs text-gray-500">Account Status</p>
//                           <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${driverDetails.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//                             {driverDetails.is_active ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <p className="text-xs text-gray-500">KYC Status</p>
//                           <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
//                             driverDetails.profile?.verification === "verified" ? "bg-green-100 text-green-700" :
//                             driverDetails.profile?.verification === "rejected" ? "bg-red-100 text-red-700" :
//                             driverDetails.profile?.verification === "pending" ? "bg-yellow-100 text-yellow-700" :
//                             "bg-gray-100 text-gray-600"
//                           }`}>
//                             {driverDetails.profile?.verification || "Not Started"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Vehicle Information */}
//                     {driverDetails.vehicle && (
//                       <div className="mb-6">
//                         <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
//                           <TruckIcon className="w-4 h-4" /> Vehicle Information
//                         </h4>
//                         <div className="p-3 bg-gray-50 rounded-lg">
//                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                             <div>
//                               <p className="text-xs text-gray-500">Registration Number</p>
//                               <p className="text-sm font-medium text-gray-900">{driverDetails.vehicle.reg_no || "N/A"}</p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500">Vehicle Name</p>
//                               <p className="text-sm text-gray-900">{driverDetails.vehicle.vehical_name || "N/A"}</p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500">Model</p>
//                               <p className="text-sm text-gray-900">{driverDetails.vehicle.model || "N/A"}</p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500">Capacity</p>
//                               <p className="text-sm text-gray-900">{driverDetails.vehicle.capacity || "N/A"} seats</p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500">AC</p>
//                               <p className="text-sm text-gray-900">{driverDetails.vehicle.has_ac ? "Yes" : "No"}</p>
//                             </div>
//                             <div>
//                               <p className="text-xs text-gray-500">Verification Status</p>
//                               <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
//                                 driverDetails.vehicle.verification === "verified" ? "bg-green-100 text-green-700" :
//                                 driverDetails.vehicle.verification === "rejected" ? "bg-red-100 text-red-700" :
//                                 "bg-yellow-100 text-yellow-700"
//                               }`}>
//                                 {driverDetails.vehicle.verification || "N/A"}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Bank Account */}
//                     {driverDetails.account_info && (
//                       <div className="mb-6">
//                         <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
//                           <BanknotesIcon className="w-4 h-4" /> Bank Account
//                         </h4>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                           <div className="p-3 bg-gray-50 rounded-lg">
//                             <p className="text-xs text-gray-500">Account Number</p>
//                             <p className="text-sm font-medium text-gray-900 break-all">{driverDetails.account_info.account_number || "N/A"}</p>
//                           </div>
//                           <div className="p-3 bg-gray-50 rounded-lg">
//                             <p className="text-xs text-gray-500">IFSC Code</p>
//                             <p className="text-sm text-gray-900">{driverDetails.account_info.IFSC_code || "N/A"}</p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Footer */}
//                   <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
//                     <button
//                       onClick={closeModal}
//                       className="px-3 sm:px-5 py-1.5 sm:py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors text-xs sm:text-sm font-medium"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </>
//               ) : null}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Preview Modal */}
//       {showImageModal && selectedImage && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-3 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={closeImagePreview} />

//             <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl sm:rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full mx-3 sm:mx-0">
//               <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                 <div>
//                   <h3 className="text-base sm:text-lg font-semibold text-gray-900">{selectedImageTitle}</h3>
//                   <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Document preview</p>
//                 </div>
//                 <div className="flex items-center gap-2 self-end sm:self-auto">
//                   <button onClick={downloadImage} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                     <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
//                   </button>
//                   <button onClick={closeImagePreview} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
//                     <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-4 sm:p-6 flex items-center justify-center bg-gray-50">
//                 <img
//                   src={selectedImage}
//                   alt={selectedImageTitle}
//                   className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-lg"
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
//                   }}
//                 />
//               </div>

//               <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
//                 <button onClick={closeImagePreview} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-xs sm:text-sm font-medium">
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DriverList;
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  IdentificationIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [driverDetails, setDriverDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchDriverDetails = async (userId) => {
    console.log("Fetching driver details for userId:", userId);
    setDetailsLoading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        alert("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.get(
        `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Driver details response:", response.data);
      setDriverDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching driver details:", error);
      alert("Failed to fetch driver details. Please try again.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setDriverDetails(null);
    }, 300);
  };

  const openImagePreview = (imageUrl, title) => {
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://be.shuttleapp.transev.site/${imageUrl}`;
    setSelectedImage(fullUrl);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  const closeImagePreview = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageTitle("");
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedImageTitle.replace(/\s/g, '_') + '.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Fixed: Use 'verification' field from API response
  const renderKycVerification = (driver) => {
    const status = driver.profile?.verification?.toLowerCase();

    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
            <CheckCircleIcon className="w-3 h-3" />
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
            <XCircleIcon className="w-3 h-3" />
            Rejected
          </span>
        );
      case "pending":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/providers/${driver.user_id}`);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
          >
            <ExclamationTriangleIcon className="w-3 h-3" />
            Pending
          </button>
        );
      default:
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/providers/${driver.user_id}`);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
          >
            <UserIcon className="w-3 h-3" />
            Not Started
          </button>
        );
    }
  };

  // Fixed: Use 'status' field from bus_details
  const renderBusStatus = (driver) => {
    const status = driver.bus_details?.status?.toLowerCase();

    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
            <CheckCircleIcon className="w-3 h-3" />
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
            <XCircleIcon className="w-3 h-3" />
            Rejected
          </span>
        );
      case "pending":
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/admin/verify-drivers", { state: { userId: driver.user_id } });
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
          >
            <ExclamationTriangleIcon className="w-3 h-3" />
            Pending
          </button>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500">
            <ExclamationTriangleIcon className="w-3 h-3" />
            Not Started
          </span>
        );
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      const response = await axios.get(
        "https://be.shuttleapp.transev.site/admin/view/all-drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Drivers fetched:", response.data);
      setDrivers(response.data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      alert("Failed to load drivers. Please check your connection and try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter((driver) =>
    driver.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.profile?.phone?.includes(searchTerm)
  );

  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
          <TopNavbarUltra onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Drivers List" />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
              <p className="text-gray-500">Loading drivers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
        <TopNavbarUltra onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} title="Drivers List" />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Drivers</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and view all driver information</p>
              </div>

              <div className="mb-4 sm:mb-6">
                <div className="relative max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] lg:min-w-full w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredDrivers.length > 0 ? (
                        filteredDrivers.map((driver) => (
                          <tr 
                            key={driver.user_id} 
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => fetchDriverDetails(driver.user_id)}
                          >
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div>
                                <div className="font-medium text-gray-900 hover:underline text-sm sm:text-base">
                                  {driver.profile?.name || "N/A"}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 mt-0.5 break-all">{driver.email || "N/A"}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="text-sm text-gray-900">{driver.profile?.phone || "N/A"}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {driver.is_active ? "Active" : "Inactive"}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                              {renderKycVerification(driver)}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="space-y-1 text-xs sm:text-sm">
                                <div className="text-gray-600 break-all">Aadhaar: {driver.profile?.documents?.aadhaar_number || "N/A"}</div>
                                <div className="text-gray-600 break-all">PAN: {driver.profile?.documents?.pan_number || "N/A"}</div>
                                <div className="text-gray-600 break-all">DL: {driver.profile?.documents?.driving_license_number || "N/A"}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="space-y-1 text-xs sm:text-sm">
                                <div className="text-gray-600 break-all">ACC: {driver.account_info?.account_number || "N/A"}</div>
                                <div className="text-gray-600 break-all">IFSC: {driver.account_info?.IFSC_code || "N/A"}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="space-y-1 text-xs sm:text-sm">
                                <div className="text-gray-600 break-all">{driver.bus_details?.reg_no || "N/A"}</div>
                                <div className="text-gray-600">{driver.bus_details?.model || "N/A"} • {driver.bus_details?.capacity || "N/A"} seats</div>
                                <div className="text-gray-600">{driver.bus_details?.ac ? "AC" : "Non-AC"}</div>
                                <div className="text-xs text-gray-400">Ownership: {driver.bus_details?.vehical_owner_ship_type || "N/A"}</div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                              {renderBusStatus(driver)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500">
                            No drivers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900">
                Driver Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-3"></div>
                    <p className="text-gray-500">Loading driver details...</p>
                  </div>
                </div>
              ) : driverDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="text-base font-medium text-gray-900">{driverDetails.profile?.full_name || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-base text-gray-900 break-all">{driverDetails.email || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="text-base text-gray-900">{driverDetails.profile?.phone || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Account Status</p>
                        <span className={`inline-flex px-2 py-1 rounded-lg text-sm font-medium ${driverDetails.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {driverDetails.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KYC Status */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5" />
                      KYC Verification
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-gray-600">Verification Status:</span>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          driverDetails.profile?.verification_status === "verified" ? "bg-green-100 text-green-700" :
                          driverDetails.profile?.verification_status === "rejected" ? "bg-red-100 text-red-700" :
                          driverDetails.profile?.verification_status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {driverDetails.profile?.verification_status || "Not Started"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5" />
                      Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Aadhaar Number</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{driverDetails.profile?.documents?.aadhaar_number || "N/A"}</p>
                        {driverDetails.profile?.documents?.aadhaar_url && (
                          <button
                            onClick={() => openImagePreview(driverDetails.profile.documents.aadhaar_url, "Aadhaar Card")}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <EyeIcon className="w-3 h-3" />
                            View Document
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{driverDetails.profile?.documents?.pan_number || "N/A"}</p>
                        {driverDetails.profile?.documents?.pan_url && (
                          <button
                            onClick={() => openImagePreview(driverDetails.profile.documents.pan_url, "PAN Card")}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <EyeIcon className="w-3 h-3" />
                            View Document
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Driving License</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{driverDetails.profile?.documents?.driving_license_number || "N/A"}</p>
                        {driverDetails.profile?.documents?.dl_url && (
                          <button
                            onClick={() => openImagePreview(driverDetails.profile.documents.dl_url, "Driving License")}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <EyeIcon className="w-3 h-3" />
                            View Document
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  {driverDetails.vehicle && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <TruckIcon className="w-5 h-5" />
                        Vehicle Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Registration Number</p>
                          <p className="text-base font-medium text-gray-900">{driverDetails.vehicle.reg_no || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Vehicle Name</p>
                          <p className="text-base text-gray-900">{driverDetails.vehicle.vehical_name || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Model</p>
                          <p className="text-base text-gray-900">{driverDetails.vehicle.model || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Color</p>
                          <p className="text-base text-gray-900">{driverDetails.vehicle.color || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-base text-gray-900">{driverDetails.vehicle.capacity || "N/A"} seats</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">AC</p>
                          <p className="text-base text-gray-900">{driverDetails.vehicle.has_ac ? "Yes" : "No"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Verification Status</p>
                          <span className={`inline-flex px-2 py-1 rounded-lg text-sm font-medium ${
                            driverDetails.vehicle.verification === "verified" ? "bg-green-100 text-green-700" :
                            driverDetails.vehicle.verification === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {driverDetails.vehicle.verification || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Account */}
                  {driverDetails.account_info && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <BanknotesIcon className="w-5 h-5" />
                        Bank Account
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Account Number</p>
                          <p className="text-base font-medium text-gray-900 break-all">{driverDetails.account_info.account_number || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">IFSC Code</p>
                          <p className="text-base text-gray-900">{driverDetails.account_info.IFSC_code || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No driver data available</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">{selectedImageTitle}</h3>
              <div className="flex items-center gap-2">
                <button onClick={downloadImage} className="text-gray-500 hover:text-gray-700">
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button onClick={closeImagePreview} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50">
              <img
                src={selectedImage}
                alt={selectedImageTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeImagePreview}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
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

export default DriverList;