import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchReviewsAdmin, deleteReview } from '../features/review.slice';
import { useNavigate } from "react-router-dom";
import {
    MdSearch,
    MdFilterList,
    MdVisibility,
    MdDelete,
    MdSwapVert,
    MdDownload,
    MdClose,
    MdStar,
    MdStarBorder,
    MdExpandMore,
    MdTrendingUp,
    MdSentimentVerySatisfied,
    MdSentimentVeryDissatisfied,
    MdArrowForward,
    MdOutlineMailOutline
} from 'react-icons/md';

import { generatePdf } from '../utils/generate.pdf';
import { Zoom, toast } from 'react-toastify';

const AdminReviews = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchReviewsAdmin());
    }, [dispatch]);

    // Fetching reviews from Redux state
    const reduxReviews = useSelector((state) => state.review.reviews) || [];

    // Interaction & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRating, setSelectedRating] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Slide-over Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    // Custom Dropdown States
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const ratingRef = useRef(null);

    // Handle outside clicks to close custom dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ratingRef.current && !ratingRef.current.contains(event.target)) {
                setIsRatingOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const ratingsOptions = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

    // Resolve a display label for the reviewed product, whether it's
    // populated (object) or just an ObjectId string, as it is in the raw API response
    const getProductLabel = (product) => {
        if (!product) return 'Unknown Product';
        if (typeof product === 'object') return product.title || product.name || product._id;
        return product;
    };

    const getProductId = (product) => {
        if (!product) return null;
        return typeof product === 'object' ? product._id : product;
    };

    // Handlers
    const handleView = (review) => {
        setSelectedReview(review);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id, reviewerName) => {
        if (!window.confirm(`Delete the review from ${reviewerName}? This cannot be undone.`)) return;

        dispatch(deleteReview(id));
        toast.success(`Review from ${reviewerName} removed successfully`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Zoom,
        });

        if (isViewModalOpen) setIsViewModalOpen(false);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        const headers = ["#", "Reviewer", "Email", "Rating", "Comment", "Date"];

        const rows = reduxReviews.map((review, index) => [
            index + 1,
            review.reviewerName,
            review.reviewerEmail,
            review.rating,
            review.comment,
            new Date(review.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
        ]);

        generatePdf({
            companyName: "QwikCart",
            reportName: "Customer Reviews Report",
            fileName: "QwikCart_Reviews_Report.pdf",
            headers,
            rows
        });
    };

    // UI Helpers
    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                i < rating ?
                    <MdStar key={i} size={18} className="text-amber-400" /> :
                    <MdStarBorder key={i} size={18} className="text-slate-200" />
            ))}
        </div>
    );

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Calculate Dashboard Stats
    const stats = useMemo(() => {
        const total = reduxReviews.length;
        const avgRating = total ? (reduxReviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : 0;
        const fiveStar = reduxReviews.filter(r => r.rating === 5).length;
        const oneStar = reduxReviews.filter(r => r.rating === 1).length;
        return { total, avgRating, fiveStar, oneStar };
    }, [reduxReviews]);

    // Filter, Sort, and Pagination Pipeline
    const filteredAndSortedReviews = useMemo(() => {
        let output = [...reduxReviews];

        // Filter by Search Query (Reviewer name, email, or comment)
        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            output = output.filter(review =>
                (review.reviewerName && review.reviewerName.toLowerCase().includes(lowerQuery)) ||
                (review.reviewerEmail && review.reviewerEmail.toLowerCase().includes(lowerQuery)) ||
                (review.comment && review.comment.toLowerCase().includes(lowerQuery)) ||
                (getProductId(review.product) && getProductId(review.product).toLowerCase().includes(lowerQuery))
            );
        }

        // Filter by Rating
        if (selectedRating !== 'All') {
            const ratingValue = parseInt(selectedRating.charAt(0));
            output = output.filter(review => review.rating === ratingValue);
        }

        // Handle Sorting
        if (sortConfig.key) {
            output.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (sortConfig.key === 'date') {
                    aVal = new Date(aVal).getTime();
                    bVal = new Date(bVal).getTime();
                }
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return output;
    }, [reduxReviews, searchQuery, selectedRating, sortConfig]);

    // Pagination Math
    const totalItems = filteredAndSortedReviews.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedReviews.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedReviews, currentPage]);

    const getRatingBadge = (rating) => {
        if (rating >= 4) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (rating === 3) return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-red-50 text-red-700 border-red-200';
    };

    return (
        <div className="space-y-6 pb-8 px-1 relative">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Customer Reviews</h1>
                    <p className="text-sm text-slate-500 mt-1">Read and moderate what your customers are saying about your products.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors w-full sm:w-auto cursor-pointer"
                    >
                        <MdDownload size={18} />
                        <span className="text-sm cursor-pointer">Export</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MdStar size={24} /></div>
                    <div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Reviews</p>
                        <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><MdTrendingUp size={24} /></div>
                    <div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Avg. Rating</p>
                        <p className="text-2xl font-black text-slate-800">{stats.avgRating} <span className="text-sm text-slate-400 font-normal">/ 5.0</span></p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><MdSentimentVerySatisfied size={24} /></div>
                    <div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">5-Star Reviews</p>
                        <p className="text-2xl font-black text-slate-800">{stats.fiveStar}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><MdSentimentVeryDissatisfied size={24} /></div>
                    <div>
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Critical (1-Star)</p>
                        <p className="text-2xl font-black text-slate-800">{stats.oneStar}</p>
                    </div>
                </div>
            </div>

            {/* Filters and Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">

                {/* Search Bar */}
                <div className="relative w-full lg:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MdSearch size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by reviewer, email, product ID, or comment..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                {/* Custom Rating Dropdown */}
                <div ref={ratingRef} className="relative w-full sm:w-56 lg:w-56 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
                    <MdFilterList size={20} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />
                    <button
                        type="button"
                        onClick={() => setIsRatingOpen(!isRatingOpen)}
                        className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-10 pr-10 outline-none text-sm font-medium cursor-pointer truncate"
                    >
                        {selectedRating === 'All' ? 'All Ratings' : selectedRating}
                    </button>
                    <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

                    {isRatingOpen && (
                        <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50 overflow-hidden">
                            {ratingsOptions.map(option => (
                                <li
                                    key={option}
                                    onClick={() => { setSelectedRating(option); setCurrentPage(1); setIsRatingOpen(false); }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedRating === option ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                                >
                                    {option === 'All' ? 'All Ratings' : option}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Reviews Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <table className="w-full text-left border-collapse min-w-237.5">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Reviewer</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('rating')}>
                                    <div className="flex items-center gap-1">
                                        Rating <MdSwapVert size={16} className={sortConfig.key === 'rating' ? 'text-blue-600' : 'text-slate-400'} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 w-[32%]">Comment</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('date')}>
                                    <div className="flex items-center gap-1">
                                        Date <MdSwapVert size={16} className={sortConfig.key === 'date' ? 'text-blue-600' : 'text-slate-400'} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {paginatedReviews.length > 0 ? (
                                paginatedReviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3 pt-1">
                                                <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {getInitials(review.reviewerName)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-slate-800 truncate">{review.reviewerName}</span>
                                                    <span className="text-xs text-slate-400 truncate">{review.reviewerEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide" title={getProductId(review.product)}>
                                                {getProductLabel(review.product)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            {renderStars(review.rating)}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <p className="text-slate-600 leading-relaxed line-clamp-2 pt-1" title={review.comment}>
                                                {review.comment}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            <span className="text-slate-500 font-medium whitespace-nowrap">
                                                {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pt-1">
                                                <button
                                                    onClick={() => handleView(review)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Read Full Review"
                                                >
                                                    <MdVisibility size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-16 text-slate-400 bg-slate-50/30">
                                        <div className="flex flex-col items-center justify-center">
                                            <MdSearch size={40} className="text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-500">No reviews match your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalItems > 0 && (
                    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-medium text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium text-slate-800">{totalItems}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* SLIDE-OVER REVIEW DETAILS PANEL */}
            <div className={`fixed inset-0 z-100 overflow-hidden transition-all duration-300 ${isViewModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>

                {/* Dark Backdrop */}
                <div
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isViewModalOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsViewModalOpen(false)}
                />

                {/* Right Slide-over Panel */}
                <div className={`absolute inset-y-0 right-0 w-full sm:w-112.5 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${isViewModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
                        <h2 className="text-xl font-bold text-slate-800">Review Details</h2>
                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors"
                        >
                            <MdClose size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="p-6 overflow-y-auto overflow-x-hidden flex-1">
                        {selectedReview && (
                            <div className="space-y-6">

                                {/* Customer Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shrink-0">
                                        {getInitials(selectedReview.reviewerName)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 text-lg truncate">{selectedReview.reviewerName}</p>
                                        <p className="text-sm text-slate-500 truncate">{selectedReview.reviewerEmail}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(selectedReview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Rating */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Given Rating</h3>
                                    <div className="scale-110 origin-left">
                                        {renderStars(selectedReview.rating)}
                                    </div>
                                </div>

                                {/* Comment (Uses break-words to prevent horizontal scroll) */}
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Customer Message</h3>
                                    <p className="text-slate-700 leading-relaxed wrap-break-word whitespace-pre-wrap">
                                        "{selectedReview.comment}"
                                    </p>
                                </div>

                                {/* Product Reference (Uses break-all for long IDs) */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Product Reference ID</h3>
                                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl">
                                        <p className="text-sm font-bold text-slate-700 font-mono break-all">
                                            {selectedReview.product}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default AdminReviews;