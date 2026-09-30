import { WorkoutSession } from '../models/WorkoutSession.js';

export const logSession = async (req, res, next) => {
  try {
    const { planId, dayNumber, dayName, completedExercises, durationMinutes, rpeScore, notes } =
      req.body;

    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    const d = String(now.getUTCDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const session = await WorkoutSession.create({
      userId: req.user.id,
      planId: planId || null,
      dayNumber: Number(dayNumber) || 1,
      dayName: dayName || 'Completed Workout',
      completedExercises: completedExercises || [],
      durationMinutes: Number(durationMinutes) || 45,
      rpeScore: Number(rpeScore) || 7,
      notes: notes || '',
      dateKey,
      completedAt: now,
    });

    res.status(201).json({
      success: true,
      session,
      message: 'Workout session recorded successfully!',
    });
  } catch (err) {
    next(err);
  }
};

export const getSessionHistory = async (req, res, next) => {
  try {
    const userId = req.query.memberId && ['trainer', 'admin'].includes(req.user.role)
      ? req.query.memberId
      : req.user.id;

    const { limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await WorkoutSession.countDocuments({ userId });
    const sessions = await WorkoutSession.find({ userId })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await WorkoutSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Workout session not found.' });
    }

    if (
      String(session.userId) !== String(req.user.id) &&
      !['trainer', 'admin'].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: 'Access denied to this session.' });
    }

    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};
