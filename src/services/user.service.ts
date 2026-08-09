import { prisma } from "../config/db.js";
import { Prisma, type User } from "../generated/prisma/client.js";

// Get users - GET /api/v1/users
export const getUsers = async (skip = 0, take = 20) => {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      select: { id: true, name: true, image: true, email: true },
    }),
    prisma.user.count(),
  ]);
  return { users, total };
};

// Update user - PATCH /api/v1/users/:id
export const updateUser = async (
  id: string,
  data: Pick<Prisma.UserUpdateInput, "name" | "image">,
): Promise<User> => {
  if (!data.name && !data.image) {
    throw new Error("At least one field (name or image) must be provided");
  }
  return prisma.user.update({
    where: { id },
    data,
  });
};

// Soft delete user - PATCH /api/v1/users/soft-delete/:id
export const softDeleteUser = async (id: string): Promise<User> => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Prisma.PrismaClientKnownRequestError("User not found", {
      code: "P2025",
      clientVersion: Prisma.prismaVersion.client,
    });
  }

  if (user.isDeleted) {
    throw new Error("User is already deleted");
  }

  return prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Restore user - PATCH /api/v1/users/restore/:id
export const restoreUser = async (id: string): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: { isDeleted: false },
  });
};
