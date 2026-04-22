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
//   ArrowDownTrayIcon
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
//   const hasFetched = useRef(false);
//   const navigate = useNavigate();

//   // Fetch detailed driver information
//   const fetchDriverDetails = async (userId) => {
//     setDetailsLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         console.error("No access token found");
//         return;
//       }

//       const response = await axios.get(
//         `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setDriverDetails(response.data);
//       setShowModal(true);
//     } catch (error) {
//       console.error("Error fetching driver details:", error);
//       alert("Failed to fetch driver details. Please try again.");
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
//     setSelectedImage(`https://be.shuttleapp.transev.site/${imageUrl}`);
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
//     const status = driver.profile?.verification_status?.toLowerCase();

//     switch (status) {
//       case "verified":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
//             <CheckCircleIcon className="w-3 h-3" />
//             Verified
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
//             <XCircleIcon className="w-3 h-3" />
//             Rejected
//           </span>
//         );
//       case "pending":
//         return (
//           <button
//             onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
//           >
//             <ExclamationTriangleIcon className="w-3 h-3" />
//             Pending - Verify
//           </button>
//         );
//       case "draft":
//         return (
//           <button
//             onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
//           >
//             <DocumentTextIcon className="w-3 h-3" />
//             Draft - Verify
//           </button>
//         );
//       default:
//         return (
//           <button
//             onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
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
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
//             <CheckCircleIcon className="w-3 h-3" />
//             Verified
//           </span>
//         );
//       case "rejected":
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700">
//             <XCircleIcon className="w-3 h-3" />
//             Rejected
//           </span>
//         );
//       case "pending":
//         return (
//           <button
//             onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
//           >
//             <ExclamationTriangleIcon className="w-3 h-3" />
//             Pending - Verify Bus
//           </button>
//         );
//       case "draft":
//         return (
//           <button
//             onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
//             className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
//           >
//             <DocumentTextIcon className="w-3 h-3" />
//             Draft - Verify Bus
//           </button>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500">
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
//                 verification_status: res.data.profile?.verification_status || "draft",
//               },
//               vehicle: {
//                 ...driver.bus_details,
//                 verification: res.data.vehicle?.verification || "N/A",
//               },
//               account_info: res.data.account_info || driver.account_info,
//             };
//           } catch (err) {
//             console.error("Error fetching driver details:", driver.user_id, err);
//             return {
//               ...driver,
//               profile: {
//                 ...driver.profile,
//                 verification_status: "draft",
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
//       <div className="flex min-h-screen">
//         <Sidebar />
//         <div className="flex-1 flex flex-col bg-gray-50">
//           <TopNavbarUltra />
//           <div className="flex items-center justify-center h-full p-6">
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
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <TopNavbarUltra />

//         <div className="p-8 flex-1 overflow-auto">
//           <div className="max-w-7xl mx-auto">
//             <div className="mb-8">
//               <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
//               <p className="text-gray-500 mt-1">Manage and view all driver information</p>
//             </div>

//             {/* Search */}
//             <div className="mb-6">
//               <div className="relative max-w-md">
//                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name, email, or phone..."
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-100">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
//                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100 bg-white">
//                     {filteredDrivers.length > 0 ? (
//                       filteredDrivers.map((driver) => (
//                         <tr key={driver.user_id} className="hover:bg-gray-50 transition-colors">
//                           <td className="px-6 py-4">
//                             <button
//                               onClick={() => fetchDriverDetails(driver.user_id)}
//                               className="text-left hover:text-black transition-colors group"
//                             >
//                               <div className="font-medium text-gray-900 group-hover:underline">
//                                 {driver.profile?.name || "N/A"}
//                               </div>
//                               <div className="text-sm text-gray-500 mt-0.5">{driver.email || "N/A"}</div>
//                             </button>
//                            </td>
//                           <td className="px-6 py-4">
//                             <div className="text-sm text-gray-900">{driver.profile?.phone || "N/A"}</div>
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {driver.is_active ? "Active" : "Inactive"}
//                             </div>
//                            </td>
//                           <td className="px-6 py-4">{renderKycVerification(driver)}</td>
//                           <td className="px-6 py-4">
//                             <div className="space-y-1 text-sm">
//                               <div className="text-gray-600">Aadhaar: {driver.profile?.documents?.aadhaar_number || "N/A"}</div>
//                               <div className="text-gray-600">PAN: {driver.profile?.documents?.pan_number || "N/A"}</div>
//                               <div className="text-gray-600">DL: {driver.profile?.documents?.driving_license_number || "N/A"}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="space-y-1 text-sm">
//                               <div className="text-gray-600">ACC: {driver.account_info?.account_number || "N/A"}</div>
//                               <div className="text-gray-600">IFSC: {driver.account_info?.IFSC_code || "N/A"}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="space-y-1 text-sm">
//                               <div className="text-gray-600">{driver.vehicle?.reg_no || "N/A"}</div>
//                               <div className="text-gray-600">{driver.vehicle?.model || "N/A"} • {driver.vehicle?.capacity || "N/A"} seats</div>
//                               <div className="text-gray-600">{driver.vehicle?.ac ? "AC" : "Non-AC"}</div>
//                               <div className="text-xs text-gray-400">Ownership: {driver.vehicle?.vehical_owner_ship_type || "N/A"}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4">{renderBusStatus(driver)}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
//                           No drivers found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Driver Details Modal */}
//       {showModal && driverDetails && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             {/* Background overlay */}
//             <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={closeModal} />

//             {/* Modal panel */}
//             <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
//               {detailsLoading ? (
//                 <div className="flex items-center justify-center p-12">
//                   <div className="text-center">
//                     <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
//                     <p className="text-gray-500">Loading driver details...</p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {/* Header */}
//                   <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-black rounded-xl">
//                         <UserIcon className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-semibold text-gray-900">Driver Profile</h3>
//                         <p className="text-sm text-gray-500 mt-0.5">Complete driver information</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={closeModal}
//                       className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//                     >
//                       <XMarkIcon className="w-5 h-5 text-gray-500" />
//                     </button>
//                   </div>

//                   {/* Content */}
//                   <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
//                     {/* Basic Information Card */}
//                     <div className="mb-6">
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="p-1.5 bg-gray-100 rounded-lg">
//                           <UserIcon className="w-4 h-4 text-gray-700" />
//                         </div>
//                         <h4 className="font-semibold text-gray-900">Basic Information</h4>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
//                             <UserIcon className="w-3 h-3" />
//                             Full Name
//                           </div>
//                           <p className="text-gray-900 font-medium">{driverDetails.profile?.full_name || "N/A"}</p>
//                         </div>
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
//                             <EnvelopeIcon className="w-3 h-3" />
//                             Email Address
//                           </div>
//                           <p className="text-gray-900 font-medium">{driverDetails.email || "N/A"}</p>
//                         </div>
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
//                             <PhoneIcon className="w-3 h-3" />
//                             Phone Number
//                           </div>
//                           <p className="text-gray-900 font-medium">{driverDetails.profile?.phone || "N/A"}</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Status & Verification */}
//                     <div className="mb-6">
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="p-1.5 bg-gray-100 rounded-lg">
//                           <ShieldCheckIcon className="w-4 h-4 text-gray-700" />
//                         </div>
//                         <h4 className="font-semibold text-gray-900">Status & Verification</h4>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="text-gray-500 text-xs mb-1">Account Status</div>
//                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${driverDetails.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
//                             {driverDetails.is_active ? "Active" : "Inactive"}
//                           </span>
//                         </div>
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="text-gray-500 text-xs mb-1">KYC Verification</div>
//                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium
//                             ${driverDetails.profile?.verification_status === "verified" ? "bg-green-50 text-green-700" :
//                               driverDetails.profile?.verification_status === "rejected" ? "bg-red-50 text-red-700" :
//                               driverDetails.profile?.verification_status === "pending" ? "bg-yellow-50 text-yellow-700" :
//                               "bg-gray-100 text-gray-600"}`}>
//                             {driverDetails.profile?.verification_status || "Not Started"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Documents Section */}
//                     <div className="mb-6">
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="p-1.5 bg-gray-100 rounded-lg">
//                           <DocumentTextIcon className="w-4 h-4 text-gray-700" />
//                         </div>
//                         <h4 className="font-semibold text-gray-900">Documents</h4>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {/* Aadhaar Card */}
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="flex items-center justify-between mb-2">
//                             <IdentificationIcon className="w-5 h-5 text-gray-600" />
//                             <span className="text-xs text-gray-500">Aadhaar Card</span>
//                           </div>
//                           <p className="text-sm text-gray-900 font-mono mb-2 break-all">
//                             {driverDetails.profile?.documents?.aadhaar_number || "N/A"}
//                           </p>
//                           {driverDetails.profile?.documents?.aadhaar_url ? (
//                             <button
//                               onClick={() => openImagePreview(driverDetails.profile.documents.aadhaar_url, "Aadhaar Card")}
//                               className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
//                             >
//                               <EyeIcon className="w-3 h-3" />
//                               View Image
//                             </button>
//                           ) : (
//                             <span className="text-xs text-gray-400">No image available</span>
//                           )}
//                         </div>

//                         {/* PAN Card */}
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="flex items-center justify-between mb-2">
//                             <CreditCardIcon className="w-5 h-5 text-gray-600" />
//                             <span className="text-xs text-gray-500">PAN Card</span>
//                           </div>
//                           <p className="text-sm text-gray-900 font-mono mb-2 break-all">
//                             {driverDetails.profile?.documents?.pan_number || "N/A"}
//                           </p>
//                           {driverDetails.profile?.documents?.pan_url ? (
//                             <button
//                               onClick={() => openImagePreview(driverDetails.profile.documents.pan_url, "PAN Card")}
//                               className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
//                             >
//                               <EyeIcon className="w-3 h-3" />
//                               View Image
//                             </button>
//                           ) : (
//                             <span className="text-xs text-gray-400">No image available</span>
//                           )}
//                         </div>

//                         {/* Driving License */}
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="flex items-center justify-between mb-2">
//                             <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
//                             <span className="text-xs text-gray-500">Driving License</span>
//                           </div>
//                           <p className="text-sm text-gray-900 font-mono mb-2 break-all">
//                             {driverDetails.profile?.documents?.driving_license_number || "N/A"}
//                           </p>
//                           {driverDetails.profile?.documents?.dl_url ? (
//                             <button
//                               onClick={() => openImagePreview(driverDetails.profile.documents.dl_url, "Driving License")}
//                               className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
//                             >
//                               <EyeIcon className="w-3 h-3" />
//                               View Image
//                             </button>
//                           ) : (
//                             <span className="text-xs text-gray-400">No image available</span>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Vehicle Details */}
//                     <div className="mb-6">
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="p-1.5 bg-gray-100 rounded-lg">
//                           <TruckIcon className="w-4 h-4 text-gray-700" />
//                         </div>
//                         <h4 className="font-semibold text-gray-900">Vehicle Information</h4>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="text-gray-500 text-xs mb-2">Vehicle Details</div>
//                           <div className="space-y-2">
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Registration:</span>
//                               <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.reg_no || "N/A"}</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Model:</span>
//                               <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.model || "N/A"}</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Vehicle Name:</span>
//                               <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.vehical_name || "N/A"}</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Capacity:</span>
//                               <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.capacity || "N/A"} seats</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">AC:</span>
//                               <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.has_ac ? "Yes" : "No"}</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Ownership Type:</span>
//                               <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.vehical_owner_ship_type || "N/A"}</span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="text-gray-500 text-xs mb-2">Registration & Verification</div>
//                           <div className="space-y-2">
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Valid Till:</span>
//                               <span className="text-sm font-medium text-gray-900">
//                                 {driverDetails.vehicle?.reg_valid_till ? 
//                                   new Date(driverDetails.vehicle.reg_valid_till).toLocaleDateString() : "N/A"}
//                               </span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-sm text-gray-600">Verification Status:</span>
//                               <span className={`text-sm font-medium ${
//                                 driverDetails.vehicle?.verification === "verified" ? "text-green-600" :
//                                 driverDetails.vehicle?.verification === "rejected" ? "text-red-600" :
//                                 "text-yellow-600"
//                               }`}>
//                                 {driverDetails.vehicle?.verification || "N/A"}
//                               </span>
//                             </div>
//                             {driverDetails.vehicle?.rc_file_path && (
//                               <div className="mt-2">
//                                 <button
//                                   onClick={() => openImagePreview(driverDetails.vehicle.rc_file_path, "RC Document")}
//                                   className="inline-flex items-center gap-2 text-sm text-black hover:underline"
//                                 >
//                                   <DocumentTextIcon className="w-3 h-3" />
//                                   View RC Document
//                                 </button>
//                               </div>
//                             )}
//                             {driverDetails.vehicle?.rear_photo_file_path && (
//                               <div>
//                                 <button
//                                   onClick={() => openImagePreview(driverDetails.vehicle.rear_photo_file_path, "Rear Photo")}
//                                   className="inline-flex items-center gap-2 text-sm text-black hover:underline"
//                                 >
//                                   <EyeIcon className="w-3 h-3" />
//                                   View Rear Photo
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Physical Inspection */}
//                     {driverDetails.vehical_physical_inspection && (
//                       <div className="mb-6">
//                         <div className="flex items-center gap-2 mb-4">
//                           <div className="p-1.5 bg-gray-100 rounded-lg">
//                             <ClipboardDocumentListIcon className="w-4 h-4 text-gray-700" />
//                           </div>
//                           <h4 className="font-semibold text-gray-900">Physical Inspection</h4>
//                         </div>
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                               <div className="text-gray-500 text-xs mb-1">Inspection Status</div>
//                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium
//                                 ${driverDetails.vehical_physical_inspection.inspection_status === "approved" ? "bg-green-50 text-green-700" :
//                                   driverDetails.vehical_physical_inspection.inspection_status === "rejected" ? "bg-red-50 text-red-700" :
//                                   "bg-yellow-50 text-yellow-700"}`}>
//                                 {driverDetails.vehical_physical_inspection.inspection_status || "N/A"}
//                               </span>
//                             </div>
//                             {driverDetails.vehical_physical_inspection.inspection_reason && (
//                               <div>
//                                 <div className="text-gray-500 text-xs mb-1">Reason</div>
//                                 <p className="text-gray-900">{driverDetails.vehical_physical_inspection.inspection_reason}</p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Bank Account */}
//                     <div className="mb-6">
//                       <div className="flex items-center gap-2 mb-4">
//                         <div className="p-1.5 bg-gray-100 rounded-lg">
//                           <BanknotesIcon className="w-4 h-4 text-gray-700" />
//                         </div>
//                         <h4 className="font-semibold text-gray-900">Bank Account</h4>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="text-gray-500 text-xs mb-1">Account Number</div>
//                           <p className="text-gray-900 font-medium break-all">{driverDetails.account_info?.account_number || "N/A"}</p>
//                         </div>
//                         <div className="p-4 bg-gray-50 rounded-xl">
//                           <div className="text-gray-500 text-xs mb-1">IFSC Code</div>
//                           <p className="text-gray-900 font-medium">{driverDetails.account_info?.IFSC_code || "N/A"}</p>
//                         </div>
//                         {driverDetails.account_info?.passbook_url && (
//                           <div className="md:col-span-2">
//                             <button
//                               onClick={() => openImagePreview(driverDetails.account_info.passbook_url, "Passbook")}
//                               className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors text-sm"
//                             >
//                               <EyeIcon className="w-4 h-4" />
//                               View Passbook
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Footer */}
//                   <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
//                     <button
//                       onClick={closeModal}
//                       className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors text-sm font-medium"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Preview Modal */}
//       {showImageModal && selectedImage && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             {/* Background overlay */}
//             <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={closeImagePreview} />

//             {/* Modal panel */}
//             <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
//               {/* Header */}
//               <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">{selectedImageTitle}</h3>
//                   <p className="text-sm text-gray-500 mt-0.5">Document preview</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={downloadImage}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                     title="Download"
//                   >
//                     <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
//                   </button>
//                   <button
//                     onClick={closeImagePreview}
//                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     <XMarkIcon className="w-5 h-5 text-gray-500" />
//                   </button>
//                 </div>
//               </div>

//               {/* Image Content */}
//               <div className="p-6 flex items-center justify-center bg-gray-50">
//                 <img
//                   src={selectedImage}
//                   alt={selectedImageTitle}
//                   className="max-w-full max-h-[70vh] object-contain rounded-lg"
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
//                   }}
//                 />
//               </div>

//               {/* Footer */}
//               <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
//                 <button
//                   onClick={closeImagePreview}
//                   className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
//                 >
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
  CalendarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  KeyIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  CameraIcon,
  PhotoIcon
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
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  // Fetch detailed driver information
  const fetchDriverDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await axios.get(
        `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDriverDetails(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching driver details:", error);
      alert("Failed to fetch driver details. Please try again.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setDriverDetails(null);
  };

  // Open image preview
  const openImagePreview = (imageUrl, title) => {
    setSelectedImage(`https://be.shuttleapp.transev.site/${imageUrl}`);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  // Close image preview
  const closeImagePreview = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageTitle("");
  };

  // Download image
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

  // Render KYC Verification Status
  const renderKycVerification = (driver) => {
    const status = driver.profile?.verification_status?.toLowerCase();

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
            onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
          >
            <ExclamationTriangleIcon className="w-3 h-3" />
            Pending - Verify
          </button>
        );
      case "draft":
        return (
          <button
            onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            <DocumentTextIcon className="w-3 h-3" />
            Draft - Verify
          </button>
        );
      default:
        return (
          <button
            onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
          >
            <UserIcon className="w-3 h-3" />
            Not Started
          </button>
        );
    }
  };

  // Render Bus Status
  const renderBusStatus = (driver) => {
    const status = driver.vehicle?.verification?.toLowerCase();

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
            onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
          >
            <ExclamationTriangleIcon className="w-3 h-3" />
            Pending - Verify Bus
          </button>
        );
      case "draft":
        return (
          <button
            onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            <DocumentTextIcon className="w-3 h-3" />
            Draft - Verify Bus
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

  // Fetch drivers from API
  // Update the fetchDrivers function to include all fields
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

      const driversWithDetails = await Promise.all(
        response.data.map(async (driver) => {
          try {
            const res = await axios.get(
              `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            return {
              ...driver,
              profile: {
                ...driver.profile,
                verification_status: res.data.profile?.verification_status || "draft",
                full_name: res.data.profile?.full_name || driver.profile?.name,
                phone: res.data.profile?.phone || driver.profile?.phone,
              },
              vehicle: {
                ...driver.bus_details,
                verification: res.data.vehicle?.verification || "N/A",
                vehical_name: res.data.vehicle?.vehical_name || driver.bus_details?.vehical_name,
                color: res.data.vehicle?.color || driver.bus_details?.color,
                model: res.data.vehicle?.model || driver.bus_details?.model,
                capacity: res.data.vehicle?.capacity || driver.bus_details?.capacity,
                has_ac: res.data.vehicle?.has_ac || driver.bus_details?.ac,
                reg_no: res.data.vehicle?.reg_no || driver.bus_details?.reg_no,
                reg_valid_till: res.data.vehicle?.reg_valid_till || driver.bus_details?.reg_valid_till,
                // Vehicle documents
                rc_file_path: res.data.vehicle?.rc_file_path,
                rear_photo_file_path: res.data.vehicle?.rear_photo_file_path,
                front_photo_file_path: res.data.vehicle?.front_photo_file_path,
                interior_photo_file_path: res.data.vehicle?.interior_photo_file_path,
                left_side_file_path: res.data.vehicle?.left_side_file_path,
                right_side_file_path: res.data.vehicle?.right_side_file_path,
                vechical_auth_file_path: res.data.vehicle?.vechical_auth_file_path,
                insurance_document: res.data.vehicle?.insurance_document,
                pollution_document: res.data.vehicle?.pollution_document,
                owner_aadhaar_card: res.data.vehicle?.owner_aadhaar_card,
                owner_name: res.data.vehicle?.owner_name,
                // Dates
                vechical_verification_req_date: res.data.vehicle?.vechical_verification_req_date,
                vehical_reviewed_at: res.data.vehicle?.vehical_reviewed_at,
                vehical_owner_ship_type: res.data.vehicle?.vehical_owner_ship_type || driver.bus_details?.vehical_owner_ship_type,
              },
              account_info: res.data.account_info || driver.account_info,
              vehical_physical_inspection: res.data.vehical_physical_inspection,
            };
          } catch (err) {
            console.error("Error fetching driver details:", driver.user_id, err);
            return {
              ...driver,
              profile: {
                ...driver.profile,
                verification_status: "draft",
              },
              vehicle: {
                ...driver.bus_details,
                verification: "N/A",
              },
            };
          }
        })
      );

      setDrivers(driversWithDetails);
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

  useEffect(() => {
    const handleFocus = () => {
      const refresh = localStorage.getItem("refreshDriversList");
      if (refresh === "true") {
        fetchDrivers().finally(() => {
          localStorage.removeItem("refreshDriversList");
        });
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const filteredDrivers = drivers.filter((driver) =>
    driver.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.profile?.phone?.includes(searchTerm)
  );

  if (initialLoad || loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-gray-50">
          <TopNavbarUltra />
          <div className="flex items-center justify-center h-full p-6">
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbarUltra />

        <div className="p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
              <p className="text-gray-500 mt-1">Manage and view all driver information</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredDrivers.length > 0 ? (
                      filteredDrivers.map((driver) => (
                        <tr key={driver.user_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => fetchDriverDetails(driver.user_id)}
                              className="text-left hover:text-black transition-colors group"
                            >
                              <div className="font-medium text-gray-900 group-hover:underline">
                                {driver.profile?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">{driver.email || "N/A"}</div>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{driver.profile?.phone || "N/A"}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {driver.is_active ? "Active" : "Inactive"}
                            </div>
                          </td>
                          <td className="px-6 py-4">{renderKycVerification(driver)}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              <div className="text-gray-600">Aadhaar: {driver.profile?.documents?.aadhaar_number || "N/A"}</div>
                              <div className="text-gray-600">PAN: {driver.profile?.documents?.pan_number || "N/A"}</div>
                              <div className="text-gray-600">DL: {driver.profile?.documents?.driving_license_number || "N/A"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              <div className="text-gray-600">ACC: {driver.account_info?.account_number || "N/A"}</div>
                              <div className="text-gray-600">IFSC: {driver.account_info?.IFSC_code || "N/A"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              <div className="text-gray-600">{driver.vehicle?.reg_no || "N/A"}</div>
                              <div className="text-gray-600">{driver.vehicle?.vehical_name || driver.vehicle?.model || "N/A"} • {driver.vehicle?.capacity || "N/A"} seats</div>
                              <div className="text-gray-600">{driver.vehicle?.ac ? "AC" : "Non-AC"}</div>
                              <div className="text-xs text-gray-400">Ownership: {driver.vehicle?.vehical_owner_ship_type || "N/A"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">{renderBusStatus(driver)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
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

      {/* Driver Details Modal */}
      {showModal && driverDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={closeModal} />

            {/* Modal panel */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
              {detailsLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-black mb-3"></div>
                    <p className="text-gray-500">Loading driver details...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-black rounded-xl">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Driver Profile</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Complete driver information</p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
                    {/* Basic Information Card */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <UserIcon className="w-4 h-4 text-gray-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Basic Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <UserIcon className="w-3 h-3" />
                            Full Name
                          </div>
                          <p className="text-gray-900 font-medium">{driverDetails.profile?.full_name || "N/A"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <EnvelopeIcon className="w-3 h-3" />
                            Email Address
                          </div>
                          <p className="text-gray-900 font-medium">{driverDetails.email || "N/A"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <PhoneIcon className="w-3 h-3" />
                            Phone Number
                          </div>
                          <p className="text-gray-900 font-medium">{driverDetails.profile?.phone || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Verification */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <ShieldCheckIcon className="w-4 h-4 text-gray-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Status & Verification</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-gray-500 text-xs mb-1">Account Status</div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${driverDetails.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {driverDetails.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-gray-500 text-xs mb-1">KYC Verification</div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium
                            ${driverDetails.profile?.verification_status === "verified" ? "bg-green-50 text-green-700" :
                              driverDetails.profile?.verification_status === "rejected" ? "bg-red-50 text-red-700" :
                                driverDetails.profile?.verification_status === "pending" ? "bg-yellow-50 text-yellow-700" :
                                  "bg-gray-100 text-gray-600"}`}>
                            {driverDetails.profile?.verification_status || "Not Started"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <DocumentTextIcon className="w-4 h-4 text-gray-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Documents</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Aadhaar Card */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <IdentificationIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-xs text-gray-500">Aadhaar Card</span>
                          </div>
                          <p className="text-sm text-gray-900 font-mono mb-2 break-all">
                            {driverDetails.profile?.documents?.aadhaar_number || "N/A"}
                          </p>
                          {driverDetails.profile?.documents?.aadhaar_url ? (
                            <button
                              onClick={() => openImagePreview(driverDetails.profile.documents.aadhaar_url, "Aadhaar Card")}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <EyeIcon className="w-3 h-3" />
                              View Image
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No image available</span>
                          )}
                        </div>

                        {/* PAN Card */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <CreditCardIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-xs text-gray-500">PAN Card</span>
                          </div>
                          <p className="text-sm text-gray-900 font-mono mb-2 break-all">
                            {driverDetails.profile?.documents?.pan_number || "N/A"}
                          </p>
                          {driverDetails.profile?.documents?.pan_url ? (
                            <button
                              onClick={() => openImagePreview(driverDetails.profile.documents.pan_url, "PAN Card")}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <EyeIcon className="w-3 h-3" />
                              View Image
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No image available</span>
                          )}
                        </div>

                        {/* Driving License */}
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-xs text-gray-500">Driving License</span>
                          </div>
                          <p className="text-sm text-gray-900 font-mono mb-2 break-all">
                            {driverDetails.profile?.documents?.driving_license_number || "N/A"}
                          </p>
                          {driverDetails.profile?.documents?.dl_url ? (
                            <button
                              onClick={() => openImagePreview(driverDetails.profile.documents.dl_url, "Driving License")}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <EyeIcon className="w-3 h-3" />
                              View Image
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No image available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    {/* Vehicle Details */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <TruckIcon className="w-4 h-4 text-gray-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Vehicle Information</h4>
                      </div>

                      {/* Vehicle Basic Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-gray-500 text-xs mb-2">Vehicle Details</div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Registration Number:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.reg_no || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Vehicle Name:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.vehical_name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Model:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.model || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Color:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.color || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Capacity:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.capacity || "N/A"} seats</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">AC:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.has_ac ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Ownership Type:</span>
                              <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle?.vehical_owner_ship_type || "N/A"}</span>
                            </div>
                            {driverDetails.vehicle?.owner_name && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Owner Name:</span>
                                <span className="text-sm font-medium text-gray-900">{driverDetails.vehicle.owner_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-gray-500 text-xs mb-2">Registration & Verification</div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Registration Valid Till:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {driverDetails.vehicle?.reg_valid_till ?
                                  new Date(driverDetails.vehicle.reg_valid_till).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Verification Status:</span>
                              <span className={`text-sm font-medium ${driverDetails.vehicle?.verification === "verified" ? "text-green-600" :
                                  driverDetails.vehicle?.verification === "rejected" ? "text-red-600" :
                                    "text-yellow-600"
                                }`}>
                                {driverDetails.vehicle?.verification || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Verification Request Date:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {driverDetails.vehicle?.vechical_verification_req_date ?
                                  new Date(driverDetails.vehicle.vechical_verification_req_date).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Reviewed At:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {driverDetails.vehicle?.vehical_reviewed_at ?
                                  new Date(driverDetails.vehicle.vehical_reviewed_at).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Documents Section */}
                      <div className="mt-4">
                        <div className="text-gray-500 text-xs mb-3">Vehicle Documents & Photos</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {driverDetails.vehicle?.rc_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.rc_file_path, "RC Document")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">RC Document</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.rear_photo_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.rear_photo_file_path, "Rear Photo")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <PhotoIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Rear Photo</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.front_photo_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.front_photo_file_path, "Front Photo")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <CameraIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Front Photo</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.interior_photo_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.interior_photo_file_path, "Interior Photo")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <CameraIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Interior Photo</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.left_side_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.left_side_file_path, "Left Side Photo")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <PhotoIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Left Side Photo</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.right_side_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.right_side_file_path, "Right Side Photo")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <PhotoIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Right Side Photo</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.vechical_auth_file_path && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.vechical_auth_file_path, "Vehicle Authorization")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Vehicle Authorization</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.insurance_document && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.insurance_document, "Insurance Document")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Insurance Document</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.pollution_document && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.pollution_document, "Pollution Certificate")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Pollution Certificate</span>
                            </button>
                          )}
                          {driverDetails.vehicle?.owner_aadhaar_card && (
                            <button
                              onClick={() => openImagePreview(driverDetails.vehicle.owner_aadhaar_card, "Owner Aadhaar Card")}
                              className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                            >
                              <IdentificationIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">Owner Aadhaar Card</span>
                            </button>
                          )}
                        </div>

                        {/* Show message if no documents available */}
                        {!driverDetails.vehicle?.rc_file_path &&
                          !driverDetails.vehicle?.rear_photo_file_path &&
                          !driverDetails.vehicle?.front_photo_file_path &&
                          !driverDetails.vehicle?.interior_photo_file_path &&
                          !driverDetails.vehicle?.left_side_file_path &&
                          !driverDetails.vehicle?.right_side_file_path && (
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                              <p className="text-sm text-gray-500">No vehicle documents uploaded yet</p>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Physical Inspection */}

                    {driverDetails.vehical_physical_inspection && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 bg-gray-100 rounded-lg">
                            <ClipboardDocumentListIcon className="w-4 h-4 text-gray-700" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Physical Inspection</h4>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Inspection Status</div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium
            ${driverDetails.vehical_physical_inspection.inspection_status === "approved" ? "bg-green-50 text-green-700" :
                                  driverDetails.vehical_physical_inspection.inspection_status === "rejected" ? "bg-red-50 text-red-700" :
                                    "bg-yellow-50 text-yellow-700"}`}>
                                {driverDetails.vehical_physical_inspection.inspection_status || "N/A"}
                              </span>
                            </div>
                            {driverDetails.vehical_physical_inspection.inspection_reason && (
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Reason</div>
                                <p className="text-gray-900">{driverDetails.vehical_physical_inspection.inspection_reason}</p>
                              </div>
                            )}
                            {driverDetails.vehical_physical_inspection.inspection_reviewed_at && (
                              <div>
                                <div className="text-gray-500 text-xs mb-1">Reviewed At</div>
                                <p className="text-gray-900">{new Date(driverDetails.vehical_physical_inspection.inspection_reviewed_at).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank Account */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gray-100 rounded-lg">
                          <BanknotesIcon className="w-4 h-4 text-gray-700" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Bank Account</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-gray-500 text-xs mb-1">Account Number</div>
                          <p className="text-gray-900 font-medium break-all">{driverDetails.account_info?.account_number || "N/A"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-gray-500 text-xs mb-1">IFSC Code</div>
                          <p className="text-gray-900 font-medium">{driverDetails.account_info?.IFSC_code || "N/A"}</p>
                        </div>
                        {driverDetails.account_info?.passbook_url && (
                          <div className="md:col-span-2">
                            <button
                              onClick={() => openImagePreview(driverDetails.account_info.passbook_url, "Passbook")}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors text-sm"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View Passbook
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={closeImagePreview} />

            {/* Modal panel */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedImageTitle}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Document preview</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadImage}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={closeImagePreview}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Image Content */}
              <div className="p-6 flex items-center justify-center bg-gray-50">
                <img
                  src={selectedImage}
                  alt={selectedImageTitle}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
                <button
                  onClick={closeImagePreview}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverList;