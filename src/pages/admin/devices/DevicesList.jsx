import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { DevicePhoneMobileIcon, PlusIcon, FunnelIcon, XMarkIcon, PowerIcon, TrashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const DevicesList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ vehicle_id: "", is_active: "" });
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_BASE}/admin/rfid/devices?page=${page}&page_size=25`;
      if (filters.vehicle_id) url += `&vehicle_id=${filters.vehicle_id}`;
      if (filters.is_active !== "") url += `&is_active=${filters.is_active}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(response.data.items);
      setTotalCount(response.data.count);
    } catch (error) {
      toast.error("Failed to fetch devices");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [page, filters]);

  const handleAction = async (deviceId, action, actionText) => {
    if (!window.confirm(`Are you sure you want to ${actionText} this device?`)) return;
    
    setActionLoading(deviceId);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/devices/${deviceId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Device ${actionText} successfully`);
      fetchDevices();
    } catch (error) {
      const message = error.response?.data?.detail?.message || `Failed to ${actionText} device`;
      toast.error(message);
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecommission = async (deviceId) => {
    if (!window.confirm("⚠️ WARNING: This will permanently decommission the device. Are you sure?")) return;
    
    setActionLoading(deviceId);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/devices/${deviceId}/decommission`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Device decommissioned successfully");
      fetchDevices();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to decommission device";
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (isActive, decommissionedAt) => {
    if (decommissionedAt) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          Decommissioned
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium border border-green-100">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium border border-gray-100">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        Inactive
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({ vehicle_id: "", is_active: "" });
    setShowFilters(false);
    toast.info("Filters cleared");
  };

  const hasActiveFilters = filters.vehicle_id || filters.is_active;

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Sidebar */}
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Page Content - Centered */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-black rounded-2xl blur-xl opacity-10"></div>
                      <div className="relative w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                        <DevicePhoneMobileIcon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-light text-black tracking-tight">
                        RFID <span className="font-semibold">Devices</span>
                      </h1>
                      <p className="text-gray-500 text-sm mt-1 font-light">Manage and monitor all RFID scanner devices</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/rfid/devices/register"
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Register Device
                  </Link>
                </div>
              </div>

              {/* Filters Toggle */}
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{showFilters ? "Hide Filters" : "Show Filters"}</span>
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 bg-black/5 text-black rounded-full text-xs font-medium">
                      Active
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-lg animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-black text-xs font-semibold uppercase tracking-wider mb-2">
                        Vehicle ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter vehicle ID"
                        value={filters.vehicle_id}
                        onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}
                        className="w-full bg-gray-50 text-black px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-black text-xs font-semibold uppercase tracking-wider mb-2">
                        Device Status
                      </label>
                      <select
                        value={filters.is_active}
                        onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                        className="w-full bg-gray-50 text-black px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300"
                      >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Total Devices</p>
                  <p className="text-3xl font-bold text-black">{totalCount}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Active Devices</p>
                  <p className="text-3xl font-bold text-green-600">{devices.filter(d => d.is_active && !d.decommissioned_at).length}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Inactive Devices</p>
                  <p className="text-3xl font-bold text-yellow-600">{devices.filter(d => !d.is_active && !d.decommissioned_at).length}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Decommissioned</p>
                  <p className="text-3xl font-bold text-red-600">{devices.filter(d => d.decommissioned_at).length}</p>
                </div>
              </div>

              {/* Devices Table */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Serial Number</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Vehicle ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        [...Array(5)].map((_, index) => (
                          <tr key={index} className="animate-pulse">
                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-32"></div></td>
                          </tr>
                        ))
                      ) : devices.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <DevicePhoneMobileIcon className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 font-light">No devices found</p>
                              <p className="text-gray-400 text-sm font-light">Try adjusting your filters or register a new device</p>
                              <Link
                                to="/admin/rfid/devices/register"
                                className="mt-2 text-black hover:text-gray-700 text-sm font-medium underline-offset-4 hover:underline"
                              >
                                + Register a device
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        devices.map((device) => (
                          <tr key={device.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                            <td className="px-6 py-4">
                              <div className="text-black font-medium">{device.serial_number}</div>
                              <div className="text-gray-400 text-xs font-mono mt-0.5">{device.id.substring(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-black text-sm bg-gray-100 px-2 py-1 rounded font-mono">{device.vehicle_id}</code>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(device.is_active, device.decommissioned_at)}</td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700 text-sm">{new Date(device.created_at).toLocaleDateString()}</div>
                              <div className="text-gray-400 text-xs mt-0.5">{new Date(device.created_at).toLocaleTimeString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              {!device.decommissioned_at && (
                                <div className="flex gap-2">
                                  {device.is_active ? (
                                    <button
                                      onClick={() => handleAction(device.id, "deactivate", "deactivate")}
                                      disabled={actionLoading === device.id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all duration-300 text-sm font-medium disabled:opacity-50 border border-yellow-100"
                                    >
                                      <PowerIcon className="w-3.5 h-3.5" />
                                      {actionLoading === device.id ? "..." : "Deactivate"}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAction(device.id, "activate", "activate")}
                                      disabled={actionLoading === device.id}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-300 text-sm font-medium disabled:opacity-50 border border-green-100"
                                    >
                                      <PowerIcon className="w-3.5 h-3.5" />
                                      {actionLoading === device.id ? "..." : "Activate"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDecommission(device.id)}
                                    disabled={actionLoading === device.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 text-sm font-medium disabled:opacity-50 border border-red-100"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    {actionLoading === device.id ? "..." : "Decommission"}
                                  </button>
                                </div>
                              )}
                              {device.decommissioned_at && (
                                <span className="text-gray-400 text-sm font-light">Device retired</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalCount > 25 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white text-black rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-all duration-300 text-sm font-medium border border-gray-200"
                      >
                        ← Previous
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Page</span>
                        <span className="text-black font-semibold">{page}</span>
                        <span className="text-gray-400 text-sm">of {Math.ceil(totalCount / 25)}</span>
                      </div>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * 25 >= totalCount}
                        className="px-4 py-2 bg-white text-black rounded-xl disabled:opacity-50 hover:bg-gray-100 transition-all duration-300 text-sm font-medium border border-gray-200"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs tracking-wider font-light">
                  MANAGING {totalCount} RFID DEVICES
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevicesList;