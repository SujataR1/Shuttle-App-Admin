// src/pages/admin/dispatcher/DispatcherPanel.jsx
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import axios from "axios";

const DispatcherPanel = () => {
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          "https://be.shuttleapp.transev.site/admin/view/all-trips",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrips(response.data || []);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  // 🔍 Filter trips
  const filteredTrips = trips.filter((trip) => {
    const term = searchTerm.toLowerCase();
    return (
      trip.bus_reg_no?.toLowerCase().includes(term) ||
      trip.driver_name?.toLowerCase().includes(term) ||
      trip.route?.toLowerCase().includes(term)
    );
  });

  // 🚫 Admin cancel trip
  const handleCancelTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `https://be.shuttleapp.transev.site/admin/trip/cancel/${tripId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Trip cancelled successfully");

      // update UI instantly
      setTrips((prev) =>
        prev.map((t) =>
          t.trip_id === tripId ? { ...t, status: "cancelled" } : t
        )
      );
    } catch (error) {
      console.error("Cancel trip error:", error);
      alert("Failed to cancel trip");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <TopNavbarUltra />

        <div className="p-6 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-black">
              Dispatcher Panel (Admin)
            </h1>

            {/* 🔍 Search */}
            <input
              type="text"
              placeholder="Search by bus, driver, route..."
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Bus Reg No</th>
                  <th className="px-4 py-2">Driver</th>
                  <th className="px-4 py-2">Route</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.trip_id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{trip.bus_reg_no || "N/A"}</td>
                    <td className="px-4 py-2">{trip.driver_name || "N/A"}</td>
                    <td className="px-4 py-2">{trip.route || "N/A"}</td>
                    <td className="px-4 py-2">{trip.date || "N/A"}</td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium border border-black text-black">
                        {trip.status || "N/A"}
                      </span>
                    </td>

                    {/* Admin Action */}
                    <td className="px-4 py-2">
                      {trip.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelTrip(trip.trip_id)}
                          className="bg-black text-white px-3 py-1 rounded-full text-xs hover:bg-gray-800 transition"
                        >
                          Cancel Trip
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrips.length === 0 && (
            <p className="text-center mt-10 text-gray-500">
              No trips found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatcherPanel;

