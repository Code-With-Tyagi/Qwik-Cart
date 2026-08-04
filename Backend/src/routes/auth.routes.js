import express from "express";
import { registerController, verifyOTP, loginController, logoutController, getCurrentUser, forgotPasswordRequest, forgotPasswordReset,resendRegistrationOtp } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { healthCheck } from "../controllers/auth.controller.js";


let router = express.Router();

router.get("/health",healthCheck);
router.post("/register", registerController);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me",isAuthenticated,getCurrentUser);
router.post("/forgot-password/send-otp",forgotPasswordRequest);
router.post("/forgot-password/reset",forgotPasswordReset);
router.post("/resend-registration-otp", resendRegistrationOtp);


export default router;