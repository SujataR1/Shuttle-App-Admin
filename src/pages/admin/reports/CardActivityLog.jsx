import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentTextIcon, MagnifyingGlassIcon, TagIcon, CalendarIcon, ArrowPathIcon, CreditCardIcon } from '@heroicons/react/24/outline';

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
      const [ledgerRes, rechargesRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/rfid/cards/${cardId}/ledger?page=1&page_size=50`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/admin/rfid/cards/${cardId}/recharges?page=1&page_size=50`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const combined = [
        ...ledgerRes.data.items.map(item => ({ ...item, activity_type: "ledger" })),
        ...rechargesRes.data.items.map(item => ({ ...item, activity_type: "recharge" }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setActivities(combined);
      setSearched(true);
      toast.success(`Found ${combined.length} activities`);
    } catch (error) {
      toast.error("Failed to fetch activity");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getActivityTypeStyle = (type) => {
    if (type === 'recharge') {
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CreditCardIcon className="w-3.5 h-3.5" />, label: "Recharge" };
    }
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <ArrowPathIcon className="w-3.5 h-3.5" />, label: "Transaction" };
  };

  const getTransactionTypeStyle = (type) => {
    if (type?.includes('recharge')) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    if (type?.includes('sweep')) return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    if (type?.includes('return')) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    if (type?.includes('debit')) return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
  };

  const getAmountColor = (amount) => {
    const value = parseFloat(amount);
    if (value > 0) return "text-emerald-600";
    if (value < 0) return "text-rose-600";
    return "text-slate-500";
  };

  const getAmountPrefix = (amount) => {
    const value = parseFloat(amount);
    if (value > 0) return "+";
    if (value < 0) return "";
    return "";
  };

  const totalCredit = activities
    .filter(a => parseFloat(a.amount_delta || a.amount) > 0)
    .reduce((sum, a) => sum + parseFloat(a.amount_delta || a.amount), 0);
  
  const totalDebit = activities
    .filter(a => parseFloat(a.amount_delta || a.amount) < 0)
    .reduce((sum, a) => sum + Math.abs(parseFloat(a.amount_delta || a.amount)), 0);

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
                    <h1 className="text-2xl font-semibold text-slate-900">Card Activity Log</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Complete transaction and recharge history</p>
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
                        onKeyPress={(e) => e.key === 'Enter' && fetchActivity()}
                      />
                      <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        View all activities including transactions and recharges
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={fetchActivity} 
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
                            View Activity
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
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Activities</p>
                      <p className="text-2xl font-bold text-slate-900">{activities.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Credit</p>
                      <p className="text-2xl font-bold text-emerald-600">+₹{totalCredit.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Debit</p>
                      <p className="text-2xl font-bold text-rose-600">-₹{totalDebit.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Activities Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                          <span className="text-slate-600 text-sm font-medium">
                            Activity Timeline
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs">
                          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {activities.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No activity found</p>
                        <p className="text-slate-400 text-sm mt-1">Try entering a different card ID</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-100">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {activities.map((activity, idx) => {
                                const { date, time } = formatDate(activity.created_at);
                                const activityStyle = getActivityTypeStyle(activity.activity_type);
                                const transactionStyle = getTransactionTypeStyle(activity.entry_type);
                                const amount = activity.amount_delta || activity.amount;
                                const isCredit = parseFloat(amount) > 0;
                                
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                      <div className="text-slate-900 text-sm font-medium">{date}</div>
                                      <div className="text-slate-400 text-xs mt-0.5">{time}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${activityStyle.bg} ${activityStyle.text}`}>
                                          {activityStyle.icon}
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${activityStyle.bg} ${activityStyle.text} border ${activityStyle.border}`}>
                                          {activityStyle.label}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${transactionStyle.bg} ${transactionStyle.text} border ${transactionStyle.border}`}>
                                        {activity.entry_type || activity.source_type}
                                      </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-semibold ${getAmountColor(amount)}`}>
                                      {getAmountPrefix(amount)}₹{Math.abs(parseFloat(amount)).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span className="text-slate-700 font-mono font-medium">
                                        ₹{parseFloat(activity.balance_after || 0).toFixed(2)}
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
                              Showing all {activities.length} activities
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
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <span className="text-slate-500 text-xs">Recharge</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-slate-500 text-xs">Transaction</span>
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

export default CardActivityLog;