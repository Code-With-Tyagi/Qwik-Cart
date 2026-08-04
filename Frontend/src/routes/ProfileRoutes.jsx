import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProtectedRoute from '../components/common/ProtectedRoute';

import UserLayout from '../user/UserLayout';
import UserManageAddress from '../user/UserManageAddress';
import UserOrders from '../user/UserOrders';
import UserChangePassword from '../user/UserChangePassword';
import UserProfile from '../user/UserProfile';
import UserReviews from '../user/UserReviews';
import UserWishlist from '../user/UserWishlist';
import UserContactSupport from '../user/UserContactSupport';
import UserContactRequests from '../user/UserContactRequests';


const ProfileRoutes = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="grow">
                <Routes>
                    <Route element={<ProtectedRoute />}>

                        <Route path="/" element={<UserLayout />}>
                            <Route path="profile" element={<UserProfile />} />
                            <Route path="addresses" element={<UserManageAddress />} />
                            <Route path="orders" element={<UserOrders />} />
                            <Route path="change-password" element={<UserChangePassword />} />
                            <Route path="reviews" element={<UserReviews />} />
                            <Route path="wishlist" element={<UserWishlist />} />
                            <Route path="support" element={<UserContactSupport />} />
                            <Route path="support/requests" element={<UserContactRequests />} />
                        </Route>
                    </Route>
                </Routes>
            </main>

            <Footer />
        </div>
    );
};

export default ProfileRoutes;