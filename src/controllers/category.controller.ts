import type { Request, Response } from "express";
import * as categoryService from "../services/category.service.js";

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

// Create category - POST /api/v1/categories
export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, slug } = req.body;

  try {
    const category = await categoryService.createCategory(name, slug);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Failed to create category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};
