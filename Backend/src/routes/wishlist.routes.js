import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, clearWishlist, moveOneToCart, moveAllToCart} from "../controllers/wishlist.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

let router = express.Router();

router.post("/", isAuthenticated, addToWishlist);
router.get("/", isAuthenticated, getWishlist);
router.delete("/:productId", isAuthenticated, removeFromWishlist);
router.delete("/", isAuthenticated, clearWishlist);
router.post("/moveOneToCart/:productId", isAuthenticated, moveOneToCart);
router.post("/moveAllToCart", isAuthenticated, moveAllToCart);

export default router;