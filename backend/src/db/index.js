import mongoose from "mongoose";
import dns from "dns";

dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
])

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const normalizedUri = mongoUri.replace(/\/+$/, "");
    const connectionInstance = await mongoose.connect(`${normalizedUri}/gharNishchit`);
    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export { connectDB };