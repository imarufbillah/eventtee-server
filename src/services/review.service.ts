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

// Create review - POST /api/v1/reviews
export const createReview = async (data: Prisma.ReviewCreateInput) => {
  return prisma.review.create({ data });
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
