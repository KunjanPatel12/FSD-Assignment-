import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ [FitPulse DB] No MONGODB_URI detected. Initializing embedded in-memory MongoDB engine...');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: { launchTimeout: 60000 },
      });
      mongoUri = mongoMemoryServer.getUri();
      console.log(`⚡ [FitPulse DB] Embedded MongoDB active at: ${mongoUri}`);
    } else {
      console.log(`⚡ [FitPulse DB] Connecting to MongoDB URI: ${mongoUri.replace(/:([^:@]{3,})@/, ':***@')}`);
    }

    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ [FitPulse DB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ [FitPulse DB] Connection failure: ${error.message}`);
    // If external URI failed, fallback to memory server so application does not crash
    if (!mongoMemoryServer) {
      console.log('🔄 [FitPulse DB] Attempting emergency fallback to embedded MongoDB...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ [FitPulse DB] Emergency fallback succeeded at: ${fallbackUri}`);
        return conn;
      } catch (fallbackErr) {
        console.error(`❌ [FitPulse DB] Emergency fallback failed: ${fallbackErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('🔌 [FitPulse DB] Disconnected cleanly.');
  } catch (err) {
    console.error('Error disconnecting database:', err);
  }
};
