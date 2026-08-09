import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), userController.getUsers);
router.get(
  "/active",
  authenticate,
  authorize("ADMIN"),
  userController.getActiveUsers,
);
router.get(
  "/me",
  authenticate,
  userController.getProfile,
);
router.patch(
  "/:id",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  userController.updateUser,
);
router.patch(
  "/soft-delete/:id",
  authenticate,
  authorize("ADMIN"),
  userController.softDeleteUser,
);
router.patch(
  "/restore/:id",
  authenticate,
  authorize("ADMIN"),
  userController.restoreUser,
);

export default router;
