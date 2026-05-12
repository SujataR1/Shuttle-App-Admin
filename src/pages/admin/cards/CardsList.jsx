import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CreditCardIcon, PlusIcon, DocumentDuplicateIcon, FunnelIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

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
      inventory: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", dot: "bg-blue-500" },
      assigned: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", dot: "bg-green-500" },
      lost: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", dot: "bg-red-500" },
      decommissioned: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-100", dot: "bg-gray-400" }
    };
    const authConfig = {
      allowed: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", dot: "bg-green-500" },
      blocked: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", dot: "bg-red-500" }
    };
    const status = statusConfig[inventoryStatus] || statusConfig.inventory;
    const auth = authConfig[authStatus] || authConfig.allowed;
    
    return (
      <div className="flex flex-col gap-1.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
          <span className={`w-1.5 h-1.5 ${status.dot} rounded-full ${inventoryStatus === 'assigned' ? 'animate-pulse' : ''}`}></span>
          {inventoryStatus}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${auth.bg} ${auth.text} border ${auth.border}`}>
          <span className={`w-1.5 h-1.5 ${auth.dot} rounded-full ${authStatus === 'allowed' ? 'animate-pulse' : ''}`}></span>
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
                        <CreditCardIcon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-3xl font-light text-black tracking-tight">
                        RFID <span className="font-semibold">Cards</span>
                      </h1>
                      <p className="text-gray-500 text-sm mt-1 font-light">Manage and monitor all RFID cards in the system</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to="/admin/rfid/cards/register"
                      className="inline-flex items-center gap-2 bg-gray-100 text-black px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 border border-gray-200"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Register Single
                    </Link>
                    <Link
                      to="/admin/rfid/cards/bulk-register"
                      className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Bulk Register
                    </Link>
                  </div>
                </div>
              </div>

              {/* Filters Toggle Button */}
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

              {/* Filters Panel - Fixed with proper styling */}
              {showFilters && (
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-lg transition-all duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-black text-xs font-semibold uppercase tracking-wider mb-2">
                        Inventory Status
                      </label>
                      <select
                        value={filters.inventory_status}
                        onChange={(e) => setFilters({ ...filters, inventory_status: e.target.value })}
                        className="w-full bg-gray-50 text-black px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300"
                      >
                        <option value="">All Status</option>
                        <option value="inventory">Inventory</option>
                        <option value="assigned">Assigned</option>
                        <option value="lost">Lost</option>
                        <option value="decommissioned">Decommissioned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-black text-xs font-semibold uppercase tracking-wider mb-2">
                        Authorization Status
                      </label>
                      <select
                        value={filters.authorization_status}
                        onChange={(e) => setFilters({ ...filters, authorization_status: e.target.value })}
                        className="w-full bg-gray-50 text-black px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300"
                      >
                        <option value="">All Status</option>
                        <option value="allowed">Allowed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-black text-xs font-semibold uppercase tracking-wider mb-2">
                        Passenger User ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter passenger ID"
                        value={filters.assigned_passenger_user_id}
                        onChange={(e) => setFilters({ ...filters, assigned_passenger_user_id: e.target.value })}
                        className="w-full bg-gray-50 text-black px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Total Cards</p>
                  <p className="text-3xl font-bold text-black">{totalCount}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Current Page</p>
                  <p className="text-3xl font-bold text-black">{page}</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Cards per Page</p>
                  <p className="text-3xl font-bold text-black">25</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Active Filters</p>
                  <p className="text-3xl font-bold text-black">{hasActiveFilters ? "Yes" : "No"}</p>
                </div>
              </div>

              {/* Cards Table */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Masked UID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Assigned At</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        [...Array(5)].map((_, index) => (
                          <tr key={index} className="animate-pulse">
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
                            <div className="flex flex-col items-center gap-3">
                              <CreditCardIcon className="w-12 h-12 text-gray-300" />
                              <p className="text-gray-500 font-light">No cards found</p>
                              <p className="text-gray-400 text-sm font-light">Try adjusting your filters or register a new card</p>
                              <Link
                                to="/admin/rfid/cards/register"
                                className="mt-2 text-black hover:text-gray-700 text-sm font-medium underline-offset-4 hover:underline"
                              >
                                + Register a card
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        cards.map((card) => (
                          <tr key={card.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                            <td className="px-6 py-4">
                              <div className="font-mono text-black text-sm font-medium">{card.card_uid_masked}</div>
                              <div className="text-gray-400 text-xs font-mono mt-0.5">{card.id.substring(0, 8)}...</div>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(card.inventory_status, card.authorization_status)}</td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700 text-sm">{card.assigned_passenger_user_id || "Not assigned"}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700 text-sm">
                                {card.assigned_at ? new Date(card.assigned_at).toLocaleDateString() : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/admin/rfid/cards/${card.id}`}
                                className="inline-flex items-center gap-1.5 text-black hover:text-gray-600 transition-all duration-300 group-hover:gap-2 font-medium text-sm"
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
                  MANAGING {totalCount} RFID CARDS
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CardsList;