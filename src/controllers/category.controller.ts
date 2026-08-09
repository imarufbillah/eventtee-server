import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as categoryService from "../services/category.service.js";

type updateCategoryBody = { name?: string; slug?: string };

// Get categories - GET /api/v1/categories
export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const categories = await categoryService.getCategories(skip, limit);

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Failed to get categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Get active categories - GET /api/v1/categories/active
export const getActiveCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const categories = await categoryService.getActiveCategories(skip, limit);

    res.status(200).json({
      success: true,
      message: "Active categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Failed to get active categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active categories",
    });
  }
};

// Create category - POST /api/v1/categories
export const createCategory = async (
  req: Request<unknown, unknown, { name?: string; slug?: string }>,
  res: Response,
): Promise<void> => {
  const { name, slug } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({
      success: false,
      message: "Category name is required",
    });
    return;
  }

  try {
    const category = await categoryService.createCategory(name, slug);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.["target"] as string[]) || [];
      const field = target.includes("name") ? "name" : "slug";
      res.status(409).json({
        success: false,
        message: `Category with this ${field} already exists`,
      });
      return;
    }

    console.error("Failed to create category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// Update category - PATCH /api/v1/categories/:id
export const updateCategory = async (
  req: Request<{ id: string }, unknown, updateCategoryBody>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { name, slug } = req.body;

  if (!name && !slug) {
    res.status(400).json({
      success: false,
      message: "At least one field (name or slug) must be provided",
    });
    return;
  }

  try {
    const updateData: { name?: string; slug?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;

    const category = await categoryService.updateCategory(id, updateData);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.["target"] as string[]) || [];
      const field = target.includes("name") ? "name" : "slug";
      res.status(409).json({
        success: false,
        message: `Category with this ${field} already exists`,
      });
      return;
    }

    console.error("Failed to update category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// Soft delete category - PATCH /api/v1/categories/soft-delete/:id
export const softDeleteCategory = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await categoryService.softDeleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    console.error("Failed to delete category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

// Restore category - PATCH /api/v1/categories/restore/:id
export const restoreCategory = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await categoryService.restoreCategory(id);

    res.status(200).json({
      success: true,
      message: "Category restored successfully",
      data: category,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Category not found",
      });
      return;
    }

    console.error("Failed to restore category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore category",
    });
  }
};
