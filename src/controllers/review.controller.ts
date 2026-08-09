import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as reviewService from "../services/review.service.js";

// Get reviews - GET /api/v1/reviews/:id
export const getReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const reviews = await reviewService.getReviews(skip, limit);

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Failed to get reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// Create review - POST /api/v1/reviews
export const createReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data: Prisma.ReviewCreateInput = req.body;

    const review = await reviewService.createReview(data);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Failed to create review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};
