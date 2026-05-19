import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  TruckIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RideHistory = () => {
  const [rideId, setRideId] = useState("");
  const [loading, setLoading] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const fetchRideMoneyDetails = async () => {
    if (!rideId.trim()) {
      toast.error("Please enter a Ride ID");
      return;
    }

    setLoading(true);
    setError(null);
    setRideDetails(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/rides/${rideId}/money-detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // The response structure might be nested, let's handle it safely
      const data = response.data;
      setRideDetails({
        ride: data.ride || data,
        ledger_entries: data.ledger_entries || data.entries || [],
        funding_allocations: data.funding_allocations || data.allocations || [],
        payout_transfers: data.payout_transfers || data.transfers || [],
        ledger_entry_count: data.ledger_entry_count || data.ledger_entries?.length || 0,
        funding_allocation_count: data.funding_allocation_count || data.funding_allocations?.length || 0,
        payout_transfer_count: data.payout_transfer_count || data.payout_transfers?.length || 0,
        payout_transfer_reversal_count: data.payout_transfer_reversal_count || 0
      });
      
      toast.success("Ride details loaded successfully");
    } catch (error) {
      console.error("Error fetching ride details:", error);
      const message = error.response?.data?.detail?.message || 
                      error.response?.data?.message || 
                      "Failed to fetch ride details. Please check the Ride ID.";
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
                <h1 className="text-3xl font-bold text-gray-900">RFID Ride Details</h1>
                <p className="text-gray-500 mt-1">View detailed ride information and money transactions</p>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter RFID Ride ID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={rideId}
                  onChange={(e) => setRideId(e.target.value)}
                  placeholder="e.g., ride_123456789"
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent font-mono text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && fetchRideMoneyDetails()}
                />
                <button
                  onClick={fetchRideMoneyDetails}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  )}
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter a valid RFID Ride ID to view complete ride and financial details
              </p>
            </div>

            {/* Error Display */}
            {error && (
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

            {/* Ride Details Display */}
            {rideDetails && rideDetails.ride && (
              <div className="space-y-6">
                {/* Ride Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-900 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" />
                      Ride Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ride ID</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{rideDetails.ride.id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                          rideDetails.ride.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : rideDetails.ride.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {rideDetails.ride.status?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(rideDetails.ride.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Started At</p>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDateTime(rideDetails.ride.started_at)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completed At</p>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDateTime(rideDetails.ride.completed_at)}</span>
                        </div>
                      </div>
                      {rideDetails.ride.card_id && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Card ID</p>
                          <p className="text-sm font-mono text-gray-900">{rideDetails.ride.card_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Ledger Entries</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{rideDetails.ledger_entry_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Funding Allocations</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{rideDetails.funding_allocation_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Payout Transfers</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">{rideDetails.payout_transfer_count || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Payout Reversals</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{rideDetails.payout_transfer_reversal_count || 0}</p>
                  </div>
                </div>

                {/* Ledger Entries Table */}
                {rideDetails.ledger_entries && rideDetails.ledger_entries.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5" />
                        Ledger Entries
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rideDetails.ledger_entries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm text-gray-900">{entry.type || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(entry.amount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{entry.description || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(entry.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Funding Allocations Table */}
                {rideDetails.funding_allocations && rideDetails.funding_allocations.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Funding Allocations</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rideDetails.funding_allocations.map((allocation, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(allocation.amount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{allocation.source || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(allocation.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payout Transfers Table */}
                {rideDetails.payout_transfers && rideDetails.payout_transfers.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Payout Transfers</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rideDetails.payout_transfers.map((transfer, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(transfer.amount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{transfer.recipient_id || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                                  transfer.status === 'completed' 
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : transfer.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {transfer.status?.toUpperCase() || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(transfer.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!rideDetails && !loading && !error && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Ride Selected</h3>
                <p className="text-gray-500">Enter an RFID Ride ID above to view details</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading ride details...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RideHistory;