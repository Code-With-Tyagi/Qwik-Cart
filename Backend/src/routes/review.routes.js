import express from "express";
import { createReview, deleteReview, getAllReviews, getReviewsById, getUserReviews, updateReview } from "../controllers/review.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router({
  mergeParams: true,
});

router.post("/reviews",isAuthenticated,createReview);
router.get("/reviews",isAuthenticated,getReviewsById);
router.put("/:reviewId",isAuthenticated,updateReview);
router.delete("/:reviewId",isAuthenticated,deleteReview);
router.get("/allReviews",isAuthenticated,isAdmin,getAllReviews);
router.get("/userReviews",isAuthenticated,getUserReviews);

export default router;