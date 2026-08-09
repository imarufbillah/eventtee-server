import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  bookingController.getBookings,
);
router.get(
  "/active",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  bookingController.getActiveBookings,
);
router.get(
  "/user/:userId",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  bookingController.getBookingsByUser,
);
router.post(
  "/",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  bookingController.createBooking,
);
router.patch(
  "/cancel/:id",
  authenticate,
  authorize("USER", "ORGANIZER", "ADMIN"),
  bookingController.cancelBooking,
);
router.patch(
  "/confirm/:id",
  authenticate,
  authorize("ORGANIZER", "ADMIN"),
  bookingController.confirmBooking,
);

export default router;
