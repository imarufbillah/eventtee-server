import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = Router();

router.get("/", categoryController.getCategories);
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.patch("/soft-delete/:id", categoryController.softDeleteCategory);

export default router;
