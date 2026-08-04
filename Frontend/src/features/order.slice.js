import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    createOrderApi, 
    getUserOrdersApi, 
    getAllOrdersApi, 
    updateOrderStatusApi 
} from "../api/order.api";

const initialState = {
    orders: [], 
    currentOrder: null,
    loading: false,
    error: null,
    message: null, 
    totalOrders: 0,
};

// =========================
// THUNKS (Using rejectWithValue for proper error handling)
// =========================

export const createOrder = createAsyncThunk(
    "/order/create", 
    async (payload, { rejectWithValue }) => {
        try {
            const response = await createOrderApi(payload);
            return response.orderDetails._id;
        } catch (error) {
            // Passes the exact backend error to the frontend
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const getAllOrdersAdmin = createAsyncThunk(
    "/order/getAllOrdersAdmin", 
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllOrdersApi();
            return response.orderDetails;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    "/order/updateOrderStatus", 
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await updateOrderStatusApi(id, { status });
            return response.orderDetails;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const getAllOrdersUser = createAsyncThunk(
    "/order/getAllOrdersUser", 
    async (_, { rejectWithValue }) => {
        try {
            const response = await getUserOrdersApi();
            return response.orderDetails;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// =========================
// SLICE
// =========================

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearMessage: (state) => {
            state.message = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // =========================
            // CREATE ORDER
            // =========================
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.message = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                // Note: If you want 'orders' to be an array, but createOrder returns an ID, 
                // you might want to adjust this depending on how you use state.orders.
                // Assuming you just store it here based on your original code:
                state.orders = action.payload; 
                state.message = "Order created successfully";
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                // Safely extract the message passed by rejectWithValue
                state.message = action.payload?.message || action.error.message || "Failed to create order";
            })

            // =========================
            // GET ALL ORDERS (ADMIN)
            // =========================
            .addCase(getAllOrdersAdmin.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.message = null;
            })
            .addCase(getAllOrdersAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.orders = action.payload;
                state.message = "Orders fetched successfully";
            })
            .addCase(getAllOrdersAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.message = action.payload?.message || action.error.message || "Failed to fetch admin orders";
            })

            // =========================
            // GET ALL ORDERS (USER)
            // =========================
            .addCase(getAllOrdersUser.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.message = null;
            })
            .addCase(getAllOrdersUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = false;
                state.orders = action.payload;
                state.message = "Your orders fetched successfully";
            })
            .addCase(getAllOrdersUser.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.message = action.payload?.message || action.error.message || "Failed to fetch your orders";
            })

            // =========================
            // UPDATE ORDER STATUS
            // =========================
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = false;
                state.message = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = "Order status updated successfully";
                
                // Safely update the specific order in the array
                state.orders = state.orders.map((order) =>
                    order._id === action.payload._id
                        ? {
                              ...order,
                              status: action.payload.status
                          }
                        : order
                );
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = true;
                state.message = action.payload?.message || action.error.message || "Failed to update order status";
            });
    }
});

export const { clearMessage } = orderSlice.actions;
export default orderSlice.reducer;