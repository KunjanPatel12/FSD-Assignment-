import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { Exercise } from '../models/Exercise.js';
import { generateDeterministicPlan } from '../services/workoutEngine.js';

export const getCurrentPlan = async (req, res, next) => {
  try {
    const userId = req.query.memberId && ['trainer', 'admin'].includes(req.user.role)
      ? req.query.memberId
      : req.user.id;

    let plan = await WorkoutPlan.findOne({ userId, isActive: true }).populate(
      'days.exercises.exerciseId'
    );

    if (!plan && userId === req.user.id) {
      const profile = await FitnessProfile.findOne({ userId });
      if (profile) {
        const planData = await generateDeterministicPlan(req.user, profile);
        plan = await WorkoutPlan.create({
          userId,
          ...planData,
        });
        plan = await WorkoutPlan.findById(plan._id).populate('days.exercises.exerciseId');
      }
    }

    res.status(200).json({
      success: true,
      hasPlan: !!plan,
      plan,
    });
  } catch (err) {
    next(err);
  }
};

export const generatePlan = async (req, res, next) => {
  try {
    const profile = await FitnessProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your fitness onboarding profile before generating a plan.',
      });
    }

    const planData = await generateDeterministicPlan(req.user, profile);

    // Deactivate previous plans
    await WorkoutPlan.updateMany({ userId: req.user.id }, { isActive: false });

    const newPlan = await WorkoutPlan.create({
      userId: req.user.id,
      ...planData,
    });

    res.status(201).json({
      success: true,
      plan: newPlan,
      message: 'Personalized workout plan generated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const assignPlanByTrainer = async (req, res, next) => {
  try {
    const { memberId, title, goal, level, daysPerWeek, days } = req.body;

    await WorkoutPlan.updateMany({ userId: memberId }, { isActive: false });

    const plan = await WorkoutPlan.create({
      userId: memberId,
      assignedBy: req.user.id,
      title,
      goal,
      level,
      daysPerWeek,
      days,
      generationType: 'trainer_assigned',
    });

    res.status(201).json({
      success: true,
      plan,
      message: 'Plan assigned to member successfully.',
    });
  } catch (err) {
    next(err);
  }
};
