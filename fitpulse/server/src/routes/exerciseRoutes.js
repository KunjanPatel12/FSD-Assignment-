import express from 'express';
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
} from '../controllers/exerciseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / Member browsing routes (Essential for Member Library & Workout generation)
router.get('/', getAllExercises);
router.get('/:id', getExerciseById);

// Trainer routine support mutations
router.post('/', protect, authorize('trainer'), createExercise);
router.put('/:id', protect, authorize('trainer'), updateExercise);

export default router;
