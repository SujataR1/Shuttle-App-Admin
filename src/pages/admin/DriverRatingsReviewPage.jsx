// import React, { useEffect, useState } from 'react';
// import { ClipboardDocumentListIcon, StarIcon } from '@heroicons/react/24/outline';
// import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
// import Sidebar from '../../assets/components/sidebar/Sidebar';
// import TopNavbar from '../../assets/components/navbar/TopNavbar';

// const DriverRatingsReviewPage = () => {
//     const [reviews, setReviews] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedReview, setSelectedReview] = useState(null);
//     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//     useEffect(() => {
//         fetchDriverReviews();
//     }, []);

//     const fetchDriverReviews = async () => {
//         try {
//             setLoading(true);
//             const token = localStorage.getItem("access_token");

//             if (!token) {
//                 throw new Error('No authentication token found. Please login again.');
//             }

//             const response = await fetch('https://be.shuttleapp.transev.site/admin/reviews/drivers', {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 }
//             });

//             if (!response.ok) {
//                 if (response.status === 401) {
//                     throw new Error('Authentication failed. Please login again.');
//                 }
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             if (data.status === 'success' && Array.isArray(data.reviews)) {
//                 setReviews(data.reviews);
//             } else {
//                 setReviews([]);
//             }
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Failed to fetch driver reviews');
//             console.error('Error fetching driver reviews:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//         });
//     };

//     const renderStars = (rating) => {
//         return (
//             <div className="flex items-center">
//                 {[1, 2, 3, 4, 5].map((star) => (
//                     <span key={star}>
//                         {star <= rating ? (
//                             <StarSolidIcon className="h-4 w-4 text-yellow-400" />
//                         ) : (
//                             <StarIcon className="h-4 w-4 text-gray-300" />
//                         )}
//                     </span>
//                 ))}
//                 <span className="ml-1 text-sm text-gray-600">({rating})</span>
//             </div>
//         );
//     };

//     const toggleSidebar = () => {
//         setSidebarCollapsed(!sidebarCollapsed);
//     };

//     if (loading) {
//         return (
//             <div className="flex h-screen bg-gray-50">
//                 <Sidebar collapsed={sidebarCollapsed} />
//                 <div className="flex-1 flex flex-col overflow-hidden">
//                     <TopNavbar toggleSidebar={toggleSidebar} />
//                     <div className="flex items-center justify-center h-full">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex h-screen bg-gray-50">
//                 <Sidebar collapsed={sidebarCollapsed} />
//                 <div className="flex-1 flex flex-col overflow-hidden">
//                     <TopNavbar toggleSidebar={toggleSidebar} />
//                     <div className="flex items-center justify-center p-4">
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
//                             <p className="text-red-700">Error: {error}</p>
//                             <button
//                                 onClick={fetchDriverReviews}
//                                 className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                             >
//                                 Retry
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex h-screen bg-gray-50">
//             <Sidebar collapsed={sidebarCollapsed} />
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <TopNavbar toggleSidebar={toggleSidebar} />

//                 <div className="flex-1 overflow-y-auto p-6">
//                     {/* Header */}
//                     <div className="mb-8">
//                         <div className="flex items-center gap-3 mb-2">
//                             <div className="p-2 bg-blue-100 rounded-xl">
//                                 <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
//                             </div>
//                             <h1 className="text-2xl font-bold text-gray-900">Driver Ratings & Reviews</h1>
//                         </div>
//                         <p className="text-gray-600 ml-12">
//                             Manage and monitor driver performance feedback from passengers
//                         </p>
//                     </div>

//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                             <p className="text-sm text-gray-500 mb-1">Total Reviews</p>
//                             <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                             <p className="text-sm text-gray-500 mb-1">Average Rating</p>
//                             <p className="text-3xl font-bold text-gray-900">
//                                 {reviews.length > 0
//                                     ? (reviews.reduce((sum, r) => sum + r.feedback.rating, 0) / reviews.length).toFixed(1)
//                                     : 'N/A'}
//                             </p>
//                         </div>
//                         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
//                             <p className="text-sm text-gray-500 mb-1">Total Drivers</p>
//                             <p className="text-3xl font-bold text-gray-900">
//                                 {new Set(reviews.map((r) => r.driver.user_id)).size}
//                             </p>
//                         </div>
//                     </div>

//                     {/* Reviews Table */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Driver
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Passenger
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Trip Details
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Rating
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Date
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {reviews.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
//                                                 No driver reviews found
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         reviews.map((review) => (
//                                             <tr key={review.rating_id} className="hover:bg-gray-50 transition-colors">
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="text-sm font-medium text-gray-900">{review.driver.name}</div>
//                                                     <div className="text-xs text-gray-500">ID: {review.driver.user_id.slice(0, 8)}...</div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="text-sm text-gray-900">{review.passenger.name}</div>
//                                                     <div className="text-xs text-gray-500">{review.passenger.email}</div>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <div className="text-sm text-gray-900">{review.trip_details.route_name}</div>
//                                                     <div className="text-xs text-gray-500">
//                                                         Trip ID: {review.trip_details.trip_id.slice(0, 8)}...
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     {renderStars(review.feedback.rating)}
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                     {formatDate(review.feedback.created_at)}
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                                     <button
//                                                         onClick={() => setSelectedReview(review)}
//                                                         className="text-blue-600 hover:text-blue-800 font-medium"
//                                                     >
//                                                         View Details
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Modal for Review Details */}
//                     {selectedReview && (
//                         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                             <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                                 <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
//                                     <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
//                                     <button
//                                         onClick={() => setSelectedReview(null)}
//                                         className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//                                     >
//                                         &times;
//                                     </button>
//                                 </div>
//                                 <div className="p-6 space-y-6">
//                                     {/* Driver Info */}
//                                     <div className="bg-blue-50 rounded-xl p-4">
//                                         <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-3">
//                                             Driver Information
//                                         </h3>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Name</p>
//                                                 <p className="text-base font-medium text-gray-900">{selectedReview.driver.name}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">User ID</p>
//                                                 <p className="text-sm text-gray-700">{selectedReview.driver.user_id}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Passenger Info */}
//                                     <div className="bg-green-50 rounded-xl p-4">
//                                         <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-3">
//                                             Passenger Information
//                                         </h3>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Name</p>
//                                                 <p className="text-base font-medium text-gray-900">{selectedReview.passenger.name}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Email</p>
//                                                 <p className="text-sm text-gray-700">{selectedReview.passenger.email}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Trip Info */}
//                                     <div className="bg-purple-50 rounded-xl p-4">
//                                         <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3">
//                                             Trip Information
//                                         </h3>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Route</p>
//                                                 <p className="text-base font-medium text-gray-900">{selectedReview.trip_details.route_name}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Trip ID</p>
//                                                 <p className="text-sm text-gray-700">{selectedReview.trip_details.trip_id}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Trip Date</p>
//                                                 <p className="text-sm text-gray-700">{formatDate(selectedReview.trip_details.date)}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Review Date</p>
//                                                 <p className="text-sm text-gray-700">{formatDate(selectedReview.feedback.created_at)}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Feedback */}
//                                     <div className="bg-yellow-50 rounded-xl p-4">
//                                         <h3 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-3">
//                                             Feedback
//                                         </h3>
//                                         <div className="space-y-3">
//                                             <div>
//                                                 <p className="text-xs text-gray-500 mb-1">Driver Rating</p>
//                                                 <div className="flex items-center gap-2">
//                                                     {renderStars(selectedReview.feedback.rating)}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500 mb-1">Trip Rating</p>
//                                                 <div className="flex items-center gap-2">
//                                                     {renderStars(selectedReview.feedback.trip_ratings)}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500 mb-1">Comment</p>
//                                                 <div className="bg-white rounded-lg p-3 border border-gray-200">
//                                                     <p className="text-gray-700">
//                                                         {selectedReview.feedback.comment || 'No comment provided'}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Rating ID */}
//                                     <div className="text-xs text-gray-400 text-right pt-2 border-t border-gray-100">
//                                         Rating ID: {selectedReview.rating_id}
//                                     </div>
//                                 </div>
//                                 <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
//                                     <button
//                                         onClick={() => setSelectedReview(null)}
//                                         className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                                     >
//                                         Close
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DriverRatingsReviewPage;

import React, { useEffect, useState } from 'react';
import { ClipboardDocumentListIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Sidebar from '../../assets/components/sidebar/Sidebar';
import TopNavbar from '../../assets/components/navbar/TopNavbar';

const DriverRatingsReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check if mobile/tablet view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchDriverReviews();
    }, []);

    const fetchDriverReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");

            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await fetch('https://be.shuttleapp.transev.site/admin/reviews/drivers', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === 'success' && Array.isArray(data.reviews)) {
                setReviews(data.reviews);
            } else {
                setReviews([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch driver reviews');
            console.error('Error fetching driver reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center flex-wrap gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                        {star <= rating ? (
                            <StarSolidIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                        ) : (
                            <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300" />
                        )}
                    </span>
                ))}
                <span className="ml-1 text-[10px] sm:text-xs text-gray-600">({rating})</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar onClose={() => setSidebarOpen(false)} />
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                    <TopNavbar 
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                        isMobile={isMobile} 
                        title="Driver Ratings & Reviews" 
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar onClose={() => setSidebarOpen(false)} />
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                    <TopNavbar 
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                        isMobile={isMobile} 
                        title="Driver Ratings & Reviews" 
                    />
                    <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-3">
                            <p className="text-red-700 text-sm sm:text-base">Error: {error}</p>
                            <button
                                onClick={fetchDriverReviews}
                                className="mt-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.feedback.rating, 0) / totalReviews).toFixed(1)
        : 0;
    const totalDrivers = new Set(reviews.map((r) => r.driver.user_id)).size;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                <TopNavbar 
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                    isMobile={isMobile} 
                    title="Driver Ratings & Reviews" 
                />

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-xl w-fit">
                                <ClipboardDocumentListIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Driver Ratings & Reviews</h1>
                        </div>
                        <p className="text-sm text-gray-600 ml-0 sm:ml-12">
                            Manage and monitor driver performance feedback from passengers
                        </p>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Reviews</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalReviews}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Average Rating</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl sm:text-3xl font-bold text-amber-500">{averageRating}</p>
                                {averageRating > 0 && renderStars(parseFloat(averageRating))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
                            <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Drivers</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalDrivers}</p>
                        </div>
                    </div>

                    {/* Reviews Table - Responsive with horizontal scroll */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[900px] lg:min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Passenger
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trip Details
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reviews.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500 text-sm">
                                                No driver reviews found
                                            </td>
                                        </tr>
                                    ) : (
                                        reviews.map((review) => (
                                            <tr key={review.rating_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">{review.driver?.name || 'N/A'}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 font-mono truncate max-w-[150px]">
                                                        ID: {review.driver?.user_id?.slice(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[150px]">{review.passenger?.name || 'N/A'}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px]">{review.passenger?.email || 'N/A'}</div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[180px]">{review.trip_details?.route_name || 'N/A'}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 font-mono">
                                                        Trip ID: {review.trip_details?.trip_id?.slice(0, 8)}...
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    {renderStars(review.feedback?.rating || 0)}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs text-gray-500">
                                                    {formatDate(review.feedback?.created_at)}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4">
                                                    <button
                                                        onClick={() => setSelectedReview(review)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
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
                    </div>

                    {/* Modal for Review Details - Responsive */}
                    {selectedReview && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setSelectedReview(null)}>
                            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-shrink-0">
                                    <h2 className="text-base sm:text-xl font-semibold text-gray-900">Review Details</h2>
                                    <button
                                        onClick={() => setSelectedReview(null)}
                                        className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl leading-none"
                                    >
                                        &times;
                                    </button>
                                </div>
                                
                                <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
                                    {/* Driver Info */}
                                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
                                        <h3 className="text-xs sm:text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2 sm:mb-3">
                                            Driver Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Name</p>
                                                <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{selectedReview.driver?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">User ID</p>
                                                <p className="text-xs sm:text-sm text-gray-700 break-all">{selectedReview.driver?.user_id || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Passenger Info */}
                                    <div className="bg-green-50 rounded-xl p-3 sm:p-4">
                                        <h3 className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wider mb-2 sm:mb-3">
                                            Passenger Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Name</p>
                                                <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{selectedReview.passenger?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Email</p>
                                                <p className="text-xs sm:text-sm text-gray-700 break-all">{selectedReview.passenger?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trip Info */}
                                    <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
                                        <h3 className="text-xs sm:text-sm font-semibold text-purple-800 uppercase tracking-wider mb-2 sm:mb-3">
                                            Trip Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Route</p>
                                                <p className="text-sm sm:text-base font-medium text-gray-900 break-words">{selectedReview.trip_details?.route_name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Trip ID</p>
                                                <p className="text-xs sm:text-sm text-gray-700 break-all">{selectedReview.trip_details?.trip_id || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Trip Date</p>
                                                <p className="text-xs sm:text-sm text-gray-700">{formatDate(selectedReview.trip_details?.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500">Review Date</p>
                                                <p className="text-xs sm:text-sm text-gray-700">{formatDate(selectedReview.feedback?.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div className="bg-yellow-50 rounded-xl p-3 sm:p-4">
                                        <h3 className="text-xs sm:text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2 sm:mb-3">
                                            Feedback
                                        </h3>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Driver Rating</p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {renderStars(selectedReview.feedback?.rating || 0)}
                                                </div>
                                            </div>
                                            {selectedReview.feedback?.trip_ratings && (
                                                <div>
                                                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Trip Rating</p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {renderStars(selectedReview.feedback.trip_ratings)}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Comment</p>
                                                <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                                                    <p className="text-xs sm:text-sm text-gray-700 break-words">
                                                        {selectedReview.feedback?.comment || 'No comment provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating ID */}
                                    <div className="text-[10px] sm:text-xs text-gray-400 text-right pt-2 border-t border-gray-100">
                                        Rating ID: {selectedReview.rating_id}
                                    </div>
                                </div>
                                
                                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end flex-shrink-0">
                                    <button
                                        onClick={() => setSelectedReview(null)}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverRatingsReviewPage;