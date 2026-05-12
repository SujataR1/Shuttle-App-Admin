import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CreditCardIcon, PlusIcon, DocumentDuplicateIcon, FunnelIcon, XMarkIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const CardsList = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    inventory_status: "",
    authorization_status: "",
    assigned_passenger_user_id: ""
  });

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchCards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_BASE}/admin/rfid/cards?page=${page}&page_size=25`;
      if (filters.inventory_status) url += `&inventory_status=${filters.inventory_status}`;
      if (filters.authorization_status) url += `&authorization_status=${filters.authorization_status}`;
      if (filters.assigned_passenger_user_id) url += `&assigned_passenger_user_id=${filters.assigned_passenger_user_id}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(response.data.items);
      setTotalCount(response.data.count);
    } catch (error) {
      toast.error("Failed to fetch cards");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [page, filters]);

  const getStatusBadge = (inventoryStatus, authStatus) => {
    const statusConfig = {
      inventory: { bg: "bg-blue-50", text: "text-blue-700", icon: "📦" },
      assigned: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✓" },
      lost: { bg: "bg-red-50", text: "text-red-700", icon: "⚠️" },
      decommissioned: { bg: "bg-gray-100", text: "text-gray-500", icon: "✗" }
    };
    const authConfig = {
      allowed: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "🔓" },
      blocked: { bg: "bg-rose-50", text: "text-rose-700", icon: "🔒" }
    };
    const status = statusConfig[inventoryStatus] || statusConfig.inventory;
    const auth = authConfig[authStatus] || authConfig.allowed;
    
    return (
      <div className="flex flex-col gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text}`}>
          <span className="text-sm">{status.icon}</span>
          {inventoryStatus}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${auth.bg} ${auth.text}`}>
          <span className="text-sm">{auth.icon}</span>
          {authStatus}
        </span>
      </div>
    );
  };

  const clearFilters = () => {
    setFilters({ inventory_status: "", authorization_status: "", assigned_passenger_user_id: "" });
    setShowFilters(false);
    toast.info("Filters cleared");
  };

  const hasActiveFilters = filters.inventory_status || filters.authorization_status || filters.assigned_passenger_user_id;

  // Calculate stats
  const assignedCount = cards.filter(c => c.inventory_status === "assigned").length;
  const availableCount = cards.filter(c => c.inventory_status === "inventory").length;
  const blockedCount = cards.filter(c => c.authorization_status === "blocked").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopNavbar />
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">RFID Cards</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage and monitor all RFID cards in the system</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/admin/rfid/cards/register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition border border-gray-200 shadow-sm hover:shadow"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Register Single
                  </Link>
                  <Link
                    to="/admin/rfid/cards/bulk-register"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl text-sm font-medium hover:from-gray-900 hover:to-gray-800 transition shadow-md hover:shadow-lg"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    Bulk Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Cards</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Assigned Cards</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{assignedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${totalCount ? (assignedCount / totalCount) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Available Cards</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{availableCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${totalCount ? (availableCount / totalCount) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Blocked Cards</p>
                    <p className="text-3xl font-bold text-rose-600 mt-1">{blockedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${totalCount ? (blockedCount / totalCount) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm font-medium"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
                    {hasActiveFilters && (
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">Active</span>
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
                <div className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-gray-900">{totalCount}</span> cards
                </div>
              </div>

              {showFilters && (
                <div className="px-6 py-5 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Inventory Status</label>
                      <select
                        value={filters.inventory_status}
                        onChange={(e) => setFilters({ ...filters, inventory_status: e.target.value })}
                        className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="inventory">Inventory</option>
                        <option value="assigned">Assigned</option>
                        <option value="lost">Lost</option>
                        <option value="decommissioned">Decommissioned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Authorization Status</label>
                      <select
                        value={filters.authorization_status}
                        onChange={(e) => setFilters({ ...filters, authorization_status: e.target.value })}
                        className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition text-sm"
                      >
                        <option value="">All Status</option>
                        <option value="allowed">Allowed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Passenger User ID</label>
                      <input
                        type="text"
                        placeholder="Enter passenger ID"
                        value={filters.assigned_passenger_user_id}
                        onChange={(e) => setFilters({ ...filters, assigned_passenger_user_id: e.target.value })}
                        className="w-full bg-white text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition text-sm placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cards Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Masked UID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned At</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                          <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                        </tr>
                      ))
                    ) : cards.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <CreditCardIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No cards found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or register a new card</p>
                            <Link to="/admin/rfid/cards/register" className="mt-4 text-gray-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
                              <PlusIcon className="w-4 h-4" />
                              Register a card
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      cards.map((card) => (
                        <tr key={card.id} className="hover:bg-gray-50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="font-mono text-gray-900 text-sm font-medium">{card.card_uid_masked}</div>
                            <div className="text-gray-400 text-xs font-mono mt-0.5">{card.id.slice(0, 12)}...</div>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(card.inventory_status, card.authorization_status)}</td>
                          <td className="px-6 py-4">
                            <div className="text-gray-600 text-sm">
                              {card.assigned_passenger_user_id ? (
                                <span className="inline-flex items-center gap-1">
                                  <UserGroupIcon className="w-3 h-3 text-gray-400" />
                                  {card.assigned_passenger_user_id}
                                </span>
                              ) : (
                                <span className="text-gray-400">Not assigned</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-500 text-sm">
                              {card.assigned_at ? new Date(card.assigned_at).toLocaleDateString() : "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/admin/rfid/cards/${card.id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 transition text-sm font-medium rounded-lg hover:bg-gray-100"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalCount > 25 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900 transition"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="text-sm text-gray-500">
                    Page <span className="font-semibold text-gray-900">{page}</span> of {Math.ceil(totalCount / 25)}
                  </div>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 25 >= totalCount}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900 transition"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CardsList;