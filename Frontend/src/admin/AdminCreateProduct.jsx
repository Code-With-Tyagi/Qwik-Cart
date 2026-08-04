import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    MdCloudUpload,
    MdClose,
    MdAttachMoney,
    MdLayers,
    MdLocalShipping,
    MdAssignmentReturn,
    MdVerifiedUser,
    MdOutlineDescription,
    MdBrandingWatermark,
    MdLabel,
    MdErrorOutline
} from 'react-icons/md';
import { toast, Zoom } from 'react-toastify';

// Assuming createProduct exists in your product slice
import { createProduct } from '../features/product.slice';

const AdminCreateProduct = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Form State matching your Mongoose Schema
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        brand: '',
        price: '',
        discountPercentage: '',
        stock: '',
        availabilityStatus: 'In Stock',
        weight: '',
        dimensions: {
            width: '',
            height: '',
            depth: ''
        },
        warrantyInformation: '',
        shippingInformation: '',
        returnPolicy: '',
        tags: ''
    });

    // Multiple Images State
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Handle nested dimensions inputs
    const handleDimensionChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            dimensions: {
                ...prev.dimensions,
                [name]: value
            }
        }));
    };

    // Handle standard input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    // Handle Multiple Image Selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        if (!files.length) return;

        // Append new files to state
        setImageFiles((prevFiles) => [...prevFiles, ...files]);

        // Create local object URLs for previews
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: null }));
        }
    };

    // Remove selected image from list
    const removeImage = (index) => {
        setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index]);
        setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    };

    // Validation Logic
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.category.trim()) newErrors.category = 'Category is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';

        if (formData.price === '' || Number(formData.price) <= 0) {
            newErrors.price = 'Valid price is required';
        }

        if (formData.stock === '' || Number(formData.stock) < 0) {
            newErrors.stock = 'Valid stock quantity required';
        }

        if (imageFiles.length === 0) {
            newErrors.images = 'At least one product image is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors in the form before submitting.', {
                position: "top-right",
                theme: "dark",
                autoClose:1000
            });
            return false;
        }
        return true;
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Process tags into an array of strings
            const tagsArray = formData.tags
                ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
                : [];

            // Prepare payload to match Mongoose structure exactly
            const productPayload = {
                ...formData,
                price: Number(formData.price),
                discountPercentage: Number(formData.discountPercentage) || 0,
                stock: Number(formData.stock),
                weight: Number(formData.weight) || 0,
                dimensions: {
                    width: Number(formData.dimensions.width) || 0,
                    height: Number(formData.dimensions.height) || 0,
                    depth: Number(formData.dimensions.depth) || 0,
                },
                tags: tagsArray,
                rawImages: imageFiles
            };

            // Dispatch Redux action
            await dispatch(createProduct(productPayload)).unwrap();

            toast.success(`${formData.title} created successfully!`, {
                position: "top-right",
                autoClose: 1000,
                transition: Zoom,
                theme: "dark"
            });

            // Redirect back to main dashboard
            navigate('/admin/products');
        } catch (error) {
            toast.error(error?.message || "Failed to create product", {
                position: "top-right",
                theme: "dark",
                autoClose:1000,
                transition:Zoom
            });
        } finally {
            setLoading(false);
        }
    };

    // Reusable Tailwind classes for styling inputs and hiding number spinners
    const baseInputClass = "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all";
    const getValidationClass = (fieldName) => {
        return errors[fieldName]
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20";
    };
    const hideSpinnersClass = "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 px-2">

            {/* Header section (Back button removed as requested) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Add New Product</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Fill out all details to list a brand new stock entry.</p>
                </div>
            </div>

            {/* Main Grid Layout */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6" noValidate>

                {/* Left Columns - Form fields */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Section 1: General Info */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <MdOutlineDescription className="text-blue-500" size={18} /> General Information
                        </h3>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Product Title *</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Premium Wireless Headphones"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`${baseInputClass} ${getValidationClass('title')}`}
                            />
                            {errors.title && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdErrorOutline /> {errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                                <input
                                    type="text"
                                    name="category"
                                    placeholder="e.g. electronics or women-dresses"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`${baseInputClass} ${getValidationClass('category')}`}
                                />
                                {errors.category && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdErrorOutline /> {errors.category}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                        <MdBrandingWatermark size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        name="brand"
                                        placeholder="e.g. Sony"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className={`${baseInputClass} border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 pl-9`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Product Description *</label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="Write a clear details outline for customers..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`${baseInputClass} ${getValidationClass('description')} resize-none`}
                            />
                            {errors.description && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdErrorOutline /> {errors.description}</p>}
                        </div>
                    </div>

                    {/* Section 2: Pricing & Inventory */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <MdAttachMoney className="text-emerald-500" size={18} /> Pricing & Inventory
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Base Price ($) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={`${baseInputClass} ${getValidationClass('price')} ${hideSpinnersClass}`}
                                />
                                {errors.price && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdErrorOutline /> {errors.price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="0"
                                    value={formData.discountPercentage}
                                    onChange={handleInputChange}
                                    className={`${baseInputClass} border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 ${hideSpinnersClass}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Level *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    min="0"
                                    placeholder="0"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className={`${baseInputClass} ${getValidationClass('stock')} ${hideSpinnersClass}`}
                                />
                                {errors.stock && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdErrorOutline /> {errors.stock}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Technical Specifications & Measurements */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <MdLayers className="text-purple-500" size={18} /> Specifications & Dimensions
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (oz)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    min="0"
                                    placeholder="0"
                                    value={formData.weight}
                                    onChange={handleInputChange}
                                    className={`${baseInputClass} border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 ${hideSpinnersClass}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Width (cm)</label>
                                <input
                                    type="number"
                                    name="width"
                                    min="0"
                                    placeholder="0"
                                    value={formData.dimensions.width}
                                    onChange={handleDimensionChange}
                                    className={`${baseInputClass} border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 ${hideSpinnersClass}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Height (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    min="0"
                                    placeholder="0"
                                    value={formData.dimensions.height}
                                    onChange={handleDimensionChange}
                                    className={`${baseInputClass} border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 ${hideSpinnersClass}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Depth (cm)</label>
                                <input
                                    type="number"
                                    name="depth"
                                    min="0"
                                    placeholder="0"
                                    value={formData.dimensions.depth}
                                    onChange={handleDimensionChange}
                                    className={`${baseInputClass} border-slate-200 focus:border-purple-500 focus:ring-purple-500/20 ${hideSpinnersClass}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Logistic Terms & Rules */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <MdLocalShipping className="text-amber-500" size={18} /> Logistics & Policies
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 items-center gap-1.5">
                                    <MdLocalShipping size={16} className="text-slate-400" /> Shipping Information
                                </label>
                                <input
                                    type="text"
                                    name="shippingInformation"
                                    placeholder="Ships in 1-2 business days, overnight available"
                                    value={formData.shippingInformation}
                                    onChange={handleInputChange}
                                    className={`${baseInputClass} border-slate-200 focus:border-amber-500 focus:ring-amber-500/20`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 items-center gap-1.5">
                                        <MdAssignmentReturn size={16} className="text-slate-400" /> Return Policy
                                    </label>
                                    <input
                                        type="text"
                                        name="returnPolicy"
                                        placeholder="30 days money-back return policy"
                                        value={formData.returnPolicy}
                                        onChange={handleInputChange}
                                        className={`${baseInputClass} border-slate-200 focus:border-amber-500 focus:ring-amber-500/20`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 items-center gap-1.5">
                                        <MdVerifiedUser size={16} className="text-slate-400" /> Warranty Details
                                    </label>
                                    <input
                                        type="text"
                                        name="warrantyInformation"
                                        placeholder="1-year manufacturer warranty"
                                        value={formData.warrantyInformation}
                                        onChange={handleInputChange}
                                        className={`${baseInputClass} border-slate-200 focus:border-amber-500 focus:ring-amber-500/20`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - Status, Tags & MULTIPLE IMAGES SELECTION */}
                <div className="space-y-6">

                    {/* Status Panel */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">Availability</h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Status Setting</label>
                            <select
                                name="availabilityStatus"
                                value={formData.availabilityStatus}
                                onChange={handleInputChange}
                                className={`${baseInputClass} border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 cursor-pointer`}
                            >
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    {/* Multiple Image Input Box */}
                    <div className={`bg-white p-6 rounded-2xl border ${errors.images ? 'border-red-400 ring-2 ring-red-500/20' : 'border-slate-100'} shadow-sm space-y-4`}>
                        <h3 className={`text-base font-bold border-b border-slate-50 pb-2 ${errors.images ? 'text-red-500' : 'text-slate-800'}`}>
                            Product Images *
                        </h3>

                        <div className="w-full">
                            <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group ${errors.images ? 'border-red-300 bg-red-50/30 hover:bg-red-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'}`}>
                                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                    <MdCloudUpload size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <p className="text-sm font-semibold text-slate-700">Select Multiple Images</p>
                                    <p className="text-xs text-slate-400">PNG, JPG or JPEG format allowed</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {errors.images && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><MdErrorOutline /> {errors.images}</p>}

                        {/* Grid display for chosen multi-image thumbnails */}
                        {imagePreviews.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Selected Images ({imagePreviews.length})</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {imagePreviews.map((url, index) => (
                                        <div key={index} className="relative group aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:bg-red-600"
                                                title="Remove image"
                                            >
                                                <MdClose size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags entry box */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                            <MdLabel className="text-slate-400" size={18} /> Search Tags
                        </h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (Comma Separated)</label>
                            <input
                                type="text"
                                name="tags"
                                placeholder="headphones, audio, gadget, tech"
                                value={formData.tags}
                                onChange={handleInputChange}
                                className={`${baseInputClass} border-slate-200 focus:border-blue-500 focus:ring-blue-500/20`}
                            />
                            <span className="text-[11px] text-slate-400 block mt-1">Helps search filtering algorithms.</span>
                        </div>
                    </div>

                    {/* Form Action Controls buttons */}
                    <div className="pt-2 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-1/3 px-4 py-3 border border-slate-200 text-slate-600 bg-white rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm cursor-pointer text-center"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-2/3 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Publish Product"
                            )}
                        </button>
                    </div>

                </div>

            </form>
        </div>
    );
};

export default AdminCreateProduct;