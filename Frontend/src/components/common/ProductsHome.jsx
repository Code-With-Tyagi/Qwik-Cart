import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts } from "../../features/product.slice";
import { FaStar, FaBolt, FaPlus } from "react-icons/fa";
import { addCartApi } from "../../features/cart.slice";
import { Zoom } from "react-toastify";
import { toast } from "react-toastify";

const ProductHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { products, loading, error } = useSelector((state) => state.product);
  // Pull authentication status from your auth slice
  const { isAuthenticated } = useSelector((state) => state.auth);

  const productList = products;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = async (productId, quantity, stock, title) => {
    // Check if user is logged in
    if (!isAuthenticated) {
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

      navigate("/login", { state: { from: location } });
      return;
    }

    // Check stock before calling backend
    if (stock <= 0) {
      toast.error(`${title} is currently out of stock.`, {
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

  // Clean, Minimalist Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Loading catalog...</p>
        </div>
      </div>
    );
  }

  // Clean Error State
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="bg-red-50 text-red-800 p-6 rounded-3xl border border-red-100">
          <h2 className="text-lg font-bold mb-1">Unable to load products</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Clean Empty State
  if (productList?.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">
          Featured Products
        </h1>
        <div className="flex flex-col items-center justify-center rounded-4xl bg-gray-50 p-16 text-center">
          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Our catalog is currently empty. Please check back soon.</p>
        </div>
      </div>
    );
  }

  // Limit to 20 products
  const displayedProducts = productList?.slice(0, 16);

  return (
    <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

      {/* Header Layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6 md:mb-8">
        <div>
          <h3 className="text-2xl md:text-4xl font-black tracking-tight text-black mb-1.5">Our Collections</h3>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Discover our latest collection.</p>
        </div>
        <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200">
          {displayedProducts?.length || 0} Products
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts?.map((product) => {
          // Fallbacks in case your DB doesn't have these fields yet
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
          const displayDiscount = discountPercentage;
          const displayRating = product.rating || "4.5";

          return (
            <div
              key={product._id}
              className="group relative bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
            >

              {/* Tags Layout */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20 pointer-events-none">
                <div className="bg-black text-white px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm">
                  {displayDiscount} % off
                </div>
                <div className="bg-white text-black border border-stone-200 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-bold shadow-sm">
                  {displayRating} <FaStar size={9} className="text-black mb-px" />
                </div>
              </div>

              {/* Product Image Wrapper */}
              <div className="relative aspect-square bg-stone-50 p-4 overflow-hidden flex items-center justify-center">
                <img
                  src={product.images?.[0]?.url || "/Q.png"}
                  alt={product.title}
                  onClick={() => { navigate(`/product/${product._id}`) }}
                  className="w-full h-full object-cover rounded-xl mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-in-out"
                />
              </div>

              {/* Product Specs Content */}
              <div className="p-4 md:p-5 flex flex-col grow bg-white z-10 relative">
                <div className="mb-2.5">
                  <span className="inline-flex items-center gap-1 bg-stone-100 text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                    <FaBolt size={7} /> Qwik Delivery
                  </span>
                </div>

                <h4 className="text-xs md:text-sm font-bold text-gray-900 mb-2 leading-tight line-clamp-2" title={product.title}>
                  {product.title}
                </h4>

                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-base md:text-lg font-black text-black">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>

                  {product.discountPercentage > 0 && (
                    <span className="text-sm md:text-base font-semibold text-gray-400 line-through">
                      ₹{
                        (
                          product.price /
                          (1 - product.discountPercentage / 100)
                        ).toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })
                      }
                    </span>
                  )}
                </div>

                {/* GUARANTEED FIX: xl breakpoints ensure static mobile view layout on all tablets including large iPad Pros */}
                <div className="mt-4 xl:mt-0 xl:absolute xl:bottom-0 xl:left-0 xl:right-0 xl:p-4 xl:translate-y-full xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100 transition-all duration-300 bg-white">
                  <button
                    onClick={() => handleAddToCart(product._id, 1, product.price)}
                    style={{ cursor: "pointer" }}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800"
                  >
                    <FaPlus size={9} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Entire Catalog Button */}
      <div className="mt-12 md:mt-16 text-center">
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center justify-center bg-white text-black border-2 border-black px-8 py-3.5 md:px-10 md:py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        >
          View Entire Catalog
        </button>
      </div>

    </div>
  );
};

export default ProductHome;