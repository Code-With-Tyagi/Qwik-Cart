import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminAllUsersApi } from "../api/user.api";

const initialState = {
    users: [],
    loading: false,
    error: null,
};

export const usersApi = createAsyncThunk(
    "user/getAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminAllUsersApi();
            return response.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(usersApi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(usersApi.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
                state.error = null;
            })

            .addCase(usersApi.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default userSlice.reducer;