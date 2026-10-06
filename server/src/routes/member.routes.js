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
  getConsistencyReport,
  getMemberProfile,
  updateMemberProfile,
} from '../controllers/member.controller.js';
import { protect, requireActiveMembership } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Member Dashboard summary
router.get('/dashboard', getDashboard);

// Member Profile routes
router.get('/profile', getMemberProfile);
router.put('/profile', updateMemberProfile);

// Member Consistency Report route
router.get('/consistency', requireActiveMembership, getConsistencyReport);

// Member Attendance routes
router.get('/attendance', requireActiveMembership, getAttendanceHistory);
router.post('/attendance/check-in', requireActiveMembership, checkIn);
router.post('/attendance/check-out', requireActiveMembership, checkOut);

// Member Workout Plan routes
router.get('/workout-plan', requireActiveMembership, getWorkoutPlan);
router.post('/workout-plan/generate', requireActiveMembership, generateWorkoutPlan);
router.patch('/workout-plan/day/:dayNumber/toggle-complete', requireActiveMembership, toggleDayCompletion);
router.put('/fitness-profile', updateFitnessProfile);

export default router;
