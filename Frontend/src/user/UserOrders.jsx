import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  FaBoxOpen, 
  FaChevronDown, 
  FaChevronUp,
  FaCheckCircle, 
  FaClock, 
  FaSpinner,
  FaReceipt,
  FaShoppingBag
} from 'react-icons/fa';

// IMPORTANT: Adjust this path to match your folder structure where order.slice.js is located
import { getAllOrdersUser } from '../features/order.slice';

const UserOrders = () => {
  const dispatch = useDispatch();

  // Pull orders and loading state from the Redux store
  const { orders, loading } = useSelector((state) => state.order);

  // State to track which order is currently expanded (dropdown)
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Fetch the current user's orders when the component mounts
  useEffect(() => {
    dispatch(getAllOrdersUser());
  }, [dispatch]);

  // Ensure orders is an array before mapping (safeguard against initial state {})
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Toggle order dropdown
  const toggleOrder = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper to dynamically render the status badge in Flipkart style
  const getStatusText = (status) => {
    const normalizedStatus = status?.toLowerCase() || '';

    if (normalizedStatus === 'delivered') {
      return (
        <span className="flex items-center gap-1.5 text-[#388e3c] text-[14px] font-semibold">
          <FaCheckCircle size={14} />
          Delivered
        </span>
      );
    }
    
    if (normalizedStatus === 'processing' || normalizedStatus === 'pending') {
      return (
        <span className="flex items-center gap-1.5 text-[#ff9f00] text-[14px] font-semibold">
          <FaClock size={14} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
    
    return (
      <span className="text-gray-600 text-[14px] font-semibold">
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-sm font-sans min-h-[60vh] flex flex-col shadow-sm">
      
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h2 className="text-[18px] font-semibold text-gray-900 tracking-wide">
          My Orders ({safeOrders.length})
        </h2>
      </div>

      {/* Orders List / UI States */}
      <div className="flex-1 w-full bg-white flex flex-col">
        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner size={32} className="text-[#2874f0] animate-spin mb-4" />
            <h4 className="text-base font-medium text-gray-600">Loading your orders...</h4>
          </div>
        ) : safeOrders.length > 0 ? (
          /* Populated List */
          <div className="flex flex-col w-full">
            {safeOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              
              // Safely extract the first item's details for the collapsed summary preview
              const firstItem = order.items?.[0];
              const product = firstItem?.productId;
              const productImage = product?.images?.[0]?.url;
              
              // Build the summary string
              let itemDescription = product?.title || "Unknown Item";
              if (order.items?.length > 1) {
                itemDescription += ` + ${order.items.length - 1} more item(s)`;
              }

              return (
                <div 
                  key={order._id} 
                  className="flex flex-col border-b border-gray-200 hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.08)] transition-shadow duration-200 bg-white"
                >
                  {/* --- CLICKABLE HEADER / SUMMARY --- */}
                  <div 
                    onClick={() => toggleOrder(order._id)}
                    className="flex flex-col sm:flex-row p-6 cursor-pointer select-none group gap-6"
                  >
                    {/* Left Side - Product Image (Thumbnail) */}
                    <div className="w-25 h-25 shrink-0 bg-white flex items-center justify-center p-1">
                      {productImage ? (
                        <img 
                          src={productImage} 
                          alt={product?.title || "Product"} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FaShoppingBag className="text-gray-200 text-3xl" />
                      )}
                    </div>

                    {/* Middle & Right - Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        {/* Order Info */}
                        <div className="flex-1">
                          <h4 className="text-[16px] text-gray-900 font-medium line-clamp-2 pr-4 mb-2">
                            {itemDescription}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                            <div>
                              <p className="text-[12px] text-gray-500 font-medium">Order ID</p>
                              <p className="text-[14px] font-medium text-gray-800">#{order._id.slice(-10).toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-[12px] text-gray-500 font-medium">Placed On</p>
                              <p className="text-[14px] font-medium text-gray-800">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-[12px] text-gray-500 font-medium">Total</p>
                              <p className="text-[14px] font-bold text-gray-900">
                                ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Expand Icon */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:min-w-30">
                          {getStatusText(order.status)}
                          <div className="text-[#2874f0] font-medium text-sm flex items-center gap-1 mt-2">
                            {isExpanded ? (
                              <>Hide Details <FaChevronUp size={12} /></>
                            ) : (
                              <>View Details <FaChevronDown size={12} /></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- EXPANDED DROPDOWN CONTENT --- */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-fadeIn">
                      <h4 className="flex items-center gap-2 text-[15px] font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                        <FaReceipt className="text-gray-400" /> 
                        Order Items ({order.items?.length || 0})
                      </h4>
                      
                      <div className="space-y-4">
                        {order.items?.map((item, index) => {
                          const itemProd = item.productId;
                          const itemImg = itemProd?.images?.[0]?.url;
                          
                          return (
                            <div key={item._id || index} className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-white border border-gray-200 p-1 shrink-0 rounded-sm">
                                {itemImg ? (
                                  <img 
                                    src={itemImg} 
                                    alt={itemProd?.title || "Item"} 
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <FaShoppingBag className="text-gray-200 w-full h-full p-2" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[14px] font-medium text-gray-800 line-clamp-1 hover:text-[#2874f0] transition-colors cursor-pointer">
                                  {itemProd?.title || "Product Unavailable"}
                                </h5>
                                <p className="text-[12px] text-gray-500 mt-0.5">
                                  Seller: {itemProd?.brand || "Retailer"}
                                </p>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-[14px] font-semibold text-gray-900">
                                    ₹{Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span className="text-[13px] text-gray-500 font-medium">
                                    Qty: {item.qty}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Item Total (Hidden on very small screens) */}
                              <div className="text-right hidden sm:block">
                                <p className="text-[12px] font-medium text-gray-500 mb-0.5">Item Total</p>
                                <p className="text-[14px] font-semibold text-gray-900">
                                  ₹{Number((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-24 px-4 flex flex-col items-center justify-center flex-1">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <FaBoxOpen size={40} className="text-[#2874f0]" />
            </div>
            <h4 className="text-[18px] font-semibold text-gray-900 mb-2">No Orders Found</h4>
            <p className="text-sm text-gray-500 max-w-md mb-8">
              Looks like you haven't placed an order yet. Start shopping to see your orders here.
            </p>
            <Link 
              to="/shop" 
              className="px-8 py-3 bg-[#2874f0] hover:bg-[#1a5bc2] text-white font-medium text-sm rounded-xs transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;