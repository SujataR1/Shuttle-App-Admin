import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { DevicePhoneMobileIcon, ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const RegisterDevice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusedField, setFocusedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Add error state
  const dropdownRef = useRef(null);
  const observerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    serial_number: "",
    vehicle_id: "",
    is_active: true,
    notes: ""
  });

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Search for vehicles with pagination
  const searchVehicles = async (searchText, pageNum = 1, isLoadMore = false) => {
    if (!searchText || searchText.length < 2) {
      if (!isLoadMore) {
        setVehicleOptions([]);
        setHasMore(false);
        setTotalCount(0);
      }
      return;
    }

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsSearching(true);
      setPage(1);
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/device-vehicle-options`,
        {
          params: {
            page: pageNum,
            page_size: 25,
            q: searchText
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newItems = response.data.items || [];
      const count = response.data.count || 0;
      
      if (isLoadMore) {
        setVehicleOptions(prev => [...prev, ...newItems]);
      } else {
        setVehicleOptions(newItems);
        setTotalCount(count);
      }
      
      // Check if there are more pages
      const more = (pageNum * 25) < count;
      setHasMore(more);
      setPage(pageNum);
      
      if (!isLoadMore) {
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error loading vehicle options:", error);
      toast.error("Failed to load vehicle options");
      if (!isLoadMore) {
        setVehicleOptions([]);
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsSearching(false);
      }
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchVehicles(searchTerm, 1, false);
      } else {
        setVehicleOptions([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!showDropdown || !hasMore || isLoadingMore) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore && searchTerm.length >= 2) {
        const nextPage = page + 1;
        searchVehicles(searchTerm, nextPage, true);
      }
    }, options);

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [showDropdown, hasMore, isLoadingMore, page, searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      ...formData,
      vehicle_id: vehicle.vehicle_id
    });
    setShowDropdown(false);
    setSearchTerm("");
    setVehicleOptions([]);
  };

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous error
    setErrorMessage("");
    
    // Validate vehicle is selected
    if (!formData.vehicle_id) {
      const error = "Please select a vehicle";
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    
    // Validate serial number
    if (!formData.serial_number.trim()) {
      const error = "Please enter a serial number";
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE}/admin/rfid/devices`,
        {
          serial_number: formData.serial_number.trim(),
          vehicle_id: formData.vehicle_id,
          is_active: formData.is_active,
          notes: formData.notes || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Success - clear any errors and show success
      setErrorMessage("");
      toast.success("✓ RFID device registered successfully!");
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate("/admin/rfid/devices");
      }, 1500);
      
    } catch (error) {
      console.error("Full error object:", error);
      
      let userMessage = "Failed to register device";
      
      // Try to extract error message from various possible response formats
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        if (typeof detail === 'object') {
          if (detail.error === "rfid_device_conflict") {
            userMessage = "❌ An RFID device with this serial number already exists. Please use a different serial number.";
          } else if (detail.message) {
            userMessage = detail.message;
          } else {
            userMessage = JSON.stringify(detail);
          }
        } else if (typeof detail === 'string') {
          userMessage = detail;
        }
      } else if (error.response?.data?.message) {
        userMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        userMessage = error.response.data.error;
      } else if (error.message) {
        userMessage = error.message;
      }
      
      // Set the error message for display
      setErrorMessage(userMessage);
      
      // Also show toast notification
      toast.error(userMessage);
      
      // Scroll to error message
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
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
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
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
                
                {/* Error Message Display - VISIBLE ERROR SECTION */}
                {errorMessage && (
                  <div id="error-message" className="mx-8 mt-6">
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-red-800 mb-1">
                            Registration Failed
                          </h3>
                          <p className="text-sm text-red-700">
                            {errorMessage}
                          </p>
                        </div>
                        <button
                          onClick={() => setErrorMessage("")}
                          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
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
                          className={`w-full bg-gray-50 text-black px-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border transition-all duration-300 placeholder:text-gray-400 font-light ${
                            errorMessage && errorMessage.includes("serial number") 
                              ? 'border-red-500 focus:ring-red-500/20' 
                              : 'border-gray-200'
                          }`}
                          placeholder="RFID-SCANNER-001"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 font-light">Unique identifier for the scanner device</p>
                    </div>

                    {/* Vehicle / Driver Selection - Custom Dropdown with Pagination */}
                    <div className="group relative" ref={dropdownRef}>
                      <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                        Vehicle / Driver
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        {/* Selected Vehicle Display */}
                        {selectedVehicle ? (
                          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5">
                            <div className="flex-1">
                              <div className="text-black font-medium">
                                {selectedVehicle.driver_name || "Unknown Driver"}
                              </div>
                              <div className="text-gray-500 text-sm">
                                {selectedVehicle.vehicle_license_plate}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVehicle(null);
                                setFormData({ ...formData, vehicle_id: "" });
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Search Input */}
                            <div className="relative">
                              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => {
                                  if (searchTerm.length >= 2 && vehicleOptions.length > 0) {
                                    setShowDropdown(true);
                                  }
                                }}
                                className="w-full bg-gray-50 text-black pl-12 pr-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 border border-gray-200 transition-all duration-300 placeholder:text-gray-400 font-light"
                                placeholder="Search driver name or vehicle plate..."
                              />
                            </div>
                            
                            {/* Dropdown Results with Pagination */}
                            {showDropdown && (
                              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                                {isSearching && page === 1 ? (
                                  <div className="px-5 py-4 text-gray-500 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Searching vehicles...
                                    </div>
                                  </div>
                                ) : vehicleOptions.length > 0 ? (
                                  <>
                                    {vehicleOptions.map((vehicle) => (
                                      <button
                                        key={vehicle.vehicle_id}
                                        type="button"
                                        onClick={() => handleVehicleSelect(vehicle)}
                                        className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                      >
                                        <div className="font-medium text-black">
                                          {vehicle.driver_name || "Unknown Driver"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {vehicle.vehicle_license_plate}
                                        </div>
                                      </button>
                                    ))}
                                    {/* Loading more indicator */}
                                    {isLoadingMore && (
                                      <div className="px-5 py-3 text-gray-500 text-center border-t border-gray-100">
                                        <div className="flex items-center justify-center gap-2">
                                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Loading more...
                                        </div>
                                      </div>
                                    )}
                                    {/* Intersection observer target */}
                                    {hasMore && !isLoadingMore && (
                                      <div ref={observerRef} className="h-1" />
                                    )}
                                    {/* Total count indicator */}
                                    {totalCount > 0 && (
                                      <div className="px-5 py-2 text-xs text-gray-400 text-center border-t border-gray-100 bg-gray-50">
                                        {vehicleOptions.length} of {totalCount} vehicles
                                      </div>
                                    )}
                                  </>
                                ) : searchTerm.length >= 2 ? (
                                  <div className="px-5 py-4 text-gray-500 text-center">
                                    No matching vehicle found
                                  </div>
                                ) : (
                                  <div className="px-5 py-4 text-gray-500 text-center">
                                    Type at least 2 characters to search
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-2 font-light">
                        Search by driver name or vehicle registration plate
                      </p>
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