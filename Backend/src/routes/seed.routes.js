import express from "express";
import { seedProducts } from "../controllers/seed.controller.js";

let router=express.Router();

router.post("/products",seedProducts);

export default router;