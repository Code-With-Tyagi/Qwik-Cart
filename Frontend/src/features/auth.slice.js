import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentUserApi } from "../api/auth.api";

const normalizeUser = (user) => {
  if (!user) return null;

  const displayName = user.name || user.userName || user.fullName || "";
  const displayEmail = user.email || user.userEmail || "";

  return {
    ...user,
    name: displayName,
    userName: displayName,
    email: displayEmail,
    userEmail: displayEmail,
  };
};

// Check authentication on app load / page refresh
export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const response = await getCurrentUserApi();
  return normalizeUser(response.user);
});

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  hasCheckedAuth: false,
  error: null,
  skipProtectedToast: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginSuccess: (state, action) => {
      state.user = normalizeUser(action.payload);
      state.isAuthenticated = true;
      state.hasCheckedAuth = true;
      state.loading = false;
      state.error = null;
      state.skipProtectedToast = false;
    },

    logoutSuccess: (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.hasCheckedAuth = true;
      state.loading = false;
      state.error = null;
      state.skipProtectedToast = action.payload?.skipProtectedToast ?? false;
    },

    clearProtectedToastSuppression: (state) => {
      state.skipProtectedToast = false;
    },

    // Updates auth.user in-place so Navbar & Sidebar re-render instantly
    updateAuthUser: (state, action) => {
      if (state.user) {
        state.user = normalizeUser({
          ...state.user,
          ...action.payload,
        });
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // checkAuth Pending
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // checkAuth Success
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload);
        state.isAuthenticated = true;
        state.hasCheckedAuth = true;
        state.skipProtectedToast = false;
      })

      // checkAuth Failed
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.hasCheckedAuth = true;
        state.skipProtectedToast = false;
      });
  },
});

export const { loginSuccess, logoutSuccess, updateAuthUser, clearProtectedToastSuppression } = authSlice.actions;
export default authSlice.reducer;