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

// Create booking - POST /api/v1/bookings
export const createBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data: Prisma.BookingCreateInput = req.body;

    const booking = await bookingService.createBooking(data);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Failed to create booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// Cancel booking - PATCH /api/v1/bookings/cancel/:id
export const cancelBooking = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const booking = await bookingService.cancelBooking(id);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

// Get bookings by user - GET /api/v1/bookings/user/:userId
export const getBookingsByUser = async (
  req: Request<{ userId: string }>,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const bookings = await bookingService.getBookingsByUser(skip, limit);

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
