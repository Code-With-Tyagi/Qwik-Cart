import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/product.slice';
import { updateReview, deleteReview } from '../features/review.slice';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const ProductReviews = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(state => state.auth.user);
    const userId = user?._id || '';
    const isLoggedIn = !!user;

    const { selectedProduct: product, loading, error } = useSelector(state => state.product);
    
    // Debug: Log user info
    useEffect(() => {
        console.log('Current User ID:', userId);
        if (product?.reviews && product.reviews.length > 0) {
            console.log('First review user data:', product.reviews[0].user);
        }
    }, [userId, product]);
    
    // State to manage how many reviews are visible
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(10);
    const [isEditingReviewId, setIsEditingReviewId] = useState(null);
    const [editFormData, setEditFormData] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!product || product._id !== id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id, product]);

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'bg-[#16a34a]'; // Standard Green
        if (rating === 3) return 'bg-[#eab308]'; // Standard Yellow
        if (rating === 2) return 'bg-[#f97316]'; // Standard Orange
        return 'bg-[#ef4444]'; // Standard Red
    };

    const handleLoadMore = () => {
        setVisibleReviewsCount(prevCount => prevCount + 10);
    };

    const handleEditClick = (review) => {
        setIsEditingReviewId(review._id);
        setEditFormData({ rating: review.rating, comment: review.comment });
    };

    const handleEditCancel = () => {
        setIsEditingReviewId(null);
        setEditFormData({ rating: 5, comment: '' });
    };

    const handleEditSave = async (reviewId) => {
        try {
            await dispatch(updateReview({
                reviewId,
                reviewData: editFormData
            }));
            alert("Review updated successfully!");
            setIsEditingReviewId(null);
            setEditFormData({ rating: 5, comment: '' });
            dispatch(fetchProductById(id));
        } catch (error) {
            alert("Failed to update review: " + (error?.message || "Unknown error"));
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await dispatch(deleteReview(reviewId));
                alert("Review deleted successfully!");
                dispatch(fetchProductById(id));
            } catch (error) {
                alert("Failed to delete review: " + (error?.message || "Unknown error"));
            }
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-4 h-64 bg-gray-200 rounded-lg"></div>
                    <div className="md:col-span-8 space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg w-full"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-6 bg-white border border-red-200 text-center rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Could not load reviews</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate(`/product/${id}`)}
                    className="bg-gray-900 text-white px-6 py-2 rounded font-medium hover:bg-gray-800 transition-colors"
                >
                    Return to Product
                </button>
            </div>
        );
    }

    if (!product) return null;

    const totalReviews = product.reviews?.length || 0;
    const averageRating = totalReviews > 0 
        ? (product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews).toFixed(1) 
        : 0;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (totalReviews > 0) {
        product.reviews.forEach(review => {
            const r = Math.round(review.rating || 0);
            if (ratingCounts[r] !== undefined) {
                ratingCounts[r]++;
            }
        });
    }

    const maxRatingCount = Math.max(...Object.values(ratingCounts));
    const productThumbnail = product.images && product.images.length > 0 ? product.images[0]?.url : "/Q.png";

    // Sort reviews: user's reviews first, then others
    const sortedReviews = product.reviews ? [...product.reviews].sort((a, b) => {
        const aIsUser = (a.user?._id || a.user || '').toString() === userId.toString();
        const bIsUser = (b.user?._id || b.user || '').toString() === userId.toString();
        if (aIsUser && !bIsUser) return -1;
        if (!aIsUser && bIsUser) return 1;
        return 0;
    }) : [];

    // Slice the reviews array based on the visible count
    const displayedReviews = sortedReviews ? sortedReviews.slice(0, visibleReviewsCount) : [];

    return (
        <div className="bg-[#f8f9fa] min-h-screen py-8 text-gray-800 font-sans">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Summary & Rating Breakdown */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Product Info Card */}
                        <div className="bg-white p-5 border border-gray-200 rounded-lg">
                            <div className="flex gap-4 items-center">
                                <div 
                                    className="w-16 h-16 shrink-0 bg-white border border-gray-100 rounded flex items-center justify-center p-1 cursor-pointer"
                                    onClick={() => navigate(`/product/${id}`)}
                                >
                                    <img src={productThumbnail} alt={product.title} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 
                                        className="text-sm font-medium text-gray-900 truncate mb-1 cursor-pointer hover:text-blue-600 transition-colors" 
                                        title={product.title}
                                        onClick={() => navigate(`/product/${id}`)}
                                    >
                                        {product.title}
                                    </h3>
                                    <div className="text-lg font-bold text-gray-900">${product.price}</div>
                                </div>
                            </div>
                        </div>

                        {/* Rating Statistics Card */}
                        <div className="bg-white p-6 border border-gray-200 rounded-lg">
                            <h4 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                                Customer Reviews
                            </h4>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-4xl font-bold text-gray-900">
                                    {averageRating}
                                </div>
                                <div>
                                    <div className="flex text-green-600 text-lg mb-0.5">
                                        {'★'.repeat(Math.round(averageRating))}<span className="text-gray-300">{'★'.repeat(5 - Math.round(averageRating))}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">{totalReviews} global ratings</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingCounts[star] || 0;
                                    const widthPercent = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;
                                    
                                    return (
                                        <div key={star} className="flex items-center gap-3 text-sm">
                                            <div className="w-10 text-gray-600 hover:text-green-600 cursor-pointer font-medium">
                                                {star} star
                                            </div>
                                            <div className="flex-1 h-3 bg-gray-200 rounded-sm overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-600 rounded-sm" 
                                                    style={{ width: `${widthPercent}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-10 text-right text-gray-500">
                                                {widthPercent > 0 ? Math.round((count / totalReviews) * 100) : 0}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Reviews Feed */}
                    <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900">Top reviews from {totalReviews > 0 ? "customers" : "the web"}</h2>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {displayedReviews.length > 0 ? (
                                displayedReviews.map((review, index) => {
                                    const ratingNum = Math.round(review.rating || 0);
                                    const reviewerInitial = review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "U";
                                    const formattedDate = new Date(review.date || review.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                                    
                                    // Fix: Handle different user data structures
                                    const reviewUserId = review.user?._id || review.user || '';
                                    const isOwnReview = isLoggedIn && userId && reviewUserId && (
                                        reviewUserId.toString() === userId.toString()
                                    );
                                    const isEditingThisReview = isEditingReviewId === review._id;
                                    
                                    // Debug log
                                    if (index === 0) {
                                        console.log('Review comparison:', {
                                            reviewUserId: reviewUserId.toString(),
                                            userId: userId.toString(),
                                            isOwnReview,
                                            isLoggedIn
                                        });
                                    }
                                    
                                    return (
                                        <div key={review._id || index} className="p-6">
                                            
                                            {/* User Profile Row */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold text-sm">
                                                        {reviewerInitial}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {review.reviewerName || "Unknown User"}
                                                    </span>
                                                </div>
                                                
                                                {/* Action Buttons: Update and Delete (Only for own reviews) */}
                                                {isOwnReview && !isEditingThisReview && (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleEditClick(review)}
                                                            className="flex items-center gap-1 text-[12px] font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="Edit Review"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review._id)}
                                                            className="flex items-center gap-1 text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                                            title="Delete Review"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Edit Form */}
                                            {isEditingThisReview ? (
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                                        <div className="flex items-center gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setEditFormData(prev => ({ ...prev, rating: star }))}
                                                                    className="focus:outline-none cursor-pointer"
                                                                >
                                                                    <svg
                                                                        className={`w-6 h-6 ${star <= editFormData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                        fill="currentColor"
                                                                        viewBox="0 0 20 20"
                                                                    >
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                                        <textarea
                                                            value={editFormData.comment}
                                                            onChange={(e) => setEditFormData(prev => ({ ...prev, comment: e.target.value }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                            rows="3"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditSave(review._id)}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleEditCancel}
                                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-400 transition-colors cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Rating and Title Row */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-white text-[11px] font-bold ${getRatingColor(ratingNum)}`}>
                                                            <span>{ratingNum}</span>
                                                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">Verified Purchase</span>
                                                    </div>

                                                    {/* Date */}
                                                    <div className="text-xs text-gray-500 mb-3">
                                                        Reviewed on {formattedDate}
                                                    </div>
                                                    
                                                    {/* Comment */}
                                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                        {review.comment}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center">
                                    <h3 className="text-base font-medium text-gray-900 mb-1">No reviews yet</h3>
                                    <p className="text-gray-500 text-sm">There are no customer reviews for this product yet.</p>
                                </div>
                            )}
                        </div>
                        
                        {/* View More Button */}
                        {visibleReviewsCount < sortedReviews.length && (
                            <div className="border-t border-gray-200">
                                <button
                                    onClick={handleLoadMore}
                                    className="w-full py-4 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    View More Reviews
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductReviews;