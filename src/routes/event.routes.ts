import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";

const router = Router();

router.get("/", eventController.getEvents);
router.get("/active", eventController.getActiveEvents);
router.post("/", eventController.createEvent);
router.patch("/:id", eventController.updateEvent);
router.patch("/publish/:id", eventController.publishEvent);
router.patch("/cancel/:id", eventController.cancelEvent);
router.patch("/soft-delete/:id", eventController.softDeleteEvent);
router.patch("/restore/:id", eventController.restoreEvent);

export default router;
