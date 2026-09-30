import mongoose from 'mongoose';

const workoutPlanExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  exerciseName: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 3,
  },
  reps: {
    type: String,
    required: true,
    default: '10-12',
  },
  restSeconds: {
    type: Number,
    default: 60,
  },
  order: {
    type: Number,
    default: 1,
  },
  notes: {
    type: String,
    default: '',
  },
});

const workoutDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  dayName: {
    type: String,
    required: true,
  },
  focus: {
    type: String,
    required: true,
  },
  exercises: [workoutPlanExerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    daysPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    days: [workoutDaySchema],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    generationType: {
      type: String,
      enum: ['rules_engine', 'trainer_assigned', 'custom'],
      default: 'rules_engine',
    },
    medicalDisclaimer: {
      type: String,
      default:
        'This workout program is algorithmically generated based on user input and is for educational/fitness tracking purposes. It does not constitute medical advice.',
    },
  },
  {
    timestamps: true,
  }
);

export const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
