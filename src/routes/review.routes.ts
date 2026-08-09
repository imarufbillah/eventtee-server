import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

router.get("/", reviewController.getReviews);
router.post("/", reviewController.createReview);
router.patch("/:id", reviewController.updateReview);

export default router;
