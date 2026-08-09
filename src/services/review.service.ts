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
