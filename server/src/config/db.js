
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(
      process.env.MONGO_URI
    );
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB Connected:", cached.conn.connection.host);
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Connection Failed:", error);
    throw error;
  }

  return cached.conn;
}
