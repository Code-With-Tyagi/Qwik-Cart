import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import getAdminStatsApi from "../api/analytics.api";

const initialState = {
    stats: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        pendingOrders: 0,
    },

    recentOrders: [],

    recentUsers: [],

    lowStockProducts: [],

    topSellingProducts:[],

    categories:[],

    loading: false,

    error: null,
};

export const adminAnalytics = createAsyncThunk("admin/analytics", async () => {
    const response = await getAdminStatsApi();
    console.log(response.data);
    return response.data;
}
);

const analyticsSlice = createSlice({
    name: "analytics",

    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(adminAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(adminAnalytics.fulfilled, (state, action) => {
                state.loading = false;

                state.stats = action.payload.stats || initialState.stats;
                state.recentOrders = action.payload.recentOrders || [];
                state.recentUsers = action.payload.recentUsers || [];
                state.lowStockProducts = action.payload.lowStockProducts || [];
                state.topSellingProducts = action.payload.topSellingProducts || [];
                state.categories = (action.payload.categories || []).map((item) => ({
                    ...item,
                    count: Number(item?.count ?? item?.quantity ?? item?.totalProducts ?? item?.totalStock ?? 0),
                }));
            })

            .addCase(adminAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default analyticsSlice.reducer;