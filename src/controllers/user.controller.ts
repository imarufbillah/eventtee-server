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

// Get active users - GET /api/v1/users/active
export const getActiveUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const users = await userService.getActiveUsers(skip, limit);

    res.status(200).json({
      success: true,
      message: "Active users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Failed to get active users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active users",
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

  const authUserId = req.user?.id;
  const authUserRole = req.user?.role;

  if (authUserId !== id && authUserRole !== "ADMIN") {
    res.status(403).json({
      success: false,
      message: "Forbidden: You can only update your own profile",
    });
    return;
  }

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

// Restore user - PATCH /api/v1/users/restore/:id
export const restoreUser = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const restoredUser = await userService.restoreUser(id);

    res.status(200).json({
      success: true,
      message: "User restored successfully",
      data: restoredUser,
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

    console.error("Failed to restore user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore user",
    });
  }
};

// Get current user profile - GET /api/v1/users/me
export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in token",
      });
      return;
    }

    const user = await userService.getUserById(userId);

    if (!user || user.isDeleted) {
      res.status(404).json({
        success: false,
        message: "User profile not found or account disabled",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Failed to get user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

