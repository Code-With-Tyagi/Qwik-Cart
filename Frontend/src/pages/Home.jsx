import React, { useState, useEffect } from 'react';
import {
    FaStar,
    FaBolt,
    FaArrowRight,
    FaPlus,
    FaTruck,
    FaLock,
    FaHeadphones,
    FaEnvelope,
    FaMicrosoft
} from 'react-icons/fa';

// Importing Tech Brand Icons (All from Simple Icons for perfectly equal sizing)
import {
    SiApple,
    SiLogitech,
    SiHp,
    SiDell,
    SiAsus,
    SiXiaomi,
    SiOneplus,
    SiBoat,
    SiNike,
    SiAdidas,
    SiPuma,
    SiJbl,
} from "react-icons/si";

import ProductCard from '../components/common/ProductCard';
import ProductHome from '../components/common/ProductsHome';

const Home = () => {

    // --> UPDATED FIX: Block browser's native scroll restoration <--
    useEffect(() => {
        // 1. Tell the browser NOT to restore scroll position automatically
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // 2. Force scroll to the top
        window.scrollTo(0, 0);

        // 3. Fallback for React's rendering cycle
        const scrollTimeout = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);

        // 4. Cleanup: Put it back to 'auto' when leaving the home page
        // so other pages aren't affected
        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
            clearTimeout(scrollTimeout);
        };
    }, []);

    // QwikCart Products
    const products = [
        { id: 1, name: "Sony WH-1000XM5 ANC", price: 29999, originalPrice: 34999, discount: "14% OFF", rating: "4.8", reviews: 214, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80" },
        { id: 2, name: "Apple Watch Series 9", price: 41999, originalPrice: 44999, discount: "6% OFF", rating: "4.9", reviews: 845, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80" },
        { id: 3, name: "Keychron K2 Mechanical", price: 8499, originalPrice: 10999, discount: "22% OFF", rating: "4.7", reviews: 120, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80" },
        { id: 4, name: "Bellroy Tech Pouch", price: 4999, originalPrice: 5999, discount: "16% OFF", rating: "4.5", reviews: 54, image: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=400&q=80" },
        { id: 5, name: "Logitech MX Master 3S", price: 9499, originalPrice: 10999, discount: "13% OFF", rating: "4.8", reviews: 332, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80" },
        { id: 6, name: "Native Union Desk Mat", price: 3999, originalPrice: 4999, discount: "20% OFF", rating: "4.6", reviews: 98, image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=400&q=80" },
        { id: 7, name: "Nothing Ear (2)", price: 9999, originalPrice: 11999, discount: "16% OFF", rating: "4.4", reviews: 165, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80" },
        { id: 8, name: "Nomad Base Station", price: 12999, originalPrice: 14999, discount: "13% OFF", rating: "4.7", reviews: 45, image: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400&q=80" },
    ];

    // Array of Brand Logos with designated colors to pop against the white cards
    const marqueeBrands = [
        { name: "APPLE", icon: SiApple, color: "text-gray-950" },
        { name: "LOGITECH", icon: SiLogitech, color: "text-teal-500" },
        { name: "HP", icon: SiHp, color: "text-blue-400" },
        { name: "DELL", icon: SiDell, color: "text-blue-600" },
        { name: "PUMA", icon: SiPuma, color: "text-neutral-900" },
        { name: "ASUS", icon: SiAsus, color: "text-slate-700" },
        { name: "Xiaomi", icon: SiXiaomi, color: "text-orange-600" },
        { name: "Nike", icon: SiNike, color: "text-neutral-950" },
        { name: "OnePlus", icon: SiOneplus, color: "text-red-600" },
        { name: "Adidas", icon: SiAdidas, color: "text-neutral-900" },
        { name: "boAt", icon: SiBoat, color: "text-red-500" },
        { name: "JBL", icon: SiJbl, color: "text-orange-500" },
    ];

    return (
        <div className="bg-stone-50 min-h-screen font-sans text-gray-900 selection:bg-black selection:text-white">

            {/* Custom Styles for Scrollbar & Marquee Animation */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: scroll 35s linear infinite;
                    display: flex;
                    width: max-content;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <main className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

                {/* 1. HERO PROMO BANNER (MODIFIED FOR MOBILE IMAGE-FIRST LAYOUT) */}
                <section className="mb-12 w-full rounded-3xl overflow-hidden bg-white flex flex-col-reverse md:flex-row items-stretch justify-between border border-stone-200 shadow-sm relative">

                    {/* Text Area */}
                    <div className="p-8 sm:p-12 md:p-16 lg:p-20 flex flex-col justify-center flex-1 z-10 bg-white md:max-w-2xl">
                        <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 bg-black rounded-full mb-6 md:mb-8 shadow-sm">
                            <FaBolt className="text-white" size={11} />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                Premium Drops
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black leading-[1.15] mb-4 md:mb-6 tracking-tight">
                            Elevate Your <br />
                            <span className="text-gray-400">Everyday Tech.</span>
                        </h2>

                        <p className="text-gray-500 text-sm sm:text-base font-medium mb-8 md:mb-10 max-w-md leading-relaxed">
                            Discover highly curated, premium quality accessories and gadgets
                            designed for the modern workspace and lifestyle.
                        </p>

                        <div>
                            <button className="inline-flex items-center justify-center gap-3 bg-black text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5">
                                Shop Collection
                                <FaArrowRight size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="relative w-full md:w-1/2 min-h-65 sm:min-h-85 md:min-h-115 overflow-hidden bg-stone-100 flex-1">
                        <img
                            src="/e.png"
                            alt="QwikCart Premium Essentials"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>

                </section>

                {/* 2. BRAND LOGO MARQUEE */}
                <section className="mb-12 overflow-hidden bg-purple-50 rounded-2xl py-6 md:py-8 shadow-inner relative flex items-center border border-purple-100">
                    {/* Linear Gradient Fade Edges */}
                    <div className="absolute left-0 w-16 md:w-24 h-full bg-linear-to-r from-purple-50 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 w-16 md:w-24 h-full bg-linear-to-l from-purple-50 to-transparent z-10 pointer-events-none"></div>

                    <div className="animate-marquee items-center gap-4 md:gap-6 px-4 md:px-8">
                        {[...marqueeBrands, ...marqueeBrands].map((brand, idx) => {
                            const IconComponent = brand.icon;
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center justify-center shrink-0 w-32 h-16 md:w-40 md:h-20 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-stone-100 group/brand cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                                >
                                    <IconComponent
                                        className={`w-7 h-7 md:w-9 md:h-9 ${brand.color} opacity-80 group-hover/brand:opacity-100 transition-opacity duration-300`}
                                        title={brand.name}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. TRUST BADGES */}
                <section className="mb-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 flex items-center gap-4 shadow-sm">
                        <div className="bg-stone-100 p-3.5 md:p-4 rounded-full text-black shrink-0">
                            <FaTruck size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider text-black">Free Shipping</h4>
                            <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">On all orders over ₹5,000</p>
                        </div>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 flex items-center gap-4 shadow-sm">
                        <div className="bg-stone-100 p-3.5 md:p-4 rounded-full text-black shrink-0">
                            <FaLock size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider text-black">Secure Checkout</h4>
                            <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">100% protected payments</p>
                        </div>
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 flex items-center gap-4 shadow-sm sm:col-span-2 md:col-span-1">
                        <div className="bg-stone-100 p-3.5 md:p-4 rounded-full text-black shrink-0">
                            <FaHeadphones size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-xs md:text-sm uppercase tracking-wider text-black">24/7 Support</h4>
                            <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">Dedicated customer service</p>
                        </div>
                    </div>
                </section>

                {/* 4. MAIN LAYOUT - PRODUCTS GRID */}
                <ProductHome />

                {/* 5. NEWSLETTER SUBSCRIPTION */}
                {/* <section className="mb-12 bg-stone-200/40 rounded-3xl p-8 sm:p-12 md:p-16 text-center border border-stone-200">
                    <div className="max-w-2xl mx-auto flex flex-col items-center">
                        <div className="bg-white p-3.5 rounded-full shadow-sm mb-5 inline-block text-black">
                            <FaEnvelope size={20} />
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-black mb-3">Join the Inner Circle</h3>
                        <p className="text-gray-500 text-sm font-medium mb-6 md:mb-8 max-w-lg leading-relaxed">
                            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals delivered directly to your inbox.
                        </p>
                        <form className="w-full flex flex-col sm:flex-row gap-3">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="flex-1 px-5 py-3.5 rounded-full text-sm font-medium border border-stone-300 bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                            />
                            <button type="submit" className="bg-black text-white px-7 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors shrink-0 shadow-sm">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </section> */}

            </main>
        </div>
    );
};

export default Home;