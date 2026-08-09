import { prisma } from "../config/db.js";
import { Prisma, type Category } from "../generated/prisma/client.js";

/**
 * Generate a URL-friendly slug from text
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[\s\W_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Get categories - GET /api/v1/categories
export const getCategories = async (skip = 0, take = 20) => {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take,
      select: { id: true, name: true, slug: true, isDeleted: true },
    }),
    prisma.category.count(),
  ]);
  return { categories, total };
};

// Get active categories - GET /api/v1/categories/active
export const getActiveCategories = async (skip = 0, take = 20) => {
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where: { isDeleted: false },
      skip,
      take,
      select: { id: true, name: true, slug: true },
    }),
    prisma.category.count({ where: { isDeleted: false } }),
  ]);
  return { categories, total };
};

// Create category - POST /api/v1/categories
export const createCategory = async (name: string, slug?: string) => {
  const categorySlug = slug && slug.trim() ? slugify(slug) : slugify(name);
  return prisma.category.create({
    data: {
      name: name.trim(),
      slug: categorySlug,
    },
  });
};

// Update category - PATCH /api/v1/categories/:id
export const updateCategory = async (
  id: string,
  data: { name?: string; slug?: string },
) => {
  const updateData: Prisma.CategoryUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }

  if (data.slug !== undefined && data.slug.trim()) {
    updateData.slug = slugify(data.slug);
  } else if (data.name !== undefined) {
    updateData.slug = slugify(data.name);
  }

  return prisma.category.update({ where: { id }, data: updateData });
};

// Soft delete category - PATCH /api/v1/categories/soft-delete/:id
export const softDeleteCategory = async (id: string): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          events: {
            where: {
              isDeleted: false,
              status: "PUBLISHED",
            },
          },
        },
      },
    },
  });

  if (!category) {
    throw new Prisma.PrismaClientKnownRequestError("Category not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  if (category.isDeleted) {
    throw new Error("Category is already deleted");
  }

  if (category._count.events > 0) {
    throw new Error(
      `Cannot delete category with ${category._count.events} active published event(s)`,
    );
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
