import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";

const router = Router();

router.get("/", bookingController.getBookings);
router.get("/active", bookingController.getActiveBookings);
router.post("/", bookingController.createBooking);

export default router;
