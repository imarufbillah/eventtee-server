import { prisma } from "../config/db.js";

export const getUsers = async (): Promise<any> => {
  return await prisma.user.findMany();
};
