import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProductsApi,
  getProductById,
  updateProductApi,
  deleteProductApi,
  createProductApi,
  getAllCategoriesApi
} from "../api/product.api";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProductsApi();
      return response.productDetails;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getProductById(id);
      return response.productDetails;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteProductApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete product");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await updateProductApi(id, productData);
      return response.updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update product");
    }
  }
);

export const createProduct = createAsyncThunk(
  "product/create",
  async (productData, { rejectWithValue }) => {
    try {
      const response = await createProductApi(productData);
      return response.productDetails;

    } catch (error) {

      return rejectWithValue(
        error.message || "Failed to create product"
      );

    }
  }
);

export const getAllCategories = createAsyncThunk(
  "product/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllCategoriesApi();
      return response.categories;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch categories"
      );
    }
  }
);


const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  categories: []
};

const productSlice = createSlice({
  name: "product",

  initialState,

  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    clearProductError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===============================
      // Fetch Products
      // ===============================

      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.products = [];
        state.error = action.payload || "Failed to fetch products";
      })

      // ===============================
      // Fetch Product By Id
      // ===============================

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })

      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.selectedProduct = null;
        state.error = action.payload || "Failed to fetch product";
      })

      // ===============================
      // Delete Product
      // ===============================

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;

        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      })

      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete product";
      })

      // ===============================
      // Update Product
      // ===============================

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;

        state.products = state.products.map((product) =>
          product._id === action.payload._id
            ? action.payload
            : product
        );

        state.selectedProduct = action.payload;
      })

      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update product";
      })

      // ===============================
      // Create Product
      // ===============================

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })

      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create product";
      })

      // GET ALL CATEGORIES
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })

      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const {
  clearSelectedProduct,
  clearProductError,
} = productSlice.actions;

export default productSlice.reducer;