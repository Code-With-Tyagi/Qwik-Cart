import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaStar, 
  FaShoppingBag,
} from 'react-icons/fa';
import { toast, Zoom } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

import { fetchReviewsUser, deleteReview, updateReview } from '../features/review.slice.js';

const UserReviews = () => {
  const dispatch = useDispatch();
  
  // Destructure state from Redux slice
  const { reviews, loading } = useSelector((state) => state.review);
  // Get user info to display their name next to the date
  const user = useSelector((state) => state.auth?.user);

  // Local state for UI control
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ rating: 5, comment: '' });

  // Fetch logged-in user reviews on component mount
  useEffect(() => {
    dispatch(fetchReviewsUser())
      .unwrap()
      .catch((err) => {
        const errorMessage = err?.message || (typeof err === 'string' ? err : "Failed to load reviews");
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
      });
  }, [dispatch]);

  // Handle Delete Review
  const handleDelete = async (reviewId) => {
    if (!reviewId) return;
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success("Review deleted successfully", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    } catch (err) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : "Failed to delete review");
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  // Open Edit Mode
  const handleEditClick = (reviewObj) => {
    setEditingId(reviewObj._id);
    
    const commentText = typeof reviewObj.comment === 'string' 
      ? reviewObj.comment 
      : (typeof reviewObj.review === 'string' ? reviewObj.review : '');

    setEditFormData({
      rating: typeof reviewObj.rating === 'number' ? reviewObj.rating : 5,
      comment: commentText,
    });
  };

  // Handle Edit Input Changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'rating' ? Number(value) : value,
    });
  };

  // Handle Submit Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateReview({
          reviewId: editingId,
          reviewData: {
            rating: editFormData.rating,
            comment: editFormData.comment,
            review: editFormData.comment 
          },
        })
      ).unwrap();

      toast.success("Review updated successfully", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
      setEditingId(null);
      dispatch(fetchReviewsUser());
    } catch (err) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : "Failed to update review");
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  // Guard against non-array response
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-sm font-sans flex flex-col min-h-[60vh] shadow-sm">
      
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h2 className="text-[18px] font-semibold text-gray-900 tracking-wide">
          My Reviews ({safeReviews.length})
        </h2>
      </div>

      {/* Reviews List */}
      <div className="flex-1 w-full bg-white">
        {loading && safeReviews.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Loading your reviews...
          </div>
        ) : safeReviews.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No reviews submitted yet.
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {safeReviews.map((rawReview, index) => {
              const reviewObj = rawReview?.review && typeof rawReview.review === 'object' 
                ? rawReview.review 
                : rawReview;

              if (!reviewObj || typeof reviewObj !== 'object') return null;

              const itemKey = reviewObj._id || reviewObj.id || `review-item-${index}`;
              const product = typeof reviewObj.product === 'object' ? reviewObj.product : null;
              const productImage = product?.images?.[0]?.url;

              const commentDisplay = typeof reviewObj.comment === 'string'
                ? reviewObj.comment
                : (typeof reviewObj.review === 'string' ? reviewObj.review : "No comment provided.");

              // Format the date like "24 Jul, 2026"
              const formattedDate = reviewObj.createdAt 
                ? new Date(reviewObj.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  }) 
                : '';

              return (
                <div
                  key={itemKey}
                  className="flex flex-col sm:flex-row gap-6 p-6 border-b border-gray-100 hover:bg-gray-50/40 transition-colors bg-white"
                >
                  {/* Left Side - Product Image */}
                  {product && (
                    <div className="w-20 h-25 shrink-0 bg-white flex items-center justify-center p-1">
                      {productImage ? (
                        <img 
                          src={productImage} 
                          alt={product.title || "Product"} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaShoppingBag className="text-gray-200 text-3xl" />
                      )}
                    </div>
                  )}

                  {/* Right Side - Review Details spanning the remaining width */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    
                    {/* IF EDITING THIS REVIEW */}
                    {editingId === reviewObj._id ? (
                      <form onSubmit={handleUpdate} className="w-full bg-gray-50 border border-gray-200 p-5 rounded-sm">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <div className="w-full sm:w-1/4">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Rating (1-5)</label>
                            <input
                              type="number"
                              name="rating"
                              min="1" max="5" step="0.5"
                              value={editFormData.rating}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                              required
                            />
                          </div>
                          <div className="w-full sm:w-3/4">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Review</label>
                            <input
                              type="text"
                              name="comment"
                              value={editFormData.comment}
                              onChange={handleEditChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-[#2874f0] text-white font-medium text-sm rounded-sm hover:bg-[#1a5bc2] transition-colors disabled:opacity-50"
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            disabled={loading}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* VIEW MODE */
                      <div className="flex flex-col h-full">
                        
                        {/* Top Row: Title & Date aligned perfectly to edges */}
                        <div className="flex justify-between items-start gap-4 mb-2">
                          {product?.title && (
                            <h4 className="text-[15px] text-gray-500 line-clamp-1 pr-4">
                              {product.title}
                            </h4>
                          )}
                          {formattedDate && (
                            <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap shrink-0 mt-0.5">
                              {formattedDate}
                            </span>
                          )}
                        </div>

                        {/* Rating Badge & Review Snippet */}
                        <div className="flex items-center gap-3 mb-2.5">
                          <span className={`flex items-center gap-1 text-white px-1.5 py-0.5 rounded-[3px] text-[12px] font-bold tracking-wider ${
                            reviewObj.rating >= 3 ? 'bg-[#388e3c]' : reviewObj.rating >= 2 ? 'bg-[#ff9f00]' : 'bg-[#ff6161]'
                          }`}>
                            {reviewObj.rating} <FaStar size={10} />
                          </span>
                          <span className="text-[14px] font-bold text-gray-900 line-clamp-1">
                            {commentDisplay.length > 40 ? `${commentDisplay.substring(0, 40)}...` : commentDisplay}
                          </span>
                        </div>
                        
                        {/* Full Comment Text */}
                        <p className="text-[14px] text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed max-w-4xl">
                          {commentDisplay}
                        </p>

                        {/* Bottom Row: User Name (Left) & Actions (Right) */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                          <span className="text-[12px] text-gray-400 font-medium">
                            {user?.name || "Your Review"}
                          </span>
                          
                          <div className="flex items-center gap-5">
                            <button
                              onClick={() => handleEditClick(reviewObj)}
                              className="text-[#2874f0] hover:text-[#1a5bc2] font-semibold text-[14px] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(reviewObj._id)}
                              className="text-[#2874f0] hover:text-[#1a5bc2] font-semibold text-[14px] transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews;