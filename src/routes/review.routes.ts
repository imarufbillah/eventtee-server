import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

router.get("/", reviewController.getReviews);
router.get("/active", reviewController.getActiveReviews);
router.post("/", reviewController.createReview);
router.patch("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.patch("/soft-delete/:id", reviewController.softDeleteReview);

export default router;
