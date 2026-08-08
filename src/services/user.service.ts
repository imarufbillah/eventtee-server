import { prisma } from "../config/db.js";
import { Prisma, type User } from "../generated/prisma/client.js";

export const getUsers = async (): Promise<any> => {
  return await prisma.user.findMany();
};

// Update user - PATCH /api/users/:id
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
