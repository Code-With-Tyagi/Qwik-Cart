import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    addAddressApi,
    getAllAddressApi,
    getAddressByIdApi,
    updateAddressApi,
    deleteAddressApi,
    setDefaultAddressApi,
} from "../api/address.api";

const initialState = {
    addresses: [],
    selectedAddress: null,
    loading: false,
    error: null,
    successMessage: null,
};

export const addAddress = createAsyncThunk(
    "/address/addAddress",
    async (payload) => {
        const response = await addAddressApi(payload);
        return response;
    }
);

export const getAllAddress = createAsyncThunk(
    "/address/getAllAddress",
    async () => {
        const response = await getAllAddressApi();
        return response;
    }
);

export const getAddressById = createAsyncThunk(
    "/address/getAddressById",
    async (id) => {
        const response = await getAddressByIdApi(id);
        return response;
    }
);

export const updateAddress = createAsyncThunk(
    "/address/updateAddress",
    async ({ id, payload }) => {
        const response = await updateAddressApi(id, payload);
        return response;
    }
);

export const deleteAddress = createAsyncThunk(
    "/address/deleteAddress",
    async (id) => {
        await deleteAddressApi(id);
        return id;
    }
);

export const setDefaultAddress = createAsyncThunk(
    "/address/setDefaultAddress",
    async (id) => {
        const response = await setDefaultAddressApi(id);
        return response;
    }
);

const addressSlice = createSlice({
    name: "address",
    initialState,
    reducers: {
        clearAddressState: (state) => {
            state.loading = false;
            state.error = null;
            state.successMessage = null;
            state.selectedAddress = null;
        },
    },
    extraReducers: (builder) => {
        builder

            // ADD ADDRESS CASES

            .addCase(addAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
                state.addresses.push(action.payload.savedAddress);
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // GET ADDRESS CASES
            .addCase(getAllAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload.addresses;
            })
            .addCase(getAllAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // GET ADDRESS BY ID

            .addCase(getAddressById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAddressById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAddress = action.payload.address;
            })
            .addCase(getAddressById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })


            // UPDATE ADDRESS 
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;

                const index = state.addresses.findIndex(
                    (address) => address._id === action.payload.updatedAddress._id
                );

                if (index !== -1) {
                    state.addresses[index] = action.payload.updatedAddress;
                }

                state.selectedAddress = action.payload.updatedAddress;
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // DELETE ADDRESS

            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = state.addresses.filter(
                    (address) => address._id !== action.payload
                );
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // SET DEFAULT ADDRESS

            .addCase(setDefaultAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;

                state.addresses = state.addresses.map((address) => ({
                    ...address,
                    isDefault:
                        address._id === action.payload.defaultAddress._id,
                }));
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default addressSlice.reducer;
export const { clearAddressState } = addressSlice.actions;