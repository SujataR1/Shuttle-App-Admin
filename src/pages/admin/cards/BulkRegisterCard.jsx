import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DocumentDuplicateIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const BulkRegisterCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
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
    <div className="flex h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Sidebar */}
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Page Content - Centered */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-8">
            <div className="w-full max-w-5xl">
              {/* Back Button */}
              <button
                onClick={() => navigate("/admin/rfid/cards")}
                className="group inline-flex items-center gap-2 text-gray-400 hover:text-black transition-all duration-300 mb-8"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-medium tracking-wide">BACK TO CARDS</span>
              </button>

              {/* Main Card */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Decorative Top Bar */}
                <div className="h-1.5 bg-gradient-to-r from-black via-gray-700 to-black"></div>
                
                {/* Header Section */}
                <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-black rounded-2xl blur-xl opacity-10"></div>
                        <div className="relative w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                          <DocumentDuplicateIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-3xl font-light text-black tracking-tight">
                          Bulk <span className="font-semibold">Register RFID Cards</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-light">Register multiple RFID cards at once</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <span className="text-xs text-gray-500 tracking-wide">BATCH IMPORT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="px-8 py-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Card UIDs */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-black uppercase tracking-wider">
                          Card UIDs
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          {cardUids && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {getUidCount()} cards
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-mono">ONE PER LINE</span>
                        </div>
                      </div>
                      <div className={`relative transition-all duration-300 ${focusedField === 'cardUids' ? 'transform scale-[1.01]' : ''}`}>
                        <textarea
                          value={cardUids}
                          onChange={(e) => setCardUids(e.target.value)}
                          onFocus={() => setFocusedField('cardUids')}
                          onBlur={() => setFocusedField(null)}
                          rows="10"
                          required
                          className="w-full bg-gray-50 text-black px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 resize-none font-mono text-sm placeholder:text-gray-400"
                          placeholder="UID_001&#10;UID_002&#10;UID_003&#10;UID_004&#10;UID_005"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <InformationCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-gray-400 text-xs font-light">Maximum 500 cards. Enter one UID per line</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                        Batch Notes
                        <span className="text-gray-400 ml-1 font-light">(Optional)</span>
                      </label>
                      <div className={`transition-all duration-300 ${focusedField === 'notes' ? 'transform scale-[1.01]' : ''}`}>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onFocus={() => setFocusedField('notes')}
                          onBlur={() => setFocusedField(null)}
                          rows="3"
                          className="w-full bg-gray-50 text-black px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 resize-none placeholder:text-gray-400 font-light"
                          placeholder="Batch number, purchase date, supplier information..."
                        />
                      </div>
                      <p className="text-gray-400 text-xs mt-2 font-light">These notes will apply to all cards in this batch</p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ClipboardDocumentListIcon className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <p className="text-black text-sm font-medium">Batch Import Information</p>
                          <p className="text-gray-400 text-xs mt-0.5 font-light">
                            Each UID will be securely hashed before storage. 
                            Duplicate UIDs will be automatically skipped.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            PROCESSING {getUidCount()} CARDS...
                          </span>
                        ) : (
                          `BULK REGISTER ${getUidCount() > 0 ? `(${getUidCount()} CARDS)` : ''}`
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/rfid/cards")}
                        className="flex-1 bg-gray-100 text-black py-3.5 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 border border-gray-200"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                </div>

                {/* Footer Note */}
                <div className="bg-gray-50/30 px-8 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-gray-500 text-xs font-light tracking-wide">
                      All fields marked with <span className="text-red-500 font-medium">*</span> are required
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {result && (
                <div className="mt-8 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg animate-fadeIn">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-black flex items-center gap-2">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                      Registration Results
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-green-600 text-2xl font-bold">{result.created_count}</p>
                          <p className="text-green-600 text-xs font-medium">CARDS CREATED</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-yellow-600 text-2xl font-bold">{result.skipped_count}</p>
                          <p className="text-yellow-600 text-xs font-medium">CARDS SKIPPED</p>
                        </div>
                      </div>
                    </div>

                    {result.items && result.items.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-black uppercase tracking-wider mb-3">DETAILED LOG</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-4 border border-gray-100">
                          {result.items.map((item, idx) => (
                            <div key={idx} className={`text-sm py-2 px-3 rounded-lg flex items-center gap-2 ${
                              item.status === "created" 
                                ? "text-green-600 bg-green-50" 
                                : "text-yellow-600 bg-yellow-50"
                            }`}>
                              {item.status === "created" ? (
                                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span className="font-mono text-xs">{item.card_uid_masked}</span>
                              <span className="text-xs">
                                {item.status === "created" ? "✓ Created" : `✗ ${item.error}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Decorative Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs tracking-wider font-light">
                  BULK RFID CARD REGISTRATION SYSTEM
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BulkRegisterCard;