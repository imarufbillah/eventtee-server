import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  eventController.getEvents,
);
router.get("/active", eventController.getActiveEvents);
router.get(
  "/:id/bookings",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventController.getEventBookings,
);
router.get("/:eventId/reviews", reviewController.getReviewsByEvent);
router.get(
  "/organizer/:organizerId",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventController.getEventsByOrganizer,
);
router.get("/:id", eventController.getEventById);
router.post(
  "/",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
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
  authorize("ORGANIZER", "ADMIN"),
  eventController.publishEvent,
);
router.patch(
  "/cancel/:id",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventController.cancelEvent,
);
router.patch(
  "/soft-delete/:id",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventController.softDeleteEvent,
);
router.patch(
  "/restore/:id",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  eventController.restoreEvent,
);

export default router;
