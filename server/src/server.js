import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = () => {
  // Start HTTP server immediately
  app.listen(PORT, () => {
    console.log(`[FitPulse Server] Running on http://localhost:${PORT}`);
    console.log(`[FitPulse Server] Health check available at http://localhost:${PORT}/api/health`);
  });

  // Attempt database connection without blocking HTTP server startup
  connectDB();
};

startServer();
