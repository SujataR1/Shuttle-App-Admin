// src/pages/admin/rfid/PayoutTransferDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";
import {
  ArrowLeftIcon,
  CurrencyRupeeIcon,
  PlayIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const PayoutTransferDetail = () => {
  const { transferId } = useParams();
  const navigate = useNavigate();
  const [transferDetail, setTransferDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reverseAmount, setReverseAmount] = useState("");
  const [reverseReason, setReverseReason] = useState("");

  const fetchTransferDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/payout-transfers/${transferId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransferDetail(response.data);
    } catch (error) {
      console.error("Error fetching transfer detail:", error);
      toast.error("Failed to load transfer details");
      navigate("/admin/rfid/payout-transfers");
    } finally {
      setLoading(false);
    }
  };

  const triggerTransfer = async () => {
    if (!window.confirm("Trigger this payout transfer?")) return;
    
    setTriggering(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/payout-transfers/${transferId}/trigger`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Payout transfer triggered successfully");
      fetchTransferDetail();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to trigger transfer";
      toast.error(message);
    } finally {
      setTriggering(false);
    }
  };

  const reverseTransfer = async () => {
    if (!reverseAmount || parseFloat(reverseAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setReversing(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/payout-transfers/${transferId}/reverse`,
        {
          amount: reverseAmount,
          reason: reverseReason || "Admin initiated reversal",
          admin_note: "Reversed from admin panel"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Payout transfer reversed successfully");
      setShowReverseModal(false);
      fetchTransferDetail();
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to reverse transfer";
      toast.error(message);
    } finally {
      setReversing(false);
    }
  };

  useEffect(() => {
    fetchTransferDetail();
  }, [transferId]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      ready: "bg-emerald-100 text-emerald-700",
      created: "bg-amber-100 text-amber-700",
      processed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      withheld: "bg-orange-100 text-orange-700",
      reversed: "bg-purple-100 text-purple-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="lg:ml-64">
          <TopNavbar />
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  const transfer = transferDetail?.transfer;
  const reversals = transferDetail?.reversals || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="lg:ml-64">
        <TopNavbar />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate("/admin/rfid/payout-transfers")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Transfers
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Payout Transfer Details</h1>
              <p className="text-gray-500 mt-1 font-mono text-sm">{transfer?.id}</p>
            </div>

            {/* Transfer Summary */}
            {transfer && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CurrencyRupeeIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Amount Details</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Original Amount</span>
                      <span className="font-medium text-gray-900">{formatCurrency(transfer.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Reversed Amount</span>
                      <span className="font-medium text-red-600">{formatCurrency(transfer.reversed_amount)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-900">Payable Amount</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(transfer.payable_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Transfer Status</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusBadge(transfer.status)}`}>
                        {transfer.status?.toUpperCase()}
                      </span>
                    </div>
                    {transfer.has_reversals && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Reversals</span>
                        <span className="text-sm text-gray-900">{transfer.reversal_count} reversal(s)</span>
                      </div>
                    )}
                    {transfer.failure_reason && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Failure Reason</span>
                        <span className="text-sm text-red-600">{transfer.failure_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Timestamps</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created</span>
                      <span className="text-sm text-gray-900">{formatDateTime(transfer.created_at)}</span>
                    </div>
                    {transfer.processed_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Processed</span>
                        <span className="text-sm text-gray-900">{formatDateTime(transfer.processed_at)}</span>
                      </div>
                    )}
                    {transfer.reversed_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Reversed</span>
                        <span className="text-sm text-gray-900">{formatDateTime(transfer.reversed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Entities */}
            {transfer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <BanknotesIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Related IDs</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Ride ID</span>
                      <span className="text-sm font-mono">{transfer.rfid_ride_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Driver ID</span>
                      <span className="text-sm font-mono">{transfer.driver_user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Scheduled Trip</span>
                      <span className="text-sm font-mono">{transfer.scheduled_trip_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Route ID</span>
                      <span className="text-sm font-mono">{transfer.route_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Vehicle ID</span>
                      <span className="text-sm font-mono">{transfer.vehicle_id}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <BanknotesIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Source Information</h3>
                  </div>
                  <div className="space-y-2">
                    {transfer.source_recharge_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Recharge ID</span>
                        <span className="text-sm font-mono">{transfer.source_recharge_id}</span>
                      </div>
                    )}
                    {transfer.source_funding_allocation_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Funding Allocation</span>
                        <span className="text-sm font-mono">{transfer.source_funding_allocation_id}</span>
                      </div>
                    )}
                    {transfer.source_razorpay_payment_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Razorpay Payment</span>
                        <span className="text-sm font-mono">{transfer.source_razorpay_payment_id}</span>
                      </div>
                    )}
                    {transfer.razorpay_transfer_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Razorpay Transfer</span>
                        <span className="text-sm font-mono">{transfer.razorpay_transfer_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reversals Section */}
            {reversals.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5" />
                    Reversal History
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reversals.map((reversal, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(reversal.amount)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              reversal.status === 'processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {reversal.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{reversal.reason || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(reversal.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {transfer && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-4">
                  {transfer.status === 'ready' && (
                    <button
                      onClick={triggerTransfer}
                      disabled={triggering}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <PlayIcon className="w-4 h-4" />
                      {triggering ? "Triggering..." : "Trigger Payout"}
                    </button>
                  )}
                  
                  {(transfer.status === 'created' || transfer.status === 'processed') && (
                    <button
                      onClick={() => setShowReverseModal(true)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                      Reverse Payout Transfer
                    </button>
                  )}
                  
                  {transfer.status === 'withheld' && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Transfer Withheld</p>
                        <p className="text-xs text-orange-600 mt-1">
                          This transfer is withheld because the driver's payout account is not ready.
                          Use the "Refresh Withheld" action on the dashboard after fixing driver account details.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {transfer.status === 'failed' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Transfer Failed</p>
                        <p className="text-xs text-red-600 mt-1">
                          {transfer.failure_reason || "No failure reason provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reverse Modal */}
            {showReverseModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reverse Payout Transfer</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Reverse</label>
                      <input
                        type="number"
                        value={reverseAmount}
                        onChange={(e) => setReverseAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max: {formatCurrency(transfer?.payable_amount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <textarea
                        value={reverseReason}
                        onChange={(e) => setReverseReason(e.target.value)}
                        placeholder="Why is this reversal needed?"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={reverseTransfer}
                        disabled={reversing}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {reversing ? "Processing..." : "Confirm Reversal"}
                      </button>
                      <button
                        onClick={() => setShowReverseModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PayoutTransferDetail;