import { User } from '../models/User.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { Membership } from '../models/Membership.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { generateDeterministicPlan } from '../services/workoutEngine.js';
import { profileSchema } from '../validators/authValidators.js';

export const getProfile = async (req, res, next) => {
  try {
    const [user, profile, membership] = await Promise.all([
      User.findById(req.user.id).select('name email phone role createdAt'),
      FitnessProfile.findOne({ userId: req.user.id }),
      Membership.findOne({ userId: req.user.id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      hasProfile: !!profile,
      user,
      profile: profile || null,
      membership: membership || null,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const validated = profileSchema.parse(req.body);

    // Securely update permitted user account details (name and phone only; email & role are protected)
    if (validated.name || validated.phone !== undefined) {
      const userUpdate = {};
      if (validated.name) userUpdate.name = validated.name.trim();
      if (validated.phone !== undefined) userUpdate.phone = (validated.phone || '').trim();
      await User.findByIdAndUpdate(req.user.id, userUpdate);
    }

    // Separate fitness-specific fields for FitnessProfile model
    const { name, phone, regeneratePlan, ...fitnessData } = validated;

    let profile = await FitnessProfile.findOne({ userId: req.user.id });

    if (profile) {
      Object.assign(profile, fitnessData);
      await profile.save();
    } else {
      profile = await FitnessProfile.create({
        userId: req.user.id,
        ...fitnessData,
      });
    }

    // Check if user already has an active workout plan. If not or if requested, generate one!
    let plan = await WorkoutPlan.findOne({ userId: req.user.id, isActive: true });
    if (!plan || regeneratePlan) {
      const planData = await generateDeterministicPlan(req.user, profile);
      // Mark old plans inactive
      await WorkoutPlan.updateMany({ userId: req.user.id }, { isActive: false });
      plan = await WorkoutPlan.create({
        userId: req.user.id,
        ...planData,
      });
    }

    const [updatedUser, membership] = await Promise.all([
      User.findById(req.user.id).select('name email phone role createdAt'),
      Membership.findOne({ userId: req.user.id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      user: updatedUser,
      profile,
      membership: membership || null,
      plan,
      message: 'Profile successfully updated.',
    });
  } catch (err) {
    next(err);
  }
};
