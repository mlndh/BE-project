const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    database = client.db("todo-app");
    return database;
  } catch (err) {
    console.error("ailed to connect to MongoDB", err);
    process.exit(1);
  }
}

function getDB() {
  if (!database) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return database;
}

module.exports = { connectDB, getDB };
