import express from 'express';
import mongoose from 'mongoose';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import FitnessProfile from '../models/fitnessProfile.model.js';
import Attendance from '../models/attendance.model.js';
import GymSchedule from '../models/gymSchedule.model.js';

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

// Admin Users list with membership status (passwords strictly excluded)
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    const userIds = users.map((u) => u._id);
    const stringIds = users.map((u) => String(u._id));
    const profiles = await FitnessProfile.find({
      $or: [{ userId: { $in: userIds } }, { userId: { $in: stringIds } }],
    }).lean();

    const profileMap = new Map();
    profiles.forEach((p) => {
      profileMap.set(String(p.userId), p);
    });

    const usersData = users.map((u) => {
      const p = profileMap.get(String(u._id));
      let status = 'Active';
      if (u.role === 'member') {
        status = p?.membershipStatus || 'Active';
      } else {
        status = 'Staff';
      }

      return {
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || '—',
        role: u.role,
        membershipStatus: status,
        createdAt: u.createdAt,
      };
    });

    return res.status(200).json({
      status: 'success',
      count: usersData.length,
      data: usersData,
    });
  } catch (err) {
    next(err);
  }
});

// Admin update user status / role according to intended application permissions
router.patch('/users/:userId/status', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { membershipStatus, role } = req.body;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found in system',
      });
    }

    if (role && ['member', 'trainer', 'admin'].includes(role)) {
      user.role = role;
      await user.save();
    }

    let updatedProfile = null;
    if (membershipStatus) {
      const objId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      updatedProfile = await FitnessProfile.findOneAndUpdate(
        { $or: [{ userId: objId }, { userId: String(userId) }] },
        { $set: { membershipStatus, userId: objId } },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      status: 'success',
      message: `User status updated successfully`,
      data: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        membershipStatus: updatedProfile?.membershipStatus || membershipStatus || 'Active',
      },
    });
  } catch (err) {
    next(err);
  }
});

// Admin Gym Operating Schedule - GET active schedule from MongoDB
router.get('/schedule', async (req, res, next) => {
  try {
    let schedule = await GymSchedule.findOne().lean();
    if (!schedule) {
      schedule = await GymSchedule.create({
        openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        closedDays: ['Sunday'],
        openingTime: '06:00 AM',
        closingTime: '10:00 PM',
        notes: 'Standard facility operating schedule',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
});

// Admin Gym Operating Schedule - PUT / UPDATE schedule in MongoDB
router.put('/schedule', async (req, res, next) => {
  try {
    const { openDays, closedDays, openingTime, closingTime, notes } = req.body;

    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    if (!Array.isArray(openDays) || openDays.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one operating day must be configured as open.',
      });
    }

    // Filter and sanitize days
    const sanitizedOpen = openDays.filter((d) => validDays.includes(d));
    if (sanitizedOpen.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid open days provided.',
      });
    }

    // Derive closed days: any valid day not in openDays
    const sanitizedClosed = Array.isArray(closedDays)
      ? closedDays.filter((d) => validDays.includes(d) && !sanitizedOpen.includes(d))
      : validDays.filter((d) => !sanitizedOpen.includes(d));

    const finalOpeningTime = (openingTime && String(openingTime).trim()) || '06:00 AM';
    const finalClosingTime = (closingTime && String(closingTime).trim()) || '10:00 PM';
    const finalNotes = typeof notes === 'string' ? notes.trim() : 'Standard facility operating schedule';

    const updated = await GymSchedule.findOneAndUpdate(
      {},
      {
        $set: {
          openDays: sanitizedOpen,
          closedDays: sanitizedClosed,
          openingTime: finalOpeningTime,
          closingTime: finalClosingTime,
          notes: finalNotes,
          lastUpdatedBy: req.user?._id || null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Gym operating schedule saved successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
