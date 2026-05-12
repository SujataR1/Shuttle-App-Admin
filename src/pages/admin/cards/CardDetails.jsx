import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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

  useEffect(() => {
    fetchCardDetails();
  }, [cardId]);

  useEffect(() => {
    if (activeTab === "ledger") fetchLedger();
    if (activeTab === "recharges") fetchRecharges();
  }, [activeTab]);

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
      <div className="flex h-screen bg-gray-900">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center">
              <div className="text-white text-xl">Loading card details...</div>
            </div>
          </main>
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
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <button 
                onClick={() => navigate("/admin/rfid/cards")} 
                className="text-purple-400 hover:text-purple-300 mb-4 transition"
              >
                ← Back to Cards
              </button>
              <h1 className="text-2xl font-bold text-white">Card Details: {card.card_uid_masked}</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Card Status</h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-400">Inventory:</span>{' '}
                    <span className={`px-2 py-1 rounded text-sm ${
                      card.inventory_status === "assigned" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {card.inventory_status}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Authorization:</span>{' '}
                    <span className={`px-2 py-1 rounded text-sm ${
                      card.authorization_status === "allowed" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {card.authorization_status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Balance</h3>
                <p className="text-3xl font-bold text-white">₹{availableBalance}</p>
                <p className="text-gray-400 text-sm">
                  Held: ₹{account?.held_balance || "0.00"} | Current: ₹{account?.current_balance || "0.00"}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm mb-2">Assignment</h3>
                {current_assignment ? (
                  <>
                    <p className="text-white">Passenger: {current_assignment.passenger_user_id}</p>
                    <p className="text-gray-400 text-sm">
                      Assigned: {new Date(current_assignment.assigned_at).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">Not assigned</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isDecommissioned && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                  {!isAssigned ? (
                    <button
                      onClick={() => {
                        const userId = prompt("Enter Passenger User ID:");
                        if (userId) handleAction("assign", { passenger_user_id: userId, reason: "Manual assignment" });
                      }}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition disabled:opacity-50"
                    >
                      Assign to Passenger
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("unassign", { reason: "Manual unassignment" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition disabled:opacity-50"
                    >
                      Unassign
                    </button>
                  )}
                  
                  {!isBlocked ? (
                    <button 
                      onClick={() => handleAction("block", { reason: "Manual block" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition disabled:opacity-50"
                    >
                      Block Card
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction("unblock", { reason: "Manual unblock" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition disabled:opacity-50"
                    >
                      Unblock Card
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowRechargeModal(true)} 
                    disabled={actionLoading} 
                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition disabled:opacity-50"
                  >
                    Manual Recharge
                  </button>
                  
                  {isAssigned && (
                    <button 
                      onClick={() => handleAction("return", { sweep_remaining_balance: true, reason: "Card returned" })} 
                      disabled={actionLoading} 
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition disabled:opacity-50"
                    >
                      Return Card
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleAction("decommission", { sweep_remaining_balance: true, reason: "Card decommissioned" })} 
                    disabled={actionLoading} 
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition disabled:opacity-50"
                  >
                    Decommission
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-gray-800 rounded-lg">
              <div className="border-b border-gray-700">
                <div className="flex space-x-4 px-6">
                  <button 
                    onClick={() => setActiveTab("details")} 
                    className={`py-3 px-2 transition ${
                      activeTab === "details" 
                        ? "border-b-2 border-purple-500 text-purple-400" 
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Details
                  </button>
                  <button 
                    onClick={() => setActiveTab("ledger")} 
                    className={`py-3 px-2 transition ${
                      activeTab === "ledger" 
                        ? "border-b-2 border-purple-500 text-purple-400" 
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Ledger
                  </button>
                  <button 
                    onClick={() => setActiveTab("recharges")} 
                    className={`py-3 px-2 transition ${
                      activeTab === "recharges" 
                        ? "border-b-2 border-purple-500 text-purple-400" 
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Recharges
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <p><strong className="text-gray-400">Card ID:</strong> <span className="text-white">{card.id}</span></p>
                    <p><strong className="text-gray-400">Masked UID:</strong> <span className="text-white font-mono">{card.card_uid_masked}</span></p>
                    <p><strong className="text-gray-400">Created At:</strong> <span className="text-white">{new Date(card.created_at).toLocaleString()}</span></p>
                    <p><strong className="text-gray-400">Notes:</strong> <span className="text-white">{card.notes || "No notes"}</span></p>
                  </div>
                )}

                {activeTab === "ledger" && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-300">Date</th>
                          <th className="px-4 py-2 text-left text-gray-300">Type</th>
                          <th className="px-4 py-2 text-right text-gray-300">Amount</th>
                          <th className="px-4 py-2 text-right text-gray-300">Balance After</th>
                          <th className="px-4 py-2 text-left text-gray-300">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No ledger entries found</td>
                          </tr>
                        ) : (
                          ledger.map(entry => (
                            <tr key={entry.id} className="border-t border-gray-700">
                              <td className="px-4 py-2 text-gray-300">{new Date(entry.created_at).toLocaleString()}</td>
                              <td className="px-4 py-2 text-gray-300">{entry.entry_type}</td>
                              <td className={`px-4 py-2 text-right ${parseFloat(entry.amount_delta) > 0 ? "text-green-400" : "text-red-400"}`}>
                                {parseFloat(entry.amount_delta) > 0 ? "+" : ""}{entry.amount_delta}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-300">{entry.balance_after}</td>
                              <td className="px-4 py-2 text-gray-300">{entry.note || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "recharges" && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-300">Date</th>
                          <th className="px-4 py-2 text-right text-gray-300">Amount</th>
                          <th className="px-4 py-2 text-left text-gray-300">Source</th>
                          <th className="px-4 py-2 text-left text-gray-300">Status</th>
                          <th className="px-4 py-2 text-left text-gray-300">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recharges.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No recharges found</td>
                          </tr>
                        ) : (
                          recharges.map(recharge => (
                            <tr key={recharge.id} className="border-t border-gray-700">
                              <td className="px-4 py-2 text-gray-300">{new Date(recharge.created_at).toLocaleString()}</td>
                              <td className="px-4 py-2 text-right text-green-400">+{recharge.amount}</td>
                              <td className="px-4 py-2 text-gray-300">{recharge.source_type}</td>
                              <td className="px-4 py-2 text-gray-300">{recharge.status}</td>
                              <td className="px-4 py-2 text-gray-300">{recharge.note || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Manual Recharge</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={rechargeAmount} 
                  onChange={(e) => setRechargeAmount(e.target.value)} 
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="100.00" 
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Note (Optional)</label>
                <textarea 
                  value={rechargeNote} 
                  onChange={(e) => setRechargeNote(e.target.value)} 
                  rows="3" 
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Cash received, etc." 
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleManualRecharge} 
                  disabled={actionLoading} 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  Add Recharge
                </button>
                <button 
                  onClick={() => setShowRechargeModal(false)} 
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
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