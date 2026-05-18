import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
  DevicePhoneMobileIcon, 
  PlusIcon, 
  FunnelIcon, 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const DevicesList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDeviceId, setExpandedDeviceId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_BASE}/admin/rfid/devices?page=${page}&page_size=25`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.status) url += `&status=${filters.status}`;

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

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
    toast.info("Device list refreshed");
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
      toast.success(`✓ Device ${actionText} successfully`);
      fetchDevices();
    } catch (error) {
      const message = error.response?.data?.detail?.message || `Failed to ${actionText} device`;
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecommission = async (deviceId) => {
    if (!window.confirm("⚠️ This action cannot be undone. Are you sure you want to decommission this device?")) return;

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

  const getStatusConfig = (device) => {
    if (device.decommissioned_at) {
      return {
        label: 'Decommissioned',
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        icon: XCircleIcon,
        dotColor: 'bg-red-500'
      };
    }
    if (device.is_active) {
      return {
        label: 'Active',
        color: 'green',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        icon: CheckCircleIcon,
        dotColor: 'bg-emerald-500'
      };
    }
    return {
      label: 'Inactive',
      color: 'gray',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      icon: XCircleIcon,
      dotColor: 'bg-gray-400'
    };
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const clearFilters = () => {
    setFilters({ search: "", status: "" });
    setPage(1);
    setShowFilters(false);
  };

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopNavbar />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">RFID Devices</h1>
                  <p className="text-gray-500 mt-1">Monitor and manage your fleet's RFID scanners</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={refreshData}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <Link
                    to="/admin/rfid/devices/register"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Register Device
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Devices</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
                  </div>
                  <DevicePhoneMobileIcon className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">
                      {devices.filter(d => d.is_active && !d.decommissioned_at).length}
                    </p>
                  </div>
                  <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Inactive</p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">
                      {devices.filter(d => !d.is_active && !d.decommissioned_at).length}
                    </p>
                  </div>
                  <XCircleIcon className="w-10 h-10 text-amber-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Decommissioned</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">
                      {devices.filter(d => d.decommissioned_at).length}
                    </p>
                  </div>
                  <TrashIcon className="w-10 h-10 text-red-500" />
                </div>
              </div>
            </div>

            {/* Search & Filters Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by serial number or vehicle ID..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                  {(filters.search || filters.status) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Devices Grid/List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 mb-3"></div>
                        <div className="h-4 bg-gray-100 rounded w-64"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : devices.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <DevicePhoneMobileIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
                <p className="text-gray-500 mb-4">Get started by registering your first RFID device</p>
                <Link
                  to="/admin/rfid/devices/register"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  <PlusIcon className="w-4 h-4" />
                  Register Device
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => {
                  const statusConfig = getStatusConfig(device);
                  const StatusIcon = statusConfig.icon;
                  const lastSeen = formatRelativeTime(device.last_seen_at);
                  const hasLocation = device.last_seen_lat && device.last_seen_lng;
                  
                  return (
                    <div key={device.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                      {/* Device Header */}
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Left: Device Info */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <DevicePhoneMobileIcon className="w-6 h-6 text-gray-400" />
                              <h3 className="font-mono text-lg font-semibold text-gray-900">
                                {device.serial_number}
                              </h3>
                              <div className={`inline-flex items-center gap-2 px-3 py-1 ${statusConfig.bgColor} rounded-full`}>
                                <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                                <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                              {/* Vehicle Info */}
                              <div className="flex items-start gap-2">
                                <TagIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500">Vehicle ID</p>
                                  <code className="text-sm text-gray-900 font-mono">
                                    {device.vehicle_id}
                                  </code>
                                </div>
                              </div>
                              
                              {/* Last Seen */}
                              {device.last_seen_at && (
                                <div className="flex items-start gap-2">
                                  <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-gray-500">Last Seen</p>
                                    <p className="text-sm text-gray-900">
                                      {lastSeen}
                                      <span className="text-xs text-gray-400 ml-2">
                                        ({new Date(device.last_seen_at).toLocaleString()})
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Location */}
                              {hasLocation && (
                                <div className="flex items-start gap-2">
                                  <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm text-gray-900">
                                      {device.last_seen_lat.toFixed(4)}°, {device.last_seen_lng.toFixed(4)}°
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div className="flex items-center gap-2">
                            {!device.decommissioned_at && (
                              <>
                                {device.is_active ? (
                                  <button
                                    onClick={() => handleAction(device.id, "deactivate", "deactivate")}
                                    disabled={actionLoading === device.id}
                                    className="px-4 py-2 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAction(device.id, "activate", "activate")}
                                    disabled={actionLoading === device.id}
                                    className="px-4 py-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
                                  >
                                    Activate
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDecommission(device.id)}
                                  disabled={actionLoading === device.id}
                                  className="px-4 py-2 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                >
                                  Decommission
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedDeviceId(expandedDeviceId === device.id ? null : device.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                              {expandedDeviceId === device.id ? (
                                <ChevronUpIcon className="w-5 h-5" />
                              ) : (
                                <ChevronDownIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedDeviceId === device.id && (
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 rounded-b-xl">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Notes Section */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                                <h4 className="font-medium text-gray-900">Device Notes</h4>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">
                                  {device.notes || <span className="text-gray-400 italic">No additional notes</span>}
                                </p>
                              </div>
                            </div>
                            
                            {/* Location Details */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <MapPinIcon className="w-5 h-5 text-gray-500" />
                                <h4 className="font-medium text-gray-900">Location Details</h4>
                              </div>
                              {hasLocation ? (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Coordinates</p>
                                    <p className="text-sm font-mono text-gray-900">
                                      {device.last_seen_lat.toFixed(6)}, {device.last_seen_lng.toFixed(6)}
                                    </p>
                                  </div>
                                  <a
                                    href={`https://www.google.com/maps?q=${device.last_seen_lat},${device.last_seen_lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    Open in Google Maps →
                                  </a>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No location data available</p>
                              )}
                            </div>
                            
                            {/* Metadata */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <CalendarIcon className="w-5 h-5 text-gray-500" />
                                <h4 className="font-medium text-gray-900">Timeline</h4>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500">Created</p>
                                  <p className="text-sm text-gray-900">{new Date(device.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Last Updated</p>
                                  <p className="text-sm text-gray-900">{new Date(device.updated_at).toLocaleString()}</p>
                                </div>
                                {device.decommissioned_at && (
                                  <div>
                                    <p className="text-xs text-gray-500">Decommissioned</p>
                                    <p className="text-sm text-red-600">{new Date(device.decommissioned_at).toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Device ID */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-400 font-mono">
                              Device UUID: {device.id}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {totalCount > 25 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page <span className="font-semibold text-gray-900">{page}</span> of {Math.ceil(totalCount / 25)}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {((page - 1) * 25) + 1} - {Math.min(page * 25, totalCount)} of {totalCount}
                  </span>
                </div>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 25 >= totalCount}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DevicesList;