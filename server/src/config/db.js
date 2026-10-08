import dns from 'dns';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Ensure Node's DNS resolver can query MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

let isConnected = false;
let memoryServer = null;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (mongoURI && mongoURI.trim() !== '') {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 4000,
      });
      isConnected = true;
      console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[MongoDB] Warning: Failed to connect to MongoDB at ${mongoURI}. Falling back to in-memory instance.`);
    }
  }

  try {
    console.log('[MongoDB] Starting embedded in-memory MongoDB server...');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`[MongoDB] Connected to embedded in-memory database at: ${uri}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`[MongoDB] Failed to initialize embedded MongoDB: ${err.message}`);
  }
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;
  return {
    state: states[readyState] || 'unknown',
    readyState,
    isConnected: readyState === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};
