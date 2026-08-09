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
        required: true,
        defaultValue: "USER",
        input: false,
      },
      isDeleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
});
