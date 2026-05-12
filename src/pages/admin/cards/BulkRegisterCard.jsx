import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentDuplicateIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const BulkRegisterCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cardUids, setCardUids] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);

  const API_BASE = "https://be.shuttleapp.transev.site";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uids = cardUids.split("\n").filter(uid => uid.trim().length > 0);
    if (uids.length === 0) {
      toast.error("Please enter at least one card UID");
      return;
    }
    if (uids.length > 500) {
      toast.error("Maximum 500 cards per batch");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `${API_BASE}/admin/rfid/cards/bulk`,
        { card_uids: uids, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      toast.success(`${response.data.created_count} cards registered, ${response.data.skipped_count} skipped`);
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Bulk registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getUidCount = () => {
    return cardUids.split("\n").filter(uid => uid.trim().length > 0).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopNavbar />
        
        <main className="p-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/admin/rfid/cards")}
              className="group inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-all duration-300 mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">Back to Cards</span>
            </button>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header Section */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                    <DocumentDuplicateIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      Bulk Register RFID Cards
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Register multiple RFID cards at once</p>
                  </div>
                </div>
              </div>
              
              {/* Form Section */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card UIDs */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Card UIDs <span className="text-red-500">*</span>
                      </label>
                      {cardUids && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {getUidCount()} cards
                        </span>
                      )}
                    </div>
                    <textarea
                      value={cardUids}
                      onChange={(e) => setCardUids(e.target.value)}
                      rows="10"
                      required
                      className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-200 transition-all duration-300 resize-none font-mono text-sm placeholder:text-gray-400"
                      placeholder="UID_001&#10;UID_002&#10;UID_003"
                    />
                    <p className="text-gray-400 text-xs mt-2">Maximum 500 cards. One UID per line. Duplicates will be skipped.</p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Notes <span className="text-gray-400 text-xs font-light">(Optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-200 transition-all duration-300 resize-none placeholder:text-gray-400"
                      placeholder="Batch number, purchase date, supplier information..."
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">Security Information</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Each UID will be securely hashed before storage. 
                          Duplicate UIDs will be automatically skipped.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 rounded-xl font-medium hover:from-gray-900 hover:to-gray-800 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing {getUidCount()} cards...
                        </span>
                      ) : (
                        `Bulk Register ${getUidCount() > 0 ? `(${getUidCount()})` : ''}`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/rfid/cards")}
                      className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600" />
                    Registration Results
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-emerald-700 text-2xl font-bold">{result.created_count}</p>
                        <p className="text-emerald-600 text-xs font-medium">CARDS CREATED</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-amber-700 text-2xl font-bold">{result.skipped_count}</p>
                        <p className="text-amber-600 text-xs font-medium">CARDS SKIPPED</p>
                      </div>
                    </div>
                  </div>

                  {result.items && result.items.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Detailed Log</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-4">
                        {result.items.map((item, idx) => (
                          <div key={idx} className={`text-sm py-2 px-3 rounded-lg flex items-center gap-2 ${
                            item.status === "created" 
                              ? "bg-emerald-50 text-emerald-700" 
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {item.status === "created" ? (
                              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="font-mono text-xs">{item.card_uid_masked}</span>
                            <span className="text-xs">
                              {item.status === "created" ? "Created" : item.error}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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

export default BulkRegisterCard;