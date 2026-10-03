import mongoose from 'mongoose';

const exerciseItemSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
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
  exercises: [exerciseItemSchema],
});

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Personalized Workout Plan',
    },
    goal: {
      type: String,
      default: 'muscle_gain',
    },
    daysPerWeek: {
      type: Number,
      default: 5,
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
