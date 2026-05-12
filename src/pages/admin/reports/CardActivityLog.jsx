import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentTextIcon, MagnifyingGlassIcon, TagIcon, ArrowPathIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: <CreditCardIcon className="w-3.5 h-3.5" />, label: "Recharge" };
    }
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: <ArrowPathIcon className="w-3.5 h-3.5" />, label: "Transaction" };
  };

  const getTransactionTypeStyle = (type) => {
    if (type?.includes('recharge')) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" };
    if (type?.includes('sweep')) return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" };
    if (type?.includes('return')) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" };
    if (type?.includes('debit')) return { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" };
    return { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
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

  const totalCredit = activities
    .filter(a => parseFloat(a.amount_delta || a.amount) > 0)
    .reduce((sum, a) => sum + parseFloat(a.amount_delta || a.amount), 0);
  
  const totalDebit = activities
    .filter(a => parseFloat(a.amount_delta || a.amount) < 0)
    .reduce((sum, a) => sum + Math.abs(parseFloat(a.amount_delta || a.amount)), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopNavbar />
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Card Activity Log</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Complete transaction and recharge history</p>
                </div>
              </div>
            </div>
            
            {/* Search Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-gray-400" />
                    Card Identifier
                  </label>
                  <input
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="Enter RFID card ID"
                    className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && fetchActivity()}
                  />
                  <p className="text-gray-400 text-xs mt-2">View all activities including transactions and recharges</p>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={fetchActivity} 
                    disabled={loading} 
                    className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-2.5 rounded-xl font-medium hover:from-gray-900 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md"
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

            {/* Results Section */}
            {searched && (
              <div>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Total Activities</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{activities.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <ChartBarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Total Credit</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-1">+₹{totalCredit.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <CreditCardIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">Total Debit</p>
                        <p className="text-3xl font-bold text-rose-600 mt-1">-₹{totalDebit.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                        <ArrowPathIcon className="w-6 h-6 text-rose-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm font-medium">Net Balance</p>
                        <p className="text-3xl font-bold text-white mt-1">₹{(totalCredit - totalDebit).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-700 text-sm font-medium">Activity Timeline</span>
                      </div>
                      <span className="text-gray-400 text-xs">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {activities.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No activity found</p>
                      <p className="text-gray-400 text-sm mt-1">Try entering a different card ID</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {activities.map((activity, idx) => {
                              const { date, time } = formatDate(activity.created_at);
                              const activityStyle = getActivityTypeStyle(activity.activity_type);
                              const transactionStyle = getTransactionTypeStyle(activity.entry_type);
                              const amount = activity.amount_delta || activity.amount;
                              
                              return (
                                <tr key={idx} className="hover:bg-gray-50 transition-all duration-200">
                                  <td className="px-6 py-4">
                                    <div className="text-gray-900 text-sm font-medium">{date}</div>
                                    <div className="text-gray-400 text-xs mt-0.5">{time}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-lg ${activityStyle.bg} border ${activityStyle.border}`}>
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
                                    <span className="text-gray-900 font-mono font-medium">
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
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-500">Showing all {activities.length} activities</div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-gray-500 text-xs">Credit</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                              <span className="text-gray-500 text-xs">Debit</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-gray-500 text-xs">Recharge</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-gray-500 text-xs">Transaction</span>
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
        </main>
      </div>
    </div>
  );
};

export default CardActivityLog;