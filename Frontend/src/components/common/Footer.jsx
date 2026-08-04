import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcApplePay
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">

        {/* --- TOP SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand & Description */}
          <div className="lg:col-span-6 pr-0 lg:pr-8">
            {/* Minimalist Logo (Matches Navbar) */}
            <Link to="/" className="flex items-center gap-2 group shrink-0 outline-none mb-6 w-fit">
              <div className="h-8 w-8 bg-white text-zinc-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ease-out">
                <span className="font-bold text-lg leading-none">Q</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white leading-none">
                QwikCart.
              </span>
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-md">
              Discover quality products, lightning-fast delivery,
              and a seamless shopping experience all in one place. Your trusted digital storefront.
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <FaFacebookF size={14} />, href: "#" },
                { icon: <FaInstagram size={14} />, href: "#" },
                { icon: <FaTwitter size={14} />, href: "#" },
                { icon: <FaLinkedinIn size={14} />, href: "#" },
                { icon: <FaGithub size={14} />, href: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-white hover:text-zinc-900 hover:border-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-6">
              Quick Links
            </h3>
            <div className="flex flex-col gap-4">
              {["Home", "Shop", "Cart", "Login"].map((link) => (
                <Link
                  key={link}
                  to={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                  className="text-zinc-400 text-sm font-medium hover:text-white hover:translate-x-1 transition-all duration-300 w-fit"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-6">
              Support
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { name: "Contact Us", path: "/contact" },
                { name: "Returns", path: "/returns" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms & Conditions", path: "/terms" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-zinc-400 text-sm font-medium hover:text-white hover:translate-x-1 transition-all duration-300 w-fit"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="border-t border-zinc-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-zinc-500 font-medium text-center md:text-left">
            <p>© {new Date().getFullYear()} QwikCart Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-zinc-300 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-zinc-300 transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Payment Icons & Back To Top */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-zinc-500 text-2xl">
              <FaCcVisa className="hover:text-white transition-colors" title="Visa" />
              <FaCcMastercard className="hover:text-white transition-colors" title="Mastercard" />
              <FaCcPaypal className="hover:text-white transition-colors" title="PayPal" />
              <FaCcApplePay className="hover:text-white transition-colors" title="Apple Pay" />
            </div>

            <div className="h-4 w-px bg-zinc-800"></div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;