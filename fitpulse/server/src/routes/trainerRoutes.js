import express from 'express';
import {
  getAssignedMembers,
  getMemberDetails,
} from '../controllers/trainerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('trainer', 'admin'));

router.get('/members', getAssignedMembers);
router.get('/members/:memberId', getMemberDetails);

export default router;
