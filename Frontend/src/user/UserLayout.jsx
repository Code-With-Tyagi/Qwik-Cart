import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUser,
  FaPowerOff,
  FaBars,
  FaChevronRight,
  FaBox,
  FaTimes,
  FaHeadset
} from "react-icons/fa";
import { MdFolderShared } from "react-icons/md";

import { logoutUserApi } from "../api/auth.api";
import { logoutSuccess } from "../features/auth.slice";
import { clearWishlistState } from "../features/wishlist.slice";
import { clearCart } from "../features/cart.slice";
import { persistor } from "../app/store";

const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const menuSections = [
    {
      title: "My Orders",
      icon: FaBox,
      subItems: [
        { name: "All Orders", path: "/user/orders" },
      ]
    },
    {
      title: "Account Settings",
      icon: FaUser,
      subItems: [
        { name: "Profile Information", path: "/user/profile" },
        { name: "Manage Addresses", path: "/user/addresses" },
        { name: "Change Password", path: "/user/change-password" },
      ]
    },
    {
      title: "My Stuff",
      icon: MdFolderShared,
      subItems: [
        { name: "My Wishlist", path: "/user/wishlist" },
        { name: "My Reviews & Ratings", path: "/user/reviews" },
      ]
    },

    {
      title: "Support",
      icon: FaHeadset, // or MdSupportAgent
      subItems: [
        { name: "Contact Support", path: "/user/support" },
        { name: "My Requests", path: "/user/support/requests" },
      ]
    }
  ];

  const handleSignOut = async () => {
    dispatch(clearCart());
    dispatch(clearWishlistState());
    dispatch(logoutSuccess({ skipProtectedToast: true }));
    setIsSidebarOpen(false);
    navigate("/");

    void Promise.allSettled([
      logoutUserApi(),
      persistor.purge(),
    ]).catch((error) => {
      console.error("Logout cleanup failed:", error);
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">

      {/* 1. Profile Header */}
      <div className="flex items-center gap-4 px-8 py-10 shrink-0">
        <img
          src="/profile.png"
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover shrink-0 border border-blue-100 shadow-sm"
        />
        <div>
          <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] mb-1">
            Hello,
          </p>
          <p className="font-bold text-xl text-gray-900 tracking-tight truncate w-40">
            {user?.name || "Your Account"}
          </p>
        </div>
      </div>

      {/* 2. Main Navigation Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="pb-8">
          {menuSections.map((section, idx) => {
            const SectionIcon = section.icon;

            return (
              <div key={idx} className="mb-6 last:mb-0">

                {/* Section Header */}
                {section.isLink ? (
                  <Link
                    to={section.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center justify-between px-8 py-2 w-full group transition-colors hover:bg-blue-50/30"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon in Flipkart Blue */}
                      <SectionIcon size={16} className="text-[#2874f0] shrink-0" />
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wide group-hover:text-[#2874f0] transition-colors">
                        {section.title}
                      </span>
                    </div>
                    <FaChevronRight className="text-[#2874f0] text-xs" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-8 py-2 mb-2">
                    {/* Icon in Flipkart Blue */}
                    <SectionIcon size={16} className="text-[#2874f0] shrink-0" />
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      {section.title}
                    </span>
                  </div>
                )}

                {/* Sub-items */}
                {section.subItems && (
                  <div className="flex flex-col">
                    {section.subItems.map((item) => {
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`pl-16 pr-8 py-2.5 text-[14.5px] flex items-center justify-between border-l-2 transition-all duration-200 ${isActive
                            ? "border-[#2874f0] bg-blue-50/50 text-[#2874f0] font-semibold"
                            : "border-transparent text-gray-500 hover:text-[#2874f0] hover:bg-blue-50/30 font-medium"
                            }`}
                        >
                          {item.name}
                          {item.badge && (
                            <span className="bg-[#2874f0] text-white px-2.5 py-0.5 rounded-sm font-bold text-[10px] tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-8 mt-auto border-t border-gray-100">
        <button
          type="button"
          className="flex items-center gap-3 text-gray-500 hover:text-red-500 transition-colors group cursor-pointer w-full text-left"
          onClick={handleSignOut}
        >
          <FaPowerOff className="text-lg text-[#2874f0] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f7f7f7] font-sans text-gray-900 overflow-hidden">

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="w-[320px] bg-white hidden lg:flex flex-col shrink-0 z-20 border-r border-gray-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* ---------------- MOBILE SIDEBAR ---------------- */}
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Slide-in Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-75 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors z-50"
        >
          <FaTimes size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Sleek Mobile Header */}
        <header className="lg:hidden h-16 bg-white flex items-center px-4 shrink-0 border-b border-gray-200/60 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-900 transition-colors"
          >
            <FaBars size={22} />
          </button>
          <div className="ml-4 font-bold text-gray-900 text-lg tracking-tight">
            Account Overview
          </div>
        </header>

        {/* Page Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <div className="max-w-4xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default UserLayout;