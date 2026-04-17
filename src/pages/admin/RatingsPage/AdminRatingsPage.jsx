// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "../../../assets/components/sidebar/Sidebar";
// import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";

// const BASE_URL = "https://be.shuttleapp.transev.site/admin";

// const AdminSupportPage = () => {
//     const token = localStorage.getItem("access_token");

//     const [tickets, setTickets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [initialLoad, setInitialLoad] = useState(true);
//     const [search, setSearch] = useState("");
//     const [filter, setFilter] = useState("all");
//     const [selectedImage, setSelectedImage] = useState(null);

//     const [actionModal, setActionModal] = useState({
//         open: false,
//         id: null,
//         action: null,
//         note: "",
//     });

//     const [confirmModal, setConfirmModal] = useState({
//         open: false,
//         id: null,
//         action: null,
//     });

//     useEffect(() => {
//         fetchTickets();
//     }, []);

//     const fetchTickets = async () => {
//         try {
//             setLoading(true);
//             const res = await axios.get(`${BASE_URL}/tickets`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             setTickets(res.data || []);
//         } catch (err) {
//             console.error("Error fetching tickets", err);
//         } finally {
//             setLoading(false);
//             setInitialLoad(false);
//         }
//     };

//     const handleResolve = async (id) => {
//         try {
//             await axios.post(
//                 `${BASE_URL}/tickets/${id}/action?action=resolve`,
//                 { note: "Resolved by admin" },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             await fetchTickets();
//             setConfirmModal({ open: false, id: null, action: null });
//         } catch (err) {
//             console.error("Resolve failed", err?.response?.data || err);
//             alert("Failed to resolve ticket. Please try again.");
//         }
//     };

//     const handleReject = async () => {
//         try {
//             if (!actionModal.note.trim()) {
//                 alert("Please provide a rejection reason");
//                 return;
//             }

//             await axios.post(
//                 `${BASE_URL}/tickets/${actionModal.id}/action?action=reject`,
//                 {
//                     note: actionModal.note,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             setActionModal({ open: false, id: null, action: null, note: "" });
//             await fetchTickets();
//         } catch (err) {
//             console.error("Rejection failed", err?.response?.data || err);
//             alert("Failed to reject ticket. Please try again.");
//         }
//     };

//     const filteredTickets = tickets.filter((t) => {
//         const user = t?.user || "";
//         const subject = t?.subject || "";
//         const matchesSearch =
//             user.toLowerCase().includes(search.toLowerCase()) ||
//             subject.toLowerCase().includes(search.toLowerCase());
//         const matchesFilter = filter === "all" ? true : t?.status === filter;
//         return matchesSearch && matchesFilter;
//     });

//     // Show loading spinner for initial load
//     if (initialLoad || (loading && tickets.length === 0)) {
//         return (
//             <div className="flex bg-gray-50 min-h-screen">
//                 <Sidebar />
//                 <div className="flex-1 relative">
//                     <TopNavbarUltra />
//                     <div className="flex items-center justify-center h-full p-6">
//                         <div className="text-center">
//                             <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mb-3"></div>
//                             <p className="text-gray-600">Loading support tickets...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Calculate stats
//     const totalTickets = tickets.length;
//     const pendingTickets = tickets.filter(t => t.status === "pending").length;
//     const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
//     const rejectedTickets = tickets.filter(t => t.status === "rejected").length;

//     return (
//         <div className="flex bg-gray-50 min-h-screen">
//             <Sidebar />

//             <div className="flex-1 relative">
//                 <TopNavbarUltra />

//                 <div className="p-8 space-y-6 animate-fadeIn">
//                     {/* HEADER */}
//                     <div className="flex justify-between items-center">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
//                             <p className="text-gray-500 text-sm mt-1">Monitor, manage, and resolve user support requests</p>
//                         </div>
//                         <button
//                             onClick={() => {
//                                 setInitialLoad(true);
//                                 fetchTickets();
//                             }}
//                             className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2 shadow-sm"
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                             </svg>
//                             Refresh
//                         </button>
//                     </div>

//                     {/* STATS CARDS - Black & White Theme */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                         <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
//                             <p className="text-gray-500 text-sm font-medium">Total Tickets</p>
//                             <p className="text-2xl font-bold text-gray-800 mt-2">{totalTickets}</p>
//                         </div>
//                         <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
//                             <p className="text-gray-500 text-sm font-medium">Pending</p>
//                             <p className="text-2xl font-bold text-gray-800 mt-2">{pendingTickets}</p>
//                         </div>
//                         <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
//                             <p className="text-gray-500 text-sm font-medium">Resolved</p>
//                             <p className="text-2xl font-bold text-gray-800 mt-2">{resolvedTickets}</p>
//                         </div>
//                         <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
//                             <p className="text-gray-500 text-sm font-medium">Rejected</p>
//                             <p className="text-2xl font-bold text-gray-800 mt-2">{rejectedTickets}</p>
//                         </div>
//                     </div>

//                     {/* SEARCH + FILTER */}
//                     <div className="flex flex-col sm:flex-row gap-3">
//                         <div className="flex-1">
//                             <input
//                                 value={search}
//                                 onChange={(e) => setSearch(e.target.value)}
//                                 placeholder="Search by user email or subject..."
//                                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all text-gray-700 placeholder-gray-400"
//                             />
//                         </div>
//                         <select
//                             value={filter}
//                             onChange={(e) => setFilter(e.target.value)}
//                             className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white cursor-pointer hover:border-gray-400 transition-all text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
//                         >
//                             <option value="all">All Status</option>
//                             <option value="pending">Pending</option>
//                             <option value="resolved">Resolved</option>
//                             <option value="rejected">Rejected</option>
//                         </select>
//                     </div>

//                     {/* TABLE */}
//                     <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-gray-50 border-b border-gray-200">
//                                     <tr>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attachment</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resolved</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
//                                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody className="divide-y divide-gray-100">
//                                     {loading && tickets.length > 0 ? (
//                                         [...Array(3)].map((_, i) => (
//                                             <tr key={i} className="animate-pulse">
//                                                 {[...Array(8)].map((_, idx) => (
//                                                     <td key={idx} className="px-6 py-4">
//                                                         <div className="h-4 bg-gray-200 rounded w-full"></div>
//                                                     </td>
//                                                 ))}
//                                             </tr>
//                                         ))
//                                     ) : filteredTickets.length > 0 ? (
//                                         filteredTickets.map((ticket) => (
//                                             <tr
//                                                 key={ticket.id}
//                                                 className="hover:bg-gray-50 transition-all duration-200"
//                                             >
//                                                 <td className="px-6 py-4">
//                                                     <div className="flex items-center gap-2">
//                                                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
//                                                             <span className="text-xs font-semibold text-gray-600">
//                                                                 {ticket.user?.charAt(0).toUpperCase() || "U"}
//                                                             </span>
//                                                         </div>
//                                                         <span className="font-medium text-gray-800">{ticket.user || "N/A"}</span>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <div className="font-semibold text-gray-800">
//                                                         {ticket.subject || "No Subject"}
//                                                     </div>
//                                                     <div className="text-gray-500 text-xs mt-1 line-clamp-2 max-w-[200px]">
//                                                         {ticket.description}
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     {ticket.path ? (
//                                                         <img
//                                                             src={`https://be.shuttleapp.transev.site/${ticket.path.replace(/\\/g, "/")}`}
//                                                             className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform duration-200 shadow-sm"
//                                                             onClick={() =>
//                                                                 setSelectedImage(
//                                                                     `https://be.shuttleapp.transev.site/${ticket.path.replace(/\\/g, "/")}`
//                                                                 )
//                                                             }
//                                                             alt="Ticket attachment"
//                                                         />
//                                                     ) : (
//                                                         <span className="text-gray-400 text-xs">No image</span>
//                                                     )}
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ticket.status === "resolved"
//                                                             ? "bg-green-100 text-green-800"
//                                                             : ticket.status === "rejected"
//                                                                 ? "bg-red-100 text-red-800"
//                                                                 : "bg-yellow-100 text-yellow-800"
//                                                         }`}>
//                                                         {ticket.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4 text-gray-500 text-xs">
//                                                     {ticket.created_at
//                                                         ? new Date(ticket.created_at).toLocaleString("en-IN", {
//                                                             day: "2-digit",
//                                                             month: "short",
//                                                             hour: "2-digit",
//                                                             minute: "2-digit",
//                                                         })
//                                                         : "-"}
//                                                 </td>
//                                                 <td className="px-6 py-4 text-gray-500 text-xs">
//                                                     {ticket.resolved_at_by_admin
//                                                         ? new Date(ticket.resolved_at_by_admin).toLocaleString("en-IN", {
//                                                             day: "2-digit",
//                                                             month: "short",
//                                                             hour: "2-digit",
//                                                             minute: "2-digit",
//                                                         })
//                                                         : "-"}
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     {ticket.status === "rejected" && ticket.rejection_reason_by_admin ? (
//                                                         <div className="max-w-[180px]">
//                                                             <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
//                                                                 {ticket.rejection_reason_by_admin}
//                                                             </span>
//                                                         </div>
//                                                     ) : ticket.status === "resolved" ? (
//                                                         <span className="text-xs text-gray-500">Resolved</span>
//                                                     ) : (
//                                                         <span className="text-gray-400 text-xs">-</span>
//                                                     )}
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     {ticket.status === "pending" ? (
//                                                         <div className="flex gap-2">
//                                                             <button
//                                                                 onClick={() =>
//                                                                     setConfirmModal({ open: true, id: ticket.id, action: "resolve" })
//                                                                 }
//                                                                 className="px-3 py-1.5 text-xs font-medium rounded bg-gray-800 text-white hover:bg-gray-900 transition-all duration-200"
//                                                             >
//                                                                 Resolve
//                                                             </button>
//                                                             <button
//                                                                 onClick={() =>
//                                                                     setActionModal({ open: true, id: ticket.id, action: "reject", note: "" })
//                                                                 }
//                                                                 className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
//                                                             >
//                                                                 Reject
//                                                             </button>
//                                                         </div>
//                                                     ) : (
//                                                         <span className="text-gray-400 text-xs">Completed</span>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="8" className="text-center py-12 text-gray-400">
//                                                 {search || filter !== "all" ? "No matching tickets found" : "No tickets found"}
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* IMAGE MODAL */}
//             {selectedImage && (
//                 <div
//                     className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn"
//                     onClick={() => setSelectedImage(null)}
//                 >
//                     <div className="relative max-w-[90%] max-h-[90%]">
//                         <img
//                             src={selectedImage}
//                             className="max-w-full max-h-full rounded-lg shadow-2xl"
//                             alt="Full size"
//                         />
//                         <button
//                             onClick={() => setSelectedImage(null)}
//                             className="absolute top-2 right-2 bg-white rounded-full p-1.5 hover:bg-gray-100 transition-all duration-200 shadow-md"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* RESOLVE CONFIRM MODAL */}
//             {confirmModal.open && confirmModal.action === "resolve" && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setConfirmModal({ open: false, id: null, action: null })}>
//                     <div className="bg-white rounded-lg p-6 w-[400px] max-w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
//                         <div className="text-center">
//                             <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
//                                 <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                 </svg>
//                             </div>
//                             <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Resolution</h3>
//                             <p className="text-sm text-gray-500 mb-6">
//                                 Are you sure you want to mark this ticket as resolved?
//                             </p>
//                             <div className="flex justify-center gap-3">
//                                 <button
//                                     onClick={() => setConfirmModal({ open: false, id: null, action: null })}
//                                     className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={() => handleResolve(confirmModal.id)}
//                                     className="px-4 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 transition-all duration-200"
//                                 >
//                                     Yes, Resolve
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* REJECT MODAL WITH REASON */}

//             {actionModal.open && actionModal.action === "reject" && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setActionModal({ open: false, id: null, action: null, note: "" })}>
//                     <div className="bg-white rounded-lg p-6 w-[450px] max-w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex justify-between items-center mb-4">
//                             <h3 className="text-xl font-bold text-gray-900">Reject Ticket</h3>
//                             <button
//                                 onClick={() => setActionModal({ open: false, id: null, action: null, note: "" })}
//                                 className="text-gray-500 hover:text-gray-700 transition-all text-2xl"
//                             >
//                                 ✕
//                             </button>
//                         </div>

//                         <div className="mb-4">
//                             <label className="block text-sm font-semibold text-gray-800 mb-2">
//                                 Rejection Reason <span className="text-red-600">*</span>
//                             </label>
//                             <textarea
//                                 value={actionModal.note}
//                                 onChange={(e) =>
//                                     setActionModal({ ...actionModal, note: e.target.value })
//                                 }
//                                 placeholder="Enter rejection reason here..."
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all text-gray-900 font-medium placeholder-gray-400 bg-white resize-none"
//                                 rows="4"
//                             />
//                             <p className="text-xs text-gray-600 mt-2">
//                                 ⚠️ This reason will be shared with the user.
//                             </p>
//                         </div>

//                         <div className="flex justify-end gap-3 mt-6">
//                             <button
//                                 onClick={() =>
//                                     setActionModal({ open: false, id: null, action: null, note: "" })
//                                 }
//                                 className="px-5 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleReject}
//                                 className="px-5 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md"
//                             >
//                                 Submit Rejection
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AdminSupportPage;
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../../../assets/components/sidebar/Sidebar";
import TopNavbarUltra from "../../../assets/components/navbar/TopNavbar";
import { useNotifications } from "../../../context/NotificationContext";

const BASE_URL = "https://be.shuttleapp.transev.site/admin";

const AdminSupportPage = () => {
    const token = localStorage.getItem("access_token");
    
    // Get notification context
    const { lastNotification, wsConnected, fetchUnreadCount } = useNotifications();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedImage, setSelectedImage] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [newTicketAlert, setNewTicketAlert] = useState(null);

    const [actionModal, setActionModal] = useState({
        open: false,
        id: null,
        action: null,
        note: "",
    });

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        id: null,
        action: null,
    });

    // Fetch tickets function
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/tickets`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTickets(res.data || []);
        } catch (err) {
            console.error("Error fetching tickets", err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    // Listen for new notifications that affect tickets
    useEffect(() => {
        if (lastNotification) {
            console.log("New notification received in support page:", lastNotification);

            // Check if notification is related to tickets
            const isTicketNotification =
                lastNotification.title?.toLowerCase().includes("ticket") ||
                lastNotification.title?.toLowerCase().includes("support") ||
                lastNotification.message?.toLowerCase().includes("ticket") ||
                lastNotification.message?.toLowerCase().includes("support");

            if (isTicketNotification) {
                console.log("Ticket notification detected, refreshing tickets...");

                // Show alert banner
                setNewTicketAlert({
                    title: lastNotification.title,
                    message: lastNotification.message,
                    timestamp: new Date()
                });

                // Refresh tickets
                fetchTickets();
                
                // Also refresh notification count
                fetchUnreadCount();

                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    setNewTicketAlert(null);
                }, 5000);
            }
        }
    }, [lastNotification, fetchUnreadCount]);

    // Initial fetch
    useEffect(() => {
        fetchTickets();
    }, []);

    // Refresh every 30 seconds as fallback
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Polling for ticket updates...");
            fetchTickets();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Listen for storage events (for cross-tab notifications)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'last_notification') {
                console.log("Cross-tab ticket notification detected");
                fetchTickets();
                fetchUnreadCount();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchUnreadCount]);
    
    // Refresh when tab becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log("Tab became visible, refreshing tickets...");
                fetchTickets();
                fetchUnreadCount();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchUnreadCount]);

    const openResolveModal = (ticketId, e) => {
        e?.stopPropagation();
        console.log("Opening resolve modal for ticket:", ticketId);
        setConfirmModal({
            open: true,
            id: ticketId,
            action: "resolve",
        });
    };

    const openRejectModal = (ticketId, e) => {
        e?.stopPropagation();
        console.log("Opening reject modal for ticket:", ticketId);
        setActionModal({
            open: true,
            id: ticketId,
            action: "reject",
            note: "",
        });
    };

    const closeResolveModal = () => {
        setConfirmModal({
            open: false,
            id: null,
            action: null,
        });
    };

    const closeRejectModal = () => {
        setActionModal({
            open: false,
            id: null,
            action: null,
            note: "",
        });
    };

    const handleResolve = async () => {
        const id = confirmModal.id;
        if (!id) {
            console.error("No ticket ID found");
            return;
        }

        try {
            setActionLoading(true);
            console.log("Resolving ticket:", id);

            await axios.post(
                `${BASE_URL}/tickets/${id}/action?action=resolve`,
                { note: "Resolved by admin" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Ticket resolved successfully");
            await fetchTickets();
            await fetchUnreadCount(); // Refresh notification count
            closeResolveModal();
        } catch (err) {
            console.error("Resolve failed", err?.response?.data || err);
            alert(err?.response?.data?.detail || "Failed to resolve ticket. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        const id = actionModal.id;
        if (!id) {
            console.error("No ticket ID found");
            return;
        }

        if (!actionModal.note.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        try {
            setActionLoading(true);
            console.log("Rejecting ticket:", id, "Reason:", actionModal.note);

            await axios.post(
                `${BASE_URL}/tickets/${id}/action?action=reject`,
                {
                    note: actionModal.note,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Ticket rejected successfully");
            closeRejectModal();
            await fetchTickets();
            await fetchUnreadCount(); // Refresh notification count
        } catch (err) {
            console.error("Rejection failed", err?.response?.data || err);
            alert(err?.response?.data?.detail || "Failed to reject ticket. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTickets = tickets.filter((t) => {
        const user = t?.user || "";
        const subject = t?.subject || "";
        const matchesSearch =
            user.toLowerCase().includes(search.toLowerCase()) ||
            subject.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" ? true : t?.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (initialLoad || (loading && tickets.length === 0)) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopNavbarUltra />
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mb-3"></div>
                            <p className="text-gray-600">Loading support tickets...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const totalTickets = tickets.length;
    const pendingTickets = tickets.filter(t => t.status === "pending").length;
    const resolvedTickets = tickets.filter(t => t.status === "resolved").length;
    const rejectedTickets = tickets.filter(t => t.status === "rejected").length;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbarUltra />

                <div className="flex-1 overflow-y-auto">
                    <div className="p-8 space-y-6 animate-fadeIn">
                        {/* New Ticket Alert Banner */}
                        {newTicketAlert && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 animate-slideDown">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-blue-800">{newTicketAlert.title}</p>
                                            <p className="text-sm text-blue-600">{newTicketAlert.message}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setNewTicketAlert(null)}
                                        className="text-blue-400 hover:text-blue-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Monitor, manage, and resolve user support requests
                                    {wsConnected && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-green-600 text-xs">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                            Live updates active
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setInitialLoad(true);
                                    fetchTickets();
                                    fetchUnreadCount();
                                }}
                                className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>

                        {/* STATS CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                <p className="text-gray-500 text-sm font-medium">Total Tickets</p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{totalTickets}</p>
                            </div>
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                <p className="text-gray-500 text-sm font-medium">Pending</p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{pendingTickets}</p>
                            </div>
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                <p className="text-gray-500 text-sm font-medium">Resolved</p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{resolvedTickets}</p>
                            </div>
                            <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                <p className="text-gray-500 text-sm font-medium">Rejected</p>
                                <p className="text-2xl font-bold text-gray-800 mt-2">{rejectedTickets}</p>
                            </div>
                        </div>

                        {/* SEARCH + FILTER */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by user email or subject..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white cursor-pointer hover:border-gray-400 transition-all text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* TABLE - Same as before, keeping your existing table code */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Attachment</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Resolved</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remarks</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {/* Your existing table rows */}
                                        {filteredTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 transition-all duration-200">
                                                {/* Your existing table cells */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <span className="text-xs font-semibold text-gray-600">
                                                                {ticket.user?.charAt(0).toUpperCase() || "U"}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-gray-800">{ticket.user || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{ticket.subject || "No Subject"}</div>
                                                    <div className="text-gray-500 text-xs mt-1 line-clamp-2 max-w-[200px]">{ticket.description}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {ticket.path ? (
                                                        <img src={`https://be.shuttleapp.transev.site/${ticket.path.replace(/\\/g, "/")}`}
                                                            className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform duration-200 shadow-sm"
                                                            onClick={() => setSelectedImage(`https://be.shuttleapp.transev.site/${ticket.path.replace(/\\/g, "/")}`)}
                                                            alt="Ticket attachment" />
                                                    ) : <span className="text-gray-400 text-xs">No image</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        ticket.status === "resolved" ? "bg-green-100 text-green-800" :
                                                        ticket.status === "rejected" ? "bg-red-100 text-red-800" :
                                                        "bg-yellow-100 text-yellow-800"
                                                    }`}>{ticket.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString("en-IN") : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {ticket.resolved_at_by_admin ? new Date(ticket.resolved_at_by_admin).toLocaleString("en-IN") : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {ticket.status === "rejected" && ticket.rejection_reason_by_admin ? (
                                                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{ticket.rejection_reason_by_admin}</span>
                                                    ) : ticket.status === "resolved" ? <span className="text-xs text-gray-500">Resolved</span> : <span className="text-gray-400 text-xs">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {ticket.status === "pending" ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={(e) => openResolveModal(ticket.id, e)} className="px-3 py-1.5 text-xs font-medium rounded bg-gray-800 text-white hover:bg-gray-900">Resolve</button>
                                                            <button onClick={(e) => openRejectModal(ticket.id, e)} className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Reject</button>
                                                        </div>
                                                    ) : <span className="text-gray-400 text-xs">Completed</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* IMAGE MODAL */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-[90%] max-h-[90%]">
                        <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" alt="Full size" />
                        <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-white rounded-full p-1.5 hover:bg-gray-100">✕</button>
                    </div>
                </div>
            )}

            {/* RESOLVE CONFIRM MODAL */}
            {confirmModal.open && confirmModal.action === "resolve" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeResolveModal}>
                    <div className="bg-white rounded-lg p-6 w-[400px] max-w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Resolution</h3>
                            <p className="text-sm text-gray-500 mb-6">Are you sure you want to mark this ticket as resolved?</p>
                            <div className="flex justify-center gap-3">
                                <button onClick={closeResolveModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
                                <button onClick={handleResolve} disabled={actionLoading} className="px-4 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 disabled:opacity-50">
                                    {actionLoading ? "Processing..." : "Yes, Resolve"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REJECT MODAL */}
            {actionModal.open && actionModal.action === "reject" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeRejectModal}>
                    <div className="bg-white rounded-lg p-6 w-[450px] max-w-[90%] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Reject Ticket</h3>
                            <button onClick={closeRejectModal} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Rejection Reason <span className="text-red-600">*</span></label>
                            <textarea value={actionModal.note} onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                                placeholder="Enter rejection reason here..." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none bg-white resize-none" rows="4" autoFocus />
                            <p className="text-xs text-gray-600 mt-2">⚠️ This reason will be shared with the user.</p>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeRejectModal} className="px-5 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100">Cancel</button>
                            <button onClick={handleReject} disabled={actionLoading} className="px-5 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 shadow-md disabled:opacity-50">
                                {actionLoading ? "Processing..." : "Submit Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSupportPage;