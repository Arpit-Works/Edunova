import { MongoClient, type Db } from "mongodb";
    
const uri = process.env.MONGODB_URI;
const dbName =
  process.env.MONGODB_DB || process.env.MONGO_DB || "edunova";

if (!uri) {
  throw new Error("Please define MONGODB_URI in .env");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 15_000,
});

const clientPromise = global._mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  global._mongoClientPromise = clientPromise;
}

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
