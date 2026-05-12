import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { CreditCardIcon, ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const RegisterCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({ card_uid: "", notes: "" });

  const API_BASE = "https://be.shuttleapp.transev.site";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/cards`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("RFID card registered successfully");
      navigate("/admin/rfid/cards");
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to register card";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-8">
            <div className="w-full max-w-3xl">
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
                          <CreditCardIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-3xl font-light text-black tracking-tight">
                          Register <span className="font-semibold">RFID Card</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-light">Add a new RFID card to your inventory</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <span className="text-xs text-gray-500 tracking-wide">NEW CARD</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="px-8 py-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Card UID */}
                    <div className="group">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-black uppercase tracking-wider">
                          Card UID
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="text-[10px] text-gray-400 font-mono">RAW FORMAT</div>
                      </div>
                      <div className={`relative transition-all duration-300 ${focusedField === 'card_uid' ? 'transform scale-[1.02]' : ''}`}>
                        <input
                          type="text"
                          value={formData.card_uid}
                          onChange={(e) => setFormData({ ...formData, card_uid: e.target.value })}
                          onFocus={() => setFocusedField('card_uid')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full bg-gray-50 text-black px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 placeholder:text-gray-400 font-mono text-sm"
                          placeholder="Enter raw card UID"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-gray-400 text-xs font-light">Raw UID from physical RFID card (will be encrypted)</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                        Additional Notes
                        <span className="text-gray-400 ml-1 font-light">(Optional)</span>
                      </label>
                      <div className={`transition-all duration-300 ${focusedField === 'notes' ? 'transform scale-[1.02]' : ''}`}>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          onFocus={() => setFocusedField('notes')}
                          onBlur={() => setFocusedField(null)}
                          rows="4"
                          className="w-full bg-gray-50 text-black px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 resize-none placeholder:text-gray-400 font-light"
                          placeholder="Card batch number, source, purchase date, or any additional information..."
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <DocumentTextIcon className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-gray-400 text-xs font-light">Add reference notes for this card</p>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShieldCheckIcon className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <p className="text-black text-sm font-medium">Security Information</p>
                          <p className="text-gray-400 text-xs mt-0.5 font-light">
                            The card UID will be securely hashed before storage. 
                            Only masked UID will be visible in the system.
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
                            REGISTERING...
                          </span>
                        ) : (
                          "REGISTER CARD"
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

              {/* Decorative Footer */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs tracking-wider font-light">
                  SECURE RFID CARD REGISTRATION
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterCard;