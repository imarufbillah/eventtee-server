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

// Get active reviews - GET /api/v1/reviews/active
export const getActiveReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const reviews = await reviewService.getActiveReviews(skip, limit);

    res.status(200).json({
      success: true,
      message: "Active reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Failed to get active reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active reviews",
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

// Update review - PATCH /api/v1/reviews/:id
export const updateReview = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: Prisma.ReviewUpdateInput = req.body;

    const review = await reviewService.updateReview(id, data);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Failed to update review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// Delete review - DELETE /api/v1/reviews/:id
export const deleteReview = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    await reviewService.deleteReview(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

// Soft delete review - PATCH /api/v1/reviews/soft-delete/:id
export const softDeleteReview = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const review = await reviewService.softDeleteReview(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    console.error("Failed to delete review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
