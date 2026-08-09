import type { Request, Response, NextFunction } from "express";
import type { Role } from "../generated/prisma/enums.js";

const authorize = (...allowedRoles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User is not authenticated",
      });
      return;
    }

    const userRole = req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};

export default authorize;
