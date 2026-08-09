import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";

const router = Router();

router.get("/", eventController.getEvents);

export default router;
