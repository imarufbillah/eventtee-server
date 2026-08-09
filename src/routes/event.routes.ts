import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("USER", "ADMIN", "ORGANIZER"),
  eventController.getEvents,
);
router.get("/active", eventController.getActiveEvents);
router.post(
  "/",
  authenticate,
  authorize("ORGANIZER"),
  eventController.createEvent,
);
router.patch(
  "/:id",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventController.updateEvent,
);
router.patch(
  "/publish/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventController.publishEvent,
);
router.patch(
  "/cancel/:id",
  authenticate,
  authorize("ORGANIZER"),
  eventController.cancelEvent,
);
router.patch(
  "/soft-delete/:id",
  authenticate,
  authorize("ADMIN"),
  eventController.softDeleteEvent,
);
router.patch(
  "/restore/:id",
  authenticate,
  authorize("ADMIN"),
  eventController.restoreEvent,
);

export default router;
