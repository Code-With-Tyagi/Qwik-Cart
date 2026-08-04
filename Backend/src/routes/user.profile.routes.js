import express from "express";
import { deactivateAccountRequest, deleteAccountRequest, requestEmailUpdate, requestMobileUpdate, updatePersonalInformation, verifyEmailUpdate, verifyMobileUpdate, changePasswordRequest, accountReactivationRequest, accountReactivationVerify } from "../controllers/user.profile.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

let router = express();

router.patch("/personal", isAuthenticated, updatePersonalInformation);
router.patch("/email/request", isAuthenticated, requestEmailUpdate);
router.patch("/email/verify", isAuthenticated, verifyEmailUpdate);
router.patch("/mobile/request", isAuthenticated, requestMobileUpdate);
router.patch("/mobile/verify", isAuthenticated, verifyMobileUpdate);
router.post("/account/deactivate", isAuthenticated, deactivateAccountRequest);
router.delete("/account/delete", isAuthenticated, deleteAccountRequest);
router.patch("/change-password", isAuthenticated, changePasswordRequest);
router.post("/reactivate/request", accountReactivationRequest);
router.patch("/reactivate/verify", accountReactivationVerify);
export default router;