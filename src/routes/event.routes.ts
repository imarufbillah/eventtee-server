import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";

const router = Router();

router.get("/", eventController.getEvents);
router.get("/active", eventController.getActiveEvents);

export default router;
