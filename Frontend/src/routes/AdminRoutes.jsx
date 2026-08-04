import React from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import AdminLayout from "../admin/AdminLayout";
import AdminDashboard from "../admin/AdminDashboard";
import AdminProducts from "../admin/AdminProducts";
import AdminCreateProduct from "../admin/AdminCreateProduct";
import AdminProductCategories from "../admin/AdminProductCategories";
import AdminStocks from "../admin/AdminStocks";
import AdminOrders from "../admin/AdminOrders";
import AdminUser from "../admin/AdminUser";
import AdminReviews from "../admin/AdminReviews";
import AdminDatabaseSeeding from "../admin/AdminDatabaseSeeding";
import AdminContacts from "../admin/AdminContacts";
import AdminNotFoundPage from "../admin/AdminNotFoundPage";

const AdminRoutes = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow">
        <Routes>
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="create-product" element={<AdminCreateProduct />} />
              <Route path="categories" element={<AdminProductCategories />} />
              <Route path="inventory" element={<AdminStocks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUser />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="seed-products" element={<AdminDatabaseSeeding />} />
              <Route path="contacts" element={<AdminContacts />} />

              {/* 404 */}
              <Route path="*" element={<AdminNotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default AdminRoutes;