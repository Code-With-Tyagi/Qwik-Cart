import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },
        addressLine2: {
            type: String,
            trim: true,
            default: "",
        },
        landmark: {
            type: String,
            trim: true,
            default: "",
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            default: "India",
            trim: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        addressType: {
            type: String,
            enum: ["HOME", "WORK", "OTHER"],
            default: "HOME",
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const addressModel = mongoose.model("address", addressSchema);

export default addressModel;