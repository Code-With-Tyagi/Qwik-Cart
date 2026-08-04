import express from "express";
import { createOrder, getMyOrder, getOrders, updateOrderStatus } from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

let router=express.Router();

router.post("/create",isAuthenticated,createOrder);
router.get("/my-orders",isAuthenticated,getMyOrder);
router.get("/allOrders",isAuthenticated,isAdmin,getOrders);
router.put("/status/:id",isAuthenticated,isAdmin,updateOrderStatus);
export default router