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
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token missing or invalid",
      });
      return;
    }

    const secret = new TextEncoder().encode(process.env["BETTER_AUTH_SECRET"]);
    const { payload } = await jwtVerify(token, secret);

    const userId = String(payload.sub ?? payload["id"] ?? "");

    const userObj: NonNullable<Express.Request["user"]> = {
      id: userId,
      ...payload,
    };

    if (typeof payload["email"] === "string") {
      userObj.email = payload["email"];
    }
    if (typeof payload["name"] === "string") {
      userObj.name = payload["name"];
    }
    if (typeof payload["role"] === "string") {
      userObj.role = payload["role"];
    }

    req.user = userObj;

    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};
