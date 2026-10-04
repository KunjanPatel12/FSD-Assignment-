import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';

const router = express.Router();

// Strict Admin-only access
router.use(protect);
router.use(restrictTo('admin'));

// Admin test endpoint
router.get('/system-overview', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    return res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        adminAccessGranted: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
