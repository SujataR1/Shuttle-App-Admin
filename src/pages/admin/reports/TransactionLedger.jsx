import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  DocumentTextIcon, 
  CreditCardIcon, 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  TagIcon, 
  ChartBarIcon,
  ChevronDownIcon,
  UserIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const TransactionLedger = () => {
  const [cardId, setCardId] = useState("");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Dropdown states for card selection
  const [cards, setCards] = useState([]);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCardInfo, setSelectedCardInfo] = useState("");

  // Check device type and get sidebar state from localStorage
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Get sidebar state from localStorage (set by Sidebar component)
    const savedSidebarState = localStorage.getItem("sidebarOpen");
    if (savedSidebarState !== null) {
      setSidebarOpen(savedSidebarState === "true");
    }
    
    // Listen for sidebar state changes
    const handleStorageChange = () => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for sidebar state changes (since Sidebar doesn't dispatch storage events)
    const interval = setInterval(() => {
      const savedState = localStorage.getItem("sidebarOpen");
      if (savedState !== null) {
        setSidebarOpen(savedState === "true");
      }
    }, 100);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate sidebar width based on state (matches your Sidebar component)
  const getSidebarWidth = () => {
    if (isMobile) return 0; // Mobile sidebar overlays
    return sidebarOpen ? 288 : 96; // w-72 = 288px, lg:w-24 = 96px
  };

  const sidebarWidth = getSidebarWidth();

  // Fetch all cards with pagination
  const fetchAllCards = async () => {
    setLoadingCards(true);
    try {
      const token = localStorage.getItem("access_token");
      let allCards = [];
      let currentPage = 1;
      let hasMore = true;
      
      // Fetch all pages to get complete list of cards
      while (hasMore) {
        const response = await axios.get(`${API_BASE}/admin/rfid/cards`, {
          params: { page: currentPage, page_size: 100 },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const items = response.data.items || [];
        allCards = [...allCards, ...items];
        hasMore = items.length === 100;
        currentPage++;
      }
      
      // Fetch additional details for each card to get passenger names
      const enhancedCards = [];
      for (const card of allCards) {
        try {
          const detailResponse = await axios.get(`${API_BASE}/admin/rfid/cards/${card.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          enhancedCards.push({
            id: card.id,
            card_uid_masked: card.card_uid_masked || detailResponse.data.card?.card_uid_masked,
            assigned_passenger_name: detailResponse.data.current_assignment?.passenger_user_id || 'Unassigned',
            inventory_status: card.inventory_status || detailResponse.data.card?.inventory_status,
            balance: detailResponse.data.account?.current_balance || '0'
          });
        } catch (err) {
          // If can't fetch details, still add the card with basic info
          enhancedCards.push({
            id: card.id,
            card_uid_masked: card.card_uid_masked || '****',
            assigned_passenger_name: 'Unknown',
            inventory_status: card.inventory_status || 'unknown',
            balance: '0'
          });
        }
      }
      
      setCards(enhancedCards);
      console.log("Loaded cards:", enhancedCards.length);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Failed to load cards list");
    } finally {
      setLoadingCards(false);
    }
  };

  // Fetch ledger for selected card
  const fetchLedger = async (cardIdValue = cardId) => {
    if (!cardIdValue) {
      toast.error("Please select a Card");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardIdValue}/ledger?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLedger(response.data.items || []);
      setSearched(true);
      toast.success(`Found ${response.data.items?.length || 0} transactions`);
    } catch (error) {
      console.error("Error fetching ledger:", error);
      toast.error("Failed to fetch ledger");
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all cards on mount
  useEffect(() => {
    fetchAllCards();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCardDropdown && !event.target.closest('.card-dropdown')) {
        setShowCardDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCardDropdown]);

  // Filter cards based on search
  const filteredCards = cards.filter(card =>
    card.card_uid_masked?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.assigned_passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardSelect = (card) => {
    setCardId(card.id);
    setSelectedCardInfo(`Card: ${card.card_uid_masked} | Passenger: ${card.assigned_passenger_name} | Balance: ₹${parseFloat(card.balance).toFixed(2)}`);
    setShowCardDropdown(false);
    setSearchTerm("");
    fetchLedger(card.id);
  };

  const handleSearch = () => {
    if (cardId) {
      fetchLedger();
    } else {
      toast.error("Please select a card");
    }
  };

  const getTransactionIcon = (type) => {
    if (type?.includes('recharge')) return <CreditCardIcon className="w-3.5 h-3.5" />;
    if (type?.includes('sweep')) return <ArrowPathIcon className="w-3.5 h-3.5" />;
    if (type?.includes('fare')) return <BanknotesIcon className="w-3.5 h-3.5" />;
    return <DocumentTextIcon className="w-3.5 h-3.5" />;
  };

  const getTransactionTypeStyle = (type) => {
    if (type?.includes('recharge')) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", label: "Recharge" };
    if (type?.includes('sweep')) return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", label: "Sweep" };
    if (type?.includes('fare_debit')) return { bg: "bg-red-50", text: "text-red-700", border: "border-red-100", label: "Fare Debit" };
    if (type?.includes('fare_hold')) return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", label: "Fare Hold" };
    if (type?.includes('hold_release')) return { bg: "bg-green-50", text: "text-green-700", border: "border-green-100", label: "Hold Release" };
    if (type?.includes('fare_reversal_credit')) return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", label: "Fare Reversal" };
    return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-100", label: type || "Transaction" };
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
    if (value < 0) return "-";
    return "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch {
      return { date: "Invalid", time: "Invalid" };
    }
  };

  const totalCredit = ledger.filter(t => parseFloat(t.amount_delta) > 0).reduce((sum, t) => sum + parseFloat(t.amount_delta), 0);
  const totalDebit = ledger.filter(t => parseFloat(t.amount_delta) < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount_delta)), 0);
  const currentBalance = ledger.length > 0 ? parseFloat(ledger[0]?.balance_after || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <TopNavbar />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                  <DocumentTextIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Transaction Ledger</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Complete transaction history for RFID cards</p>
                </div>
              </div>
            </div>
            
            {/* Search Section with Dropdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1 relative card-dropdown">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4 text-gray-400" />
                    Select RFID Card
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowCardDropdown(!showCardDropdown)}
                      className="flex items-center justify-between w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-400 transition-all duration-200"
                    >
                      <span className={selectedCardInfo ? "text-gray-900" : "text-gray-400"}>
                        {selectedCardInfo || "Choose a card..."}
                      </span>
                      <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showCardDropdown ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {showCardDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                        <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search by Card UID or Passenger Name..."
                              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {loadingCards ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-3">Loading cards...</p>
                          </div>
                        ) : filteredCards.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            No cards found
                          </div>
                        ) : (
                          filteredCards.map((card) => (
                            <div
                              key={card.id}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-150"
                              onClick={() => handleCardSelect(card)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <CreditCardIcon className="w-4 h-4 text-gray-400" />
                                  <span className="font-mono text-sm font-semibold text-gray-900">
                                    {card.card_uid_masked}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  card.inventory_status === 'assigned' 
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {card.inventory_status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <UserIcon className="w-3 h-3" />
                                <span>Passenger: {card.assigned_passenger_name === 'Unassigned' ? 'Not Assigned' : card.assigned_passenger_name}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-emerald-600">
                                  Balance: ₹{parseFloat(card.balance).toFixed(2)}
                                </span>
                                <span className="text-gray-400 font-mono text-xs">
                                  ID: {card.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    💡 Click to select a card - shows masked UID and passenger name for easy identification
                  </p>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleSearch} 
                    disabled={loading || !cardId} 
                    className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-2.5 rounded-xl font-medium hover:from-gray-900 hover:to-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
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
                        View Transactions
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
                        <p className="text-gray-500 text-sm font-medium">Total Transactions</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{ledger.length}</p>
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
                        <p className="text-gray-300 text-sm font-medium">Current Balance</p>
                        <p className="text-3xl font-bold text-white mt-1">₹{currentBalance.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-gray-700 text-sm font-medium">Transaction History</span>
                      </div>
                      <span className="text-gray-400 text-xs">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {ledger.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No transactions found</p>
                      <p className="text-gray-400 text-sm mt-1">This card has no transaction history</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Type</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {ledger.map((entry) => {
                              const { date, time } = formatDate(entry.created_at);
                              const typeStyle = getTransactionTypeStyle(entry.entry_type);
                              return (
                                <tr key={entry.id} className="hover:bg-gray-50 transition-all duration-200">
                                  <td className="px-6 py-4">
                                    <div className="text-gray-900 text-sm font-medium">{date}</div>
                                    <div className="text-gray-400 text-xs mt-0.5">{time}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-lg ${typeStyle.bg} border ${typeStyle.border}`}>
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
                                    <span className="text-gray-900 font-mono font-medium">₹{parseFloat(entry.balance_after).toFixed(2)}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-gray-500 text-sm">
                                      {entry.note || <span className="text-gray-300">—</span>}
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
                          <div className="text-gray-500">Showing all {ledger.length} transactions</div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-gray-500 text-xs">Credit</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                              <span className="text-gray-500 text-xs">Debit</span>
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

export default TransactionLedger;