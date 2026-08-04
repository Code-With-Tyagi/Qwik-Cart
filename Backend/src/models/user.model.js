import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    ordersCount: {
        type: Number,
        default: 0
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    mobileNumber: {
        type: Number,
    },
    accountStatus: {
        type: String,
        enum: ["ACTIVE", "DEACTIVE"],
        default: "ACTIVE"
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("user", userSchema);

export default userModel;