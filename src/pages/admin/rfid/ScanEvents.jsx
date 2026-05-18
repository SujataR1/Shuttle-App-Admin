import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  QrCodeIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const ScanEvents = () => {
  const [cardId, setCardId] = useState("");
  const [loading, setLoading] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [error, setError] = useState(null);

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Note: Since there's no direct scan events endpoint
  
  const searchCardLedger = async () => {
    if (!cardId.trim()) {
      toast.error("Please enter a Card ID");
      return;
    }

    setLoading(true);
    setError(null);
    setLedgerEntries([]);

    try {
      const token = localStorage.getItem("access_token");
      // This is a placeholder - you'll need to replace with actual card ledger endpoint
      // For now, we'll show a message that this needs to be implemented
      toast.info("Card ledger endpoint coming soon. Use ride money details for now.");
      
      // Example of what you might call:
      // const response = await axios.get(
      //   `${API_BASE}/admin/rfid/cards/${cardId}/ledger`,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // setLedgerEntries(response.data.entries || []);
      
    } catch (error) {
      console.error("Error fetching card ledger:", error);
      const message = error.response?.data?.detail?.message || "Failed to fetch card transactions";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
                <h1 className="text-3xl font-bold text-gray-900">RFID Card Transactions</h1>
                <p className="text-gray-500 mt-1">View card transaction history and scan activity</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    For detailed scan event debugging, use the <strong>Ride History</strong> page with a known Ride ID, 
                    or check card transaction records in the Reports section.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Card ID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  placeholder="e.g., card_123456789"
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchCardLedger()}
                />
                <button
                  onClick={searchCardLedger}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter a Card ID to view its transaction history and scan events
              </p>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            {/* Help Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <QrCodeIcon className="w-5 h-5 text-gray-500" />
                How to Debug Scan Events
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. <strong>Find the Ride ID</strong> - Check payout transfers or transaction reports to get the Ride ID</p>
                <p>2. <strong>Use Ride History page</strong> - Enter the Ride ID to view complete ride and money details</p>
                <p>3. <strong>Check Card Activity Log</strong> - View card-specific transaction history in Reports section</p>
                <p>4. <strong>Review Ledger Entries</strong> - The money-detail endpoint shows all ledger entries related to the ride</p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono">
                  Tip: For operational debugging, start with a known Ride ID from payout screens or transaction reports,
                  then use the Ride History page to see complete details including scan acceptance/rejection.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScanEvents;