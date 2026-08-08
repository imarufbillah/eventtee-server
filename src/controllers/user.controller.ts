import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getUsers();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log("Failed to get users.", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
