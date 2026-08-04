import dotenv from "dotenv";
dotenv.config({ debug: false });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import seedRoutes from "./routes/seed.routes.js";
import cartRoutes from "./routes/cart.routes.js"
import contactRoutes from "./routes/contacts.routes.js"
import profileRoutes from "./routes/user.profile.routes.js"
import addressRoutes from "./routes/address.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"

let app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: [
            "https://qwikcart-frontend.onrender.com"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Auth Routes
app.use("/api/auth",authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/product",productRoutes);
app.use("/api/order",orderRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/seed",seedRoutes);
app.use("/api/product/:productId",reviewRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/contact",contactRoutes);
app.use("/api/user/profile",profileRoutes);
app.use("/api/user/address",addressRoutes);
app.use("/api/user/wishlist",wishlistRoutes);




export default app;