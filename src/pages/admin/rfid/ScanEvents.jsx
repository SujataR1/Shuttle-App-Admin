import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  QrCodeIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  ChevronDownIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ScanEvents = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardSearchQuery, setCardSearchQuery] = useState("");
  const [cardOptions, setCardOptions] = useState([]);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardDetails, setCardDetails] = useState(null);

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Fetch card options for dropdown
  const fetchCardOptions = async (search = "") => {
    setLoadingCards(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/card-options`,
        {
          params: {
            page: 1,
            page_size: 25,
            q: search || undefined
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const items = response.data.items || [];
      setCardOptions(items);
    } catch (error) {
      console.error("Error fetching card options:", error);
      toast.error("Failed to load card options");
    } finally {
      setLoadingCards(false);
    }
  };

  // Debounced search for cards
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (cardSearchQuery.length >= 2 || cardSearchQuery === "") {
        fetchCardOptions(cardSearchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [cardSearchQuery]);

  // Initial load of cards
  useEffect(() => {
    fetchCardOptions();
  }, []);

  // Fetch full card details when a card is selected
  const fetchCardDetails = async (cardId) => {
    setLoading(true);
    setError(null);
    setCardDetails(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/cards/${cardId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Store the complete response with nested structures
      setCardDetails(response.data);
      toast.success("Card details loaded successfully");
    } catch (error) {
      console.error("Error fetching card details:", error);
      const message = error.response?.data?.detail?.message || "Failed to fetch card details";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setCardSearchQuery("");
    setShowCardDropdown(false);
    fetchCardDetails(card.card_id);
  };

  const getCardDisplayText = (card) => {
    if (!card) return "Select a card...";
    if (card.assigned_passenger_name) {
      return `${card.card_uid_masked} — ${card.assigned_passenger_name}`;
    }
    return `${card.card_uid_masked} — Unassigned`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'assigned':
        return 'bg-blue-50 text-blue-700';
      case 'allowed':
        return 'bg-emerald-50 text-emerald-700';
      case 'blocked':
        return 'bg-red-50 text-red-700';
      case 'returned':
        return 'bg-gray-100 text-gray-600';
      case 'decommissioned':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getInventoryStatusColor = (status) => {
    switch(status) {
      case 'assigned':
        return 'bg-blue-50 text-blue-700';
      case 'available':
        return 'bg-emerald-50 text-emerald-700';
      case 'returned':
        return 'bg-amber-50 text-amber-700';
      case 'decommissioned':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <div className="lg:ml-64">
        <TopNavbar />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">RFID Card Management</h1>
                <p className="text-gray-500 mt-1">View card details, transactions, and scan activity</p>
              </div>
            </div>

            {/* Card Selection Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select RFID Card
              </label>
              <div className="relative">
                <div 
                  className="flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition"
                  onClick={() => setShowCardDropdown(!showCardDropdown)}
                >
                  <span className={`${!selectedCard ? 'text-gray-400' : 'text-gray-900'}`}>
                    {getCardDisplayText(selectedCard)}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${showCardDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                {showCardDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                      <input
                        type="text"
                        value={cardSearchQuery}
                        onChange={(e) => setCardSearchQuery(e.target.value)}
                        placeholder="Search by card UID or passenger name..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                        autoFocus
                      />
                    </div>
                    {loadingCards ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-xs text-gray-500 mt-2">Loading cards...</p>
                      </div>
                    ) : cardOptions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No cards found
                      </div>
                    ) : (
                      cardOptions.map((card) => (
                        <div
                          key={card.card_id}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                          onClick={() => handleCardSelect(card)}
                        >
                          <div className="text-sm font-mono text-gray-900">{card.card_uid_masked}</div>
                          <div className="text-xs text-gray-500">
                            {card.assigned_passenger_name || 'Unassigned'}
                            {card.assigned_passenger_user_id && ` (${card.assigned_passenger_user_id.slice(0, 8)}...)`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Search by masked card UID or passenger name to view card details and transaction history
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading card details...</p>
              </div>
            )}

            {/* Error Display */}
            {error && !loading && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Card Details Display */}
            {cardDetails && !loading && (
              <div className="space-y-6">
                {/* Card Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-900 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5" />
                      Card Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Card ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{cardDetails.card?.id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Masked UID</p>
                        <p className="text-sm font-mono text-gray-900">{cardDetails.card?.card_uid_masked || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Inventory Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getInventoryStatusColor(cardDetails.card?.inventory_status)}`}>
                          {cardDetails.card?.inventory_status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Authorization Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(cardDetails.card?.authorization_status)}`}>
                          {cardDetails.card?.authorization_status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Created At</p>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDateTime(cardDetails.card?.created_at)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDateTime(cardDetails.card?.updated_at)}</span>
                        </div>
                      </div>
                      {cardDetails.card?.notes && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                          <p className="text-sm text-gray-900">{cardDetails.card.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Balance Section */}
                {cardDetails.account && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Account Balance</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(cardDetails.account.current_balance)}</p>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Held Balance</p>
                            <p className="text-sm font-medium text-gray-700">{formatCurrency(cardDetails.account.held_balance)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Available Balance</p>
                            <p className="text-sm font-medium text-emerald-600">{formatCurrency(cardDetails.account.available_balance)}</p>
                          </div>
                        </div>
                      </div>
                      <CurrencyRupeeIcon className="w-12 h-12 text-blue-400 opacity-50" />
                    </div>
                  </div>
                )}

                {/* Current Assignment Section */}
                {cardDetails.current_assignment && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Current Assignment
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Passenger User ID</p>
                          <p className="text-sm font-mono text-gray-900">{cardDetails.current_assignment.passenger_user_id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Assigned At</p>
                          <p className="text-sm text-gray-900">{formatDateTime(cardDetails.current_assignment.assigned_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Assigned By Admin ID</p>
                          <p className="text-sm font-mono text-gray-900">{cardDetails.current_assignment.assigned_by_admin_id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Reason</p>
                          <p className="text-sm text-gray-900">{cardDetails.current_assignment.reason || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        For detailed transaction history and scan events, use the <strong>Ride History</strong> page with a Ride ID, 
                        or check transaction reports in the Reports section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!cardDetails && !loading && !error && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Card Selected</h3>
                <p className="text-gray-500">Select an RFID card above to view details</p>
              </div>
            )}

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">View Ride Details</h3>
                    <p className="text-sm text-gray-600 mb-4">If you have a Ride ID, check detailed money transactions</p>
                    <button
                      onClick={() => window.location.href = '/admin/rfid/ride-history'}
                      className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                    >
                      Go to Ride History →
                    </button>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transaction Reports</h3>
                    <p className="text-sm text-gray-600 mb-4">View comprehensive transaction ledger and reports</p>
                    <button
                      onClick={() => window.location.href = '/admin/rfid/transaction-ledger'}
                      className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      View Reports →
                    </button>
                  </div>
                  <CreditCardIcon className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScanEvents;