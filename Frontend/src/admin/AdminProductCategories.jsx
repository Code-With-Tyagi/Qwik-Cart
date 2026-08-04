import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MdSearch,
    MdOutlineFolder,
    MdCategory,
    MdClose,
    MdSave,
    MdImage,
    MdWarning,
    MdCancel
} from 'react-icons/md';
import { toast, Zoom } from 'react-toastify';

// Ensure this path matches your project structure
import { fetchProducts, updateProduct } from '../features/product.slice';

// Helper function to format categories (e.g., "women-dresses" -> "Women Dresses")
const formatCategoryName = (categoryStr) => {
    if (!categoryStr) return 'Uncategorized';
    return categoryStr
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const AdminProductCategories = () => {
    const dispatch = useDispatch();

    // State for search filter
    const [searchQuery, setSearchQuery] = useState('');

    // States for Stock Management Modal
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [selectedCategoryForStock, setSelectedCategoryForStock] = useState(null);
    const [stockViewType, setStockViewType] = useState(''); // 'Low Stock' or 'Out of Stock'
    const [stockUpdates, setStockUpdates] = useState({}); // Local state for input fields

    // Fetch products on mount to calculate category metrics
    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const reduxProducts = useSelector((state) => state.product.products) || [];

    // Dynamically calculate category stats based on Redux products
    const categoryStats = useMemo(() => {
        const statsMap = {};

        reduxProducts.forEach(product => {
            const cat = product.category || 'Uncategorized';

            if (!statsMap[cat]) {
                statsMap[cat] = {
                    id: cat,
                    name: cat,
                    totalProducts: 0,
                    totalUnitsSold: 0,
                    totalPrice: 0,
                    lowStockCount: 0,
                    outOfStockCount: 0
                };
            }

            statsMap[cat].totalProducts += 1;
            statsMap[cat].totalUnitsSold += (product.totalSold || 0);
            statsMap[cat].totalPrice += (product.price || 0);

            if (product.availabilityStatus === 'Low Stock') {
                statsMap[cat].lowStockCount += 1;
            } else if (product.availabilityStatus === 'Out of Stock' || product.stock === 0) {
                statsMap[cat].outOfStockCount += 1;
            }
        });

        return Object.values(statsMap).map(cat => ({
            ...cat,
            averagePrice: cat.totalProducts > 0 ? cat.totalPrice / cat.totalProducts : 0
        })).sort((a, b) => b.totalProducts - a.totalProducts);
    }, [reduxProducts]);

    // Filter categories based on search query
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categoryStats;
        const lowerQuery = searchQuery.toLowerCase();
        return categoryStats.filter(cat =>
            cat.name.toLowerCase().includes(lowerQuery)
        );
    }, [categoryStats, searchQuery]);

    // Handle opening the stock management panel
    const openStockModal = (categoryName, type) => {
        setSelectedCategoryForStock(categoryName);
        setStockViewType(type);
        setStockUpdates({}); // Reset pending inputs
        setIsStockModalOpen(true);
    };

    // Get products specific to the opened panel
    const modalProducts = useMemo(() => {
        if (!selectedCategoryForStock) return [];
        return reduxProducts.filter(p => {
            const isCatMatch = (p.category || 'Uncategorized') === selectedCategoryForStock;
            const isStockMatch = stockViewType === 'Low Stock'
                ? p.availabilityStatus === 'Low Stock'
                : (p.availabilityStatus === 'Out of Stock' || p.stock === 0);
            return isCatMatch && isStockMatch;
        });
    }, [reduxProducts, selectedCategoryForStock, stockViewType]);

    // Handle changing stock value in the input field
    const handleStockInputChange = (productId, val) => {
        setStockUpdates(prev => ({
            ...prev,
            [productId]: Number(val)
        }));
    };

    // Dispatch the update when admin clicks save
    const handleSaveStock = async (product) => {
        const newStock = stockUpdates[product._id] !== undefined ? stockUpdates[product._id] : product.stock;

        // Automatically determine new status based on standard logic (Adjust thresholds if needed)
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

            // Clean up local update state for this product
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

    const hideSpinnersClass = "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

    return (
        <div className="space-y-6 pb-8 px-1 max-w-7xl mx-auto mt-6 relative">

            {/* Header Section (Clean, original design, NO Add Button) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Categories</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">View performance metrics and manage category stock levels.</p>
                </div>
            </div>

            {/* Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MdSearch size={20} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories by name..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                    />
                </div>
            </div>

            {/* Clean Data Table (NO Action Column) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <table className="w-full text-left border-collapse min-w-225">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Category Name</th>
                                <th className="px-6 py-4 text-center">Total Products</th>
                                <th className="px-6 py-4 text-center">Units Sold</th>
                                <th className="px-6 py-4 text-center">Average Price</th>
                                <th className="px-6 py-4 text-center">Low Stock</th>
                                <th className="px-6 py-4 text-center">Out of Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group">

                                        {/* Category Name Column */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                                    <MdOutlineFolder size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{formatCategoryName(cat.name)}</span>
                                                    <span className="text-xs text-slate-500 mt-0.5 font-mono">{cat.name}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Total Products Column */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-slate-700">{cat.totalProducts}</span>
                                            <span className="text-slate-400 ml-1 text-xs">items</span>
                                        </td>

                                        {/* Units Sold Column */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-emerald-600">{cat.totalUnitsSold.toLocaleString()}</span>
                                        </td>

                                        {/* Average Price Column */}
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-slate-700">₹{cat.averagePrice.toFixed(2)}</span>
                                        </td>

                                        {/* Low Stock Column (Interactive) */}
                                        <td className="px-6 py-4 text-center">
                                            {cat.lowStockCount > 0 ? (
                                                <button
                                                    onClick={() => openStockModal(cat.name, 'Low Stock')}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:shadow-sm hover:ring-2 hover:ring-amber-500/20 transition-all cursor-pointer"
                                                    title="Click to manage low stock products"
                                                >
                                                    <MdWarning size={14} className="mr-1" />
                                                    {cat.lowStockCount} Products
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 font-medium">-</span>
                                            )}
                                        </td>

                                        {/* Out of Stock Column (Interactive) */}
                                        <td className="px-6 py-4 text-center">
                                            {cat.outOfStockCount > 0 ? (
                                                <button
                                                    onClick={() => openStockModal(cat.name, 'Out of Stock')}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:shadow-sm hover:ring-2 hover:ring-red-500/20 transition-all cursor-pointer"
                                                    title="Click to manage out of stock products"
                                                >
                                                    <MdCancel size={14} className="mr-1" />
                                                    {cat.outOfStockCount} Products
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 font-medium">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400 bg-slate-50/30">
                                        <div className="flex flex-col items-center justify-center">
                                            <MdCategory size={40} className="text-slate-300 mb-3" />
                                            <p className="font-medium text-slate-500">No categories match your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* STOCK MANAGEMENT SLIDE-OVER PANEL */}
            <div
                className={`fixed inset-0 z-100 overflow-hidden transition-all duration-500 ${isStockModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-labelledby="slide-over-title"
                role="dialog"
                aria-modal="true"
            >
                {/* Dark Backdrop */}
                <div
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${isStockModalOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsStockModalOpen(false)}
                />

                {/* Sliding Panel */}
                <div className={`absolute inset-y-0 right-0 w-full sm:w-125 md:w-150 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isStockModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Panel Header */}
                    <div className="px-6 py-5 border-b border-slate-100 bg-white/90 backdrop-blur-md z-10 sticky top-0 flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight" id="slide-over-title">
                                Stock Management
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                    {formatCategoryName(selectedCategoryForStock)}
                                </span>
                                <span className="text-sm text-slate-400 font-medium">•</span>
                                <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-md border ₹{stockViewType === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                    {stockViewType}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsStockModalOpen(false)}
                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                            title="Close panel"
                        >
                            <MdClose size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content (List of Products) */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {modalProducts.length > 0 ? (
                            <div className="space-y-4">
                                {modalProducts.map(product => {
                                    const currentInputValue = stockUpdates[product._id] !== undefined ? stockUpdates[product._id] : product.stock;
                                    const hasChanged = stockUpdates[product._id] !== undefined && stockUpdates[product._id] !== product.stock;
                                    const productImg = product.images && product.images.length > 0 ? product.images[0].url || product.images[0] : null;

                                    return (
                                        <div key={product._id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-blue-300 transition-colors">

                                            {/* Image & Basic Info */}
                                            <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {productImg ? (
                                                        <img src={productImg} alt={product.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MdImage size={24} className="text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="font-bold text-slate-800 truncate text-sm" title={product.title}>{product.title}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{product._id}</span>
                                                    <span className="text-sm font-semibold text-emerald-600 mt-1">₹{product.price?.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {/* Stock Input & Save Action */}
                                            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 bg-slate-50 p-2 sm:p-0 sm:bg-transparent rounded-xl border border-slate-100 sm:border-none">
                                                <div className="flex flex-col w-full sm:w-24">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">New Stock</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={currentInputValue}
                                                        onChange={(e) => handleStockInputChange(product._id, e.target.value)}
                                                        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all ${hideSpinnersClass} ${hasChanged ? 'border-blue-400 focus:ring-blue-500/20' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-500/20'}`}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleSaveStock(product)}
                                                    disabled={!hasChanged}
                                                    className={`mt-4 sm:mt-5 p-2 rounded-lg flex items-center justify-center transition-all ${hasChanged ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                                    title="Save new stock level"
                                                >
                                                    <MdSave size={20} />
                                                </button>
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                                <MdOutlineFolder size={64} className="text-slate-300" />
                                <h3 className="text-lg font-bold text-slate-600">All Caught Up!</h3>
                                <p className="text-sm text-slate-500 max-w-xs">There are no {stockViewType.toLowerCase()} products remaining in this category.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
};

export default AdminProductCategories;