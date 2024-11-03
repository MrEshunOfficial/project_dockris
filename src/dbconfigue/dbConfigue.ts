import mongoose from "mongoose";

let isConnected = false;

export async function connect(): Promise<void> {
  try {
    // If already connected, return early
    if (isConnected) {
      console.log('Using existing MongoDB connection');
      return;
    }

    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }

    // Configure mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as mongoose.ConnectOptions;

    // Connect with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await mongoose.connect(mongoUrl, options);
        break;
      } catch (error) {
        retries -= 1;
        if (retries === 0) throw error;
        console.log(`Failed to connect to MongoDB. Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
      isConnected = true;
    });

    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    isConnected = false;
    throw error; // Let the caller handle the error instead of exiting the process
  }
}

// Add a function to check connection status
export function isDbConnected(): boolean {
  return isConnected;
}

// Add a function to close the connection
export async function closeConnection(): Promise<void> {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('MongoDB connection closed');
  }
}

// Type for MongoDB connection error handling
export type MongoDBError = Error & {
  code?: number;
  syscall?: string;
  hostname?: string;
};