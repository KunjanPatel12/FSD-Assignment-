import mongoose from 'mongoose';

const fitnessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      default: 25,
      min: 14,
      max: 100,
    },
    height: {
      type: Number, // in cm
      default: 175,
      min: 50,
      max: 260,
    },
    weight: {
      type: Number, // in kg
      default: 72,
      min: 30,
      max: 300,
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
    membershipPlan: {
      type: String,
      default: 'FitPulse Annual Pro',
    },
    membershipStatus: {
      type: String,
      enum: ['Active', 'Pending', 'Expired', 'Frozen'],
      default: 'Active',
    },
    membershipExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

const FitnessProfile =
  mongoose.models.FitnessProfile || mongoose.model('FitnessProfile', fitnessProfileSchema);

export default FitnessProfile;
