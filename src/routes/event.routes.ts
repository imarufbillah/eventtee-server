import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";

const router = Router();

router.get("/", eventController.getEvents);
router.get("/active", eventController.getActiveEvents);
router.post("/", eventController.createEvent);
router.patch("/:id", eventController.updateEvent);
router.patch("/publish/:id", eventController.publishEvent);

export default router;
