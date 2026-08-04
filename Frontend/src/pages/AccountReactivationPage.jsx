import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Zoom } from "react-toastify";
import {
  reactivateAccountRequest,
  reactivateAccountVerify,
} from "../features/profile.slice";

import OtpInput from "../components/common/OtpInput";

const AccountReactivationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Auto-fill the email if the user was redirected here from the Login page
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear email error in real-time as the user types
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleOtpChange = (newOtp) => {
    setOtp(newOtp);
    // Clear OTP error in real-time as the user types
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  // Step 1: Request OTP Validation & Submission
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(reactivateAccountRequest({ email: email.trim() })).unwrap();

      toast.success(response.message || "OTP sent to your email.", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });

      setStep(2);
    } catch (error) {
      toast.error(error || "Failed to send OTP. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Validation & Submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpString = Array.isArray(otp) ? otp.join("").trim() : otp.trim();

    // Inline validation for OTP
    if (!otpString || otpString.length < 6) {
      setErrors({ otp: "Please enter the complete 6-digit verification code." });
      return;
    }

    try {
      setLoading(true);

      const payload = { email: email.trim(), otp: otpString };
      const response = await dispatch(reactivateAccountVerify(payload)).unwrap();

      toast.success(response.message || "Account reactivated successfully. Please log in.", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });

      // Redirect user directly to the login page
      navigate("/login");

    } catch (error) {
      toast.error(error || "Invalid or expired OTP.", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    } finally {
      setLoading(false);
    }
  };

  // SVG Spinner
  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* Left Side - Image Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/Reactivate.png"
          alt="E-commerce secure account"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Header Section */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Reactivate Account
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              {step === 1
                ? "Enter your email address to receive a reactivation code."
                : `We've sent a 6-digit verification code to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            /* ========================= */
            /* STEP 1: Request OTP Form  */
            /* ========================= */
            <form onSubmit={handleRequestOtp} className="space-y-5" noValidate autoComplete="off">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed mt-6 cursor-pointer"
              >
                {loading ? <><Spinner /> Sending...</> : "Send Verification Code"}
              </button>
            </form>
          ) : (
            /* ========================= */
            /* STEP 2: Verify OTP Form   */
            /* ========================= */
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate autoComplete="off">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed shadow-sm select-none"
                />
              </div>

              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <label className="block text-sm font-medium text-slate-700 self-start w-full">
                  Verification Code (OTP)
                </label>
                <div className="flex justify-center w-full">
                  <OtpInput otp={otp} setOtp={handleOtpChange} length={6} />
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium self-start">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed mt-6 cursor-pointer"
              >
                {loading ? <><Spinner /> Verifying...</> : "Reactivate Account"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(new Array(6).fill(""));
                    setErrors({});
                  }}
                  className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Need to use a different email?
                </button>
              </div>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="mt-8 pt-5 border-t border-slate-200 text-center lg:text-left">
            <p className="text-sm text-slate-600">
              Remembered your account is active?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountReactivationPage;