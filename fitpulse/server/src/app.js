import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import workoutPlanRoutes from './routes/workoutPlanRoutes.js';
import workoutSessionRoutes from './routes/workoutSessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import supplementRoutes from './routes/supplementRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS setup
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET || 'fitpulse_cookie_secret'));

  // Request logger in dev/production (omitting passwords/tokens)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
  }

  // Health-check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      platform: 'FitPulse API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // API Route Mounts
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/workout-plans', workoutPlanRoutes);
  app.use('/api/workout-sessions', workoutSessionRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/supplements', supplementRoutes);
  app.use('/api/trainer', trainerRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 & Centralized Error Handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
