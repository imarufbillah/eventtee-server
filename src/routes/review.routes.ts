import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";

const router = Router();

router.post("/", reviewController.createReview);

export default router;
