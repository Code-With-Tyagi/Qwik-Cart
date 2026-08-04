import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productSeedApi } from "../api/seed.api";

export const seedProducts = createAsyncThunk("seed/seedProducts", async (payload) => {
    const response = await productSeedApi(payload);
    return response;
});
const initialState = {
    loading: false,
    success: false,
    insertedCount: 0,
    message: "",
    error: null,
};

const seedSlice = createSlice({
    name: "seed",
    initialState,
    reducers: {
        clearSeedState: (state) => {
            state.loading = false;
            state.success = false;
            state.insertedCount = 0;
            state.message = "";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(seedProducts.pending, (state) => {
                state.loading = true;
                state.success = false;
                state.error = null;
                state.message = "";
            })

            .addCase(seedProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.insertedCount = action.payload.insertedCount;
                state.message = action.payload.message;
            })

            .addCase(seedProducts.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error =
                    action.payload?.message ||
                    "Failed to seed products.";
            });
    },
});

export const { clearSeedState } = seedSlice.actions;

export default seedSlice.reducer;