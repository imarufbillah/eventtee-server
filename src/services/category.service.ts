import { prisma } from "../config/db.js";
import { Prisma, type Category } from "../generated/prisma/client.js";

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

// Update category - PATCH /api/v1/categories/:id
export const updateCategory = async (
  id: string,
  data: Prisma.CategoryUpdateInput,
) => {
  return prisma.category.update({ where: { id }, data });
};

// Soft delete category - PATCH /api/v1/categories/soft-delete/:id
export const softDeleteCategory = async (id: string): Promise<Category> => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new Prisma.PrismaClientKnownRequestError("Category not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  if (category.isDeleted) {
    throw new Error("Category is already deleted");
  }

  return prisma.category.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Restore category - PATCH /api/v1/categories/restore/:id
export const restoreCategory = async (id: string): Promise<Category> => {
  return prisma.category.update({
    where: { id },
    data: { isDeleted: false },
  });
};
