import mongoose from "mongoose";
import { resolveMongoConnectionString } from "./mongoUri.js";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    const resolvedUri = await resolveMongoConnectionString(mongoUri);
    const connectionInstance = await mongoose.connect(resolvedUri, { dbName: "gharNishchit" });
    console.log(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export { connectDB };
