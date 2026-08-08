import { prisma } from "../config/db.js";

// Get categories - GET /api/v1/categories
export const getCategories = async (skip = 0, take = 20) => {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take,
      select: { id: true, name: true, slug: true },
    }),
    prisma.category.count(),
  ]);
  return { categories, total };
};

// Create category - POST /api/v1/categories
export const createCategory = async (name: string, slug: string) => {
  return prisma.category.create({ data: { name, slug } });
};
