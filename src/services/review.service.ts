import { prisma } from "../config/db.js";
import { Prisma } from "../generated/prisma/client.js";

// Get reviews - GET /api/v1/reviews
export const getReviews = async (skip = 0, take = 20) => {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      skip,
      take,
      select: {
        id: true,
        rating: true,
        comment: true,
        isDeleted: true,
        userId: true,
        eventId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.review.count(),
  ]);
  return { reviews, total };
};

// Get active reviews - GET /api/v1/reviews/active
export const getActiveReviews = async (skip = 0, take = 20) => {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { isDeleted: false },
      skip,
      take,
      select: {
        id: true,
        rating: true,
        comment: true,
        userId: true,
        eventId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.review.count({ where: { isDeleted: false } }),
  ]);
  return { reviews, total };
};

export interface CreateReviewInput {
  userId: string;
  eventId: string;
  rating: number;
  comment?: string;
}

// Create review - POST /api/v1/reviews
export const createReview = async ({
  userId,
  eventId,
  rating,
  comment,
}: CreateReviewInput) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new Error("Event not found or unavailable");
  }

  if (event.status !== "COMPLETED") {
    throw new Error("Reviews can only be submitted for COMPLETED events");
  }

  const confirmedBooking = await prisma.booking.findFirst({
    where: {
      userId,
      eventId,
      status: "CONFIRMED",
      isDeleted: false,
    },
  });

  if (!confirmedBooking) {
    throw new Error(
      "Forbidden: You can only review events you have a CONFIRMED booking for",
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      eventId,
      isDeleted: false,
    },
  });

  if (existingReview) {
    throw new Error("You have already submitted a review for this event");
  }

  return prisma.review.create({
    data: {
      rating,
      comment: comment || null,
      user: { connect: { id: userId } },
      event: { connect: { id: eventId } },
    },
  });
};

// Update review - PATCH /api/v1/reviews/:id
export const updateReview = async (
  id: string,
  data: Prisma.ReviewUpdateInput,
) => {
  return prisma.review.update({ where: { id }, data });
};

// Delete review - DELETE /api/v1/reviews/:id
export const deleteReview = async (id: string) => {
  return prisma.review.delete({ where: { id } });
};

// Soft delete review - PATCH /api/v1/reviews/soft-delete/:id
export const softDeleteReview = async (id: string) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new Prisma.PrismaClientKnownRequestError("Review not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  if (review.isDeleted) {
    throw new Error("Review is already deleted");
  }

  return prisma.review.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Restore review - PATCH /api/v1/reviews/restore/:id
export const restoreReview = async (id: string) => {
  return prisma.review.update({
    where: { id },
    data: { isDeleted: false },
  });
};
