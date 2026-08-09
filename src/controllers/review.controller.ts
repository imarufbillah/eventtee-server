import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as reviewService from "../services/review.service.js";

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
