import express from 'express';
import {
  logSession,
  getSessionHistory,
  getSessionById,
} from '../controllers/workoutSessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', logSession);
router.get('/', getSessionHistory);
router.get('/:id', getSessionById);

export default router;
