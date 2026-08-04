import express from "express";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { getAllUsers } from "../controllers/auth.controller.js";

let router = express.Router();


router.get("/users", isAuthenticated, isAdmin, getAllUsers);

export default router;
