import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Zoom, Bounce } from "react-toastify";

import { forgotPasswordRequestApi, forgotPasswordVerifyApi } from "../api/auth.api";
// Ensure you have OtpInput in the same folder or update the path
import OtpInput from "../components/common/OtpInput";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        // Clear email error in real-time as the user types
        if (errors.email) {
            setErrors((prev) => ({ ...prev, email: "" }));
        }
    };

    const handlePasswordChange = (e) => {
        setPasswords((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        // Clear password errors in real-time as the user types
        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        }
    };

    const handleOtpChange = (newOtp) => {
        setOtp(newOtp);
        // Clear OTP error in real-time as the user types
        if (errors.otp) {
            setErrors((prev) => ({ ...prev, otp: "" }));
        }
    };

    // =========================
    // STEP 1: Request OTP
    // =========================
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
            const payload = { email: email.trim() };
            const response = await forgotPasswordRequestApi(payload);

            toast.success(response?.message || "OTP sent to your email!", {
                position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
            });

            setStep(2); // Move to OTP verification step
        } catch (error) {
            console.error("Forgot Password Request Error:", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to send OTP. Please try again.";

            toast.error(errorMessage, {
                position: "top-right", autoClose: 1000, theme: "dark", transition: Bounce,
            });
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // STEP 2: Verify OTP & Reset Password
    // =========================
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        const cleanOtp = Array.isArray(otp) ? otp.join("").trim() : otp.trim();

        if (!cleanOtp || cleanOtp.length < 6) {
            newErrors.otp = "Please enter the complete 6-digit verification code.";
        }

        if (!passwords.newPassword) {
            newErrors.newPassword = "New password is required.";
        } else if (passwords.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters long.";
        }

        if (!passwords.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required.";
        } else if (passwords.newPassword !== passwords.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            const payload = {
                email: email.trim(),
                otp: cleanOtp,
                newPassword: passwords.newPassword,
            };

            const response = await forgotPasswordVerifyApi(payload);

            toast.success(response?.message || "Password reset successfully! You can now log in.", {
                position: "top-right", autoClose: 1000, theme: "dark", transition: Zoom,
            });

            navigate("/login"); // Redirect back to login page
        } catch (error) {
            console.error("Forgot Password Reset Error:", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to reset password. Please try again.";

            toast.error(errorMessage, {
                position: "top-right", autoClose: 1000, theme: "dark", transition: Bounce,
            });
        } finally {
            setLoading(false);
        }
    };

    // SVG Loading Spinner component
    const Spinner = () => (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">

            {/* Left Side - Image matching Login layout */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img
                    src="/Forgot.png"
                    alt="Secure password reset"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/30"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-md">

                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {step === 1 ? "Forgot Password" : "Reset Your Password"}
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm sm:text-base">
                            {step === 1
                                ? "Enter your registered email address and we'll send you a 6-digit OTP to recover your account."
                                : `We've sent a 6-digit verification code to ${email}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        /* ========================= */
                        /* STEP 1: Email Form        */
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
                                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Spinner /> Sending OTP...
                                    </>
                                ) : (
                                    "Send OTP"
                                )}
                            </button>
                        </form>
                    ) : (
                        /* ========================= */
                        /* STEP 2: OTP & New Password Form */
                        /* ========================= */
                        <form onSubmit={handleResetPassword} className="space-y-5" noValidate autoComplete="off">

                            {/* Added Disabled Email Input for UX consistency */}
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

                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 outline-none transition-all shadow-sm ${
                                        errors.newPassword
                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    }`}
                                />
                                {errors.newPassword && (
                                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-slate-700">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
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

                            <div className="space-y-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner /> Resetting Password...
                                        </>
                                    ) : (
                                        "Save New Password"
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp(new Array(6).fill(""));
                                        setPasswords({ newPassword: "", confirmPassword: "" });
                                        setErrors({});
                                    }}
                                    className="w-full text-slate-500 hover:text-slate-800 font-medium py-2 transition-colors text-sm cursor-pointer"
                                >
                                    Need to use a different email?
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Footer Link matching Login screen */}
                    <div className="mt-6 pt-5 border-t border-slate-200 text-center lg:text-left">
                        <p className="text-sm text-slate-600">
                            Remembered your password?{" "}
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

export default ForgotPassword;