// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

// const DriverList = () => {
//   const [drivers, setDrivers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState(""); // Added state for search
//   const hasFetched = useRef(false);
//   const navigate = useNavigate();
//   // Render Bus Status
//   const renderBusStatus = (driver) => {
//     const status = driver.bus_details?.verification?.toLowerCase();
//     switch (status) {
//       case "verified":
//         return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Verified</span>;
//       case "rejected":
//         return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Rejected</span>;
//       case "pending":
//       case "draft":
//         return (
//           <button
//             className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition"
//             onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
//           >
//             Verify Bus
//           </button>
//         );
//       default:
//         return <span className="text-gray-400 text-xs">N/A</span>;
//     }
//   };

//   // Fetch drivers from API
//   // Inside fetchDrivers function
//   const fetchDrivers = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         "https://be.shuttleapp.transev.site/admin/view/all-drivers",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const driversWithBusStatus = await Promise.all(
//         response.data.map(async (driver) => {
//           try {
//             const res = await axios.get(
//               `https://be.shuttleapp.transev.site/admin/driver/${driver.user_id}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );

//             // Only add the verification from vehicle API
//             return {
//               ...driver,
//               bus_details: {
//                 ...driver.bus_details,
//                 verification: res.data.vehicle?.verification || "N/A",
//               },
//             };
//           } catch (err) {
//             console.error("Error fetching bus status for driver:", driver.user_id, err);
//             return {
//               ...driver,
//               bus_details: {
//                 ...driver.bus_details,
//                 verification: "N/A",
//               },
//             };
//           }
//         })
//       );

//       // ✅ Only set the updated drivers with bus verification
//       setDrivers(driversWithBusStatus);

//     } catch (error) {
//       console.error("Error fetching drivers:", error);
//     }
//   };

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;
//     fetchDrivers();
//   }, []);

//   // Refresh list if coming back from VerifyDriver
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

//   // Filter drivers based on search input
//   const filteredDrivers = drivers.filter((driver) =>
//     driver.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     driver.profile?.phone?.includes(searchTerm)
//   );

//   // Verification button for KYC
//   const renderVerification = (driver) => {
//     const status = driver.profile?.verification?.toLowerCase();
//     switch (status) {
//       case "verified":
//         return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Verified</span>;
//       case "rejected":
//         return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">Rejected</span>;
//       case "pending":
//       case "draft":
//         return (
//           <button
//             onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
//             className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition"
//           >
//             Verify Details
//           </button>
//         );
//       default:
//         return <span className="text-gray-400 text-xs">N/A</span>;
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar />
//       <div className="flex-1 flex flex-col bg-gray-100">
//         <TopNavbarUltra />

//         <div className="p-6 flex-1 overflow-auto">
//           <h1 className="text-2xl font-bold mb-4">All Drivers</h1>

//           {/* Search box */}
//           <input
//             type="text"
//             placeholder="Search drivers..."
//             className="border border-gray-300 rounded-lg px-3 py-1 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <div className="overflow-x-auto bg-white rounded shadow">
//             <table className="min-w-full divide-y divide-gray-200 text-sm">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-2">Name</th>
//                   <th className="px-4 py-2">Email</th>
//                   <th className="px-4 py-2">Phone</th>
//                   <th className="px-4 py-2">Active</th>
//                   <th className="px-4 py-2">KYC Verification</th>
//                   <th className="px-4 py-2">Aadhaar Number</th>
//                   <th className="px-4 py-2">PAN Number</th>
//                   <th className="px-4 py-2">Driving License No</th>
//                   <th className="px-4 py-2">Account Number</th>
//                   <th className="px-4 py-2">IFSC</th>
//                   <th className="px-4 py-2">Bus Reg No</th>
//                   <th className="px-4 py-2">Model</th>
//                   <th className="px-4 py-2">Capacity</th>
//                   <th className="px-4 py-2">AC</th>
//                   <th className="px-4 py-2">Bus Status</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-200">
//                 {filteredDrivers.map((driver) => (
//                   <tr key={driver.user_id} className="hover:bg-gray-50">
//                     <td className="px-4 py-2">{driver.profile?.name || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.email || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.profile?.phone || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.is_active ? "Yes" : "No"}</td>
//                     <td className="px-4 py-2">{renderVerification(driver)}</td>
//                     <td className="px-4 py-2">{driver.profile?.documents?.aadhaar_number || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.profile?.documents?.pan_number || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.profile?.documents?.driving_license_number || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.account_info?.account_number || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.account_info?.IFSC_code || "N/A"}</td>

//                     {/* Bus Details */}
//                     <td className="px-4 py-2">{driver.bus_details?.reg_no || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.bus_details?.model || "N/A"}</td>
//                     <td className="px-4 py-2">{driver.bus_details?.capacity ?? "N/A"}</td>
//                     <td className="px-4 py-2">{driver.bus_details?.ac ? "Yes" : "No"}</td>
//                     <td className="px-4 py-2">
//                       {driver.bus_details?.verification ? (
//                         renderBusStatus(driver)
//                       ) : (
//                         <span className="text-gray-400 text-xs">N/A</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredDrivers.length === 0 && (
//             <p className="text-center mt-10 text-gray-500">No drivers found</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DriverList;
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  // Render KYC Verification Status (from profile.verification_status)
  const renderKycVerification = (driver) => {
    const status = driver.profile?.verification_status?.toLowerCase();
    
    switch (status) {
      case "verified":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold cursor-default">
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold cursor-default">
            Rejected
          </span>
        );
      case "pending":
        return (
          <button
            onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-200 transition cursor-pointer"
          >
            Pending - Verify
          </button>
        );
      case "draft":
        return (
          <button
            onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition cursor-pointer"
          >
            Draft - Verify
          </button>
        );
      default:
        return (
          <button
            onClick={() => navigate(`/admin/providers/${driver.user_id}`)}
            className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
          >
            Not Started
          </button>
        );
    }
  };

  // Render Bus Status (from vehicle.verification)
  const renderBusStatus = (driver) => {
    const status = driver.vehicle?.verification?.toLowerCase();
    
    switch (status) {
      case "verified":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold cursor-default">
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold cursor-default">
            Rejected
          </span>
        );
      case "pending":
        return (
          <button
            onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-yellow-200 transition cursor-pointer"
          >
            Pending - Verify Bus
          </button>
        );
      case "draft":
        return (
          <button
            onClick={() => navigate("/admin/verify-drivers", { state: { userId: driver.user_id } })}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition cursor-pointer"
          >
            Draft - Verify Bus
          </button>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold cursor-default">
            Not Started
          </span>
        );
    }
  };

  // Fetch drivers from API
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

      // Fetch detailed info for each driver to get verification_status
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
              },
              vehicle: {
                ...driver.bus_details,
                verification: res.data.vehicle?.verification || "N/A",
              },
              account_info: res.data.account_info || driver.account_info,
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

  // Refresh list if coming back from VerifyDriver
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

  // Filter drivers based on search input
  const filteredDrivers = drivers.filter((driver) =>
    driver.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.profile?.phone?.includes(searchTerm)
  );

  // Show loading spinner for initial load
  if (initialLoad || loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-gray-100">
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
    <div className="flex min-h-screen animate-fadeIn">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <TopNavbarUltra />

        <div className="p-6 flex-1 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">All Drivers</h1>

          {/* Search box */}
          <input
            type="text"
            placeholder="Search drivers by name, email, or phone..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                  <th className="px-4 py-3 text-left">Aadhaar Number</th>
                  <th className="px-4 py-3 text-left">PAN Number</th>
                  <th className="px-4 py-3 text-left">Driving License No</th>
                  <th className="px-4 py-3 text-left">Account Number</th>
                  <th className="px-4 py-3 text-left">IFSC</th>
                  <th className="px-4 py-3 text-left">Bus Reg No</th>
                  <th className="px-4 py-3 text-left">Model</th>
                  <th className="px-4 py-3 text-left">Capacity</th>
                  <th className="px-4 py-3 text-left">AC</th>
                  <th className="px-4 py-3 text-left">Bus Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{driver.profile?.name || "N/A"}</td>
                    <td className="px-4 py-2">{driver.email || "N/A"}</td>
                    <td className="px-4 py-2">{driver.profile?.phone || "N/A"}</td>
                    <td className="px-4 py-2">{driver.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">{renderKycVerification(driver)}</td>
                    <td className="px-4 py-2">{driver.profile?.documents?.aadhaar_number || "N/A"}</td>
                    <td className="px-4 py-2">{driver.profile?.documents?.pan_number || "N/A"}</td>
                    <td className="px-4 py-2">{driver.profile?.documents?.driving_license_number || "N/A"}</td>
                    <td className="px-4 py-2">{driver.account_info?.account_number || "N/A"}</td>
                    <td className="px-4 py-2">{driver.account_info?.IFSC_code || "N/A"}</td>
                    <td className="px-4 py-2">{driver.vehicle?.reg_no || "N/A"}</td>
                    <td className="px-4 py-2">{driver.vehicle?.model || "N/A"}</td>
                    <td className="px-4 py-2">{driver.vehicle?.capacity ?? "N/A"}</td>
                    <td className="px-4 py-2">{driver.vehicle?.has_ac ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">{renderBusStatus(driver)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDrivers.length === 0 && (
            <p className="text-center mt-10 text-gray-500">No drivers found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverList;