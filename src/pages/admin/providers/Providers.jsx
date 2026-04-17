// import React, { useEffect, useState, useRef } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

// const BASE_URL = "https://be.shuttleapp.transev.site/";

// const getFullUrl = (url) => {
//   if (!url || url === "NA") return null;
//   return url.startsWith("http") ? url : BASE_URL + url;
// };

// const Providers = () => {
//   const location = useLocation();
//   const { userId } = useParams();
//   const singleDriver = location.state?.driver;

//   const [drivers, setDrivers] = useState([]);
//   const [driver, setDriver] = useState(singleDriver || null);
//   const hasFetched = useRef(false);

//   const [showRejectBox, setShowRejectBox] = useState(false);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [updating, setUpdating] = useState(false);

//   // Fetch driver if coming via URL
//   useEffect(() => {
//     const fetchDriverById = async () => {
//       try {
//         const token = localStorage.getItem("access_token");
//         const response = await axios.get(
//           `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setDriver(response.data);
//       } catch (error) {
//         console.error("Error fetching driver:", error);
//         alert("Failed to fetch driver details");
//       }
//     };

//     if (!singleDriver && userId) {
//       fetchDriverById();
//     }
//   }, [singleDriver, userId]);

//   // Fetch all drivers for list view
//   useEffect(() => {
//     if (singleDriver || hasFetched.current) return;
//     hasFetched.current = true;

//     const fetchDrivers = async () => {
//       try {
//         const token = localStorage.getItem("access_token");
//         const response = await axios.get(
//           "https://be.shuttleapp.transev.site/admin/view/all-drivers",
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setDrivers(response.data || []);
//       } catch (error) {
//         console.error("Error fetching drivers:", error);
//       }
//     };
//     fetchDrivers();
//   }, [singleDriver]);

//   const handleVerification = async (status) => {
//     if (status === "rejected" && !rejectionReason.trim()) {
//       return alert("Please provide a rejection reason");
//     }

//     try {
//       setUpdating(true);
//       const token = localStorage.getItem("access_token");

//       const payload = {
//         status,
//         ...(status === "rejected" ? { rejection_reason: rejectionReason } : {}),
//       };

//       const response = await axios.post(
//         `https://be.shuttleapp.transev.site/admin/driver/verify/${driver.user_id}`,
//         payload,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       alert(response.data.message);

//       setDriver((prev) => ({
//         ...prev,
//         profile: { ...prev.profile, verification: status },
//         bus_details: { ...prev.bus_details, status },
//       }));

//       setShowRejectBox(false);
//       setShowConfirm(false);
//       setRejectionReason("");
//     } catch (error) {
//       console.error("Verification error:", error);
//       alert("Failed to update verification status");
//     } finally {
//       setUpdating(false);
//     }
//   };

// const renderVerificationUI = () => {
//   const profileStatus = driver.profile?.verification?.toLowerCase();
//   const busStatus = driver.bus_details?.status?.toLowerCase();

//   if (profileStatus === "verified" && busStatus === "verified")
//     return (
//       <span className="border border-green-500 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
//         ✓ Verified
//       </span>
//     );

//   if (profileStatus === "rejected" || busStatus === "rejected")
//     return (
//       <span className="border border-red-500 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
//         ✗ Rejected
//       </span>
//     );

//   return (
//     <div className="flex flex-col space-y-2">
//       <div className="flex space-x-3">
//         <button
//           className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//           onClick={() => setShowConfirm(true)}
//           disabled={updating}
//         >
//           Verify Driver & Bus
//         </button>
//         <button
//           className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
//           onClick={() => setShowRejectBox(true)}
//           disabled={updating}
//         >
//           Reject
//         </button>
//       </div>

//       {showConfirm && (
//         <div className="bg-white p-4 rounded-lg border border-black shadow mt-2 flex justify-between items-center">
//           <span className="text-black font-medium">
//             Confirm verification for {driver.profile?.name}?
//           </span>
//           <div className="flex space-x-2">
//             <button
//               className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
//               onClick={() => handleVerification("verified")}
//               disabled={updating}
//             >
//               Yes
//             </button>
//             <button
//               className="bg-white border border-black text-black px-3 py-1 rounded hover:bg-gray-100"
//               onClick={() => setShowConfirm(false)}
//               disabled={updating}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {showRejectBox && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
//             <h3 className="text-xl font-bold mb-4 text-black">
//               Reject Driver
//             </h3>
//             <textarea
//               placeholder="Enter rejection reason..."
//               className="w-full border border-black rounded-lg p-2 mb-4 focus:ring-2 focus:ring-black focus:outline-none"
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               disabled={updating}
//             />
//             <div className="flex justify-end space-x-3">
//               <button
//                 className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
//                 onClick={() => handleVerification("rejected")}
//                 disabled={updating}
//               >
//                 Submit
//               </button>
//               <button
//                 className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100"
//                 onClick={() => {
//                   setShowRejectBox(false);
//                   setRejectionReason("");
//                 }}
//                 disabled={updating}
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
// const renderDriverCard = (driver) => (
//   <div className="max-w-6xl mx-auto space-y-6">
//     {/* Back Button */}
//     <button
//       onClick={() => setDriver(null)}
//       className="mb-2 flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200"
//     >
//       <svg 
//         xmlns="http://www.w3.org/2000/svg" 
//         className="h-5 w-5" 
//         viewBox="0 0 20 20" 
//         fill="currentColor"
//       >
//         <path 
//           fillRule="evenodd" 
//           d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
//           clipRule="evenodd" 
//         />
//       </svg>
//       <span>Back to all providers</span>
//     </button>

//     {/* Header */}
//     <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 flex justify-between items-center">
//       <div>
//         <h2 className="text-2xl font-bold text-black">{driver.profile?.name}</h2>
//         <p className="text-sm text-gray-500">{driver.email}</p>
//       </div>
//       <div>{renderVerificationUI()}</div>
//     </div>

//     {/* Basic Info */}
//     <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//       <div>
//         <p className="text-gray-500">Phone</p>
//         <p className="font-medium">{driver.profile?.phone || "N/A"}</p>
//       </div>
//       <div>
//         <p className="text-gray-500">Active</p>
//         <p className="font-medium">{driver.is_active ? "Yes" : "No"}</p>
//       </div>
//       <div>
//         <p className="text-gray-500">AC</p>
//         <p className="font-medium">{driver.bus_details?.ac ? "Yes" : "No"}</p>
//       </div>
//       <div>
//         <p className="text-gray-500">Bus Status</p>
//         <p className="font-medium">{driver.bus_details?.status || "Pending"}</p>
//       </div>
//     </div>

//     {/* Documents Section */}
//     <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
//       <h3 className="text-lg font-semibold mb-4 text-black">Documents</h3>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//         {["aadhaar", "pan", "dl", "passbook"].map((docType) => {
//           let number, url, title;
//           switch (docType) {
//             case "aadhaar":
//               number = driver.profile?.documents?.aadhaar_number;
//               url = driver.profile?.documents?.aadhaar_url;
//               title = "Aadhaar";
//               break;
//             case "pan":
//               number = driver.profile?.documents?.pan_number;
//               url = driver.profile?.documents?.pan_url;
//               title = "PAN";
//               break;
//             case "dl":
//               number = driver.profile?.documents?.driving_license_number;
//               url = driver.profile?.documents?.dl_url;
//               title = "Driving License";
//               break;
//             case "passbook":
//               number = driver.account_info?.account_number;
//               url = driver.account_info?.passbook_url;
//               title = "Passbook";
//               break;
//             default:
//               break;
//           }
//           return (
//             <div key={docType} className="border rounded-xl p-3 hover:shadow transition">
//               <p className="text-sm text-gray-500 mb-1">{title}</p>
//               <p className="text-xs mb-2">{number || "N/A"}</p>
//               {url && (
//                 <>
//                   <img
//                     src={getFullUrl(url)}
//                     className="w-full h-28 object-cover rounded-lg"
//                     alt={title}
//                   />
//                   <a
//                     href={getFullUrl(url)}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-xs text-blue-600 mt-1 block"
//                   >
//                     View Full →
//                   </a>
//                 </>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   </div>
// );

// const renderAllDrivers = () => (
//   <div className="overflow-x-auto bg-white rounded-2xl shadow p-6 border border-gray-200">
//     <table className="min-w-full divide-y divide-gray-200 text-sm">
//       <thead className="bg-gray-50">
//         <tr>
//           <th className="px-6 py-3 text-left font-medium text-black">Name</th>
//           <th className="px-6 py-3 text-left font-medium text-black">Email</th>
//           <th className="px-6 py-3 text-left font-medium text-black">Phone</th>
//           <th className="px-6 py-3 text-left font-medium text-black">Status</th>
//           <th className="px-6 py-3 text-left font-medium text-black">Action</th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-gray-200">
//         {drivers.map((d) => {
//           const verificationStatus = d.profile?.verification?.toLowerCase();
//           const isVerified = verificationStatus === "verified";
//           const isPending = verificationStatus === "draft" || verificationStatus === "pending" || !verificationStatus;

//           return (
//             <tr 
//               key={d.user_id} 
//               className="hover:bg-gray-50 transition-all cursor-pointer"
//               onClick={() => setDriver(d)}
//             >
//               <td className="px-6 py-3 font-medium text-black">{d.profile?.name || "N/A"}</td>
//               <td className="px-6 py-3 text-gray-600">{d.email || "N/A"}</td>
//               <td className="px-6 py-3 text-gray-600">{d.profile?.phone || "N/A"}</td>
//               <td className="px-6 py-3">
//                 {isVerified ? (
//                   <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
//                     Verified
//                   </span>
//                 ) : isPending ? (
//                   <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
//                     Pending
//                   </span>
//                 ) : (
//                   <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
//                     Rejected
//                   </span>
//                 )}
//               </td>
//               <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
//                 <button
//                   className="bg-black text-white px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition"
//                   onClick={() => setDriver(d)}
//                 >
//                   {isVerified ? "View Details" : "Verify Details"}
//                 </button>
//               </td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>

//     {drivers.length === 0 && (
//       <p className="text-center mt-10 text-gray-500">No drivers found</p>
//     )}
//   </div>
// );

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col">
//         <TopNavbarUltra />
//         <div className="p-6 flex-1 overflow-auto">
//           <h1 className="text-3xl font-bold text-black mb-6">
//             {driver ? "Driver Verification" : "All Providers"}
//           </h1>
//           {driver ? renderDriverCard(driver) : renderAllDrivers()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Providers;


import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

const BASE_URL = "https://be.shuttleapp.transev.site/";

const getFullUrl = (url) => {
  if (!url || url === "NA") return null;
  return url.startsWith("http") ? url : BASE_URL + url;
};

const Providers = () => {
  const location = useLocation();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const token = localStorage.getItem("access_token");

  // Fetch all drivers with their KYC verification status
  const fetchAllDrivers = async () => {
    try {
      const response = await axios.get(
        "https://be.shuttleapp.transev.site/admin/view/all-drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch detailed info for each driver to get KYC verification status
      const driversWithKycStatus = await Promise.all(
        response.data.map(async (driver) => {
          try {
            const detailRes = await axios.get(
              `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...driver,
              kyc_verification: detailRes.data.profile?.verification_status || "draft"
            };
          } catch (err) {
            console.error("Error fetching driver details:", driver.user_id, err);
            return {
              ...driver,
              kyc_verification: "draft"
            };
          }
        })
      );

      setDrivers(driversWithKycStatus);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Fetch driver if coming via URL
  useEffect(() => {
    const fetchDriverById = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://be.shuttleapp.transev.site/admin/driver/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDriver(response.data);
      } catch (error) {
        console.error("Error fetching driver:", error);
        alert("Failed to fetch driver details");
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (userId) {
      fetchDriverById();
    } else {
      fetchAllDrivers().finally(() => {
        setLoading(false);
        setInitialLoad(false);
      });
    }
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
        `https://be.shuttleapp.transev.site/admin/driver/verify/${driver.user_id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);

      // Re-fetch driver to get updated KYC verification
      const updatedDriver = await axios.get(
        `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDriver(updatedDriver.data);

      // Notify refresh
      localStorage.setItem("refreshDriversList", "true");

      setShowRejectBox(false);
      setShowConfirm(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to update verification status");
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to get KYC verification status badge
  const getKycVerificationBadge = (verificationStatus, userIdParam = null) => {
    const status = verificationStatus?.toLowerCase();

    switch (status) {
      case "verified":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 cursor-default">Verified</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 cursor-default">Rejected</span>;
      case "pending":
        return (
          <button
            onClick={() => {
              setInitialLoad(true);
              navigate(`/admin/providers/${userIdParam}`);
            }}
            className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition cursor-pointer"
          >
            Pending
          </button>
        );
      case "draft":
        return (
          <button
            onClick={() => {
              setInitialLoad(true);
              navigate(`/admin/providers/${userIdParam}`);
            }}
            className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition cursor-pointer"
          >
            Draft
          </button>
        );
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">Not Started</span>;
    }
  };

  const renderVerificationUI = () => {
    const profileStatus = driver?.profile?.verification_status?.toLowerCase();

    if (profileStatus === "verified")
      return (
        <span className="border border-green-500 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
          ✓ Verified
        </span>
      );

    if (profileStatus === "rejected")
      return (
        <span className="border border-red-500 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
          ✗ Rejected
        </span>
      );

    return (
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-3">
          <button
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            onClick={() => setShowConfirm(true)}
            disabled={updating}
          >
            {updating ? "Verifying..." : "Verify KYC"}
          </button>
          <button
            className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setShowRejectBox(true)}
            disabled={updating}
          >
            Reject
          </button>
        </div>

        {showConfirm && (
          <div className="bg-white p-4 rounded-lg border border-black shadow mt-2 flex justify-between items-center">
            <span className="text-black font-medium">
              Confirm KYC verification for {driver?.profile?.name || driver?.profile?.full_name}?
            </span>
            <div className="flex space-x-2">
              <button
                className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                onClick={() => handleVerification("verified")}
                disabled={updating}
              >
                Yes
              </button>
              <button
                className="bg-white border border-black text-black px-3 py-1 rounded hover:bg-gray-100"
                onClick={() => setShowConfirm(false)}
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showRejectBox && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4 text-black">
                Reject KYC
              </h3>
              <textarea
                placeholder="Enter rejection reason..."
                className="w-full border border-black rounded-lg p-2 mb-4 focus:ring-2 focus:ring-black focus:outline-none"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={updating}
                rows="3"
              />
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  onClick={() => handleVerification("rejected")}
                  disabled={updating}
                >
                  Submit
                </button>
                <button
                  className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setShowRejectBox(false);
                    setRejectionReason("");
                  }}
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDriverCard = (driver) => (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => {
          setDriver(null);
          setInitialLoad(true);
          fetchAllDrivers().finally(() => setInitialLoad(false));
        }}
        className="mb-2 flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span>Back to all providers</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-black">{driver?.profile?.name || driver?.profile?.full_name || "N/A"}</h2>
          <p className="text-sm text-gray-500">{driver.email}</p>
        </div>
        <div>{renderVerificationUI()}</div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-black">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{driver.profile?.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Active</p>
            <p className="font-medium">{driver.is_active ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-gray-500">KYC Status</p>
            <p className="font-medium">{getKycVerificationBadge(driver.profile?.verification_status, driver.user_id)}</p>
          </div>
          <div>
            <p className="text-gray-500">Joined Date</p>
            <p className="font-medium">
              {driver.profile?.profile_verification_req_date
                ? new Date(driver.profile.profile_verification_req_date).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-black">Documents</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {["aadhaar", "pan", "dl", "passbook"].map((docType) => {
            let number, url, title;
            switch (docType) {
              case "aadhaar":
                number = driver.profile?.documents?.aadhaar_number;
                url = driver.profile?.documents?.aadhaar_url;
                title = "Aadhaar";
                break;
              case "pan":
                number = driver.profile?.documents?.pan_number;
                url = driver.profile?.documents?.pan_url;
                title = "PAN";
                break;
              case "dl":
                number = driver.profile?.documents?.driving_license_number;
                url = driver.profile?.documents?.dl_url;
                title = "Driving License";
                break;
              case "passbook":
                number = driver.account_info?.account_number;
                url = driver.account_info?.passbook_url;
                title = "Passbook";
                break;
              default:
                break;
            }
            return (
              <div key={docType} className="border rounded-xl p-3 hover:shadow transition">
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-xs mb-2">{number || "N/A"}</p>
                {url && (
                  <>
                    <img
                      src={getFullUrl(url)}
                      className="w-full h-28 object-cover rounded-lg cursor-pointer"
                      alt={title}
                      onClick={() => setModalImage(getFullUrl(url))}
                    />
                    <a
                      href={getFullUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 mt-1 block"
                    >
                      View Full →
                    </a>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAllDrivers = () => (
    <div className="overflow-x-auto bg-white rounded-2xl shadow p-6 border border-gray-200 animate-fadeIn">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-black">Name</th>
            <th className="px-6 py-3 text-left font-medium text-black">Email</th>
            <th className="px-6 py-3 text-left font-medium text-black">Phone</th>
            <th className="px-6 py-3 text-left font-medium text-black">KYC Status</th>
            <th className="px-6 py-3 text-left font-medium text-black">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {drivers.map((d) => {
            const kycStatus = d.kyc_verification?.toLowerCase();
            const isVerified = kycStatus === "verified";
            const isRejected = kycStatus === "rejected";
            const isPending = kycStatus === "pending" || kycStatus === "draft";

            return (
              <tr
                key={d.user_id}
                className="hover:bg-gray-50 transition-all cursor-pointer"
                onClick={() => {
                  setInitialLoad(true);
                  navigate(`/admin/providers/${d.user_id}`);
                }}
              >
                <td className="px-6 py-3 font-medium text-black">{d.profile?.name || d.profile?.full_name || "N/A"}</td>
                <td className="px-6 py-3 text-gray-600">{d.email || "N/A"}</td>
                <td className="px-6 py-3 text-gray-600">{d.profile?.phone || "N/A"}</td>
                <td className="px-6 py-3">
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
                      {kycStatus === "pending" ? "Pending" : "Draft"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-default">
                      Not Started
                    </span>
                  )}
                </td>
                <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
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
                        navigate(`/admin/providers/${d.user_id}`);
                      }}
                    >
                      Verify KYC
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {drivers.length === 0 && (
        <p className="text-center mt-10 text-gray-500">No providers found</p>
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
            {driver ? "KYC Verification" : "KYC Verification Requests"}
          </h1>
          {driver ? renderDriverCard(driver) : renderAllDrivers()}
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

export default Providers;