import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/db.js";

const PORT = process.env["PORT"] || 5000;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(PORT, (): void => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
