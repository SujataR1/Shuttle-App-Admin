import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbar from "../../../assets/components/navbar/TopNavbar";

const PassengerRatingsReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState(1);
  const [driverIdFilter, setDriverIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const hasFetched = useRef(false);

  const token = localStorage.getItem("access_token");
  const BASE_URL = "https://be.shuttleapp.transev.site";

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/admin/reviews/drivers?min_rating=${minRating}&limit=100`;
      if (driverIdFilter) {
        url += `&driver_id=${driverIdFilter}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setFilteredReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchReviews();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...reviews];

    if (searchTerm) {
      result = result.filter(
        (review) =>
          review.passenger?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.feedback?.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.trip_details?.route_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(result);
    setCurrentPage(1);
  }, [searchTerm, reviews]);

  const handleApplyFilters = () => {
    fetchReviews();
  };

  const handleClearFilters = () => {
    setMinRating(1);
    setDriverIdFilter("");
    setSearchTerm("");
    fetchReviews();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" fill="url(#halfGradient)" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "bg-emerald-100 text-emerald-700";
    if (rating >= 4) return "bg-green-100 text-green-700";
    if (rating >= 3) return "bg-amber-100 text-amber-700";
    if (rating >= 2) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  // Calculate statistics
  const totalReviews = filteredReviews.length;
  const averageRating = totalReviews > 0 
    ? (filteredReviews.reduce((sum, r) => sum + r.feedback.rating, 0) / totalReviews).toFixed(1)
    : 0;
  const ratingDistribution = {
    5: filteredReviews.filter(r => r.feedback.rating === 5).length,
    4: filteredReviews.filter(r => r.feedback.rating === 4).length,
    3: filteredReviews.filter(r => r.feedback.rating === 3).length,
    2: filteredReviews.filter(r => r.feedback.rating === 2).length,
    1: filteredReviews.filter(r => r.feedback.rating === 1).length,
  };

  if (initialLoad || loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-800"></div>
              </div>
              <p className="text-gray-500 mt-4 font-medium">Loading reviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Passenger Ratings & Reviews
                </h1>
                <p className="text-gray-500 mt-1">Monitor and manage driver performance feedback</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalReviews}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold text-amber-500">{averageRating}</p>
                {renderStars(parseFloat(averageRating))}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">5-Star Reviews</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{ratingDistribution[5]}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500">1-Star Reviews</p>
              <p className="text-3xl font-bold text-rose-600 mt-1">{ratingDistribution[1]}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by passenger, driver, or route..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Rating</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm bg-white"
                    value={minRating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                  >
                    <option value={1}>1 Star & Above</option>
                    <option value={2}>2 Stars & Above</option>
                    <option value={3}>3 Stars & Above</option>
                    <option value={4}>4 Stars & Above</option>
                    <option value={5}>5 Stars Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Driver ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Filter by driver user ID"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                    value={driverIdFilter}
                    onChange={(e) => setDriverIdFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Passenger</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trip Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Review</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <div className="text-gray-400">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">No reviews found</p>
                          <p className="text-xs mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((review) => (
                      <tr key={review.rating_id} className="hover:bg-gray-50/50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-medium">
                              {review.passenger?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{review.passenger?.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-400">{review.passenger?.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{review.driver?.name || 'Unknown Driver'}</p>
                          <p className="text-xs text-gray-400 font-mono">{review.driver?.user_id?.substring(0, 13)}...</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{review.trip_details?.route_name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{formatDate(review.trip_details?.date)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium w-16 text-center ${getRatingColor(review.feedback?.rating)}`}>
                              {review.feedback?.rating} ★
                            </span>
                            {renderStars(review.feedback?.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {review.feedback?.comment || 'No comment provided'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">{formatDate(review.feedback?.created_at)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReviews.length)} of {filteredReviews.length} reviews
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Details Modal */}
      {showDetailsModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Review Details</h3>
                <p className="text-sm text-gray-500 mt-0.5">Rating ID: {selectedReview.rating_id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-all duration-200 hover:rotate-90"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Rating Section */}
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Driver Rating</p>
                    <p className="text-4xl font-bold text-amber-600 mt-1">{selectedReview.feedback?.rating} / 5</p>
                  </div>
                  <div>{renderStars(selectedReview.feedback?.rating)}</div>
                </div>
              </div>

              {/* Passenger & Driver Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Passenger</p>
                  <p className="font-medium text-gray-900">{selectedReview.passenger?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedReview.passenger?.email || 'No email'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Driver</p>
                  <p className="font-medium text-gray-900">{selectedReview.driver?.name || 'Unknown Driver'}</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{selectedReview.driver?.user_id}</p>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Trip Information</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Route:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedReview.trip_details?.route_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Trip ID:</span>
                    <span className="text-sm font-mono text-gray-600">{selectedReview.trip_details?.trip_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Trip Date:</span>
                    <span className="text-sm text-gray-600">{formatDate(selectedReview.trip_details?.date)}</span>
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Review Comment</p>
                <p className="text-gray-700 leading-relaxed">
                  {selectedReview.feedback?.comment || 'No comment provided by the passenger.'}
                </p>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Additional Information</p>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Reviewed On:</span>
                  <span className="text-sm text-gray-600">{formatDate(selectedReview.feedback?.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50/30">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerRatingsReviews;