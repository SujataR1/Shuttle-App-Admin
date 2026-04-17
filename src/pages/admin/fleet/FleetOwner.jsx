import React, { useEffect, useState } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import axios from "axios";

const FleetOwner = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("access_token");

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://be.shuttleapp.transev.site/admin/fleet-owners",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOwners(res.data?.data || []);
    } catch (err) {
      console.error("API Error:", err);
      if (err.response?.status === 401) {
        console.error("Unauthorized - Please login again");
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

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
              <p className="text-gray-500">Loading fleet owners...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleStatus = async (ownerId, currentStatus) => {
    try {
      const response = await axios.patch(
        `https://be.shuttleapp.transev.site/admin/fleet-owners/${ownerId}/toggle`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Refresh the list
        fetchOwners();
        alert(`Owner ${!currentStatus ? "activated" : "deactivated"} successfully`);
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status");
    }
  };

  const handleViewDetails = (owner) => {
    // Navigate to owner details page (when API is ready)
    alert(`View details for ${owner.name} - Coming soon`);
    console.log("View owner:", owner);
  };

  const handleViewBuses = (owner) => {
    // Navigate to owner's buses page (when API is ready)
    alert(`View buses for ${owner.name} - Coming soon`);
    console.log("View buses for owner:", owner);
  };

  const handleViewDrivers = (owner) => {
    // Navigate to owner's drivers page (when API is ready)
    alert(`View drivers for ${owner.name} - Coming soon`);
    console.log("View drivers for owner:", owner);
  };

  // Filter owners based on search
  const filteredOwners = owners.filter((owner) =>
    owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.phone?.includes(searchTerm)
  );

  // Calculate summary stats
  const totalOwners = owners.length;
  const totalBuses = owners.reduce((acc, o) => acc + (o.total_buses || 0), 0);
  const totalDrivers = owners.reduce((acc, o) => acc + (o.total_drivers || 0), 0);
  const totalRevenue = owners.reduce((acc, o) => acc + (o.revenue || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopNavbarUltra />

        <div className="p-6 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-black">
              Fleet Owners Management
            </h1>
            
            {/* Search Box */}
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="mt-2 sm:mt-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-64 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fadeIn">
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Owners</p>
              <p className="text-2xl font-bold text-black">{totalOwners}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Buses</p>
              <p className="text-2xl font-bold text-blue-600">{totalBuses}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Drivers</p>
              <p className="text-2xl font-bold text-green-600">{totalDrivers}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left font-semibold">Owner</th>
                    <th className="p-3 text-left font-semibold">Contact</th>
                    <th className="p-3 text-left font-semibold">Buses</th>
                    <th className="p-3 text-left font-semibold">Drivers</th>
                    <th className="p-3 text-left font-semibold">Revenue</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOwners.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8 text-gray-400">
                        {searchTerm ? "No matching fleet owners found" : "No Fleet Owners Found"}
                      </td>
                    </tr>
                  ) : (
                    filteredOwners.map((owner, index) => (
                      <tr
                        key={owner.id || index}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        {/* Owner */}
                        <td className="p-3">
                          <p className="font-medium text-black">{owner.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">
                            {owner.company || "—"}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="p-3">
                          <p className="text-gray-700">{owner.email || "N/A"}</p>
                          <p className="text-xs text-gray-500">
                            {owner.phone || "N/A"}
                          </p>
                        </td>

                        {/* Numbers */}
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {owner.total_buses || 0}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {owner.total_drivers || 0}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-gray-700">
                          ₹{(owner.revenue || 0).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              owner.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {owner.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewDetails(owner)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition"
                            >
                              View
                            </button>

                            <button
                              onClick={() => handleViewBuses(owner)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                            >
                              Buses
                            </button>

                            <button
                              onClick={() => handleViewDrivers(owner)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition"
                            >
                              Drivers
                            </button>

                            <button
                              onClick={() => handleToggleStatus(owner.id, owner.is_active)}
                              className={`px-3 py-1 rounded text-xs transition ${
                                owner.is_active
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {owner.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setInitialLoad(true);
                fetchOwners();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetOwner;