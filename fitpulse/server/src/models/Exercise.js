import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    targetMuscleGroup: {
      type: String,
      required: [true, 'Target muscle group is required'],
      enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'],
      index: true,
    },
    secondaryMuscles: [{ type: String, trim: true }],
    equipment: {
      type: String,
      required: [true, 'Equipment is required'],
      enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell'],
      index: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true,
    },
    instructions: [{ type: String, required: true }],
    formCues: [{ type: String }],
    precautions: {
      type: String,
      default: 'Always maintain a neutral spine. Stop immediately if you experience sharp or unusual joint pain.',
    },
    demoImageUrl: {
      type: String,
      default: '',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Exercise = mongoose.model('Exercise', exerciseSchema);
