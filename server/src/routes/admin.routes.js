import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import FitnessProfile from '../models/fitnessProfile.model.js';
import Attendance from '../models/attendance.model.js';

const router = express.Router();

// Strict Admin-only access
router.use(protect);
router.use(restrictTo('admin'));

// Admin System Overview statistics
router.get('/system-overview', async (req, res, next) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });

    // Active memberships from FitnessProfile
    const activeProfilesCount = await FitnessProfile.countDocuments({
      membershipStatus: { $regex: /^active$/i },
    });
    const activeMemberships = activeProfilesCount > 0 ? activeProfilesCount : totalMembers;

    // Today's attendance check-ins from Attendance
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todaysAttendance = await Attendance.countDocuments({
      $or: [
        { dateKey: todayKey },
        { checkInTime: { $gte: startOfToday, $lte: endOfToday } },
      ],
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalMembers,
        totalTrainers,
        activeMemberships,
        todaysAttendance,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Admin Users list
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// Admin Gym Operating Schedule
router.get('/schedule', async (req, res) => {
  const schedule = [
    { day: 'Monday – Friday', hours: '06:00 AM – 10:00 PM', status: 'Full Operations' },
    { day: 'Saturday', hours: '07:00 AM – 09:00 PM', status: 'Weekend Training' },
    { day: 'Sunday', hours: '08:00 AM – 08:00 PM', status: 'Open Gym & Recovery' },
  ];
  return res.status(200).json({
    status: 'success',
    data: schedule,
  });
});

export default router;
