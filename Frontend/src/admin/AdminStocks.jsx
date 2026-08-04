import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MdSearch,
  MdFilterList,
  MdOutlineInventory,
  MdErrorOutline,
  MdRemoveShoppingCart,
  MdSave,
  MdImage,
  MdSwapVert,
  MdExpandMore
} from 'react-icons/md';
import { toast, Zoom } from 'react-toastify';

// Ensure this path matches your project structure
import { fetchProducts, updateProduct } from '../features/product.slice';

// Helper function to format categories nicely
const formatCategoryName = (categoryStr) => {
  if (!categoryStr) return 'Uncategorized';
  if (categoryStr === 'All') return 'All Categories';
  return categoryStr
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AdminStocks = () => {
  const dispatch = useDispatch();

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const reduxProducts = useSelector((state) => state.product.products) || [];

  // Local States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'stock', direction: 'asc' });
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

  // Track pending stock edits locally before saving
  const [stockUpdates, setStockUpdates] = useState({});

  // Derive unique categories for the filter
  const categories = useMemo(() => {
    const allCats = reduxProducts.map(p => p.category).filter(Boolean);
    return ['All', ...new Set(allCats)];
  }, [reduxProducts]);

  // Derive Top-Level Metrics
  const metrics = useMemo(() => {
    let lowStock = 0;
    let outOfStock = 0;

    reduxProducts.forEach(product => {
      if (product.availabilityStatus === 'Low Stock' || (product.stock > 0 && product.stock <= 10)) {
        lowStock += 1;
      }
      if (product.availabilityStatus === 'Out of Stock' || product.stock === 0) {
        outOfStock += 1;
      }
    });

    return {
      total: reduxProducts.length,
      lowStock,
      outOfStock
    };
  }, [reduxProducts]);

  // Handle Sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    let output = [...reduxProducts];

    if (searchQuery.trim() !== '') {
      output = output.filter(product =>
        (product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product._id && product._id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      output = output.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Out of Stock') {
        output = output.filter(p => p.availabilityStatus === 'Out of Stock' || p.stock === 0);
      } else if (selectedStatus === 'Low Stock') {
        output = output.filter(p => p.availabilityStatus === 'Low Stock' || (p.stock > 0 && p.stock <= 10));
      } else {
        output = output.filter(p => p.availabilityStatus === selectedStatus);
      }
    }

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

  // Action Handlers for Inline Stock Updating
  const handleStockInputChange = (productId, val) => {
    setStockUpdates(prev => ({
      ...prev,
      [productId]: Number(val)
    }));
  };

  const handleSaveStock = async (product) => {
    const newStock = stockUpdates[product._id] !== undefined ? stockUpdates[product._id] : product.stock;

    let newStatus = product.availabilityStatus;
    if (newStock === 0) newStatus = 'Out of Stock';
    else if (newStock <= 10) newStatus = 'Low Stock';
    else newStatus = 'In Stock';

    const updatedProduct = {
      ...product,
      stock: newStock,
      availabilityStatus: newStatus
    };

    try {
      await dispatch(updateProduct({ id: updatedProduct._id, productData: updatedProduct })).unwrap();
      toast.success(`${product.title} stock updated!`, {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom
      });

      setStockUpdates(prev => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    } catch (error) {
      toast.error('Failed to update stock', {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom
      });
    }
  };

  const getStatusBadge = (status, stock) => {
    if (status === 'Out of Stock' || stock === 0) return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'Low Stock' || stock <= 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const hideSpinnersClass = "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

  return (
    <div className="space-y-6 pb-8 px-1 max-w-7xl mx-auto mt-6 relative">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory & Stock</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Monitor item availability and rapidly adjust stock levels.</p>
        </div>
      </div>

      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <MdOutlineInventory size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-sm">Total Tracked Items</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.total}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <MdErrorOutline size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-sm">Low Stock Alerts</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.lowStock}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <MdRemoveShoppingCart size={28} />
          </div>
          <div>
            <p className="text-slate-500 font-semibold text-sm">Out of Stock</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{metrics.outOfStock}</h3>
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
            placeholder="Search by title or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
          />
        </div>

        {/* Filters Container */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto">

          {/* Custom Category Dropdown */}
          <div ref={categoryRef} className="relative w-full sm:w-56 flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
            <MdFilterList size={18} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />

            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-9 pr-10 outline-none text-sm font-medium cursor-pointer"
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
            <MdFilterList size={18} className="absolute left-3 text-slate-400 pointer-events-none shrink-0" />

            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full text-left bg-transparent text-slate-700 py-2.5 pl-9 pr-10 outline-none text-sm font-medium cursor-pointer"
            >
              {selectedStatus === 'All' ? 'All Statuses' : selectedStatus}
            </button>
            <MdExpandMore size={20} className="absolute right-3 text-slate-400 pointer-events-none shrink-0" />

            {/* Downward Dropdown Menu */}
            {isStatusOpen && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-50 overflow-hidden">
                {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(status => (
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

      {/* Main Stock Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <table className="w-full text-left border-collapse min-w-225">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th
                  className="px-6 py-4 text-center cursor-pointer hover:text-slate-800 transition-colors select-none group"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Current Stock
                    <MdSwapVert size={16} className={sortConfig.key === 'stock' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Quick Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const productImg = product.images && product.images.length > 0 ? product.images[0].url || product.images[0] : null;

                  const currentInputValue = stockUpdates[product._id] !== undefined ? stockUpdates[product._id] : product.stock;
                  const hasChanged = stockUpdates[product._id] !== undefined && stockUpdates[product._id] !== product.stock;

                  return (
                    <tr key={product._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {productImg ? (
                              <img src={productImg} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <MdImage size={24} className="text-slate-300" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 max-w-62.5">
                            <span className="font-bold text-slate-800 truncate" title={product.title}>{product.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{product._id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-medium">{formatCategoryName(product.category)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getStatusBadge(product.availabilityStatus, product.stock)}`}>
                          {product.stock === 0 ? 'Out of Stock' : (product.stock <= 10 ? 'Low Stock' : 'In Stock')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-base ${product.stock === 0 ? 'text-red-600' : (product.stock <= 10 ? 'text-amber-600' : 'text-slate-700')}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentInputValue}
                            onChange={(e) => handleStockInputChange(product._id, e.target.value)}
                            className={`w-24 px-3 py-2 bg-white border rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all text-center ${hideSpinnersClass} ${hasChanged ? 'border-blue-400 focus:ring-blue-500/20' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/20'}`}
                            placeholder="Stock"
                          />
                          <button
                            onClick={() => handleSaveStock(product)}
                            disabled={!hasChanged}
                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${hasChanged ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            title="Save stock update"
                          >
                            <MdSave size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 bg-slate-50/30">
                    <div className="flex flex-col items-center justify-center">
                      <MdOutlineInventory size={48} className="text-slate-300 mb-3" />
                      <p className="font-medium text-slate-500">No products match your current stock filters.</p>
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
              Showing <span className="font-bold text-slate-800">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span> products
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

    </div>
  );
};

export default AdminStocks;