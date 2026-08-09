import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", categoryController.getCategories);
router.get("/active", categoryController.getActiveCategories);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  categoryController.createCategory,
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.updateCategory,
);
router.patch(
  "/soft-delete/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.softDeleteCategory,
);
router.patch(
  "/restore/:id",
  authenticate,
  authorize("ADMIN"),
  categoryController.restoreCategory,
);

export default router;
