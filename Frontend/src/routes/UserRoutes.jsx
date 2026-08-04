import React from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ProtectedRoute from "../components/common/ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Shop from "../pages/Shop";
import ProductDescription from "../pages/ProductDescription";
import ProductReviews from "../pages/ProductReviews";
import NotFound from "../pages/NotFound";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import FAQ from "../pages/FAQ";
import AccountReactivationPage from "../pages/AccountReactivationPage";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyEmail from "../pages/VerifyEmail";

// Import protected pages

const UserRoutes = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDescription />} />
          <Route path="/product/:id/reviews" element={<ProductReviews />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          <Route path="/account/reactivate" element={<AccountReactivationPage />} />
          <Route path="/account/forgot-password" element={<ForgotPassword />} />
          <Route path="/account/verify" element={<VerifyEmail />} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default UserRoutes;