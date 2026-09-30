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
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [14, 'Minimum age is 14'],
      max: [100, 'Maximum age is 100'],
    },
    heightCm: {
      type: Number,
      min: [80, 'Height must be at least 80 cm'],
      max: [250, 'Height must be under 250 cm'],
      default: null,
    },
    weightKg: {
      type: Number,
      min: [30, 'Weight must be at least 30 kg'],
      max: [300, 'Weight must be under 300 kg'],
      default: null,
    },
    fitnessGoal: {
      type: String,
      enum: {
        values: ['muscle_gain', 'fat_loss', 'strength', 'general_fitness', 'endurance'],
        message: '{VALUE} is not a supported fitness goal',
      },
      required: [true, 'Fitness goal is required'],
      default: 'general_fitness',
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not a valid experience level',
      },
      required: [true, 'Experience level is required'],
      default: 'beginner',
    },
    plannedDaysPerWeek: {
      type: Number,
      required: [true, 'Planned training days are required'],
      min: [1, 'Must plan at least 1 day per week'],
      max: [7, 'Cannot plan more than 7 days per week'],
      default: 3,
    },
    preferredSchedule: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'morning',
    },
    monthlySupplementBudget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: 0,
    },
    dietaryPreferences: {
      type: String,
      trim: true,
      maxlength: [200, 'Dietary preference cannot exceed 200 characters'],
      default: 'None',
    },
    healthNotes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: '',
    },
    onboardingCompleted: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FitnessProfile = mongoose.model('FitnessProfile', fitnessProfileSchema);
