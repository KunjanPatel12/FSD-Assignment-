import { User } from '../models/User.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutSession } from '../models/WorkoutSession.js';
import { calculateConsistency } from '../services/consistencyService.js';

export const getAssignedMembers = async (req, res, next) => {
  try {
    // Return members assigned to trainer, or all members if trainer has no specific assignment
    let members = await User.find({
      role: 'member',
      assignedTrainerId: req.user.id,
    }).select('-password');

    if (members.length === 0) {
      // Allow trainer to view all members in gym
      members = await User.find({ role: 'member' }).select('-password').limit(25);
    }

    // Attach basic profile summary to each
    const memberCards = await Promise.all(
      members.map(async (m) => {
        const [profile, sessionsCount] = await Promise.all([
          FitnessProfile.findOne({ userId: m._id }),
          WorkoutSession.countDocuments({ userId: m._id }),
        ]);
        return {
          user: m,
          profile,
          totalWorkouts: sessionsCount,
        };
      })
    );

    res.status(200).json({ success: true, count: memberCards.length, members: memberCards });
  } catch (err) {
    next(err);
  }
};

export const getMemberDetails = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;
    const member = await User.findById(memberId).select('-password');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const [profile, activePlan, consistency, recentSessions] = await Promise.all([
      FitnessProfile.findOne({ userId: memberId }),
      WorkoutPlan.findOne({ userId: memberId, isActive: true }).populate('days.exercises.exerciseId'),
      calculateConsistency(memberId),
      WorkoutSession.find({ userId: memberId }).sort({ completedAt: -1 }).limit(10),
    ]);

    res.status(200).json({
      success: true,
      member,
      profile,
      activePlan,
      consistency,
      recentSessions,
    });
  } catch (err) {
    next(err);
  }
};
