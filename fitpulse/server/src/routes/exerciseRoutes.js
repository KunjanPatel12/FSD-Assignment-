import express from 'express';
import {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllExercises);
router.get('/:id', getExerciseById);

// Protected mutation routes
router.post('/', protect, authorize('trainer', 'admin'), createExercise);
router.put('/:id', protect, authorize('trainer', 'admin'), updateExercise);
router.delete('/:id', protect, authorize('admin'), deleteExercise);

export default router;
