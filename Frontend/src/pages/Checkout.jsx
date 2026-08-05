import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaCheckCircle, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { createOrder } from '../features/order.slice';
import { createPayment, verifyPayment } from '../features/paymet.slice';
import { clearCart } from '../features/cart.slice';
import { loadRazorpay } from '../utils/load.razorpay';
import { toast, Zoom } from "react-toastify";
import { getAllAddress } from "../features/address.slice.js"

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState("");

    // Pull cart items and addresses from Redux state
    const cartItems = useSelector((state) => state.cart.cartItems || []);
    const { addresses, loading: addressLoading } = useSelector((state) => state.address || { addresses: [] });

    // Scroll Restoration Fix
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Redirect to cart if empty (Acts as a route guard on initial mount)
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart', { replace: true });
        }
    }, [cartItems, navigate]);

    // Fetch addresses on mount
    useEffect(() => {
        dispatch(getAllAddress());
    }, [dispatch]);

    // Automatically select the default address or the first available address
    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr._id : addresses[0]._id);
        }
    }, [addresses, selectedAddressId]);

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
    const final = Math.round(finalTotal);

    // Handle the transition to Razorpay
    const handleProceedToPayment = async (e) => {
        if (e) e.preventDefault();

        if (isSubmitting) return;

        if (!selectedAddressId) {
            toast.error('Please select a delivery address', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Zoom,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert cart items to order items
            const orderItems = cartItems.map((item) => ({
                productId: item.product._id,
                qty: item.quantity,
                price: item.price
            }));

            // Pass addressId instead of an address object to match your backend schema
            const payloadOrder = {
                items: orderItems,
                addressId: selectedAddressId,
                totalAmount: final
            };

            // CREATE ORDER
            const resultAction = await dispatch(createOrder(payloadOrder));

            // Check if the order creation was rejected
            if (createOrder.rejected.match(resultAction) || resultAction.error) {
                
                // Extract the specific backend message out of the payload
                const backendMessage = resultAction.payload?.message || resultAction.payload?.error;
                
                // Fallback message if rejectWithValue wasn't configured properly
                const fallbackMessage = resultAction.error?.message?.includes("400")
                    ? "One or more items in your cart are out of stock."
                    : resultAction.error?.message || "Failed to create order";

                toast.error(backendMessage || fallbackMessage, {
                    position: "top-right",
                    autoClose: 1000, // Longer autoClose so user can read out-of-stock product names
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    transition: Zoom,
                });
                setIsSubmitting(false);
                return;
            }

            const orderId = resultAction.payload?.orderDetails?._id || resultAction.payload;

            // CREATE PAYMENT
            const payloadPayment = {
                orderId,
                amount: final
            };

            const createPayAction = await dispatch(createPayment(payloadPayment));

            if (createPayment.rejected.match(createPayAction) || createPayAction.error) {
                const payErrorMessage = createPayAction.payload?.message || createPayAction.error?.message || 'Failed to create payment';
                
                toast.error(payErrorMessage, {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    transition: Zoom,
                });
                setIsSubmitting(false);
                return;
            }

            const razorpayOrder = createPayAction.payload.razorpayOrder;

            // LOAD RAZORPAY
            const loaded = await loadRazorpay();

            if (!loaded) {
                toast.error("Failed to load Razorpay. Please check your connection.", { theme: "dark" });
                setIsSubmitting(false);
                return;
            }

            const selectedAddressDetails = addresses.find(a => a._id === selectedAddressId);

            const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!razorpayKeyId) {
                toast.error('Payment configuration error: Razorpay API key is missing.', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    transition: Zoom,
                });
                setIsSubmitting(false);
                return;
            }

            // OPEN CHECKOUT
            const options = {
                key: razorpayKeyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency || "INR",
                name: "QwikCart",
                description: "Complete your purchase",
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        const verifyResultAction = await dispatch(verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }));

                        if (!verifyPayment.rejected.match(verifyResultAction) && verifyResultAction.payload?.success) {
                            // 1. Clear the cart in Redux
                            dispatch(clearCart());
                            
                            // 2. Show Success Notification
                            toast.success('Payment successful!', {
                                position: "top-right",
                                autoClose: 1000,
                                hideProgressBar: false,
                                closeOnClick: false,
                                pauseOnHover: true,
                                draggable: true,
                                theme: "dark",
                                transition: Zoom,
                            });
                            
                            // 3. IMMEDIATE REDIRECT (Replaces history to prevent back-button bugs)
                            navigate('/cart', { replace: true });
                            
                        } else {
                            const verifyErrorMsg = verifyResultAction.payload?.message || verifyResultAction.error?.message || 'Payment verification failed';
                            toast.error(verifyErrorMsg, {
                                position: "top-right",
                                autoClose: 1000,
                                theme: "dark",
                                transition: Zoom,
                            });
                        }
                    } catch (error) {
                        toast.error(error?.response?.data?.message || error.message || 'Payment verification failed', {
                            position: "top-right",
                            autoClose: 1000,
                            theme: "dark",
                            transition: Zoom,
                        });
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                prefill: {
                    name: selectedAddressDetails?.fullName || "",
                    email: "",
                    contact: selectedAddressDetails?.mobileNumber || ""
                },
                theme: {
                    color: "#fb641b"
                },
                modal: {
                    ondismiss: function() {
                        setIsSubmitting(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                toast.error(response.error?.description || 'Payment Failed', {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    transition: Zoom,
                });
                setIsSubmitting(false);
            });

            rzp.open();

        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || 'Something Went Wrong!', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Zoom,
            });
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) return null;

    return (
        <div className="bg-[#f4f6f8] min-h-screen font-sans text-gray-800 antialiased pb-12">
            <div className="h-6"></div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* LEFT COLUMN: ADDRESS SELECTION & ITEMS */}
                    <div className="w-full lg:w-[65%] flex flex-col gap-6">

                        {/* Address Selection Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-[#2874f0] text-xl" />
                                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                            </div>

                            <div className="p-6 sm:p-8">
                                {addressLoading ? (
                                    <p className="text-gray-500">Loading addresses...</p>
                                ) : addresses && addresses.length > 0 ? (
                                    <div className="space-y-4">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr._id}
                                                className={`block border rounded-lg p-4 cursor-pointer transition-all ${selectedAddressId === addr._id
                                                    ? 'border-[#2874f0] bg-[#2874f0]/5 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="pt-1">
                                                        <input
                                                            type="radio"
                                                            name="deliveryAddress"
                                                            value={addr._id}
                                                            checked={selectedAddressId === addr._id}
                                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                                            className="w-4 h-4 text-[#2874f0] border-gray-300 focus:ring-[#2874f0]"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900">{addr.fullName}</span>
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                                                {addr.addressType}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {addr.city}, {addr.state} - <span className="font-medium">{addr.pincode}</span>
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Mobile: <span className="font-medium">{addr.mobileNumber}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-4 py-6 w-full">
                                        <p className="text-gray-500 text-sm text-center">
                                            Add an address so we know where to deliver your order.
                                        </p>

                                        <button
                                            onClick={() => navigate('/user/addresses')}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-300 rounded-md text-[#2874f0] font-medium text-sm hover:border-[#2874f0] transition-colors duration-200 cursor-pointer uppercase"
                                        >
                                            <FaPlus size={14} />
                                            <span>Add a new address</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                                <span className="bg-[#2874f0]/10 text-[#2874f0] text-xs font-bold px-3 py-1 rounded-full">
                                    {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col gap-4 max-h-90 overflow-y-auto pr-2"
                                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>

                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex items-center gap-5 p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-50 p-2 border border-gray-100 flex items-center justify-center">
                                                <img
                                                    src={item.product?.images?.[0]?.url || "/placeholder.png"}
                                                    alt={item.product?.title}
                                                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-medium text-gray-900 truncate mb-1">{item.product?.title}</p>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                                                    <span>Qty: <span className="font-semibold text-gray-700">{item.quantity}</span></span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-base font-bold text-gray-900">
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                    {item.product?.discountPercentage > 0 && (
                                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                            {item.product.discountPercentage}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: STICKY PRICE DETAILS */}
                    <div className="w-full lg:w-[35%] sticky top-6">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col overflow-hidden">

                            <div className="bg-gray-50 border-b border-gray-200 p-5">
                                <h2 className="text-gray-900 text-lg font-semibold">
                                    Price Summary
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Price ({totalItems} items)</span>
                                    <span className="font-medium text-gray-900">₹{Math.round(totalOriginal).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Discount</span>
                                    <span className="font-medium text-green-600">- ₹{Math.round(totalSavings).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="font-medium text-green-600">
                                        {shippingCharge === 0 ? (
                                            <>
                                                <span className="line-through text-gray-400 mr-2">₹99</span>Free
                                            </>
                                        ) : (
                                            <span className="text-gray-900">₹{shippingCharge}</span>
                                        )}
                                    </span>
                                </div>

                                <div className="border-t border-dashed border-gray-200 my-4"></div>

                                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                                    <span>Total Payable</span>
                                    <span>₹{Math.round(finalTotal).toLocaleString()}</span>
                                </div>

                                {totalSavings > 0 && (
                                    <div className="bg-green-50 text-green-700 text-sm font-medium px-4 py-3 rounded-lg mt-4 flex items-center gap-2 border border-green-100">
                                        <FaCheckCircle className="text-green-500" />
                                        You will save ₹{Math.round(totalSavings).toLocaleString()} on this order
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-200">
                                <button
                                    onClick={handleProceedToPayment}
                                    disabled={isSubmitting || (!selectedAddressId && addresses.length > 0)}
                                    className="w-full bg-[#fb641b] text-white py-4 rounded-lg text-base font-bold shadow-sm hover:bg-[#e05615] hover:shadow-md transform transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? 'PROCESSING...' : 'PROCEED TO PAY'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <FaShieldAlt size={18} className="text-gray-400" />
                                <span>Safe and Secure Payments</span>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-400">
                                <span>100% Authentic</span>
                                <span>•</span>
                                <span>Easy Returns</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Checkout;