import mongoose from 'mongoose';

const exerciseItemSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
  },
  muscleGroup: {
    type: String,
    default: 'Full Body',
  },
  sets: {
    type: Number,
    required: true,
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
  rest: {
    type: String,
    default: '60s',
  },
  instructions: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  isCompleted: {
    type: Boolean,
    default: false,
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
    default: 'Workout',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  exercises: [exerciseItemSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedByName: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
      default: 'Personalized Workout Plan',
    },
    goal: {
      type: String,
      default: 'general_fitness',
    },
    experienceLevel: {
      type: String,
      default: 'intermediate',
    },
    daysPerWeek: {
      type: Number,
      default: 5,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    days: [workoutDaySchema],
  },
  {
    timestamps: true,
  }
);

const WorkoutPlan =
  mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;
