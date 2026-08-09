import { prisma } from "../config/db.js";
import { Prisma, type Event } from "../generated/prisma/client.js";

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
