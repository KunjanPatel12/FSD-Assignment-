import express from 'express';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    status: 'ok',
    message: 'FitPulse API is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
});

export default router;
