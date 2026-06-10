// import Sidebar from '../../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../../assets/components/navbar/TopNavbar';
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { 
//   CreditCardIcon, 
//   MagnifyingGlassIcon, 
//   BanknotesIcon, 
//   UserCircleIcon, 
//   ChartBarIcon,
//   ChevronDownIcon,
//   UserIcon,
//   CalendarIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   WalletIcon,
//   TagIcon,
//   ShieldCheckIcon,
//   IdentificationIcon,
//   ArrowTrendingUpIcon
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const RechargeHistory = () => {
//   const [selectedCard, setSelectedCard] = useState(null);
//   const [recharges, setRecharges] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searched, setSearched] = useState(false);
  
//   const [cards, setCards] = useState([]);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [loadingCards, setLoadingCards] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const fetchAllCards = async () => {
//     setLoadingCards(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       let allCards = [];
//       let currentPage = 1;
//       let hasMore = true;
      
//       while (hasMore) {
//         const response = await axios.get(`${API_BASE}/admin/rfid/cards`, {
//           params: { page: currentPage, page_size: 100 },
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         const items = response.data.items || [];
//         allCards = [...allCards, ...items];
//         hasMore = items.length === 100;
//         currentPage++;
//       }
      
//       const enhancedCards = [];
//       for (const card of allCards) {
//         try {
//           const detailResponse = await axios.get(`${API_BASE}/admin/rfid/cards/${card.id}`, {
//             headers: { Authorization: `Bearer ${token}` }
//           });
          
//           const cardData = detailResponse.data.card;
//           const accountData = detailResponse.data.account;
//           const assignmentData = detailResponse.data.current_assignment;
          
//           enhancedCards.push({
//             id: card.id,
//             uid: cardData?.card_uid_masked || card.card_uid_masked || '****',
//             inventoryStatus: cardData?.inventory_status || card.inventory_status || 'unknown',
//             authStatus: cardData?.authorization_status || 'unknown',
//             passengerId: assignmentData?.passenger_user_id || 'Not Assigned',
//             balance: accountData?.current_balance || '0',
//             heldBalance: accountData?.held_balance || '0',
//             availableBalance: accountData?.available_balance || '0',
//             createdAt: cardData?.created_at,
//             notes: cardData?.notes
//           });
//         } catch (err) {
//           enhancedCards.push({
//             id: card.id,
//             uid: card.card_uid_masked || '****',
//             inventoryStatus: card.inventory_status || 'unknown',
//             authStatus: 'unknown',
//             passengerId: 'Unknown',
//             balance: '0',
//             heldBalance: '0',
//             availableBalance: '0'
//           });
//         }
//       }
      
//       setCards(enhancedCards);
//     } catch (error) {
//       console.error("Error fetching cards:", error);
//       toast.error("Failed to load cards");
//     } finally {
//       setLoadingCards(false);
//     }
//   };

//   const fetchRecharges = async () => {
//     if (!selectedCard) {
//       toast.error("Please select a card");
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.get(
//         `${API_BASE}/admin/rfid/cards/${selectedCard.id}/recharges?page=1&page_size=100`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setRecharges(response.data.items || []);
//       setSearched(true);
//       toast.success(`Found ${response.data.items?.length || 0} recharge records`);
//     } catch (error) {
//       toast.error("Failed to fetch recharge history");
//       setRecharges([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewRecharges = () => {
//     if (selectedCard) {
//       fetchRecharges();
//     } else {
//       toast.error("Please select a card first");
//     }
//   };

//   useEffect(() => {
//     fetchAllCards();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showDropdown && !event.target.closest('.card-dropdown')) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showDropdown]);

//   const filteredCards = cards.filter(card =>
//     card.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     card.passengerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     card.id?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleCardSelect = (card) => {
//     setSelectedCard(card);
//     setShowDropdown(false);
//     setSearchTerm("");
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch {
//       return "Invalid Date";
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusMap = {
//       'assigned': { color: 'bg-blue-50 text-blue-600', icon: CheckCircleIcon, label: 'Assigned' },
//       'available': { color: 'bg-emerald-50 text-emerald-600', icon: CheckCircleIcon, label: 'Available' },
//       'returned': { color: 'bg-amber-50 text-amber-600', icon: ClockIcon, label: 'Returned' },
//       'decommissioned': { color: 'bg-red-50 text-red-600', icon: XCircleIcon, label: 'Decommissioned' }
//     };
//     const config = statusMap[status] || { color: 'bg-gray-100 text-gray-500', icon: ClockIcon, label: status };
//     const Icon = config.icon;
//     return (
//       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${config.color}`}>
//         <Icon className="w-3 h-3" />
//         {config.label}
//       </span>
//     );
//   };

//   const getAuthBadge = (status) => {
//     if (status === 'allowed') {
//       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-600"><ShieldCheckIcon className="w-3 h-3" />Allowed</span>;
//     }
//     return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-red-50 text-red-600"><XCircleIcon className="w-3 h-3" />Blocked</span>;
//   };

//   const getSourceIcon = (source) => {
//     if (source === 'admin_manual') return <UserCircleIcon className="w-3.5 h-3.5" />;
//     return <BanknotesIcon className="w-3.5 h-3.5" />;
//   };

//   const getSourceLabel = (source) => {
//     if (source === 'admin_manual') return 'Admin';
//     if (source === 'razorpay_user_recharge') return 'Razorpay';
//     return source || 'Unknown';
//   };

//   const getSourceStyle = (source) => {
//     if (source === 'admin_manual') return { bg: "bg-purple-50", text: "text-purple-600" };
//     return { bg: "bg-blue-50", text: "text-blue-600" };
//   };

//   const getStatusStyle = (status) => {
//     if (status === 'credited') return { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" };
//     if (status === 'pending') return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" };
//     if (status === 'failed') return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
//     return { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" };
//   };

//   const totalAmount = recharges.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
//   const averageAmount = recharges.length > 0 ? totalAmount / recharges.length : 0;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar />
      
//       <div className="lg:ml-64">
//         <TopNavbar />
        
//         <main className="px-6 py-6">
//           <div className="max-w-7xl mx-auto">
//             {/* Header */}
//             <div className="mb-6">
//               <h1 className="text-xl font-medium text-gray-900">Recharge History</h1>
//               <p className="text-sm text-gray-500 mt-0.5">View and manage card recharge transactions</p>
//             </div>
            
//             {/* Card Selection */}
//             <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 <div className="relative card-dropdown">
//                   <label className="block text-xs font-medium text-gray-600 mb-1.5">
//                     Select Card
//                   </label>
                  
//                   <div
//                     onClick={() => setShowDropdown(!showDropdown)}
//                     className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:border-gray-400 transition-colors"
//                   >
//                     {selectedCard ? (
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className="font-mono text-sm text-gray-900">{selectedCard.uid}</span>
//                           {getStatusBadge(selectedCard.inventoryStatus)}
//                           {getAuthBadge(selectedCard.authStatus)}
//                         </div>
//                         <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
//                           <span className="flex items-center gap-1">
//                             <UserIcon className="w-3 h-3" />
//                             {selectedCard.passengerId === 'Not Assigned' ? 'Unassigned' : selectedCard.passengerId?.slice(0, 12) + '...'}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <WalletIcon className="w-3 h-3" />
//                             ₹{parseFloat(selectedCard.balance).toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                     ) : (
//                       <span className="text-sm text-gray-400">Choose a card...</span>
//                     )}
//                     <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
//                   </div>
                  
//                   {showDropdown && (
//                     <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
//                       <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
//                         <div className="relative">
//                           <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
//                           <input
//                             type="text"
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             placeholder="Search card..."
//                             className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         </div>
//                       </div>
                      
//                       {loadingCards ? (
//                         <div className="p-6 text-center">
//                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mx-auto"></div>
//                           <p className="text-xs text-gray-500 mt-2">Loading...</p>
//                         </div>
//                       ) : filteredCards.length === 0 ? (
//                         <div className="p-6 text-center text-sm text-gray-500">No cards found</div>
//                       ) : (
//                         filteredCards.map((card) => (
//                           <div
//                             key={card.id}
//                             className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
//                             onClick={() => handleCardSelect(card)}
//                           >
//                             <div className="flex items-center justify-between mb-1">
//                               <span className="font-mono text-sm font-medium text-gray-900">{card.uid}</span>
//                               <div className="flex gap-1">
//                                 {getStatusBadge(card.inventoryStatus)}
//                                 {getAuthBadge(card.authStatus)}
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
//                               <span className="flex items-center gap-1">
//                                 <UserIcon className="w-3 h-3" />
//                                 {card.passengerId === 'Not Assigned' ? 'Unassigned' : card.passengerId?.slice(0, 12)}
//                               </span>
//                               <span className="flex items-center gap-1">
//                                 <WalletIcon className="w-3 h-3" />
//                                 ₹{parseFloat(card.balance).toFixed(2)}
//                               </span>
//                             </div>
//                             <div className="flex justify-between text-xs text-gray-400">
//                               <span>Available: ₹{parseFloat(card.availableBalance).toFixed(2)}</span>
//                               <span>Held: ₹{parseFloat(card.heldBalance).toFixed(2)}</span>
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex items-end">
//                   <button
//                     onClick={handleViewRecharges}
//                     disabled={!selectedCard || loading}
//                     className="w-full bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                   >
//                     {loading ? (
//                       <>
//                         <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Loading...
//                       </>
//                     ) : (
//                       <>
//                         <ArrowTrendingUpIcon className="w-4 h-4" />
//                         View History
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Selected Card Summary */}
//             {selectedCard && (
//               <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
//                 <div className="flex flex-wrap justify-between items-center gap-3">
//                   <div className="flex items-center gap-4">
//                     <div>
//                       <p className="text-xs text-gray-500">Card</p>
//                       <p className="font-mono text-sm font-medium text-gray-900">{selectedCard.uid}</p>
//                     </div>
//                     <div className="w-px h-8 bg-gray-200"></div>
//                     <div>
//                       <p className="text-xs text-gray-500">Passenger</p>
//                       <p className="text-sm text-gray-900">{selectedCard.passengerId === 'Not Assigned' ? 'Unassigned' : selectedCard.passengerId}</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-xs text-gray-500">Balance</p>
//                     <p className="text-lg font-semibold text-emerald-600">₹{parseFloat(selectedCard.balance).toFixed(2)}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Results */}
//             {searched && (
//               <div>
//                 {/* Stats */}
//                 <div className="grid grid-cols-4 gap-4 mb-6">
//                   <div className="bg-white rounded-lg border border-gray-200 p-4">
//                     <p className="text-2xl font-semibold text-gray-900">{recharges.length}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">Total Recharges</p>
//                   </div>
//                   <div className="bg-white rounded-lg border border-gray-200 p-4">
//                     <p className="text-2xl font-semibold text-emerald-600">₹{totalAmount.toFixed(2)}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">Total Amount</p>
//                   </div>
//                   <div className="bg-white rounded-lg border border-gray-200 p-4">
//                     <p className="text-2xl font-semibold text-gray-900">₹{averageAmount.toFixed(2)}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">Average</p>
//                   </div>
//                   <div className="bg-white rounded-lg border border-gray-200 p-4">
//                     <p className="text-2xl font-semibold text-emerald-600">
//                       {recharges.length > 0 
//                         ? ((recharges.filter(r => r.status === 'credited').length / recharges.length) * 100).toFixed(0)
//                         : '0'}%
//                     </p>
//                     <p className="text-xs text-gray-500 mt-0.5">Success Rate</p>
//                   </div>
//                 </div>

//                 {/* Transactions Table */}
//                 <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                   <div className="px-4 py-3 border-b border-gray-200">
//                     <span className="text-sm font-medium text-gray-900">Transaction History</span>
//                   </div>

//                   {recharges.length === 0 ? (
//                     <div className="text-center py-12">
//                       <CreditCardIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                       <p className="text-sm text-gray-500">No recharge records found</p>
//                     </div>
//                   ) : (
//                     <div className="overflow-x-auto">
//                       <table className="w-full text-sm">
//                         <thead>
//                           <tr className="border-b border-gray-200 bg-gray-50">
//                             <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Date & Time</th>
//                             <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Amount</th>
//                             <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Source</th>
//                             <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Status</th>
//                             <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Verified By</th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                           {recharges.map((recharge) => {
//                             const { date, time } = formatDate(recharge.created_at);
//                             const sourceStyle = getSourceStyle(recharge.source_type);
//                             const statusStyle = getStatusStyle(recharge.status);
//                             return (
//                               <tr key={recharge.id} className="hover:bg-gray-50">
//                                 <td className="px-4 py-2.5">
//                                   <div className="text-xs text-gray-900">{date}</div>
//                                   <div className="text-xs text-gray-400">{time}</div>
//                                  </td>
//                                 <td className="px-4 py-2.5 text-right">
//                                   <span className="text-sm font-medium text-emerald-600">+₹{parseFloat(recharge.amount).toFixed(2)}</span>
//                                  </td>
//                                 <td className="px-4 py-2.5">
//                                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${sourceStyle.bg} ${sourceStyle.text}`}>
//                                     {getSourceIcon(recharge.source_type)}
//                                     {getSourceLabel(recharge.source_type)}
//                                   </span>
//                                  </td>
//                                 <td className="px-4 py-2.5">
//                                   <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs ${statusStyle.bg} ${statusStyle.text}`}>
//                                     <span className={`w-1.5 h-1.5 ${statusStyle.dot} rounded-full`}></span>
//                                     {recharge.status}
//                                   </span>
//                                  </td>
//                                 <td className="px-4 py-2.5 text-xs text-gray-600">
//                                   {recharge.verified_by_admin_id ? recharge.verified_by_admin_id.slice(0, 12) + '...' : 'System'}
//                                  </td>
//                                </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Empty State */}
//             {!searched && (
//               <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
//                 <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                 <p className="text-sm text-gray-500">Select a card to view recharge history</p>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RechargeHistory;
import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  CreditCardIcon, 
  MagnifyingGlassIcon, 
  BanknotesIcon, 
  UserCircleIcon, 
  ChartBarIcon,
  ChevronDownIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  WalletIcon,
  TagIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const RechargeHistory = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [cards, setCards] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    
    // Poll for sidebar state changes
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
    if (isMobile) return 0;
    return sidebarOpen ? 288 : 96;
  };

  const sidebarWidth = getSidebarWidth();

  const fetchAllCards = async () => {
    setLoadingCards(true);
    try {
      const token = localStorage.getItem("access_token");
      let allCards = [];
      let currentPage = 1;
      let hasMore = true;
      
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
      
      const enhancedCards = [];
      for (const card of allCards) {
        try {
          const detailResponse = await axios.get(`${API_BASE}/admin/rfid/cards/${card.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const cardData = detailResponse.data.card;
          const accountData = detailResponse.data.account;
          const assignmentData = detailResponse.data.current_assignment;
          
          enhancedCards.push({
            id: card.id,
            uid: cardData?.card_uid_masked || card.card_uid_masked || '****',
            inventoryStatus: cardData?.inventory_status || card.inventory_status || 'unknown',
            authStatus: cardData?.authorization_status || 'unknown',
            passengerId: assignmentData?.passenger_user_id || 'Not Assigned',
            balance: accountData?.current_balance || '0',
            heldBalance: accountData?.held_balance || '0',
            availableBalance: accountData?.available_balance || '0',
            createdAt: cardData?.created_at,
            notes: cardData?.notes
          });
        } catch (err) {
          enhancedCards.push({
            id: card.id,
            uid: card.card_uid_masked || '****',
            inventoryStatus: card.inventory_status || 'unknown',
            authStatus: 'unknown',
            passengerId: 'Unknown',
            balance: '0',
            heldBalance: '0',
            availableBalance: '0'
          });
        }
      }
      
      setCards(enhancedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast.error("Failed to load cards");
    } finally {
      setLoadingCards(false);
    }
  };

  const fetchRecharges = async () => {
    if (!selectedCard) {
      toast.error("Please select a card");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${selectedCard.id}/recharges?page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecharges(response.data.items || []);
      setSearched(true);
      toast.success(`Found ${response.data.items?.length || 0} recharge records`);
    } catch (error) {
      toast.error("Failed to fetch recharge history");
      setRecharges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecharges = () => {
    if (selectedCard) {
      fetchRecharges();
    } else {
      toast.error("Please select a card first");
    }
  };

  useEffect(() => {
    fetchAllCards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.card-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const filteredCards = cards.filter(card =>
    card.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.passengerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: "Invalid", time: "Invalid" };
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'assigned': { color: 'bg-blue-50 text-blue-600', icon: CheckCircleIcon, label: 'Assigned' },
      'available': { color: 'bg-emerald-50 text-emerald-600', icon: CheckCircleIcon, label: 'Available' },
      'returned': { color: 'bg-amber-50 text-amber-600', icon: ClockIcon, label: 'Returned' },
      'decommissioned': { color: 'bg-red-50 text-red-600', icon: XCircleIcon, label: 'Decommissioned' }
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-500', icon: ClockIcon, label: status };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getAuthBadge = (status) => {
    if (status === 'allowed') {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-600"><ShieldCheckIcon className="w-3 h-3" />Allowed</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-red-50 text-red-600"><XCircleIcon className="w-3 h-3" />Blocked</span>;
  };

  const getSourceIcon = (source) => {
    if (source === 'admin_manual') return <UserCircleIcon className="w-3.5 h-3.5" />;
    return <BanknotesIcon className="w-3.5 h-3.5" />;
  };

  const getSourceLabel = (source) => {
    if (source === 'admin_manual') return 'Admin';
    if (source === 'razorpay_user_recharge') return 'Razorpay';
    return source || 'Unknown';
  };

  const getSourceStyle = (source) => {
    if (source === 'admin_manual') return { bg: "bg-purple-50", text: "text-purple-600" };
    return { bg: "bg-blue-50", text: "text-blue-600" };
  };

  const getStatusStyle = (status) => {
    if (status === 'credited') return { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" };
    if (status === 'pending') return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" };
    if (status === 'failed') return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
    return { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" };
  };

  const totalAmount = recharges.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const averageAmount = recharges.length > 0 ? totalAmount / recharges.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} isMobile={isMobile} />
      
      {/* Main Content - Dynamic margin based on sidebar state */}
      <div 
        className="transition-all duration-300 ease-out"
        style={{
          marginLeft: !isMobile ? `${sidebarWidth}px` : '0px',
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%'
        }}
      >
        <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} sidebarOpen={sidebarOpen} />
        
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl font-medium text-gray-900">Recharge History</h1>
              <p className="text-sm text-gray-500 mt-0.5">View and manage card recharge transactions</p>
            </div>
            
            {/* Card Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative card-dropdown">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Select Card
                  </label>
                  
                  <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {selectedCard ? (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-gray-900">{selectedCard.uid}</span>
                          {getStatusBadge(selectedCard.inventoryStatus)}
                          {getAuthBadge(selectedCard.authStatus)}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {selectedCard.passengerId === 'Not Assigned' ? 'Unassigned' : selectedCard.passengerId?.slice(0, 12) + '...'}
                          </span>
                          <span className="flex items-center gap-1">
                            <WalletIcon className="w-3 h-3" />
                            ₹{parseFloat(selectedCard.balance).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Choose a card...</span>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search card..."
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      
                      {loadingCards ? (
                        <div className="p-6 text-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mx-auto"></div>
                          <p className="text-xs text-gray-500 mt-2">Loading...</p>
                        </div>
                      ) : filteredCards.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">No cards found</div>
                      ) : (
                        filteredCards.map((card) => (
                          <div
                            key={card.id}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                            onClick={() => handleCardSelect(card)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-sm font-medium text-gray-900">{card.uid}</span>
                              <div className="flex gap-1">
                                {getStatusBadge(card.inventoryStatus)}
                                {getAuthBadge(card.authStatus)}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {card.passengerId === 'Not Assigned' ? 'Unassigned' : card.passengerId?.slice(0, 12)}
                              </span>
                              <span className="flex items-center gap-1">
                                <WalletIcon className="w-3 h-3" />
                                ₹{parseFloat(card.balance).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Available: ₹{parseFloat(card.availableBalance).toFixed(2)}</span>
                              <span>Held: ₹{parseFloat(card.heldBalance).toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleViewRecharges}
                    disabled={!selectedCard || loading}
                    className="w-full bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        View History
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Card Summary */}
            {selectedCard && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Card</p>
                      <p className="font-mono text-sm font-medium text-gray-900">{selectedCard.uid}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-xs text-gray-500">Passenger</p>
                      <p className="text-sm text-gray-900">{selectedCard.passengerId === 'Not Assigned' ? 'Unassigned' : selectedCard.passengerId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-lg font-semibold text-emerald-600">₹{parseFloat(selectedCard.balance).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {searched && (
              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-2xl font-semibold text-gray-900">{recharges.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Recharges</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-2xl font-semibold text-emerald-600">₹{totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Amount</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-2xl font-semibold text-gray-900">₹{averageAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Average</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-2xl font-semibold text-emerald-600">
                      {recharges.length > 0 
                        ? ((recharges.filter(r => r.status === 'credited').length / recharges.length) * 100).toFixed(0)
                        : '0'}%
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Success Rate</p>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-900">Transaction History</span>
                  </div>

                  {recharges.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCardIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No recharge records found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Date & Time</th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Amount</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Source</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Verified By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {recharges.map((recharge) => {
                            const { date, time } = formatDate(recharge.created_at);
                            const sourceStyle = getSourceStyle(recharge.source_type);
                            const statusStyle = getStatusStyle(recharge.status);
                            return (
                              <tr key={recharge.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5">
                                  <div className="text-xs text-gray-900">{date}</div>
                                  <div className="text-xs text-gray-400">{time}</div>
                                 </td>
                                <td className="px-4 py-2.5 text-right">
                                  <span className="text-sm font-medium text-emerald-600">+₹{parseFloat(recharge.amount).toFixed(2)}</span>
                                 </td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${sourceStyle.bg} ${sourceStyle.text}`}>
                                    {getSourceIcon(recharge.source_type)}
                                    {getSourceLabel(recharge.source_type)}
                                  </span>
                                 </td>
                                <td className="px-4 py-2.5">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs ${statusStyle.bg} ${statusStyle.text}`}>
                                    <span className={`w-1.5 h-1.5 ${statusStyle.dot} rounded-full`}></span>
                                    {recharge.status}
                                  </span>
                                 </td>
                                <td className="px-4 py-2.5 text-xs text-gray-600">
                                  {recharge.verified_by_admin_id ? recharge.verified_by_admin_id.slice(0, 12) + '...' : 'System'}
                                 </td>
                               </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!searched && (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <CreditCardIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a card to view recharge history</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RechargeHistory;