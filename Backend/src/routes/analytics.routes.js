import express from "express";
import { getAdminStats } from "../controllers/analytics.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

let router=express.Router();

router.get("/",isAuthenticated,isAdmin,getAdminStats);



export default router;