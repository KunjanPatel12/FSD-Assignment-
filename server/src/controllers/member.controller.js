import {
  getMemberDashboardData,
  getMemberWorkoutPlan,
  updateMemberFitnessProfile,
  regenerateMemberWorkoutPlan,
  toggleWorkoutDayCompletion,
  getMemberAttendance,
  memberCheckIn,
  memberCheckOut,
} from '../services/member.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await getMemberDashboardData(req.user.id);
    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkoutPlan = async (req, res, next) => {
  try {
    const data = await getMemberWorkoutPlan(req.user.id);
    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFitnessProfile = async (req, res, next) => {
  try {
    const { fitnessGoal, experienceLevel, plannedDaysPerWeek, preferredSchedule } = req.body;
    const data = await updateMemberFitnessProfile(req.user.id, {
      fitnessGoal,
      experienceLevel,
      plannedDaysPerWeek,
      preferredSchedule,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Fitness profile and workout plan updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const generateWorkoutPlan = async (req, res, next) => {
  try {
    const { fitnessGoal, experienceLevel, plannedDaysPerWeek } = req.body;
    const data = await regenerateMemberWorkoutPlan(req.user.id, {
      fitnessGoal,
      experienceLevel,
      plannedDaysPerWeek,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Workout plan regenerated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleDayCompletion = async (req, res, next) => {
  try {
    const { dayNumber } = req.params;
    const data = await toggleWorkoutDayCompletion(req.user.id, dayNumber);
    return res.status(200).json({
      status: 'success',
      message: `Workout Day ${dayNumber} marked as ${data.isCompleted ? 'completed' : 'incomplete'}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const data = await getMemberAttendance(req.user.id);
    return res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const record = await memberCheckIn(req.user.id);
    return res.status(201).json({
      status: 'success',
      message: 'Checked in successfully',
      data: record,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const record = await memberCheckOut(req.user.id);
    return res.status(200).json({
      status: 'success',
      message: 'Checked out successfully',
      data: record,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

