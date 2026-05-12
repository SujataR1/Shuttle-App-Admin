import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentTextIcon, CreditCardIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const TransactionLedger = () => {
  const [cardId, setCardId] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchLedger = async () => {
    if (!cardId) {
      toast.error("Please enter a Card ID");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}/ledger?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLedger(response.data.items);
      setSearched(true);
      toast.success(`Found ${response.data.items.length} transactions`);
    } catch (error) {
      toast.error("Failed to fetch ledger");
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    if (type.includes('recharge')) return <CreditCardIcon className="w-4 h-4 text-green-400" />;
    if (type.includes('sweep')) return <ArrowPathIcon className="w-4 h-4 text-red-400" />;
    return <DocumentTextIcon className="w-4 h-4 text-blue-400" />;
  };

  const getAmountColor = (amount) => {
    const value = parseFloat(amount);
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
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
            <div className="w-full max-w-7xl">
              {/* Header with gradient */}
              <div className="text-center mb-8">
                <div className="inline-block p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Transaction Ledger
                </h1>
                <p className="text-gray-500 mt-2">View and track all card transactions</p>
              </div>
              
              {/* Search Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl p-6 mb-6 border border-gray-800 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-400 text-sm mb-2">Card ID</label>
                    <input
                      type="text"
                      value={cardId}
                      onChange={(e) => setCardId(e.target.value)}
                      placeholder="Enter Card ID (e.g., card_abc123)"
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700 transition"
                      onKeyPress={(e) => e.key === 'Enter' && fetchLedger()}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={fetchLedger} 
                      disabled={loading} 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium shadow-lg hover:shadow-purple-500/25"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        "View Ledger"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {searched && (
                <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
                  {/* Stats Bar */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-6 py-4 border-b border-gray-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300 text-sm">
                          Found <span className="text-white font-semibold">{ledger.length}</span> transactions
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        Last updated: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Transaction Type</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Balance After</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Note / Reference</th>
                       </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {ledger.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <DocumentTextIcon className="w-12 h-12 text-gray-600" />
                                <p className="text-gray-500">No transactions found</p>
                                <p className="text-gray-600 text-sm">Try entering a different Card ID</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          ledger.map((entry, index) => (
                            <tr key={entry.id} className="hover:bg-gray-800/50 transition group">
                              <td className="px-6 py-4">
                                <div className="text-gray-300 text-sm">{new Date(entry.created_at).toLocaleString()}</div>
                                <div className="text-gray-500 text-xs">{new Date(entry.created_at).toLocaleTimeString()}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {getTransactionIcon(entry.entry_type)}
                                  <span className="text-gray-300 text-sm font-mono">{entry.entry_type}</span>
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-right font-semibold ${getAmountColor(entry.amount_delta)}`}>
                                {parseFloat(entry.amount_delta) > 0 ? "+" : ""}{entry.amount_delta}
                              </td>
                              <td className="px-6 py-4 text-right text-gray-300 font-mono">
                                ₹{entry.balance_after}
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">
                                {entry.note || "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Stats */}
                  {ledger.length > 0 && (
                    <div className="bg-black px-6 py-4 border-t border-gray-800">
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-500">
                          Showing {ledger.length} transactions
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-gray-400">Credit</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <span className="text-gray-400">Debit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransactionLedger;