import { MongoClient } from "mongodb";

const url = process.env.MONGODB_URL || "mongodb://localhost:27017";
const client = new MongoClient(url);

export const dbName = "music-project";

export async function connectDB() {
  await client.connect();
  return client.db(dbName);
}
