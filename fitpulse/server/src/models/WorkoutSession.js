import mongoose from 'mongoose';

const completedSetSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number, default: 0 },
  weightKg: { type: Number, default: 0 },
  completed: { type: Boolean, default: true },
});

const completedExerciseSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  exerciseName: { type: String, required: true },
  setsCompleted: [completedSetSchema],
  isFullyCompleted: { type: Boolean, default: true },
});

const workoutSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      default: null,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    dayName: {
      type: String,
      required: true,
    },
    completedExercises: [completedExerciseSchema],
    durationMinutes: {
      type: Number,
      min: 1,
      max: 360,
      default: 45,
    },
    rpeScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 7,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);
