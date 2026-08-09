import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";

const router = Router();

router.get("/", bookingController.getBookings);
router.get("/active", bookingController.getActiveBookings);
router.get("/user/:userId", bookingController.getBookingsByUser);
router.post("/", bookingController.createBooking);
router.patch("/cancel/:id", bookingController.cancelBooking);

export default router;
