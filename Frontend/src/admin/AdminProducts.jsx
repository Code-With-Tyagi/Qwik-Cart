import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import reducer, { fetchProducts, fetchProductById, updateProduct, deleteProduct } from '../features/product.slice';
import { useNavigate } from "react-router-dom";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdSwapVert,
  MdDownload,
  MdImage,
  MdVisibility,
  MdClose,
  MdStar,
  MdLocalShipping,
  MdAssignmentReturn,
  MdVerifiedUser,
  MdExpandMore
} from 'react-icons/md';

import { generatePdf } from '../utils/generate.pdf';
import { Zoom, toast } from 'react-toastify';

// Helper function to format categories (e.g., "women-dresses" -> "Women Dresses")
const formatCategoryName = (categoryStr) => {
  if (!categoryStr) return '';
  if (categoryStr === 'All') return 'All Categories';
  return categoryStr
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AdminProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Fetching products from Redux state
  const reduxProducts = useSelector((state) => state.product.products) || [];
  const selectedProduct = useSelector(state => state.product.selectedProduct);

  // Interaction & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Custom Dropdown States
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const categoryRef = useRef(null);
  const statusRef = useRef(null);

  // Handle outside clicks to close custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Derive unique categories from Redux data for the filter dropdown
  const categories = useMemo(() => {
    const allCats = reduxProducts.map(p => p.category).filter(Boolean);
    return ['All', ...new Set(allCats)];
  }, [reduxProducts]);

  // Derive unique availability statuses for the filter dropdown
  const statuses = useMemo(() => {
    const allStatuses = reduxProducts.map(p => p.availabilityStatus).filter(Boolean);
    return ['All', ...new Set(allStatuses)];
  }, [reduxProducts]);

  // Handlers for Buttons
  const handleView = (id) => {
    dispatch(fetchProductById(id));
    setIsViewModalOpen(true);
  };

  const handleDelete = (id, title) => {
    dispatch(deleteProduct(id));
    toast.success(`${title} removed successfully`, {
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
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    // Create clean payload with only updateable fields
    const updatePayload = {
      title: editingProduct.title,
      category: editingProduct.category,
      price: editingProduct.price,
      stock: editingProduct.stock,
      availabilityStatus: editingProduct.availabilityStatus,
    };


    dispatch(updateProduct({ id: editingProduct._id, productData: updatePayload }))
      .then(() => {
        toast.success(`${editingProduct.title} updated successfully`, {
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

        // Close modal after saving
        setEditingProduct(null);
      })
      .catch((error) => {
        console.error('Update Error:', error);
        toast.error(`Failed to update ${editingProduct.title}`, {
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
      });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {

    const headers = [
      "#",
      "Product",
      "Brand",
      "Category",
      "Price",
      "Stock",
      "Status"
    ];

    const rows = reduxProducts.map((product, index) => [
      index + 1,
      product.title,
      product.brand || "QwikCart Essentials",
      product.category,
      `₹${Number(product.price).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`,
      product.stock,
      product.availabilityStatus
    ]);

    generatePdf({
      companyName: "QwikCart",
      reportName: "Products Inventory Report",
      fileName: "QwikCart_Products_Report.pdf",
      headers,
      rows
    });

  };

  // Filter, Sort, and Pagination Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    let output = [...reduxProducts];

    // Filter by Search Query (Title or ID)
    if (searchQuery.trim() !== '') {
      output = output.filter(product =>
        (product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product._id && product._id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      output = output.filter(product => product.category === selectedCategory);
    }

    // Filter by Status (Availability)
    if (selectedStatus !== 'All') {
      output = output.filter(product => product.availabilityStatus === selectedStatus);
    }

    // Handle Sorting
    if (sortConfig.key) {
      output.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return output;
  }, [reduxProducts, searchQuery, selectedCategory, selectedStatus, sortConfig]);

  // Pagination Math
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Low Stock': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Out of Stock': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-8 px-1 relative">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your inventory, pricing, and product details.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >
            <MdDownload size={18} />
            <span className="text-sm cursor-pointer">Export</span>
          </button>
          <button
            onClick={() => navigate("/admin/create-product")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-sm cursor-pointer"
          >
            <MdAdd size={18} />
            <span className="text-sm">Add Product</span>
          </button>
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
            placeholder="Search by title or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dropdowns Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto">

          {/* Custom Category Dropdown */}
          <div ref={categoryRef} className="relative w-full sm:w-56 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            <MdFilterList size={20} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />

            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-10 pr-10 outline-none text-sm font-medium cursor-pointer truncate"
            >
              {formatCategoryName(selectedCategory)}
            </button>
            <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

            {/* Downward Dropdown Menu */}
            {isCategoryOpen && (
              <ul className="absolute top-full left-0 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {categories.map(cat => (
                  <li
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentPage(1);
                      setIsCategoryOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedCategory === cat ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    {formatCategoryName(cat)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Custom Status Dropdown */}
          <div ref={statusRef} className="relative w-full sm:w-48 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            <MdFilterList size={20} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />

            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-10 pr-10 outline-none text-sm font-medium cursor-pointer truncate"
            >
              {selectedStatus === 'All' ? 'All Statuses' : selectedStatus}
            </button>
            <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

            {/* Downward Dropdown Menu */}
            {isStatusOpen && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50 overflow-hidden">
                {statuses.map(status => (
                  <li
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setCurrentPage(1);
                      setIsStatusOpen(false);
                    }}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-700 ${selectedStatus === status ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    {status === 'All' ? 'All Statuses' : status}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-1">
                    Price <MdSwapVert size={16} className={sortConfig.key === 'price' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-800 transition-colors select-none" onClick={() => handleSort('stock')}>
                  <div className="flex items-center gap-1">
                    Stock <MdSwapVert size={16} className={sortConfig.key === 'stock' ? 'text-blue-600' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const productImg = product.images && product.images.length > 0 ? product.images[0].url || product.images[0] : null;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {productImg ? (
                              <img src={productImg} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <MdImage size={24} className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 max-w-62.5">
                            <span className="font-bold text-slate-800 truncate" title={product.title}>{product.title}</span>
                            <span className="text-xs text-slate-500 mt-0.5 truncate">{product._id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium">{formatCategoryName(product.category)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">₹{product.price?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${product.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                            {product.stock} units
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getStatusBadge(product.availabilityStatus)}`}>
                          {product.availabilityStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(product._id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <MdVisibility size={18} />
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 bg-slate-50/30">
                    No products match your criteria.
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

      {/* REFINED COMPACT SLIDE-OVER PRODUCT DETAILS PANEL */}
      <div
        className={`fixed inset-0 z-100 overflow-hidden transition-all duration-500 ${isViewModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-labelledby="slide-over-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Dark Backdrop */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isViewModalOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsViewModalOpen(false)}
        />

        {/* Sliding Panel - Reduced width for a sleeker look */}
        <div className={`absolute inset-y-0 right-0 w-full sm:w-120 md:w-140 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isViewModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Sticky Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight" id="slide-over-title">Product Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingProduct(selectedProduct)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <MdEdit size={16} /> Edit
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                title="Close panel"
              >
                <MdClose size={22} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {!selectedProduct ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="pb-8">

                {/* Image Card Container */}
                <div className="mx-6 mt-6 h-64 bg-slate-50 rounded-2xl border border-slate-100 relative group overflow-hidden flex items-center justify-center">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img
                      src={selectedProduct.images[0].url || selectedProduct.images[0]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain p-4 mix-blend-multiply"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <MdImage size={48} />
                      <span className="mt-2 text-xs font-medium">No Image Available</span>
                    </div>
                  )}
                  {/* Status Badge Overlaid on Image */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm border bg-white ${getStatusBadge(selectedProduct.availabilityStatus)}`}>
                      {selectedProduct.availabilityStatus}
                    </span>
                  </div>
                </div>

                {/* Primary Info Header */}
                <div className="px-6 py-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedProduct.brand}</span>
                      <h1 className="text-2xl font-extrabold text-slate-900 mt-1 leading-tight">{selectedProduct.title}</h1>
                      <p className="text-[11px] text-slate-400 font-mono mt-1.5">ID: {selectedProduct._id}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-3xl font-black text-slate-900">₹{selectedProduct.price?.toFixed(2)}</div>
                      {selectedProduct.discountPercentage > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md">
                          {selectedProduct.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compact Stats Badges */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5">
                      <MdStar className="text-amber-400" size={14} />
                      {selectedProduct.rating} <span className="text-slate-400">({selectedProduct.numReviews})</span>
                    </span>
                    <span className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                      Stock: <strong className="text-slate-900">{selectedProduct.stock}</strong>
                    </span>
                    <span className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                      Sold: <strong className="text-slate-900">{selectedProduct.totalSold || 0}</strong>
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100 mx-6" />

                {/* Description block */}
                <div className="px-6 py-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    About this product
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Stacked Detail Cards */}
                <div className="px-6 space-y-4">

                  {/* Technical Specs Card */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      Specifications
                    </h4>
                    <dl className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                        <dt className="text-slate-500">Category</dt>
                        <dd className="font-semibold text-slate-800">{formatCategoryName(selectedProduct.category)}</dd>
                      </div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-50">
                        <dt className="text-slate-500">Weight</dt>
                        <dd className="font-semibold text-slate-800">{selectedProduct.weight} oz</dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500">Dimensions (W×H×D)</dt>
                        <dd className="font-semibold text-slate-800">
                          {selectedProduct.dimensions?.width} × {selectedProduct.dimensions?.height} × {selectedProduct.dimensions?.depth}
                        </dd>
                      </div>
                    </dl>

                    {/* Tags */}
                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logistics & Policies Card */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Policies & Logistics
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0 mt-0.5">
                          <MdLocalShipping size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Shipping Info</p>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.shippingInformation || 'Standard shipping terms apply.'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md shrink-0 mt-0.5">
                          <MdAssignmentReturn size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Return Policy</p>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.returnPolicy || 'No returns specified.'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0 mt-0.5">
                          <MdVerifiedUser size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Warranty</p>
                          <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.warrantyInformation || 'No warranty specified.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PRODUCT FORM MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdate} className="flex-1 flex flex-col">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">

                {/* Product Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Category & Status Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={editingProduct.availabilityStatus || 'In Stock'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, availabilityStatus: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Price & Stock Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Inventory (Units)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminProducts;