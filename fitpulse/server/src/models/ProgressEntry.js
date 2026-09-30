import mongoose from 'mongoose';

const progressEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: [30, 'Weight must be at least 30kg'],
      max: [350, 'Weight must be less than 350kg'],
    },
    bodyFatPercent: {
      type: Number,
      min: 3,
      max: 60,
      default: null,
    },
    chestCm: {
      type: Number,
      default: null,
    },
    waistCm: {
      type: Number,
      default: null,
    },
    hipsCm: {
      type: Number,
      default: null,
    },
    armsCm: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

progressEntrySchema.index({ userId: 1, date: -1 });

export const ProgressEntry = mongoose.model('ProgressEntry', progressEntrySchema);
