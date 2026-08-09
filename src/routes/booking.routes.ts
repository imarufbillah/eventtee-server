import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.js";

const router = Router();

router.get("/", bookingController.getBookings);

export default router;
