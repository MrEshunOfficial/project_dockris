import mongoose from "mongoose";

export async function connect(): Promise<void> {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }

    await mongoose.connect(mongoUrl);
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connection established successfully");
    });

    connection.on("error", (error: Error) => {
      console.error("MongoDB connection failed:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}