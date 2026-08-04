import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from "react-redux";
import { toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// IMPORTANT: Adjust this import path based on your folder structure
import { changePassword } from "../features/profile.slice.js";

// PasswordInput Component receiving error props for visual feedback
const PasswordInput = ({ label, name, value, showState, fieldKey, onChange, onToggle, error }) => (
  <div className="relative w-full sm:w-[320px] mb-6 last:mb-0 flex flex-col">
    <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
      {label}
    </label>
    <div className="relative w-full">
      <input
        type={showState ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full pl-4 pr-12 py-3.5 border rounded-md text-sm outline-none transition-all duration-200 text-slate-900 bg-white ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50"
            : "border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm"
        }`}
      />
      <button
        type="button"
        onClick={() => onToggle(fieldKey)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none"
      >
        {showState ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
      </button>
    </div>
    {error && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{error}</span>}
  </div>
);

const UserChangePassword = () => {
  const dispatch = useDispatch();
  
  // Pull loading state from Redux store's profile slice
  const { loading } = useSelector((state) => state.profile || {});

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Handle Input Changes and clear field error in real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the current field as user types
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Comprehensive Form Validation Strategy
  const validateForm = () => {
    const newErrors = {};

    // Current Password Validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    // New Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long.';
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = 'Must include uppercase, lowercase, number, and symbol.';
    } else if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password.';
    }

    // Confirm Password Validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run Frontend Validation
    if (!validateForm()) {
      return;
    }

    try {
      const res = await dispatch(
        changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword 
        })
      ).unwrap();

      toast.success(res?.message || 'Password updated successfully', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });

      // Clear the form and errors on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setErrors({});
      
      // Reset visibility toggles
      setShowPassword({
        current: false,
        new: false,
        confirm: false,
      });

    } catch (err) {
      toast.error(err || "Failed to update password", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  return (
    <div className="w-full bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-xs font-sans overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
      <div className="p-6 sm:p-10">
        
        {/* --- Header --- */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Change Password</h3>
          <p className="text-sm font-medium text-slate-500">
            Update your password to keep your account secure.
          </p>
        </div>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} noValidate className="mb-12">
          
          <div className="flex flex-col gap-2">
            <PasswordInput 
              label="Current Password" 
              name="currentPassword"
              value={formData.currentPassword}
              showState={showPassword.current}
              fieldKey="current"
              onChange={handleChange}
              onToggle={toggleVisibility}
              error={errors.currentPassword}
            />

            <PasswordInput 
              label="New Password" 
              name="newPassword"
              value={formData.newPassword}
              showState={showPassword.new}
              fieldKey="new"
              onChange={handleChange}
              onToggle={toggleVisibility}
              error={errors.newPassword}
            />

            <PasswordInput 
              label="Confirm Password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              showState={showPassword.confirm}
              fieldKey="confirm"
              onChange={handleChange}
              onToggle={toggleVisibility}
              error={errors.confirmPassword}
            />
          </div>

          <div className="mt-6 mb-8">
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg">
              * Password must be at least 8 characters long and include a mix of uppercase letters, lowercase letters, numbers, and symbols.
            </p>
          </div>

          {/* --- Action Button --- */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </form>

        {/* --- Security Note Section --- */}
        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-md font-bold text-slate-800 mb-4">
            Security Advice
          </h3>
          <p className="text-[14px] text-slate-600 leading-relaxed max-w-2xl">
            Please never share your login credentials or OTPs with anyone. If you notice any suspicious activity on your account, change your password immediately and contact our Support Team.
          </p>
        </div>

      </div>
    </div>
  );
};

export default UserChangePassword;