import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createReviewApi, updateReviewApi, deleteReviewApi, getAllReviewsUserApi } from "../api/review.api";
import { getAllReviewsAdminApi } from "../api/review.api";

const initialState = {
    reviews: [],
    review: null,
    loading: false,
    error: null,
};

// Create Review
export const createReview = createAsyncThunk("review/createReview", async (reviewData, { rejectWithValue }) => {
    try {
        const { productId, ...review } = reviewData;
        const response = await createReviewApi(productId, review);
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
}
);

// Update Review
export const updateReview = createAsyncThunk("review/updateReview", async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
        const response = await updateReviewApi(reviewId, reviewData);
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Delete Review
export const deleteReview = createAsyncThunk("review/deleteReview", async (reviewId, { rejectWithValue }) => {
    try {
        const response = await deleteReviewApi(reviewId);
        return response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

// Get All Reviews
export const fetchReviewsAdmin = createAsyncThunk("/review/fetchReviewsAdmin", async () => {
    const response = await getAllReviewsAdminApi();
    console.log(response.reviews);
    return response.reviews;
})

export const fetchReviewsUser = createAsyncThunk("/review/fetchReviewsUser", async () => {
    const response = await getAllReviewsUserApi();
    console.log(response.reviews);
    return response.reviews;
})

const reviewSlice = createSlice({
    name: "review",
    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                state.review = action.payload;

                // If API returns the created review object
                state.reviews.push(action.payload);
            })

            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create review";
            })

            .addCase(updateReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(updateReview.fulfilled, (state, action) => {
                state.loading = false;
                state.review = action.payload;
            })

            .addCase(updateReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update review";
            })

            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(review => review._id !== action.payload.deletedReview?._id);
            })

            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete review";
            })

            .addCase(fetchReviewsAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchReviewsAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })

            .addCase(fetchReviewsAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch reviews";
            })

            .addCase(fetchReviewsUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchReviewsUser.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })

            .addCase(fetchReviewsUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch reviews";
            })
    },
});

export default reviewSlice.reducer;