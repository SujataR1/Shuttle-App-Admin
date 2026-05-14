import Sidebar from '../../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../../assets/components/navbar/TopNavbar';
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  ArrowLeftIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SeatPolicy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [allowDriverReservation, setAllowDriverReservation] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);

  const API_BASE = "https://be.shuttleapp.transev.site";

  // Fetch current seat policy
  const fetchSeatPolicy = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_BASE}/admin/rfid/seat-policy`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllowDriverReservation(response.data.allow_driver_rfid_seat_reservation);
      setCurrentStatus(response.data.allow_driver_rfid_seat_reservation);
    } catch (error) {
      toast.error("Failed to fetch seat policy");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update seat policy
  const updateSeatPolicy = async (value) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.patch(
        `${API_BASE}/admin/rfid/seat-policy`,
        { allow_driver_rfid_seat_reservation: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllowDriverReservation(response.data.allow_driver_rfid_seat_reservation);
      setCurrentStatus(response.data.allow_driver_rfid_seat_reservation);
      toast.success(`Seat policy ${value ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      const message = error.response?.data?.detail?.message || "Failed to update seat policy";
      toast.error(message);
      // Revert on error
      setAllowDriverReservation(currentStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggle = () => {
    const newValue = !allowDriverReservation;
    setAllowDriverReservation(newValue);
    updateSeatPolicy(newValue);
  };

  useEffect(() => {
    fetchSeatPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <TopNavbar sidebarOpen={sidebarOpen} />
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
              <p className="text-gray-500">Loading seat policy...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <TopNavbar sidebarOpen={sidebarOpen} />
        
        <main className="pt-20 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-sm">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">RFID Seat Policy</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Manage RFID boarding seat reservation settings</p>
                </div>
              </div>
            </div>

            {/* Policy Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Allow Driver RFID Seat Reservation
                      </h2>
                      <div className="group relative">
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <p className="font-medium mb-1">What does this do?</p>
                          <p className="text-gray-300">
                            When enabled, RFID boarding uses a fixed reserved RFID seat pool.
                            Backend checks RFID reserved seat pool before allowing RFID board scan.
                          </p>
                          <p className="text-gray-300 mt-2">
                            When disabled, fixed RFID reserved seats are disabled.
                            Backend does not check RFID seat pool. Onboard crew decides physical seat permission.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      {allowDriverReservation ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Enabled</span>
                          <span className="text-gray-400 text-sm">- Fixed RFID reserved seats are active</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-5 h-5 text-rose-600" />
                          <span className="text-rose-700 font-medium">Disabled</span>
                          <span className="text-gray-400 text-sm">- Crew-managed seat assignment</span>
                        </>
                      )}
                    </div>

                    {/* Description based on status */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        {allowDriverReservation ? (
                          <>
                            <span className="font-medium">🎫 Fixed RFID Reserved Seats:</span>
                            <br />
                            Backend checks RFID reserved seat pool before allowing RFID board scan.
                            Drivers/admin reserved RFID seats matter.
                          </>
                        ) : (
                          <>
                            <span className="font-medium">👥 Crew-Managed Seats:</span>
                            <br />
                            Backend does not check RFID seat pool.
                            Onboard crew decides physical seat permission.
                            Passenger should confirm seat onboard.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-700 font-medium">Current Setting</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {allowDriverReservation 
                            ? "RFID seat reservation is backend-enforced" 
                            : "RFID seat reservation is crew-managed"}
                        </p>
                      </div>
                      <button
                        onClick={handleToggle}
                        disabled={updating}
                        className={`
                          relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300
                          ${allowDriverReservation ? 'bg-gray-800' : 'bg-gray-300'}
                          ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300
                            ${allowDriverReservation ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                  {updating && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SeatPolicy;