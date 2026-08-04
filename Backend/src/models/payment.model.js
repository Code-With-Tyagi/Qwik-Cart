import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true
    },

    razorpayOrderId: {
        type: String,
        required: true
    },

    razorpayPaymentId: {
        type: String
    },

    razorpaySignature: {
        type: String
    },

    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: "INR"
    },

    status: {
        type: String,
        enum: [
            "pending",
            "paid",
            "failed",
            "refunded"
        ],
        default: "pending"
    }

}, {
    timestamps: true
});

const paymentModel = mongoose.model('payment', paymentSchema);

export default paymentModel