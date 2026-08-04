import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast, Zoom } from "react-toastify";
import OtpInput from "../components/common/OtpInput";

// Import the specific API calls
import { verifyOtpApi, resendRegistrationOtpApi } from "../api/auth.api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If a user tries to access this page directly without an email, send them back
      toast.error("No email provided for verification. Please log in first.", {
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
      navigate("/login");
    }
  }, [location, navigate]);

  const handleOtpChange = (newOtp) => {
    setOtp(newOtp);
    // Clear OTP error in real-time as the user types
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  // Handler for resending the OTP
  const handleResendOtp = async () => {
    if (!email) return;

    try {
      const payload = {
        email: email,
        otp: otp,
      };
      await resendRegistrationOtpApi(payload);

      toast.success("OTP sent to your email", {
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
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend verification code.";

      toast.error(errorMessage, {
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

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = Array.isArray(otp) ? otp.join("").trim() : otp.trim();

    // Inline validation for OTP
    if (!otpString || otpString.length < 6) {
      setErrors({ otp: "Please enter the complete 6-digit verification code." });
      return;
    }

    try {
      setLoading(true);

      // Creating the payload with both email and otp required by the backend
      const payload = { email, otp: otpString };

      // Calling the API directly instead of using Redux
      const response = await verifyOtpApi(payload);

      toast.success(response?.message || "Email verified successfully! You can now log in.", {
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

      navigate("/login");
    } catch (error) {
      // Extract the error message from the API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid or expired verification code.";

      toast.error(errorMessage, {
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

      {/* Left Side - Image Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/Verify.png"
          alt="Verify your account"
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
              Verify Your Email
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Enter the 6-digit verification code sent to your email.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5" noValidate autoComplete="off">
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
              {loading ? <><Spinner /> Verifying...</> : "Verify Email"}
            </button>

            {/* Resend Prompt */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors cursor-pointer"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>

          {/* Footer Back Link */}
          <div className="mt-8 pt-5 flex justify-center border-t border-slate-200">
            <Link
              to="/login"
              className="flex items-center text-sm text-slate-600 font-medium hover:text-blue-700 transition-colors group"
            >
              <svg
                className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;