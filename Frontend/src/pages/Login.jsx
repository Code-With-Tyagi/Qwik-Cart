import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUserApi, resendRegistrationOtpApi } from "../api/auth.api";
import { loginSuccess } from "../features/auth.slice";
import { useDispatch } from "react-redux";
import { toast, Zoom } from "react-toastify";
import { getCart } from "../features/cart.slice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to track inline field-level validation errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Email format regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validate form fields before submitting
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger validation logic (relying ONLY on inline errors, no toasts here)
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      // Login API
      const response = await loginUserApi(payload);

      if (!response || !response.user) {
        throw new Error("Invalid response structure from server");
      }

      // Save user in Redux
      dispatch(loginSuccess(response.user));

      // Fetch user's cart and wait until it is stored in Redux
      await dispatch(getCart());

      const userRole = response.user.role?.toLowerCase();
      const userName = response.user.name || "User";

      if (userRole === "admin") {
        navigate("/admin/dashboard");

        toast.success("Welcome back to the Admin Panel", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
      } else {
        navigate("/");

        toast.success(`Welcome back, ${userName}!`, {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
      }
    } catch (error) {
      console.error("Login Error:", error);

      // Extract the exact error message coming from the backend
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 401
          ? "Invalid email or password."
          : null) ||
        (error?.response?.status === 404
          ? "User account not found."
          : null) ||
        (error?.response?.status >= 500
          ? "Server error. Please try again later."
          : null) ||
        error?.message ||
        "Network error or unexpected issue occurred.";

      // Verification Check
      const isVerified = error?.response?.data?.isVerified;
      const messageRequiresVerification = errorMessage.toLowerCase().includes("verify");

      if (isVerified === false || messageRequiresVerification) {
        toast.warning("Please verify your email first.", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });

        navigate("/account/verify", {
          state: { email: formData.email },
        });

        dispatch(resendRegistrationOtpApi({ email: formData.email }));
        return;
      }

      // Account Reactivation Check
      if (errorMessage.toLowerCase().includes("reactivate") || errorMessage.toLowerCase().includes("deactivate")) {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });

        navigate("/account/reactivate", { state: { email: formData.email } });
        return;
      }

      // General error toast for server/API errors (wrong password, missing user, etc.)
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
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
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/Login.png"
          alt="E-commerce shopping checkout"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate autoComplete="off">
            
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
                placeholder="Enter your password"
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

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm">
                <Link
                  to="/account/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Spinner /> Logging In...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center lg:text-left">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;