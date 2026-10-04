import User from '../models/user.model.js';
import FitnessProfile from '../models/fitnessProfile.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import Attendance from '../models/attendance.model.js';
import { generateRuleBasedPlan } from './workoutGenerator.service.js';

/**
 * Retrieve all trainees assigned to a given trainer
 */
export const getAssignedMembers = async (trainerId) => {
  // Find profiles assigned to this trainer
  let profiles = await FitnessProfile.find({ trainerId });

  // If no profiles explicitly linked to trainer, link existing members to trainer
  if (profiles.length === 0) {
    const allMembers = await User.find({ role: 'member' });
    if (allMembers.length > 0) {
      for (const m of allMembers) {
        await FitnessProfile.findOneAndUpdate(
          { userId: m._id },
          { $set: { trainerId } },
          { upsert: true }
        );
      }
      profiles = await FitnessProfile.find({ trainerId });
    }
  }

  const memberIds = profiles.map((p) => p.userId);
  const users = await User.find({ _id: { $in: memberIds }, role: 'member' }).select('-password');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  // Compute attendance & consistency for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const attendances = await Attendance.find({
    userId: { $in: memberIds },
    checkInTime: { $gte: startOfMonth, $lte: endOfMonth },
  });

  // Group attendance by userId
  const attendanceCountMap = new Map();
  attendances.forEach((att) => {
    const uId = att.userId.toString();
    attendanceCountMap.set(uId, (attendanceCountMap.get(uId) || 0) + 1);
  });

  const daysPassed = Math.max(1, now.getDate());

  const results = [];
  for (const profile of profiles) {
    const user = userMap.get(profile.userId.toString());
    if (!user) continue;

    const attendedCount = attendanceCountMap.get(profile.userId.toString()) || 0;
    const plannedDays = profile.plannedDaysPerWeek || 5;
    const eligibleDays = Math.max(1, Math.round((daysPassed / 7) * plannedDays));
    const consistencyPercentage = Math.min(100, Math.round((attendedCount / eligibleDays) * 100));

    results.push({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '—',
      memberSince: user.createdAt,
      fitnessGoal: profile.fitnessGoal || 'general_fitness',
      experienceLevel: profile.experienceLevel || 'intermediate',
      plannedDaysPerWeek: profile.plannedDaysPerWeek || 5,
      attendanceCount: attendedCount,
      consistencyPercentage,
      membershipStatus: profile.membershipStatus || 'Active',
    });
  }

  // Sort by full name
  results.sort((a, b) => a.fullName.localeCompare(b.fullName));

  return results;
};

/**
 * Retrieve comprehensive details & workout plan of an assigned trainee
 */
export const getMemberDetailsForTrainer = async (trainerId, memberId) => {
  const user = await User.findById(memberId).select('-password');
  if (!user || user.role !== 'member') {
    const error = new Error('Member not found or not a valid gym trainee');
    error.statusCode = 404;
    throw error;
  }

  // Retrieve or create fitness profile
  let profile = await FitnessProfile.findOne({ userId: memberId });
  if (!profile) {
    profile = await FitnessProfile.create({
      userId: memberId,
      trainerId,
      fitnessGoal: 'muscle_gain',
      experienceLevel: 'intermediate',
      plannedDaysPerWeek: 5,
      preferredSchedule: 'morning',
    });
  } else if (!profile.trainerId) {
    profile.trainerId = trainerId;
    await profile.save();
  }

  // Retrieve or generate workout plan
  let plan = await WorkoutPlan.findOne({ userId: memberId, isActive: true });
  if (!plan || !plan.days || plan.days.length === 0) {
    const generated = generateRuleBasedPlan({
      fitnessGoal: profile.fitnessGoal || 'muscle_gain',
      experienceLevel: profile.experienceLevel || 'intermediate',
      plannedDaysPerWeek: profile.plannedDaysPerWeek || 5,
    });
    plan = await WorkoutPlan.create({
      userId: memberId,
      ...generated,
    });
  }

  // Attendance metrics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const attendances = await Attendance.find({
    userId: memberId,
    checkInTime: { $gte: startOfMonth, $lte: endOfMonth },
  }).sort({ checkInTime: -1 });

  const daysPassed = Math.max(1, now.getDate());
  const attendedCount = attendances.length;
  const plannedDays = profile.plannedDaysPerWeek || 5;
  const eligibleDays = Math.max(1, Math.round((daysPassed / 7) * plannedDays));
  const consistencyPercentage = Math.min(100, Math.round((attendedCount / eligibleDays) * 100));

  return {
    account: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '—',
      memberSince: user.createdAt,
    },
    fitness: {
      age: profile.age || 25,
      height: profile.height || 175,
      weight: profile.weight || 72,
      fitnessGoal: profile.fitnessGoal || 'muscle_gain',
      experienceLevel: profile.experienceLevel || 'intermediate',
      plannedDaysPerWeek: profile.plannedDaysPerWeek || 5,
      preferredSchedule: profile.preferredSchedule || 'morning',
      membershipPlan: profile.membershipPlan || 'FitPulse Annual Pro',
      membershipStatus: profile.membershipStatus || 'Active',
      membershipExpiry: profile.membershipExpiry,
    },
    attendance: {
      attendedThisMonth: attendedCount,
      consistencyPercentage,
      recentVisits: attendances.slice(0, 5).map((a) => ({
        date: a.dateKey || a.checkInTime.toISOString().slice(0, 10),
        durationMinutes: a.durationMinutes || 60,
      })),
    },
    workoutPlan: {
      id: plan._id,
      name: plan.name,
      goal: plan.goal,
      experienceLevel: plan.experienceLevel,
      daysPerWeek: plan.daysPerWeek,
      days: plan.days.map((d) => ({
        dayNumber: d.dayNumber,
        dayName: d.dayName,
        focus: d.focus,
        isCompleted: d.isCompleted,
        exercises: (d.exercises || []).map((ex) => ({
          exerciseName: ex.exerciseName,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          instructions: ex.instructions || '',
          targetMuscle: ex.targetMuscle || d.focus,
        })),
      })),
    },
  };
};
