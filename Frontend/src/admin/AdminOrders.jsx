import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MdSearch,
  MdFilterList,
  MdShoppingCart,
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdExpandMore,
  MdDownload,
  MdPerson,
  MdLocationOn,
  MdPayment,
  MdClose,
  MdImage,
  MdOutlineReceipt
} from 'react-icons/md';
import { toast, Zoom } from 'react-toastify';
import { getAllOrdersAdmin, updateOrderStatus } from '../features/order.slice';
import { generatePdf } from '../utils/generate.pdf';

const AdminOrders = () => {
  const dispatch = useDispatch();

  // Pulling orders from Redux store
  const reduxOrders = useSelector((state) => state.order.orders) || [];

  // Local state initialized empty, synced with Redux via useEffect
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    dispatch(getAllOrdersAdmin());
  }, [dispatch]);

  // Sync Redux data to local state whenever it changes
  useEffect(() => {
    // Safely extract orderDetails array from your API response format
    const orderData = Array.isArray(reduxOrders) ? reduxOrders : (reduxOrders.orderDetails || []);
    setOrders(orderData);
  }, [reduxOrders]);

  // Layout & Interaction States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom Dropdown State
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef(null);

  // View Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Handle outside clicks to close custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Top Level Metrics Calculation
  const metrics = useMemo(() => {
    const data = { total: orders.length, processing: 0, delivered: 0, cancelled: 0 };
    orders.forEach(order => {
      const status = order.status || 'Pending';
      if (status === 'Processing' || status === 'Pending') data.processing += 1;
      if (status === 'Delivered') data.delivered += 1;
      if (status === 'Cancelled') data.cancelled += 1;
    });
    return data;
  }, [orders]);

  // Filter Pipeline
  const filteredOrders = useMemo(() => {
    let output = [...orders];

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      output = output.filter(order => {
        const customerName = order.userId?.name || resolveAddress(order)?.fullName || '';
        const customerEmail = order.userId?.email || '';
        return (
          order._id.toLowerCase().includes(lowerQuery) ||
          customerName.toLowerCase().includes(lowerQuery) ||
          customerEmail.toLowerCase().includes(lowerQuery)
        );
      });
    }

    if (selectedStatus !== 'All') {
      output = output.filter(order => (order.status || 'Pending') === selectedStatus);
    }

    // Sort by Date Descending (Newest first)
    output.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return output;
  }, [orders, searchQuery, selectedStatus]);

  // Pagination Math
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Handlers
  const handleViewOrder = (order) => {
    console.log(order);
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!selectedOrder) return;

    try {
      await dispatch(updateOrderStatus({ id: selectedOrder._id, status: newStatus })).unwrap();

      // 2. Update local state immediately for a snappy UI
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));

      toast.success(`Order ${selectedOrder._id} marked as ${newStatus}`, {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom
      });
    } catch (error) {
      toast.error("Failed to update order status.", {
        position: "top-right",
        theme: "dark",
        autoClose:1000,
        transition:Zoom
      });
    }
  };

  const handleExport = () => {
    const headers = [
      "#",
      "Order Details",
      "Customer",
      "Total Amount",
      "Payment",
      "Order Status",
    ]

    const rows = (Array.isArray(reduxOrders) ? reduxOrders : (reduxOrders.orderDetails || [])).map((order, index) => [
      index + 1,
      order._id,
      order.userId?.email || 'N/A',
      `₹${Number(order.totalAmount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      order.paymentStatus,
      order.status
    ]);

    generatePdf({
      companyName: "QwikCart",
      reportName: "User Orders Report",
      fileName: "QwikCart_Orders_Report.pdf",
      headers,
      rows
    });
  };

  // Badge Color Helpers
  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
      case 'Processing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Failed':
      case 'Refunded': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Resolve address from multiple possible shapes returned by backend
  const resolveAddress = (order) => {
    if (!order) return null;
    return order.addressId || order.address || order.shippingAddress || null;
  };

  return (
    <div className="space-y-6 pb-8 px-1 max-w-7xl mx-auto mt-6 relative">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Track customer orders, update shipping statuses, and view details.</p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto shadow-sm cursor-pointer"
          >
            <MdDownload size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <MdOutlineReceipt size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.total}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <MdShoppingCart size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Processing</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.processing}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <MdCheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Delivered</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.delivered}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-red-50 text-red-600 rounded-xl">
            <MdCancel size={24} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wide">Cancelled</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.cancelled}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">

        {/* Search */}
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Order ID, Name, or Email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Custom Status Filter Dropdown */}
        <div className="w-full lg:w-auto">
          <div ref={statusRef} className="relative w-full sm:w-56 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            <MdFilterList size={18} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />

            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-9 pr-10 outline-none text-sm font-medium cursor-pointer"
            >
              {selectedStatus === 'All' ? 'Filter by Status' : selectedStatus}
            </button>
            <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

            {/* Downward Dropdown Menu */}
            {isStatusOpen && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50 overflow-hidden">
                {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                  <li
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                      setIsStatusOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedStatus === status ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    {status === 'All' ? 'All Orders' : status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Main Orders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-left border-collapse min-w-250">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-center">Payment</th>
                <th className="px-6 py-4 text-center">Order Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors group">

                    {/* Order ID & Date */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 text-sm">{order._id}</span>
                        <span className="text-[11px] font-medium text-slate-400 mt-0.5">{formatDate(order.createdAt)}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                          <MdPerson size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-slate-700 truncate">
                            {order.userId?.name || resolveAddress(order)?.fullName || 'Guest User'}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate">
                            {order.userId?.email || 'No email provided'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800">
                          ${(order.totalAmount || 0).toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {order.items?.length || 0} items
                        </span>
                      </div>
                    </td>

                    {/* Payment Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>

                    {/* Order Status Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getOrderStatusBadge(order.status || 'Pending')}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <MdVisibility size={14} />
                        <span>View Details</span>
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center">
                      <MdOutlineReceipt size={48} className="text-slate-300 mb-3" />
                      <p className="font-medium text-slate-500">No orders match your current filters.</p>
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
              Showing <span className="font-bold text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SLIDE-OVER PANEL: ORDER DETAILS */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${isViewModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-labelledby="slide-over-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Dark Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isViewModalOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsViewModalOpen(false)}
        />

        {/* Sliding Panel */}
        <div className={`absolute inset-y-0 right-0 w-full sm:w-125 md:w-150 bg-slate-50 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isViewModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-white z-10 sticky top-0 flex items-center justify-between shadow-sm">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2" id="slide-over-title">
                Order Details
              </h2>
              {selectedOrder && (
                <p className="text-xs text-slate-500 mt-1 font-mono">{selectedOrder._id}</p>
              )}
            </div>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
            {selectedOrder && (
              <>
                {/* Status Update Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm ${getOrderStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex-1 max-w-50">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1 block">Update Status</label>
                    <select
                      value={selectedOrder.status || 'Pending'}
                      onChange={(e) => handleUpdateOrderStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer & Shipping Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Customer Info */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MdPerson size={16} /> Customer Info
                    </h4>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        {selectedOrder.userId?.name || resolveAddress(selectedOrder)?.fullName || 'Guest User'}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {selectedOrder.userId?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MdLocationOn size={16} /> Shipping Address
                    </h4>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800">{resolveAddress(selectedOrder)?.fullName || 'N/A'}</p>
                      <p className="whitespace-pre-line">{resolveAddress(selectedOrder)?.addressLine1 || resolveAddress(selectedOrder)?.street || ''}</p>
                      {resolveAddress(selectedOrder)?.addressLine2 && <p>{resolveAddress(selectedOrder)?.addressLine2}</p>}
                      <p>{resolveAddress(selectedOrder)?.city || ''}{resolveAddress(selectedOrder)?.pincode ? `, ${resolveAddress(selectedOrder)?.pincode}` : resolveAddress(selectedOrder)?.postalCode ? `, ${resolveAddress(selectedOrder)?.postalCode}` : ''}</p>
                      <p>{resolveAddress(selectedOrder)?.state || ''}{resolveAddress(selectedOrder)?.state && resolveAddress(selectedOrder)?.country ? ', ' : ''}{resolveAddress(selectedOrder)?.country || ''}</p>
                      {resolveAddress(selectedOrder)?.mobileNumber && <p className="mt-2 font-medium">Phone: {resolveAddress(selectedOrder)?.mobileNumber}</p>}
                    </div>
                  </div>
                </div>

                {/* Order Items List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <MdShoppingCart size={16} /> Ordered Items
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-100 p-4">
                    {selectedOrder.items?.map((item, index) => {
                      // Extract Product details securely from nested productId object
                      const imageUrl = item.productId?.images?.[0]?.url;
                      const productTitle = item.productId?.title || 'Unknown Product';
                      const productPrice = item.price || item.productId?.price || 0;

                      return (
                        <div key={index} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={productTitle} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <MdImage size={20} className="text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {productTitle}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">Qty: {item.qty} × ${productPrice.toFixed(2)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-slate-800">${(productPrice * (item.qty || 1)).toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Payment & Total Summary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <MdPayment size={16} /> Payment Summary
                  </h4>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">
                        ₹{selectedOrder.items?.reduce((acc, item) => acc + ((item.price || item.productId?.price || 0) * (item.qty || 1)), 0).toFixed(2) || (selectedOrder.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    {/* Fallback shipping/tax to 0 since it's not present in JSON */}
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-slate-800">Free</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Tax</span>
                      <span className="font-semibold text-slate-800">₹0.00</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-800">Total Amount</span>
                    <span className="text-xl font-black text-blue-600">${(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="pt-2 flex flex-col gap-1 text-slate-500 text-xs">
                    <span className={`inline-flex items-center px-2.5 py-1 w-max rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getPaymentStatusBadge(selectedOrder.paymentStatus)}`}>
                      Payment: {selectedOrder.paymentStatus || 'Pending'}
                    </span>
                    {selectedOrder.paymentId && (
                      <span className="font-mono mt-1">Ref: {selectedOrder.paymentId}</span>
                    )}
                  </div>

                </div>

              </>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminOrders;
