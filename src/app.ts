import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res): void => {
  res.send("Server is running...");
});

export default app;
