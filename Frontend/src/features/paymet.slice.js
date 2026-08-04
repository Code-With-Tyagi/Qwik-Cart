import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    createPaymentApi,
    verifyPaymentApi,
} from "../api/payment.api";

const initialState = {
    payment: null,
    razorpayOrder: null,
    paymentVerified: false,
    paymentStatus: "Pending",
    loading: false,
    error: null,
};

// Create Razorpay Order
export const createPayment = createAsyncThunk("payment/createPayment", async (payload) => {
    const response = await createPaymentApi(payload);
    console.log(response.payment._id);
    return response;
}
);

// Verify Payment
export const verifyPayment = createAsyncThunk("payment/verifyPayment", async (payload, { rejectWithValue }) => {
    try {
        const response = await verifyPaymentApi(payload);
        return response;
    } catch (err) {
        return rejectWithValue(err.response?.data || { message: err.message });
    }
}
);

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            // CREATE PAYMENT
            .addCase(createPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.payment = action.payload.payment;
                state.razorpayOrder = action.payload.razorpayOrder;
            })

            .addCase(createPayment.rejected, (state, action) => {
                state.loading = false;

                state.error =
                    action.payload ||
                    "Failed to create payment";
            })

            // VERIFY PAYMENT
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentVerified = action.payload?.success === true;
                state.paymentStatus = action.payload?.success === true ? "Paid" : state.paymentStatus;
                state.payment = action.payload.payment;
            })

            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.paymentVerified = false;
                state.paymentStatus = "Failed";
                state.error = action.payload || "Payment verification failed";
            });
    },
});

export default paymentSlice.reducer;