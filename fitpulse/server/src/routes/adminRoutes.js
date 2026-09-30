import express from 'express';
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getGymSchedule,
  updateGymSchedule,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/schedule', getGymSchedule);
router.put('/schedule', updateGymSchedule);

export default router;
