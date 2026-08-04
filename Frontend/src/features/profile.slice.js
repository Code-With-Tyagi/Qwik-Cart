import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    personalInfoUpdateApi,
    requestEmailUpdateApi,
    verifyEmailUpdateApi,
    requestMobileUpdateApi,
    verifyMobileUpdateApi,
    changePasswordApi,
    deactivateAccountApi,
    deleteAccountApi,
    reactivateAccountRequestApi,
    reactivateAccountVerifyApi
} from "../api/profile.api";

const getApiErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong";

const initialState = {
    loading: false,
    error: null,
    successMessage: "",
    user: null,
};

export const personalInfoUpdate = createAsyncThunk(
    "/profile/personalInfoUpdate",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await personalInfoUpdateApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const requestEmailUpdate = createAsyncThunk(
    "/profile/requestEmailUpdate",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await requestEmailUpdateApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const verifyEmailUpdate = createAsyncThunk(
    "/profile/verifyEmailUpdate",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await verifyEmailUpdateApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const requestMobileUpdate = createAsyncThunk(
    "/profile/requestMobileUpdate",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await requestMobileUpdateApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const verifyMobileUpdate = createAsyncThunk(
    "/profile/verifyMobileUpdate",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await verifyMobileUpdateApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const changePassword = createAsyncThunk(
    "/profile/changePassword",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await changePasswordApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deactivateAccount = createAsyncThunk(
    "/profile/deactivateAccount",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await deactivateAccountApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const deleteAccount = createAsyncThunk(
    "/profile/deleteAccount",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await deleteAccountApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const reactivateAccountRequest = createAsyncThunk(
    "/profile/reactivateAccountRequest",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await reactivateAccountRequestApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

export const reactivateAccountVerify = createAsyncThunk(
    "/profile/reactivateAccountVerify",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await reactivateAccountVerifyApi(payload);
            return response;
        } catch (error) {
            return rejectWithValue(getApiErrorMessage(error));
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        setProfileUser: (state, action) => {
            state.user = action.payload;
        },
        clearProfileState: (state) => {
            state.loading = false;
            state.error = null;
            state.successMessage = "";
        },
    },
    extraReducers: (builder) => {
        builder

            // PERSONAL INFO CASES
            .addCase(personalInfoUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(personalInfoUpdate.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                state.user = action.payload.user;
            })
            .addCase(personalInfoUpdate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // REQUEST EMAIL UPDATE CASES
            .addCase(requestEmailUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestEmailUpdate.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(requestEmailUpdate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // VERIFY EMAIL UPDATE CASES
            .addCase(verifyEmailUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmailUpdate.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                if (action.payload.user) state.user = action.payload.user;
            })
            .addCase(verifyEmailUpdate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // REQUEST MOBILE UPDATE CASES
            .addCase(requestMobileUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestMobileUpdate.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(requestMobileUpdate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // VERIFY MOBILE UPDATE CASES
            .addCase(verifyMobileUpdate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyMobileUpdate.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                if (action.payload.user) state.user = action.payload.user;
            })
            .addCase(verifyMobileUpdate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // CHANGE PASSWORD CASES
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // DEACTIVATE ACCOUNT CASES 
            .addCase(deactivateAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deactivateAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(deactivateAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // DELETE ACCOUNT CASES
            .addCase(deleteAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // REACTIVATE ACCOUNT REQUEST CASES
            .addCase(reactivateAccountRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reactivateAccountRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(reactivateAccountRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })

            // REACTIVATE ACCOUNT VERIFY CASES
            .addCase(reactivateAccountVerify.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reactivateAccountVerify.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(reactivateAccountVerify.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default profileSlice.reducer;
export const { clearProfileState, setProfileUser } = profileSlice.actions;