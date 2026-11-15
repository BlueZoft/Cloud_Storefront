import mongoose from "mongoose";

// Share an in-flight connection across requests and development hot reloads.
const cache = globalThis.storefrontMongo ||= { connection: null, promise: null };
export async function connectToDb() {
  if (!process.env.MONGO) throw new Error("MONGO must be configured");
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (!cache.promise) cache.promise = mongoose.connect(process.env.MONGO, { serverSelectionTimeoutMS: 5000 });
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch {
    throw new Error("Database unavailable");
  } finally {
    cache.promise = null;
  }
}
