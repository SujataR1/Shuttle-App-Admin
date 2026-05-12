import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentTextIcon, CreditCardIcon, ArrowPathIcon, MagnifyingGlassIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';

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
    if (type.includes('recharge')) return <CreditCardIcon className="w-3.5 h-3.5" />;
    if (type.includes('sweep')) return <ArrowPathIcon className="w-3.5 h-3.5" />;
    return <DocumentTextIcon className="w-3.5 h-3.5" />;
  };

  const getTransactionTypeStyle = (type) => {
    if (type.includes('recharge')) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Recharge" };
    if (type.includes('sweep')) return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Sweep" };
    if (type.includes('return')) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Return" };
    if (type.includes('debit')) return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Debit" };
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: type };
  };

  const getAmountColor = (amount) => {
    const value = parseFloat(amount);
    if (value > 0) return "text-emerald-600";
    if (value < 0) return "text-rose-600";
    return "text-gray-500";
  };

  const getAmountPrefix = (amount) => {
    const value = parseFloat(amount);
    if (value > 0) return "+";
    return "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Transaction Ledger</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Complete transaction history for RFID cards</p>
                  </div>
                </div>
              </div>
              
              {/* Search Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-slate-400" />
                        Card Identifier
                      </label>
                      <input
                        type="text"
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)}
                        placeholder="Enter RFID card ID"
                        className="w-full bg-slate-50 text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && fetchLedger()}
                      />
                      <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Enter the card ID to view all associated transactions
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={fetchLedger} 
                        disabled={loading} 
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                          </>
                        ) : (
                          <>
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            Search Ledger
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {searched && (
                <div className="mt-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Transactions</p>
                      <p className="text-2xl font-bold text-slate-900">{ledger.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Credit Transactions</p>
                      <p className="text-2xl font-bold text-emerald-600">{ledger.filter(t => parseFloat(t.amount_delta) > 0).length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Debit Transactions</p>
                      <p className="text-2xl font-bold text-rose-600">{ledger.filter(t => parseFloat(t.amount_delta) < 0).length}</p>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-600 text-sm font-medium">
                            Transaction History
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs">
                          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {ledger.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No transactions found</p>
                        <p className="text-slate-400 text-sm mt-1">Try entering a different card ID</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Type</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {ledger.map((entry) => {
                                const { date, time } = formatDate(entry.created_at);
                                const typeStyle = getTransactionTypeStyle(entry.entry_type);
                                return (
                                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                      <div className="text-slate-900 text-sm font-medium">{date}</div>
                                      <div className="text-slate-400 text-xs mt-0.5">{time}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${typeStyle.bg} ${typeStyle.text}`}>
                                          {getTransactionIcon(entry.entry_type)}
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeStyle.bg} ${typeStyle.text} border ${typeStyle.border}`}>
                                          {typeStyle.label}
                                        </span>
                                      </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-semibold ${getAmountColor(entry.amount_delta)}`}>
                                      {getAmountPrefix(entry.amount_delta)}₹{Math.abs(parseFloat(entry.amount_delta)).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span className="text-slate-700 font-mono font-medium">₹{parseFloat(entry.balance_after).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="text-slate-500 text-sm">
                                        {entry.note || <span className="text-slate-300">—</span>}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
                          <div className="flex justify-between items-center text-sm">
                            <div className="text-slate-500">
                              Showing all {ledger.length} transactions
                            </div>
                            <div className="flex gap-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-slate-500 text-xs">Credit</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                <span className="text-slate-500 text-xs">Debit</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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

export default TransactionLedger;