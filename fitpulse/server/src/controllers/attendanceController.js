import { Attendance } from '../models/Attendance.js';
import { GymSchedule, GymSettings } from '../models/GymSchedule.js';
import { AuditLog } from '../models/AuditLog.js';

export const checkIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { method = 'manual' } = req.body;

    // Check if user already has an active check-in
    const existingActive = await Attendance.findOne({ userId, status: 'active' });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active gym check-in session. Please check out first.',
        activeSession: existingActive,
      });
    }

    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const attendance = await Attendance.create({
      userId,
      checkInTime: now,
      status: 'active',
      method,
      dateKey,
    });

    res.status(201).json({
      success: true,
      attendance,
      message: 'Successfully checked in to FitPulse gym!',
    });
  } catch (err) {
    next(err);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const activeSession = await Attendance.findOne({ userId, status: 'active' });
    if (!activeSession) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in found to check out from.',
      });
    }

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - new Date(activeSession.checkInTime).getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

    activeSession.checkOutTime = checkOutTime;
    activeSession.durationMinutes = durationMinutes;
    activeSession.status = 'completed';
    await activeSession.save();

    res.status(200).json({
      success: true,
      attendance: activeSession,
      durationMinutes,
      message: `Checked out successfully! Total session duration: ${durationMinutes} minutes.`,
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activeSession = await Attendance.findOne({ userId, status: 'active' });

    res.status(200).json({
      success: true,
      isCheckedIn: !!activeSession,
      activeSession,
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const userId = req.query.memberId && ['trainer', 'admin'].includes(req.user.role)
      ? req.query.memberId
      : req.user.id;

    const { limit = 30, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Attendance.countDocuments({ userId });
    const records = await Attendance.find({ userId })
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      records,
    });
  } catch (err) {
    next(err);
  }
};

export const staffManualEntry = async (req, res, next) => {
  try {
    const { memberId, dateKey, checkInTime, checkOutTime, notes } = req.body;

    const inTime = new Date(checkInTime || `${dateKey}T09:00:00Z`);
    const outTime = checkOutTime ? new Date(checkOutTime) : new Date(inTime.getTime() + 60 * 60 * 1000);
    const durationMinutes = Math.max(1, Math.round((outTime.getTime() - inTime.getTime()) / (1000 * 60)));

    const record = await Attendance.create({
      userId: memberId,
      checkInTime: inTime,
      checkOutTime: outTime,
      durationMinutes,
      status: 'completed',
      method: 'staff_override',
      dateKey,
      loggedByStaffId: req.user.id,
      notes: notes || 'Manual entry by staff',
    });

    await AuditLog.create({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'STAFF_MANUAL_ATTENDANCE',
      resource: 'Attendance',
      details: { memberId, dateKey, durationMinutes },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      record,
      message: 'Attendance record created manually with audit trail.',
    });
  } catch (err) {
    next(err);
  }
};
