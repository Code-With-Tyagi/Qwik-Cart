import express from "express";
import { addProduct,deleteCartProduct,updateCartProduct,getCartProducts } from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

let router=express.Router();

router.post("/add",isAuthenticated,addProduct);
router.get("/",isAuthenticated,getCartProducts);
router.put("/:productId",isAuthenticated,updateCartProduct);
router.delete("/:productId",isAuthenticated,deleteCartProduct);


export default router;