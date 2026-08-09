import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/", userController.getUsers);
router.patch("/:id", userController.updateUser);
router.patch("/soft-delete/:id", userController.softDeleteUser);

export default router;
