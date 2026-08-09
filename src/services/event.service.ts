import { prisma } from "../config/db.js";
import { Prisma } from "../generated/prisma/client.js";

/**
 * Verify event existence and ownership (organizerId === userId or ADMIN role)
 */
export const verifyEventOwnership = async (
  eventId: string,
  userId: string,
  userRole?: string,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw new Prisma.PrismaClientKnownRequestError("Event not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  if (event.organizerId !== userId && userRole !== "ADMIN") {
    throw new Error("Forbidden: You can only manage your own events");
  }

  return event;
};

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
export const getActiveEvents = async (
  skip = 0,
  take = 20,
  filter?: { categoryId?: string; search?: string },
) => {
  const where: Prisma.EventWhereInput = {
    isDeleted: false,
    status: "PUBLISHED",
  };

  if (filter?.categoryId) {
    where.categoryId = filter.categoryId;
  }

  if (filter?.search && filter.search.trim()) {
    const searchTerm = filter.search.trim();
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
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
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    }),
    prisma.event.count({ where }),
  ]);

  const formattedEvents = events.map((event) => ({
    ...event,
    remainingSeats: Math.max(0, event.capacity - event.bookedSeats),
  }));

  return { events: formattedEvents, total };
};

// Create event - POST /api/v1/events
export const createEvent = async (data: Prisma.EventCreateInput) => {
  return prisma.event.create({ data });
};

// Update event - PATCH /api/v1/events/:id
export const updateEvent = async (
  id: string,
  userId: string,
  userRole: string | undefined,
  data: Prisma.EventUpdateInput,
) => {
  const event = await verifyEventOwnership(id, userId, userRole);

  if (event.isDeleted) {
    throw new Error("Cannot update a deleted event");
  }

  return prisma.event.update({ where: { id }, data });
};

// Publish event - PATCH /api/v1/events/publish/:id
export const publishEvent = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  const event = await verifyEventOwnership(id, userId, userRole);

  if (event.isDeleted) {
    throw new Error("Cannot publish a deleted event");
  }

  if (event.status === "PUBLISHED") {
    throw new Error("Event is already published");
  }

  return prisma.event.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });
};

// Cancel event - PATCH /api/v1/events/cancel/:id
export const cancelEvent = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  const event = await verifyEventOwnership(id, userId, userRole);

  if (event.isDeleted) {
    throw new Error("Cannot cancel a deleted event");
  }

  if (event.status === "CANCELLED") {
    throw new Error("Event is already cancelled");
  }

  return prisma.event.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

// Soft delete event - PATCH /api/v1/events/soft-delete/:id
export const softDeleteEvent = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  const event = await verifyEventOwnership(id, userId, userRole);

  if (event.isDeleted) {
    throw new Error("Event is already deleted");
  }

  return prisma.event.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Restore event - PATCH /api/v1/events/restore/:id
export const restoreEvent = async (
  id: string,
  userId: string,
  userRole?: string,
) => {
  await verifyEventOwnership(id, userId, userRole);

  return prisma.event.update({
    where: { id },
    data: { isDeleted: false },
  });
};

// Get single event details by ID - GET /api/v1/events/:id
export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      reviews: {
        where: { isDeleted: false },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    return null;
  }

  const remainingSeats = Math.max(0, event.capacity - event.bookedSeats);
  const totalReviews = event.reviews.length;
  const averageRating =
    totalReviews > 0
      ? Number(
          (
            event.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1),
        )
      : 0;

  return {
    ...event,
    remainingSeats,
    averageRating,
    totalReviews,
  };
};

// Get bookings for an event - GET /api/v1/events/:id/bookings
export const getEventBookings = async (
  eventId: string,
  userId: string,
  userRole?: string,
  skip = 0,
  take = 20,
) => {
  const event = await verifyEventOwnership(eventId, userId, userRole);

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { eventId, isDeleted: false },
      skip,
      take,
      select: {
        id: true,
        seats: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.booking.count({ where: { eventId, isDeleted: false } }),
  ]);

  return {
    event: {
      id: event.id,
      title: event.title,
      capacity: event.capacity,
      bookedSeats: event.bookedSeats,
    },
    bookings,
    total,
  };
};


