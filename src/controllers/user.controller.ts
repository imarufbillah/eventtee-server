import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as userService from "../services/user.service.js";

type UpdateUserBody = Pick<Prisma.UserUpdateInput, "name" | "image">;

// Get users - GET /api/v1/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const users = await userService.getUsers(skip, limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Failed to get users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Update user - PATCH /api/v1/users/:id
export const updateUser = async (
  req: Request<{ id: string }, unknown, UpdateUserBody>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { name, image } = req.body;

  if (!name && !image) {
    res.status(400).json({
      success: false,
      message: "At least one field (name or image) must be provided",
    });
    return;
  }

  const data: Prisma.UserUpdateInput = {
    ...(name !== undefined && { name }),
    ...(image !== undefined && { image }),
  };

  try {
    const updatedUser = await userService.updateUser(id, data);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    console.error("Failed to update user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Soft delete user - PATCH /api/v1/users/soft-delete/:id
export const softDeleteUser = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const deletedUser = await userService.softDeleteUser(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    console.error("Failed to delete user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
