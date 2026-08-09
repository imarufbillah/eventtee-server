import { prisma } from "../config/db.js";
import { Prisma } from "../generated/prisma/client.js";

// Create review - POST /api/v1/reviews
export const createReview = async (data: Prisma.ReviewCreateInput) => {
  return prisma.review.create({ data });
};
