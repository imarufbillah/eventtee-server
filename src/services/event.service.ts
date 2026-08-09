import { prisma } from "../config/db.js";
import { Prisma } from "../generated/prisma/client.js";

// Get events - GET /api/v1/events
export const getEvents = async (skip = 0, take = 20) => {
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        capacity: true,
        bookedSeats: true,
        startDate: true,
        location: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        organizerId: true,
      },
    }),
    prisma.event.count(),
  ]);
  return { events, total };
};

// Get active events - GET /api/v1/events/active
export const getActiveEvents = async (skip = 0, take = 20) => {
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { isDeleted: false },
      skip,
      take,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        capacity: true,
        bookedSeats: true,
        startDate: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        organizerId: true,
      },
    }),
    prisma.event.count({ where: { isDeleted: false } }),
  ]);
  return { events, total };
};

// Create event - POST /api/v1/events
export const createEvent = async (data: Prisma.EventCreateInput) => {
  return prisma.event.create({ data });
};

// Update event - PATCH /api/v1/events/:id
export const updateEvent = async (
  id: string,
  data: Prisma.EventUpdateInput,
) => {
  return prisma.event.update({ where: { id }, data });
};

// Publish event - PATCH /api/v1/events/publish/:id
export const publishEvent = async (id: string) => {
  return prisma.event.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
};
