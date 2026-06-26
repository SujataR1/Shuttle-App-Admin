import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

const TransactionsPage = () => {
    const BASE_URL = "https://be.shuttleapp.transev.site/admin";
    const token = localStorage.getItem("access_token");

    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
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

    // Fetch Transactions
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${BASE_URL}/transactions/all`,
                axiosConfig
            );
            const data = res.data.data || [];
            setTransactions(data);
            setFilteredTransactions(data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...transactions];

        if (searchTerm) {
            result = result.filter(tx =>
                tx.passenger?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.passenger?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.trip_details?.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.trip_details?.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            result = result.filter(tx => tx.status === statusFilter);
        }

        if (paymentFilter !== "all") {
            result = result.filter(tx => tx.payment_gateway?.[0]?.payment_status === paymentFilter);
        }

        setFilteredTransactions(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, paymentFilter, transactions]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Status Badge
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "booked":
                return "bg-green-50 text-green-700 border border-green-200";
            case "cancelled":
                return "bg-red-50 text-red-700 border border-red-200";
            case "completed":
                return "bg-blue-50 text-blue-700 border border-blue-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    const getPaymentBadge = (paymentStatus) => {
        switch (paymentStatus?.toLowerCase()) {
            case "paid":
                return "bg-green-50 text-green-700 border border-green-200";
            case "refunded":
                return "bg-purple-50 text-purple-700 border border-purple-200";
            case "pending":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "failed":
                return "bg-red-50 text-red-700 border border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    };

    // Helper function to check if a transaction should be excluded from financial calculations
    const shouldExcludeFromFinancials = (transaction) => {
        // Exclude if refunded OR payment status is refunded OR payment failed
        return transaction.refund_info?.is_refunded === true || 
               transaction.payment_gateway?.[0]?.payment_status === "refunded" ||
               transaction.payment_gateway?.[0]?.payment_status === "failed";
    };

    // Calculate summary stats - EXCLUDING refunded transactions
    const getValidTransactionsForFinancials = (transactionsList) => {
        return transactionsList.filter(tx => !shouldExcludeFromFinancials(tx));
    };

    const validTransactions = getValidTransactionsForFinancials(filteredTransactions);
    
    const totalTransactions = filteredTransactions.length;
    const validTransactionsCount = validTransactions.length;
    const refundedTransactionsCount = filteredTransactions.filter(tx => shouldExcludeFromFinancials(tx)).length;
    
    const totalRevenue = validTransactions.reduce((sum, tx) => sum + (tx.financials?.total_fare || 0), 0);
    const totalCommission = validTransactions.reduce((sum, tx) => sum + (tx.financials?.admin_earned || 0), 0);
    const totalDriverPayout = validTransactions.reduce((sum, tx) => sum + (tx.financials?.driver_payout || 0), 0);
    
    const completedBookings = filteredTransactions.filter(tx => tx.status === "completed" && !shouldExcludeFromFinancials(tx)).length;
    const bookedBookings = filteredTransactions.filter(tx => tx.status === "booked" && !shouldExcludeFromFinancials(tx)).length;
    const cancelledBookings = filteredTransactions.filter(tx => tx.status === "cancelled" && !shouldExcludeFromFinancials(tx)).length;
    
    const paidPayments = filteredTransactions.filter(tx => tx.payment_gateway?.[0]?.payment_status === "paid").length;
    const refundedPayments = filteredTransactions.filter(tx => tx.payment_gateway?.[0]?.payment_status === "refunded").length;
    const failedPayments = filteredTransactions.filter(tx => tx.payment_gateway?.[0]?.payment_status === "failed").length;

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPaymentFilter("all");
    };

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
    };

    // Skeleton Loader Component
    const SkeletonRow = () => (
        <tr className="border-t border-gray-100">
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-16 sm:w-24 mt-2 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-20 sm:w-28 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-16 sm:w-20 mt-2 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-16 sm:w-24 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-5 bg-gray-200 rounded w-14 sm:w-20 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-5 bg-gray-200 rounded w-14 sm:w-20 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-3 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div></td>
            <td className="p-3 sm:p-4"><div className="h-7 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div></td>
        </tr>
    );

    // Show loading spinner for initial load
    if (initialLoad || loading) {
        return (
            <div className="flex h-screen bg-white overflow-hidden">
                <Sidebar onClose={() => setSidebarOpen(false)} />
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                    <TopNavbarUltra 
                        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                        isMobile={isMobile} 
                        title="Transactions" 
                    />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-gray-300 border-t-gray-700 mb-3"></div>
                            <p className="text-gray-500 text-xs sm:text-sm">Loading transactions...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
            
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${!isMobile ? 'lg:ml-72' : ''}`}>
                <TopNavbarUltra 
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                    isMobile={isMobile} 
                    title="Transactions" 
                />
                
                <div className="flex-1 overflow-auto bg-gray-50">
                    <div className="p-3 sm:p-4 md:p-6">
                        {/* Header */}
                        <div className="mb-4 sm:mb-6">
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Transaction History</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage all platform transactions</p>
                        </div>

                        {/* Stats Cards - Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Transactions</p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{totalTransactions}</p>
                                <div className="flex gap-2 mt-1">
                                    <p className="text-[10px] sm:text-xs text-green-600">{validTransactionsCount} valid</p>
                                    <p className="text-[10px] sm:text-xs text-red-600">{refundedTransactionsCount} refunded/failed</p>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Revenue</p>
                                <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Excludes refunded transactions</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Commission</p>
                                <p className="text-xl sm:text-2xl font-semibold text-blue-600 mt-1">₹{totalCommission.toLocaleString()}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Excludes refunded transactions</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Driver Payout</p>
                                <p className="text-xl sm:text-2xl font-semibold text-green-600 mt-1">₹{totalDriverPayout.toLocaleString()}</p>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Excludes refunded transactions</p>
                            </div>
                        </div>

                        {/* Additional Stats Row - Responsive */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-gray-500">Completed Bookings</p>
                                <p className="text-base sm:text-xl font-semibold text-gray-900">{completedBookings}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-gray-500">Booked/Pending</p>
                                <p className="text-base sm:text-xl font-semibold text-gray-900">{bookedBookings}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-gray-500">Paid Payments</p>
                                <p className="text-base sm:text-xl font-semibold text-green-600">{paidPayments}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-2 sm:p-3">
                                <p className="text-[10px] sm:text-xs text-gray-500">Refunded/Failed</p>
                                <p className="text-base sm:text-xl font-semibold text-red-600">{refundedPayments + failedPayments}</p>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white border border-gray-200 rounded-xl mb-4 sm:mb-6">
                            <div className="p-3 sm:p-4 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search by passenger, route, or driver..."
                                            className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-xs sm:text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-xs sm:text-sm bg-white"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="booked">Booked</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <select
                                        className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-xs sm:text-sm bg-white"
                                        value={paymentFilter}
                                        onChange={(e) => setPaymentFilter(e.target.value)}
                                    >
                                        <option value="all">All Payment</option>
                                        <option value="paid">Paid</option>
                                        <option value="refunded">Refunded</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    {(searchTerm || statusFilter !== "all" || paymentFilter !== "all") && (
                                        <button onClick={clearFilters} className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-600 hover:text-gray-900 text-xs sm:text-sm">
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table - Responsive with horizontal scroll */}
                            <div className="overflow-x-auto">
                                <table className="min-w-[1000px] lg:min-w-full w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Passenger</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Trip</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Driver</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Fare</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Comm %</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Admin Earned</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Driver Payout</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase"> Audit
                                                <span className="ml-1 cursor-help text-gray-400" title="Financial audit status - Passed means transaction calculations are correct">ⓘ</span>
                                                </th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Payment</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="p-2 sm:p-4 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            Array(5).fill().map((_, i) => <SkeletonRow key={i} />)
                                        ) : currentItems.length === 0 ? (
                                            <tr><td colSpan="12" className="text-center py-8 sm:py-12"><div className="text-gray-400 text-sm">No transactions found</div></td></tr>
                                        ) : (
                                            currentItems.map((tx) => {
                                                const isRefunded = shouldExcludeFromFinancials(tx);
                                                return (
                                                    <tr key={tx.booking_id} className={`border-t border-gray-100 hover:bg-gray-50/40 transition-colors ${isRefunded ? 'bg-red-50/30' : ''}`}>
                                                        <td className="p-2 sm:p-4">
                                                            <p className="font-medium text-gray-900 text-xs sm:text-sm">{tx.passenger?.name || "N/A"}</p>
                                                            <p className="text-[10px] sm:text-xs text-gray-400 break-all">{tx.passenger?.email || "N/A"}</p>
                                                        </td>
                                                        <td className="p-2 sm:p-4">
                                                            <p className="text-gray-700 text-xs sm:text-sm">{tx.trip_details?.route_name || "N/A"}</p>
                                                            <p className="text-[10px] sm:text-xs text-gray-400">{tx.trip_details?.pickup?.name || "N/A"} → {tx.trip_details?.dropoff?.name || "N/A"}</p>
                                                        </td>
                                                        <td className="p-2 sm:p-4 text-gray-700 text-xs sm:text-sm">{tx.trip_details?.driver_name || "N/A"}</td>
                                                        <td className="p-2 sm:p-4">
                                                            <span className={`font-medium text-xs sm:text-sm ${isRefunded ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                                ₹{(tx.financials?.total_fare || 0).toLocaleString()}
                                                            </span>
                                                            {isRefunded && <p className="text-[10px] sm:text-xs text-red-500">Refunded</p>}
                                                        </td>
                                                        <td className={`p-2 sm:p-4 text-xs sm:text-sm ${isRefunded ? 'text-gray-400' : 'text-gray-700'}`}>{tx.financials?.commission_percent || 0}%</td>
                                                        <td className={`p-2 sm:p-4 text-xs sm:text-sm ${isRefunded ? 'text-gray-400 line-through' : 'text-gray-700'}`}>₹{(tx.financials?.admin_earned || 0).toLocaleString()}</td>
                                                        <td className={`p-2 sm:p-4 text-xs sm:text-sm ${isRefunded ? 'text-gray-400 line-through' : 'font-medium text-green-600'}`}>₹{(tx.financials?.driver_payout || 0).toLocaleString()}</td>
                                                        <td className="p-2 sm:p-4">
                                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${tx.financials?.audit_passed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                                {tx.financials?.audit_passed ? 'Passed' : 'Failed'}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 sm:p-4">
                                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusBadge(tx.status)}`}>
                                                                {tx.status || "N/A"}
                                                            </span>
                                                            {isRefunded && <p className="text-[10px] sm:text-xs text-purple-600 mt-1">Fully Refunded</p>}
                                                        </td>
                                                        <td className="p-2 sm:p-4">
                                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getPaymentBadge(tx.payment_gateway?.[0]?.payment_status)}`}>
                                                                {tx.payment_gateway?.[0]?.payment_status || "N/A"}
                                                            </span>
                                                            <p className="text-[10px] sm:text-xs font-mono text-gray-400 mt-1">{tx.payment_gateway?.[0]?.razorpay_payment_id?.substring(0, 13)}...</p>
                                                         </td>
                                                        <td className="p-2 sm:p-4">
                                                            <p className="text-[10px] sm:text-xs text-gray-500">{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString("en-IN") : "N/A"}</p>
                                                            <p className="text-[10px] sm:text-xs text-gray-400">{tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                                                         </td>
                                                        <td className="p-2 sm:p-4">
                                                            <button 
                                                                onClick={() => handleViewDetails(tx)} 
                                                                className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50"
                                                            >
                                                                View
                                                            </button>
                                                         </td>
                                                     </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="border-t border-gray-100 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                                    <p className="text-[10px] sm:text-xs text-gray-500">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length} results</p>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => paginate(currentPage - 1)} 
                                            disabled={currentPage === 1} 
                                            className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            Previous
                                        </button>
                                        <button 
                                            onClick={() => paginate(currentPage + 1)} 
                                            disabled={currentPage === totalPages} 
                                            className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Refresh Button */}
                        <div className="mt-3 sm:mt-4 flex justify-end">
                            <button 
                                onClick={() => { setInitialLoad(true); fetchTransactions(); }} 
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                            >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal - Responsive */}
            {showDetailsModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-auto m-0" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-3 sm:p-4 flex justify-between items-center">
                            <h3 className="text-base sm:text-lg font-semibold">Transaction Details</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl">✕</button>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Booking ID</label>
                                    <p className="text-xs sm:text-sm font-mono mt-1 break-all">{selectedTransaction.booking_id}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Status</label>
                                    <p className="mt-1"><span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusBadge(selectedTransaction.status)}`}>{selectedTransaction.status}</span></p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Timestamp</label>
                                    <p className="text-xs sm:text-sm text-gray-900 mt-1">{selectedTransaction.timestamp ? new Date(selectedTransaction.timestamp).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>

                            {/* Passenger Info */}
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Passenger Details</h4>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Name</label>
                                            <p className="text-xs sm:text-sm text-gray-900">{selectedTransaction.passenger?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Email</label>
                                            <p className="text-xs sm:text-sm text-gray-900 break-all">{selectedTransaction.passenger?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Trip Details</h4>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Route</label>
                                            <p className="text-xs sm:text-sm text-gray-900">{selectedTransaction.trip_details?.route_name || 'N/A'}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-gray-500">Pickup</label>
                                                <p className="text-xs sm:text-sm text-gray-900">{selectedTransaction.trip_details?.pickup?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-gray-500">Dropoff</label>
                                                <p className="text-xs sm:text-sm text-gray-900">{selectedTransaction.trip_details?.dropoff?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Driver</label>
                                            <p className="text-xs sm:text-sm text-gray-900">{selectedTransaction.trip_details?.driver_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Financial Details</h4>
                                <div className={`rounded-lg p-3 sm:p-4 ${selectedTransaction.refund_info?.is_refunded ? 'bg-red-50' : 'bg-gray-50'}`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase">Total Fare</label>
                                            <p className={`text-base sm:text-lg font-semibold ${selectedTransaction.refund_info?.is_refunded ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                ₹{selectedTransaction.financials?.total_fare?.toFixed(2)}
                                            </p>
                                            {selectedTransaction.refund_info?.is_refunded && <p className="text-[10px] sm:text-xs text-red-600 mt-1">Refunded</p>}
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Commission %</label>
                                            <p className="text-xs sm:text-sm text-gray-900">{selectedTransaction.financials?.commission_percent}%</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Admin Earned</label>
                                            <p className={`text-xs sm:text-sm ${selectedTransaction.refund_info?.is_refunded ? 'text-gray-400 line-through' : 'text-gray-900'}`}>₹{selectedTransaction.financials?.admin_earned?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Driver Payout</label>
                                            <p className={`text-xs sm:text-sm font-medium ${selectedTransaction.refund_info?.is_refunded ? 'text-gray-400 line-through' : 'text-green-600'}`}>₹{selectedTransaction.financials?.driver_payout?.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Audit Passed</label>
                                            <p><span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${selectedTransaction.financials?.audit_passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{selectedTransaction.financials?.audit_passed ? 'Yes' : 'No'}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Payment Details</h4>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-gray-500">Order ID</label>
                                                <p className="text-[10px] sm:text-xs font-mono text-gray-600 break-all">{selectedTransaction.payment_gateway?.[0]?.razorpay_order_id || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-gray-500">Payment ID</label>
                                                <p className="text-[10px] sm:text-xs font-mono text-gray-600 break-all">{selectedTransaction.payment_gateway?.[0]?.razorpay_payment_id || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] sm:text-xs text-gray-500">Payment Status</label>
                                            <p><span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getPaymentBadge(selectedTransaction.payment_gateway?.[0]?.payment_status)}`}>{selectedTransaction.payment_gateway?.[0]?.payment_status || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Information */}
                            {selectedTransaction.refund_info && selectedTransaction.refund_info.is_refunded && (
                                <div>
                                    <h4 className="text-xs sm:text-sm font-semibold text-purple-700 mb-2 sm:mb-3">💰 Refund Information</h4>
                                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-purple-600 uppercase">Is Refunded</label>
                                                <p className="text-xs sm:text-sm text-purple-900 font-semibold">✓ Yes - Full Refund</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-purple-600 uppercase">Refund Amount</label>
                                                <p className="text-xs sm:text-sm text-purple-900 font-semibold">₹{selectedTransaction.financials?.total_fare?.toFixed(2)}</p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-[10px] sm:text-xs text-purple-600 uppercase">Reason</label>
                                                <p className="text-xs sm:text-sm text-purple-900">{selectedTransaction.refund_info.reason || 'No reason provided'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-purple-600 uppercase">Cancelled By</label>
                                                <p className="text-xs sm:text-sm text-purple-900">{selectedTransaction.refund_info.cancelled_by || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] sm:text-xs text-purple-600 uppercase">Cancelled At</label>
                                                <p className="text-xs sm:text-sm text-purple-900">{selectedTransaction.refund_info.cancelled_at ? new Date(selectedTransaction.refund_info.cancelled_at).toLocaleString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-purple-200">
                                            <p className="text-[10px] sm:text-xs text-purple-700">
                                                ⚠️ Note: This transaction has been fully refunded. No financial amounts are included in revenue calculations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="sticky bottom-0 bg-white border-t p-3 sm:p-4 flex justify-end">
                            <button onClick={() => setShowDetailsModal(false)} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xs sm:text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsPage;