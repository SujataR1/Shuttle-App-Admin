import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { DevicePhoneMobileIcon, PlusIcon, FunnelIcon, XMarkIcon, PowerIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          Decommissioned
        </span>
      );
    }
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
        Inactive
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({ vehicle_id: "", is_active: "" });
    setShowFilters(false);
    toast.info("Filters cleared");
    fetchDevices();
  };

  const applyFilters = () => {
    setPage(1);
    fetchDevices();
    toast.success("Filters applied");
  };

  const hasActiveFilters = filters.vehicle_id || filters.is_active;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">RFID Devices</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and monitor all RFID scanner devices</p>
                  </div>
                  <Link
                    to="/admin/rfid/devices/register"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Register Device
                  </Link>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition text-sm"
                    >
                      <FunnelIcon className="w-4 h-4" />
                      <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                      {hasActiveFilters && (
                        <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">Active</span>
                      )}
                    </button>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    Total: <span className="font-semibold text-slate-900">{totalCount}</span> devices
                  </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle ID</label>
                        <input
                          type="text"
                          placeholder="Search by vehicle ID"
                          value={filters.vehicle_id}
                          onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}
                          className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Device Status</label>
                        <select
                          value={filters.is_active}
                          onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
                          className="w-full bg-slate-50 text-slate-900 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
                        >
                          <option value="">All Status</option>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={applyFilters}
                          className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Total Devices</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1">{totalCount}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Active</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">{devices.filter(d => d.is_active && !d.decommissioned_at).length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Inactive</p>
                  <p className="text-2xl font-semibold text-amber-600 mt-1">{devices.filter(d => !d.is_active && !d.decommissioned_at).length}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Decommissioned</p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">{devices.filter(d => d.decommissioned_at).length}</p>
                </div>
              </div>

              {/* Devices Table */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serial Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                            <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                            <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-32"></div></td>
                          </tr>
                        ))
                      ) : devices.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <DevicePhoneMobileIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No devices found</p>
                            <Link to="/admin/rfid/devices/register" className="text-slate-600 text-sm hover:underline mt-2 inline-block">
                              + Register a device
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        devices.map((device) => (
                          <tr key={device.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{device.serial_number}</div>
                              <div className="text-slate-400 text-xs font-mono mt-0.5">{device.id.slice(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">{device.vehicle_id}</code>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(device.is_active, device.decommissioned_at)}</td>
                            <td className="px-6 py-4">
                              <div className="text-slate-700 text-sm">{new Date(device.created_at).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              {!device.decommissioned_at && (
                                <div className="flex gap-2">
                                  {device.is_active ? (
                                    <button
                                      onClick={() => handleAction(device.id, "deactivate", "deactivate")}
                                      disabled={actionLoading === device.id}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 text-sm font-medium"
                                    >
                                      <PowerIcon className="w-3.5 h-3.5" />
                                      Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleAction(device.id, "activate", "activate")}
                                      disabled={actionLoading === device.id}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-sm font-medium"
                                    >
                                      <PowerIcon className="w-3.5 h-3.5" />
                                      Activate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDecommission(device.id)}
                                    disabled={actionLoading === device.id}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                    Decommission
                                  </button>
                                </div>
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
                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="inline-flex items-center gap-1 text-sm text-slate-600 disabled:opacity-40 hover:text-slate-900"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="text-sm text-slate-500">
                      Page <span className="font-medium text-slate-900">{page}</span> of {Math.ceil(totalCount / 25)}
                    </div>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * 25 >= totalCount}
                      className="inline-flex items-center gap-1 text-sm text-slate-600 disabled:opacity-40 hover:text-slate-900"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevicesList;