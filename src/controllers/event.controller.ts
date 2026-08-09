import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import * as eventService from "../services/event.service.js";

// Get events - GET /api/v1/events
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const events = await eventService.getEvents(skip, limit);

    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Failed to get events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};
