import mongoose from 'mongoose';

const fitnessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fitnessGoal: {
      type: String,
      enum: ['muscle_gain', 'fat_loss', 'strength', 'general_fitness', 'endurance'],
      default: 'muscle_gain',
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
      required: true,
    },
    plannedDaysPerWeek: {
      type: Number,
      default: 5,
      min: 1,
      max: 7,
      required: true,
    },
    preferredSchedule: {
      type: String,
      default: 'morning',
    },
  },
  {
    timestamps: true,
  }
);

const FitnessProfile =
  mongoose.models.FitnessProfile || mongoose.model('FitnessProfile', fitnessProfileSchema);

export default FitnessProfile;
