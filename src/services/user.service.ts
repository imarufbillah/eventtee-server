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
