import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        otp: {
            type: String,
            required: true,
        },

        purpose: {
            type: String,
            required: true,
            enum: [
                "REGISTER",
                "FORGOT_PASSWORD",
                "EMAIL_UPDATE",
                "MOBILE_UPDATE",
                "ACCOUNT_REACTIVATION",
            ],
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        mobileNumber: {
            type: String,
            trim: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            expires: 0, // TTL Index
        },
    },
    {
        timestamps: true,
    }
);

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;