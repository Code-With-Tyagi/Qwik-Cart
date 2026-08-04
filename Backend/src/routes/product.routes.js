import express from "express";
import multer from "multer";

import {
    createProduct,
    deleteProduct,
    getAllCategories,
    getAllProducts,
    getProductById,
    updateProduct,
} from "../controllers/product.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
});

const router = express.Router();

router.get("/", getAllProducts);

router.get("/categories",getAllCategories);

router.get("/:id", getProductById);

router.post("/create", isAuthenticated, isAdmin, upload.array("images", 5), createProduct);

router.put("/update/:id", isAuthenticated, isAdmin, upload.array("images", 5), updateProduct);

router.delete("/delete/:id", isAuthenticated, isAdmin, deleteProduct);

export default router;