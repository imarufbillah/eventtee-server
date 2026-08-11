import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

// Type augmentation to attach 'user' property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string | undefined;
        name?: string | undefined;
        role?: string | undefined;
        [key: string]: unknown;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const secret = new TextEncoder().encode(
          process.env["BETTER_AUTH_SECRET"],
        );
        const { payload } = await jwtVerify(token, secret);

        const rawUser =
          typeof payload["user"] === "object" && payload["user"] !== null
            ? (payload["user"] as Record<string, unknown>)
            : payload;

        const userId = String(
          rawUser["id"] ?? rawUser["sub"] ?? payload.sub ?? payload["id"] ?? "",
        );

        req.user = {
          id: userId,
          ...(typeof rawUser["email"] === "string" && {
            email: rawUser["email"],
          }),
          ...(typeof rawUser["name"] === "string" && { name: rawUser["name"] }),
          ...(typeof rawUser["role"] === "string" && { role: rawUser["role"] }),
          ...rawUser,
        };

        return next();
      }
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({
        success: false,
        message: "Access token missing or invalid",
      });
      return;
    }

    const u = session.user as Record<string, unknown>;
    req.user = {
      id: String(u["id"] ?? ""),
      ...(typeof u["email"] === "string" && { email: u["email"] }),
      ...(typeof u["name"] === "string" && { name: u["name"] }),
      ...(typeof u["role"] === "string" && { role: u["role"] }),
      ...u,
    };

    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};
