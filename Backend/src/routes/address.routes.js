import express from "express";
import { addAddress, getAddressById, getAllAddress, deleteAddress, updateAddress, setDefaultAddress } from "../controllers/address.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";


let router = express.Router();

router.post("/", isAuthenticated, addAddress);
router.get("/", isAuthenticated, getAllAddress);
router.get("/:id", isAuthenticated, getAddressById);
router.put("/:id", isAuthenticated, updateAddress);
router.delete("/:id", isAuthenticated, deleteAddress);
router.patch("/default/:id", isAuthenticated, setDefaultAddress);

export default router;