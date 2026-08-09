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
  const userId = req.user?.id;
  const { eventId, rating, comment } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  if (!eventId || typeof eventId !== "string") {
    res.status(400).json({
      success: false,
      message: "eventId is required",
    });
    return;
  }

  const parsedRating = Number(rating);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({
      success: false,
      message: "rating must be an integer between 1 and 5",
    });
    return;
  }

  try {
    const reviewData: reviewService.CreateReviewInput = {
      userId,
      eventId,
      rating: Math.floor(parsedRating),
    };
    if (typeof comment === "string" && comment.trim().length > 0) {
      reviewData.comment = comment;
    }

    const review = await reviewService.createReview(reviewData);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(400).json({
        success: false,
        message: "You have already submitted a review for this event",
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (
      error instanceof Error &&
      (error.message.includes("COMPLETED") ||
        error.message.includes("already submitted") ||
        error.message.includes("unavailable"))
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

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
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const { rating, comment } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  const updateData: { rating?: number; comment?: string } = {};
  if (rating !== undefined) {
    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      res.status(400).json({
        success: false,
        message: "rating must be an integer between 1 and 5",
      });
      return;
    }
    updateData.rating = Math.floor(parsedRating);
  }

  if (typeof comment === "string") {
    updateData.comment = comment;
  }

  try {
    const review = await reviewService.updateReview(
      id,
      userId,
      userRole,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
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

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message.includes("Cannot")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

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
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    await reviewService.deleteReview(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
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

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
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

// Soft delete review - PATCH /api/v1/reviews/soft-delete/:id
export const softDeleteReview = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    const review = await reviewService.softDeleteReview(id, userId, userRole);

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

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message.includes("already")) {
      res.status(400).json({
        success: false,
        message: error.message,
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

// Restore review - PATCH /api/v1/reviews/restore/:id
export const restoreReview = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    const review = await reviewService.restoreReview(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Review restored successfully",
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

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Failed to restore review:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore review",
    });
  }
};

// Get reviews for an event - GET /api/v1/events/:eventId/reviews
export const getReviewsByEvent = async (
  req: Request<{ eventId: string }>,
  res: Response,
): Promise<void> => {
  const { eventId } = req.params;

  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const data = await reviewService.getReviewsByEvent(eventId, skip, limit);

    res.status(200).json({
      success: true,
      message: "Event reviews fetched successfully",
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    console.error("Failed to get event reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event reviews",
    });
  }
};
