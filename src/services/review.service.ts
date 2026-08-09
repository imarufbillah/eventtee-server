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

// Helper: verify review ownership
export const verifyReviewOwnership = async (
  reviewId: string,
  userId: string,
  userRole?: string,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Prisma.PrismaClientKnownRequestError("Review not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  if (review.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Forbidden: You can only modify your own reviews");
  }

  return review;
};

// Update review - PATCH /api/v1/reviews/:id
export const updateReview = async (
  id: string,
  userId: string,
  userRole: string | undefined,
  data: { rating?: number; comment?: string },
) => {
  const review = await verifyReviewOwnership(id, userId, userRole);

  if (review.isDeleted) {
    throw new Error("Cannot update a deleted review");
  }

  const updateData: Prisma.ReviewUpdateInput = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.comment !== undefined) updateData.comment = data.comment;

  return prisma.review.update({ where: { id }, data: updateData });
};

// Delete review - DELETE /api/v1/reviews/:id
export const deleteReview = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  await verifyReviewOwnership(id, userId, userRole);
  return prisma.review.delete({ where: { id } });
};

// Soft delete review - PATCH /api/v1/reviews/soft-delete/:id
export const softDeleteReview = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  const review = await verifyReviewOwnership(id, userId, userRole);

  if (review.isDeleted) {
    throw new Error("Review is already deleted");
  }

  return prisma.review.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Restore review - PATCH /api/v1/reviews/restore/:id
export const restoreReview = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  await verifyReviewOwnership(id, userId, userRole);

  return prisma.review.update({
    where: { id },
    data: { isDeleted: false },
  });
};

// Get reviews for an event - GET /api/v1/events/:eventId/reviews
export const getReviewsByEvent = async (
  eventId: string,
  skip = 0,
  take = 20,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, isDeleted: true },
  });

  if (!event || event.isDeleted) {
    throw new Prisma.PrismaClientKnownRequestError("Event not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  const where: Prisma.ReviewWhereInput = {
    eventId,
    isDeleted: false,
  };

  const [reviews, total, aggregate] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      where,
      _avg: {
        rating: true,
      },
    }),
  ]);

  const rawAvg = aggregate._avg.rating ?? 0;
  const averageRating = Number(rawAvg.toFixed(1));

  return {
    event: {
      id: event.id,
      title: event.title,
    },
    averageRating,
    totalReviews: total,
    reviews,
  };
};
