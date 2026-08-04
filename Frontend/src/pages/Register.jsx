import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUserApi, verifyOtpApi } from "../api/auth.api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth.slice";
import { toast, Bounce, Zoom } from "react-toastify";

// Imported the standalone multi-box OTP input component
import OtpInput from "../components/common/OtpInput";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for inline validation errors
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full Name must be at least 2 characters long.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleOtpChange = (newOtp) => {
    setOtp(newOtp);
    if (otpError) setOtpError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger inline form validation
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await registerUserApi(payload);
      setShowOtpBox(true);

      toast.success(response?.message || "OTP sent successfully! Please check your email.", {
        position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
      });

    } catch (error) {
      console.error("Registration Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 409 ? "Email already exists." : null) ||
        (error?.response?.status >= 500 ? "Server error. Please try again later." : null) ||
        error?.message ||
        "Failed to send OTP. Please try again.";

      toast.error(errorMessage, {
        position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = Array.isArray(otp) ? otp.join("").trim() : otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const payload = { 
        email: formData.email.trim(), 
        otp: cleanOtp 
      };

      const response = await verifyOtpApi(payload);

      if (response && response.userDetails) {
        dispatch(loginSuccess(response.userDetails));
        setShowOtpBox(false);
      }

      toast.success(response?.message || "Registration Successful! Welcome to QwikCart", {
        position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
      });

      navigate("/");

    } catch (error) {
      console.error("OTP Verification Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 400 ? "Invalid or expired OTP." : null) ||
        (error?.response?.status >= 500 ? "Server error. Please try again later." : null) ||
        error?.message ||
        "OTP Verification failed. Please try again.";

      toast.error(errorMessage, {
        position: "top-right", autoClose: 1000, theme: "dark", transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/Register.png"
          alt="E-commerce shopping"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/20"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {showOtpBox ? "Verify Your Email" : "Create an Account"}
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {showOtpBox
                ? `We've sent a verification code to ${formData.email}`
                : "Get started by filling in the details below."}
            </p>
          </div>

          {!showOtpBox ? (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate autoComplete="off">
              
              {/* Full Name */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="off"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm ${
                    errors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Spinner /> Creating Account...
                  </>
                ) : (
                  "Register Account"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center py-2 space-y-2">
                <OtpInput otp={otp} setOtp={handleOtpChange} length={6} />
                {otpError && (
                  <p className="text-xs text-red-500 mt-2 font-medium self-start">{otpError}</p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Spinner /> Verifying...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOtpBox(false);
                    setOtp(new Array(6).fill(""));
                    setOtpError("");
                  }}
                  className="w-full text-slate-500 hover:text-slate-800 font-medium py-2 transition-colors text-sm cursor-pointer"
                >
                  Entered the wrong email? Go back
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-200 text-center lg:text-left">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;