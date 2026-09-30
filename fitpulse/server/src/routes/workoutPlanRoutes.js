import express from 'express';
import {
  getCurrentPlan,
  generatePlan,
  assignPlanByTrainer,
} from '../controllers/workoutPlanController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/current', getCurrentPlan);
router.post('/generate', generatePlan);
router.post('/assign', authorize('trainer', 'admin'), assignPlanByTrainer);

export default router;
