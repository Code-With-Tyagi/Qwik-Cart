import express from "express";
import { verifyPayment,createPayment} from "../controllers/payment.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

let router=express.Router();

router.post("/create",isAuthenticated,createPayment);
router.post("/verify",isAuthenticated,verifyPayment);


export default router;