import { calculateConsistency, getMotivationalMessage } from '../services/consistencyService.js';
import { Attendance } from '../models/Attendance.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutSession } from '../models/WorkoutSession.js';
import { FitnessProfile } from '../models/FitnessProfile.js';

export const getConsistencyReport = async (req, res, next) => {
  try {
    const userId = req.query.memberId && ['trainer', 'admin'].includes(req.user.role)
      ? req.query.memberId
      : req.user.id;

    const { startDate, endDate, month, year } = req.query;

    const report = await calculateConsistency(userId, {
      startDate,
      endDate,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });

    const motivationalQuote = getMotivationalMessage(
      report.attendance.consistencyPercentage
    );

    res.status(200).json({
      success: true,
      report,
      motivationalQuote,
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Concurrently fetch user profile, active plan, checkin status, consistency, and workouts count
    const [
      profile,
      activePlan,
      activeAttendance,
      consistency,
      totalWorkouts,
    ] = await Promise.all([
      FitnessProfile.findOne({ userId }),
      WorkoutPlan.findOne({ userId, isActive: true }).populate('days.exercises.exerciseId'),
      Attendance.findOne({ userId, status: 'active' }),
      calculateConsistency(userId),
      WorkoutSession.countDocuments({ userId }),
    ]);

    // Find today's suggested workout day based on day of week
    let todaysWorkout = null;
    if (activePlan && activePlan.days && activePlan.days.length > 0) {
      const dayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
      const planDayIndex = dayIndex % activePlan.days.length;
      todaysWorkout = activePlan.days[planDayIndex];
    }

    const motivationalQuote = getMotivationalMessage(
      consistency.attendance.consistencyPercentage
    );

    res.status(200).json({
      success: true,
      summary: {
        profile,
        activePlan,
        todaysWorkout,
        isCheckedIn: !!activeAttendance,
        activeAttendance,
        consistency: {
          percentage: consistency.attendance.consistencyPercentage,
          ratingLabel: consistency.attendance.ratingLabel,
          badgeColor: consistency.attendance.badgeColor,
          actualAttendedDays: consistency.attendance.actualAttendedDays,
          eligiblePlannedDays: consistency.memberProfile.eligiblePlannedDays,
          extraVisits: consistency.attendance.extraVisits,
        },
        totalWorkouts,
        motivationalQuote,
      },
    });
  } catch (err) {
    next(err);
  }
};

