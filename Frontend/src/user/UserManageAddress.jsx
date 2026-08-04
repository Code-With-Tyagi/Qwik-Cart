import React, { useState, useEffect } from "react";
import { FaPlus, FaEllipsisV, FaMapMarkerAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  addAddress,
  getAllAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../features/address.slice.js";

const UserManageAddress = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.address);

  useEffect(() => {
    dispatch(getAllAddress())
      .unwrap()
      .catch((err) => toast.error(err.message || "Failed to load addresses"));
  }, [dispatch]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const initialFormState = {
    fullName: "",
    mobileNumber: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    addressType: "HOME",
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Real-time change handler that clears individual field errors as user types
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Form Validation Strategy
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile Number is required.";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit pincode.";
    }

    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
    if (!formData.state.trim()) newErrors.state = "State is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditClick = (address) => {
    setEditingId(address._id);
    setFormData(address);
    setErrors({});
    setIsAdding(false);
    setActiveMenuId(null);
  };

  const handleDeleteClick = async (id) => {
    setActiveMenuId(null);
    try {
      await dispatch(deleteAddress(id)).unwrap();
      toast.success("Address deleted successfully", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    } catch (err) {
      toast.error(err.message || "Failed to delete address", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const handleSetDefault = async (id) => {
    setActiveMenuId(null);
    try {
      const res = await dispatch(setDefaultAddress(id)).unwrap();
      toast.success(res.message || "Default Address Updated", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    } catch (err) {
      toast.error(err.message || "Failed to set default address", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingId) {
        const res = await dispatch(updateAddress({ id: editingId, payload: formData })).unwrap();
        toast.success(res.message || "Address updated successfully", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
      } else {
        const res = await dispatch(addAddress(formData)).unwrap();
        toast.success(res.message || "Address added successfully", {
          position: "top-right",
          autoClose: 1000,
          theme: "dark",
          transition: Zoom,
        });
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData(initialFormState);
      setErrors({});
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        theme: "dark",
        transition: Zoom,
      });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Utility helper for input dynamic tailwind class styling
  const getInputClass = (fieldName) =>
    `w-full px-4 py-3.5 border rounded-md text-sm outline-none bg-white transition-all ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-50"
        : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
    }`;

  return (
    <div className="w-full bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] rounded-xs font-sans p-6 sm:p-10">
      {/* Page Title */}
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <FaMapMarkerAlt className="text-blue-600 text-base" /> Manage Addresses
      </h3>

      {/* --- ADD NEW ADDRESS TRIGGER BUTTON --- */}
      {!isAdding && editingId === null && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 text-blue-600 font-semibold p-4 rounded-md flex items-center justify-center gap-2 bg-slate-50/50 hover:bg-blue-50/20 transition-all mb-6 uppercase text-sm tracking-wide cursor-pointer"
        >
          <FaPlus size={12} /> Add a new address
        </button>
      )}

      {/* --- ADDRESS INPUT FORM (Used for Add & Edit) --- */}
      {(isAdding || editingId !== null) && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-slate-50/40 border border-slate-100 p-6 rounded-md mb-8 animation-fadeIn"
        >
          <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6">
            {editingId !== null ? "Edit Address" : "Add a New Address"}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={getInputClass("fullName")}
              />
              {errors.fullName && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.fullName}</span>}
            </div>

            {/* Mobile Number */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={getInputClass("mobileNumber")}
              />
              {errors.mobileNumber && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.mobileNumber}</span>}
            </div>

            {/* Pincode */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={getInputClass("pincode")}
              />
              {errors.pincode && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.pincode}</span>}
            </div>

            {/* City */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                City / District / Town
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={getInputClass("city")}
              />
              {errors.city && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.city}</span>}
            </div>
          </div>

          {/* Address Line 1 */}
          <div className="relative w-full mb-6 flex flex-col">
            <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
              Address Line 1 (Required)
            </label>
            <textarea
              name="addressLine1"
              rows="2"
              value={formData.addressLine1}
              onChange={handleChange}
              className={`${getInputClass("addressLine1")} resize-none`}
            />
            {errors.addressLine1 && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.addressLine1}</span>}
          </div>

          {/* Address Line 2 */}
          <div className="relative w-full mb-6 flex flex-col">
            <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
              Address Line 2 (Optional)
            </label>
            <textarea
              name="addressLine2"
              rows="2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-slate-200 rounded-md text-sm outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* State */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={getInputClass("state")}
              />
              {errors.state && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.state}</span>}
            </div>

            {/* Country */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={getInputClass("country")}
              />
              {errors.country && <span className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.country}</span>}
            </div>

            {/* Landmark */}
            <div className="relative w-full flex flex-col">
              <label className="absolute -top-2 left-3 bg-white px-1.5 text-[11px] font-semibold tracking-wide text-slate-400 uppercase z-10">
                Landmark (Optional)
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-md text-sm outline-none bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          {/* Address Type Selection */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Address Type
            </p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="HOME"
                  checked={formData.addressType === "HOME"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
                />
                <span className="text-[14px] font-medium text-slate-800">Home</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="WORK"
                  checked={formData.addressType === "WORK"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
                />
                <span className="text-[14px] font-medium text-slate-800">Work</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="OTHER"
                  checked={formData.addressType === "OTHER"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 transition-all"
                />
                <span className="text-[14px] font-medium text-slate-800">Other</span>
              </label>
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-md transition-all shadow-sm active:scale-95 cursor-pointer ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "SAVING..." : "SAVE ADDRESS"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 bg-transparent text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </form>
      )}

      {/* --- SAVED ADDRESS LIST CONTAINER --- */}
      <div className="space-y-4">
        {loading && addresses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-100 rounded-md">
            Loading your addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-100 rounded-md">
            No addresses saved yet. Click the button above to add one.
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              className="relative p-5 sm:p-6 border border-slate-200/80 rounded-md hover:shadow-sm transition-shadow flex flex-col sm:flex-row justify-between items-start gap-4"
            >
              {/* Left Column: Details Block */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-[3px]">
                    {address.addressType}
                  </span>
                  {address.isDefault && (
                    <span className="text-xs font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-[3px]">
                      DEFAULT
                    </span>
                  )}
                  <span className="font-semibold text-sm text-slate-800">
                    {address.fullName}
                  </span>
                  <span className="font-semibold text-sm text-slate-800 ml-2">
                    {address.mobileNumber}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {address.addressLine1} {address.addressLine2 && `, ${address.addressLine2}`} <br />
                  {address.city}, {address.state}, {address.country} -{" "}
                  <span className="font-medium text-slate-800">{address.pincode}</span>
                </p>

                {address.landmark && (
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="font-medium">Landmark:</span> {address.landmark}
                  </p>
                )}
              </div>

              {/* Right Column: Menu Dropdown Drawer */}
              <div className="relative self-end sm:self-start">
                <button
                  onClick={() =>
                    setActiveMenuId(activeMenuId === address._id ? null : address._id)
                  }
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
                >
                  <FaEllipsisV size={14} />
                </button>

                {activeMenuId === address._id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenuId(null)}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-100 rounded-md shadow-lg py-1 z-20 animate-scaleIn">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address._id)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors border-b border-slate-100 cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}

                      <button
                        onClick={() => handleEditClick(address)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteClick(address._id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManageAddress;