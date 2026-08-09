import { prisma } from "../config/db.js";
import { Prisma } from "../generated/prisma/client.js";

// Get bookings - GET /api/v1/bookings
export const getBookings = async (skip = 0, take = 20) => {
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take,
      select: {
        id: true,
        seats: true,
        totalPrice: true,
        status: true,
        isDeleted: true,
        userId: true,
        eventId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.booking.count(),
  ]);
  return { bookings, total };
};

// Get active bookings - GET /api/v1/bookings/active
export const getActiveBookings = async (skip = 0, take = 20) => {
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { isDeleted: false },
      skip,
      take,
      select: {
        id: true,
        seats: true,
        totalPrice: true,
        status: true,
        userId: true,
        eventId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.booking.count({ where: { isDeleted: false } }),
  ]);
  return { bookings, total };
};

// Create booking - POST /api/v1/bookings
export const createBooking = async (data: Prisma.BookingCreateInput) => {
  return prisma.booking.create({ data });
};
