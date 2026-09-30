import express from 'express';
import {
  getConsistencyReport,
  getDashboardSummary,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/consistency', getConsistencyReport);
router.get('/dashboard', getDashboardSummary);

export default router;
