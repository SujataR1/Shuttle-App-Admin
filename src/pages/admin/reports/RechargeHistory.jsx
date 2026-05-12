import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const RechargeHistory = () => {
  const [cardId, setCardId] = useState("");
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchRecharges = async () => {
    if (!cardId) {
      toast.error("Please enter a Card ID");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}/recharges?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecharges(response.data.items);
      setSearched(true);
    } catch (error) {
      toast.error("Failed to fetch recharge history");
      setRecharges([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Page Content - Centered */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-6">
            <div className="w-full max-w-6xl">
              <h1 className="text-2xl font-bold text-white mb-6 text-center">Recharge History</h1>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="Enter Card ID"
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button 
                    onClick={fetchRecharges} 
                    disabled={loading} 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "View History"}
                  </button>
                </div>
              </div>

              {searched && (
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Source</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Verified By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {recharges.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-400">No recharges found</td>
                          </tr>
                        ) : (
                          recharges.map(recharge => (
                            <tr key={recharge.id} className="hover:bg-gray-700/50 transition">
                              <td className="px-4 py-3 text-gray-300">{new Date(recharge.created_at).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right text-green-400">+{recharge.amount}</td>
                              <td className="px-4 py-3 text-gray-300">{recharge.source_type}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  recharge.status === "credited" 
                                    ? "bg-green-500/20 text-green-400" 
                                    : "bg-yellow-500/20 text-yellow-400"
                                }`}>
                                  {recharge.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-300">{recharge.verified_by_admin_id || "System"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RechargeHistory;