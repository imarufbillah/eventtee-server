import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = Router();

router.get("/", categoryController.getCategories);
router.get("/active", categoryController.getActiveCategories);
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.patch("/soft-delete/:id", categoryController.softDeleteCategory);
router.patch("/restore/:id", categoryController.restoreCategory);

export default router;
