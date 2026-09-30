import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      default: 'FitPulse Standard Monthly',
      trim: true,
    },
    durationDays: {
      type: Number,
      required: true,
      default: 30,
      min: [1, 'Duration must be at least 1 day'],
    },
    amountInr: {
      type: Number,
      required: true,
      default: 1499,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMode: {
      type: String,
      default: 'demo_simulated',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    benefits: {
      type: [String],
      default: [
        'Full Physical Gym Floor Access',
        'Personalized Rules-Based Workout Split',
        'Digital Attendance & Local Time Logs',
        'Mathematical Consistency Progress Analytics',
        'Evidence-Informed Nutrition & Supplement Guide',
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if membership is currently active
membershipSchema.methods.isActive = function () {
  if (this.paymentStatus !== 'successful') return false;
  if (!this.endDate) return false;
  return new Date() <= new Date(this.endDate);
};

export const Membership = mongoose.model('Membership', membershipSchema);
