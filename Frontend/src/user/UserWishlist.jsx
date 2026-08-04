import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FaHeartBroken,
  FaSpinner,
  FaShoppingCart,
  FaTrashAlt
} from 'react-icons/fa';
import { toast, Zoom } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

// IMPORTANT: Adjust these paths to match your folder structure
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  moveOneToCart,
  moveAllToCart
} from '../features/wishlist.slice.js';
import { getCart } from '../features/cart.slice.js';

const UserWishlist = () => {
  const dispatch = useDispatch();

  const { wishlist, loading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist())
      .unwrap()
      .catch((err) => {
        const errorMsg = err?.message || err;
        if (errorMsg === "Wishlist is empty." || errorMsg === "Wishlist not found.") {
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 1000,
            theme: "dark",
            transition: Zoom,
          });
        } else if (errorMsg) {
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 1000,
            theme: "dark",
            transition: Zoom,
          });
        }
      });
  }, [dispatch]);

  const handleRemove = async (productId) => {
    try {
      const res = await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success(res?.message || "Item removed from wishlist", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
      dispatch(fetchWishlist());
    } catch (err) {
      toast.error(err?.message || err || "Failed to remove item", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      const res = await dispatch(moveOneToCart(productId)).unwrap();
      toast.success(res?.message || "Item moved to cart successfully", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
      dispatch(getCart());
      dispatch(fetchWishlist());
    } catch (err) {
      toast.error(err?.message || err || "Failed to move item to cart", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const handleClearWishlist = async () => {
      try {
        const res = await dispatch(clearWishlist()).unwrap();
        toast.success(res?.message || "Wishlist cleared", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
        dispatch(fetchWishlist());
      } catch (err) {
        toast.error(err?.message || err || "Failed to clear wishlist", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
      }
    
  };

  const handleMoveAllToCart = async () => {
    try {
      const res = await dispatch(moveAllToCart()).unwrap();
      toast.success(res?.message || "All items moved to cart", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
      dispatch(getCart());
      dispatch(fetchWishlist());
    } catch (err) {
      toast.error(err?.message || err || "Failed to move items to cart", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const safeWishlist = wishlist?.items ? wishlist.items : (Array.isArray(wishlist) ? wishlist : []);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-sm font-sans min-h-[60vh] flex flex-col">

      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <h2 className="text-[18px] font-semibold text-gray-900 tracking-wide">
          My Wishlist ({safeWishlist.length})
        </h2>

        {/* Bulk Actions */}
        {safeWishlist.length > 0 && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearWishlist}
              disabled={loading}
              className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={handleMoveAllToCart}
              disabled={loading}
              className="px-4 py-2 bg-[#ff9f00] hover:bg-[#f39800] text-white font-semibold text-sm rounded-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <FaShoppingCart size={14} /> Move All to Cart
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="w-full bg-white flex-1">
        {/* Loading State */}
        {loading && safeWishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner size={32} className="text-[#2874f0] animate-spin mb-4" />
            <h4 className="text-base font-medium text-gray-600">Loading your wishlist...</h4>
          </div>
        ) : safeWishlist.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 px-4 flex flex-col items-center justify-center">
            <FaHeartBroken size={48} className="text-gray-300 mb-6" />
            <h4 className="text-[18px] font-semibold text-gray-900 mb-2">Empty Wishlist</h4>
            <p className="text-sm text-gray-500 max-w-md mb-8">
              You have no items in your wishlist. Start adding items you want to buy later!
            </p>
            <Link
              to="/shop"
              className="px-8 py-3 bg-[#2874f0] hover:bg-[#1a5bc2] text-white font-medium text-sm rounded-xs transition-colors shadow-sm"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col w-full">
            {safeWishlist.map((item) => {
              const product = item?.product || {};
              const productId = product._id || product;
              const title = product.title || "Unknown Product";
              const price = product.price || 0;
              const discountPercentage = product.discountPercentage || 0;

              // Calculate original price based on current price and discount
              const originalPrice = discountPercentage
                ? (price / (1 - discountPercentage / 100)).toFixed(2)
                : null;

              const image = product.images?.[0]?.url || "https://placehold.co/200x200/f8fafc/94a3b8?text=No+Image";
              
              // FIX: Only mark as out of stock if stock is strictly explicitly 0.
              // If it's undefined during loading, it will default to true and stop the flicker.
              const inStock = product.stock === undefined || product.stock === null ? true : product.stock > 0;

              return (
                <div
                  key={productId}
                  className="relative flex flex-col sm:flex-row items-start px-6 py-8 border-b border-gray-200 hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] transition-shadow duration-200 bg-white group"
                >
                  {/* Image Left Side */}
                  <Link to={`/product/${productId}`} className="w-full sm:w-30 h-30 shrink-0 flex items-center justify-center mb-4 sm:mb-0 relative">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-contain"
                    />
                    {!inStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-red-100 text-red-600 rounded-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Details Middle Side */}
                  <div className="flex-1 sm:ml-8 flex flex-col">

                    {/* Title */}
                    <Link to={`/product/${productId}`}>
                      <h4 className="text-[16px] text-[#2874f0] hover:text-[#1a5bc2] font-medium line-clamp-2 pr-10">
                        {title}
                      </h4>
                    </Link>

                    {/* Pricing Row */}
                    <div className="flex items-baseline gap-3 mt-3">
                      <span className="text-[28px] font-semibold text-gray-900 leading-none">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {originalPrice && (
                        <span className="text-[14px] font-normal text-gray-500 line-through">
                          ₹{Number(originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                      {discountPercentage > 0 && (
                        <span className="text-[14px] font-semibold text-[#388e3c]">
                          {discountPercentage}% off
                        </span>
                      )}
                    </div>

                    {/* Move to Cart Action */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => handleMoveToCart(productId)}
                        disabled={!inStock || loading}
                        className={`text-sm font-semibold flex items-center gap-1.5 ${inStock ? "text-[#2874f0] cursor-pointer" : "text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <FaShoppingCart size={12} />
                        {inStock ? "MOVE TO CART" : "OUT OF STOCK"}
                      </button>
                    </div>
                  </div>

                  {/* Delete Button Right Side */}
                  <button
                    onClick={() => handleRemove(productId)}
                    disabled={loading}
                    className="absolute top-8 right-6 text-gray-300 hover:text-red-500 transition-colors cursor-pointer p-2"
                    title="Remove from wishlist"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWishlist;