import { FitnessProfile } from '../models/FitnessProfile.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { generateDeterministicPlan } from '../services/workoutEngine.js';
import { profileSchema } from '../validators/authValidators.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await FitnessProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(200).json({
        success: true,
        hasProfile: false,
        profile: null,
      });
    }
    res.status(200).json({
      success: true,
      hasProfile: true,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const validated = profileSchema.parse(req.body);

    let profile = await FitnessProfile.findOne({ userId: req.user.id });

    if (profile) {
      Object.assign(profile, validated);
      await profile.save();
    } else {
      profile = await FitnessProfile.create({
        userId: req.user.id,
        ...validated,
      });
    }

    // Check if user already has an active workout plan. If not or if requested, generate one!
    let plan = await WorkoutPlan.findOne({ userId: req.user.id, isActive: true });
    if (!plan || req.body.regeneratePlan) {
      const planData = await generateDeterministicPlan(req.user, profile);
      // Mark old plans inactive
      await WorkoutPlan.updateMany({ userId: req.user.id }, { isActive: false });
      plan = await WorkoutPlan.create({
        userId: req.user.id,
        ...planData,
      });
    }

    res.status(200).json({
      success: true,
      profile,
      plan,
      message: 'Fitness profile successfully updated.',
    });
  } catch (err) {
    next(err);
  }
};
