import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import eventRoutes from "./routes/event.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env["CLIENT_URL"],
    credentials: true,
  }),
);

// BetterAuth route handler
app.use((req, res, next): void => {
  if (req.url.startsWith("/api/auth")) {
    toNodeHandler(auth)(req, res);
    return;
  }
  next();
});

app.use(express.json());

app.get("/", (_req, res): void => {
  res.send("Server is running...");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/reviews", reviewRoutes);

export default app;
