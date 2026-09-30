import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedDatabase } from './seed/seedRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Run Idempotent Seed in Development
    if (process.env.NODE_ENV !== 'test') {
      try {
        await seedDatabase();
      } catch (seedErr) {
        console.warn('⚠️ [FitPulse Server] Seed warning:', seedErr.message);
      }
    }

    // 3. Initialize App and listen
    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log(`🚀 [FitPulse Server] Running on http://localhost:${PORT}`);
      console.log(`🌐 [FitPulse API Docs & Health] http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      console.log(`\n🛑 [FitPulse Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('🚪 [FitPulse Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('💥 [FitPulse Server] Fatal startup failure:', error);
    process.exit(1);
  }
};

startServer();
