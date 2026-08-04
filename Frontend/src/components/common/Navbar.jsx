import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUserApi } from "../../api/auth.api";
import {persistor } from "../../app/store";
import { clearCart } from "../../features/cart.slice";
import {
  FaShoppingCart,
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaChevronDown,
  FaCog,
  FaTachometerAlt,
  FaClipboardList,
  FaBoxOpen,
  FaUsers,
  FaBox,
  FaHeart,
  FaMapMarkerAlt,
  FaHeadset
} from "react-icons/fa";
import { logoutSuccess } from "../../features/auth.slice";
import { getAllCategories } from "../../features/product.slice"; // Imported API Thunk
import { clearWishlistState } from "../../features/wishlist.slice";

// Helper function to format strings to Pascal/Title Case for UI display
const formatToTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[-_]/g, " ") // Convert dashes and underscores to spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const categoriesRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user) || {};

  // Extract categories from product state
  const categories = useSelector((state) => state.product?.categories || []);

  const userRole = user.role ? String(user.role).toLowerCase() : "user";
  const displayName = user.name || user.userName || "Guest";
  const displayEmail = user.email || user.userEmail || "";
  const cartLength = useSelector((state) => state.cart?.cartLength || 0);
  const showCartBadge = isAuthenticated && cartLength > 0;

  // Updated Links (Home is now handled explicitly before Categories)
  const navLinks = [
    { name: "Explore", path: "/shop" },
    { name: "FAQ", path: "/faq" },
  ];

  // Fetch categories when the Navbar mounts
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsCategoriesOpen(false);
    setIsMobileCategoriesOpen(false);
  }, [location.pathname]);

  // Handle scroll for navbar shrinking effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logoutUserApi();
      dispatch(clearCart());
      dispatch(clearWishlistState());
      await persistor.purge();
      
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      dispatch(logoutSuccess({ skipProtectedToast: true }));
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
      navigate("/");
    }
  };

  return (
    <>
      {/* Full-Width Sticky Navbar with Thicker Border */}
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border-b-2 ${scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-zinc-200/80"
          : "bg-white border-zinc-100"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ease-in-out ${scrolled ? "h-16" : "h-20"}`}>

            {/* Minimalist Logo */}
            <Link
              to="/"
              className="group flex w-max items-center gap-3 rounded-xl bg-sky-50 border border-sky-100/80 px-4 py-2.5 shadow-[0_2px_10px_-3px_rgba(14,165,233,0.1)] transition-all duration-300 hover:border-sky-300 hover:bg-sky-100/50 hover:shadow-[0_6px_14px_-4px_rgba(14,165,233,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              title="Go to Homepage"
            >
              {/* Completely static Logo Icon ensuring 100% visibility of tires */}
              <div className="flex shrink-0 items-center justify-center">
                <img
                  src="/shopping-cart.png"
                  alt="QwikCart Logo"
                  className="h-7 w-7 object-contain"
                />
              </div>

              {/* Typography & Seamless Inline Badge */}
              <div className="flex items-baseline gap-2">
                {/* Bold, Italicized Brand Name in dark navy to match the tires */}
                <span className="text-[22px] font-black italic tracking-tight text-slate-900 leading-none select-none">
                  QwikCart
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation with Categories and Links */}
            <div className="hidden lg:flex items-center gap-8">

              {/* 1. Home Link */}
              <Link
                to="/"
                className="relative text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors py-2 group cursor-pointer"
              >
                Home
                <span className="absolute bottom-1 left-0 w-full h-[1.5px] bg-zinc-900 origin-bottom-right scale-x-0 transition-transform duration-300 ease-out group-hover:origin-bottom-left group-hover:scale-x-100"></span>
              </Link>

              {/* 2. Categories Dropdown Container */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors py-2 cursor-pointer outline-none"
                >
                  <span>Categories</span>
                  <FaChevronDown
                    size={10}
                    className={`text-zinc-400 transition-transform duration-300 ${isCategoriesOpen ? "rotate-180 text-zinc-900" : ""
                      }`}
                  />
                </button>

                {/* Categories Dropdown Menu Card */}
                <div
                  className={`absolute left-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-zinc-200/60 py-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-left z-50 ${isCategoriesOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-2"
                    }`}
                >
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Product Categories</p>
                  </div>
                  {/* Added hidden scrollbar classes here */}
                  <div className="px-2 pt-1.5 pb-1.5 space-y-0.5 max-h-64 overflow-y-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
                    {categories.length > 0 ? (
                      categories.map((category) => {
                        const catId = category._id || category;
                        const catNameRaw = category.name || category;
                        const catNameFormatted = formatToTitleCase(catNameRaw);

                        return (
                          <Link
                            key={catId}
                            to={`/shop?category=${catNameRaw.toLowerCase()}&page=1`}
                            onClick={() => setIsCategoriesOpen(false)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {catNameFormatted}
                          </Link>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-xs text-zinc-400">Loading categories...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. General Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors py-2 group cursor-pointer"
                >
                  {link.name}
                  <span className="absolute bottom-1 left-0 w-full h-[1.5px] bg-zinc-900 origin-bottom-right scale-x-0 transition-transform duration-300 ease-out group-hover:origin-bottom-left group-hover:scale-x-100"></span>
                </Link>
              ))}
            </div>

            {/* Desktop Search, Cart, & Profile */}
            <div className="flex items-center gap-3 sm:gap-5">

              {/* Search - Minimal Expanding */}
              <div className="hidden md:flex relative group">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors duration-300" size={13} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-32 lg:w-40 focus:w-56 lg:focus:w-64 pl-9 pr-4 py-2 text-sm font-medium rounded-full bg-zinc-100/70 border border-transparent focus:bg-white focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-zinc-400"
                />
              </div>

              <div className="h-5 w-px bg-zinc-200 hidden sm:block"></div>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative text-zinc-500 hover:text-zinc-900 transition-colors duration-300 active:scale-95 cursor-pointer"
              >
                <FaShoppingCart size={18} />
                {showCartBadge && (
                  <span className="absolute -top-1.5 -right-2 bg-zinc-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartLength}
                  </span>
                )}
              </Link>

              {/* Auth/Profile Section */}
              <div className="hidden sm:block">
                {isAuthenticated ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full hover:bg-zinc-100 transition-colors duration-300 active:scale-95 outline-none cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-zinc-700">{displayName.split(" ")[0]}</span>
                      <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300">
                        <FaUser size={13} className="text-zinc-500 mt-1" />
                      </div>
                    </button>

                    {/* Profile Dropdown - Updated Layout */}
                    <div
                      className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-zinc-200/60 py-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right z-50 ${isProfileOpen ? "opacity-100 scale-100 visible translate-y-0" : "opacity-0 scale-95 invisible -translate-y-2"
                        }`}
                    >
                      {/* Section 1: User Info */}
                      <div className="px-5 py-3 mb-1 border-b border-zinc-100">
                        <p className="text-sm font-bold text-zinc-900 truncate">{displayName}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{displayEmail}</p>
                        {userRole === "admin" && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="px-2 space-y-0.5">
                        {/* Admin Links */}
                        {userRole === "admin" && (
                          <>
                            <Link to="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                              <FaTachometerAlt size={14} className="text-zinc-400" /> Admin Dashboard
                            </Link>
                            <Link to="/admin/products" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                              <FaBoxOpen size={14} className="text-zinc-400" /> Manage Products
                            </Link>
                            <Link to="/admin/users" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                              <FaUsers size={14} className="text-zinc-400" /> Manage Users
                            </Link>
                            <Link to="/admin/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                              <FaClipboardList size={14} className="text-zinc-400" /> Manage Orders
                            </Link>
                            <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                          </>
                        )}

                        {/* Section 2: Profile & Orders */}
                        <Link to="/user/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                          <FaUser size={14} className="text-zinc-400" /> My Profile
                        </Link>
                        <Link to="/user/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                          <FaBox size={14} className="text-zinc-400" /> My Orders
                        </Link>
                        <Link to="/user/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                          <FaHeart size={14} className="text-zinc-400" /> Wishlist
                        </Link>

                        {/* Section 3: Addresses */}
                        <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                        <Link to="/user/addresses" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                          <FaMapMarkerAlt size={14} className="text-zinc-400" /> Saved Addresses
                        </Link>

                        {/* Section 4: Settings & Support */}
                        <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                        <Link to="/contact" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer">
                          <FaHeadset size={14} className="text-zinc-400" /> Help & Support
                        </Link>

                        {/* Section 5: Sign Out */}
                        <div className="h-px bg-zinc-100 my-1 mx-2"></div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors outline-none cursor-pointer">
                          <FaSignOutAlt size={14} className="text-red-400" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors duration-300 active:scale-95 shadow-sm cursor-pointer"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-zinc-600 hover:text-zinc-900 transition-colors p-1 active:scale-95 cursor-pointer"
              >
                <FaBars size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE FULLSCREEN MENU OVERLAY --- */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        {/* Background Blur Overlay */}
        <div
          className={`absolute inset-0 bg-white/60 backdrop-blur-2xl transition-opacity ${isMobileMenuOpen ? "opacity-100 duration-150" : "opacity-0 duration-300"
            }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sliding Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-[85%] max-w-sm h-full bg-white border-l border-zinc-200 shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-100">
            <span className="text-xl font-black tracking-tight text-zinc-900">Menu.</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* Mobile Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl bg-zinc-100/80 border border-transparent focus:bg-white focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
              />
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-2">Navigation</p>

              {/* 1. Home Link */}
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer"
              >
                Home
                <FaChevronDown className="text-zinc-300 -rotate-90" size={12} />
              </Link>

              {/* 2. Mobile Categories Accordion Panel */}
              <div className="flex flex-col">
                <button
                  onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer outline-none"
                >
                  <span>Categories</span>
                  <FaChevronDown
                    className={`text-zinc-400 transition-transform duration-300 ${isMobileCategoriesOpen ? "rotate-180 text-zinc-900" : ""
                      }`}
                    size={12}
                  />
                </button>

                {/* Accordion Expansion Body */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out pl-4 ${isMobileCategoriesOpen ? "max-h-60 opacity-100 my-1" : "max-h-0 opacity-0 pointer-events-none"
                  }`}>
                  <div className="bg-zinc-50/50 rounded-xl p-1.5 space-y-0.5 border border-zinc-100 max-h-48 overflow-y-auto">
                    {categories.length > 0 ? (
                      categories.map((category) => {
                        const catId = category._id || category;
                        const catNameRaw = category.name || category;
                        const catNameFormatted = formatToTitleCase(catNameRaw);

                        return (
                          <Link
                            key={catId}
                            to={`/shop?category=${catNameRaw.toLowerCase()}&page=1`}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setIsMobileCategoriesOpen(false);
                            }}
                            className="block px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {catNameFormatted}
                          </Link>
                        );
                      })
                    ) : (
                      <div className="block px-4 py-2 text-sm font-semibold text-zinc-400">Loading...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Standard Links including FAQ */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 active:scale-95 transition-all cursor-pointer"
                >
                  {link.name}
                  <FaChevronDown className="text-zinc-300 -rotate-90" size={12} />
                </Link>
              ))}
            </div>

            {/* Mobile Auth/Profile Area */}
            <div className="pt-4 border-t border-zinc-100">
              {isAuthenticated ? (
                <div className="space-y-4">
                  {/* Section 1: User Info */}
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                      <FaUser size={20} className="text-zinc-400 mt-2" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-zinc-900">{displayName}</p>
                      <p className="text-xs font-medium text-zinc-500">{displayEmail}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-2xl p-2 space-y-1">
                    {/* Admin Links */}
                    {userRole === "admin" && (
                      <>
                        <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                          <FaTachometerAlt size={16} className="text-zinc-400" /> Admin Dashboard
                        </Link>
                        <Link to="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                          <FaBoxOpen size={16} className="text-zinc-400" /> Manage Products
                        </Link>
                        <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                          <FaUsers size={16} className="text-zinc-400" /> Manage Users
                        </Link>
                        <Link to="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                          <FaClipboardList size={16} className="text-zinc-400" /> Manage Orders
                        </Link>
                        <div className="h-px bg-zinc-200 my-2 mx-2"></div>
                      </>
                    )}

                    {/* Section 2: Profile & Orders */}
                    <Link to="/user/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                      <FaUser size={16} className="text-zinc-400" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                      <FaBox size={16} className="text-zinc-400" /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                      <FaHeart size={16} className="text-zinc-400" /> Wishlist
                    </Link>

                    {/* Section 3: Addresses */}
                    <div className="h-px bg-zinc-200 my-1 mx-2"></div>
                    <Link to="/addresses" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                      <FaMapMarkerAlt size={16} className="text-zinc-400" /> Saved Addresses
                    </Link>

                    {/* Section 4: Settings & Support */}
                    <div className="h-px bg-zinc-200 my-1 mx-2"></div>
                    <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                      <FaCog size={16} className="text-zinc-400" /> Account Settings
                    </Link>
                    <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer">
                      <FaHeadset size={16} className="text-zinc-400" /> Help & Support
                    </Link>

                    {/* Section 5: Sign Out */}
                    <div className="h-px bg-zinc-200 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors outline-none cursor-pointer">
                      <FaSignOutAlt size={16} className="text-red-400" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-zinc-900 text-white py-3.5 rounded-xl font-semibold text-center hover:bg-zinc-800 transition-colors active:scale-95 shadow-sm cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-zinc-50 text-zinc-900 py-3.5 rounded-xl font-semibold text-center border border-zinc-200 hover:bg-zinc-100 transition-colors active:scale-95 cursor-pointer"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;