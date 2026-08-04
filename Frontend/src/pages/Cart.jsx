import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, Zoom } from 'react-toastify';
import {
    FaPlus,
    FaMinus,
    FaShieldAlt,
    FaStar
} from "react-icons/fa";
import { getCart, removeCart, updateCartQuantity } from '../features/cart.slice';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Local state to prevent spam-clicking and race conditions
    const [updatingId, setUpdatingId] = useState(null);

    // Fetch fresh cart information on page load
    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);

    // Safely pull cart items from Redux state 
    const cartItems = useSelector((state) => state.cart.cartItems || []);

    // Scroll Restoration Fix
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        const scrollTimeout = setTimeout(() => window.scrollTo(0, 0), 0);

        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
            clearTimeout(scrollTimeout);
        };
    }, []);

    // Common toast configuration to keep code DRY
    const toastConfig = {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Zoom,
    };

    // Handlers mapped to nested data properties
    const handleQuantityChange = async (id, currentQty, delta) => {
        const newQty = currentQty + delta;

        if (newQty < 1) return;

        try {
            const response = await dispatch(
                updateCartQuantity({
                    quantity: newQty,
                    productId: id,
                })
            ).unwrap();

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

        } catch (error) {
            toast.error(error.message, {
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

    const handleRemoveItem = async (id) => {
        if (!id) return;
        try {
            setUpdatingId(id);
            const response = await dispatch(removeCart(id)).unwrap();

            const successMessage = response?.message || response?.data?.message || "Item removed";
            toast.success(successMessage, toastConfig);

        } catch (error) {
            const errorMessage = error?.data?.message || error?.message || (typeof error === 'string' ? error : "Failed to remove item");
            toast.error(errorMessage, toastConfig);
        } finally {
            setUpdatingId(null);
        }
    };

    // Pre-Checkout Stock Validator
    const handlePlaceOrder = () => {
        const outOfStockItems = cartItems.filter(item => {
            const availableStock = item.product?.stock || 0;
            return availableStock < item.quantity;
        });

        if (outOfStockItems.length > 0) {

            toast.error("Some items are out of stock.", {
                ...toastConfig,
                autoClose: 1000,
            });
            return;
        }

        navigate("/checkout");
    };

    // Financial calculations
    const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const totalOriginal = cartItems.reduce((acc, item) => {
        const discount = item.product?.discountPercentage || 0;
        const originalPrice = discount > 0 ? (item.price / (1 - discount / 100)) : item.price;
        return acc + (originalPrice * item.quantity);
    }, 0);

    const totalSavings = totalOriginal - subtotal;
    const shippingCharge = subtotal >= 5000 || subtotal === 0 ? 0 : 99;
    const finalTotal = subtotal + shippingCharge;

    // E-commerce Empty State
    if (cartItems.length === 0) {
        return (
            <div className="bg-[#f1f3f6] min-h-screen font-sans text-gray-800 flex items-start justify-center pt-8 px-4">
                <div className="w-full max-w-5xl bg-white rounded-sm shadow-sm p-10 flex flex-col items-center text-center">
                    <img
                        src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90"
                        alt="Empty Cart"
                        className="w-56 mb-6 opacity-80"
                    />
                    <h2 className="text-xl font-medium text-gray-800 mb-2">Missing Cart items?</h2>
                    <p className="text-gray-500 text-sm mb-6">Login to see the items you added previously</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#fb641b] text-white px-16 py-2.5 rounded-xs text-sm font-medium shadow-sm hover:bg-[#f05a13] transition-colors cursor-pointer"
                    >
                        Shop Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f1f3f6] min-h-screen font-sans text-[#212121] antialiased pb-10">
            <main className="max-w-300 mx-auto px-2 sm:px-4 pt-6">

                {/* Main Split Grid Layout */}
                <div className="flex flex-col lg:flex-row gap-4 items-start">

                    {/* LEFT COLUMN: CART ITEMS */}
                    <div className="w-full lg:w-[68%] flex flex-col gap-4">

                        {/* Cart Header */}
                        <div className="bg-white rounded-sm shadow-sm flex items-center p-4">
                            <h1 className="text-lg font-medium">My Cart ({totalItems})</h1>
                        </div>

                        {/* Items Container */}
                        <div className="bg-white rounded-sm shadow-sm border border-gray-100 flex flex-col">
                            {cartItems.map((item, index) => {
                                const productId = item.product?._id;
                                const discount = item.product?.discountPercentage || 0;
                                const originalUnitPrice = discount > 0 ? (item.price / (1 - discount / 100)) : item.price;
                                const originalTotal = originalUnitPrice * item.quantity;
                                const currentTotal = item.price * item.quantity;
                                const availableStock = item.product?.stock || 0;
                                const isItemUpdating = updatingId === productId;

                                return (
                                    <div
                                        key={item._id}
                                        className={`relative p-4 sm:p-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    >
                                        <button
                                            onClick={() => handleRemoveItem(productId)}
                                            disabled={isItemUpdating}
                                            className={`absolute top-4 right-4 sm:top-6 sm:right-6 uppercase tracking-wide text-xs sm:text-sm font-semibold z-10 ${isItemUpdating ? 'text-gray-300 cursor-not-allowed' : 'text-[#878787] hover:text-red-500 transition-colors cursor-pointer'}`}
                                        >
                                            Remove
                                        </button>

                                        <div className="flex flex-col sm:flex-row gap-6 items-center">

                                            <div className="flex flex-col items-center gap-4 w-full sm:w-32.5 shrink-0">
                                                <div
                                                    className="h-28 w-28 cursor-pointer relative shrink-0"
                                                    onClick={() => navigate(`/product/${productId}`)}
                                                >
                                                    <img
                                                        src={item.product?.images?.[0]?.url || "/placeholder.png"}
                                                        alt={item.product?.title || "Product"}
                                                        className={`w-full h-full object-contain ${isItemUpdating ? 'opacity-50' : ''}`}
                                                    />
                                                    {availableStock === 0 && (
                                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                            <span className="text-red-600 font-bold text-xs bg-white px-2 py-1 rounded shadow-sm border border-red-200">OUT OF STOCK</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(productId, item.quantity, -1, availableStock)}
                                                        disabled={isItemUpdating}
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center bg-white transition-all ${isItemUpdating ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-[#c2c2c2] text-gray-600 hover:border-gray-400 cursor-pointer'}`}
                                                    >
                                                        <FaMinus size={10} />
                                                    </button>
                                                    <div className={`w-10 h-7 border border-[#c2c2c2] bg-white flex items-center justify-center text-sm font-medium rounded-sm ${isItemUpdating ? 'text-gray-300' : 'text-gray-800'}`}>
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        onClick={() => handleQuantityChange(productId, item.quantity, 1, availableStock)}
                                                        disabled={isItemUpdating}
                                                        className={`w-7 h-7 rounded-full border flex items-center justify-center bg-white transition-all ${isItemUpdating ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-[#c2c2c2] text-gray-600 hover:border-gray-400 cursor-pointer'}`}
                                                    >
                                                        <FaPlus size={10} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-start pr-16 sm:pr-24">
                                                <p className="text-sm text-[#878787] font-medium tracking-wide uppercase mb-0.5 mt-1 sm:mt-0">
                                                    {item.product?.brand || "Brand Name"}
                                                </p>

                                                <h3
                                                    className="text-[16px] font-medium text-[#212121] hover:text-[#2874f0] cursor-pointer line-clamp-2 pr-4 mb-1"
                                                    onClick={() => navigate(`/product/${productId}`)}
                                                >
                                                    {item.product?.title || "Product Name"}
                                                </h3>

                                                <div className="flex items-center gap-1.5 mt-1 mb-4 select-none">
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                className={i < Math.floor(item.product?.rating || 3.8) ? "text-[#388e3c]" : "text-[#e0e0e0]"}
                                                                size={15}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[14px] font-medium text-[#388e3c] ml-1">
                                                        {item.product?.rating || "3.8"}
                                                    </span>
                                                    <span className="text-[#878787] text-xs px-0.5">•</span>
                                                    <span className="text-[14px] text-[#878787] font-normal">
                                                        ({item.product?.numReviews || "537"})
                                                    </span>
                                                </div>

                                                <div className="flex items-end gap-3 mb-2">
                                                    {discount > 0 && (
                                                        <span className="text-sm text-[#878787] line-through">
                                                            ₹{Math.round(originalTotal).toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span className="text-[18px] font-medium text-[#212121]">
                                                        ₹{Math.round(currentTotal).toLocaleString()}
                                                    </span>
                                                    {discount > 0 && (
                                                        <span className="text-[14px] font-medium text-[#388e3c]">
                                                            {discount}% Off
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}

                            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-b-sm z-20">
                                <button
                                    onClick={handlePlaceOrder}
                                    className="bg-[#fb641b] text-white px-10 py-3.5 rounded-xs text-[15px] font-medium shadow-sm hover:bg-[#f05a13] transition-colors cursor-pointer"
                                >
                                    PLACE ORDER
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PRICE DETAILS */}
                    <div className="w-full lg:w-[32%] sticky top-4">
                        <div className="bg-white rounded-sm shadow-sm border border-gray-100 flex flex-col">

                            <div className="border-b border-gray-200 p-4">
                                <h2 className="text-[#878787] text-[15px] font-medium uppercase tracking-wide">
                                    Price Details
                                </h2>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center text-[15px]">
                                    <span>Price ({totalItems} items)</span>
                                    <span>₹{Math.round(totalOriginal).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-[15px]">
                                    <span>Discount</span>
                                    <span className="text-[#388e3c]">- ₹{Math.round(totalSavings).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-[15px]">
                                    <span>Delivery Charges</span>
                                    <span className="text-[#388e3c]">
                                        {shippingCharge === 0 ? (
                                            <>
                                                <span className="line-through text-[#878787] mr-1">₹99</span> Free
                                            </>
                                        ) : (
                                            `₹${shippingCharge}`
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-dashed border-gray-300 my-2"></div>

                                <div className="flex justify-between items-center text-[18px] font-medium">
                                    <span>Total Amount</span>
                                    <span>₹{Math.round(finalTotal).toLocaleString()}</span>
                                </div>

                                <div className="border-t border-dashed border-gray-300 my-2"></div>

                                {totalSavings > 0 && (
                                    <div className="text-[#388e3c] text-[15px] font-medium">
                                        You will save ₹{Math.round(totalSavings).toLocaleString()} on this order
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[#878787] text-[13px] font-medium">
                            <FaShieldAlt size={20} className="text-[#878787]" />
                            Safe and Secure Payments. Easy returns. 100% Authentic products.
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Cart;