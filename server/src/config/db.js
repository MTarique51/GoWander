
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDB() {
  try {
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}