import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DevicePhoneMobileIcon, ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const RegisterDevice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    serial_number: "",
    vehicle_id: "",
    is_active: true,
    notes: ""
  });

  const API_BASE = "https://be.shuttleapp.transev.site";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/devices`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("RFID device registered successfully");
      navigate("/admin/rfid/devices");
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to register device";
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
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
            <div className="w-full max-w-3xl">
              {/* Back Button */}
              <button
                onClick={() => navigate("/admin/rfid/devices")}
                className="group inline-flex items-center gap-2 text-gray-500 hover:text-black transition-all duration-300 mb-8"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-medium tracking-wide">BACK TO DEVICES</span>
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
                          <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-3xl font-light text-black tracking-tight">
                          Register <span className="font-semibold">RFID Device</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 font-light">Add a new scanner device to your fleet</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <span className="text-xs text-gray-500 tracking-wide">NEW DEVICE</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Form Section */}
                <div className="px-8 py-8">
                  <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Serial Number */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                        Serial Number
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className={`relative transition-all duration-300 ${focusedField === 'serial_number' ? 'transform scale-[1.01]' : ''}`}>
                        <input
                          type="text"
                          name="serial_number"
                          value={formData.serial_number}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('serial_number')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full bg-gray-50 text-black px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 placeholder:text-gray-400 font-light"
                          placeholder="RFID-SCANNER-001"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 font-light">Unique identifier for the scanner device</p>
                    </div>

                    {/* Vehicle ID */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                        Vehicle ID
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className={`relative transition-all duration-300 ${focusedField === 'vehicle_id' ? 'transform scale-[1.01]' : ''}`}>
                        <input
                          type="text"
                          name="vehicle_id"
                          value={formData.vehicle_id}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('vehicle_id')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full bg-gray-50 text-black px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 placeholder:text-gray-400 font-light"
                          placeholder="VHC-2024-001"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 font-light">The vehicle this scanner will be installed in</p>
                    </div>

                    {/* Active Status - Elegant Toggle */}
                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <ShieldCheckIcon className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <label className="text-black font-medium text-sm">Device Status</label>
                            <p className="text-gray-500 text-xs mt-0.5 font-light">Set the device as active immediately</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                          className="relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black/20"
                          style={{ backgroundColor: formData.is_active ? '#000000' : '#E5E7EB' }}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                              formData.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="group">
                      <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                        Additional Notes
                        <span className="text-gray-400 ml-1 font-light">(Optional)</span>
                      </label>
                      <div className={`transition-all duration-300 ${focusedField === 'notes' ? 'transform scale-[1.01]' : ''}`}>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('notes')}
                          onBlur={() => setFocusedField(null)}
                          rows="4"
                          className="w-full bg-gray-50 text-black px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 resize-none placeholder:text-gray-400 font-light"
                          placeholder="Installation details, location, or any additional information..."
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-black text-white py-3.5 rounded-xl font-medium hover:bg-gray-900 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                          "REGISTER DEVICE"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/rfid/devices")}
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

              {/* Elegant Decorative Element */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs tracking-wider font-light">
                  SECURE RFID DEVICE REGISTRATION
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterDevice;