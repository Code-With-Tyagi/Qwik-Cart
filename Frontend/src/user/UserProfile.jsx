import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { toast, Zoom } from "react-toastify";
import { clearCart } from "../features/cart.slice";
import { clearWishlistState } from "../features/wishlist.slice";

import OtpInput from "../components/common/OtpInput"; // <-- Import the standalone OTP component

import {
  personalInfoUpdate,
  requestEmailUpdate,
  verifyEmailUpdate,
  requestMobileUpdate,
  verifyMobileUpdate,
  deactivateAccount,
  deleteAccount,
  clearProfileState
} from "../features/profile.slice";
import { logoutSuccess, updateAuthUser } from "../features/auth.slice";
import { logoutUserApi } from "../api/auth.api";
import { persistor } from "../app/store";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Single Source of Truth: Get user directly from auth slice
  const user = useSelector((state) => state.auth?.user);

  // Async operation status from profile slice
  const { loading, error, successMessage } = useSelector((state) => state.profile || {});

  // Local state for Edit Modes
  const [editPersonal, setEditPersonal] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPhone, setEditPhone] = useState(false);

  // Local state for OTP Verification Steps
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState(new Array(6).fill(""));
  const [mobileOtp, setMobileOtp] = useState(new Array(6).fill(""));

  // Modals for Account Actions
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");

  // Local state for Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    email: "",
    mobileNumber: "",
  });

  // Sync auth user data to local form state
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || user.userName || "",
        gender: user.gender || "",
        email: user.email || user.userEmail || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

  // Clear feedback messages on unmount or mode changes
  useEffect(() => {
    dispatch(clearProfileState());
  }, [dispatch, editPersonal, editEmail, editPhone]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Handlers for Personal Info ---
  const handleSavePersonal = async () => {
    const res = await dispatch(
      personalInfoUpdate({ fullName: formData.fullName, gender: formData.gender })
    );

    if (!res.error) {
      dispatch(
        updateAuthUser({
          name: formData.fullName,
          userName: formData.fullName,
          gender: formData.gender,
        })
      );
      setEditPersonal(false);
    }
  };

  // --- Handlers for Email Update ---
  const handleRequestEmailUpdate = async () => {
    const res = await dispatch(requestEmailUpdate({ newEmail: formData.email }));
    if (!res.error) {
      setShowEmailOtp(true);
    }
  };

  const handleVerifyEmail = async () => {
    const otpString = emailOtp.join("");

    const res = await dispatch(verifyEmailUpdate({ otp: otpString }));
    if (!res.error) {
      setShowEmailOtp(false);
      setEditEmail(false);
      setEmailOtp(new Array(6).fill(""));
      await logoutUserApi();
      dispatch(logoutSuccess({ skipProtectedToast: true }));
      await persistor.purge();
      navigate("/login");
    }
  };

  // --- Handlers for Mobile Update ---
  const handleRequestMobileUpdate = async () => {
    const res = await dispatch(requestMobileUpdate({ mobileNumber: formData.mobileNumber }));
    if (!res.error) {
      setShowMobileOtp(true);
    }
  };

  const handleVerifyMobile = async () => {
    const otpString = mobileOtp.join("");
    const res = await dispatch(verifyMobileUpdate({ otp: otpString }));

    if (!res.error) {
      dispatch(
        updateAuthUser({
          mobileNumber: formData.mobileNumber,
        })
      );
      setShowMobileOtp(false);
      setEditPhone(false);
      setMobileOtp(new Array(6).fill(""));
    }
  };

  // --- Handlers for Account Actions ---
  const handleDeactivate = async () => {
    const res = await dispatch(deactivateAccount({ password: accountPassword }));

    if (!res.error) {
      toast.success(res.payload?.message || "Account deactivated successfully", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Zoom,
      });

      setShowDeactivateModal(false);
      setAccountPassword("");

      // Logout logic
      await logoutUserApi();
      dispatch(logoutSuccess({ skipProtectedToast: true }));
      dispatch(clearCart());
      dispatch(clearWishlistState());
      await persistor.purge();
      navigate("/login");
    } else {
      toast.error(res.payload || res.error?.message || "Failed to deactivate account", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteAccount({ password: accountPassword }));

    if (!res.error) {
      toast.success(res.payload?.message || "Account deleted successfully", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Zoom,
      });

      setShowDeleteModal(false);
      setAccountPassword("");

      // Logout logic
      await logoutUserApi();
      dispatch(logoutSuccess({ skipProtectedToast: true }));
      dispatch(clearCart());
      dispatch(clearWishlistState());
      await persistor.purge();
      navigate("/login");
    } else {
      toast.error(res.payload || res.error?.message || "Failed to delete account", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  return (
    <div className="w-full bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-xs font-sans overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] relative">

      {/* Global Status Messages */}
      {error && <div className="bg-red-50 text-red-600 p-4 text-sm font-medium border-b border-red-100">{error}</div>}
      {successMessage && <div className="bg-green-50 text-green-600 p-4 text-sm font-medium border-b border-green-100">{successMessage}</div>}

      <div className="p-6 sm:p-10">

        {/* --- Personal Information --- */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
            <button
              onClick={() => {
                setEditPersonal(!editPersonal);
                if (!editPersonal) {
                  setFormData({
                    ...formData,
                    fullName: user?.name || user?.userName || "",
                    gender: user?.gender || ""
                  });
                }
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {editPersonal ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Full Name</label>
              <input
                type="text" name="fullName"
                value={formData.fullName} onChange={handleChange}
                disabled={!editPersonal || loading}
                className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none transition-all duration-200 ${editPersonal
                  ? "border-blue-400 text-slate-900 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 shadow-sm"
                  : "border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed"
                  }`}
              />
            </div>

            {editPersonal && (
              <button
                onClick={handleSavePersonal}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md transition-all active:scale-95 shadow-sm disabled:opacity-70"
              >
                {loading ? "SAVING..." : "SAVE"}
              </button>
            )}
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-slate-500 mb-4">Your Gender</p>
            <div className="flex items-center gap-8">
              <label className={`flex items-center gap-2.5 ${editPersonal ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                <input
                  type="radio" name="gender" value="Male"
                  checked={formData.gender === "Male"} onChange={handleChange}
                  disabled={!editPersonal || loading}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all cursor-inherit"
                />
                <span className="text-[15px] font-medium text-slate-800">Male</span>
              </label>
              <label className={`flex items-center gap-2.5 ${editPersonal ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                <input
                  type="radio" name="gender" value="Female"
                  checked={formData.gender === "Female"} onChange={handleChange}
                  disabled={!editPersonal || loading}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all cursor-inherit"
                />
                <span className="text-[15px] font-medium text-slate-800">Female</span>
              </label>
            </div>
          </div>
        </div>

        {/* --- Email Address --- */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Email Address</h3>
            <button
              onClick={() => {
                setEditEmail(!editEmail);
                setShowEmailOtp(false);
                if (!editEmail) setFormData({ ...formData, email: user?.email || user?.userEmail || "" });
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {editEmail ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <input
              type="email" name="email"
              value={formData.email} onChange={handleChange}
              disabled={!editEmail || showEmailOtp || loading}
              className={`w-full sm:w-[320px] px-4 py-3.5 border rounded-md text-sm outline-none transition-all duration-200 ${editEmail && !showEmailOtp
                ? "border-blue-400 text-slate-900 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 shadow-sm"
                : "border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed"
                }`}
            />

            {editEmail && !showEmailOtp && (
              <button
                onClick={handleRequestEmailUpdate}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md transition-all active:scale-95 shadow-sm disabled:opacity-70"
              >
                {loading ? "SENDING OTP..." : "UPDATE"}
              </button>
            )}

            {/* OTP Verification Section */}
            {showEmailOtp && (
              <div className="flex items-center gap-4">
                <OtpInput otp={emailOtp} setOtp={setEmailOtp} />
                <button
                  onClick={handleVerifyEmail}
                  disabled={loading || emailOtp.join("").length < 6}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  {loading ? "VERIFYING..." : "VERIFY & SAVE"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- Mobile Number --- */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Mobile Number</h3>
            <button
              onClick={() => {
                setEditPhone(!editPhone);
                setShowMobileOtp(false);
                if (!editPhone) setFormData({ ...formData, mobileNumber: user?.mobileNumber || "" });
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {editPhone ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <input
              type="tel" name="mobileNumber"
              value={formData.mobileNumber} onChange={handleChange}
              disabled={!editPhone || showMobileOtp || loading}
              className={`w-full sm:w-[320px] px-4 py-3.5 border rounded-md text-sm outline-none transition-all duration-200 ${editPhone && !showMobileOtp
                ? "border-blue-400 text-slate-900 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 shadow-sm"
                : "border-slate-200 text-slate-500 bg-slate-50/50 cursor-not-allowed"
                }`}
            />

            {editPhone && !showMobileOtp && (
              <button
                onClick={handleRequestMobileUpdate}
                disabled={loading}
                className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md transition-all active:scale-95 shadow-sm disabled:opacity-70"
              >
                {loading ? "SENDING OTP..." : "UPDATE"}
              </button>
            )}

            {/* OTP Verification Section */}
            {showMobileOtp && (
              <div className="flex items-center gap-4">
                <OtpInput otp={mobileOtp} setOtp={setMobileOtp} />
                <button
                  onClick={handleVerifyMobile}
                  disabled={loading || mobileOtp.join("").length < 6}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-md transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  {loading ? "VERIFYING..." : "VERIFY & SAVE"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- FAQs Section --- */}
        <div className="mb-14 pt-8 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Frequently Asked Questions</h3>
          <div className="space-y-7">
            <div>
              <p className="text-[15px] font-semibold text-slate-800 mb-2">What happens when I update my email address or phone number?</p>
              <p className="text-[14px] text-slate-600 leading-relaxed">Your QwikCart account will use your updated email address or phone number for login, order updates, security notifications, and important account communications after verification.</p>
            </div>
          </div>
        </div>

        {/* --- Account Actions --- */}
        <div className="flex flex-col gap-6 pt-8 border-t border-slate-100">
          <button
            onClick={() => { setShowDeactivateModal(true); setAccountPassword(""); }}
            className="text-left text-[15px] font-semibold text-blue-600 hover:text-blue-800 transition-colors w-fit cursor-pointer"
          >
            Deactivate Account
          </button>

          <button
            onClick={() => { setShowDeleteModal(true); setAccountPassword(""); }}
            className="text-left text-[15px] font-semibold text-red-500 hover:text-red-700 transition-colors w-fit cursor-pointer"
          >
            Delete Account
          </button>
        </div>

      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          {/* Main Modal Container */}
          <div className="relative bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-xl">

            {/* Close 'X' Button */}
            <button
              onClick={() => { setShowDeactivateModal(false); setAccountPassword(""); }}
              className="absolute -top-10 right-0 md:-right-10 text-white text-4xl hover:text-gray-300 transition-colors cursor-pointer"
            >
              &times;
            </button>

            {/* Left Column: Information */}
            <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-[16px] font-medium text-black mb-4">When you deactivate your account</h2>
              <ul className="list-disc pl-5 text-[14px] text-gray-700 space-y-3 mb-6">
                <li>You are logged out of your QwikCart Account</li>
                <li>Your public profile on QwikCart is no longer visible</li>
                <li>Your reviews/ratings are still visible, while your profile information is shown as 'unavailable' as a result of deactivation.</li>
                <li>Your wishlist items are no longer accessible through the associated public hyperlink. Wishlist is shown as 'unavailable' as a result of deactivation</li>
                <li>You will be unsubscribed from receiving promotional emails from QwikCart</li>
                <li>Your account data is retained and is restored in case you choose to reactivate your account</li>
              </ul>

              <h2 className="text-[16px] font-medium text-black mb-4 mt-8">How do I reactivate my QwikCart account?</h2>
              <div className="text-[14px] text-gray-700 space-y-4">
                <p>Reactivation is easy.</p>
                <p>Simply login with your registered email id or mobile number and password combination used prior to deactivation. Your account data is fully restored. Default settings are applied and you will be subscribed to receive promotional emails from QwikCart.</p>
                <p>QwikCart retains your account data for you to conveniently start off from where you left, if you decide to reactivate your account.</p>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full md:w-100 p-8 md:p-10 flex flex-col">
              <h3 className="text-[16px] font-medium text-black mb-6">Are you sure you want to leave?</h3>

              {/* Read-only inputs using real user info */}
              <input
                type="text"
                value={user?.email || user?.userEmail || ""}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-sm mb-4 text-gray-500 bg-gray-50 outline-none text-[14px]"
              />


              {/* Password Input (Replaced OTP) */}
              <input
                type="password"
                placeholder="Enter Password to Confirm"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm mb-6 focus:border-[#2874f0] outline-none text-[14px]"
              />

              {/* Action Buttons */}
              <button
                onClick={handleDeactivate}
                disabled={!accountPassword || loading}
                className="w-full py-3 bg-[#2874f0] text-white font-medium rounded-sm hover:bg-[#1c5ec9] transition-all disabled:opacity-50 mb-4 cursor-pointer"
              >
                CONFIRM DEACTIVATION
              </button>
              <button
                onClick={() => { setShowDeactivateModal(false); setAccountPassword(""); }}
                className="w-full py-3 text-[#2874f0] font-medium rounded-sm hover:bg-gray-50 transition-all uppercase cursor-pointer"
              >
                NO, LET ME STAY!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          {/* Main Modal Container */}
          <div className="relative bg-white w-full max-w-6xl flex flex-col md:flex-row shadow-xl max-h-[90vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">

            {/* Close 'X' Button (Moved inside the visible container) */}
            <button
              onClick={() => { setShowDeleteModal(false); setAccountPassword(""); }}
              className="absolute top-3 right-4 md:top-4 md:right-5 text-gray-400 hover:text-gray-700 text-3xl cursor-pointer z-20 transition-colors"
            >
              &times;
            </button>

            {/* Left Column: Information */}
            <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-200 mt-6 md:mt-0">
              <h2 className="text-[16px] font-medium text-black mb-4">
                If you wish to proceed with an account deletion request, please ensure that you have read and understood the following:
              </h2>
              <ul className="list-disc pl-5 text-[13px] text-gray-700 space-y-3 mb-6">
                <li>There are no pending orders, cancellations, returns, refunds or other requests ("Transactions"). If there are pending Transactions, please raise your account deletion request once the Transactions are completed.</li>
                <li>If you hold any subscription or membership, you will lose all benefits and rewards associated with it immediately upon deletion of the account.</li>
                <li>You have exhausted or do not intend to use SuperCoins, Gift Cards or any such reward points or balances associated with your account. Please note that once your account is deleted, immediately you will not be able to access any such reward points.</li>
                <li>You will not be able to access or request to access order history, profile, wishlists, saved addresses, previous orders and invoices, save or preferred payment methods, content, images or use any of the products and services offered by the Platform immediately on deletion and will have to create a new account to use products and services offered by us.</li>
                <li>The platform may choose to refuse deletion of your account in case you have any legal dispute, or grievances related to pending payments to your orders, shipments or deliveries, credit lines, etc.</li>
                <li>Platform may retain certain data for legitimate reasons (towards enforcement of legal rights or regulatory compliance) such as security, fraud prevention, future abuse, and regulatory compliance including the exercise of legal rights or comply with legal orders under applicable laws.</li>
                <li>After your account is deleted, if you log into the Platform using the same phone no. or email ID, a fresh new account will be created and your old account data will not be accessible.</li>
                <li>QwikCart may not extend a new user coupon if an account is created with the same mobile number. There is no relaxation on return/cancellation fees and the buying policies across products will remain the same.</li>
                <li>Please uninstall the QwikCart App after your account is deleted to stop receiving any notifications from QwikCart. Notifications are app-level settings and uninstalling the app is required to stop all notifications. To cease receiving notifications entirely, you must delete the application from your device.</li>
              </ul>

              {/* Warning Box */}
              <div className="pb-10">
                <div className="border border-orange-200 bg-orange-50 p-5 rounded-sm ">
                  <h3 className="text-[14px] font-semibold text-black mb-2">Deleting account is a permanent action</h3>
                  <p className="text-[13px] text-gray-700 leading-relaxed">
                    Please be advised that the deletion of your account is a permanent action. Once your account is deleted, you will lose QwikCart data including order history & it will no longer be accessible and cannot be restored under any circumstances.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full md:w-100 p-8 md:p-10 flex flex-col">
              <h3 className="text-[16px] font-medium text-black mb-6">Are you sure you want to delete your account?</h3>

              {/* Read-only inputs using real user info */}
              <input
                type="text"
                value={user?.email || user?.userEmail || ""}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-sm mb-4 text-gray-500 bg-gray-50 outline-none text-[14px]"
              />

              {/* Password Input */}
              <input
                type="password"
                placeholder="Enter Password to Confirm"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-sm mb-6 focus:border-red-500 outline-none text-[14px]"
              />

              {/* Action Buttons */}
              <button
                onClick={handleDelete}
                disabled={!accountPassword || loading}
                className="w-full py-3 bg-red-600 text-white font-medium rounded-sm hover:bg-red-700 transition-all disabled:opacity-50 mb-4 cursor-pointer uppercase"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setAccountPassword(""); }}
                className="w-full py-3 text-gray-600 font-medium rounded-sm hover:bg-gray-100 transition-all uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;