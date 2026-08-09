import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import { prisma } from "../config/db.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env["CLIENT_URL"] as string],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
      strategy: "jwt",
    },
  },
  plugins: [jwt()],
  user: {
    additionalFields: {
      role: {
        type: ["USER", "ORGANIZER", "ADMIN"],
        required: false,
        defaultValue: "USER",
        input: true,
      },
      isDeleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          let role = user["role"];
          if (role !== "ORGANIZER" && role !== "USER") {
            role = "USER";
          }
          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },
});
