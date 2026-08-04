import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    addToWishlistApi,
    getWishlistApi,
    removeFromWishlistApi,
    clearWishlistApi,
    moveOneWishlistToCartApi,
    moveAllWishlistToCartApi
} from "../api/wishlist.api";

const initialState = {
    wishlist: [],
    loading: false,
    error: null,
};

const normalizeWishlistItems = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.items)) {
        return value.items;
    }

    if (Array.isArray(value?.wishlist?.items)) {
        return value.wishlist.items;
    }

    return [];
};

const getWishlistProductId = (item) => {
    return item?.product?._id?.toString?.() || item?.product?.toString?.() || item?.product?._id || item?.product || "";
};

// Add To Wishlist
export const addToWishlist = createAsyncThunk(
    "wishlist/addToWishlist",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await addToWishlistApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Get Wishlist
export const fetchWishlist = createAsyncThunk(
    "wishlist/getWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getWishlistApi();
            return normalizeWishlistItems(response?.wishlist ?? response);
        } catch (error) {
            const message = error.response?.data?.message || error.message;

            if (error.response?.status === 404 || message === "Wishlist is empty." || message === "Wishlist not found.") {
                return [];
            }

            return rejectWithValue(message);
        }
    }
);

// Remove From Wishlist
export const removeFromWishlist = createAsyncThunk(
    "wishlist/removeFromWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await removeFromWishlistApi(productId);
            return {
                ...response,
                productId,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Clear Wishlist
export const clearWishlist = createAsyncThunk(
    "wishlist/clearWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const response = await clearWishlistApi();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Move One Product To Cart
export const moveOneToCart = createAsyncThunk(
    "wishlist/moveOneToCart",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await moveOneWishlistToCartApi(productId);
            return {
                ...response,
                productId,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Move All Products To Cart
export const moveAllToCart = createAsyncThunk(
    "wishlist/moveAllToCart",
    async (_, { rejectWithValue }) => {
        try {
            const response = await moveAllWishlistToCartApi();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);
const wishlistSlice = createSlice({
    name: "wishlist",

    initialState,

    reducers: {
        clearWishlistState(state) {
            state.wishlist = [];
            state.loading = false;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder

            // Add Wishlist
            .addCase(addToWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = normalizeWishlistItems(action.payload?.wishlist);
            })

            .addCase(addToWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to add product.";
            })

            // Get Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = normalizeWishlistItems(action.payload);
            })

            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch wishlist.";
            })

            // Remove Wishlist
            .addCase(removeFromWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.loading = false;

                state.wishlist = normalizeWishlistItems(state.wishlist).filter(
                    (item) => getWishlistProductId(item) !== action.payload.productId
                );
            })

            .addCase(removeFromWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to remove product.";
            })

            // Clear Wishlist
            .addCase(clearWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(clearWishlist.fulfilled, (state) => {
                state.loading = false;
                state.wishlist = [];
            })

            .addCase(clearWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to clear wishlist.";
            })

            // Move One To Cart
            .addCase(moveOneToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(moveOneToCart.fulfilled, (state, action) => {
                state.loading = false;

                state.wishlist = normalizeWishlistItems(state.wishlist).filter(
                    (item) => getWishlistProductId(item) !== action.payload.productId
                );
            })

            .addCase(moveOneToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to move product.";
            })

            // Move All To Cart
            .addCase(moveAllToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(moveAllToCart.fulfilled, (state) => {
                state.loading = false;
                state.wishlist = [];
            })

            .addCase(moveAllToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to move products.";
            });
    },
});

export default wishlistSlice.reducer;
export const { clearWishlistState } = wishlistSlice.actions;