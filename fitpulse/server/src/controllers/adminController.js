import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { WorkoutSession } from '../models/WorkoutSession.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { Exercise } from '../models/Exercise.js';
import { GymSchedule, GymSettings } from '../models/GymSchedule.js';
import { AuditLog } from '../models/AuditLog.js';

export const getSystemStats = async (req, res, next) => {
  try {
    const todayKey = new Date().toISOString().slice(0, 10);

    const [
      totalUsers,
      totalMembers,
      totalTrainers,
      totalExercises,
      todayAttendances,
      activeCheckIns,
      totalWorkoutsCompleted,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'trainer' }),
      Exercise.countDocuments({}),
      Attendance.countDocuments({ dateKey: todayKey }),
      Attendance.countDocuments({ status: 'active' }),
      WorkoutSession.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMembers,
        totalTrainers,
        totalExercises,
        todayAttendances,
        activeCheckIns,
        totalWorkoutsCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    await AuditLog.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_UPDATE_USER_ROLE',
      resource: 'User',
      details: { targetUserId: user._id, role, isActive },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const getGymSchedule = async (req, res, next) => {
  try {
    const schedules = await GymSchedule.find({}).sort({ dayOfWeek: 1 });
    const settings = await GymSettings.findOne({ key: 'global_settings' });
    res.status(200).json({ success: true, schedules, settings });
  } catch (err) {
    next(err);
  }
};

export const updateGymSchedule = async (req, res, next) => {
  try {
    const { schedules, holidays } = req.body;

    if (schedules && Array.isArray(schedules)) {
      for (const s of schedules) {
        await GymSchedule.findOneAndUpdate(
          { dayOfWeek: s.dayOfWeek },
          { isOpen: s.isOpen, openTime: s.openTime, closeTime: s.closeTime },
          { upsert: true, new: true }
        );
      }
    }

    if (holidays && Array.isArray(holidays)) {
      await GymSettings.findOneAndUpdate(
        { key: 'global_settings' },
        { holidays },
        { upsert: true, new: true }
      );
    }

    await AuditLog.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_UPDATE_GYM_SCHEDULE',
      resource: 'GymSchedule',
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Gym operating schedule updated.' });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await AuditLog.countDocuments({});
    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (err) {
    next(err);
  }
};
