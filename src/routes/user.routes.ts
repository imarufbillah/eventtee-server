import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/", userController.getUsers);
router.get("/active", userController.getActiveUsers);
router.patch("/:id", userController.updateUser);
router.patch("/soft-delete/:id", userController.softDeleteUser);
router.patch("/restore/:id", userController.restoreUser);

export default router;
