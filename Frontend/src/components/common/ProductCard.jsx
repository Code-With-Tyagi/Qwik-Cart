import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { fetchProducts, getAllCategories } from "../../features/product.slice";
import { FaStar, FaBolt, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Zoom } from "react-toastify";
import { addCartApi } from "../../features/cart.slice";
import { toast } from "react-toastify";

// Helper function to format strings to Pascal/Title Case for UI display
const formatToTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[-_]/g, " ") // Convert dashes and underscores to spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

const ProductCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ADDED: Local state to track if the initial fetch has completed to prevent UI flashing
  const [isInitialized, setIsInitialized] = useState(false);

  // Read current parameters from URL route (fallback to defaults if absent)
  const selectedCategory = searchParams.get("category") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 8;

  const { products, categories, loading, error } = useSelector((state) => state.product);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = async (productId, quantity, stock, title) => {
    // Authentication check
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });

      toast.error("Please sign in to add product in cart.", {
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

    try {
      const payload = {
        product: productId,
        quantity,
      };

      const response = await dispatch(addCartApi(payload)).unwrap();

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

  useEffect(() => {
    // Fetch products and categories on mount and wait for them to finish
    Promise.all([
      dispatch(fetchProducts()),
      dispatch(getAllCategories())
    ]).finally(() => {
      // Once fetched (success or fail), set initialization to true
      setIsInitialized(true);
    });
  }, [dispatch]);

  // AUTO-SCROLL TO TOP when URL route parameters change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [currentPage, selectedCategory]);

  // Filter products by URL category selection (Supports case-insensitive matching)
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === "All") return products;

    return products.filter((product) => {
      const categoryId = product.category?._id || product.category;
      const categoryName = product.category?.name || product.category;

      return (
        String(categoryId) === selectedCategory ||
        String(categoryName).toLowerCase() === selectedCategory.toLowerCase()
      );
    });
  }, [products, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleCategoryChange = (categoryValue) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryValue === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", categoryValue.toLowerCase());
    }
    newParams.set("page", "1"); // Always reset page to 1 on filter switch
    setSearchParams(newParams);
  };

  const handlePageChange = (pageValue) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(pageValue));
    setSearchParams(newParams);
  };

  // Modern Minimalist Loading Indicator 
  // FIX: Added !isInitialized check to prevent flashing
  if (!isInitialized || (loading && (!products || products.length === 0))) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading Catalog...</p>
        </div>
      </div>
    );
  }

  // Modern Clean Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-red-50 text-red-800 p-8 rounded-2xl border border-red-100">
          <h2 className="text-lg font-bold mb-1">Unable to load products</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

      {/* Horizontal Scrollable Categories Filter */}
      <div className="flex overflow-x-auto items-center gap-2 mb-8 pb-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => handleCategoryChange("All")}
          className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${selectedCategory === "All"
            ? "bg-gray-900 text-white shadow-sm"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
        >
          All Products
        </button>
        {categories?.map((category) => {
          const catId = category._id || category;
          const catNameRaw = category.name || category;
          const catNameFormatted = formatToTitleCase(catNameRaw);

          const isSelected =
            selectedCategory.toLowerCase() === String(catId).toLowerCase() ||
            selectedCategory.toLowerCase() === String(catNameRaw).toLowerCase();

          return (
            <button
              key={catId}
              onClick={() => handleCategoryChange(catNameRaw)}
              className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-colors duration-200 ${isSelected
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
            >
              {catNameFormatted}
            </button>
          );
        })}
      </div>

      {/* Empty State Layout */}
      {currentProducts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-20 text-center border border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-gray-500">Try selecting a different category to see more products.</p>
        </div>
      )}

      {/* Products Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => {
          const rawDiscount = product.discount ?? product.discountPercentage;
          let discountPercentage = null;

          if (rawDiscount !== undefined && rawDiscount !== null) {
            if (typeof rawDiscount === "number") {
              discountPercentage = rawDiscount;
            } else {
              const parsedValue = Number(String(rawDiscount).replace(/[^0-9.-]+/g, ""));
              discountPercentage = Number.isNaN(parsedValue) ? null : parsedValue;
            }
          }

          if (!discountPercentage && product.originalPrice && product.price < product.originalPrice) {
            discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          }

          return (
            <div
              key={product._id}
              className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
            >
              {/* Top Tags */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20 pointer-events-none">
                {discountPercentage > 0 && (
                  <div className="bg-gray-900 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {discountPercentage}% OFF
                  </div>
                )}
                {product.rating && (
                  <div className="ml-auto bg-white text-gray-900 border border-gray-200 flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-bold shadow-sm">
                    {product.rating} <FaStar size={10} className="text-gray-900 mb-px" />
                  </div>
                )}
              </div>

              {/* Product Image */}
              <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={product.images?.[0]?.url || "/Q.png"}
                  alt={product.title}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>

              {/* Product Details */}
              <div className="p-4 md:p-5 flex flex-col grow bg-white z-10 relative border-t border-gray-50">
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    <FaBolt size={8} /> Qwik Delivery
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 mb-2 leading-tight line-clamp-2" title={product.title}>
                  {product.title}
                </h4>

                <div className="flex items-end gap-2 mt-auto">
                  <span className="text-lg font-black text-gray-900">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="text-sm font-semibold text-gray-400 line-through mb-0.5">
                      ₹{(product.price / (1 - discountPercentage / 100)).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>

                <div className="mt-4 xl:mt-0 xl:absolute xl:bottom-0 xl:left-0 xl:right-0 xl:p-4 xl:translate-y-full xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100 transition-all duration-300 bg-white cursor-pointer">
                  <button
                    onClick={() => handleAddToCart(product._id, 1, product.stock, product.title)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm cursor-pointer"
                  >
                    <FaPlus size={10} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination at the bottom */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 mb-4">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <FaChevronLeft size={14} />
          </button>

          <span className="text-sm font-semibold text-gray-600">
            Page <span className="font-bold text-gray-900">{currentPage}</span> <span className="font-normal text-gray-400 mx-1">of</span> {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      )}

    </div>
  );
};

export default ProductCard;