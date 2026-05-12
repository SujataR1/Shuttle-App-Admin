import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CardActivityLog = () => {
  const [cardId, setCardId] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchActivity = async () => {
    if (!cardId) {
      toast.error("Please enter a Card ID");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      // Fetch both ledger and recharges
      const [ledgerRes, rechargesRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/rfid/cards/${cardId}/ledger?page=1&page_size=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/rfid/cards/${cardId}/recharges?page=1&page_size=50`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      // Combine and sort by date
      const combined = [
        ...ledgerRes.data.items.map(item => ({ ...item, activity_type: "ledger" })),
        ...rechargesRes.data.items.map(item => ({ ...item, activity_type: "recharge" }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setActivities(combined);
      setSearched(true);
    } catch (error) {
      toast.error("Failed to fetch activity");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black">
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
              <h1 className="text-2xl font-bold text-white mb-6 text-center">Card Activity Log</h1>
              
              <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="Enter Card ID"
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
                  />
                  <button 
                    onClick={fetchActivity} 
                    disabled={loading} 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "View Activity"}
                  </button>
                </div>
              </div>

              {searched && (
                <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Activity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Balance After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {activities.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No activity found</td>
                          </tr>
                        ) : (
                          activities.map((activity, idx) => (
                            <tr key={idx} className="hover:bg-gray-800 transition">
                              <td className="px-4 py-3 text-gray-300">{new Date(activity.created_at).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  activity.activity_type === "recharge" 
                                    ? "bg-green-500/20 text-green-400" 
                                    : "bg-blue-500/20 text-blue-400"
                                }`}>
                                  {activity.activity_type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-300">{activity.entry_type || activity.source_type}</td>
                              <td className={`px-4 py-3 text-right ${
                                activity.amount_delta 
                                  ? (parseFloat(activity.amount_delta) > 0 ? "text-green-400" : "text-red-400") 
                                  : "text-green-400"
                              }`}>
                                {activity.amount_delta ? (parseFloat(activity.amount_delta) > 0 ? "+" : "") : "+"}
                                {activity.amount || activity.amount_delta}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-300">{activity.balance_after || "-"}</td>
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

export default CardActivityLog;