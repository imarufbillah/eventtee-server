import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res): void => {
  res.send("Server is running...");
});

app.use("/api/v1/users", userRoutes);

export default app;
