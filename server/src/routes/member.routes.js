import express from 'express';
import {
  getDashboard,
  getWorkoutPlan,
  updateFitnessProfile,
  generateWorkoutPlan,
  toggleDayCompletion,
  getAttendanceHistory,
  checkIn,
  checkOut,
} from '../controllers/member.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Member Dashboard summary
router.get('/dashboard', getDashboard);

// Member Attendance routes
router.get('/attendance', getAttendanceHistory);
router.post('/attendance/check-in', checkIn);
router.post('/attendance/check-out', checkOut);

// Member Workout Plan routes
router.get('/workout-plan', getWorkoutPlan);
router.post('/workout-plan/generate', generateWorkoutPlan);
router.patch('/workout-plan/day/:dayNumber/toggle-complete', toggleDayCompletion);
router.put('/fitness-profile', updateFitnessProfile);

export default router;
