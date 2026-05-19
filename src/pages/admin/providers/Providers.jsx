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

const isPDF = (url) => {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
};

const isImage = (url) => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
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
  const [modalPdf, setModalPdf] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("access_token");

  // Check if mobile/tablet view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleDocumentClick = (url) => {
    const fullUrl = getFullUrl(url);
    if (!fullUrl) return;
    
    if (isPDF(fullUrl)) {
      setModalPdf(fullUrl);
    } else if (isImage(fullUrl)) {
      setModalImage(fullUrl);
    } else {
      // For other file types, open in new tab
      window.open(fullUrl, '_blank');
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

  const renderDocumentThumbnail = (url, title) => {
    const fullUrl = getFullUrl(url);
    if (!fullUrl) {
      return (
        <div className="w-full h-24 sm:h-28 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-xs text-gray-400">No file</p>
        </div>
      );
    }

    if (isPDF(fullUrl)) {
      return (
        <div 
          className="w-full h-24 sm:h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition"
          onClick={() => handleDocumentClick(fullUrl)}
        >
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3-3-3" />
          </svg>
          <span className="text-xs text-gray-600">PDF Document</span>
        </div>
      );
    }

    if (isImage(fullUrl)) {
      return (
        <img
          src={fullUrl}
          className="w-full h-24 sm:h-28 object-cover rounded-lg cursor-pointer"
          alt={title}
          onClick={() => handleDocumentClick(fullUrl)}
        />
      );
    }

    // For other file types
    return (
      <div 
        className="w-full h-24 sm:h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition"
        onClick={() => handleDocumentClick(fullUrl)}
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs text-gray-600">View File</span>
      </div>
    );
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
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm sm:text-base"
            onClick={() => setShowConfirm(true)}
            disabled={updating}
          >
            {updating ? "Verifying..." : "Verify KYC"}
          </button>
          <button
            className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm sm:text-base"
            onClick={() => setShowRejectBox(true)}
            disabled={updating}
          >
            Reject
          </button>
        </div>

        {showConfirm && (
          <div className="bg-white p-4 rounded-lg border border-black shadow mt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-black font-medium text-sm sm:text-base">
                Confirm KYC verification for {driver?.profile?.name || driver?.profile?.full_name}?
              </span>
              <div className="flex space-x-2">
                <button
                  className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 text-sm"
                  onClick={() => handleVerification("verified")}
                  disabled={updating}
                >
                  Yes
                </button>
                <button
                  className="bg-white border border-black text-black px-3 py-1 rounded hover:bg-gray-100 text-sm"
                  onClick={() => setShowConfirm(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showRejectBox && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-black">
                Reject KYC
              </h3>
              <textarea
                placeholder="Enter rejection reason..."
                className="w-full border border-black rounded-lg p-2 mb-4 focus:ring-2 focus:ring-black focus:outline-none text-sm sm:text-base"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={updating}
                rows="3"
              />
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm sm:text-base"
                  onClick={() => handleVerification("rejected")}
                  disabled={updating}
                >
                  Submit
                </button>
                <button
                  className="bg-white border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 text-sm sm:text-base"
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
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Back Button */}
      <button
        onClick={() => {
          setDriver(null);
          setInitialLoad(true);
          fetchAllDrivers().finally(() => setInitialLoad(false));
        }}
        className="mb-2 flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200 text-sm sm:text-base"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
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
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">{driver?.profile?.name || driver?.profile?.full_name || "N/A"}</h2>
            <p className="text-xs sm:text-sm text-gray-500 break-all">{driver.email}</p>
          </div>
          <div className="w-full sm:w-auto">{renderVerificationUI()}</div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-black">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Phone</p>
            <p className="font-medium text-sm sm:text-base">{driver.profile?.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Active</p>
            <p className="font-medium text-sm sm:text-base">{driver.is_active ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">KYC Status</p>
            <p className="font-medium text-sm sm:text-base">{getKycVerificationBadge(driver.profile?.verification_status, driver.user_id)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Joined Date</p>
            <p className="font-medium text-xs sm:text-sm break-words">
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
      <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-black">Documents</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
                <p className="text-xs mb-2 break-words">{number || "N/A"}</p>
                {url && (
                  <>
                    {renderDocumentThumbnail(url, title)}
                    <a
                      href={getFullUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 mt-1 block truncate"
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
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border border-gray-200 overflow-x-auto">
      <table className="min-w-[800px] lg:min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-black">Name</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-black">Email</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-black">Phone</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-black">KYC Status</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left font-medium text-black">Action</th>
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
                <td className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-black text-xs sm:text-sm">
                  {d.profile?.name || d.profile?.full_name || "N/A"}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm break-all">
                  {d.email || "N/A"}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm">
                  {d.profile?.phone || "N/A"}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-3">
                  {isVerified ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                      Verified
                    </span>
                  ) : isRejected ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                      Rejected
                    </span>
                  ) : isPending ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
                      {kycStatus === "pending" ? "Pending" : "Draft"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                      Not Started
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-3" onClick={(e) => e.stopPropagation()}>
                  {isVerified ? (
                    <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                      Verified
                    </span>
                  ) : isRejected ? (
                    <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                      Rejected
                    </span>
                  ) : (
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap"
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
        <p className="text-center mt-8 sm:mt-10 text-gray-500">No providers found</p>
      )}
    </div>
  );

  // Loading state
  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
          <TopNavbarUltra 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            isMobile={isMobile}
            title="KYC Verification"
          />
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
        <TopNavbarUltra 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          isMobile={isMobile}
          title="KYC Verification"
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6">
              {driver ? "KYC Verification" : "KYC Verification Requests"}
            </h1>
            {driver ? renderDriverCard(driver) : renderAllDrivers()}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Full View" className="max-h-[90vh] max-w-[90vw] rounded object-contain" />
            <button
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 hover:bg-gray-200 transition w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base shadow-lg"
              onClick={() => setModalImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {modalPdf && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setModalPdf(null)}
        >
          <div className="relative w-[90vw] h-[90vh] bg-white rounded-lg" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 hover:bg-gray-200 transition w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base shadow-lg z-10"
              onClick={() => setModalPdf(null)}
            >
              ✕
            </button>
            <iframe
              src={`${modalPdf}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full rounded-lg"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Providers;