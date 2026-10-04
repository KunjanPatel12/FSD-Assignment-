import express from 'express';
import {
  getAssignedMembers,
  getMemberDetails,
} from '../controllers/trainer.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Role-based protection: only authenticated users with role 'trainer' or 'admin' can access
router.use(protect);
router.use(restrictTo('trainer', 'admin'));

// Assigned members list
router.get('/members', getAssignedMembers);

// Trainee details with workout plan
router.get('/members/:memberId', getMemberDetails);

export default router;
