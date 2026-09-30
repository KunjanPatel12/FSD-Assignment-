import express from 'express';
import {
  getMembershipStatus,
  createPaymentOrder,
  processPayment,
} from '../controllers/membershipController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All membership routes require authenticated session

router.get('/', getMembershipStatus);
router.post('/order', createPaymentOrder);
router.post('/pay', processPayment);

export default router;
