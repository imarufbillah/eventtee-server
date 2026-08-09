import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", reviewController.getReviews);
router.get("/active", reviewController.getActiveReviews);
router.post(
  "/",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  reviewController.createReview,
);
router.patch(
  "/:id",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  reviewController.updateReview,
);
router.delete(
  "/:id",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  reviewController.deleteReview,
);
router.patch(
  "/soft-delete/:id",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  reviewController.softDeleteReview,
);
router.patch(
  "/restore/:id",
  authenticate,
  authorize("ADMIN"),
  reviewController.restoreReview,
);

export default router;
