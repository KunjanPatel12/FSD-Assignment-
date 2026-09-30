import { Attendance } from '../models/Attendance.js';
import { WorkoutSession } from '../models/WorkoutSession.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { GymSchedule, GymSettings } from '../models/GymSchedule.js';

export const calculateConsistency = async (userId, options = {}) => {
  const { startDate, endDate, month, year } = options;

  const profile = await FitnessProfile.findOne({ userId });
  const plannedDaysPerWeek = profile ? profile.plannedDaysPerWeek : 3;

  // Determine date bounds
  let start = startDate ? new Date(startDate) : new Date();
  let end = endDate ? new Date(endDate) : new Date();

  if (month !== undefined && year !== undefined) {
    start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  } else if (!startDate) {
    // Default to last 30 days
    start = new Date();
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  // Load gym weekly schedule and closures
  const schedules = await GymSchedule.find({});
  const settings = await GymSettings.findOne({ key: 'global_settings' });
  const holidays = (settings && settings.holidays) || [];

  // Map of closed weekdays (0: Sunday, 6: Saturday)
  const closedWeekdays = new Set(
    schedules.filter((s) => s.isOpen === false).map((s) => s.dayOfWeek)
  );

  const holidayDateSet = new Set(
    holidays.filter((h) => h.isClosed).map((h) => h.dateKey)
  );

  // Fetch all attendances in date range
  const attendances = await Attendance.find({
    userId,
    checkInTime: { $gte: start, $lte: end },
  }).sort({ checkInTime: 1 });

  // Fetch all completed workout sessions in date range
  const workouts = await WorkoutSession.find({
    userId,
    completedAt: { $gte: start, $lte: end },
  }).sort({ completedAt: 1 });

  // Group unique attended dates (YYYY-MM-DD)
  const attendedDateSet = new Set(attendances.map((a) => a.dateKey));
  const workedOutDateSet = new Set(workouts.map((w) => w.dateKey));

  // Iterate day by day from start to end
  const dailyHistory = [];
  let current = new Date(start);
  let totalCalendarDays = 0;
  let gymOpenDaysCount = 0;

  while (current <= end) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    const d = String(current.getUTCDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;

    const dayOfWeek = current.getUTCDay();
    const isGymOpen = !closedWeekdays.has(dayOfWeek) && !holidayDateSet.has(dateKey);
    const hasAttended = attendedDateSet.has(dateKey);
    const hasWorkedOut = workedOutDateSet.has(dateKey);

    totalCalendarDays++;
    if (isGymOpen) {
      gymOpenDaysCount++;
    }

    dailyHistory.push({
      dateKey,
      dayOfWeek,
      isGymOpen,
      attended: hasAttended,
      workedOut: hasWorkedOut,
    });

    current.setUTCDate(current.getUTCDate() + 1);
  }

  // Calculate planned attendance:
  // e.g., if user plans 4 days/week (4/7 ratio of open days, scaled to range)
  const weeksInRange = Math.max(totalCalendarDays / 7, 0.5);
  const rawPlannedDays = Math.round(plannedDaysPerWeek * weeksInRange);
  // Cannot plan more days than the gym was actually open
  const eligiblePlannedDays = Math.min(rawPlannedDays, gymOpenDaysCount);

  // Actual visits: unique dates member attended
  const actualAttendedDays = attendedDateSet.size;
  const actualWorkoutDays = workedOutDateSet.size;

  // Consistency percentage capped at 100%
  let attendanceConsistency = 0;
  let extraVisits = 0;

  if (eligiblePlannedDays > 0) {
    if (actualAttendedDays <= eligiblePlannedDays) {
      attendanceConsistency = Math.round((actualAttendedDays / eligiblePlannedDays) * 100);
      extraVisits = 0;
    } else {
      attendanceConsistency = 100;
      extraVisits = actualAttendedDays - eligiblePlannedDays;
    }
  } else if (actualAttendedDays > 0) {
    attendanceConsistency = 100;
    extraVisits = actualAttendedDays;
  }

  // Workout completion consistency
  let workoutConsistency = 0;
  if (eligiblePlannedDays > 0) {
    workoutConsistency = Math.min(Math.round((actualWorkoutDays / eligiblePlannedDays) * 100), 100);
  }

  // Rating label (Application feedback, non-clinical)
  let consistencyLabel = 'Needs Improvement';
  let badgeColor = 'red';
  if (attendanceConsistency >= 85) {
    consistencyLabel = 'Excellent';
    badgeColor = 'emerald';
  } else if (attendanceConsistency >= 70) {
    consistencyLabel = 'Good';
    badgeColor = 'teal';
  } else if (attendanceConsistency >= 50) {
    consistencyLabel = 'Moderate';
    badgeColor = 'amber';
  }

  return {
    reportingPeriod: {
      start: start.toISOString(),
      end: end.toISOString(),
      totalCalendarDays,
      gymOpenDaysCount,
    },
    memberProfile: {
      plannedDaysPerWeek,
      eligiblePlannedDays,
    },
    attendance: {
      actualAttendedDays,
      extraVisits,
      consistencyPercentage: attendanceConsistency,
      ratingLabel: consistencyLabel,
      badgeColor,
    },
    workouts: {
      actualWorkoutDays,
      consistencyPercentage: workoutConsistency,
    },
    dailyHistory,
    explanation: `Calculated from ${actualAttendedDays} attended days against ${eligiblePlannedDays} target planned training days (based on ${plannedDaysPerWeek} planned days/week across ${Math.round(weeksInRange * 10) / 10} weeks, factoring in ${gymOpenDaysCount} gym open days).`,
  };
};

export const getMotivationalMessage = (consistencyPercent) => {
  if (consistencyPercent >= 80) {
    return 'Superb dedication! You are hitting your target training days consistently.';
  }
  if (consistencyPercent >= 50) {
    return 'Solid foundation being built! Every session logged is a tangible step toward your goals.';
  }
  return 'Every fresh start begins with a single session. Step in today and make today count!';
};
