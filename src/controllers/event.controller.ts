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
  } = req.body;

  const organizerId = req.user?.id;

  if (!organizerId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  if (!title || !description || price === undefined || !capacity || !startDate || !categoryId) {
    res.status(400).json({
      success: false,
      message: "Required fields missing: title, description, price, capacity, startDate, categoryId",
    });
    return;
  }

  const parsedPrice = Number(price);
  const parsedCapacity = Number(capacity);

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    res.status(400).json({
      success: false,
      message: "Price must be a non-negative number",
    });
    return;
  }

  if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
    res.status(400).json({
      success: false,
      message: "Capacity must be a positive integer",
    });
    return;
  }

  const data: Prisma.EventCreateInput = {
    title,
    description,
    price: parsedPrice,
    capacity: parsedCapacity,
    startDate: new Date(startDate),
    location: location || null,
    status: "DRAFT",
    category: { connect: { id: categoryId } },
    organizer: { connect: { id: organizerId } },
  };

  try {
    const event = await eventService.createEvent(data);

    res.status(201).json({
      success: true,
      message: "Event created successfully as DRAFT",
      data: event,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid categoryId provided",
      });
      return;
    }

    console.error("Failed to create event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
    });
  }
};

// Update event - PATCH /api/v1/events/:id
export const updateEvent = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { title, description, price, capacity, startDate, location } = req.body;

  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  if (
    title === undefined &&
    description === undefined &&
    price === undefined &&
    capacity === undefined &&
    startDate === undefined &&
    location === undefined
  ) {
    res.status(400).json({
      success: false,
      message:
        "At least one field (title, description, price, capacity, startDate, location) must be provided",
    });
    return;
  }

  const data: Prisma.EventUpdateInput = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = Number(price);
  if (capacity !== undefined) data.capacity = Number(capacity);
  if (startDate !== undefined) data.startDate = new Date(startDate);
  if (location !== undefined) data.location = location;

  try {
    const event = await eventService.updateEvent(id, userId, userRole, data);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message.includes("Cannot")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Failed to update event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};

// Publish event - PATCH /api/v1/events/publish/:id
export const publishEvent = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    const event = await eventService.publishEvent(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Event published successfully",
      data: event,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && (error.message.includes("Cannot") || error.message.includes("already"))) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Failed to publish event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to publish event",
    });
  }
};

// Cancel event - PATCH /api/v1/events/cancel/:id
export const cancelEvent = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    const event = await eventService.cancelEvent(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      data: event,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && (error.message.includes("Cannot") || error.message.includes("already"))) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Failed to cancel event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel event",
    });
  }
};

// Soft delete event - PATCH /api/v1/events/soft-delete/:id
export const softDeleteEvent = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    const event = await eventService.softDeleteEvent(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: event,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.message.includes("already")) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Failed to delete event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};

// Restore event - PATCH /api/v1/events/restore/:id
export const restoreEvent = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User not authenticated",
    });
    return;
  }

  try {
    const event = await eventService.restoreEvent(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Event restored successfully",
      data: event,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("Forbidden")) {
      res.status(403).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Failed to restore event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore event",
    });
  }
};
