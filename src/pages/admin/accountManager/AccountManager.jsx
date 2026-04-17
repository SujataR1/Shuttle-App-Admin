import React, { useEffect, useState } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import axios from "axios";

const AccountManager = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const token = localStorage.getItem("access_token");

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://be.shuttleapp.transev.site/admin/account-managers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setManagers(res.data?.data || []);
    } catch (err) {
      console.error("API Error:", err);
      
      if (err.response?.status === 401) {
        console.error("Unauthorized - Please login again");
      }
      
      // Fallback demo data (only if API fails)
      setManagers([
        {
          id: 1,
          name: "Priya Sen",
          email: "priya@mail.com",
          phone: "9876543210",
          assigned_fleets: 10,
          revenue: 200000,
          is_active: true,
        },
        {
          id: 2,
          name: "Rahul Gupta",
          email: "rahul@mail.com",
          phone: "9123456780",
          assigned_fleets: 7,
          revenue: 150000,
          is_active: false,
        },
      ]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchManagers();
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
              <p className="text-gray-500">Loading account managers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleStatus = async (managerId, currentStatus) => {
    try {
      const response = await axios.patch(
        `https://be.shuttleapp.transev.site/admin/account-managers/${managerId}/toggle`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        fetchManagers();
        alert(`Manager ${!currentStatus ? "activated" : "deactivated"} successfully`);
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Failed to update status");
    }
  };

  const handleViewDetails = (manager) => {
    alert(`View details for ${manager.name} - Coming soon`);
    console.log("View manager:", manager);
  };

  const handleAssignFleet = (manager) => {
    alert(`Assign fleet to ${manager.name} - Coming soon`);
    console.log("Assign fleet to:", manager);
  };

  const handleViewPerformance = (manager) => {
    alert(`View performance for ${manager.name} - Coming soon`);
    console.log("View performance for:", manager);
  };

  const handleAddManager = () => {
    alert("Add new manager - Coming soon");
    setShowAddModal(false);
  };

  // Filter managers based on search
  const filteredManagers = managers.filter((manager) =>
    manager.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.phone?.includes(searchTerm)
  );

  // Calculate summary stats
  const totalManagers = managers.length;
  const activeManagers = managers.filter((m) => m.is_active).length;
  const totalFleets = managers.reduce((acc, m) => acc + (m.assigned_fleets || 0), 0);
  const totalRevenue = managers.reduce((acc, m) => acc + (m.revenue || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopNavbarUltra />

        <div className="p-6 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-semibold text-black">
              Account Manager Management
            </h1>

            <div className="flex gap-3 mt-2 sm:mt-0">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black w-64 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
              >
                + Add Manager
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fadeIn">
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Managers</p>
              <p className="text-2xl font-bold text-black">{totalManagers}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Active Managers</p>
              <p className="text-2xl font-bold text-green-600">{activeManagers}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Fleets</p>
              <p className="text-2xl font-bold text-blue-600">{totalFleets}</p>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left font-semibold">Manager</th>
                    <th className="p-3 text-left font-semibold">Contact</th>
                    <th className="p-3 text-left font-semibold">Fleets</th>
                    <th className="p-3 text-left font-semibold">Revenue</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-400">
                        {searchTerm ? "No matching managers found" : "No Managers Found"}
                      </td>
                    </tr>
                  ) : (
                    filteredManagers.map((manager, index) => (
                      <tr
                        key={manager.id || index}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        {/* Name */}
                        <td className="p-3">
                          <p className="font-medium text-black">{manager.name}</p>
                          <p className="text-xs text-gray-500">
                            ID: {manager.id || index + 1}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="p-3">
                          <p className="text-gray-700">{manager.email}</p>
                          <p className="text-xs text-gray-500">{manager.phone}</p>
                        </td>

                        {/* Fleets */}
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {manager.assigned_fleets || 0}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="p-3 font-medium text-gray-700">
                          ₹{(manager.revenue || 0).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              manager.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {manager.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleViewDetails(manager)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition"
                            >
                              View
                            </button>

                            <button
                              onClick={() => handleAssignFleet(manager)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                            >
                              Assign Fleet
                            </button>

                            <button
                              onClick={() => handleViewPerformance(manager)}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition"
                            >
                              Performance
                            </button>

                            <button
                              onClick={() => handleToggleStatus(manager.id, manager.is_active)}
                              className={`px-3 py-1 rounded text-xs transition ${
                                manager.is_active
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {manager.is_active ? "Deactivate" : "Activate"}
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
                fetchManagers();
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

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96 max-w-[90%]">
            <h3 className="text-xl font-bold mb-4 text-black">Add New Manager</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManager}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Add Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;