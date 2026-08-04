import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  PlusCircle,
  Database,
  Globe,
  Rocket,
  Menu,
  X,
  MessageSquare,
  Settings,
  Tag,
  Boxes,
  Layers
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();
  const [isMobileLeftMenuOpen, setIsMobileLeftMenuOpen] = useState(false);
  
  // Fetching user data from Redux
  const reduxUser = useSelector((state) => state.auth.user);

  const menuCategories = [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
      ],
    },
    {
      title: "Store Management",
      items: [
        { title: "Products List", path: "/admin/products", icon: <Package size={18} /> },
        { title: "Create Product", path: "/admin/create-product", icon: <PlusCircle size={18} /> },
        { title: "Categories", path: "/admin/categories", icon: <Layers size={18} /> },
        { title: "Stock & Inventory", path: "/admin/inventory", icon: <Boxes size={18} /> },
        { title: "Orders & Shipping", path: "/admin/orders", icon: <ShoppingCart size={18} />, badge: "12" },
      ],
    },
    {
      title: "CRM & Comms",
      items: [
        { title: "User Database", path: "/admin/users", icon: <Users size={18} /> },
        { title: "Contact Messages", path: "/admin/contacts", icon: <MessageSquare size={18} />, badge: "New" },
        { title: "Customer Reviews", path: "/admin/reviews", icon: <Star size={18} /> },
      ],
    },
    {
      title: "System Tools",
      items: [
        { title: "Database Seeding", path: "/admin/seed-products", icon: <Database size={18} /> },
      ],
    },
  ];

  // Extracted Navigation to reuse in both Desktop and Mobile sidebars
  const NavigationContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100 shrink-0">
        <div className="bg-linear-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20">
          <Rocket size={20} />
        </div>
        <span className="font-bold text-lg text-slate-800 tracking-tight">
          QwikCart
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-hide">
        {menuCategories.map((category, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-bold text-slate-400 mb-2.5 uppercase tracking-wider">
              {category.title}
            </h3>
            <ul className="space-y-1">
              {category.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileLeftMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-100"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${isActive ? "text-blue-600" : "text-slate-400"}`}>
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
                      </div>
                      
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          item.badge === "New" 
                            ? "bg-emerald-100 text-emerald-700 animate-pulse" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="w-64 bg-white border-r border-slate-200/60 flex-col hidden lg:flex shrink-0 z-20 shadow-sm">
        <NavigationContent />
      </aside>

      {/* ---------------- MOBILE SIDEBAR (WITH SMOOTH TRANSITION) ---------------- */}
      
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileLeftMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileLeftMenuOpen(false)}
      />

      {/* Slide-in Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-70 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileLeftMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button 
          onClick={() => setIsMobileLeftMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors z-50"
        >
          <X size={18} />
        </button>
        <NavigationContent />
      </aside>

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Topbar Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex justify-between items-center px-4 sm:px-6 lg:px-8 shrink-0 z-10 sticky top-0">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileLeftMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link 
              to="/" 
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors hidden sm:block"
            >
              <Globe size={18} />
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

            {/* Profile Dropdown Area */}
            <button className="flex items-center gap-3 pl-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors text-left group">
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {reduxUser?.name || "Admin User"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {reduxUser?.role || "Administrator"}
                </p>
              </div>
              <div className="relative">
                {/* Custom Grey and White Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-200 text-slate-600 font-bold border-2 border-white shadow-sm group-hover:border-blue-100 transition-colors">
                  A
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content Workspace */}
        <main data-scroll-container="page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;