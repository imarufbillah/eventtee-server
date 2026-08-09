import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";

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
    let token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split("; ").map((c) => {
          const [key, ...v] = c.split("=");
          return [key?.trim(), v.join("=")];
        }),
      );
      token =
        cookies["better-auth.session_data"] ||
        cookies["better-auth.session_token"] ||
        null;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token missing or invalid",
      });
      return;
    }

    const secret = new TextEncoder().encode(process.env["BETTER_AUTH_SECRET"]);
    const { payload } = await jwtVerify(token, secret);

    // Check if payload contains a nested 'user' object (Better Auth cookie cache format)
    const rawUser =
      typeof payload["user"] === "object" && payload["user"] !== null
        ? (payload["user"] as Record<string, unknown>)
        : payload;

    const userId = String(
      rawUser["id"] ?? rawUser["sub"] ?? payload.sub ?? payload["id"] ?? "",
    );
    const email = typeof rawUser["email"] === "string" ? rawUser["email"] : undefined;
    const name = typeof rawUser["name"] === "string" ? rawUser["name"] : undefined;
    const role = typeof rawUser["role"] === "string" ? rawUser["role"] : undefined;

    req.user = {
      id: userId,
      ...(email && { email }),
      ...(name && { name }),
      ...(role && { role }),
      ...rawUser,
    };

    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};
