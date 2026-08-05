import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/product.slice';
import ProductSpecifications from '../components/common/ProductSpecifications';
import { FiEdit, FiTrash2, FiHeart } from "react-icons/fi";
import { createReview, updateReview, deleteReview } from '../features/review.slice';
import { addCartApi } from '../features/cart.slice';
import { toast, Zoom } from 'react-toastify';
import { addToWishlist, removeFromWishlist } from '../features/wishlist.slice';

const ProductDescription = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hasValidProductId = Boolean(id && id !== "undefined" && id !== "null");

    // Get auth user and login status
    const user = useSelector(state => state.auth.user);
    const reviewerName = user?.name || user?.userName || '';
    const userId = user?._id || '';
    const userEmail = user?.userEmail;
    const isLoggedIn = !!user;

    const { selectedProduct: product, loading, error } = useSelector(state => state.product);
    const wishlistItems = useSelector(state => state.wishlist.wishlist);
    const [mainImage, setMainImage] = useState("");
    const [quantity, setQuantity] = useState(1);

    // UI states
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    // Debug: Log user info
    useEffect(() => {
        if (product?.reviews && product.reviews.length > 0) {
            console.log('First review user data:', product.reviews[0].user);
        }
    }, [userId, product]);

    // Review Form states
    const [reviewForm, setReviewForm] = useState({
        reviewerName: reviewerName,
        rating: 5,
        comment: ''
    });
    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

    // Scroll to the top of the page when the component mounts or ID changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!hasValidProductId) {
            navigate('/shop', { replace: true });
            return;
        }

        dispatch(fetchProductById(id));
    }, [dispatch, hasValidProductId, id, navigate]);

    // Keep review form name in sync with logged-in user info
    useEffect(() => {
        if (isLoggedIn) {
            setReviewForm(prev => ({ ...prev, reviewerName: reviewerName }));
        }
    }, [reviewerName, isLoggedIn]);

    // Safely handle populated images array
    useEffect(() => {
        if (product?.images && product.images.length > 0) {
            setMainImage(product.images[0]?.url || "/Q.png");
        } else {
            setMainImage("/Q.png"); // Fallback
        }
    }, [product]);

    const isWishlisted = Boolean(
        product?._id &&
        Array.isArray(wishlistItems) &&
        wishlistItems.some((item) => {
            const wishlistProductId = item?.product?._id || item?.product;
            return wishlistProductId?.toString?.() === product._id.toString();
        })
    );

    // Handlers
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    const increaseQuantity = () => setQuantity(prev => (prev < (product?.stock || 99) ? prev + 1 : prev));

    const handleAddToCart = (productInfo) => {
        // --- ADDED: Check if user is logged in before adding to cart ---
        if (!isLoggedIn) {
            toast.error('Please sign in to add product in cart', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Zoom,
            });
            navigate("/login");
            return;
        }

        const { productId, price } = productInfo;
        const payload = {
            product: productId,
            quantity: quantity,
            price: price,
        }
        setIsCartAnimating(true);
        dispatch(addCartApi(payload));
        toast.success('Product added to cart', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Zoom,
        });
    };

    const toggleWishlist = async (productId) => {
        // --- ADDED: Check if user is logged in before adding to wishlist ---
        if (!isLoggedIn) {
            toast.error('Please sign in to add product in wishlist', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Zoom,
            });
            navigate("/login");
            return;
        }

        try {
            if (!isWishlisted) {
                const payload = {
                    item: [
                        {
                            product: productId,
                        },
                    ],
                };

                const response = await dispatch(addToWishlist(payload)).unwrap();

                toast.success(response.message, {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    transition: Zoom,
                });
            } else {
                const response = await dispatch(removeFromWishlist(productId)).unwrap();

                toast.success(response.message, {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    transition: Zoom,
                });
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong.", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Zoom,
            });
        }
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReviewForm(prev => ({ ...prev, [name]: value }));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        // Login check guard clause
        if (!isLoggedIn) {
            toast.error('You must be logged in to post a review!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Zoom,
            });
            navigate("/login");
            return;
        }

        setIsReviewSubmitting(true);

        try {
            if (isEditMode && editingReviewId) {
                // Update review
                await dispatch(updateReview({
                    reviewId: editingReviewId,
                    reviewData: {
                        rating: reviewForm.rating,
                        comment: reviewForm.comment
                    }
                }));
                toast.success('Review updated successfully', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Zoom,
                });
                setIsEditMode(false);
                setEditingReviewId(null);
            } else {
                // Create new review
                const reviewData = { ...reviewForm, productId: id };
                await dispatch(createReview(reviewData));
                toast.success('Review submitted successfully', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Zoom,
                });
            }

            setReviewForm({ reviewerName: isLoggedIn ? reviewerName : '', rating: 5, comment: '' });
            setIsReviewFormOpen(false);
            dispatch(fetchProductById(id));
        } catch (error) {
            alert("Failed to submit review: " + (error?.message || "Unknown error"));
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id);
        setReviewForm({
            reviewerName: review.reviewerName,
            rating: review.rating,
            comment: review.comment
        });
        setIsEditMode(true);
        setIsReviewFormOpen(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await dispatch(deleteReview(reviewId));
                toast.error('Review deleted successfully', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Zoom,
                }); dispatch(fetchProductById(id));
            } catch (error) {
                toast.error('Failed to delete review', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Zoom,
                });
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditingReviewId(null);
        setIsReviewFormOpen(false);
        setReviewForm({ reviewerName: reviewerName, rating: 5, comment: '' });
    };

    // Helper for Flipkart specific rating colors
    const getRatingColor = (rating) => {
        if (rating >= 3) return 'bg-[#388e3c]'; // Green
        if (rating === 2) return 'bg-[#ff9f00]'; // Orange/Yellow
        return 'bg-[#ff6161]'; // Red
    };

    // 1. Ultra-Premium Skeleton Loader
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16">
                    <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-6">
                        <div className="flex lg:flex-col gap-4 overflow-hidden">
                            {[1, 2, 3].map(i => <div key={i} className="w-20 h-24 bg-gray-100 rounded-2xl shrink-0"></div>)}
                        </div>
                        <div className="flex-1 aspect-4/5 sm:aspect-square lg:aspect-4/5 bg-gray-100 rounded-3xl"></div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="h-4 w-32 bg-gray-200 rounded-full mb-6"></div>
                        <div className="h-12 w-full bg-gray-200 rounded-xl mb-4"></div>
                        <div className="h-12 w-3/4 bg-gray-200 rounded-xl mb-8"></div>
                        <div className="h-10 w-1/3 bg-gray-200 rounded-lg mb-10"></div>
                        <div className="space-y-4 mb-12">
                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                            <div className="h-4 w-4/5 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-16 w-full bg-gray-200 rounded-full mt-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-6">
                <div className="bg-red-50/50 text-red-800 p-10 rounded-3xl border border-red-100 max-w-lg w-full text-center shadow-sm">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold mb-3 tracking-tight">Product Unavailable</h2>
                    <p className="text-red-600/80 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/shop')}
                        className="bg-red-600 text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-wide hover:bg-red-700 transition-all shadow-md shadow-red-500/20 cursor-pointer"
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    // 3. Fallback
    if (!product) return null;

    // Calculate discounted price safely
    const originalPrice = product.discountPercentage
        ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
        : null;

    // --- REVIEW ANALYTICS CALCULATIONS ---
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

    // Sort reviews: user's reviews first, then others
    const sortedReviews = product.reviews ? [...product.reviews].sort((a, b) => {
        const aIsUser = (a.user?._id || a.user || '').toString() === userId.toString();
        const bIsUser = (b.user?._id || b.user || '').toString() === userId.toString();
        if (aIsUser && !bIsUser) return -1;
        if (!aIsUser && bIsUser) return 1;
        return 0;
    }) : [];

    // 4. Render
    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

                {/* --- TOP SECTION: PRODUCT DETAILS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-16 xl:gap-x-20">

                    {/* LEFT COLUMN: Pro Image Gallery */}
                    <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 lg:gap-6 lg:h-150">

                        {/* Fixed Thumbnails (Populated Array Safe) */}
                        {product.images && product.images.length > 0 && (
                            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 lg:w-24 scrollbar-hide shrink-0">
                                {product.images.map((img, index) => (
                                    <button
                                        key={img._id || index}
                                        onClick={() => setMainImage(img.url)}
                                        className={`relative w-20 h-24 lg:w-full lg:h-28 rounded-2xl shrink-0 transition-all duration-200 p-1 cursor-pointer outline-none ${mainImage === img.url
                                            ? 'border-2 border-gray-900 opacity-100'
                                            : 'border-2 border-transparent opacity-70 hover:opacity-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                                            <img src={img.url} alt={`View ${index + 1}`} className="w-full h-full object-cover mix-blend-multiply" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Big Image */}
                        <div className="flex-1 w-full h-full bg-[#f8f9fa] rounded-3xl border border-gray-100 overflow-hidden flex items-center justify-center p-8 sm:p-12 relative group">
                            <div className="absolute top-6 left-6 bg-[#388e3c] text-white px-3 py-1 rounded-sm shadow-sm z-10">
                                <span className="text-xs font-bold tracking-wider">
                                    {product.discountPercentage > 0 ? `${product.discountPercentage}% OFF` : 'HOT DEAL'}
                                </span>
                            </div>

                            <img
                                src={mainImage}
                                alt={product.title}
                                className="w-full h-full object-contain drop-shadow-xl transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Product Info */}
                    <div className="lg:col-span-5 flex flex-col lg:py-6">

                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                {product.category || "Premium"}
                            </span>
                        </div>

                        <h1 className="text-[2rem] sm:text-4xl leading-tight font-medium text-[#212121] mb-4">
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-2 mb-6">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold ${getRatingColor(Math.round(averageRating))}`}>
                                <span>{averageRating}</span>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            <span className="text-sm text-[#878787] font-medium cursor-pointer hover:text-blue-600">
                                {totalReviews} Ratings & {totalReviews} Reviews
                            </span>
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-3xl font-semibold text-[#212121]">
                                ₹{product.price}
                            </span>
                            {originalPrice && (
                                <span className="text-base text-[#878787] line-through mb-1">
                                    ₹{originalPrice}
                                </span>
                            )}
                            {product.discountPercentage > 0 && (
                                <span className="text-base font-semibold text-[#388e3c] mb-1">
                                    {product.discountPercentage}% off
                                </span>
                            )}
                        </div>

                        <div className="mb-8">
                            <p className="text-sm text-[#212121] leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="mt-auto">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm h-10 p-1">
                                    <button onClick={decreaseQuantity} className="w-8 h-full flex items-center justify-center text-[#212121] hover:bg-gray-100 transition-colors cursor-pointer font-bold">
                                        -
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold text-[#212121] border-l border-r border-gray-200">{quantity}</span>
                                    <button onClick={increaseQuantity} className="w-8 h-full flex items-center justify-center text-[#212121] hover:bg-gray-100 transition-colors cursor-pointer font-bold">
                                        +
                                    </button>
                                </div>

                                <p className={`text-sm font-semibold flex items-center gap-1.5 cursor-default ${product.stock > 0 ? "text-[#388e3c]" : "text-[#ff6161]"}`}>
                                    {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        handleAddToCart({
                                            productId: `${product._id}`,
                                            price: product.price
                                        })
                                    }}
                                    disabled={product.stock === 0}
                                    className={`flex-1 flex items-center justify-center gap-2 bg-[#ff9f00] text-white py-3.5 sm:py-3 rounded shadow-md text-base font-semibold transition-all duration-200 hover:bg-[#f39800] focus:outline-none cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed ${isCartAnimating ? "scale-95" : "scale-100"}`}
                                >
                                    <svg className="w-6 h-6 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    ADD TO CART
                                </button>

                                <button
                                    onClick={() => toggleWishlist(product._id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-3 rounded shadow-md text-base font-semibold transition-all duration-200 border focus:outline-none cursor-pointer active:scale-95 ${isWishlisted
                                        ? "bg-white border-gray-300 text-[#ff4343]"
                                        : "bg-white border-gray-300 text-[#212121] hover:bg-gray-50"
                                        }`}
                                >
                                    <FiHeart className={`w-6 h-6 lg:w-5 lg:h-5 transition-all duration-300 ${isWishlisted ? "fill-current" : ""}`} />
                                    {isWishlisted ? "WISHLISTED" : "ADD TO WISHLIST"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MIDDLE SECTION: PRODUCT SPECIFICATIONS --- */}
                <div className="mt-8">
                    <ProductSpecifications product={product} />
                </div>

                {/* --- BOTTOM SECTION: FLIPKART STYLE REVIEWS --- */}
                <div className="mt-8 border border-gray-200 rounded-sm bg-white shadow-sm w-full">

                    {/* Header Row */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 w-full">
                        <h2 className="text-2xl font-semibold text-[#212121]">Ratings & Reviews</h2>
                        <button
                            onClick={() => isEditMode ? handleCancelEdit() : setIsReviewFormOpen(!isReviewFormOpen)}
                            className="bg-white border shadow-sm border-gray-300 text-[#2874f0] font-semibold px-6 py-2 rounded-sm hover:shadow transition-shadow cursor-pointer"
                        >
                            {isReviewFormOpen ? "Cancel Review" : "Rate Product"}
                        </button>
                    </div>

                    {/* Expandable Review Form */}
                    {isReviewFormOpen && (
                        <div className="bg-[#f9f9f9] p-6 border-b border-gray-200 w-full">
                            <h3 className="text-lg font-medium text-[#212121] mb-4">{isEditMode ? 'Edit Review' : 'Write Review'}</h3>
                            <form onSubmit={handleReviewSubmit} className="max-w-2xl">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[#878787] mb-2">Rating</label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                className="focus:outline-none cursor-pointer"
                                            >
                                                <svg
                                                    className={`w-8 h-8 ${star <= (reviewForm?.rating || 0) ? 'text-[#ff9f00]' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-[#878787] mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="reviewerName"
                                        value={reviewForm?.reviewerName || ''}
                                        onChange={handleReviewChange}
                                        required
                                        disabled={isLoggedIn}
                                        className={`w-full bg-white px-3 py-2 rounded-sm border border-gray-300 focus:outline-none focus:border-[#2874f0] transition-colors ${isLoggedIn ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                            }`}
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-[#878787] mb-2">Description</label>
                                    <textarea
                                        name="comment"
                                        value={reviewForm?.comment || ''}
                                        onChange={handleReviewChange}
                                        required
                                        rows="3"
                                        className="w-full bg-white px-3 py-2 rounded-sm border border-gray-300 focus:outline-none focus:border-[#2874f0] resize-none transition-colors"
                                        placeholder="Description"
                                    ></textarea>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={isReviewSubmitting}
                                        className="bg-[#fb641b] text-white font-semibold py-2.5 px-8 rounded-sm shadow-sm hover:bg-[#f35300] transition-colors focus:outline-none disabled:bg-gray-400 cursor-pointer"
                                    >
                                        {isReviewSubmitting ? (isEditMode ? 'UPDATING...' : 'SUBMITTING...') : (isEditMode ? 'UPDATE' : 'SUBMIT')}
                                    </button>
                                    {isEditMode && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="bg-gray-300 text-[#212121] font-semibold py-2.5 px-8 rounded-sm shadow-sm hover:bg-gray-400 transition-colors focus:outline-none cursor-pointer"
                                        >
                                            CANCEL
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Analytics Row */}
                    <div className="flex flex-col md:flex-row items-center border-b border-gray-200 p-6 md:p-8 w-full gap-8 md:gap-16">

                        {/* Overall Big Score */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                            <div className="text-[2.5rem] md:text-5xl flex items-center gap-2 font-medium text-[#212121]">
                                {averageRating}
                                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#212121]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <div className="text-sm text-[#878787] mt-2 font-medium text-center">
                                {totalReviews} Ratings &<br />{totalReviews} Reviews
                            </div>
                        </div>

                        {/* Visual Progress Bars */}
                        <div className="flex flex-col w-full max-w-md gap-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingCounts[star] || 0;
                                const widthPercent = maxRatingCount > 0 ? (count / maxRatingCount) * 100 : 0;

                                // Color logic for the bars
                                let barColor = "bg-[#388e3c]"; // Green
                                if (star === 2) barColor = "bg-[#ff9f00]"; // Yellow
                                if (star === 1) barColor = "bg-[#ff6161]"; // Red

                                return (
                                    <div key={star} className="flex items-center w-full gap-3 text-xs md:text-sm">
                                        <div className="flex items-center gap-1 w-8 font-medium text-[#212121]">
                                            {star} <svg className="w-3 h-3 text-[#878787]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </div>
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${barColor} rounded-full`}
                                                style={{ width: `${widthPercent}%` }}
                                            ></div>
                                        </div>
                                        {/* Total Raw Count */}
                                        <div className="w-10 text-right font-medium text-[#878787]">
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* The Reviews List (Limited to 5 items) */}
                    <div className="w-full">
                        {sortedReviews && sortedReviews.length > 0 ? (
                            <div>
                                {/* Always slice at 5 */}
                                {sortedReviews.slice(0, 5).map((review, index) => {
                                    const ratingNum = Math.round(review.rating || 0);

                                    // Fix: Handle different user data structures
                                    const reviewUserId = review.user?._id || review.user || '';
                                    const isOwnReview = isLoggedIn && userId && reviewUserId && (
                                        reviewUserId.toString() === userId.toString()
                                    );

                                    return (
                                        <div key={review._id || index} className="p-6 border-b border-gray-100 hover:bg-gray-50/50 transition-colors w-full">

                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                {/* Rating Badge */}
                                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[11px] font-bold ${getRatingColor(ratingNum)}`}>
                                                    <span>{ratingNum}</span>
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>

                                                {/* Action Buttons: Update and Delete (Only for own reviews) */}
                                                {isOwnReview && (
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleEditReview(review)}
                                                            className="flex items-center gap-1.5 text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="Edit Review"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review._id)}
                                                            className="flex items-center gap-1.5 text-[13px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                                            title="Delete Review"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Comment */}
                                            <p className="text-[14px] text-[#212121] leading-relaxed mb-4">
                                                {review.comment}
                                            </p>

                                            {/* Footer: User, Date */}
                                            <div className="flex items-center justify-between text-[12px] font-medium text-[#878787]">
                                                <div className="flex items-center gap-3">
                                                    <span>{review.reviewerName || "Anonymous"}</span>
                                                    <span className="w-1 h-1 bg-[#878787] rounded-full"></span>
                                                    <span>
                                                        {new Date(review.date || review.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Redirect to All Reviews Button */}
                                {sortedReviews.length > 5 && (
                                    <div className="w-full flex justify-start p-6 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/product/${id}/reviews`)}
                                            className="text-[#2874f0] font-semibold text-[15px] hover:underline focus:outline-none cursor-pointer"
                                        >
                                            View More Reviews
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full p-10 text-center">
                                <p className="text-[#878787] text-sm">No reviews yet. Be the first to share your experience!</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDescription;