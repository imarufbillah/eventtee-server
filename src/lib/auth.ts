import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt } from "better-auth/plugins";
import { prisma } from "../config/db.js";

const isProduction = process.env["NODE_ENV"] === "production";

export const auth = betterAuth({
  baseURL: process.env["BETTER_AUTH_URL"],

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

  advanced: {
    ...(isProduction
      ? {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
            httpOnly: true,
          },
        }
      : {}),

    ipAddress: {
      trustedProxies: [
        "127.0.0.0/8",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16",
      ],
    },

    cookiePrefix: "eventtee",
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
