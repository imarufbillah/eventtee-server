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

export interface CreateBookingInput {
  userId: string;
  eventId: string;
  seats: number;
}

// Create booking - POST /api/v1/bookings
export const createBooking = async ({
  userId,
  eventId,
  seats,
}: CreateBookingInput) => {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.isDeleted) {
      throw new Error("Event not found or unavailable");
    }

    if (event.status !== "PUBLISHED") {
      throw new Error("Cannot book seats for an event that is not PUBLISHED");
    }

    const availableSeats = event.capacity - event.bookedSeats;
    if (seats > availableSeats) {
      throw new Error(
        `Not enough seats available. Requested: ${seats}, Available: ${Math.max(0, availableSeats)}`,
      );
    }

    const totalPrice = new Prisma.Decimal(event.price).mul(seats);

    const booking = await tx.booking.create({
      data: {
        seats,
        totalPrice,
        status: "PENDING",
        user: { connect: { id: userId } },
        event: { connect: { id: eventId } },
      },
    });

    await tx.event.update({
      where: { id: eventId },
      data: {
        bookedSeats: {
          increment: seats,
        },
      },
    });

    return booking;
  });
};

// Cancel booking - PATCH /api/v1/bookings/cancel/:id
export const cancelBooking = async (id: string) => {
  return prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

// Get bookings by user - GET /api/v1/bookings/user/:userId
export const getBookingsByUser = async (skip = 0, take = 20) => {
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

// Confirm booking - PATCH /api/v1/bookings/confirm/:id
export const confirmBooking = async (id: string) => {
  return prisma.booking.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });
};
