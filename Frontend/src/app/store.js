import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
} from "redux-persist";
import storage from "redux-persist/es/storage";


// Import Reducers
import authReducer from "../features/auth.slice.js";
import productReducer from "../features/product.slice.js";
import reviewReducer from "../features/review.slice.js";
import cartReducer from "../features/cart.slice.js";
import orderReducer from "../features/order.slice.js";
import paymentReducer from "../features/paymet.slice.js";
import analyticsReducer from "../features/analytics.slice.js";
import userReducer from "../features/user.slice.js";
import contactReducer from "../features/contact.slice.js";
import profileReducer from "../features/profile.slice.js";
import addressReducer from "../features/address.slice.js";
import wishlistReducer from "../features/wishlist.slice.js"


// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  product: productReducer,
  review: reviewReducer,
  cart: cartReducer,
  order: orderReducer,
  payment: paymentReducer,
  analytics: analyticsReducer,
  user: userReducer,
  contact: contactReducer,
  profile: profileReducer,
  address: addressReducer,
  wishlist: wishlistReducer,
});


// Redux Persist Configuration
const persistConfig = {
  key: "root",
  storage,
  version: 1,

  // Persist only the slices you need
  whitelist: ["auth", "cart", "wishlist"],
};

// Create persisted reducer
const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create persistor
export const persistor = persistStore(store);