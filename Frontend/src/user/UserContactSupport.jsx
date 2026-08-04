import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeadset, FaPaperPlane } from 'react-icons/fa';
import { toast, Zoom } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

// IMPORTANT: Adjust this path based on your folder structure where contactSlice is located
import { createContact } from '../features/contact.slice.js';

const UserContactSupport = () => {
  const dispatch = useDispatch();

  // Pull user details to pre-fill the form, and loading state from Redux
  const { user } = useSelector((state) => state.auth || {});
  const { loading } = useSelector((state) => state.contact || {});

  // Form State strictly matching the required Mongoose fields and allowed subjects
  const initialFormState = {
    fullName: "",
    email: "",
    phone: "",
    subject: "Question about an order", 
    message: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Pre-fill user data when the component mounts or user state changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Handle standard input changes and clear errors in real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear the specific error when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Form Validation Logic
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+]{10,14}$/; // Validates optional '+' followed by 10-14 digits

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone is optional, but if provided, it must be valid
    if (formData.phone?.trim() && !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-14 digit phone number.";
    }

    if (!formData.subject?.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message?.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(newErrors);
    
    // Return true if no errors exist (Object.keys length is 0)
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission and trigger Redux Action
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation before proceeding
    if (!validateForm()) {
      return;
    }

    try {
      const res = await dispatch(createContact(formData)).unwrap();
      
      toast.success(res?.message || "Your message has been sent successfully.", {
        position: "top-right",
        autoClose: 1500,
        theme: "dark",
        transition: Zoom,
      });

      // Reset the message and subject, but retain the user's personal details
      setFormData((prev) => ({
        ...prev,
        subject: "Question about an order",
        message: ""
      }));
      setErrors({}); // Clear any residual errors

    } catch (err) {
      toast.error(err || "Failed to submit contact request.", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-sm font-sans min-h-[60vh] flex flex-col shadow-sm">
      
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white flex items-center gap-3">
        <FaHeadset className="text-[#2874f0] text-xl" />
        <h2 className="text-[18px] font-semibold text-gray-900 tracking-wide">
          Contact Support
        </h2>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-10 flex-1 w-full bg-white">
        
        <div className="mb-8">
          <h3 className="text-base font-semibold text-slate-800 mb-2">How can we help you?</h3>
          <p className="text-sm text-slate-500 max-w-2xl">
            Fill out the form below with your details and query. Our support team will review your request and get back to you via email as soon as possible.
          </p>
        </div>

        {/* Support Form Setup */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-slate-50/40 border border-slate-100 p-6 rounded-md animation-fadeIn"
          noValidate
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            
            {/* Full Name - Disabled */}
            <div className="relative w-full mt-2">
              <label className="absolute -top-2 left-3 bg-transparent px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                disabled
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none transition-all placeholder:text-slate-300 cursor-not-allowed ${
                  errors.fullName 
                    ? "border-red-500 bg-red-50 text-red-700" 
                    : "border-slate-200 bg-slate-100 text-slate-500"
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Email - Disabled */}
            <div className="relative w-full mt-2">
              <label className="absolute -top-2 left-3 bg-transparent px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                disabled
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none transition-all placeholder:text-slate-300 cursor-not-allowed ${
                  errors.email 
                    ? "border-red-500 bg-red-50 text-red-700" 
                    : "border-slate-200 bg-slate-100 text-slate-500"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="relative w-full mt-2">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none transition-all placeholder:text-slate-300 bg-white ${
                  errors.phone 
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100" 
                    : "border-slate-200 focus:border-[#2874f0] focus:ring-4 focus:ring-blue-50"
                }`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Subject Dropdown */}
            <div className="relative w-full mt-2">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                Subject (Required)
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none bg-white transition-all appearance-none cursor-pointer ${
                  errors.subject
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 focus:border-[#2874f0] focus:ring-4 focus:ring-blue-50"
                }`}
              >
                <option value="Question about an order">Question about an order</option>
                <option value="Product inquiry">Product inquiry</option>
                <option value="Other">Other</option>
              </select>
              {/* Custom Dropdown Arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-0 top-0 flex items-center px-4 text-slate-500 mt-1">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.subject}</p>
              )}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="relative w-full mb-8">
            <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              Message (Required)
            </label>
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your issue or question in detail..."
              className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none bg-white transition-all resize-none placeholder:text-slate-300 ${
                errors.message
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-slate-200 focus:border-[#2874f0] focus:ring-4 focus:ring-blue-50"
              }`}
            />
            {errors.message && (
              <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-[#2874f0] hover:bg-[#1a5bc2] text-white font-semibold text-sm rounded-sm transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? (
                "SUBMITTING..."
              ) : (
                <>
                  <FaPaperPlane size={12} /> SUBMIT REQUEST
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserContactSupport;