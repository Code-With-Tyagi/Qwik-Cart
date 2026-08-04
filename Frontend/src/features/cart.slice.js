import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    addToCartApi,
    getCartApi,
    removeCartApi,
    updateCartQuantityApi,
} from "../api/cart.api";

const initialState = {
    cartItems: [],
    loading: false,
    error: null,
    message: "",
    totalQuantity: 0,
    totalPrice: 0,
    cartLength: 0,
};

export const addCartApi = createAsyncThunk(
    "/cart/addToCart",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await addToCartApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getCart = createAsyncThunk(
    "/cart/getCart",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getCartApi();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateCartQuantity = createAsyncThunk(
    "/cart/updateQuantity",
    async (payload, { rejectWithValue }) => {
        try {
            const { quantity, productId } = payload;
            const response = await updateCartQuantityApi(quantity, productId);

            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const removeCart = createAsyncThunk(
    "/cart/removeCart",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await removeCartApi(productId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const calculateTotals = (state) => {
    state.totalQuantity = 0;
    state.totalPrice = 0;

    state.cartItems.forEach((item) => {
        state.totalQuantity += item.quantity;
        state.totalPrice += item.price * item.quantity;
    });

    state.cartLength = state.cartItems.length;
};

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        clearCart: (state) => {
            state.cartItems = [];
            state.error = null;
            state.message = "";
            calculateTotals(state);
        },
    },

    extraReducers: (builder) => {
        builder

            // ================= ADD TO CART =================

            .addCase(addCartApi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(addCartApi.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.cartItems = action.payload.cart.items;

                calculateTotals(state);
            })

            .addCase(addCartApi.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload?.message ||
                    "Error while adding product to cart.";
            })

            // ================= GET CART =================

            .addCase(getCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.cartItems = action.payload.cartProducts;

                calculateTotals(state);
            })

            .addCase(getCart.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload?.message ||
                    "Error while fetching cart.";
            })

            // ================= UPDATE QUANTITY =================

            .addCase(updateCartQuantity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateCartQuantity.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.cartItems = action.payload.cart.items;

                calculateTotals(state);
            })

            .addCase(updateCartQuantity.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload?.message ||
                    "Error while updating quantity.";
            })

            // ================= REMOVE PRODUCT =================

            .addCase(removeCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(removeCart.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.cartItems = action.payload.cart.items;

                calculateTotals(state);
            })

            .addCase(removeCart.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload?.message ||
                    "Error while removing product.";
            });
    },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;