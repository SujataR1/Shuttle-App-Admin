import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  ArrowLeftIcon, 
  CreditCardIcon, 
  UserIcon, 
  CurrencyRupeeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const CardDetails = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [ledger, setLedger] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Passenger selection modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchCardDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCardData(response.data);
    } catch (error) {
      toast.error("Failed to fetch card details");
      navigate("/admin/rfid/cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}/ledger?page=1&page_size=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLedger(response.data.items);
    } catch (error) {
      toast.error("Failed to fetch ledger");
    }
  };

  const fetchRecharges = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}/recharges?page=1&page_size=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecharges(response.data.items);
    } catch (error) {
      toast.error("Failed to fetch recharges");
    }
  };

  const fetchAllPassengers = async () => {
    setLoadingPassengers(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/view/all-passengers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const passengersData = Array.isArray(response.data) ? response.data : [];
      setPassengers(passengersData);
      setFilteredPassengers(passengersData);
    } catch (error) {
      toast.error("Failed to fetch passengers");
      console.error(error);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const openPassengerModal = () => {
    setShowPassengerModal(true);
    setSearchTerm("");
    setSelectedPassenger(null);
    fetchAllPassengers();
  };

  const handleAssignToPassenger = async () => {
    if (!selectedPassenger) {
      toast.error("Please select a passenger");
      return;
    }
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/cards/${cardId}/assign`,
        { 
          passenger_user_id: selectedPassenger.user_id,
          reason: "Assigned from admin panel"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Card assigned to ${selectedPassenger.profile?.name || selectedPassenger.email}`);
      setShowPassengerModal(false);
      fetchCardDetails();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to assign card";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [cardId]);

  useEffect(() => {
    if (activeTab === "ledger") fetchLedger();
    if (activeTab === "recharges") fetchRecharges();
  }, [activeTab]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPassengers(passengers);
    } else {
      const filtered = passengers.filter(passenger => {
        const name = (passenger.profile?.name || "").toLowerCase();
        const email = (passenger.email || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
      });
      setFilteredPassengers(filtered);
    }
  }, [searchTerm, passengers]);

  const handleAction = async (action, body = {}) => {
    if (!window.confirm(`Are you sure you want to ${action} this card?`)) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/cards/${cardId}/${action}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Card ${action} successfully`);
      fetchCardDetails();
      if (activeTab === "ledger") fetchLedger();
      if (activeTab === "recharges") fetchRecharges();
    } catch (error) {
      const message = error.response?.data?.detail?.message || `Failed to ${action} card`;
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/recharges/manual`,
        {
          card_id: cardId,
          amount: rechargeAmount,
          note: rechargeNote
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Recharge added successfully");
      setShowRechargeModal(false);
      setRechargeAmount("");
      setRechargeNote("");
      fetchCardDetails();
      if (activeTab === "ledger") fetchLedger();
      if (activeTab === "recharges") fetchRecharges();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to add recharge";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopNavbar sidebarOpen={sidebarOpen} />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
              <p className="text-gray-500">Loading card details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cardData) return null;

  const { card, account, current_assignment } = cardData;
  const isAssigned = card.inventory_status === "assigned";
  const isBlocked = card.authorization_status === "blocked";
  const isDecommissioned = card.inventory_status === "decommissioned";
  const availableBalance = account?.available_balance || "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopNavbar sidebarOpen={sidebarOpen} />
        
        <main className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button 
                onClick={() => navigate("/admin/rfid/cards")} 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-4"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="text-sm">Back to Cards</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                  <CreditCardIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Card Details</h1>
                  <p className="text-gray-500 text-sm mt-0.5">{card.card_uid_masked}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-500 text-sm font-medium">Card Status</h3>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Inventory:</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      card.inventory_status === "assigned" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {card.inventory_status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Authorization:</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      card.authorization_status === "allowed" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {card.authorization_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-500 text-sm font-medium">Balance</h3>
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{parseFloat(availableBalance).toFixed(2)}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Held: ₹{parseFloat(account?.held_balance || 0).toFixed(2)} | 
                  Current: ₹{parseFloat(account?.current_balance || 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-500 text-sm font-medium">Assignment</h3>
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                {current_assignment ? (
                  <>
                    <p className="text-gray-900 text-sm font-medium">{current_assignment.passenger_user_id}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Assigned: {new Date(current_assignment.assigned_at).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">Not assigned</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isDecommissioned && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                <h2 className="text-gray-900 font-semibold mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  {!isAssigned ? (
                    <button
                      onClick={openPassengerModal}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition disabled:opacity-50"
                    >
                      Assign to Passenger
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("unassign", { reason: "Manual unassignment" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition disabled:opacity-50"
                    >
                      Unassign
                    </button>
                  )}
                  
                  {!isBlocked ? (
                    <button 
                      onClick={() => handleAction("block", { reason: "Manual block" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      Block Card
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("unblock", { reason: "Manual unblock" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition disabled:opacity-50"
                    >
                      Unblock Card
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowRechargeModal(true)} 
                    disabled={actionLoading} 
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Manual Recharge
                  </button>
                  
                  {isAssigned && (
                    <button 
                      onClick={() => handleAction("return", { sweep_remaining_balance: true, reason: "Card returned" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition disabled:opacity-50"
                    >
                      Return Card
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleAction("decommission", { sweep_remaining_balance: true, reason: "Card decommissioned" })} 
                    disabled={actionLoading} 
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                  >
                    Decommission
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex space-x-6 px-6">
                  <button 
                    onClick={() => setActiveTab("details")} 
                    className={`py-3 text-sm font-medium transition ${
                      activeTab === "details" 
                        ? "border-b-2 border-gray-800 text-gray-900" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => setActiveTab("ledger")} 
                    className={`py-3 text-sm font-medium transition ${
                      activeTab === "ledger" 
                        ? "border-b-2 border-gray-800 text-gray-900" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Ledger
                  </button>
                  <button 
                    onClick={() => setActiveTab("recharges")} 
                    className={`py-3 text-sm font-medium transition ${
                      activeTab === "recharges" 
                        ? "border-b-2 border-gray-800 text-gray-900" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Recharges
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Card ID</label>
                        <p className="text-gray-900 font-mono text-sm mt-1">{card.id}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Masked UID</label>
                        <p className="text-gray-900 font-mono text-sm mt-1">{card.card_uid_masked}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Created At</label>
                        <p className="text-gray-900 text-sm mt-1">{new Date(card.created_at).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Notes</label>
                        <p className="text-gray-600 text-sm mt-1">{card.notes || "No notes"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ledger" && (
                  <div className="overflow-x-auto">
                    {ledger.length === 0 ? (
                      <div className="text-center py-12">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No ledger entries found</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {ledger.map(entry => (
                            <tr key={entry.id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-3 text-gray-600 text-sm">{new Date(entry.created_at).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {entry.entry_type}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold ${parseFloat(entry.amount_delta) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {parseFloat(entry.amount_delta) > 0 ? "+" : ""}{entry.amount_delta}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-700 font-mono">₹{entry.balance_after}</td>
                              <td className="px-4 py-3 text-gray-500 text-sm">{entry.note || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === "recharges" && (
                  <div className="overflow-x-auto">
                    {recharges.length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No recharges found</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {recharges.map(recharge => (
                            <tr key={recharge.id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-3 text-gray-600 text-sm">{new Date(recharge.created_at).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right text-emerald-600 font-semibold">+₹{parseFloat(recharge.amount).toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                  {recharge.source_type}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  recharge.status === "credited" 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {recharge.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-sm">{recharge.note || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Passenger Selection Modal */}
      {showPassengerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <UserPlusIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Assign to Passenger</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Select a passenger to assign this card</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPassengerModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingPassengers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                </div>
              ) : filteredPassengers.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No passengers found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPassengers.map((passenger) => (
                    <button
                      key={passenger.user_id}
                      onClick={() => setSelectedPassenger(passenger)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        selectedPassenger?.user_id === passenger.user_id
                          ? "bg-emerald-50 border-2 border-emerald-500"
                          : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-medium">
                          {(passenger.profile?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{passenger.profile?.name || "N/A"}</p>
                          <p className="text-sm text-gray-500">{passenger.email}</p>
                          {passenger.total_trips_booked > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{passenger.total_trips_booked} trips booked</p>
                          )}
                        </div>
                        {selectedPassenger?.user_id === passenger.user_id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleAssignToPassenger}
                disabled={!selectedPassenger || actionLoading}
                className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {actionLoading ? "Assigning..." : "Assign Card"}
              </button>
              <button
                onClick={() => setShowPassengerModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Manual Recharge</h2>
              <button onClick={() => setShowRechargeModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={rechargeAmount} 
                  onChange={(e) => setRechargeAmount(e.target.value)} 
                  className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  placeholder="100.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                <textarea 
                  value={rechargeNote} 
                  onChange={(e) => setRechargeNote(e.target.value)} 
                  rows="3" 
                  className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                  placeholder="Cash received, etc." 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleManualRecharge} 
                  disabled={actionLoading} 
                  className="flex-1 bg-gray-800 text-white py-2.5 rounded-xl font-medium hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Add Recharge"}
                </button>
                <button 
                  onClick={() => setShowRechargeModal(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetails;