import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as bookingService from "../services/booking.service.js";

// Get bookings - GET /api/v1/bookings
export const getBookings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const bookings = await bookingService.getBookings(skip, limit);

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Failed to get bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// Get active bookings - GET /api/v1/bookings/active
export const getActiveBookings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const bookings = await bookingService.getActiveBookings(skip, limit);

    res.status(200).json({
      success: true,
      message: "Active bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Failed to get active bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active bookings",
    });
  }
};
