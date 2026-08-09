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

// Get active events - GET /api/v1/events/active
export const getActiveEvents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query["page"]) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
    const skip = (page - 1) * limit;

    const events = await eventService.getActiveEvents(skip, limit);

    res.status(200).json({
      success: true,
      message: "Active events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Failed to get active events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active events",
    });
  }
};

// Create event - POST /api/v1/events
export const createEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const {
    title,
    description,
    price,
    capacity,
    startDate,
    location,
    categoryId,
    organizerId,
  } = req.body;
  const user = (req as Request & { user?: { id: string } }).user;
  const finalOrganizerId = user?.id || organizerId;

  const data: Prisma.EventCreateInput = {
    title,
    description,
    price,
    capacity,
    startDate: new Date(startDate),
    location,
    category: { connect: { id: categoryId } },
    organizer: { connect: { id: finalOrganizerId } },
  };

  try {
    const event = await eventService.createEvent(data);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Failed to create event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};
