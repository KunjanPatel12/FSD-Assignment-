import express from 'express';
import {
  checkIn,
  checkOut,
  getCurrentStatus,
  getAttendanceHistory,
  staffManualEntry,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/status', getCurrentStatus);
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/history', getAttendanceHistory);
router.post('/manual-entry', authorize('trainer', 'admin'), staffManualEntry);

export default router;
