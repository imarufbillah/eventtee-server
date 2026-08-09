import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, eventController.getEvents);
router.get("/active", eventController.getActiveEvents);
router.post("/", authenticate, eventController.createEvent);
router.patch("/:id", authenticate, eventController.updateEvent);
router.patch("/publish/:id", authenticate, eventController.publishEvent);
router.patch("/cancel/:id", authenticate, eventController.cancelEvent);
router.patch("/soft-delete/:id", authenticate, eventController.softDeleteEvent);
router.patch("/restore/:id", authenticate, eventController.restoreEvent);

export default router;
